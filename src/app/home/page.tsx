"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import type { IMessage, IConversation } from "~/models/model"
import { Leaf, Send, Plus, MessageSquare, Sparkles, Clock, Search } from "lucide-react"
import { send } from "process"
import { Trash } from "lucide-react"


export default function HomePage() {
  const { user, isLoaded } = useUser()
  const [message, setMessage] = useState<string>("")
  const [conversations, setConversations] = useState<IConversation[]>([])
  const [activeConversation, setActiveConversation] = useState<IConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sending, setSending] = useState(false)

  const fetchConversations = async () => {
  try {
    const username = user?.username
    if (!username) {
      console.error("Username is missing.")
      return
    }

    const response = await fetch(`/api/conversations?username=${encodeURIComponent(username)}`)
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

    const data = (await response.json()) as IConversation[]
    setConversations(data)

    const urlParams = new URLSearchParams(window.location.search)
    const conversationId = urlParams.get("id")
    const initialConversation = data.find((c) => c._id.toString() === conversationId) ?? data[0] ?? null
    setActiveConversation(initialConversation)
  } catch (error) {
    console.error("Error fetching conversations:", error)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    if (!isLoaded) return
    fetchConversations().catch((error) => {
      console.error("Unhandled error in fetchConversations:", error)
    })
  }, [isLoaded, user])

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#023535]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C7FFED] border-t-transparent"></div>
          <p className="text-[#D8FFDB]">Loading conversations...</p>
        </div>
      </div>
    )
  }

const handleSelectConversation = async (conv: IConversation) => {
  if (!user?.username) {
    console.error("Username is missing.")
    return
  }

  try {
    const response = await fetch(
      `/api/conversations?conversationId=${conv._id}&username=${user.username}`
    )

    if (!response.ok) {
      throw new Error("Failed to fetch full conversation")
    }

    const data = await response.json()
    const fullConversation: IConversation = data.conversation
    
    setActiveConversation({ ...fullConversation })
  } catch (error) {
    console.error("Error loading full conversation:", error)
  }
}

const handleSendMessage = async () => {
  if (!message.trim() || !activeConversation || !user?.username) return

  const toSend = message.trim()
  const newUserMessage: IMessage = { role: "user", text: toSend }
  const conversationId = activeConversation._id

  // Optimistically update the UI with a new object reference
  setActiveConversation(prev => {
    if (!prev) return prev
    return {
      ...prev,
      messages: [...prev.messages, newUserMessage],
    }
  })

  setMessage("")

  try {
     setSending(true)
    const response = await fetch("/api/conversations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        username: user.username,
        message: newUserMessage,
      }),
    })

    if (!response.ok) throw new Error("Failed to send message")

    const r = await response.json()
    if (r.status != 200){
      throw new Error("Problem to process response")
    }
    console.log("On While")
    while(true) {
      console.log("Requesting")
      const response = await fetch(
      `/api/conversations?conversationId=${conversationId}&username=${user.username}`
    )
    console.log("got Request")
    if (!response.ok) {
      continue;
    }
    console.log("checking data")
    const data = await response.json()
    const fullConversation: IConversation = data.conversation
    if (fullConversation && fullConversation._id === conversationId && fullConversation.messages.length > activeConversation?.messages.length + 1) {
      setActiveConversation({ ...fullConversation })
      console.log("checked out!")
      break;    
    }else{
      console.log("Going to sleep ...")
      await new Promise(r => setTimeout(r, 2000));
    }
    }
  } catch (error) {
    console.log("Error sending message:", error)
    console.error("Error sending message:", error)
  } finally{
    setSending(false)
  }
}

const handleNewConversation = async () => {
  try {
    const username = user?.username
    if (!username) {
      console.error("Username is missing.")
      return
    }
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user?.username }),
    })

    const data = await response.json()
    const newConversation: IConversation = data.conversation

    // Add to the list
    setConversations((prev) => [newConversation, ...prev])
    // setActiveConversation(newConversation)
    fetchConversations()
  } catch (error) {
    console.error("Error creating new conversation:", error)
  }
}

const handleDeleteConversation = async (conv: IConversation) => {
  if (!user?.username) {
    console.error("Username is missing.")
    return
  }
  try {
  const response = await fetch(
    `/api/conversations?conversationId=${conv._id}&username=${user.username}`,
    {
      method: "DELETE",
    }
  )


    if (!response.ok) {
      throw new Error("Failed to delete conversation")
    }

    // pop the conversation from the list
    setConversations((prev) => prev.filter((c) => c._id !== conv._id))
    if (activeConversation?._id === conv._id) {
      setActiveConversation(null)
    }
    await fetchConversations() // Refresh conversations list
  } catch (error) {
    console.error("Error deleting  conversation:", error)
  }
}

