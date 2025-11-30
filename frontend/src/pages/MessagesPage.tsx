import { useState, useEffect, useRef } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { messageAPI, userAPI } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Send, User, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useParams, useNavigate } from "react-router-dom"
import { logger } from "@/lib/logger"
import { toast } from "sonner"

export function MessagesPage() {
    const { userId } = useParams()
    const navigate = useNavigate()
    const { user: currentUser } = useAuth()
    const [conversations, setConversations] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])
    const [currentChatUser, setCurrentChatUser] = useState<any>(null)
    const [newMessage, setNewMessage] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const socketRef = useRef<any>(null)

    // Initialize Socket.io
    useEffect(() => {
        if (currentUser) {
            import('socket.io-client').then(({ io }) => {
                // Strip /api from the URL to get the root backend URL
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
                const socketUrl = apiUrl.replace('/api', '');

                console.log('Connecting to socket at:', socketUrl);

                socketRef.current = io(socketUrl, {
                    withCredentials: true,
                    transports: ['websocket', 'polling'] // Force websocket first
                })

                socketRef.current.on('connect', () => {
                    console.log('Socket connected successfully:', socketRef.current.id)
                    socketRef.current.emit('join', currentUser.id)
                })

                socketRef.current.on('connect_error', (err: any) => {
                    console.error('Socket connection error:', err)
                })

                socketRef.current.on('receive_message', (message: any) => {
                    console.log('Received real-time message:', message);
                    // Only append if the message belongs to the current chat
                    // We need to check against the current userId (the person we are chatting with)
                    // The message.sender or message.receiver should match the userId from params

                    // Note: userId from params is the ID of the person we are chatting WITH.
                    // If I receive a message, sender is THEM.
                    // If I sent a message (via another tab), sender is ME.

                    // We need to access the latest userId from the ref or state, but inside useEffect closure 'userId' is stale if not in deps.
                    // However, we have userId in deps.

                    if (userId) {
                        if (message.sender === userId || message.receiver === userId) {
                            setMessages(prev => {
                                // Prevent duplicates just in case
                                if (prev.some(m => m._id === message._id)) return prev;
                                return [...prev, message]
                            })
                        }
                    }
                })
            })
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
        }
    }, [currentUser, userId])

    // Fetch list of conversations
    useEffect(() => {
        fetchConversations()
    }, [])

    // Fetch messages when userId changes
    useEffect(() => {
        if (userId) {
            fetchMessages(userId)
            fetchChatUser(userId)
        } else {
            setCurrentChatUser(null)
            setMessages([])
        }
    }, [userId])

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const fetchConversations = async () => {
        try {
            const response = await messageAPI.getConversations()
            setConversations(response.data)
            setIsLoading(false)
        } catch (error) {
            logger.error('MessagesPage', 'Error fetching conversations', error)
            setIsLoading(false)
        }
    }

    const fetchMessages = async (id: string) => {
        try {
            const response = await messageAPI.getConversation(id)
            setMessages(response.data)
        } catch (error) {
            logger.error('MessagesPage', 'Error fetching messages', error)
            toast.error("Failed to load messages")
        }
    }

    const fetchChatUser = async (id: string) => {
        try {
            // Check if user is in conversations list first to save API call
            const existingUser = conversations.find(c => c._id === id)
            if (existingUser) {
                setCurrentChatUser(existingUser)
            } else {
                // Fetch user details if starting new chat
                const response = await userAPI.getUserById(id)
                setCurrentChatUser(response.data.user)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !userId) return

        setIsSending(true)
        try {
            const response = await messageAPI.sendMessage(userId, newMessage)
            setMessages([...messages, response.data])
            setNewMessage("")

            // Update conversations list if new chat
            if (!conversations.find(c => c._id === userId)) {
                fetchConversations()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send message")
        } finally {
            setIsSending(false)
        }
    }

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-[#6366F1]" />
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-4">
                {/* Conversations Sidebar */}
                <div className="w-1/3 bg-white border-3 border-black rounded-2xl overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="p-4 border-b-3 border-black bg-purple-100">
                        <h2 className="text-xl font-bold">Messages</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {conversations.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No conversations yet.
                            </div>
                        ) : (
                            conversations.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => navigate(`/messages/${user._id}`)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${userId === user._id
                                        ? "bg-purple-50 border-purple-500"
                                        : "border-transparent hover:bg-gray-50 hover:border-gray-200"
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-gray-200 flex-shrink-0">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold truncate">{user.name}</h3>
                                            {user.role === 'admin' && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full border border-red-200">
                                                    ADMIN
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-white border-3 border-black rounded-2xl overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {userId ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b-3 border-black bg-gray-50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-white cursor-pointer" onClick={() => navigate(`/user/${currentChatUser?.username}`)}>
                                    {currentChatUser?.avatar ? (
                                        <img src={currentChatUser.avatar} alt={currentChatUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-lg cursor-pointer hover:underline" onClick={() => navigate(`/user/${currentChatUser?.username}`)}>
                                            {currentChatUser?.name || "Chat"}
                                        </h2>
                                        {currentChatUser?.role === 'admin' && (
                                            <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded-full border border-red-200">
                                                ADMIN
                                            </span>
                                        )}
                                    </div>
                                    {currentChatUser?.username && (
                                        <p className="text-xs text-gray-500 cursor-pointer hover:text-purple-600" onClick={() => navigate(`/user/${currentChatUser?.username}`)}>
                                            @{currentChatUser.username}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender === currentUser?.id
                                    return (
                                        <div
                                            key={index}
                                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[70%] p-3 rounded-2xl border-2 border-black ${isMe
                                                    ? "bg-purple-600 text-white rounded-tr-none"
                                                    : "bg-white text-black rounded-tl-none"
                                                    }`}
                                            >
                                                <p>{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${isMe ? "text-purple-200" : "text-gray-400"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t-3 border-black bg-white flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="border-2 border-black rounded-xl"
                                    disabled={isSending}
                                />
                                <Button
                                    type="submit"
                                    disabled={isSending || !newMessage.trim()}
                                    className="bg-black text-white hover:bg-gray-800 border-2 border-black rounded-xl w-12 px-0"
                                >
                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}
