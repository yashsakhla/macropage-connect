"use client";
import { TrendingUp, MessageCircle, Clock, Users, Star, Smartphone } from "lucide-react";

const reasons = [
  {
    icon: <Users className="w-5 h-5" />,
    stat: "2B+",
    label: "Active Users Globally",
    desc: "WhatsApp reaches more than 2 billion people every month — your customers are already there.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    stat: "98%",
    label: "Message Open Rate",
    desc: "Compared to just 20% for email — WhatsApp messages get read almost every single time.",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    stat: "3 min",
    label: "Average Response Time",
    desc: "Customers expect and respond to WhatsApp messages far faster than any other channel.",
  },
  {
    icon: <Star className="w-5 h-5" />,
    stat: "40%",
    label: "Higher Conversion Rate",
    desc: "Businesses using WhatsApp for customer engagement see significantly higher sales conversion.",
  },
];

const useCases = [
  { emoji: "🛒", title: "E-Commerce", desc: "Order confirmations, shipping updates, abandoned cart recovery" },
  { emoji: "🏥", title: "Healthcare", desc: "Appointment reminders, prescription alerts, patient support" },
  { emoji: "🏦", title: "Banking & Finance", desc: "Transaction alerts, loan updates, customer verification" },
  { emoji: "🎓", title: "Education", desc: "Fee reminders, exam results, admission notifications" },
  { emoji: "🏢", title: "Real Estate", desc: "Property updates, site visit scheduling, lead follow-ups" },
  { emoji: "🍽️", title: "Food & Hospitality", desc: "Reservations, order status, feedback collection" },
];

export default function WhyWhatsApp() {
  return (
    <section id="why-whatsapp" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-white text-brand-dark text-xs font-semibold px-4 py-2 rounded-full border border-green-200 shadow-sm">
            📈 The Numbers Don't Lie
          </div>
          <h2 className="font-display font-800 text-4xl sm:text-5xl text-gray-900">
            Why WhatsApp is the{" "}
            <span className="gradient-text">future of marketing</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Businesses that switch to WhatsApp marketing see immediate results. Here's why the world's top brands are making the move.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {reasons.map((r) => (
            <div key={r.label} className="bg-white rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-brand-green mx-auto mb-3">
                {r.icon}
              </div>
              <p className="font-display font-900 text-4xl gradient-text">{r.stat}</p>
              <p className="font-semibold text-gray-800 text-sm mt-1">{r.label}</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Comparison: WhatsApp vs Others */}
        <div className="bg-white rounded-3xl p-8 shadow-card mb-16">
          <h3 className="font-display font-700 text-2xl text-gray-900 mb-6 text-center">
            WhatsApp vs Traditional Channels
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Metric</th>
                  <th className="py-3 px-4 text-center font-semibold text-brand-dark bg-green-50 rounded-t-xl">
                    <span className="flex items-center justify-center gap-1">
                      <MessageCircle className="w-4 h-4 text-brand-green" />
                      WhatsApp
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center text-gray-400 font-medium">Email</th>
                  <th className="py-3 px-4 text-center text-gray-400 font-medium">SMS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Open Rate", "98%", "20%", "45%"],
                  ["Click-through Rate", "45-60%", "2-5%", "6-8%"],
                  ["Response Rate", "40%+", "6%", "10%"],
                  ["Delivery Speed", "Instant", "Variable", "Seconds"],
                  ["Rich Media Support", "✓ Full", "✓ Limited", "✗ No"],
                  ["Conversational", "✓ Yes", "✗ No", "✗ No"],
                ].map(([metric, wa, email, sms]) => (
                  <tr key={metric} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600 font-medium">{metric}</td>
                    <td className="py-3 px-4 text-center font-semibold text-brand-dark bg-green-50">{wa}</td>
                    <td className="py-3 px-4 text-center text-gray-400">{email}</td>
                    <td className="py-3 px-4 text-center text-gray-400">{sms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <h3 className="font-display font-700 text-2xl text-gray-900 text-center mb-8">
            Works for every industry
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {useCases.map((uc) => (
              <div key={uc.title} className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-card transition-all hover:-translate-y-1 duration-200 border border-gray-100">
                <div className="text-3xl mb-2">{uc.emoji}</div>
                <p className="font-semibold text-sm text-gray-800">{uc.title}</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
