"use client";
import { Award, Heart, Globe, Headphones, Code2, ShieldCheck } from "lucide-react";

const whyUs = [
  {
    icon: <Award className="w-5 h-5" />,
    title: "Official Meta Business Partner",
    desc: "We work directly with Meta to provide you access to the official WhatsApp Business API — no gray areas, no compliance risk.",
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    title: "Built by Developers, for Businesses",
    desc: "Our team of engineers has deep API expertise. We don't just resell tools — we build reliable infrastructure from the ground up.",
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "Real Human Support",
    desc: "You'll never be stuck with a chatbot helpdesk. Our team responds within hours and actually helps you solve problems.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Enterprise-Grade Security",
    desc: "SOC-2 aligned security practices, encrypted message storage, and strict data handling policies you can trust.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "India-First Infrastructure",
    desc: "Servers in Mumbai ensure low latency for Indian customers. Built for Razorpay payments, Indian GST, and regional compliance.",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Customer-Obsessed Culture",
    desc: "Our success is measured by your results. We actively track your campaign performance and proactively suggest improvements.",
  },
];

const teamValues = [
  { emoji: "🏗️", title: "Reliability First", desc: "99.9% uptime SLA backed by redundant infrastructure" },
  { emoji: "🔄", title: "Constant Innovation", desc: "New features shipped every month based on customer feedback" },
  { emoji: "🌱", title: "Startup Friendly", desc: "Pricing designed to grow with you from Day 1 to Series A" },
  { emoji: "🤝", title: "Long-term Partners", desc: "We're not a vendor — we're invested in your growth" },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* About block */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 text-brand-dark text-xs font-semibold px-4 py-2 rounded-full border border-green-200 mb-6">
              👋 About Macropage Connect
            </div>
            <h2 className="font-display font-800 text-4xl sm:text-5xl text-gray-900 leading-tight mb-6">
              We help businesses{" "}
              <span className="gradient-text">talk to customers</span>{" "}
              where they already are
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Macropage Connect was built out of a simple observation: businesses across India were spending thousands on email campaigns nobody read, while their customers were already on WhatsApp — checking messages within minutes.
            </p>
            <p className="text-gray-500 leading-relaxed mb-6">
              We set out to build the most reliable, easy-to-use WhatsApp Business API platform in India — one that gives any business from a local retailer to a funded startup — the same tools that Fortune 500 companies use to engage customers.
            </p>
            <div className="flex flex-wrap gap-4">
              {teamValues.map((v) => (
                <div key={v.title} className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-100">
                  <span className="text-xl">{v.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{v.title}</p>
                    <p className="text-[10px] text-gray-500">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual: conversation mockup */}
          <div className="relative bg-gray-50 rounded-3xl p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-60" />
            <div className="relative space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Business Conversation
              </div>
              {[
                { sender: "Customer", msg: "Hi! Is my order shipped yet?", align: "left" },
                { sender: "Bot", msg: "Hi Rahul! 👋 Yes, your order #8821 was shipped today. Track it here 📦", align: "right" },
                { sender: "Customer", msg: "Awesome, thanks! What's the delivery date?", align: "left" },
                { sender: "Bot", msg: "Expected by December 18th to your Pune address. Need anything else?", align: "right" },
                { sender: "Customer", msg: "That's great, you guys are quick! 😊", align: "left" },
                { sender: "Bot", msg: "Happy to help! Rate your experience ⭐⭐⭐⭐⭐", align: "right" },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.align === "right" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-bubble ${
                      msg.align === "right"
                        ? "chat-bubble-sent text-gray-800"
                        : "chat-bubble-received text-gray-800"
                    }`}
                  >
                    <p className={`text-[9px] font-semibold mb-0.5 ${msg.align === "right" ? "text-brand-teal" : "text-gray-400"}`}>
                      {msg.sender}
                    </p>
                    {msg.msg}
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 right-4 bg-white rounded-xl px-3 py-1.5 shadow-sm border border-green-100">
              <p className="text-[9px] font-semibold text-gray-500">⚡ Automated · <span className="text-brand-green">Instant</span></p>
            </div>
          </div>
        </div>

        {/* Why choose us */}
        <div>
          <div className="text-center mb-12">
            <h2 className="font-display font-800 text-4xl text-gray-900 mb-3">
              Why teams choose <span className="gradient-text">Macropage Connect</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Dozens of WhatsApp tools exist. Here's why smart businesses choose us.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyUs.map((item) => (
              <div key={item.title} className="group bg-gray-50 hover:bg-white rounded-3xl p-6 border border-gray-100 hover:border-green-200 hover:shadow-card transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-dark to-brand-green rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md">
                  {item.icon}
                </div>
                <h3 className="font-display font-700 text-base text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
