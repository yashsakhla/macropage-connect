"use client";

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Founder, QuickKart",
    company: "E-Commerce",
    avatar: "RS",
    color: "#4F46E5",
    quote: "Macropage Connect transformed our customer communication. Our abandoned cart recovery campaign alone has a 34% recovery rate — way better than email ever did.",
    stars: 5,
  },
  {
    name: "Priya Mehta",
    role: "Marketing Head, EduLeap",
    company: "EdTech",
    avatar: "PM",
    color: "#059669",
    quote: "We send 50,000+ WhatsApp notifications daily for exam results and fee reminders. The delivery rate is 98% and setup took less than a day. Game changer.",
    stars: 5,
  },
  {
    name: "Ankit Joshi",
    role: "CEO, NovaMedica",
    company: "Healthcare",
    avatar: "AJ",
    color: "#DC2626",
    quote: "Patient appointment reminders on WhatsApp reduced our no-show rate by 60%. The automation flows are incredibly easy to set up — even our non-tech team manages them.",
    stars: 5,
  },
  {
    name: "Sunita Rao",
    role: "Operations, PropView Realty",
    company: "Real Estate",
    avatar: "SR",
    color: "#D97706",
    quote: "We close more deals because we follow up faster. Macropage Connect's inbox means no lead slips through the cracks, even when our team is busy.",
    stars: 5,
  },
  {
    name: "Karan Bhatia",
    role: "Digital Head, Spice Trail",
    company: "Food & Hospitality",
    avatar: "KB",
    color: "#7C3AED",
    quote: "Reservation confirmations and order updates through WhatsApp improved our customer satisfaction score by 4 points. The chatbot handles 80% of inquiries automatically.",
    stars: 5,
  },
  {
    name: "Divya Singh",
    role: "Founder, FinEdge",
    company: "FinTech",
    avatar: "DS",
    color: "#0284C7",
    quote: "For a regulated business like ours, reliability and security were non-negotiable. Macropage Connect delivers on both, and the support team is genuinely helpful.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-white text-brand-dark text-xs font-semibold px-4 py-2 rounded-full border border-green-200 shadow-sm">
            ⭐ Trusted by 500+ Businesses
          </div>
          <h2 className="font-display font-800 text-4xl sm:text-5xl text-gray-900">
            Real results from{" "}
            <span className="gradient-text">real businesses</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Don't take our word for it. Here's what our customers say after switching to WhatsApp Business with Macropage Connect.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="bg-white rounded-3xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border border-gray-50 flex flex-col"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5 italic">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[10px] font-semibold text-brand-green bg-green-50 px-2 py-1 rounded-full">
                    {t.company}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
