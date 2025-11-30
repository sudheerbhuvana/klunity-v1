import { User, Heart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function AboutSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-32">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="flex justify-center">
          <div className="relative w-full max-w-lg aspect-square border-[4px] border-black rounded-full overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#2F81F7] shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <div className="text-center text-white p-8">
              <Users className="w-32 h-32 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-2xl font-bold">10,000+</p>
              <p className="text-lg">Students Connected</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              A platform built for{" "}
              <span className="bg-[#2F81F7] text-white px-3 py-1 inline-block">
                real stories
              </span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              We believe every student's journey is unique and valuable. KL Unity is a safe space
              where you can share your authentic experiences, connect with peers who get it, and find
              support when you need it most.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-5 h-5 bg-[#6366F1] border-2 border-black rounded-[5px] flex-shrink-0 mt-1"></div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Safe & Supportive Community</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Share your experiences in a judgment-free zone. Our community guidelines ensure everyone feels safe and respected.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-5 h-5 bg-[#FF6B7A] border-2 border-black rounded-[5px] flex-shrink-0 mt-1"></div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Real Students, Real Stories</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  No filters, no fake personas. Just authentic experiences from college students navigating life, academics, and everything in between.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-5 h-5 bg-[#FFC224] border-2 border-black rounded-[5px] flex-shrink-0 mt-1"></div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-2">Find Your People</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Connect with students who share similar experiences, interests, or challenges. You're never alone in your journey.
                </p>
              </div>
            </div>
          </div>

          <Link to="/signup">
            <Button className="bg-[#0B0B0B] text-white hover:bg-black/90 rounded-lg py-5 px-8 md:py-[22px] md:px-[62px] text-base md:text-lg font-semibold h-auto w-full sm:w-auto sm:min-w-[240px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Heart className="w-5 h-5 mr-2" />
              Join the Community
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
