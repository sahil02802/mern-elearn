import React from "react";
import { Shield } from "lucide-react";

export default function Privacy() {
    return (
        <div className="pb-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-brand-500/10 text-brand-400 mb-6">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-white mb-4">Privacy Policy</h1>
                    <p className="text-ink-400 max-w-2xl mx-auto">
                        Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                    </p>
                </div>

                <div className="space-y-8 bg-surface/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
                        <p className="text-ink-400 leading-relaxed">
                            We collect information you provide directly to us, such as when you create an account, update your profile, or purchase a course. This may include your name, email address, password, and payment information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
                        <p className="text-ink-400 leading-relaxed">
                            We use the information we collect to operate, maintain, and improve our services. This includes processing transactions, sending you technical notices and support messages, and communicating with you about products, services, offers, and events.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Data Security</h2>
                        <p className="text-ink-400 leading-relaxed">
                            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Cookies</h2>
                        <p className="text-ink-400 leading-relaxed">
                            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Contact Us</h2>
                        <p className="text-ink-400 leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@studypoint.com" className="text-brand-400 hover:underline">support@studypoint.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
