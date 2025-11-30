import { Mail, FolderOpen, BookOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"
import { useEffect } from "react"
import { Link } from "react-router-dom"

export function HeroSection() {
  useEffect(() => {
    logger.componentMount('HeroSection')
    logger.info('HeroSection', 'Hero section displayed to user')
    return () => logger.componentUnmount('HeroSection')
  }, [])
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-block bg-[#FFC224] text-black px-4 py-2 rounded-full font-bold text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            ✨ For Students, By Students
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Share Your Story.{" "}
            <span className="bg-[#6366F1] text-white px-3 py-1 inline-block">
              Connect
            </span>{" "}
            with Peers.
          </h1>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            A space where college students share real experiences, discover peer stories,
            and build meaningful connections. Your journey matters — let's explore it together! 🎓
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/signup">
              <Button className="bg-black text-white hover:bg-gray-900 rounded-xl py-6 px-8 text-lg font-bold h-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all w-full sm:w-auto">
                <BookOpen className="w-5 h-5 mr-2" />
                Share Your Story
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-3 border-black rounded-xl py-6 px-8 text-lg font-bold h-auto hover:bg-gray-50 w-full sm:w-auto"
            >
              <Users className="w-5 h-5 mr-2" />
              Explore Stories
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FF6B6B] border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-[#6366F1] border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-[#FFC224] border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-[#2F81F7] border-2 border-white"></div>
            </div>
            <p className="text-sm font-medium text-gray-600">
              Join <span className="font-bold text-black">10,000+</span> students sharing their journey
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="bg-gradient-to-br from-[#FF6B6B] to-[#6366F1] rounded-3xl border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-white rounded-2xl border-3 border-black p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#6366F1] border-2 border-black"></div>
                <div>
                  <p className="font-bold">Bhuvana Sudheer</p>
                  <p className="text-sm text-gray-600">CSE HTE</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "From struggling with imposter syndrome to landing my dream internship —
                this platform helped me connect with others who understood my journey. 💙"
              </p>
              <div className="flex gap-2">
                <span className="bg-[#FFC224] text-black px-3 py-1 rounded-full text-xs font-bold border-2 border-black">
                  #InternshipWin
                </span>
                <span className="bg-[#FF6B7A] text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-black">
                  #RealTalk
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
