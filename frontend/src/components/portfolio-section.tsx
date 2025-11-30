import { ArrowRight, Heart, MessageCircle, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"

export function PortfolioSection() {
  const stories = [
    {
      title: "From Anxiety to Confidence: My Public Speaking Journey",
      description:
        "How I went from dreading presentations to actually enjoying them. Sharing the techniques and mindset shifts that helped me overcome my fear.",
      tag: "Personal Growth",
      author: "Bhuvana Sudheer",
      major: "CSE HTE",
      bgColor: "bg-[#6366F1]",
      reactions: { hearts: 234, comments: 45 }
    },
    {
      title: "Balancing Part-Time Work and Full-Time Studies",
      description:
        "Real talk about managing a 20-hour work week while maintaining good grades. Tips, struggles, and what I wish I knew earlier.",
      tag: "Student Life",
      author: "Kushaal Nayak",
      major: "CSE HTE",
      bgColor: "bg-[#2F81F7]",
      reactions: { hearts: 189, comments: 67 }
    },
  ]

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Featured{" "}
            <span className="bg-[#FFC224] text-black px-3 py-1 inline-block">
              student stories
            </span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Real experiences from students just like you. Get inspired, find support, and know you're not alone.
          </p>
        </div>

        <div className="space-y-8 mb-12">
          {stories.map((story, index) => (
            <div
              key={index}
              className="group grid md:grid-cols-2 bg-white border-[3px] border-black rounded-[32px] overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className="p-6 md:p-12 flex flex-col justify-center bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#6366F1] border-2 border-black"></div>
                  <div>
                    <p className="font-bold text-sm">{story.author}</p>
                    <p className="text-xs text-gray-600">{story.major}</p>
                  </div>
                </div>

                <span className="inline-block bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 w-fit">
                  {story.tag}
                </span>

                <h3 className="text-xl md:text-[28px] font-bold mb-4 leading-tight md:leading-[40px] text-[#0B0B0B]">
                  {story.title}
                </h3>

                <p className="text-base md:text-[18px] text-[#393939] mb-6 leading-relaxed md:leading-[30px] font-medium">
                  {story.description}
                </p>

                <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>{story.reactions.hearts}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>{story.reactions.comments}</span>
                  </div>
                </div>

                <a
                  href="#"
                  className="flex items-center gap-2 font-semibold text-[#0B0B0B] hover:gap-3 transition-all text-sm md:text-base"
                >
                  Read full story
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className={`${story.bgColor} relative overflow-hidden min-h-[250px] md:min-h-[500px] flex items-center justify-center`}>
                <div className="text-white text-center p-8">
                  <TrendingUp className="w-24 h-24 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-lg font-bold">Inspiring Story</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link to="/signup">
            <button className="bg-black text-white px-6 md:px-8 py-4 md:py-5 rounded-[12px] font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto text-sm md:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Heart className="w-5 h-5" />
              Share Your Story
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