const filteredConversations = (conversations || []).filter((conv) =>
  conv && (conv.thumbnail || "Conversation").toLowerCase().includes(searchTerm.toLowerCase())
);
  return (
    <div className="flex h-screen bg-[#023535] text-[#D8FFDB]">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-[#015958]/30 bg-[#015958]">
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-[#015958]/30 p-4">
            <h2 className="text-xl font-semibold text-[#C7FFED]">Conversations</h2>
            <button
              onClick={handleNewConversation}
              className="rounded-full bg-[#008F8C] p-2 text-white transition-colors hover:bg-[#008F8C]/80"
              aria-label="New conversation"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-[#015958]/30 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C7FFED]/50" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#008F8C]/30 bg-[#023535]/50 py-2 pl-10 pr-4 text-[#D8FFDB] placeholder-[#D8FFDB]/50 focus:border-[#008F8C] focus:outline-none focus:ring-1 focus:ring-[#008F8C]"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredConversations.length > 0 ? (
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv._id.toString()}
                    onClick={() => handleSelectConversation(conv)}
                    className={`group flex w-full items-center rounded-lg p-3 text-left transition cursor-pointer ${
                      activeConversation?._id === conv._id
                        ? "bg-[#008F8C] text-white"
                        : "text-[#D8FFDB] hover:bg-[#015958]/70"
                    }`}
                  >
                    <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 truncate">
                      <p className="font-medium">{conv.thumbnail ?? "New Conversation"}</p>
                      <p className="truncate text-xs opacity-70">
                        {conv.messages.length > 0
                          ? (conv.messages[conv.messages.length - 1]?.text?.substring(0, 30) || "") +
                            ((conv.messages[conv.messages.length - 1]?.text?.length || 0) > 30 ? "..." : "")
                          : "No messages yet"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv)}
                      className="ml-2 rounded p-1 text-[#D8FFDB]/50 hover:text-red-500 hover:bg-[#008F8C]/10"
                      aria-label="Delete conversation"
                    >
                        <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <MessageSquare className="mb-2 h-12 w-12 text-[#C7FFED]/30" />
                <p className="text-[#D8FFDB]/70">No conversations yet</p>
                <p className="mt-1 text-sm text-[#D8FFDB]/50">Start a new conversation to get nutrition advice</p>
                <button
                  onClick={handleNewConversation}
                  className="mt-4 rounded-lg bg-[#008F8C] px-4 py-2 text-white transition-colors hover:bg-[#008F8C]/80"
                >
                  New Conversation
                </button>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="border-t border-[#015958]/30 p-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008F8C] text-white">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </div>
              <div className="ml-3">
                <p className="font-medium">{user?.fullName || user?.username}</p>
                <p className="text-xs text-[#D8FFDB]/70">Nutrition Plan: Basic</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-[#015958]/30 bg-[#015958]/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Leaf className="mr-2 h-5 w-5 text-[#C7FFED]" />
                  <h2 className="text-lg font-medium text-[#C7FFED]">
                    {activeConversation.thumbnail || "New Conversation"}
                  </h2>
                </div>
                <div className="flex items-center space-x-2 text-xs text-[#D8FFDB]/70">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(activeConversation.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {activeConversation.messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="mb-4 h-12 w-12 text-[#C7FFED]/30" />
                    <h3 className="text-xl font-medium text-[#C7FFED]">Start a new conversation</h3>
                    <p className="mt-2 max-w-md text-[#D8FFDB]/70">
                      Ask NutriBot about nutrition advice, meal plans, or health insights based on your profile
                    </p>
                  </div>
                ) : (
                  activeConversation.messages.map((msg, index) => (
                    <div key={`${activeConversation._id}-${index}-${msg.text.substring(0, 10)}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === "user" ? "bg-[#008F8C] text-white" : "bg-[#015958] text-[#D8FFDB]"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {sending && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl bg-[#015958] px-4 py-3 text-[#D8FFDB]">
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-[#C7FFED] [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-[#C7FFED] [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-[#C7FFED]"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-[#015958]/30 bg-[#015958]/30 p-4">
              <div className="flex items-center rounded-lg border border-[#008F8C]/30 bg-[#023535]/50 focus-within:border-[#008F8C] focus-within:ring-1 focus-within:ring-[#008F8C]">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 bg-transparent px-4 py-3 text-[#D8FFDB] placeholder-[#D8FFDB]/50 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sending}
                  className={`mr-2 rounded-lg p-2 ${
                    message.trim() && !sending
                      ? "bg-[#008F8C] text-white hover:bg-[#008F8C]/80"
                      : "cursor-not-allowed bg-[#015958]/50 text-[#D8FFDB]/30"
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-[#D8FFDB]/50">
                NutriBot provides general nutrition advice. Always consult with healthcare professionals.
              </p>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <Leaf className="mb-4 h-16 w-16 text-[#C7FFED]/30" />
            <h2 className="text-2xl font-medium text-[#C7FFED]">Welcome to NutriBot</h2>
            <p className="mt-2 max-w-md text-[#D8FFDB]/70">
              Your personal nutrition assistant. Start a new conversation or select an existing one.
            </p>
            <button
              onClick={handleNewConversation}
              className="mt-6 flex items-center rounded-lg bg-[#008F8C] px-6 py-3 text-white transition-colors hover:bg-[#008F8C]/80"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}