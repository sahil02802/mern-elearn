import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

import API from "../api";
import { authHeader } from "../auth";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get("session_id");
    const [status, setStatus] = useState("verifying");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!sessionId) {
            setStatus("error");
            setError("No session ID verification token found.");
            return;
        }

        API.post(
            "/purchases/verify-session",
            { sessionId },
            { headers: authHeader() }
        )
            .then((res) => {
                if (res.data.success) {
                    setStatus("success");
                    setTimeout(() => {
                        navigate("/dashboard/enrolled");
                    }, 3000);
                } else {
                    setStatus("error");
                    setError("Payment could not be verified.");
                }
            })
            .catch((err) => {
                setStatus("error");
                setError(err.response?.data?.error || "Verification failed due to server error.");
            });
    }, [sessionId, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-canvas bg-[url('/assets/grid.svg')]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 text-center border-white/10 bg-surface/80 backdrop-blur-xl shadow-2xl">
                    {status === "verifying" && (
                        <div className="flex flex-col items-center py-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="mb-6 text-brand-400"
                            >
                                <Loader2 size={64} />
                            </motion.div>
                            <h2 className="text-xl font-bold text-white mb-2">Finalizing Purchase</h2>
                            <p className="text-ink-400">Please wait while we confirm your payment...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 py-4"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                                <CheckCircle size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white mb-2">Success!</h2>
                                <p className="text-ink-400">
                                    Your enrollment is complete. Welcome aboard!
                                </p>
                            </div>
                            <div className="p-4 bg-surfaceHighlight/50 rounded-xl border border-white/5">
                                <p className="text-sm text-ink-500 flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Redirecting to your dashboard...
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 py-4"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                                <XCircle size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white mb-2">Payment Failed</h2>
                                <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded-lg inline-block px-4">
                                    {error}
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate("/courses")}
                                variant="primary"
                                className="w-full"
                            >
                                Return to Courses <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </motion.div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
