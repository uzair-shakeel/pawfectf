// frontend/app/messages/page.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FaSearch, FaPaperPlane, FaBars, FaEnvelope, FaPaperclip, FaTimes, FaFileAlt, FaFileImage } from "react-icons/fa";
import { useAuth } from "../../../lib/auth/AuthContext";
import io from "socket.io-client";
import Avatar from "../../../components/both/Avatar";
import { uploadImageBatch } from "../../../services/petService";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const isProd = typeof window !== "undefined" ? window.location.hostname !== "localhost" : process.env.NODE_ENV === "production";
const SOCKET_BASE = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL || (isProd ? "https://ojest.pl" : "http://localhost:5000");
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io/";
const SOCKET_TRANSPORT = (process.env.NEXT_PUBLIC_SOCKET_TRANSPORT || "websocket,polling")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const socket = io(SOCKET_BASE, {
  path: SOCKET_PATH,
  autoConnect: false,
  withCredentials: true,
  transports: SOCKET_TRANSPORT,
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

const MessagesPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const { user, token, userId: authUserId } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (authUserId) {
      socket.emit("join", authUserId);
    }

    // return () => {
    //   socket.disconnect();
    // };
  }, [authUserId]);

  // Helper: current user ID across backends (_id or id)
  // Try multiple sources to get the user ID
  const myUserId = user?.id || user?._id || authUserId;

  // Date/Time formatters: DD/MM/YY and 24-hour HH:mm
  const fmtDateTime = (d) => {
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${mi}`;
  };
  const fmtTime = (d) => {
    const date = new Date(d);
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}`;
  };

  // Format date for separators (Today, Yesterday, or DD/MM/YYYY)
  const fmtDateSeparator = (d) => {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
  };

  // Check if two dates are the same day
  const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.toDateString() === date2.toDateString();
  };

  // Generate temporary ID for optimistic updates
  const generateTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Connect to Socket.IO and fetch chats
  useEffect(() => {
    if (!user) {
      console.warn("⚠️ No user, skipping socket connection");

      return;
    }

    // Socket connection established

    if (!myUserId) {
      console.error("No valid user ID found");
      return;
    }



    // Remove all old listeners to prevent duplicates
    socket.removeAllListeners();

    // Set new auth for this user
    socket.auth = { userId: myUserId };
    // Connect socket

    socket.connect();

    // Add timeout to detect if connection is hanging
    const connectionTimeout = setTimeout(() => {
      if (!socket.connected) {
        console.error("Socket connection timeout");
      }
    }, 5000);

    socket.on("connect", () => {
      clearTimeout(connectionTimeout);
      console.log("[Socket] Connected");

      // Join room after connection is established
      if (myUserId) {
        socket.emit("join", myUserId);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connect error:", err?.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected:", reason);
    });

    const fetchChats = async () => {
      try {
        // Fetching chats

        // Use fetch with explicit error handling
        const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        const response = await fetch(`${API_BASE}/chat/my-chats`, {
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        });


        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Failed to fetch chats: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        const chatsArray = Array.isArray(data) ? data : data.chats || [];
        const sortedChats = [...chatsArray].sort((a, b) => {
          const ta = new Date(a?.lastMessage?.timestamp || a?.updatedAt || 0).getTime();
          const tb = new Date(b?.lastMessage?.timestamp || b?.updatedAt || 0).getTime();
          return tb - ta;
        });
        setChats(sortedChats);
        // totalUnread may be computed on server or we compute locally
        const initialUnread = sortedChats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(typeof data.totalUnread === "number" ? data.totalUnread : initialUnread);
        if (sortedChats.length > 0) {
          const targetId = searchParams?.get("chatId");
          if (targetId) {
            const match = sortedChats.find((c) => String(c._id) === String(targetId));
            setSelectedChat(match || sortedChats[0]);
          } else {
            setSelectedChat(sortedChats[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError(`Failed to load chats: ${err.message}`);
      }
    };

    fetchChats();

    // Listen for errors
    socket.on("error", (message) => {
      console.error("Socket error");
      setError(
        typeof message === "string"
          ? message
          : message.message || "An error occurred"
      );
    });

    // Listen for chat updates (if emitted by backend elsewhere)
    socket.on("updatedChats", (updatedChats) => {
      const sorted = [...(updatedChats || [])].sort((a, b) => {
        const ta = new Date(a?.lastMessage?.timestamp || a?.updatedAt || 0).getTime();
        const tb = new Date(b?.lastMessage?.timestamp || b?.updatedAt || 0).getTime();
        return tb - ta;
      });
      setChats(sorted);

      // Calculate total unread manually from chat data
      const newTotalUnread = (updatedChats || []).reduce((sum, chat) => {
        const unreadCount = chat.unreadCount || 0;
        return sum + unreadCount;
      }, 0);
      setTotalUnread(newTotalUnread);

      // If we have a selected chat, update it with the latest data
      if (selectedChat) {
        const updatedSelectedChat = updatedChats.find(
          (chat) => chat._id === selectedChat._id
        );
        // Only update if something meaningful changed to avoid effect re-runs
        if (updatedSelectedChat && JSON.stringify(updatedSelectedChat) !== JSON.stringify(selectedChat)) {
          setSelectedChat((prev) => (prev && prev._id === updatedSelectedChat._id ? { ...prev, ...updatedSelectedChat } : prev));
        }
      }
    });

    // Listen for total unread count updates
    socket.on("totalUnreadCount", (count) => {
      setTotalUnread(count || 0);
    });

    // Request total unread count periodically
    const unreadInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("getTotalUnreadCount");
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearTimeout(connectionTimeout);
      // socket.disconnect();
      socket.off("error");
      socket.off("updatedChats");
      socket.off("totalUnreadCount");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      clearInterval(unreadInterval);
    };
  }, [user, searchParams]);

  // Fetch messages when selected chat ID changes
  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      try {

        const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
        const response = await fetch(
          `${API_BASE}/chat/${selectedChat._id}/messages`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
          }
        );


        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Failed to fetch messages: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();

        // Ensure messages have text field for display consistency
        const processedData = data.map((msg) => ({
          ...msg,
          text: msg.text || msg.content, // Use text if available, otherwise use content
        }));

        // Preserve any pending messages when loading chat history
        setMessages((prev) => {
          const pendingMessages = prev.filter((m) => m.pending && m.chatId === selectedChat._id);
          return [...processedData, ...pendingMessages];
        });
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(`Failed to load messages: ${err.message}`);
      }
    };

    fetchMessages();

    socket.on("newMessage", (payload) => {
      // Backend emits: { chatId, message: { id, content, sender, timestamp } }
      if (!payload || !payload.message) return;
      const { chatId, message } = payload;
      const currentUserId = user?.id || user?._id || authUserId;


      const senderId = (typeof message.sender === 'object' && message.sender?._id)
        ? message.sender._id
        : message.sender;

      const processedMessage = {
        _id: message.id,
        chatId,
        sender: senderId, // We store string ID for internal consistency
        content: message.content,
        text: message.content,
        attachments: message.attachments || [],
        tempId: payload.tempId, // Pass through tempId for matching
        createdAt: message.timestamp,
      };

      console.log("📦 Processed message:", processedMessage);

      // Emit notification if message is from someone else
      if (String(senderId) !== String(currentUserId)) {
        try {
          window.dispatchEvent(
            new CustomEvent("ojest:notify", {
              detail: {
                type: "message",
                title: "New message",
                body: message.content || "You have a new message",
                meta: { chatId, messageId: message.id },
              },
            })
          );
        } catch (e) {
          console.error("Failed to dispatch notification:", e);
        }
      }

      // Add a readable senderName for display
      try {
        if (String(senderId) === String(currentUserId)) {
          processedMessage.senderName = "You";
        } else if (selectedChat) {
          // Try to resolve other participant name from selectedChat
          let name = null;
          if (Array.isArray(selectedChat.participantData) && selectedChat.participantData.length > 0) {
            const other = selectedChat.participantData.find((p) => !p.isCurrentUser);
            name = other?.name || `${other?.firstName || ""} ${other?.lastName || ""}`.trim();
          }
          if (!name && Array.isArray(selectedChat.participants)) {
            const meId = myUserId;
            const other = selectedChat.participants.find((p) => String(p.id) !== String(meId));
            name = `${other?.firstName || ""} ${other?.lastName || ""}`.trim() || other?.email;
          }
          processedMessage.senderName = name || "Unknown";
        }
      } catch (_) {
        processedMessage.senderName = processedMessage.senderName || "Unknown";
      }

      // Update chat list: lastMessage and unreadCount
      setChats((prevChats) => {
        const updated = (prevChats || []).map((c) => {
          if (c._id !== chatId) return c;
          const isIncoming = String(senderId) !== String(currentUserId);
          return {
            ...c,
            lastMessage: {
              content: message.content,
              sender: senderId,
              timestamp: message.timestamp,
            },
            unreadCount:
              selectedChat && selectedChat._id === chatId
                ? 0
                : (c.unreadCount || 0) + (isIncoming ? 1 : 0),
          };
        });
        // Recompute total unread from updated list
        const total = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setTotalUnread(total);
        return updated;
      });

      // If current chat is open, append/replace in thread
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prev) => {

          // Check if this is our own message by matching sender
          const isOwnMessage = String(senderId) === String(currentUserId);

          if (isOwnMessage) {
            // Match by tempId if possible (backend should return it if we sent it)
            const incomingTempId = payload.tempId || message.tempId;

            let pendingIdx = -1;

            if (incomingTempId) {
              pendingIdx = prev.findIndex(m => m.pending && (m.tempId === incomingTempId || m._id === incomingTempId));
            }

            // Fallback to content matching if no tempId match
            if (pendingIdx === -1) {
              const searchText = (processedMessage.text || "").trim();
              for (let i = prev.length - 1; i >= 0; i--) {
                const pendingText = (prev[i].text || "").trim();
                if (prev[i].pending && pendingText === searchText) {
                  pendingIdx = i;
                  break;
                }
              }
            }

            if (pendingIdx !== -1) {
              // Replace the optimistic message with the real one
              const copy = [...prev];
              copy[pendingIdx] = { ...processedMessage, pending: false, senderName: "You" };
              return copy;
            } else {
              // No pending message found
              // If we couldn't find it but it's our own message, it might have arrived before we even finished our local state update
              // (rare but possible). In this case, just treat it as a new message.
            }
          }

          // Check if message already exists (avoid duplicates)
          const exists = prev.some((m) => m._id === processedMessage._id || (processedMessage.tempId && m.tempId === processedMessage.tempId && !m.pending));
          if (exists) {
            return prev;
          }

          // Add new message
          return [...prev, processedMessage];
        });

        // If an incoming message arrives while chat is open, mark it read now
        if (String(senderId) !== String(currentUserId)) {
          socket.emit("markAsRead", { chatId, userId: currentUserId });
          // Also ensure its unreadCount is 0 locally
          setChats((prev) =>
            (prev || []).map((c) => (c._id === chatId ? { ...c, unreadCount: 0 } : c))
          );
          // Recompute total unread
          setTotalUnread((prev) => {
            const list = (chats || []).map((c) =>
              c._id === chatId ? { ...c, unreadCount: 0 } : c
            );
            return list.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          });
        }
      }
    });

    socket.on("messagesSeen", (updatedMessages) => {
      // Ensure all messages have text field
      const processedMessages = updatedMessages.map((msg) => ({
        ...msg,
        text: msg.text || msg.content,
      }));

      setMessages((prev) =>
        prev.map((msg) => {
          const updatedMsg = processedMessages.find((m) => m._id === msg._id);
          return updatedMsg
            ? { ...updatedMsg, text: updatedMsg.text || updatedMsg.content }
            : msg;
        })
      );
    });

    socket.on("typing", ({ userId, chatId }) => {
      if (chatId === selectedChat._id && String(userId) !== String(myUserId)) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
      alert(`Socket Error: ${error.message || "Something went wrong"}`);
      if (error.tempId) {
        setMessages(prev => prev.filter(m => m._id !== error.tempId));
      }
    });

    return () => {
      socket.off("chatHistory");
      socket.off("newMessage");
      socket.off("messagesSeen");
      socket.off("typing");
      socket.off("error");
    };
  }, [selectedChat?._id, user]);

  // Helper to download files (especially for extensionless raw files)
  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, '_blank'); // Fallback
    }
  };

  // Using carService's uploadImageBatch for consistency
  const getTokenCallback = async () => token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  // Handle sending a message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !selectedChat || !user) return;

    const tempId = generateTempId();
    const messageContent = newMessage;
    const timestamp = new Date();

    // Optimistic attachments (with local preview URLs)
    const optimisticAttachments = attachments.map(file => {
      let previewUrl = null;
      try {
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        }
      } catch (e) {
        console.error("Failed to create preview URL:", e);
      }

      return {
        name: file.name,
        type: file.type,
        size: file.size,
        url: previewUrl,
        isLocal: true, // Tag to know we should revoke it later
      };
    });

    // Add optimistic message immediately
    const optimisticMessage = {
      _id: tempId,
      chatId: selectedChat._id,
      sender: myUserId,
      senderId: myUserId,
      createdAt: timestamp,
      seenBy: [myUserId],
      senderName: "You",
      content: messageContent,
      text: messageContent,
      attachments: optimisticAttachments,
      pending: true,
      tempId: tempId,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    // We don't clear attachments yet, in case upload fails
    const currentAttachments = [...attachments];
    setAttachments([]);

    try {
      // Upload attachments to Cloudinary using the "normal way"
      let finalAttachments = [];
      if (currentAttachments.length > 0) {
        console.log("📤 [NormalWay] Uploading to Cloudinary...");
        const result = await uploadImageBatch(currentAttachments, undefined, getTokenCallback);

        if (!result.success) {
          throw new Error(result.errors?.[0] || "Cloudinary upload failed");
        }

        console.log("✅ [NormalWay] Cloudinary Success. URLs:", result.urls);

        // Construct full attachment objects
        finalAttachments = currentAttachments.map((file, idx) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: result.urls[idx]
        }));
      }

      console.log("🚀 Sending via socket. attachments:", finalAttachments);

      // Check socket connection
      if (!socket.connected) {
        socket.connect(); // Try to reconnect
        // Wait a bit
        await new Promise(r => setTimeout(r, 1000));
        if (!socket.connected) throw new Error("Connection lost. Please refresh.");
      }

      // Emit message with Cloudinary URLs
      const payload = {
        chatId: selectedChat._id,
        senderId: myUserId,
        content: messageContent,
        tempId: tempId,
        attachments: JSON.parse(JSON.stringify(finalAttachments)),
      };

      socket.emit("sendMessage", payload);

      console.log("🚀 Message emitted via socket");

      // Revoke local URLs after a short delay
      setTimeout(() => {
        optimisticAttachments.forEach(att => {
          if (att.isLocal && att.url) URL.revokeObjectURL(att.url);
        });
      }, 10000);

    } catch (error) {
      console.error("❌ Failed to send message:", error);
      alert(`Failed to send message: ${error.message}`);

      // Remove the optimistic message
      setMessages(prev => prev.filter(m => m._id !== tempId));
      // Restore attachments so user can try again
      setAttachments(currentAttachments);
      // Restore message text
      setNewMessage(messageContent);
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedChat && user) {
      socket.emit("typing", { chatId: selectedChat._id, userId: myUserId });
    }
  };

  // Get other participant's name
  const getParticipantName = (chat) => {
    if (!chat) return "Unknown";
    // Prefer participantData if present
    if (Array.isArray(chat.participantData) && chat.participantData.length > 0) {
      const other = chat.participantData.find((p) => !p.isCurrentUser);
      if (other?.name) return other.name;
    }
    // Fallback to participants array from backend controller
    if (Array.isArray(chat.participants)) {
      const meId = myUserId;
      const other = chat.participants.find((p) => String(p.id) !== String(meId));
      if (other) {
        const name = `${other.firstName || ""} ${other.lastName || ""}`.trim();
        return name || other.email || "Unknown";
      }
    }
    return "Unknown";
  };

  // Resolve other participant's image (supports various backend shapes)
  const getParticipantImage = (chat) => {
    if (!chat) return null;
    // Prefer participantData if present
    if (Array.isArray(chat.participantData) && chat.participantData.length > 0) {
      const other = chat.participantData.find((p) => !p.isCurrentUser);
      return other?.image || other?.profilePicture || null;
    }
    // Fallback to participants array
    if (Array.isArray(chat.participants)) {
      const meId = myUserId;
      const other = chat.participants.find((p) => String(p.id) !== String(meId));
      return other?.image || other?.profilePicture || null;
    }
    return null;
  };

  // Select a chat and mark as read
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowSidebar(false);

    // Mark messages as seen when selecting a chat
    if (chat && chat._id) {
      socket.emit("markAsRead", {
        chatId: chat._id,
        userId: myUserId,
      });

      // Update local unread count immediately for better UX
      const updatedChats = chats.map((c) => {
        if (c._id === chat._id) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      });

      setChats(updatedChats);

      // Recalculate total unread count
      const newTotalUnread = updatedChats.reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
      );
      setTotalUnread(newTotalUnread);
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Please log in to view messages.</p>
      </div>
    );
  }


  // Calculate the chat count
  const chatCount = chats.length;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-dark-main font-sans overflow-hidden relative transition-colors duration-300">
      {/* Sidebar - Full Page Style */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-20 h-full w-full sm:w-[320px] md:w-[350px] flex flex-col transform transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-panel`}
      >
        <div className="h-full flex flex-col overflow-hidden transition-colors duration-300">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-extrabold text-2xl text-gray-900 dark:text-gray-200 dark:text-white tracking-tight">Wiadomości</h2>
              <p className="text-xs text-dark-text-secondary font-bold uppercase tracking-widest mt-1">Twoje konwersacje</p>
            </div>
            {totalUnread > 0 && (
              <div className="bg-red-500 text-white rounded-xl px-3 py-1 text-xs font-bold shadow-red-200 shadow-md">
                {totalUnread} nowych
              </div>
            )}
          </div>

          {/* Chat List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 space-y-3 py-4 custom-scrollbar">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`flex items-center gap-4 p-5 cursor-pointer transition-all border-b border-gray-100 dark:border-gray-700/50 ${selectedChat && selectedChat._id === chat._id
                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-500"
                    : "bg-white dark:bg-dark-main hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="relative">
                    <Avatar
                      src={getParticipantImage(chat)}
                      alt={getParticipantName(chat)}
                      size={50}
                      imgClassName="rounded-xl"
                    />
                    {chat.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className={`text-sm truncate ${chat.unreadCount > 0 ? "font-black text-gray-900 dark:text-white" : "font-bold text-gray-700 dark:text-gray-300"}`}>
                        {getParticipantName(chat)}
                      </div>
                      {chat.lastMessage && (
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                          {fmtTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className={`truncate w-full text-xs ${chat.unreadCount > 0 ? "text-gray-900 dark:text-white font-bold" : "text-gray-500 dark:text-gray-400 font-medium"}`}>
                      {chat.lastMessage ? (
                        <>
                          <span className="mr-1 text-gray-400 dark:text-gray-600">
                            {String(chat.lastMessage.sender) === String(myUserId) ? "Ty:" : ""}
                          </span>
                          {chat.lastMessage.content || "Empty message"}
                        </>
                      ) : (
                        <span className="italic text-gray-400">Rozpocznij konwersację</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <FaEnvelope size={24} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Brak wiadomości</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative transition-colors duration-300">
        <div className="h-full flex flex-col overflow-hidden relative transition-colors duration-300">
          {/* Chat Header */}
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0 bg-white dark:bg-dark-panel z-10 transition-colors">
            <div className="flex items-center gap-4">
              {/* Mobile: sidebar toggle */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setShowSidebar((prev) => !prev)}
              >
                <FaBars className="h-4 w-4" />
              </button>
              {selectedChat ? (
                <div className="flex items-center gap-4">
                  <Avatar
                    src={getParticipantImage(selectedChat)}
                    alt={getParticipantName(selectedChat)}
                    size={48}
                    imgClassName="rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                  />
                  <div>
                    <div className="font-bold text-lg text-gray-900 dark:text-gray-200 dark:text-white transition-colors">
                      {getParticipantName(selectedChat)}
                    </div>
                    {selectedChat.carId && (
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg inline-block mt-1">
                        AUTO: {selectedChat.carId.title || "Nieznane"}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="font-bold text-lg text-gray-400">Wybierz konwersację</div>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50/30 dark:bg-dark-card/10 custom-scrollbar transition-colors">
            {selectedChat ? (
              messages.length > 0 ? (
                <>
                  {messages.map((message, index) => {
                    // Show date separator if this is the first message or if the date changed
                    const showDateSeparator = index === 0 || !isSameDay(message.createdAt, messages[index - 1].createdAt);
                    const messageSenderId = (typeof message.sender === 'object' && message.sender?._id)
                      ? message.sender._id
                      : (message.sender || message.senderId);
                    const isMe = String(messageSenderId) === String(myUserId);
                    const isLast = index === messages.length - 1;

                    return (
                      <React.Fragment key={message._id || message.tempId}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4">
                            <span className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                              {fmtDateSeparator(message.createdAt)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                        >
                          <div className={`max-w-[75%] md:max-w-[60%] flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                            {/* Optional small avatar next to message bubbles */}
                            {/* <Avatar src={isMe ? user?.image : getParticipantImage(selectedChat)} size={32} imgClassName="rounded-lg self-end" /> */}

                            <div
                              className={`px-6 py-4 rounded-2xl shadow-sm text-sm whitespace-pre-line relative transition-all duration-200 ${isMe
                                ? "bg-blue-600 text-white rounded-br-none shadow-blue-900/20"
                                : "bg-white dark:bg-dark-card text-gray-800 dark:text-gray-100 rounded-bl-none shadow-black/5"
                                } ${message.pending ? "opacity-80" : "opacity-100"}`}
                            >
                              {String(messageSenderId) !== String(myUserId) && (
                                <div className="font-bold text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                                  {message.senderName || "Użytkownik"}
                                </div>
                              )}
                              {/* Attachment preview */}
                              <div className="mb-3 space-y-2">
                                {message.attachments.map((att, attIdx) => {
                                  const url = typeof att === 'string' ? att : att.url;
                                  const name = att.name || (typeof att === 'string' ? url.split('/').pop() : 'Attachment');
                                  const type = att.type || '';
                                  const isImage = type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url);

                                  if (!url) {
                                    return (
                                      <div key={attIdx} className="flex items-center gap-2 p-2 bg-white/20 rounded-lg opacity-60">
                                        {type.startsWith('image/') ? <FaFileImage className="text-lg" /> : <FaFileAlt className="text-lg" />}
                                        <span className="text-xs truncate max-w-[150px]">{name}</span>
                                        {message.pending && <span className="animate-pulse ml-1">●</span>}
                                      </div>
                                    );
                                  }

                                  return (
                                    <div key={attIdx}>
                                      {isImage ? (
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                                          <img
                                            src={url}
                                            alt={name}
                                            className="max-w-[200px] max-h-[200px] rounded-lg object-cover hover:opacity-90 transition-opacity border border-white/20"
                                            loading="lazy"
                                            onError={(e) => {
                                              // Fallback for broken images
                                              e.target.style.display = 'none';
                                              e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                          <div style={{ display: 'none' }} className="flex items-center gap-2 p-2 bg-white/20 rounded-lg">
                                            <FaFileAlt className="text-lg" />
                                            <span className="text-xs underline">{name}</span>
                                          </div>
                                        </a>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleDownload(url, name);
                                          }}
                                          className="flex items-center gap-2 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors w-full text-left"
                                        >
                                          <FaFileAlt className="text-lg" />
                                          <span className="text-xs truncate max-w-[150px] underline">{name}</span>
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {message.text || message.content}

                              <div className={`text-right text-[10px] font-bold mt-2 ${isMe ? 'text-blue-200' : 'text-gray-300 dark:text-gray-500'}`}>
                                {fmtTime(message.createdAt)}
                                {isMe && (
                                  <span className="ml-2 inline-block">
                                    {message.pending ? (
                                      <span className="animate-pulse">●</span>
                                    ) : message.seenBy && message.seenBy.length > 1 ? (
                                      "✓✓"
                                    ) : (
                                      "✓"
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  })}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-600 px-6 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-0" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 opacity-60">
                  <FaEnvelope size={48} className="mb-4" />
                  <p className="font-bold">To początek Waszej rozmowy</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600">
                <div className="w-24 h-24 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mb-6">
                  <FaPaperPlane size={32} className="ml-2" />
                </div>
                <p className="font-bold text-lg text-gray-400 dark:text-gray-500">Wybierz czat aby rozpocząć rozmowę</p>
              </div>
            )}
          </div>

          {/* Message Input - Integrated */}
          {selectedChat && (
            <div className="p-4 bg-white dark:bg-dark-panel border-t border-gray-100 dark:border-gray-700 z-10 transition-colors">
              {/* Attachment preview area */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 px-1">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs">
                      {file.type.startsWith('image/') ? <FaFileImage /> : <FaFileAlt />}
                      <span className="truncate max-w-[100px]">{file.name}</span>
                      <button
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-dark-card/50 border border-gray-100 dark:border-gray-700/50 rounded-xl p-1.5 focus-within:border-blue-500/50 transition-all">
                {/* Attachment button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const MAX_SIZE = 10 * 1024 * 1024; // 10MB (Cloudinary free tier limit)
                    const oversized = files.filter(f => f.size > MAX_SIZE);
                    if (oversized.length > 0) {
                      alert(`File too large: ${oversized[0].name}\nMax size: 10MB (Cloudinary limit)\nYour file: ${(oversized[0].size / 1024 / 1024).toFixed(2)}MB\n\nTo upload larger files, upgrade your Cloudinary plan.`);
                      e.target.value = '';
                      return;
                    }
                    setAttachments(prev => [...prev, ...files]);
                    e.target.value = ''; // Reset input
                  }}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                  title="Add attachment"
                >
                  <FaPaperclip size={18} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  className="flex-1 bg-transparent outline-none border-none focus:ring-0 p-2.5 pl-2 text-sm font-bold text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Napisz wiadomość..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && attachments.length === 0}
                  className="p-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center shrink-0"
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
