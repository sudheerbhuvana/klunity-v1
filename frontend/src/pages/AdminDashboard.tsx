import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Check, X, Search, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function AdminDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'blacklist'>('pending')
    const [isLoading, setIsLoading] = useState(true)

    const [pendingFaculty, setPendingFaculty] = useState<any[]>([])
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [blacklist, setBlacklist] = useState<any[]>([])
    const [newBlacklistWord, setNewBlacklistWord] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        if (user && user.role !== 'admin') {
            toast.error("Unauthorized access")
            navigate('/')
            return
        }
        fetchData()
    }, [user, navigate, activeTab])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            if (activeTab === 'pending') {
                const res = await api.get('/admin/faculty/pending')
                setPendingFaculty(res.data.data)
            } else if (activeTab === 'users') {
                const res = await api.get('/admin/users')
                setAllUsers(res.data.data)
            } else if (activeTab === 'blacklist') {
                const res = await api.get('/admin/blacklist')
                setBlacklist(res.data.data)
            }
        } catch (error) {
            console.error("Error fetching admin data:", error)
            toast.error("Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }

    const handleApproveFaculty = async (userId: string) => {
        try {
            await api.put(`/admin/faculty/verify/${userId}`)
            toast.success("Faculty approved successfully")
            setPendingFaculty(prev => prev.filter(u => u._id !== userId))
        } catch (error) {
            toast.error("Failed to approve faculty")
        }
    }

    const handleAddBlacklist = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBlacklistWord.trim()) return

        try {
            const res = await api.post('/admin/blacklist', { word: newBlacklistWord })
            setBlacklist([res.data.data, ...blacklist])
            setNewBlacklistWord("")
            toast.success("Word added to blacklist")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add word")
        }
    }

    const handleDeleteBlacklist = async (id: string) => {
        try {
            await api.delete(`/admin/blacklist/${id}`)
            setBlacklist(prev => prev.filter(item => item._id !== id))
            toast.success("Word removed from blacklist")
        } catch (error) {
            toast.error("Failed to remove word")
        }
    }

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-500 font-medium">Manage your community</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b-2 border-gray-200 pb-1">
                    {[
                        { id: 'pending', label: 'Pending Approvals', icon: AlertTriangle },
                        { id: 'users', label: 'All Users', icon: User },
                        { id: 'blacklist', label: 'Moderation', icon: Shield },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all relative top-[2px]",
                                activeTab === tab.id
                                    ? "bg-white border-2 border-b-0 border-black text-black"
                                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.id === 'pending' && pendingFaculty.length > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                                    {pendingFaculty.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {isLoading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : (
                        <>
                            {/* Pending Faculty Tab */}
                            {activeTab === 'pending' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold mb-4">Pending Faculty Requests</h2>
                                    {pendingFaculty.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No pending requests.</p>
                                    ) : (
                                        <div className="grid gap-4">
                                            {pendingFaculty.map(faculty => (
                                                <div key={faculty._id} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-black transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-lg">
                                                            {faculty.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{faculty.name}</div>
                                                            <div className="text-sm text-gray-500">{faculty.email}</div>
                                                            <div className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-block mt-1">
                                                                {faculty.department}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleApproveFaculty(faculty._id)}
                                                            className="bg-green-500 hover:bg-green-600 text-white font-bold"
                                                        >
                                                            <Check className="w-4 h-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* All Users Tab */}
                            {activeTab === 'users' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold">All Users</h2>
                                        <div className="relative w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                placeholder="Search users..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 border-2 border-black rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b-2 border-black">
                                                <tr>
                                                    <th className="text-left p-3 font-bold">Name</th>
                                                    <th className="text-left p-3 font-bold">Email</th>
                                                    <th className="text-left p-3 font-bold">Role</th>
                                                    <th className="text-left p-3 font-bold">Department</th>
                                                    <th className="text-left p-3 font-bold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map(u => (
                                                    <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="p-3 font-medium">{u.name}</td>
                                                        <td className="p-3 text-gray-600">{u.email}</td>
                                                        <td className="p-3">
                                                            <span className={cn(
                                                                "px-2 py-1 rounded-full text-xs font-bold uppercase",
                                                                u.role === 'admin' ? "bg-purple-100 text-purple-800" :
                                                                    u.role === 'faculty' ? "bg-blue-100 text-blue-800" :
                                                                        "bg-gray-100 text-gray-800"
                                                            )}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">{u.department || '-'}</td>
                                                        <td className="p-3">
                                                            {u.isVerified ? (
                                                                <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                                                                    <Check className="w-3 h-3" /> Verified
                                                                </span>
                                                            ) : (
                                                                <span className="text-orange-500 font-bold text-xs flex items-center gap-1">
                                                                    <AlertTriangle className="w-3 h-3" /> Pending
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Blacklist Tab */}
                            {activeTab === 'blacklist' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-4">Add Forbidden Word</h2>
                                        <form onSubmit={handleAddBlacklist} className="flex gap-4">
                                            <Input
                                                value={newBlacklistWord}
                                                onChange={(e) => setNewBlacklistWord(e.target.value)}
                                                placeholder="Enter word to ban..."
                                                className="max-w-md border-2 border-black rounded-lg"
                                            />
                                            <Button type="submit" className="bg-black text-white font-bold">
                                                Add Word
                                            </Button>
                                        </form>
                                    </div>

                                    <div>
                                        <h3 className="font-bold mb-2">Blacklisted Words ({blacklist.length})</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {blacklist.map(item => (
                                                <div key={item._id} className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium">
                                                    {item.word}
                                                    <button
                                                        onClick={() => handleDeleteBlacklist(item._id)}
                                                        className="hover:text-red-900"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
