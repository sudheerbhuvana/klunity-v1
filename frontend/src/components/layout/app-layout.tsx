import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
    Home,
    Compass,
    PlusSquare,
    User,
    LogOut,
    Search,
    Menu,
    X,
    TrendingUp,
    MessageCircle,
    Shield
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { NotificationDropdown } from "@/components/notification-dropdown"

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navItems = [
        { icon: Home, label: "Feed", path: "/feed" },
        { icon: Compass, label: "Explore", path: "/explore" },
        { icon: MessageCircle, label: "Messages", path: "/messages" },
        { icon: PlusSquare, label: "Create", path: "/create" },
        { icon: User, label: "Profile", path: "/profile" },
    ]

    if (user?.role === 'admin') {
        navItems.push({ icon: Shield, label: "Admin", path: "/admin" })
    }

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Top Navigation Bar (Mobile & Desktop) */}
            <header className="sticky top-0 z-50 bg-white border-b-2 border-black h-16 px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                    <Link to="/feed" className="flex items-center gap-2">
                        <img src="/images/klunitylogo.png" alt="KL Unity Logo" className="h-12 w-auto object-contain" />
                    </Link>
                </div>

                <div className="flex-1 max-w-md mx-4 hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search stories, students, colleges..."
                            className="pl-10 h-10 border-2 border-black rounded-xl bg-gray-50 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationDropdown />
                    <Link to="/profile" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-black"></div>
                        <span className="font-bold hidden sm:block">{user?.name?.split(' ')[0]}</span>
                    </Link>
                </div>
            </header>

            <div className="flex items-start">
                {/* Sidebar Navigation (Desktop) */}
                <aside className="hidden lg:block w-64 sticky top-16 h-[calc(100vh-4rem)] border-r-2 border-black bg-white p-6 overflow-y-auto no-scrollbar">
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                                        isActive
                                            ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] translate-x-[-2px] translate-y-[-2px]"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            )
                        })}

                        <div className="pt-8 mt-8 border-t-2 border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 w-full transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </nav>

                    {/* Trending Tags Section */}
                    <div className="mt-12">
                        <div className="flex items-center gap-2 mb-4 px-4">
                            <div className="bg-orange-100 p-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <TrendingUp className="w-4 h-4 text-orange-600" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-wider">Trending Now</h3>
                        </div>
                        <div className="space-y-3 px-2">
                            {[
                                { tag: '#CampusLife', count: '2.4k posts', color: 'bg-blue-100' },
                                { tag: '#Internships', count: '1.8k posts', color: 'bg-green-100' },
                                { tag: '#StudyTips', count: '950 posts', color: 'bg-yellow-100' },
                                { tag: '#Events', count: '500 posts', color: 'bg-purple-100' }
                            ].map((item) => (
                                <div key={item.tag} className="group flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <div>
                                        <div className="font-bold text-sm">{item.tag}</div>
                                        <div className="text-xs text-gray-500 font-medium">{item.count}</div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${item.color} border border-black`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Mobile Drawer */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-black p-6">
                            <div className="flex items-center justify-between mb-8">
                                <span className="font-bold text-xl">Menu</span>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <nav className="space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = location.pathname === item.path
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                                                isActive
                                                    ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]"
                                                    : "text-gray-600 hover:bg-gray-100"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 w-full mt-8"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
