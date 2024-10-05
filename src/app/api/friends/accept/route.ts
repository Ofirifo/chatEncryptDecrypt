import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";
import crypto from "crypto";

// Encryption key (use a secure key)
const ENCRYPTION_KEY = process.env.SECRET_KEY;
const IV_LENGTH = 16; // For AES, this is always 16

// Encrypt function
export function encrypt(text: string) {
  // Ensures unique encryption even if the same input is encrypted multiple times.
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Decrypt function
export function decrypt(text: string) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift() as string, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Encrypt user ID and idToAdd before further processing
    const encryptedSessionUserId = encrypt(session.user.id);
    const encryptedIdToAdd = encrypt(idToAdd);
    // verify both users are not already friends
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${decrypt(encryptedSessionUserId)}:friends`,
      decrypt(encryptedIdToAdd)
    );

    if (isAlreadyFriends) {
      return new Response("Already friends", { status: 400 });
    }

    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${decrypt(encryptedSessionUserId)}:incoming_friend_requests`,
      decrypt(encryptedIdToAdd)
    );

    if (!hasFriendRequest) {
      return new Response("No friend request", { status: 400 });
    }

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis("get", `user:${decrypt(encryptedSessionUserId)}`),
      fetchRedis("get", `user:${decrypt(encryptedIdToAdd)}`),
    ])) as [string, string];

    // Decrypt fetched user data
    const user = JSON.parse(userRaw) as User;
    const friend = JSON.parse(friendRaw) as User;

    // notify added user
    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${decrypt(encryptedIdToAdd)}:friends`),
        "new_friend",
        user
      ),
      pusherServer.trigger(
        toPusherKey(`user:${decrypt(encryptedSessionUserId)}:friends`),
        "new_friend",
        friend
      ),
      db.sadd(
        `user:${decrypt(encryptedSessionUserId)}:friends`,
        decrypt(encryptedIdToAdd)
      ),
      db.sadd(
        `user:${decrypt(encryptedIdToAdd)}:friends`,
        decrypt(encryptedSessionUserId)
      ),
      db.srem(
        `user:${decrypt(encryptedSessionUserId)}:incoming_friend_requests`,
        decrypt(encryptedIdToAdd)
      ),
    ]);

    return new Response("OK");
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
