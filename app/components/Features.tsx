"use client";
import {
  MessageSquare, Zap, BarChart3, Users, Bot, Send,
  Inbox, Globe, Lock, Layers, Bell, RefreshCw,
} from "lucide-react";

const features = [
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI-Powered Chatbot",
    description: "Build intelligent chatbots that handle FAQs, qualify leads, and route conversations 24/7 without human intervention.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    tag: "Popular",
  },
  {
    icon: <Send className="w-6 h-6" />,
    title: "Bulk Broadcast Campaigns",
    description: "Send personalized WhatsApp campaigns to thousands of opted-in contacts with real-time delivery tracking.",
    color: "from-brand-teal to-brand-green",
    bg: "bg-green-50",
    tag: "Core",
  },
  {
    icon: <Inbox className="w-6 h-6" />,
    title: "Unified Team Inbox",
    description: "Multiple agents can handle WhatsApp conversations simultaneously from a single shared inbox with assignment rules.",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    tag: null,
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Message Templates",
    description: "Create and manage Meta-approved message templates for transactional notifications, alerts, and marketing.",
    color: "from-orange-400 to-orange-600",
    bg: "bg-orange-50",
    tag: null,
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analytics & Reports",
    description: "Track delivery rates, open rates, response times, and agent performance with detailed dashboards.",
    color: "from-pink-500 to-rose-600",
    bg: "bg-pink-50",
    tag: null,
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Contact Management",
    description: "Segment contacts with custom labels, manage opt-ins/outs, and sync with your CRM automatically.",
    color: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50",
    tag: null,
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: "Workflow Automation",
    description: "Design no-code automation flows triggered by messages, keywords, or events to respond instantly.",
    color: "from-brand-dark to-brand-teal",
    bg: "bg-emerald-50",
    tag: "New",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "API & Webhooks",
    description: "Connect Macropage Connect to any tool via our REST API and webhooks. Integrate with Zapier, Sheets, Shopify, and more.",
    color: "from-indigo-500 to-violet-600",
    bg: "bg-indigo-50",
    tag: null,
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Enterprise Security",
    description: "End-to-end encryption, role-based access control, audit logs, and GDPR-compliant data handling.",
    color: "from-slate-600 to-gray-700",
    bg: "bg-slate-50",
    tag: null,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-green-50 text-brand-dark text-xs font-semibold px-4 py-2 rounded-full border border-green-200">
            ⚡ Everything You Need
          </div>
          <h2 className="font-display font-800 text-4xl sm:text-5xl text-gray-900">
            One platform,{" "}
            <span className="gradient-text">infinite possibilities</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            From automated chatbots to bulk campaigns — Macropage Connect gives you every tool to turn WhatsApp into your highest-converting sales channel.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Background glow on hover */}
              <div className={`absolute inset-0 ${feature.bg} opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-3xl`} />

              <div className="relative">
                {/* Tag */}
                {feature.tag && (
                  <span className="absolute top-0 right-0 text-[10px] font-bold text-white bg-brand-green px-2.5 py-1 rounded-full">
                    {feature.tag}
                  </span>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                <h3 className="font-display font-700 text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://app.macropage.in/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-green text-white font-semibold text-base rounded-2xl shadow-lg hover:bg-brand-teal transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
          >
            Explore All Features Free →
          </a>
        </div>
      </div>
    </section>
  );
}
