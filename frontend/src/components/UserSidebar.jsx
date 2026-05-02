import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  CreditCard,
  User,
  MessageSquare,
  Shield,
  Home as HomeIcon,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  LogOut,
} from "lucide-react";
import { clearSession } from "../auth";

export default function UserSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  currentUser,
}) {
  const navigate = useNavigate();
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "overview", label: "My Learning", icon: BookOpen },
    { id: "transactions", label: "Transactions", icon: CreditCard },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "security", label: "Change Password", icon: Shield },
  ];

  const sidebarVariants = {
    expanded: { width: "18rem" },
    collapsed: { width: "5rem" },
  };

  const handleLogout = () => {
    clearSession();
    setIsMobileOpen(false);
    navigate("/");
  };

  return (
    <>
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

      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 h-screen bg-surface border-r border-border/80 flex flex-col overflow-visible transition-all duration-300 ease-in-out lg:self-start lg:shrink-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        initial={false}
      >
        <div
          className={`h-20 flex items-center border-b border-border/80 relative ${
            isCollapsed ? "justify-center px-0" : "px-6"
          }`}
        >
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center overflow-hidden ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <motion.div
              animate={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : "auto",
              }}
              className="whitespace-nowrap overflow-hidden"
            >
              <h1 className="font-bold text-white text-lg tracking-tight">
                Study<span className="text-brand-400">Point</span>
              </h1>
            </motion.div>
          </Link>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <nav className="flex-1 min-h-0 overflow-hidden py-6 px-3 space-y-1">
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-bold text-ink-500 uppercase tracking-widest">
                Menu
              </div>
            )}

            <Link
              to="/"
              onClick={() => setIsMobileOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative text-ink-400 hover:text-ink-100 hover:bg-surfaceHighlight ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <HomeIcon
                size={20}
                className="text-ink-400 group-hover:text-white transition-colors"
              />

              <motion.span
                animate={{
                  opacity: isCollapsed ? 0 : 1,
                  width: isCollapsed ? 0 : "auto",
                  display: isCollapsed ? "none" : "block",
                }}
                className="font-medium whitespace-nowrap overflow-hidden"
              >
                Home
              </motion.span>

              {isCollapsed && (
                <div className="absolute left-14 px-3 py-1.5 bg-surface text-ink-100 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border shadow-xl pointer-events-none">
                  Home
                </div>
              )}
            </Link>

            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25"
                      : "text-ink-400 hover:text-ink-100 hover:bg-surfaceHighlight"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <tab.icon
                    size={20}
                    className={`${
                      isActive
                        ? "text-white"
                        : "text-ink-400 group-hover:text-white"
                    } transition-colors`}
                  />

                  <motion.span
                    animate={{
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : "auto",
                      display: isCollapsed ? "none" : "block",
                    }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    {tab.label}
                  </motion.span>

                  {isCollapsed && (
                    <div className="absolute left-14 px-3 py-1.5 bg-surface text-ink-100 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border shadow-xl pointer-events-none">
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

          <div className="mt-auto shrink-0 p-4 border-t border-border/80 bg-surface">
            <div
              className={`flex w-full items-center ${
                isCollapsed ? "justify-center" : "justify-between gap-3"
              }`}
            >
              <motion.div
                animate={{
                  opacity: isCollapsed ? 0 : 1,
                  width: isCollapsed ? 0 : "auto",
                }}
                className={`overflow-hidden ${
                  isCollapsed ? "pointer-events-none" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 p-[1px] border border-white/10 flex items-center justify-center overflow-hidden">
                      {currentUser?.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="/avatar-placeholder.svg"
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
                  </div>

                  <motion.div
                    animate={{
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : "auto",
                    }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <p className="text-sm font-bold text-white truncate">
                      {currentUser?.name || "User"}
                    </p>
                    <p className="text-xs text-ink-400 truncate">Learner</p>
                  </motion.div>
                </div>
              </motion.div>

              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                className="inline-flex items-center justify-center rounded-lg border border-border/70 text-ink-400 hover:text-ink-100 hover:bg-surfaceHighlight transition-colors w-9 h-9"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-surface border border-border rounded-full items-center justify-center text-ink-400 hover:text-ink-100 hover:scale-110 transition-all shadow-lg z-50"
        >
          <ChevronLeft
            size={14}
            className={`transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </motion.aside>
    </>
  );
}
