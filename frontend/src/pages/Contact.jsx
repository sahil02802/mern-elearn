import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Clock,
  Shield,
  HelpCircle,
  Globe,
  MessageCircle,
  Phone
} from "lucide-react";
import { Card } from "../components/ui/Card";

export default function Contact() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4">
          <MessageCircle size={14} /> Get in Touch
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
          Contact Study Point
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-ink-400">
          We're here to help you succeed. Reach out to us for support, inquiries, or just to say hello.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Contact Info */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full border border-white/5 bg-surface/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Mail className="text-brand-400" /> Contact Channels
            </h3>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surfaceHighlight/50 hover:bg-surfaceHighlight transition-colors">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1">General Support</p>
                  <p className="text-white font-medium">support@studypoint.com</p>
                </div>
                <div className="p-4 rounded-xl bg-surfaceHighlight/50 hover:bg-surfaceHighlight transition-colors">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1">Sales Inquiries</p>
                  <p className="text-white font-medium">sales@studypoint.com</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surfaceHighlight/50 hover:bg-surfaceHighlight transition-colors">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1">Phone (IN)</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Phone size={16} /> +91 (902) 302 8234
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surfaceHighlight/50 hover:bg-surfaceHighlight transition-colors">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1">Response Time</p>
                  <p className="text-emerald-400 font-medium flex items-center gap-2">
                    <Clock size={16} /> Typically &lt; 24 hours
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Global Offices */}
        <motion.div variants={item}>
          <Card className="h-full border border-white/5 bg-surface/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="text-purple-400" /> Global Offices
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-white flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-ink-400" /> Surat
                </h4>
                <p className="text-sm text-ink-400 pl-6">
                  145 Girnar Soc.<br />Surat, GJ, IN
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-ink-400" /> Bengaluru
                </h4>
                <p className="text-sm text-ink-400 pl-6">
                  Remote-first team<br />Bengaluru, India
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* FAQs */}
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="border border-white/5 bg-surface/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <HelpCircle className="text-orange-400" /> Frequently Asked Questions
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-white/5">
                <h4 className="font-bold text-white mb-2">Refund Policy</h4>
                <p className="text-sm text-ink-400">Request a refund within 30 days of purchase by emailing our support team. No questions asked.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <h4 className="font-bold text-white mb-2">Course Support</h4>
                <p className="text-sm text-ink-400">Get help with course content through our dedicated Discord community channels or email support.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <h4 className="font-bold text-white mb-2">Enterprise Training</h4>
                <p className="text-sm text-ink-400">We offer custom training packages for teams. Contact our sales department for a quote.</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Support Hours */}
        <motion.div variants={item} className="md:col-span-2 lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border border-white/5 bg-gradient-to-br from-surface to-brand-900/20">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Clock size={18} className="text-blue-400" /> Support Hours
              </h3>
              <p className="text-sm text-ink-400 mb-2">Mon — Fri: 9:00 AM — 6:00 PM</p>
              <p className="text-xs text-ink-500">Weekend support limited to urgent issues.</p>
            </Card>

            <Card className="p-6 border border-white/5 bg-gradient-to-br from-surface to-emerald-900/20">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" /> Privacy & Security
              </h3>
              <p className="text-sm text-ink-400">
                We never share your personal data. For account security concerns, contact us immediately.
              </p>
            </Card>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
