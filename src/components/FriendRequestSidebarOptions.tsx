"use client"; // Indicates that this component uses client-side rendering

import { pusherClient } from "@/lib/pusher"; // Importing the Pusher client
import { toPusherKey } from "@/lib/utils"; // Utility to create Pusher keys
import { User } from "lucide-react"; // Importing User icon from lucide-react
import Link from "next/link"; // Next.js Link component for navigation
import { FC, useEffect, useState } from "react"; // React hooks and types

interface FriendRequestSidebarOptionsProps {
  sessionId: string; // Session ID for the user
  initialUnseenRequestCount: number; // Initial count of unseen friend requests
}

// Decrypt function (dummy implementation for example)
const decrypt = (data: string) => {
  // In a real scenario, implement your decryption logic here
  return data; // Simulating the decryption by returning the input data
};

const FriendRequestSidebarOptions: FC<FriendRequestSidebarOptionsProps> = ({
  sessionId,
  initialUnseenRequestCount,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  );

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`) // Subscribe to friend requests
    );
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`)); // Subscribe to friends

    // Handler for incoming friend requests
    const friendRequestHandler = (data: string) => {
      const decryptedData = decrypt(data); // Decrypt the incoming data
      console.log("Decrypted friend request:", decryptedData); // Log the decrypted data
      setUnseenRequestCount((prev) => prev + 1); // Increment unseen request count
    };

    // Handler for added friends
    const addedFriendHandler = () => {
      setUnseenRequestCount((prev) => prev - 1); // Decrement unseen request count
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler); // Bind the friend request handler
    pusherClient.bind("new_friend", addedFriendHandler); // Bind the added friend handler

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`) // Unsubscribe on cleanup
      );
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`)); // Unsubscribe on cleanup

      pusherClient.unbind("new_friend", addedFriendHandler); // Unbind the added friend handler
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler); // Unbind the friend request handler
    };
  }, [sessionId]);

  return (
    <Link
      href="/dashboard/requests" // Link to friend requests page
      className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" /> {/* User icon */}
      </div>
      <p className="truncate">Friend requests</p>

      {unseenRequestCount > 0 ? (
        <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
          {unseenRequestCount} {/* Count of unseen friend requests */}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendRequestSidebarOptions; // Exporting the component
