import React from "react";
import { FileText } from "lucide-react";

export default function Terms() {
    return (
        <div className="pb-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-brand-500/10 text-brand-400 mb-6">
                        <FileText size={32} />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-white mb-4">Terms of Service</h1>
                    <p className="text-ink-400 max-w-2xl mx-auto">
                        Please read these terms carefully before using our platform. By accessing or using our services, you agree to be bound by these terms.
                    </p>
                </div>

                <div className="space-y-8 bg-surface/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                        <p className="text-ink-400 leading-relaxed">
                            By accessing or using StudyPoint, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. User Accounts</h2>
                        <p className="text-ink-400 leading-relaxed">
                            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Course Content</h2>
                        <p className="text-ink-400 leading-relaxed">
                            The content provided in our courses is for educational purposes only. Unauthorized distribution or reproduction of course materials is strictly prohibited.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Payments and Refunds</h2>
                        <p className="text-ink-400 leading-relaxed">
                            All purchases are final. Please review course details carefully before purchasing. Refunds may be considered in exceptional circumstances at our discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Termination</h2>
                        <p className="text-ink-400 leading-relaxed">
                            We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. Changes to Terms</h2>
                        <p className="text-ink-400 leading-relaxed">
                            We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
