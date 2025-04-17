"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { IMessage, IConversation} from "~/models/model";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const [message, setMessage] = useState<string>("");
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<IConversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchConversations = async () => {
      try {
        const username = user?.username
        if (!username) {
          console.error("Username is missing.");
          return;
        }

        const response = await fetch(`/api/conversations?username=${encodeURIComponent(username)}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = (await response.json()) as IConversation[];
        setConversations(data);

        const urlParams = new URLSearchParams(window.location.search);
        const conversationId = urlParams.get("id");
        const initialConversation =  data.find((c) => c._id.toString() === conversationId) ?? data[0] ??  null;
        setActiveConversation(initialConversation);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations().catch((error) => {
      console.error("Unhandled error in fetchConversations:", error);
    });
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return <p>Loading conversations...</p>;
  }

  const handleSelectConversation = (conv: IConversation) => {
    setActiveConversation(conv);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;

    const newMessage: IMessage = { role: "user", text: message };
    setActiveConversation({
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage],
    });
    setMessage("");

    try {
      setTimeout(() => {
        const botResponse: IMessage = { role: "bot", text: "This is a mock response." };
        setActiveConversation((prev) =>
          prev ? { ...prev, messages: [...prev.messages, botResponse] } : prev
        );
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const username = user?.username
      if (!username) {
        console.error("Username is missing.");
        return;
      }
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user?.username}),
      });
      
      const data = await response.json();
      const newConversation: IConversation = data.conversation;
  
      // Add to the list
      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversation(newConversation);
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  return (
    <div className="flex h-screen bg-white w-full">
      {/* Sidebar */}
      <div className="w-72 shadow-lg p-4 flex flex-col bg-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-center">Conversations</h2>
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv._id.toString()}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full mb-2 p-3 text-left rounded-lg transition ${
                  activeConversation?._id === conv._id
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {conv.thumbnail ?? "Conversation"}
              </button>
            ))
          ) : (
            <p className="text-gray-500">No conversations yet.</p>
          )}
        </div>
        <button
          onClick={handleNewConversation}
          className="mb-4 p-2 bg-green-500 text-white rounded-lg"
        >
          New Conversation
        </button>
      </div>

      {/* Main Content */}
      {activeConversation && (
        <div className="flex flex-col w-full max-w-full p-4 border rounded-lg shadow-md bg-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-center">Active Conversation</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {activeConversation.messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-m ${
                  msg.role === "user"
                    ? "bg-gray-200 text-gray-900 self-end"
                    : "bg-green-500 text-white self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center border-t pt-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
