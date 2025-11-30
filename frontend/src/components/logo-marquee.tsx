export function LogoMarquee() {
  const items = [
    "Zero One Code Club X Department of EL&GE",
    "Self Hosted",
    "Privacy First",
  ]

  return (
    <div className="overflow-hidden">
      <div className="relative overflow-hidden bg-black py-12 -rotate-[5deg] mt-32 mb-16 min-w-[120vw] -mx-[10vw] left-0 border-y-4 border-white/10">
        <div className="flex items-center gap-16 animate-marquee whitespace-nowrap">
          {[...items, ...items, ...items, ...items, ...items, ...items].map((text, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-4xl font-black text-white uppercase tracking-tighter italic">
                {text}
              </span>
              <span className="text-4xl text-white/30">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
