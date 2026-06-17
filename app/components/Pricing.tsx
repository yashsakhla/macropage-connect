"use client";
import { CheckCircle2, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Perfect to explore and get started with WhatsApp API.",
    highlight: false,
    cta: "Start Free",
    ctaHref: "https://app.macropage.in/register",
    badge: "14-Day Trial",
    features: [
      "1 WhatsApp Business Number",
      "Up to 1,000 messages/month",
      "Basic Chatbot Builder",
      "Shared Team Inbox",
      "Message Templates (5)",
      "Basic Analytics",
      "Email Support",
    ],
    notIncluded: ["Bulk Broadcasts", "CRM Integration", "API Access", "Dedicated Manager"],
  },
  {
    name: "Growth",
    price: "₹3,499",
    period: "/month",
    desc: "For growing businesses ready to scale their WhatsApp marketing.",
    highlight: true,
    cta: "Start Free Trial",
    ctaHref: "https://app.macropage.in/register",
    badge: "Most Popular",
    features: [
      "3 WhatsApp Business Numbers",
      "Up to 25,000 messages/month",
      "Advanced Chatbot & Flows",
      "Team Inbox (5 agents)",
      "Unlimited Templates",
      "Bulk Broadcast Campaigns",
      "Basic CRM Integration",
      "Full Analytics Dashboard",
      "Priority Email & Chat Support",
    ],
    notIncluded: ["Dedicated Manager", "Custom API Rate Limits"],
  },
  {
    name: "Scale",
    price: "₹8,999",
    period: "/month",
    desc: "For established businesses that need enterprise-grade power.",
    highlight: false,
    cta: "Start Free Trial",
    ctaHref: "https://app.macropage.in/register",
    badge: null,
    features: [
      "Unlimited WhatsApp Numbers",
      "Unlimited Messages",
      "Full Automation Suite",
      "Unlimited Agents",
      "Unlimited Templates",
      "Bulk Broadcasts + Scheduling",
      "Full CRM & API Integration",
      "Advanced Analytics & Reports",
      "Webhooks & Custom Integrations",
      "Dedicated Account Manager",
      "SLA-backed Uptime",
    ],
    notIncluded: [],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-white text-brand-dark text-xs font-semibold px-4 py-2 rounded-full border border-green-200 shadow-sm">
            💰 Simple Pricing
          </div>
          <h2 className="font-display font-800 text-4xl sm:text-5xl text-gray-900">
            Plans that grow{" "}
            <span className="gradient-text">with your business</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no long-term contracts.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "bg-gradient-to-br from-brand-dark via-brand-teal to-brand-green text-white shadow-2xl scale-105"
                  : "bg-white border border-gray-100 shadow-card hover:shadow-card-hover"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute top-4 right-4 text-[10px] font-bold px-3 py-1 rounded-full ${
                    plan.highlight
                      ? "bg-white text-brand-dark"
                      : "bg-brand-green text-white"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="p-7">
                {/* Plan name */}
                <p className={`text-sm font-bold tracking-wide uppercase mb-2 ${plan.highlight ? "text-green-200" : "text-brand-green"}`}>
                  {plan.name}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`font-display font-900 text-4xl ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? "text-green-200" : "text-gray-400"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm mb-6 leading-relaxed ${plan.highlight ? "text-green-100" : "text-gray-500"}`}>
                  {plan.desc}
                </p>

                {/* CTA */}
                <a
                  href={plan.ctaHref}
                  className={`block text-center py-3 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 mb-6 ${
                    plan.highlight
                      ? "bg-white text-brand-dark hover:bg-green-50"
                      : "bg-brand-green text-white hover:bg-brand-teal"
                  }`}
                >
                  {plan.cta}
                </a>

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          plan.highlight ? "text-green-200" : "text-brand-green"
                        }`}
                      />
                      <span className={`text-sm ${plan.highlight ? "text-green-50" : "text-gray-600"}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 opacity-40">
                      <div className="w-4 h-4 flex-shrink-0 mt-0.5 rounded-full border border-current" />
                      <span className={`text-sm line-through ${plan.highlight ? "text-green-100" : "text-gray-400"}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-10 text-center bg-white rounded-3xl p-8 shadow-card border border-green-50">
          <Zap className="w-8 h-8 text-brand-green mx-auto mb-3" />
          <h3 className="font-display font-700 text-xl text-gray-900 mb-2">Need a custom enterprise plan?</h3>
          <p className="text-sm text-gray-500 mb-4">
            High-volume businesses, custom integrations, white-label, and dedicated infrastructure — we've got you covered.
          </p>
          <a
            href="mailto:hello@macropage.in"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-green text-brand-dark font-semibold text-sm rounded-2xl hover:bg-green-50 transition-colors"
          >
            Talk to Our Team →
          </a>
        </div>
      </div>
    </section>
  );
}
