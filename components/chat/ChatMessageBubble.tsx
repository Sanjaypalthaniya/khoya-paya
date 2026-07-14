import { formatDateTime } from "@/lib/date-time";

type ChatMessage = { id: string; senderType: "OWNER" | "FINDER" | "SYSTEM" | "ADMIN"; message: string; createdAt: string };

export default function ChatMessageBubble({ message, viewer }: { message: ChatMessage; viewer: "OWNER" | "FINDER" }) {
  if (message.senderType === "SYSTEM" || message.senderType === "ADMIN") return <div className="chat-system-message">{message.message}</div>;
  const isMine = message.senderType === viewer;
  return (
    <div className={`chat-message-row ${isMine ? "mine" : "theirs"}`}>
      <div className="chat-bubble">
        <p>{message.message}</p>
        <small>{formatDateTime(message.createdAt)}</small>
      </div>
    </div>
  );
}
