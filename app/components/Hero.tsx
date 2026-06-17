"use client";
import { ArrowRight, Play, CheckCircle2, MessageCircle, Zap, Shield, TrendingUp } from "lucide-react";

const trustBadges = [
  { icon: <MessageCircle className="w-4 h-4" />, label: "Official WhatsApp API" },
  { icon: <Zap className="w-4 h-4" />, label: "Smart Automation" },
  { icon: <Shield className="w-4 h-4" />, label: "Secure & Reliable" },
  { icon: <TrendingUp className="w-4 h-4" />, label: "Scale Your Business" },
];

const stats = [
  { value: "500+", label: "Happy Clients" },
  { value: "1M+", label: "Messages Delivered" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "Client Rating" },
];

// WhatsApp Phone Mockup Component
function PhoneMockup() {
  return (
    <div className="relative w-[260px] sm:w-[280px] mx-auto">
      {/* Phone shell */}
      <div
        className="relative bg-[#111827] rounded-[36px] p-3 shadow-phone"
        style={{ aspectRatio: "9/19" }}
      >
        {/* Screen */}
        <div className="relative bg-[#ECE5DD] rounded-[28px] overflow-hidden h-full flex flex-col">
          {/* Status bar */}
          <div className="bg-[#075E54] px-4 pt-3 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white text-xs font-bold">YB</div>
              <div className="flex-1">
                <p className="text-white text-xs font-semibold">Your Business ✓</p>
                <p className="text-green-200 text-[10px]">Online</p>
              </div>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
              </div>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 px-3 py-3 space-y-2 overflow-hidden">
            {/* Received */}
            <div className="flex justify-start">
              <div className="chat-bubble-received px-3 py-2 max-w-[80%] shadow-bubble">
                <p className="text-xs text-gray-800">Hi, I want to know about your services.</p>
                <p className="text-[9px] text-gray-400 text-right mt-0.5">10:30 AM</p>
              </div>
            </div>

            {/* Sent auto-reply */}
            <div className="flex justify-end">
              <div className="chat-bubble-sent px-3 py-2 max-w-[85%] shadow-bubble">
                <p className="text-xs text-gray-800">Hello! 😊</p>
                <p className="text-xs text-gray-800">Thanks for contacting us.</p>
                <p className="text-xs text-gray-800 mt-1">Here are our services:</p>
                <ul className="text-[10px] text-gray-700 mt-1 space-y-0.5">
                  <li>• WhatsApp API Integration</li>
                  <li>• Chatbot Automation</li>
                  <li>• Bulk Messaging</li>
                  <li>• CRM Integration</li>
                </ul>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-gray-400">10:31 AM</span>
                  <span className="text-brand-teal text-[10px]">✓✓</span>
                </div>
              </div>
            </div>

            {/* Another received */}
            <div className="flex justify-start">
              <div className="chat-bubble-received px-3 py-2 max-w-[75%] shadow-bubble">
                <p className="text-xs text-gray-800">Can I get a demo?</p>
                <p className="text-[9px] text-gray-400 text-right mt-0.5">10:32 AM</p>
              </div>
            </div>

            {/* Sent */}
            <div className="flex justify-end">
              <div className="chat-bubble-sent px-3 py-2 max-w-[80%] shadow-bubble">
                <p className="text-xs text-gray-800">Absolutely! Click the link below to book a free demo 🎯</p>
                <div className="mt-1.5 bg-white/60 rounded-lg p-1.5">
                  <p className="text-[10px] text-brand-teal font-medium">📅 Book Free Demo →</p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-gray-400">10:32 AM</span>
                  <span className="text-brand-teal text-[10px]">✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5">
              <p className="text-[10px] text-gray-400">Type a message</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-brand-teal flex items-center justify-center">
              <div className="w-3 h-3 text-white">🎙</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification card */}
      <div className="absolute -top-4 -right-8 sm:-right-12 bg-white rounded-2xl px-3 py-2.5 shadow-card border border-green-100 animate-float w-44">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[10px] font-semibold text-gray-700">Order Confirmed!</span>
        </div>
        <p className="text-[9px] text-gray-500">Hi Alex, your order #12345 has been confirmed.</p>
        <p className="text-[8px] text-gray-400 mt-1">10:30 AM</p>
      </div>

      {/* Auto reply badge */}
      <div className="absolute -bottom-2 -left-8 sm:-left-14 bg-white rounded-2xl px-3 py-2.5 shadow-card border border-green-100 animate-float-delay w-40">
        <p className="text-[9px] font-semibold text-brand-dark mb-1">⚡ Auto Reply</p>
        <p className="text-[9px] text-gray-500">Hi 👋 Thanks for reaching out. How can we help you?</p>
      </div>

      {/* Delivered badge */}
      <div className="absolute top-1/2 -right-6 sm:-right-10 transform -translate-y-1/2 bg-white rounded-xl px-3 py-2 shadow-card border border-green-100 animate-float" style={{ animationDelay: "1s" }}>
        <p className="text-[9px] font-semibold text-gray-600">Broadcast</p>
        <p className="text-lg font-bold gradient-text">98%</p>
        <p className="text-[8px] text-gray-400">Delivered</p>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-hero-gradient overflow-hidden noise-overlay pt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-teal/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-50/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* LEFT: Content */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white border border-green-200 text-brand-dark text-xs font-semibold px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse-green" />
              Official WhatsApp Business API Partner
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="font-display font-900 text-5xl sm:text-6xl lg:text-6xl xl:text-7xl leading-[1.05] text-gray-900 text-balance">
                Connect.{" "}
                <span className="text-gray-900">Automate.</span>
              </h1>
              <h1 className="font-display font-900 text-5xl sm:text-6xl lg:text-6xl xl:text-7xl leading-[1.05]">
                Grow with{" "}
                <span className="relative">
                  <span className="gradient-text">WhatsApp API</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="8"
                    viewBox="0 0 200 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 6C40 2 80 1 100 2C120 3 160 4 198 6"
                      stroke="#25D366"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
              Powerful WhatsApp Business API integration to automate conversations, engage customers at scale, and grow your business — all from one smart platform.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                  <span className="text-brand-green">{badge.icon}</span>
                  {badge.label}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://app.macropage.in/register"
                className="group flex items-center gap-2 px-7 py-4 bg-brand-green text-white font-semibold text-base rounded-2xl shadow-lg hover:bg-brand-teal transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#features"
                className="flex items-center gap-2 px-6 py-4 bg-white text-gray-700 font-semibold text-base rounded-2xl border border-gray-200 hover:border-brand-green hover:text-brand-dark transition-all duration-200 shadow-sm"
              >
                <Play className="w-4 h-4 text-brand-green" />
                See How It Works
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {["#4F46E5", "#059669", "#DC2626", "#D97706"].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {["S", "R", "A", "M"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                  {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Trusted by <strong className="text-gray-700">500+ businesses</strong> across India</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Phone mockup */}
          <div className="flex justify-center lg:justify-end items-center py-12 lg:py-0">
            <div className="relative">
              {/* Background circle glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 to-brand-teal/10 rounded-full blur-3xl scale-110" />

              {/* Integration panel — top right */}
              <div className="absolute -top-4 right-0 bg-white rounded-2xl p-3 shadow-card border border-green-50 animate-float" style={{ animationDelay: "0.5s" }}>
                <p className="text-[10px] font-semibold text-gray-500 mb-2">Integrate Seamlessly</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { emoji: "🗂️", label: "CRM" },
                    { emoji: "🤖", label: "Chatbot" },
                    { emoji: "⚙️", label: "API" },
                    { emoji: "📊", label: "Sheets" },
                    { emoji: "🔗", label: "Webhooks" },
                    { emoji: "•••", label: "More" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-0.5">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-base">
                        {item.emoji}
                      </div>
                      <span className="text-[8px] text-gray-500">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <PhoneMockup />

              {/* Trusted businesses badge - bottom right */}
              <div className="absolute -bottom-2 right-0 bg-white rounded-2xl px-3 py-2 shadow-card border border-green-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700">Trusted Worldwide</p>
                    <p className="text-[9px] text-gray-500">500+ Clients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 lg:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-green-100 rounded-3xl overflow-hidden shadow-card">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white px-6 py-6 text-center hover:bg-green-50 transition-colors"
            >
              <p className="font-display font-800 text-3xl gradient-text">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
