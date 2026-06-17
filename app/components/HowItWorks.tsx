"use client";
import { UserPlus, Settings, Send, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <UserPlus className="w-6 h-6" />,
    title: "Sign Up & Connect",
    desc: "Create your account and connect your WhatsApp Business number through our guided setup wizard in under 10 minutes.",
    detail: "No technical knowledge needed. Our step-by-step setup walks you through Meta's embedded signup process.",
  },
  {
    step: "02",
    icon: <Settings className="w-6 h-6" />,
    title: "Configure Your Flows",
    desc: "Set up chatbots, auto-replies, message templates, and automation workflows using our no-code builder.",
    detail: "Drag-and-drop workflow builder, pre-built templates for common use cases, keyword triggers and more.",
  },
  {
    step: "03",
    icon: <Send className="w-6 h-6" />,
    title: "Launch Campaigns",
    desc: "Import your contact list, segment your audience, and send targeted WhatsApp campaigns at scale.",
    detail: "Schedule broadcasts, personalize messages with variables, and A/B test your campaigns.",
  },
  {
    step: "04",
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Track & Optimize",
    desc: "Monitor real-time delivery, open, and response rates. Use insights to continuously improve performance.",
    detail: "Live dashboards, agent performance reports, conversation analytics, and export to CSV.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-green-50 text-brand-dark text-xs font-semibold px-4 py-2 rounded-full border border-green-200">
            🚀 Simple Setup
          </div>
          <h2 className="font-display font-800 text-4xl sm:text-5xl text-gray-900">
            Up and running in{" "}
            <span className="gradient-text">4 simple steps</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            From signup to your first WhatsApp campaign — it takes less than a day.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-0.5 bg-gradient-to-r from-brand-green via-brand-teal to-brand-dark" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.step} className="relative group">
                {/* Step number & icon */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-green flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10">
                      {step.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-brand-green rounded-full flex items-center justify-center text-[10px] font-bold text-brand-dark z-20">
                      {i + 1}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-[10px] font-bold text-brand-green tracking-widest mb-1">STEP {step.step}</div>
                  <h3 className="font-display font-700 text-lg text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{step.desc}</p>
                  <p className="text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-2xl p-3">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <a
            href="https://app.macropage.in/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cta-gradient text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Start Your Free Trial Today →
          </a>
          <p className="text-xs text-gray-400 mt-3">No credit card required · 14-day free trial · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}
