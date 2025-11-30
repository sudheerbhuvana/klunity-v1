import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationAPI, socialAPI } from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        fetchNotifications()
        // Poll for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchNotifications = async () => {
        try {
            const response = await notificationAPI.getNotifications()
            setNotifications(response.data)
            setUnreadCount(response.data.filter((n: any) => !n.read).length)
        } catch (error) {
            console.error("Error fetching notifications", error)
        }
    }

    const handleNotificationClick = async (notification: any) => {
        if (!notification.read) {
            try {
                await notificationAPI.markRead(notification._id)
                setUnreadCount(prev => Math.max(0, prev - 1))
                setNotifications(prev => prev.map(n =>
                    n._id === notification._id ? { ...n, read: true } : n
                ))
            } catch (error) {
                console.error("Error marking read", error)
            }
        }

        if (notification.type === 'follow_request' || notification.type === 'follow_accepted') {
            navigate(`/user/${notification.sender.username}`)
        }
    }

    const handleAccept = async (e: React.MouseEvent, notification: any) => {
        e.stopPropagation()
        try {
            await socialAPI.accept(notification.sender._id)
            toast.success("Request accepted")
            // Refresh notifications to update UI if needed, or just remove the button locally
            fetchNotifications()
        } catch (error) {
            toast.error("Failed to accept request")
        }
    }

    const handleReject = async (e: React.MouseEvent, notification: any) => {
        e.stopPropagation()
        try {
            await socialAPI.reject(notification.sender._id)
            toast.success("Request rejected")
            fetchNotifications()
        } catch (error) {
            toast.error("Failed to reject request")
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative w-10 h-10 rounded-full border-2 border-black hover:bg-gray-100">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-3 border-black rounded-xl p-0 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-3 bg-gray-50 border-b-2 border-black font-bold">
                    Notifications
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification._id}
                                className={`p-3 cursor-pointer border-b border-gray-100 last:border-0 focus:bg-gray-50 ${!notification.read ? 'bg-purple-50' : ''
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-3 w-full">
                                    <div className="w-8 h-8 rounded-full border border-black overflow-hidden bg-white flex-shrink-0">
                                        {notification.sender.avatar ? (
                                            <img src={notification.sender.avatar} alt={notification.sender.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-500">
                                                {notification.sender.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-bold">{notification.sender.name}</span>
                                            {notification.type === 'follow_request' && " sent you a follow request."}
                                            {notification.type === 'follow_accepted' && " accepted your follow request."}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </p>

                                        {notification.type === 'follow_request' && (
                                            <div className="mt-2">
                                                {notification.status === 'accepted' ? (
                                                    <span className="text-xs font-bold text-green-600">Accepted</span>
                                                ) : notification.status === 'rejected' ? (
                                                    <span className="text-xs font-bold text-red-600">Rejected</span>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="h-7 text-xs bg-black text-white hover:bg-gray-800"
                                                            onClick={(e) => handleAccept(e, notification)}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs border-black"
                                                            onClick={(e) => handleReject(e, notification)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-1" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
