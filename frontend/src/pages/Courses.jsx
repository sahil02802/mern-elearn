import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, Star, Clock, AlertCircle } from "lucide-react";
import API from "../api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    tech: "",
    minPrice: "",
    maxPrice: "",
    sort: "latest",
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    const { tech, ...rest } = filters;
    const params = { ...rest };

    if (filters.sort === "priceAsc" || filters.sort === "priceDesc") {
      delete params.sort;
    }

    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== "")
      )
    ).toString();

    API.get(`/courses?${q}`)
      .then((r) => {
        let data = Array.isArray(r.data) ? r.data : [];
        const search = tech.trim().toLowerCase();
        if (search) {
          data = data.filter((course) => {
            const title = (course.title || "").toLowerCase();
            const stack = (course.tech || "").toLowerCase();
            return title.includes(search) || stack.includes(search);
          });
        }
        if (filters.sort === "priceDesc") {
          data = [...data].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        } else if (filters.sort === "priceAsc") {
          data = [...data].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        }
        setCourses(data);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  function onFilter(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function clearFilters() {
    setFilters({
      tech: "",
      minPrice: "",
      maxPrice: "",
      sort: "latest",
    });
  }

  return (
    <div className="dashboard-root">
      <div className="dashboard-main">
        <div className="dashboard-container">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-display font-bold text-white">
                Explore Courses
              </h1>
              <p className="text-ink-400 max-w-2xl text-balance">
                Discover industry-leading courses designed to help you master
                new skills and advance your career.
              </p>
            </motion.div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden w-full flex items-center justify-center gap-2"
            >
              <Filter size={18} /> Filters
            </Button>
          </div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, height: "auto" }}
            animate={{ height: "auto", opacity: 1 }}
            className={`glass rounded-2xl p-6 border border-white/5 w-full min-w-0 ${
              showFilters ? "block" : "hidden md:block"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-1">
                <Input
                  name="tech"
                  value={filters.tech}
                  onChange={onFilter}
                  placeholder="Search by tech or title..."
                  className="bg-surface/50 border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <Input
                  type="number"
                  name="minPrice"
                  min="0"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={onFilter}
                  className="bg-surface/50 border-white/10"
                />
                <Input
                  type="number"
                  name="maxPrice"
                  min="0"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={onFilter}
                  className="bg-surface/50 border-white/10"
                />
              </div>

              <div className="flex gap-2">
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={onFilter}
                  className="flex-1 bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-ink-100 outline-none focus:border-brand-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="latest">Newest First</option>
                  <option value="old">Oldest First</option>
                  <option value="priceDesc">Price: Low to High</option>
                  <option value="priceAsc">Price: High to Low</option>
                </select>

                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  title="Clear Filters"
                  className="px-3"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Course Grid */}
          {loading ? (
            <div className="dashboard-grid-cards">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="glass rounded-2xl h-[400px] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {courses.length === 0 ? (
                <div className="text-center py-24">
                  <div className="inline-flex p-4 rounded-full bg-surfaceHighlight mb-4">
                    <AlertCircle size={32} className="text-ink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    No courses found
                  </h3>
                  <p className="text-ink-400 mt-2">
                    Try adjusting your filters or search terms.
                  </p>
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="mt-6"
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <motion.div layout className="dashboard-grid-cards">
                  <AnimatePresence>
                    {courses.map((course) => (
                      <motion.div
                        layout
                        key={course._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card
                          hover
                          className="h-full flex flex-col p-0 overflow-hidden group border-0 bg-surface/40"
                        >
                          <div className="relative aspect-video overflow-hidden">
                            <img
                              src={course.imageUrl || "/assets/placeholder.svg"}
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent opacity-90" />
                            <div className="absolute top-4 right-4">
                              <Badge
                                variant="neutral"
                                className="bg-black/50 backdrop-blur-md border-white/10 text-white"
                              >
                                {course.tech || "MERN"}
                              </Badge>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="p-6 flex flex-col flex-grow">
                            <div className="flex justify-between items-center mb-4 gap-2">
                              {/* Rating Badge */}
                              <div
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border icon-badge ${
                                  course.ratingCount > 0
                                    ? "bg-surfaceHighlight border-white/5"
                                    : "bg-brand-500/10 border-brand-500/20"
                                }`}
                              >
                                {course.ratingCount > 0 ? (
                                  <>
                                    <Star
                                      size={14}
                                      className="text-yellow-400 fill-yellow-400"
                                    />
                                    <span className="text-xs font-bold text-white">
                                      {Number(course.averageRating).toFixed(1)}
                                    </span>
                                    <span className="text-[10px] text-ink-400">
                                      ({course.ratingCount})
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs font-bold text-brand-400">
                                    New
                                  </span>
                                )}
                              </div>

                              {/* Duration Badge */}
                              <div className="flex items-center gap-1.5 text-ink-400 bg-surfaceHighlight px-2.5 py-1 rounded-lg border border-white/5">
                                <Clock size={14} />
                                <span className="text-xs font-medium text-ink-200">
                                  {course.duration || "Self Paced"}
                                </span>
                              </div>
                            </div>

                            <h3 className="text-xl font-bold text-ink-100 mb-2 line-clamp-2 group-hover:text-brand-400 transition-colors">
                              {course.title}
                            </h3>

                            <p className="text-ink-400 text-sm line-clamp-2 mb-6 flex-grow">
                              {course.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                              <div>
                                <p className="text-xs text-ink-400 uppercase tracking-wider font-semibold">
                                  Price
                                </p>
                                <span className="text-2xl font-bold text-white">
                                  ₹{course.price}
                                </span>
                              </div>
                              <Link to={`/courses/${course._id}`}>
                                <Button size="sm" className="rounded-xl px-6">
                                  Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
