"use client";
import { MessageCircle, Mail, Phone, MapPin, Globe, Share2, AtSign, Code2 } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#" },
    { label: "API Docs", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press Kit", href: "#" },
    { label: "Partners", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Sales", href: "mailto:hello@macropage.in" },
    { label: "Status Page", href: "#" },
    { label: "Community", href: "#" },
    { label: "WhatsApp Us", href: "https://wa.me/917000000000" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "https://www.macropageconnect.com/privacy-policy" },
    { label: "Terms of Service", href: "https://www.macropageconnect.com/terms-of-service" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
};

const socials = [
  { icon: <Share2 className="w-4 h-4" />, href: "#", label: "Twitter / X" },
  { icon: <Globe className="w-4 h-4" />, href: "#", label: "LinkedIn" },
  { icon: <AtSign className="w-4 h-4" />, href: "#", label: "Instagram" },
  { icon: <Code2 className="w-4 h-4" />, href: "#", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-dark to-brand-green flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-display font-bold text-xl text-white">macro</span>
                <span className="font-display font-bold text-xl text-brand-green">page</span>
                <span className="font-display text-sm text-gray-500 ml-1">connect</span>
              </div>
            </a>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              The official WhatsApp Business API platform for Indian businesses. Automate, engage, and grow.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5">
              <a href="mailto:hello@macropage.in" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green transition-colors">
                <Mail className="w-4 h-4" />
                hello@macropage.in
              </a>
              <a href="tel:+917000000000" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green transition-colors">
                <Phone className="w-4 h-4" />
                +91 70000 00000
              </a>
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Nagpur, Maharashtra, India
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-2 mt-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-brand-green flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links cols */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-gray-500 hover:text-brand-green transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Macropage Connect. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
              All systems operational
            </span>
            <span>·</span>
            <span>Made with ❤️ in India</span>
          </div>
          <p className="text-xs text-gray-600">
            Official WhatsApp Business Solution Provider
          </p>
        </div>
      </div>
    </footer>
  );
}
