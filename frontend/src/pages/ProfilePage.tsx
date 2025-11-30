import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { StoryCard } from "@/components/story-card"
import { UserListModal } from "@/components/user-list-modal"
import { userAPI, storyAPI, socialAPI } from "@/lib/api"
import { logger } from "@/lib/logger"
import { Loader2, MapPin, Calendar, BookOpen, Mail, Linkedin, Github, Globe, Twitter, UserPlus, UserCheck, MessageCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate, useParams } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export function ProfilePage() {
    const navigate = useNavigate()
    const { username } = useParams()
    const { user: currentUser, setUser: setCurrentUser } = useAuth()
    const [user, setUser] = useState<any>(null)
    const [stories, setStories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    // Social State
    const [followers, setFollowers] = useState<any[]>([])
    const [following, setFollowing] = useState<any[]>([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [isRequested, setIsRequested] = useState(false)
    const [socialLoading, setSocialLoading] = useState(false)

    // User List Modal State
    const [userListModal, setUserListModal] = useState({
        isOpen: false,
        title: "",
        users: [] as any[]
    })

    // Edit Profile State
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        name: "",
        username: "",
        bio: "",
        college: "",
        department: "",
        linkedin: "",
        github: "",
        portfolio: "",
        twitter: ""
    })

    useEffect(() => {
        fetchProfileAndStories()
    }, [username, currentUser])

    const fetchProfileAndStories = async () => {
        try {
            setIsLoading(true)
            let userData;

            if (username) {
                const userResponse = await userAPI.getUserByUsername(username)
                userData = userResponse.data.user
            } else {
                const userResponse = await userAPI.getProfile()
                userData = userResponse.data.user
            }

            setUser(userData)

            // Fetch social data
            const [followersRes, followingRes] = await Promise.all([
                socialAPI.getFollowers(userData._id),
                socialAPI.getFollowing(userData._id)
            ])
            setFollowers(followersRes.data)
            setFollowing(followingRes.data)

            // Check relationship if viewing another user
            if (currentUser && userData._id !== currentUser.id) {
                // Ensure we compare strings to avoid type issues
                const amIFollowing = followersRes.data.some((f: any) => f._id.toString() === currentUser.id.toString())
                setIsFollowing(amIFollowing)

                if (!amIFollowing && userData.followRequests?.includes(currentUser.id)) {
                    setIsRequested(true)
                }
            }

            if (!username || (currentUser && currentUser.id === userData._id)) {
                setEditForm({
                    name: userData.name || "",
                    username: userData.username || "",
                    bio: userData.bio || "",
                    college: userData.college || "Koneru Lakshmaiah Education Foundation (KLEF)",
                    department: userData.department || "",
                    linkedin: userData.linkedin || "",
                    github: userData.github || "",
                    portfolio: userData.portfolio || "",
                    twitter: userData.twitter || ""
                })
            }

            const storiesResponse = await storyAPI.getStories({ author: userData._id })
            setStories(storiesResponse.data.stories)

        } catch (err) {
            logger.error('ProfilePage', 'Failed to fetch profile', err)
            setError("Failed to load profile.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleFollow = async () => {
        if (!currentUser) return navigate('/login')
        setSocialLoading(true)
        try {
            if (isFollowing) {
                await socialAPI.unfollow(user._id)
                setIsFollowing(false)
                setFollowers(prev => prev.filter(f => f._id !== currentUser.id))
                toast.success("Unfollowed user")
            } else if (isRequested) {
                await socialAPI.withdraw(user._id)
                setIsRequested(false)
                toast.success("Follow request withdrawn")
            } else {
                await socialAPI.follow(user._id)
                setIsRequested(true)
                toast.success("Follow request sent")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Action failed")
        } finally {
            setSocialLoading(false)
        }
    }

    const handleMessage = () => {
        // Allow messaging if following OR if current user is admin OR if target user is admin (though target admin logic handled in backend usually, frontend should allow click)
        // Actually, for now let's just allow if following or if WE are admin.
        if (!isFollowing && currentUser?.role !== 'admin') {
            toast.error("You must follow this user to send a message")
            return
        }
        navigate(`/messages/${user._id}`)
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

    if (error || !user) {
        return (
            <AppLayout>
                <div className="max-w-2xl mx-auto text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || "Profile not found"}</p>
                    <Button onClick={() => navigate('/feed')} variant="outline">Back to Feed</Button>
                </div>
            </AppLayout>
        )
    }

    const isOwnProfile = !username || (currentUser && currentUser.id === user._id)

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white border-3 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-8">
                    <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 border-b-3 border-black"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="w-24 h-24 bg-white rounded-full border-3 border-black p-1">
                                <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold text-gray-500">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {isOwnProfile ? (
                                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="border-2 border-black font-bold">
                                                Edit Profile
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
                                                <DialogDescription>Make changes to your profile here.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name" className="font-bold">Name</Label>
                                                    <Input id="name" value={editForm.name} disabled className="border-2 border-gray-200 bg-gray-50 rounded-xl" />
                                                    <p className="text-xs text-gray-500">Name cannot be changed</p>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="username" className="font-bold">Username</Label>
                                                    <Input id="username" value={editForm.username} disabled className="border-2 border-gray-200 bg-gray-50 rounded-xl" />
                                                    <p className="text-xs text-gray-500">Username cannot be changed</p>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="bio" className="font-bold">Bio</Label>
                                                    <Textarea id="bio" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="border-2 border-black rounded-xl min-h-[100px]" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="college" className="font-bold">College</Label>
                                                        <Input id="college" value={editForm.college} disabled className="border-2 border-gray-200 bg-gray-50 rounded-xl" />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="department" className="font-bold">Department</Label>
                                                        <Input id="department" value={editForm.department} disabled className="border-2 border-gray-200 bg-gray-50 rounded-xl" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="linkedin" className="font-bold">LinkedIn</Label>
                                                        <Input id="linkedin" value={editForm.linkedin} onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })} className="border-2 border-black rounded-xl" />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="github" className="font-bold">GitHub</Label>
                                                        <Input id="github" value={editForm.github} onChange={(e) => setEditForm({ ...editForm, github: e.target.value })} className="border-2 border-black rounded-xl" />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="portfolio" className="font-bold">Personal Website</Label>
                                                        <Input id="portfolio" value={editForm.portfolio} onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })} className="border-2 border-black rounded-xl" />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="twitter" className="font-bold">Twitter</Label>
                                                        <Input id="twitter" value={editForm.twitter} onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })} className="border-2 border-black rounded-xl" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-2 border-black font-bold">Cancel</Button>
                                                <Button onClick={async () => {
                                                    try {
                                                        setIsSaving(true)
                                                        // Only send editable fields
                                                        const updateData = {
                                                            bio: editForm.bio,
                                                            linkedin: editForm.linkedin,
                                                            github: editForm.github,
                                                            portfolio: editForm.portfolio,
                                                            twitter: editForm.twitter
                                                        }
                                                        const response = await userAPI.updateProfile(updateData)
                                                        setUser(response.data.user)
                                                        setCurrentUser((prev: any) => ({ ...prev, ...response.data.user }))
                                                        setIsEditOpen(false)
                                                        toast.success("Profile updated successfully!")
                                                    } catch (err: any) {
                                                        toast.error(err.response?.data?.message || "Failed to update profile")
                                                    } finally {
                                                        setIsSaving(false)
                                                    }
                                                }} disabled={isSaving} className="bg-black text-white hover:bg-gray-900 border-2 border-black font-bold">
                                                    {isSaving ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleFollow}
                                            disabled={socialLoading}
                                            variant={isFollowing ? "destructive" : "default"}
                                            className={`border-2 border-black font-bold ${!isFollowing ? "bg-[#6366F1] hover:bg-[#5558DD] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-red-500 hover:bg-red-600 text-white"}`}
                                        >
                                            {isFollowing ? (
                                                <>
                                                    <UserCheck className="w-4 h-4 mr-2" />
                                                    Unfollow
                                                </>
                                            ) : isRequested ? (
                                                <>
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Requested (Undo)
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Follow
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={handleMessage}
                                            disabled={!isFollowing}
                                            variant="outline"
                                            className="border-2 border-black font-bold"
                                            title={!isFollowing ? "You must follow this user to message them" : "Send Message"}
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Message
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-3xl font-bold">{user.name}</h1>
                                {user.role === 'faculty' && user.isVerified && (
                                    <div className="bg-blue-100 text-blue-600 p-1 rounded-full" title="Verified Faculty">
                                        <Check className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-500 font-bold text-lg mb-4">
                                @{user.username}
                                <span className="mx-2">•</span>
                                <span className="capitalize">{user.role || 'student'}</span>
                            </p>
                            <p className="text-gray-600 mb-4 max-w-2xl">{user.bio || "No bio yet."}</p>

                            <div className="flex gap-6 mb-6 text-sm font-bold">
                                <div
                                    className="cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => setUserListModal({ isOpen: true, title: "Followers", users: followers })}
                                >
                                    <span className="text-xl">{followers.length}</span> <span className="text-gray-500">Followers</span>
                                </div>
                                <div
                                    className="cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => setUserListModal({ isOpen: true, title: "Following", users: following })}
                                >
                                    <span className="text-xl">{following.length}</span> <span className="text-gray-500">Following</span>
                                </div>
                                <div>
                                    <span className="text-xl">{stories.length}</span> <span className="text-gray-500">Stories</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                                {user.college && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{user.college}</div>}
                                {user.department && <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{user.department}</div>}
                                <div className="flex items-center gap-1"><Mail className="w-4 h-4" />{user.username}@kluniversity.in</div>
                                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined {new Date(user.createdAt).getFullYear()}</div>
                            </div>

                            {/* Social Media Links */}
                            <div className="flex gap-4 mt-4">
                                {user.linkedin && <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0077b5]"><Linkedin className="w-6 h-6" /></a>}
                                {user.github && <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black"><Github className="w-6 h-6" /></a>}
                                {user.portfolio && <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600"><Globe className="w-6 h-6" /></a>}
                                {user.twitter && <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1DA1F2]"><Twitter className="w-6 h-6" /></a>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User's Stories */}
                <h2 className="text-2xl font-bold mb-6">Stories</h2>
                {stories.length === 0 ? (
                    <div className="text-center py-12 bg-white border-3 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-xl font-bold mb-2">No stories yet</h3>
                        <p className="text-gray-500 mb-6">This user hasn't shared any stories yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {stories.map((story) => (
                            <StoryCard key={story._id} story={story} onClick={() => navigate(`/story/${story._id}`)} />
                        ))}
                    </div>
                )}
            </div>

            <UserListModal
                isOpen={userListModal.isOpen}
                onClose={() => setUserListModal(prev => ({ ...prev, isOpen: false }))}
                title={userListModal.title}
                users={userListModal.users}
            />
        </AppLayout>
    )
}
