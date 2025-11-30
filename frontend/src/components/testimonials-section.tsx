import { Star, Quote } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Bhuvana Sudheer",
      role: "CSE HTE",
      content:
        "This platform helped me realize I wasn't alone in my struggles. Reading others' stories gave me courage to seek help and share my own journey.",
      avatar: "bg-[#6366F1]",
      highlight: true
    },
    {
      name: "Kushaal Nayak",
      role: "CSE HTE",
      content:
        "As a student, I felt lost navigating college. Finding stories from others in similar situations made all the difference. Now I share my experiences to help others!",
      avatar: "bg-[#FF6B7A]",
    },
    {
      name: "Nischal Singana",
      role: "CSE 1",
      content:
        "The connections I've made here are genuine. It's refreshing to have a space where we can be real about the ups and downs of student life without judgment.",
      avatar: "bg-[#FFC224]",
    },
  ]

  return (
    <section className="bg-gradient-to-br from-[#F5F5F5] to-[#E5E5FF] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              What students are{" "}
              <span className="bg-[#6366F1] text-white px-3 py-1 inline-block">
                saying
              </span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              Hear from real students about how KL Unity has impacted their college journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white border-[3px] border-black rounded-[24px] p-8 hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  // @ts-ignore
                  testimonial.highlight ? "ring-4 ring-[#6366F1] ring-offset-2" : ""
                  }`}
              >
                <Quote className="w-10 h-10 text-[#6366F1] mb-4" />

                <p className="text-gray-700 text-base leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-100">
                  <div className={`w-12 h-12 rounded-full ${testimonial.avatar} border-2 border-black`}></div>
                  <div>
                    <p className="font-bold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFC224] text-[#FFC224]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
