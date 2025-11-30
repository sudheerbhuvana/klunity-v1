import { useState } from "react"
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail, Phone, Loader2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { newsletterAPI } from "@/lib/api"
import { toast } from "sonner"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    try {
      await newsletterAPI.subscribe(email)
      toast.success("Successfully subscribed to our newsletter!")
      setEmail("")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to subscribe")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="bg-black text-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16 relative">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-full flex items-center justify-center flex-shrink-0 relative">
                <img src="/images/newsletter-icon.png"
                  alt="Newsletter" className="object-cover"
                />
              </div>

              <div className="w-full flex-1 bg-white border-4 border-black rounded-3xl py-4 px-4 md:py-6 md:px-8 flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-black">Subscribe to our newsletter</h3>
                </div>

                <div className="relative w-full md:w-auto md:min-w-[400px] lg:min-w-[480px]">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="border-4 border-black rounded-xl px-4 md:px-6 h-14 md:h-16 pr-32 md:pr-44 text-base md:text-lg placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 bg-black text-white hover:bg-black/90 rounded-[10px] px-6 md:px-10 text-sm md:text-base font-semibold whitespace-nowrap h-auto"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img src="/images/klunitylogo.png"
                    alt="KL Unity Logo" className="object-cover"
                  />
                </div>
                <span className="text-lg md:text-xl font-bold">KL Unity</span>
              </div>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Connecting students, faculty, and alumni of KL University. Share stories, explore opportunities, and grow together.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-[#2F81F7] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#2F81F7] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#FF6B7A] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#FF6B7A] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#FF6B7A] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Pages</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="/" className="hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/explore" className="hover:text-white transition-colors">
                    Explore
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Utility Pages</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Style Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Start Here
                  </a>
                </li>
                <li>
                  <a href="*" className="hover:text-white transition-colors">
                    404 Not Found
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Password protected
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Licenses
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Contact us</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:klunity@zeroonedevs.in" className="hover:text-white transition-colors">
                    klunity@zeroonedevs.in
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+919999999999" className="hover:text-white transition-colors">
                    +91-9999999999
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p className="mb-2">&copy; {new Date().getFullYear()} KL Unity. All rights reserved.</p>
            <p>
              Designed and developed with <Heart className="w-4 h-4 inline text-red-500 mx-1 fill-current" /> by{" "}
              <a
                href="https://www.linkedin.com/in/sudheerbhuvana/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:text-white transition-colors underline decoration-dotted underline-offset-4"
              >
                Bhuvana Sudheer
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
