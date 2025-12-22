import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Code,
    Database,
    Layout,
    Server,
    Smartphone,
    Terminal,
    Cpu,
    Globe,
    Layers,
    Shield,
    Cloud,
    Box
} from "lucide-react";
import { Card } from "../components/ui/Card";

const categories = [
    {
        icon: Layout,
        label: "Frontend Development",
        desc: "Master HTML, CSS, React, and modern UI frameworks.",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        slug: "frontend"
    },
    {
        icon: Server,
        label: "Backend Development",
        desc: "Build robust APIs with Node.js, Express, and Python.",
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        slug: "backend"
    },
    {
        icon: Database,
        label: "Database Engineering",
        desc: "Learn SQL, MongoDB, Redis and data modeling.",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        slug: "database"
    },
    {
        icon: Smartphone,
        label: "Mobile Development",
        desc: "Create cross-platform apps with React Native and Flutter.",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        slug: "mobile"
    },
    {
        icon: Terminal,
        label: "DevOps & Cloud",
        desc: "Automate deployment with Docker, Kubernetes, and AWS.",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        slug: "devops"
    },
    {
        icon: Code,
        label: "Data Structures & Algo",
        desc: "Ace your coding interviews with DSA mastery.",
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20",
        slug: "algorithms"
    },
    {
        icon: Shield,
        label: "Cybersecurity",
        desc: "Protect systems and networks from digital attacks.",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        slug: "security"
    },
    {
        icon: Globe,
        label: "Web3 & Blockchain",
        desc: "Build decentralized applications with Solidity.",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        slug: "web3"
    },
    {
        icon: Cpu,
        label: "Machine Learning",
        desc: "Train models and implement AI solutions.",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        slug: "ml"
    },
];

export default function Categories() {
    return (
        <div className="min-h-screen bg-canvas py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/20 blur-[100px] rounded-full pointer-events-none" />

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-bold text-white mb-4 relative z-10"
                    >
                        Browse Categories
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-ink-400 text-lg max-w-2xl mx-auto relative z-10"
                    >
                        Find the perfect learning path to advance your career.
                        From frontend to AI, we have you covered.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, idx) => (
                        <Link to={`/courses?tech=${cat.slug}`} key={cat.slug}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="h-full"
                            >
                                <Card className={`h-full p-8 hover:bg-white/5 transition-all duration-300 border-white/5 hover:${cat.border} group`}>
                                    <div className={`w-14 h-14 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                                        <cat.icon size={32} />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-300 transition-colors">
                                        {cat.label}
                                    </h3>
                                    <p className="text-ink-400 group-hover:text-ink-300 transition-colors">
                                        {cat.desc}
                                    </p>
                                </Card>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
