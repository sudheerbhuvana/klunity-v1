import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Users, Target, Heart } from "lucide-react"

export function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="container mx-auto px-4 py-12 md:py-20">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Empowering Student Voices</h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        KL Unity is a platform dedicated to sharing the unique journeys, challenges, and triumphs of students across the globe. We believe every student has a story worth telling.
                    </p>
                </div>

                {/* Mission & Vision */}
                <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
                    <div className="bg-gray-50 p-8 rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 border-2 border-black">
                            <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                        <p className="text-gray-600">
                            To provide a safe and inclusive space for students to express themselves, connect with peers, and find inspiration in shared experiences.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 border-2 border-black">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Our Community</h3>
                        <p className="text-gray-600">
                            A diverse network of students from various disciplines, backgrounds, and cultures, united by the desire to learn and grow together.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6 border-2 border-black">
                            <Heart className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Our Values</h3>
                        <p className="text-gray-600">
                            Authenticity, empathy, and creativity are at the core of everything we do. We celebrate real stories from real people.
                        </p>
                    </div>
                </div>

                {/* Team Section */}
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-12">Meet the Creator</h2>
                    <div className="inline-block">
                        <div className="bg-white p-6 rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm mx-auto">
                            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 border-3 border-black overflow-hidden">
                                <img src="/images/design-mode/83955438.png" alt="Developer" className="w-full h-full object-cover" onError={(e) => {
                                    e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudheer'
                                }} />
                            </div>
                            <h3 className="text-2xl font-bold mb-1">Bhuvana Sudheer</h3>
                            <a href="/user/2400080210" className="block hover:underline text-blue-600 mb-2">
                                <span className="font-bold">ID:</span> 2400080210
                            </a>
                            <p className="text-gray-500 font-medium mb-1">CSE HTE</p>
                            <p className="text-gray-500 font-medium mb-4">Founder & Developer</p>
                            <p className="text-gray-600">
                                Passionate about building communities and technology that brings people together.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
