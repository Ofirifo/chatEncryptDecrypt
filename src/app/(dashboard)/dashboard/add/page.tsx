import AddFriendButton from "@/components/AddFriendButton";
import { FC } from "react";

const page: FC = () => {
  return (
    <main className="pt-8">
      <h1 className="font-bold text-6xl mb-6">Friend Requests</h1>
      <h1 className="font-bold text-4xl mb-6">Send for a Friend</h1>
      <AddFriendButton />
    </main>
  );
};

export default page;
