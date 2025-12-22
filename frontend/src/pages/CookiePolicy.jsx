import React from "react";
import { Cookie } from "lucide-react";

export default function CookiePolicy() {
    return (
        <div className="pb-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-brand-500/10 text-brand-400 mb-6">
                        <Cookie size={32} />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-white mb-4">Cookie Policy</h1>
                    <p className="text-ink-400 max-w-2xl mx-auto">
                        This policy explains how we use cookies and similar technologies to recognize you when you visit our website.
                    </p>
                </div>

                <div className="space-y-8 bg-surface/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. What are cookies?</h2>
                        <p className="text-ink-400 leading-relaxed">
                            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Why do we use cookies?</h2>
                        <p className="text-ink-400 leading-relaxed">
                            We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for advertising, analytics and other purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Types of Cookies We Use</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-white font-semibold mb-1">Essential Cookies</h3>
                                <p className="text-ink-400 leading-relaxed">
                                    These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Performance and Functionality Cookies</h3>
                                <p className="text-ink-400 leading-relaxed">
                                    These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use. However, without these cookies, certain functionality (like videos) may become unavailable.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Analytics and Customization Cookies</h3>
                                <p className="text-ink-400 leading-relaxed">
                                    These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. How can I control cookies?</h2>
                        <p className="text-ink-400 leading-relaxed">
                            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Updates to this policy</h2>
                        <p className="text-ink-400 leading-relaxed">
                            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. Contact Us</h2>
                        <p className="text-ink-400 leading-relaxed">
                            If you have any questions about our use of cookies or other technologies, please contact us at <a href="mailto:support@studypoint.com" className="text-brand-400 hover:underline">support@studypoint.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
