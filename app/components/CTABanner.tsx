"use client";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-cta-gradient rounded-4xl overflow-hidden px-8 py-16 text-center shadow-2xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

          {/* WhatsApp bubble decorations */}
          <div className="absolute top-6 left-8 bg-white/10 rounded-2xl px-4 py-2.5 hidden sm:block">
            <p className="text-white/80 text-xs">💬 Hi! I want to know more...</p>
          </div>
          <div className="absolute bottom-6 right-8 bg-white/10 rounded-2xl px-4 py-2.5 hidden sm:block">
            <p className="text-white/80 text-xs">✓✓ Order confirmed! Thanks 🎉</p>
          </div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>

            <h2 className="font-display font-800 text-3xl sm:text-5xl text-white mb-4 leading-tight">
              Ready to turn WhatsApp into
              <br />
              your growth engine?
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
              Join 500+ businesses already using Macropage Connect to automate conversations, run campaigns, and grow revenue on WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://app.macropage.in/register"
                className="group flex items-center gap-2 px-8 py-4 bg-white text-brand-dark font-semibold text-base rounded-2xl hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Free — 14 Days
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="mailto:hello@macropage.in"
                className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold text-base rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                Talk to Sales
              </a>
            </div>

            <p className="text-green-200/70 text-xs mt-5">
              No credit card required · Cancel anytime · Setup in under 10 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
