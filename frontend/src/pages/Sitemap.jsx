import React from "react";
import { Link } from "react-router-dom";
import { Map, ChevronRight } from "lucide-react";

export default function Sitemap() {
    const sections = [
        {
            title: "Main",
            links: [
                { label: "Home", to: "/" },
                { label: "Courses", to: "/courses" },
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
            ]
        },
        {
            title: "User Account",
            links: [
                { label: "Login", to: "/login" },
                { label: "Register", to: "/register" },
                { label: "Dashboard", to: "/dashboard" },
                { label: "My Profile", to: "/dashboard/profile" },
            ]
        },
        {
            title: "Learning",
            links: [
                { label: "My Purchases", to: "/dashboard/enrolled" },
                { label: "Feedback", to: "/feedback" },
            ]
        },
        {
            title: "Legal",
            links: [
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Cookie Policy", to: "/cookies" },
            ]
        }
    ];

    return (
        <div className="pb-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-brand-500/10 text-brand-400 mb-6">
                        <Map size={32} />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-white mb-4">Sitemap</h1>
                    <p className="text-ink-400 max-w-2xl mx-auto">
                        Navigate through our platform easily. Here is an overview of all available pages.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {sections.map((section) => (
                        <div key={section.title} className="bg-surface/50 p-6 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-colors">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                {section.title}
                            </h2>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            className="flex items-center gap-2 text-ink-400 hover:text-brand-400 transition-colors group"
                                        >
                                            <ChevronRight size={16} className="text-brand-500/50 group-hover:text-brand-400 transition-colors" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
