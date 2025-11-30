import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom"

interface UserListModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    users: any[]
}

export function UserListModal({ isOpen, onClose, title, users }: UserListModalProps) {
    const navigate = useNavigate()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b-2 border-black bg-gray-50">
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No users found.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => {
                                        navigate(`/user/${user.username}`)
                                        onClose()
                                    }}
                                >
                                    <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white flex-shrink-0">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate">{user.name}</p>
                                        <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
