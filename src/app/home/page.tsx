"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function HomePage() {
  const { user } = useUser();
  const [message, setMessage] = useState("");

  const sendUsername = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user.username || user.firstName }),
      });

      const data = await response.json();
      setMessage(data.message);
      console.log("Response from server:", data);
    } catch (error) {
      console.error("Error sending username:", error);
      setMessage("Error sending username.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900">
      <h1 className="text-4xl font-bold">
        Welcome, <span className="text-green-500">{user?.firstName}</span>!
      </h1>
      <p className="mt-4 text-lg">Let's plan your nutrition journey.</p>

      <button
        onClick={sendUsername}
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition"
      >
        Send Username
      </button>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
