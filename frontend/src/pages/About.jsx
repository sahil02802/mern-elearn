import React from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Handshake,
  Sparkles,
  Globe,
  Calendar,
  Users,
  Trophy,
  Target,
  Eye,
  Rocket,
  Briefcase,
  Video,
  Infinity as InfinityIcon,
  Flame,
  BookOpen,
  Star,
  MapPin,
  Mail,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export default function About() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const stats = [
    { label: "Active Learners", value: "50K+" },
    { label: "Courses", value: "200+" },
    { label: "Lessons", value: "2000+" },
    { label: "Satisfaction", value: "98%" },
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We stay ahead of technology trends and continuously update our curriculum to include the latest frameworks and tools.",
    },
    {
      icon: Handshake,
      title: "Community",
      description: "Learning is better together. We foster a supportive community where students help each other and grow together.",
    },
    {
      icon: Sparkles,
      title: "Quality",
      description: "Every course is crafted by industry experts with real-world experience. Quality over quantity is our philosophy.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Technology education should be for everyone. We provide affordable, flexible, and inclusive learning opportunities.",
    },
  ];

  const technologies = [
    { category: "Web Development", techs: ["React", "Vue.js", "Angular", "HTML/CSS", "JavaScript", "TypeScript", "Next.js", "Svelte"] },
    { category: "Mobile Development", techs: ["React Native", "Flutter", "Swift", "Kotlin", "Xamarin", "Ionic"] },
    { category: "Backend Development", techs: ["Node.js", "Python", "Java", "Go", "C#/.NET", "Ruby", "PHP", "Rust"] },
    { category: "Cloud & DevOps", techs: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Jenkins", "GitLab"] },
    { category: "Data Science & AI", techs: ["Python", "R", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Data Analysis"] },
    { category: "Databases & Tools", techs: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "Firebase", "GraphQL"] },
  ];

  const differentiators = [
    { icon: Rocket, title: "Real-World Projects", description: "Build actual applications, not just tutorials. Learn by doing with industry-standard projects." },
    { icon: Users, title: "Expert Instructors", description: "Learn from professionals actively working in the industry with decades of combined experience." },
    { icon: Briefcase, title: "Career Support", description: "Get guidance on career paths, interview preparation, and job placement resources." },
    { icon: Video, title: "High-Quality Videos", description: "Clear, engaging video lessons with practical examples that are easy to follow." },
    { icon: InfinityIcon, title: "Lifetime Access", description: "Once you enroll, you have permanent access to course materials and future updates." },
    { icon: MessageSquare, title: "Active Community", description: "Connect with thousands of learners, share ideas, and get help when you need it." },
  ];

  const faqs = [
    { question: "What technologies do you teach?", answer: "We teach everything from web development to mobile, backend, cloud platforms, data science, and more." },
    { question: "Do I need prior programming experience?", answer: "No! We have beginner-friendly courses that start from the basics, as well as advanced courses for experienced developers." },
    { question: "How long do the courses take?", answer: "Course duration varies from 2-4 weeks for short courses to 3-6 months for comprehensive programs." },
    { question: "Do you offer certificates?", answer: "Yes! Upon completion of any course, you'll receive a verified certificate to add to your portfolio." },
  ];

  return (
    <div className="min-h-screen bg-canvas overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-24 text-center sm:px-8">
        <div className="absolute inset-0 bg-gradient-brand opacity-10 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl mx-auto space-y-6"
        >
          <Badge variant="section">About Us</Badge>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-100 to-brand-200">
            Master the Future of Tech
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-ink-400 leading-relaxed">
            From web development to AI, Study Point is your destination to master any technology and advance your career.
          </p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="px-6 pb-20 sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-6 text-center border-brand-500/20 bg-brand-500/5 backdrop-blur-sm">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-brand-400 font-medium">{stat.label}</div>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Company Info */}
      <section className="px-6 py-12 bg-surface/30 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Calendar, title: "Founded 2020", desc: "Democratizing tech education" },
              { icon: Users, title: "100+ Team", desc: "Passionate educators & engineers" },
              { icon: Globe, title: "150+ Countries", desc: "Learners across the globe" },
              { icon: Trophy, title: "15+ Awards", desc: "Leader in online education" }
            ].map((item, i) => (
              <motion.div variants={item} key={i}>
                <Card className="h-full p-6 text-center border-white/5 bg-canvas/50 hover:bg-surface transition-colors">
                  <div className="inline-flex p-3 rounded-full bg-surfaceHighlight mb-4 text-brand-400">
                    <item.icon size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-ink-400">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full p-10 border-brand-500/30 bg-gradient-to-br from-surface to-brand-900/10">
              <div className="inline-flex p-4 rounded-full bg-brand-500/20 text-brand-400 mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-lg text-ink-200 leading-relaxed">
                To empower individuals across all technology domains by providing world-class, accessible, and practical education that transforms careers and creates opportunities for growth.
              </p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full p-10 border-purple-500/30 bg-gradient-to-br from-surface to-purple-900/10">
              <div className="inline-flex p-4 rounded-full bg-purple-500/20 text-purple-400 mb-6">
                <Eye size={32} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-lg text-ink-200 leading-relaxed">
                To be the trusted, go-to platform where anyone can master any technology, from beginner to expert level, and build a fulfilling career in tech.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-20 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Core Values</h2>
            <div className="h-1 w-20 bg-brand-500 mx-auto rounded-full" />
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((v, i) => (
              <motion.div variants={item} key={i}>
                <Card className="h-full p-6 border-white/5 bg-canvas/50">
                  <div className="p-3 w-fit rounded-lg bg-surfaceHighlight text-brand-400 mb-4">
                    <v.icon size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-ink-400">{v.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Technologies We Teach</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((tech, idx) => (
              <Card key={idx} className="p-6 border-white/5 bg-surface/40 hover:bg-surface/60 transition-colors">
                <h3 className="font-bold text-white mb-4">{tech.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {tech.techs.map((t, i) => (
                    <span key={i} className="px-2 py-1 rounded-md bg-white/5 text-xs text-ink-300 border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-6 py-20 bg-brand-900/10 border-y border-brand-500/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Study Point</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((d, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="shrink-0 p-3 h-fit rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <d.icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{d.title}</h3>
                  <p className="text-sm text-ink-400">{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="p-6 border-white/5 bg-surface/30 hover:bg-surface/50 transition-colors">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-brand-400">Q.</span> {faq.question}
                </h3>
                <p className="text-sm text-ink-400 pl-6 border-l-2 border-white/5 ml-1">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
