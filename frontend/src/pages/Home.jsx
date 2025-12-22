import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Code,
  Database,
  Layout,
  Server,
  Smartphone,
  Terminal,
  CheckCircle,
  Star,
  Zap,
  Quote,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react";
import API from "../api";
import { getCurrentUser } from "../auth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const categories = [
  {
    icon: Layout,
    label: "Frontend",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Server,
    label: "Backend",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Database,
    label: "Database",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Smartphone,
    label: "Mobile Dev",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Terminal,
    label: "DevOps",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    icon: Code,
    label: "Algorithms",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

export default function Home() {
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    const updateAuth = () => setCurrentUser(getCurrentUser());
    window.addEventListener("session:changed", updateAuth);
    window.addEventListener("session:user-updated", updateAuth);
    return () => {
      window.removeEventListener("session:changed", updateAuth);
      window.removeEventListener("session:user-updated", updateAuth);
    };
  }, []);

  useEffect(() => {
    API.get("/courses?sort=latest")
      .then((r) => setLatest(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full overflow-x-hidden bg-canvas">
      {/* Hero Section */}
      <section className="relative pt-4 pb-12 overflow-hidden">
        {/* Abstract Background Elemets */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-[100px] pointer-events-none opacity-30" />

        <div className="relative section-shell grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-400 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-accent-500 pulse-slow" />
              New MERN courses available
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl/tight font-display font-bold text-ink-100 text-balance">
              Master the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-brand">
                Web Development
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-ink-400 max-w-2xl leading-relaxed text-balance">
              Join thousands of developers building the next generation of web
              apps. Hands-on projects, expert mentorship, and career-ready
              skills.
            </p>

            <div className="flex flex-wrap gap-4">
              {currentUser ? (
                <Link to="/dashboard">
                  <Button size="xl" className="shadow-lg shadow-brand-500/25">
                    Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button size="xl" className="shadow-lg shadow-brand-500/25">
                    Start Learning Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
              <Link to="/courses">
                <Button variant="outline" size="xl">
                  Explore Courses
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-ink-400 font-medium pt-4">
              <div className="flex items-center gap-2 min-w-[200px]">
                <CheckCircle className="text-accent-500 w-5 h-5" /> No credit
                card required
              </div>
              <div className="flex items-center gap-2 min-w-[200px]">
                <CheckCircle className="text-accent-500 w-5 h-5" /> 14-day money
                back
              </div>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="relative w-full aspect-square max-w-[500px]">
              <div className="absolute inset-0 bg-gradient-brand rounded-full opacity-20 blur-3xl animate-pulse-slow" />
              <motion.img
                animate={{ y: [-10, 10, -10] }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut",
                }}
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                alt="Students learning"
                className="relative z-10 w-full h-full object-cover rounded-[3rem] shadow-2xl border border-white/10"
              />

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-6 -left-6 z-20 bg-surface/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-glass flex items-center gap-4"
              >
                <div className="p-3 bg-brand-500/20 rounded-xl text-brand-400">
                  <Code size={24} />
                </div>
                <div>
                  <p className="text-ink-100 font-bold">50+ Courses</p>
                  <p className="text-xs text-ink-400">updated weekly</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [-15, 15, -15] }}
                transition={{
                  repeat: Infinity,
                  duration: 7,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute -top-6 -right-6 z-20 bg-surface/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-glass flex items-center gap-4"
              >
                <div className="p-3 bg-accent-500/20 rounded-xl text-accent-400">
                  <Zap size={24} />
                </div>
                <div>
                  <p className="text-ink-100 font-bold">Fast Track</p>
                  <p className="text-xs text-ink-400">Certification</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-surface/30">
        <div className="section-shell">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-ink-100 mb-4">
              Top Categories
            </h2>
            <p className="text-ink-400 max-w-2xl mx-auto text-balance">
              Explore our most popular learning paths tailored for industry
              demands.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-4 text-center h-full hover:bg-white/5 transition-colors">
                  <div
                    className={`p-4 rounded-xl ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <cat.icon size={28} />
                  </div>
                  <span className="font-semibold text-ink-200 group-hover:text-white transition-colors">
                    {cat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 relative">
        <div className="section-shell">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-ink-100 mb-2">
                Featured Courses
              </h2>
              <p className="text-ink-400 text-balance">
                Hand-picked by our expert instructors.
              </p>
            </div>
            <Link to="/courses">
              <Button variant="ghost" className="hidden sm:flex group">
                View All{" "}
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="glass rounded-2xl h-[400px] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latest.slice(0, 3).map((course, idx) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                >
                  <Card
                    hover
                    className="h-full flex flex-col p-0 overflow-hidden group border-0 bg-surface/50"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={course.imageUrl || "/assets/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-canvas to-transparent opacity-80" />
                      <div className="absolute bottom-4 left-4">
                        <Badge variant="primary" className="backdrop-blur-md">
                          {course.tech || "MERN"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={14} fill="currentColor" />
                          <span className="text-xs font-bold text-ink-100">
                            4.8
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-ink-400 bg-surfaceHighlight/50 px-2 py-1 rounded">
                          {course.duration}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-400 transition-colors h-[3.5rem] flex items-start">
                        {course.title}
                      </h3>

                      <p className="text-ink-400 text-sm line-clamp-2 mb-6 h-[2.5rem]">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <span className="text-2xl font-bold text-white font-mono">
                          ₹{course.price}
                        </span>
                        <Link to={`/courses/${course._id}`}>
                          <Button
                            size="sm"
                            className="rounded-lg shadow-lg shadow-brand-500/20"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-surfaceHighlight/30 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="section-shell relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-ink-100 mb-4">
              Student Success Stories
            </h2>
            <p className="text-ink-400 max-w-2xl mx-auto text-balance">
              See how Study Point is transforming careers worldwide.
            </p>
          </div>

          <FeedbackList />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="section-shell">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-[#0A0B14] border border-white/5 p-10 md:p-16 lg:p-20 shadow-2xl group">
            {/* Dynamic Backgrounds */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-soft-light" />
            <div className="absolute -top-24 -right-24 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-[100px] pointer-events-none transition-transform duration-1000 group-hover:scale-110" />

            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
              {/* Left: Typography & Action */}
              <div className="space-y-10 text-center lg:text-left">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-bold uppercase tracking-wider mb-2"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                    Limited Time Enrollment
                  </motion.div>

                  <h2 className="text-5xl md:text-7xl/tight font-display font-black text-white tracking-tight">
                    Level Up Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-400 to-brand-400 bg-[length:200%_auto]">
                      Career Scale
                    </span>
                  </h2>
                </div>

                <p className="text-lg sm:text-xl text-ink-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light text-balance">
                  Join an elite community of developers. Get direct access to{" "}
                  <span className="text-white font-medium">
                    industry mentors
                  </span>
                  , real-world projects, and our proprietary AI learning
                  assistant.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                  {!currentUser && (
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button
                        size="xl"
                        className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-accent-600 text-white border-0 shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_50px_rgba(79,70,229,0.6)] font-bold tracking-wide hover:scale-105 transition-all duration-300"
                      >
                        Start Free Trial
                      </Button>
                    </Link>
                  )}
                  <Link to="/courses" className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="xl"
                      className="w-full sm:w-auto text-ink-200 hover:text-white group"
                    >
                      View Courses{" "}
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right: Orbit Visual (No Lightbox) */}
              <div className="relative h-[420px] sm:h-[500px] flex items-center justify-center pointer-events-none w-full">
                {/* Rotating Rings (SVG) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <svg
                    viewBox="0 0 500 500"
                    className="w-full h-full animate-[spin_10s_linear_infinite]"
                  >
                    <circle
                      cx="250"
                      cy="250"
                      r="249"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-white"
                      strokeDasharray="10 20"
                    />
                    <circle
                      cx="250"
                      cy="250"
                      r="180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-white"
                      strokeDasharray="8 8"
                    />
                  </svg>
                </div>

                {/* Central Image (Static, No interactivity) */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full p-2 border border-white/10 bg-white/5 backdrop-blur-sm z-10 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Successful Developer"
                    className="w-full h-full object-cover rounded-full border-4 border-[#0A0B14]"
                  />
                  {/* Gradient Halo */}
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-brand-500 to-accent-500 opacity-20 blur-2xl -z-10" />
                </div>

                {/* Orbiting Elements */}

                {/* Floating Pill 1 */}
                <motion.div
                  animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
                  transition={{
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut",
                  }}
                  className="absolute top-10 right-10 md:top-20 md:right-20 z-20"
                >
                  <Card className="flex items-center gap-3 p-3 pr-5 bg-[#0A0B14]/90 backdrop-blur-xl border-white/10 shadow-xl rounded-full">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                      <CheckCircle size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-ink-400 font-bold uppercase tracking-wider">
                        Target Reached
                      </p>
                      <p className="text-sm font-bold text-white">
                        Full Stack Dev
                      </p>
                    </div>
                  </Card>
                </motion.div>

                {/* Floating Pill 2 */}
                <motion.div
                  animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
                  transition={{
                    repeat: Infinity,
                    duration: 7,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute bottom-10 left-10 md:bottom-20 md:left-20 z-20"
                >
                  <Card className="flex items-center gap-3 p-3 pr-5 bg-[#0A0B14]/90 backdrop-blur-xl border-white/10 shadow-xl rounded-full">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#0A0B14]" />
                      <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#0A0B14]" />
                      <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-[#0A0B14]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-ink-400 font-bold uppercase tracking-wider">
                        Mentors
                      </p>
                      <p className="text-sm font-bold text-white">Online Now</p>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    API.get("/feedback")
      .then((res) => {
        const data = res.data || [];
        setFeedbacks(data.length > 0 ? data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerPage(3);
      else if (window.innerWidth >= 768) setItemsPerPage(2);
      else setItemsPerPage(1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (paused || feedbacks.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [paused, feedbacks.length]);

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);

  const visibleItems = [];
  for (let i = 0; i < itemsPerPage; i++) {
    if (feedbacks.length > 0) {
      visibleItems.push(feedbacks[(currentIndex + i) % feedbacks.length]);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (feedbacks.length === 0)
    return (
      <div className="text-center text-ink-400 p-8 border border-white/5 rounded-2xl bg-surface/30">
        No reviews yet. Be the first to share your experience!
      </div>
    );

  return (
    <div
      className="relative group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleItems.map((f, i) => (
            <motion.div
              key={`${f._id}-${currentIndex}-${i}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              layout
            >
              <Card className="h-full p-8 bg-surface/50 border border-white/5 hover:bg-surface/80 transition-colors duration-300">
                <Quote className="mb-6 text-brand-500 opacity-50" size={32} />
                <p className="text-ink-200 mb-6 leading-relaxed italic h-[140px] overflow-y-auto pr-2 break-words break-all custom-scrollbar">
                  "{f.comment}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden shrink-0">
                    {f.user?.avatar ? (
                      <img
                        src={f.user.avatar}
                        alt={f.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : f.user?.name ? (
                      f.user.name[0].toUpperCase()
                    ) : (
                      "U"
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {f.user?.name || "Anonymous"}
                    </h4>
                    <div className="flex text-yellow-500 mt-1">
                      {[...Array(5)].map((_, starI) => (
                        <Star
                          key={starI}
                          size={12}
                          fill={starI < f.rating ? "currentColor" : "none"}
                          className={starI >= f.rating ? "text-white/10" : ""}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-12">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full bg-surfaceHighlight border border-white/10 text-white hover:bg-brand-500 hover:border-brand-500 transition-all active:scale-95"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          {feedbacks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-brand-500 w-6"
                  : "bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="p-3 rounded-full bg-surfaceHighlight border border-white/10 text-white hover:bg-brand-500 hover:border-brand-500 transition-all active:scale-95"
          aria-label="Next testimonial"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
