import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    CreditCard,
    BookOpen,
    Users,
    MessageSquare,
    Terminal,
    Shield,
    ChevronRight,
    ChevronLeft,
    X,
    LogOut
} from "lucide-react";

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    currentUser,
}) {
    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "courses", label: "Courses", icon: BookOpen },
        { id: "users", label: "Users", icon: Users },
        { id: "purchases", label: "Transactions", icon: CreditCard },
        { id: "feedback", label: "Feedback", icon: MessageSquare },
        { id: "lab", label: "System", icon: Terminal },
    ];

    const sidebarVariants = {
        expanded: { width: "18rem" }, // w-72
        collapsed: { width: "5rem" }, // w-20
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className={`fixed inset-y-0 left-0 z-50 bg-[#0a0a0a] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out lg:static lg:h-screen lg:shrink-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
                variants={sidebarVariants}
                animate={isCollapsed ? "collapsed" : "expanded"}
                initial={false}
            >
                {/* Header */}
                <div className={`h-20 flex items-center border-b border-white/5 relative ${isCollapsed ? "justify-center px-0" : "px-6"}`}>
                    <div className={`flex items-center overflow-hidden ${isCollapsed ? "justify-center" : "gap-3"}`}>
                        <div className="p-2 bg-rose-500 rounded-lg shrink-0 shadow-lg shadow-rose-500/20">
                            <Shield className="text-white" size={20} />
                        </div>

                        <motion.div
                            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
                            className="whitespace-nowrap overflow-hidden"
                        >
                            <h1 className="font-bold text-white text-lg tracking-tight">
                                Admin <span className="text-rose-500">Panel</span>
                            </h1>
                        </motion.div>
                    </div>

                    {/* Close Mobile */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">

                    {!isCollapsed && (
                        <div className="px-3 mb-2 text-xs font-bold text-ink-500 uppercase tracking-widest">
                            Menu
                        </div>
                    )}

                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setIsMobileOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25"
                                    : "text-ink-400 hover:text-white hover:bg-white/5"
                                    } ${isCollapsed ? "justify-center" : ""}`}
                            >
                                <tab.icon
                                    size={20}
                                    className={`${isActive ? "text-white" : "text-ink-400 group-hover:text-white"
                                        } transition-colors`}
                                />

                                <motion.span
                                    animate={{
                                        opacity: isCollapsed ? 0 : 1,
                                        width: isCollapsed ? 0 : "auto",
                                        display: isCollapsed ? "none" : "block"
                                    }}
                                    className="font-medium whitespace-nowrap overflow-hidden"
                                >
                                    {tab.label}
                                </motion.span>

                                {/* Hover Tooltip for Collapsed */}
                                {isCollapsed && (
                                    <div className="absolute left-14 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-white/10 shadow-xl pointer-events-none">
                                        {tab.label}
                                    </div>
                                )}

                                {isActive && !isCollapsed && (
                                    <div className="ml-auto">
                                        <ChevronRight size={14} className="text-white/50" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center overflow-hidden">
                                {currentUser?.avatar ? (
                                    <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-white">{currentUser?.name?.[0]}</span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full"></div>
                        </div>

                        <motion.div
                            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : "auto" }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <p className="text-sm font-bold text-white truncate">
                                {currentUser?.name || "Admin"}
                            </p>
                            <p className="text-xs text-ink-400 truncate">
                                Administrator
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Desktop Collapse Toggle - Floating on border */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-surface border border-white/10 rounded-full items-center justify-center text-ink-400 hover:text-white hover:scale-110 transition-all shadow-lg z-50"
                >
                    <ChevronLeft size={14} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
                </button>
            </motion.aside>
        </>
    );
}
