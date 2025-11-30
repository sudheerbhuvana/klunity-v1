import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Shield, Users, FileText, Activity, Loader2, Check, X, Plus, AlertTriangle, Edit, MessageSquare, UserPlus, Mail, Trash2 } from "lucide-react"
import { adminAPI, contactAPI } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function AdminDashboardPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('users')
    const [stats, setStats] = useState({
        users: 0,
        stories: 0,
        activeToday: 0
    })
    const [users, setUsers] = useState<any[]>([])
    const [pendingFaculty, setPendingFaculty] = useState<any[]>([])
    const [blacklist, setBlacklist] = useState<any[]>([])
    const [contactMessages, setContactMessages] = useState<any[]>([])
    const [newBlacklistWord, setNewBlacklistWord] = useState('')

    // Action States
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isMessageOpen, setIsMessageOpen] = useState(false)
    const [messageContent, setMessageContent] = useState('')
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        role: '',
        department: '',
        college: '',
        major: '',
        year: '',
        username: '',
        bio: '',
        linkedin: '',
        github: '',
        portfolio: '',
        twitter: '',
        isSuspended: false,
        isEmailVerified: false
    })

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/feed')
            return
        }

        const fetchData = async () => {
            try {
                const [statsRes, usersRes, pendingRes, blacklistRes, contactRes] = await Promise.all([
                    adminAPI.getStats(),
                    adminAPI.getUsers(),
                    adminAPI.getPendingFaculty(),
                    adminAPI.getBlacklist(),
                    contactAPI.getMessages()
                ])
                setStats(statsRes.data.data)
                setUsers(usersRes.data.data)
                setPendingFaculty(pendingRes.data.data)
                setBlacklist(blacklistRes.data.data)
                setContactMessages(contactRes.data.data)

            } catch (error) {
                console.error("Failed to fetch admin data:", error)
                toast.error("Failed to load dashboard data")
            } finally {
                setIsLoading(false)
            }
        }

        if (user?.role === 'admin') {
            fetchData()
        }
    }, [user, navigate])

    const handleVerifyFaculty = async (id: string) => {
        try {
            await adminAPI.verifyFaculty(id)
            toast.success("Faculty verified successfully")
            setPendingFaculty(prev => prev.filter(f => f._id !== id))
            // Refresh users list to show updated status if needed
            const usersRes = await adminAPI.getUsers()
            setUsers(usersRes.data.data)
        } catch (error) {
            toast.error("Failed to verify faculty")
        }
    }

    const handleAddToBlacklist = async () => {
        if (!newBlacklistWord.trim()) return
        try {
            const res = await adminAPI.addToBlacklist(newBlacklistWord)
            setBlacklist([res.data.data, ...blacklist])
            setNewBlacklistWord('')
            toast.success("Word added to blacklist")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add word")
        }
    }

    const handleRemoveFromBlacklist = async (id: string) => {
        try {
            await adminAPI.removeFromBlacklist(id)
            setBlacklist(prev => prev.filter(item => item._id !== id))
            toast.success("Word removed from blacklist")
        } catch (error) {
            toast.error("Failed to remove word")
        }
    }

    const handleDeleteMessage = async (id: string) => {
        try {
            await contactAPI.deleteMessage(id)
            setContactMessages(prev => prev.filter(m => m._id !== id))
            toast.success("Message deleted")
        } catch (error) {
            toast.error("Failed to delete message")
        }
    }

    const handleEditUser = (user: any) => {
        setSelectedUser(user)
        setEditFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'student',
            department: user.department || '',
            college: user.college || '',
            major: user.major || '',
            year: user.year || '',
            username: user.username || '',
            bio: user.bio || '',
            linkedin: user.linkedin || '',
            github: user.github || '',
            portfolio: user.portfolio || '',
            twitter: user.twitter || '',
            isSuspended: user.isSuspended || false,
            isEmailVerified: user.isEmailVerified || false
        })
        setIsEditOpen(true)
    }

    const handleUpdateUser = async () => {
        if (!selectedUser) return
        try {
            const res = await adminAPI.updateUser(selectedUser._id, editFormData)
            setUsers(users.map(u => u._id === selectedUser._id ? res.data.data : u))
            setIsEditOpen(false)
            toast.success("User updated successfully")
        } catch (error) {
            toast.error("Failed to update user")
        }
    }

    const handleMessageUser = (user: any) => {
        setSelectedUser(user)
        setMessageContent('')
        setIsMessageOpen(true)
    }

    const handleSendMessage = async () => {
        if (!selectedUser || !messageContent.trim()) return
        try {
            await adminAPI.sendMessage(selectedUser._id, messageContent)
            setIsMessageOpen(false)
            toast.success("Message sent successfully")
        } catch (error) {
            toast.error("Failed to send message")
        }
    }

    const handleFollowUser = async (id: string) => {
        try {
            await adminAPI.followUser(id)
            toast.success("User followed successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to follow user")
        }
    }

    if (!user || user.role !== 'admin') return null

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    const tabs = [
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'pending', label: 'Pending Approvals', icon: AlertTriangle, count: pendingFaculty.length },
        { id: 'messages', label: 'Contact Messages', icon: Mail, count: contactMessages.length },
        { id: 'blacklist', label: 'Blacklist Management', icon: Shield },
        { id: 'content', label: 'Site Content', icon: FileText },
    ]

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Shield className="w-10 h-10" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg">Welcome back, {user.name}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-100 rounded-xl border-2 border-black">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold">Total Users</h3>
                        </div>
                        <p className="text-4xl font-bold">{stats.users}</p>
                    </div>
                    <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-purple-100 rounded-xl border-2 border-black">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold">Total Stories</h3>
                        </div>
                        <p className="text-4xl font-bold">{stats.stories}</p>
                    </div>
                    <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-green-100 rounded-xl border-2 border-black">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold">Active Today</h3>
                        </div>
                        <p className="text-4xl font-bold">{stats.activeToday}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-4 mb-8 border-b-2 border-gray-200 pb-4">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border-2 ${activeTab === tab.id
                                    ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white text-gray-600 border-transparent hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[400px]">

                        {activeTab === 'users' && (
                            <>
                                <h2 className="text-2xl font-bold mb-4">User Management</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100 text-left">
                                                <th className="pb-3 font-bold">Name</th>
                                                <th className="pb-3 font-bold">Role</th>
                                                <th className="pb-3 font-bold">Department</th>
                                                <th className="pb-3 font-bold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {users.slice(0, 10).map((u: any) => (
                                                <tr key={u._id} className="group hover:bg-gray-50">
                                                    <td className="py-3">
                                                        <div>
                                                            <p className="font-bold">{u.name}</p>
                                                            <p className="text-xs text-gray-500">{u.email}</p>
                                                            {u.isSuspended && (
                                                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">SUSPENDED</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border border-black ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                            u.role === 'faculty' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {u.role.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-sm">{u.department}</td>
                                                    <td className="py-3">
                                                        <div className="flex gap-2">
                                                            <Button size="icon" variant="ghost" onClick={() => handleEditUser(u)} title="Edit User">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" onClick={() => handleMessageUser(u)} title="Message User">
                                                                <MessageSquare className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" onClick={() => handleFollowUser(u._id)} title="Follow User">
                                                                <UserPlus className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {activeTab === 'pending' && (
                            <>
                                <h2 className="text-2xl font-bold mb-4">Pending Faculty Approvals</h2>
                                {pendingFaculty.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                        <p>No pending approvals. All caught up!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingFaculty.map((faculty: any) => (
                                            <div key={faculty._id} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-black transition-all">
                                                <div>
                                                    <p className="font-bold text-lg">{faculty.name}</p>
                                                    <p className="text-gray-600">{faculty.email}</p>
                                                    <p className="text-sm text-gray-500">{faculty.department} • {faculty.college}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleVerifyFaculty(faculty._id)}
                                                        className="bg-green-500 hover:bg-green-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                    >
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'messages' && (
                            <>
                                <h2 className="text-2xl font-bold mb-4">Contact Messages</h2>
                                {contactMessages.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p>No messages yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {contactMessages.map((msg: any) => (
                                            <div key={msg._id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-black transition-all bg-white">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg">{msg.firstName} {msg.lastName}</h3>
                                                        <a href={`mailto:${msg.email}`} className="text-blue-600 hover:underline text-sm">{msg.email}</a>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteMessage(msg._id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap">
                                                    {msg.message}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'blacklist' && (
                            <>
                                <h2 className="text-2xl font-bold mb-4">Blacklist Management</h2>
                                <div className="flex gap-4 mb-6">
                                    <Input
                                        placeholder="Add word to blacklist..."
                                        value={newBlacklistWord}
                                        onChange={(e) => setNewBlacklistWord(e.target.value)}
                                        className="border-2 border-black"
                                    />
                                    <Button onClick={handleAddToBlacklist} className="bg-black text-white hover:bg-gray-800">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {blacklist.map((item: any) => (
                                        <div key={item._id} className="flex items-center gap-2 bg-red-50 border-2 border-red-200 px-3 py-1.5 rounded-lg">
                                            <span className="font-medium text-red-700">{item.word}</span>
                                            <button onClick={() => handleRemoveFromBlacklist(item._id)} className="text-red-400 hover:text-red-600">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {blacklist.length === 0 && (
                                        <p className="text-gray-500 italic">No words in blacklist.</p>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'content' && (
                            <>
                                <h2 className="text-2xl font-bold mb-4">Site Content</h2>
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4" />
                                    <p>Content management features coming soon.</p>
                                </div>
                            </>
                        )}

                    </div>

                    <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit">
                        <h2 className="text-2xl font-bold mb-4">System Status</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                                <span className="font-bold">Server Status</span>
                                <span className="text-green-600 font-bold flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    Online
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                                <span className="font-bold">Database</span>
                                <span className="text-green-600 font-bold">Connected</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                                <span className="font-bold">Version</span>
                                <span className="font-bold">v1.0.0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit User Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit User Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="border-2 border-black rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" value={editFormData.username} onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })} className="border-2 border-black rounded-xl" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="border-2 border-black rounded-xl" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={editFormData.role} onValueChange={(val) => setEditFormData({ ...editFormData, role: val })}>
                                        <SelectTrigger className="border-2 border-black rounded-xl">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="faculty">Faculty</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input id="year" value={editFormData.year} onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })} className="border-2 border-black rounded-xl" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="college">College</Label>
                                <Input id="college" value={editFormData.college} onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value })} className="border-2 border-black rounded-xl" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input id="department" value={editFormData.department} onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })} className="border-2 border-black rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="major">Major</Label>
                                    <Input id="major" value={editFormData.major} onChange={(e) => setEditFormData({ ...editFormData, major: e.target.value })} className="border-2 border-black rounded-xl" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" value={editFormData.bio} onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })} className="border-2 border-black rounded-xl" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <Input id="linkedin" value={editFormData.linkedin} onChange={(e) => setEditFormData({ ...editFormData, linkedin: e.target.value })} className="border-2 border-black rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="github">GitHub</Label>
                                    <Input id="github" value={editFormData.github} onChange={(e) => setEditFormData({ ...editFormData, github: e.target.value })} className="border-2 border-black rounded-xl" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio">Portfolio</Label>
                                    <Input id="portfolio" value={editFormData.portfolio} onChange={(e) => setEditFormData({ ...editFormData, portfolio: e.target.value })} className="border-2 border-black rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="twitter">Twitter</Label>
                                    <Input id="twitter" value={editFormData.twitter} onChange={(e) => setEditFormData({ ...editFormData, twitter: e.target.value })} className="border-2 border-black rounded-xl" />
                                </div>
                            </div>

                            <div className="border-t-2 border-gray-100 pt-4 mt-2 space-y-4">
                                <h3 className="font-bold text-lg">Account Actions</h3>
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border-2 border-red-100">
                                    <div>
                                        <Label htmlFor="suspend" className="font-bold text-red-700">Suspend Account</Label>
                                        <p className="text-xs text-red-500">User will not be able to log in</p>
                                    </div>
                                    <Switch
                                        id="suspend"
                                        checked={editFormData.isSuspended}
                                        onCheckedChange={(checked) => setEditFormData({ ...editFormData, isSuspended: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border-2 border-yellow-100">
                                    <div>
                                        <Label htmlFor="verify" className="font-bold text-yellow-700">Email Verified</Label>
                                        <p className="text-xs text-yellow-600">Toggle to force re-verification</p>
                                    </div>
                                    <Switch
                                        id="verify"
                                        checked={editFormData.isEmailVerified}
                                        onCheckedChange={(checked) => setEditFormData({ ...editFormData, isEmailVerified: checked })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleUpdateUser} className="bg-black text-white hover:bg-gray-800 rounded-xl">Save Changes</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Message User Modal */}
                <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Message User</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="message">Message Content</Label>
                                <Textarea id="message" value={messageContent} onChange={(e) => setMessageContent(e.target.value)} placeholder="Type your message here..." />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleSendMessage}>Send Message</Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    )
}
