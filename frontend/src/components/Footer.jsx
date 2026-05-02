import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/Button";

export default function Footer() {
  const year = new Date().getFullYear();

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/sahil.vala.98434/",
      label: "Facebook",
    },
    {
      icon: Instagram,
      href: "https://www.instagram.com/sahil_28_2",
      label: "Instagram",
    },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/sahil-vala-59a26b290/",
      label: "LinkedIn",
    },
  ];

  const footerLinks = [
    {
      title: "Explore",
      links: [
        { label: "Home", to: "/" },
        { label: "Courses", to: "/courses" },
        { label: "About Us", to: "/about" },
        { label: "Contact", to: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
        { label: "Cookie Policy", to: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-border/80 bg-canvas mt-auto pt-16 pb-8 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link
              to="/"
              onClick={handleScrollTop}
              className="flex items-center gap-2 group"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow transition-all duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-ink-100 tracking-tight">
                Study<span className="text-brand-400">Point</span>
              </span>
            </Link>
            <p className="text-ink-400 text-sm leading-relaxed max-w-xs">
              Elevate your skills with our premium e-learning platform. Modern
              courses, expert instructors, and a community of learners.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-surfaceHighlight text-ink-400 hover:text-white hover:bg-brand-500 hover:shadow-glow-hover transition-all duration-300 border border-border/70"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-6">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      onClick={handleScrollTop}
                      className="text-ink-400 hover:text-brand-400 transition-colors text-sm flex items-center gap-2 w-fit group"
                    >
                      <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 h-px bg-brand-400 block" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-ink-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-400 shrink-0 mt-0.5" />
                <span>
                  45 Girnar Society,
                  <br />
                  Surat City, Tech State 394107
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-brand-400 shrink-0" />
                <a
                  href="mailto:support@studypoint.com"
                  className="hover:text-white transition-colors"
                >
                  support@studypoint.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-brand-400 shrink-0" />
                <a
                  href="tel:+919427025075"
                  className="hover:text-white transition-colors"
                >
                  +91 90230 28234
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-ink-600">
            © {year} Study Point. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-ink-600">
            <Link
              to="/privacy"
              className="hover:text-ink-400 transition-colors"
            >
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-ink-400 transition-colors">
              Terms
            </Link>
            <Link
              to="/sitemap"
              className="hover:text-ink-400 transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
