// "use client"; // Indicates that this component uses client-side rendering

// import { pusherClient } from "@/lib/pusher"; // Importing the Pusher client
// import { toPusherKey } from "@/lib/utils"; // Utility to create Pusher keys
// import { User } from "lucide-react"; // Importing User icon from lucide-react
// import Link from "next/link"; // Next.js Link component for navigation
// import { FC, useEffect, useState } from "react"; // React hooks and types

// interface DecryptionRequestSidebarOptionsProps {
//   sessionId: string; // Session ID for the user
//   initialUnseenRequestCount: number; // Initial count of unseen Decryption requests
// }

// // Decrypt function (dummy implementation for example)
// const decrypt = (data: string) => {
//   // In a real scenario, implement your decryption logic here
//   return data; // Simulating the decryption by returning the input data
// };

// const DecryptionRequestSidebarOptions: FC<
//   DecryptionRequestSidebarOptionsProps
// > = ({ sessionId, initialUnseenRequestCount }) => {
//   const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
//     initialUnseenRequestCount
//   );

//   useEffect(() => {
//     pusherClient.subscribe(
//       toPusherKey(`user:${sessionId}:incoming_Decryption_requests`) // Subscribe to Decryption requests
//     );
//     pusherClient.subscribe(toPusherKey(`user:${sessionId}:Decryptions`)); // Subscribe to Decryptions

//     // Handler for incoming Decryption requests
//     const DecryptionRequestHandler = (data: string) => {
//       const decryptedData = decrypt(data); // Decrypt the incoming data
//       console.log("Decrypted Decryption request:", decryptedData); // Log the decrypted data
//       setUnseenRequestCount((prev) => prev + 1); // Increment unseen request count
//     };

//     // Handler for added Decryptions
//     const addedDecryptionHandler = () => {
//       setUnseenRequestCount((prev) => prev - 1); // Decrement unseen request count
//     };

//     pusherClient.bind("incoming_Decryption_requests", DecryptionRequestHandler); // Bind the Decryption request handler
//     pusherClient.bind("new_Decryption", addedDecryptionHandler); // Bind the added Decryption handler

//     return () => {
//       pusherClient.unsubscribe(
//         toPusherKey(`user:${sessionId}:incoming_Decryption_requests`) // Unsubscribe on cleanup
//       );
//       pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:Decryptions`)); // Unsubscribe on cleanup

//       pusherClient.unbind("new_Decryption", addedDecryptionHandler); // Unbind the added Decryption handler
//       pusherClient.unbind(
//         "incoming_Decryption_requests",
//         DecryptionRequestHandler
//       ); // Unbind the Decryption request handler
//     };
//   }, [sessionId]);

//   return (
//     <Link
//       href="/dashboard/decryption" // Link to Decryption requests page
//       className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
//     >
//       <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
//         <User className="h-4 w-4" /> {/* User icon */}
//       </div>
//       <p className="truncate">Decryption requests</p>
//     </Link>
//   );
// };

// export default DecryptionRequestSidebarOptions; // Exporting the component
