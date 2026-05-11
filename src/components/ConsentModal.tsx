import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Shield } from 'lucide-react';
import { setScrollLock } from '../lib/utils';

interface ConsentModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onCancel: () => void;
}

export function ConsentModal({ isOpen, onAccept, onCancel }: ConsentModalProps) {
    const [hasReadTerms, setHasReadTerms] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setScrollLock(true);
        } else {
            setScrollLock(false);
        }
        return () => setScrollLock(false);
    }, [isOpen]);

    const handleAccept = () => {
        if (isAccepted) {
            onAccept();
            setHasReadTerms(false);
            setIsAccepted(false);
        }
    };

    const handleCancel = () => {
        onCancel();
        setHasReadTerms(false);
        setIsAccepted(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-10 flex h-full max-h-[90dvh] w-full max-w-3xl flex-col rounded-3xl border border-border-subtle/40 bg-app-surface shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border-subtle/40 p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-accent-primary/15 p-2 text-accent-primary">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-text-primary">Data & Image Consent</h2>
                                    <p className="text-sm text-text-secondary">Please review and accept our terms</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-app-elevated hover:text-text-primary"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div
                            className="scroll-contain flex-1 overflow-y-auto p-6 space-y-6"
                            onScroll={(e) => {
                                const element = e.currentTarget;
                                const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
                                if (isAtBottom && !hasReadTerms) {
                                    setHasReadTerms(true);
                                }
                            }}
                        >
                            <div className="prose prose-invert max-w-none">
                                <div className="rounded-xl border border-accent-primary/40 bg-accent-primary/10 p-5">
                                    <p className="text-sm leading-relaxed text-text-primary">
                                        By granting consent, you authorize <strong>Custosasho</strong> to use your information and images as described below. Your privacy and rights are important to us.
                                    </p>
                                </div>

                                <div className="mt-6 space-y-6">
                                    {/* Section 1 */}
                                    <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-5">
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-accent-primary mb-3">
                                            <CheckCircle2 className="h-5 w-5" />
                                            1. Design Creation & Order Fulfillment
                                        </h3>
                                        <ul className="space-y-2 text-sm text-text-secondary">
                                            <li>• Use your provided information to create custom stole designs</li>
                                            <li>• Share design brief with our creative team</li>
                                            <li>• Communicate with you about your order status and updates</li>
                                            <li>• Process your order details for manufacturing</li>
                                        </ul>
                                    </div>

                                    {/* Section 2 */}
                                    <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-5">
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-accent-primary mb-3">
                                            <CheckCircle2 className="h-5 w-5" />
                                            2. Image Rights & Marketing
                                        </h3>
                                        <ul className="space-y-2 text-sm text-text-secondary">
                                            <li>• Photograph your completed custom stole for quality documentation</li>
                                            <li>• Use images in our portfolio and marketing materials</li>
                                            <li>• Share photos on social media platforms (Instagram, Facebook, website)</li>
                                            <li>• Feature in promotional content for New Nation School custom orders</li>
                                            <li>• Showcase in our gallery to inspire future customers</li>
                                        </ul>
                                    </div>

                                    {/* Section 3 */}
                                    <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/60 p-5">
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-accent-primary mb-3">
                                            <CheckCircle2 className="h-5 w-5" />
                                            3. Data Storage & Security
                                        </h3>
                                        <ul className="space-y-2 text-sm text-text-secondary">
                                            <li>• Store your order details securely in our database</li>
                                            <li>• Retain contact information for order fulfillment and support</li>
                                            <li>• Use anonymous data to improve our services and user experience</li>
                                            <li>• Protect your information with industry-standard security measures</li>
                                        </ul>
                                    </div>

                                    {/* Section 4 */}
                                    <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-5">
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-green-400 mb-3">
                                            <Shield className="h-5 w-5" />
                                            Your Rights
                                        </h3>
                                        <ul className="space-y-2 text-sm text-text-secondary">
                                            <li>✓ You can withdraw consent at any time by contacting us</li>
                                            <li>✓ Request deletion of your images from marketing materials</li>
                                            <li>✓ Your personal contact information remains private</li>
                                            <li>✓ Orders will still be fulfilled even after consent withdrawal</li>
                                            <li>✓ You can update your information through your profile</li>
                                        </ul>
                                    </div>

                                    {/* Section 5 */}
                                    <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-5">
                                        <h3 className="text-lg font-semibold text-blue-400 mb-2">Privacy Commitment</h3>
                                        <p className="text-sm text-text-secondary leading-relaxed">
                                            We will <strong>never</strong> sell your personal data to third parties. Your information is used exclusively for order fulfillment and improving the Custosasho experience. We comply with data protection regulations and respect your privacy.
                                        </p>
                                    </div>

                                    {/* Contact */}
                                    <div className="rounded-xl border border-border-subtle/40 bg-app-elevated/40 p-5">
                                        <p className="text-xs text-text-secondary/70">
                                            Questions about consent or data usage? Contact us at{' '}
                                            <a href="mailto:privacy@custosasho.com" className="text-accent-primary hover:underline">
                                                privacy@custosasho.com
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border-subtle/40 bg-app-elevated/50 p-6 space-y-4">
                            {/* Scroll prompt */}
                            {!hasReadTerms && (
                                <p className="text-center text-xs text-yellow-500/80 animate-pulse">
                                    Please scroll to the bottom to read all terms
                                </p>
                            )}

                            {/* Checkbox */}
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAccepted}
                                    onChange={(e) => setIsAccepted(e.target.checked)}
                                    disabled={!hasReadTerms}
                                    className="mt-1 h-5 w-5 rounded border-border-subtle bg-app-base text-accent-primary focus:ring-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span className={`text-sm ${hasReadTerms ? 'text-text-primary' : 'text-text-secondary/50'}`}>
                                    I have read and accept the terms above. I authorize Custosasho to use my information and images as described.
                                </span>
                            </label>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 rounded-lg border border-border-subtle/40 bg-app-elevated/60 px-6 py-3 font-semibold text-text-primary transition-all hover:border-border-subtle hover:bg-app-elevated"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAccept}
                                    disabled={!isAccepted}
                                    className="flex-1 btn-accent-gradient rounded-lg px-6 py-3 font-semibold text-text-inverted transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                                >
                                    Grant Consent
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
