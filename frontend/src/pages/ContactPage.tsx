import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react"
import { contactAPI } from "@/lib/api"
import { toast } from "sonner"

export function ContactPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
            toast.error("Please fill in all fields")
            return
        }

        setIsLoading(true)
        try {
            await contactAPI.sendMessage(formData)
            toast.success("Message sent successfully! We'll get back to you soon.")
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                message: ''
            })
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send message")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="container mx-auto px-4 py-12 md:py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Get in Touch</h1>
                        <p className="text-xl text-gray-600">
                            Have a question, suggestion, or just want to say hi? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="bg-blue-50 p-8 rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-black">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Email Us</p>
                                            <a href="mailto:klunity@zeroonedevs.in" className="text-gray-600 hover:text-black">klunity@zeroonedevs.in</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-black">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Call Us</p>
                                            <a href="tel:+919999999999" className="text-gray-600 hover:text-black">+91-9999999999</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-black">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Location</p>
                                            <p className="text-gray-600">Vijayawada, India</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-8 rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <h3 className="text-2xl font-bold mb-4">Join the Community</h3>
                                <p className="text-gray-600 mb-6">
                                    Follow us on social media to stay updated with the latest stories and events.
                                </p>
                                <div className="flex gap-4">
                                    {/* Social Icons Placeholder */}
                                    <div className="w-10 h-10 bg-black rounded-full"></div>
                                    <div className="w-10 h-10 bg-black rounded-full"></div>
                                    <div className="w-10 h-10 bg-black rounded-full"></div>
                                </div>
                            </div>

                            <div className="bg-purple-50 p-8 rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <h3 className="text-2xl font-bold mb-6">Developer Profile</h3>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-black bg-white flex-shrink-0">
                                        <img
                                            src="/images/design-mode/83955438.png"
                                            alt="Developer"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback if image not found
                                                (e.target as HTMLImageElement).src = "https://github.com/shadcn.png"
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-gray-900">Student Developer</p>
                                        <p className="text-gray-600 font-mono">ID: 2400080210</p>
                                        <p className="text-sm text-gray-500 mt-1">Full Stack Developer</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 rounded-3xl border-3 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="font-bold text-sm">First Name</label>
                                        <Input
                                            placeholder="John"
                                            className="border-2 border-black rounded-xl h-12"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-bold text-sm">Last Name</label>
                                        <Input
                                            placeholder="Doe"
                                            className="border-2 border-black rounded-xl h-12"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-sm">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="border-2 border-black rounded-xl h-12"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-sm">Message</label>
                                    <Textarea
                                        placeholder="Tell us what's on your mind..."
                                        className="border-2 border-black rounded-xl min-h-[150px]"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-xl font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
