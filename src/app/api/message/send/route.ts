import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { Message, messageValidator } from "@/lib/validations/message";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
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
    const { text, chatId }: { text: string; chatId: string } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) return new Response("Unauthorized", { status: 401 });

    console.log("0:", session.user.id);
    const encryptedSessionUserId = encrypt(session.user.id);
    const encryptedIdToAdd = encrypt(chatId);
    console.log("1:", encryptedSessionUserId);
    console.log("2:", encryptedIdToAdd);
    const [userRaw1, friendRaw1] = (await Promise.all([
      fetchRedis("get", `user:${session.user.id}`),
      fetchRedis("get", `user:${chatId}`),
    ])) as [string, string];

    console.log("2a:", userRaw1);
    const encryptTry1 = encrypt(userRaw1);
    console.log("2a1:", encryptTry1);
    const decryptTry1 = decrypt(encryptTry1);
    console.log("2a2:", decryptTry1);
    console.log("2b:", friendRaw1);
    // // Decrypt fetched user data
    // const decryptUser = decrypt(encryptedSessionUserId);
    // // const decryptFriend = JSON.parse(decrypt(friendRaw1)) as User;
    // console.log("3:", decryptUser);
    // // console.log("4:", decryptFriend);

    const [userId1, userId2] = chatId.split("--");

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response("Unauthorized", { status: 401 });
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`
    )) as string[];
    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rawSender = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;
    const sender = JSON.parse(rawSender) as User;

    const timestamp = Date.now();

    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    };

    const message = messageValidator.parse(messageData);
    const encryptMessage: Message = {
      id: encrypt(messageData.id),
      senderId: encrypt(session.user.id),
      text: encrypt(text),
      timestamp,
    };

    // notify all connected chat room clients (in the room you will see the message as you expected)
    await pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      "incoming-message",
      encryptMessage
    );

    // This is when we are in a different room and we suddendly get a message, then it is encrypted (You can see the message as usual when you enter the room)
    await pusherServer.trigger(
      toPusherKey(`user:${friendId}:chats`),
      "new_message",
      {
        ...encryptMessage,
        senderImg: sender.image,
        senderName: sender.name,
      }
    );

    // all valid, send the message
    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(encryptMessage),
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
