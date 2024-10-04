import { LucideProps, UserPlus } from "lucide-react";

export const Logos = {
  Logo: (props: LucideProps) => (
    <div className="chat-image-container">
      <img
        src="https://engineering.fb.com/wp-content/uploads/2009/02/chat.jpg"
        alt="Chat Image"
        className="chat-image"
        style={{ width: "80px", height: "50px" }} // You can adjust these styles as needed
      />
    </div>
  ),
  UserPlus,
};

export type Logo = keyof typeof Logos;
