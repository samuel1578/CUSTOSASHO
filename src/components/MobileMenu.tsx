import { AnimatePresence, motion } from 'framer-motion';
import { MouseEvent, ReactNode, useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import logo from '../assets/logo.png';
import { ThemeToggle } from './ThemeToggle';

interface MobileMenuItem {
    id: string;
    label: string;
    description?: string;
    onSelect: () => void;
    isActive?: boolean;
    variant?: 'default' | 'primary';
    disabled?: boolean;
}

interface MobileMenuProps {
    isOpen: boolean;
    menuId: string;
    title?: string;
    items: MobileMenuItem[];
    onRequestClose: () => void;
    footer?: ReactNode;
}

const focusSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea',
    'input[type="text"]',
    'input[type="email"]',
    'input[type="password"]',
    'select',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export function MobileMenu({
    isOpen,
    menuId,
    title = 'Menu',
    items,
    onRequestClose,
    footer,
}: MobileMenuProps) {
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    const focusableElements = useMemo(() => {
        if (!isOpen || !panelRef.current) return [] as HTMLElement[];
        return Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusSelectors));
    }, [isOpen, items]);

    useEffect(() => {
        if (!isOpen) {
            document.body.style.removeProperty('overflow');
            if (previouslyFocusedElement.current) {
                previouslyFocusedElement.current.focus({ preventScroll: true });
            }
            return undefined;
        }

        previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
        document.body.style.setProperty('overflow', 'hidden');

        const firstFocusable = panelRef.current?.querySelector<HTMLElement>(focusSelectors);
        firstFocusable?.focus({ preventScroll: true });

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onRequestClose();
                return;
            }

            if (event.key === 'Tab' && focusableElements.length > 0) {
                const { activeElement } = document;
                const currentIndex = focusableElements.findIndex((el) => el === activeElement);
                if (event.shiftKey) {
                    if (currentIndex <= 0) {
                        event.preventDefault();
                        focusableElements[focusableElements.length - 1].focus();
                    }
                    return;
                }

                if (currentIndex === focusableElements.length - 1) {
                    event.preventDefault();
                    focusableElements[0].focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.removeProperty('overflow');
        };
    }, [isOpen, focusableElements, onRequestClose]);

    const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === backdropRef.current) {
            onRequestClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={backdropRef}
                    key="mobile-menu"
                    onMouseDown={handleBackdropClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[60] bg-app-base/80 backdrop-blur-md transition-colors"
                >
                    <motion.aside
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`${menuId}-title`}
                        id={menuId}
                        ref={panelRef}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.32, ease: [0.36, 0.66, 0.04, 1] }}
                        className="relative flex h-full w-full flex-col bg-app-base text-text-primary transition-colors"
                    >
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <div className="absolute inset-0 bg-hero-gradient" />
                            <div className="absolute inset-0 opacity-40">
                                <div
                                    className="absolute -left-1/2 top-0 h-full w-[220%] -rotate-12"
                                    style={{
                                        backgroundImage:
                                            'repeating-linear-gradient(135deg, transparent 0, transparent 20px, rgba(var(--accent-primary) / 0.08) 20px, rgba(var(--accent-primary) / 0.08) 21px)',
                                    }}
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-app-base/70 via-transparent to-app-base/40" />
                        </div>

                        <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-6">
                            <div className="flex items-center gap-4">
                                <img
                                    src={logo}
                                    alt="CustoSasho logo"
                                    className="h-12 w-12 flex-shrink-0 rounded-full border border-accent-primary/40 bg-app-elevated/70 object-cover"
                                />
                                <div>
                                    <p className="text-xs uppercase tracking-[0.5em] text-text-secondary/70">{title}</p>
                                    <h2 id={`${menuId}-title`} className="text-3xl font-display font-semibold text-accent-primary">
                                        CustoSasho
                                    </h2>
                                    <p className="text-sm text-text-secondary">Crafted to Represent</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onRequestClose}
                                className="rounded-full border border-accent-primary/40 bg-app-elevated/60 p-3 text-text-primary transition-colors hover:bg-app-elevated focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-app-base"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                                <span className="sr-only">Close menu</span>
                            </button>
                        </header>

                        <div className="relative z-10 px-6 pb-4">
                            <div className="flex items-center justify-between rounded-2xl border border-border-subtle/40 bg-app-surface/40 px-4 py-3 backdrop-blur-sm">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.4em] text-text-secondary/60">Theme</p>
                                    <p className="text-sm font-medium text-text-primary">Personalize the vibes</p>
                                </div>
                                <ThemeToggle layout="vertical" />
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 24 }}
                            transition={{ delay: 0.12, duration: 0.3 }}
                            className="relative z-10 flex-1 overflow-y-auto px-6 pb-32"
                        >
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={item.id}>
                                        {item.variant === 'primary' ? (
                                            <motion.button
                                                type="button"
                                                onClick={item.onSelect}
                                                disabled={item.disabled}
                                                className={`group relative flex w/full items-center justify-between overflow-hidden rounded-xl px-5 py-4 text-left text-text-inverted transition-all focus:outline-none focus:ring-2 focus:ring-accent-secondary focus:ring-offset-2 focus:ring-offset-app-base disabled:cursor-not-allowed disabled:opacity-50 btn-accent-gradient ${item.isActive
                                                    ? 'ring-2 ring-accent-secondary/80 ring-offset-2 ring-offset-app-base'
                                                    : ''
                                                    }`}
                                            >
                                                <div>
                                                    <span className="text-lg font-semibold">{item.label}</span>
                                                    {item.description && (
                                                        <p className="mt-1 text-sm text-text-inverted/80">{item.description}</p>
                                                    )}
                                                    {item.isActive && <div className="mt-2 h-0.5 w-10 rounded-full bg-text-inverted/90" />}
                                                </div>
                                                <motion.span
                                                    initial={{ x: -8, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ duration: 0.3, delay: 0.05 }}
                                                    className="text-xl"
                                                    aria-hidden="true"
                                                >
                                                    →
                                                </motion.span>
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                type="button"
                                                onClick={item.onSelect}
                                                disabled={item.disabled}
                                                className={`group flex w/full items-start justify-between rounded-xl border px-5 py-4 text-left text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-app-base disabled:cursor-not-allowed disabled:opacity-60 ${item.isActive
                                                    ? 'border-accent-primary/70 bg-accent-primary/10'
                                                    : 'border-border-subtle/40 bg-app-surface/50 hover:border-accent-primary/40 hover:bg-app-surface/70'
                                                    }`}
                                            >
                                                <div>
                                                    <span className="text-lg font-medium tracking-wide">{item.label}</span>
                                                    {item.description && (
                                                        <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                                                    )}
                                                    {item.isActive && <div className="mt-2 h-0.5 w-10 rounded-full bg-accent-primary" />}
                                                </div>
                                                <motion.span
                                                    initial={{ x: -6, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ duration: 0.3, delay: 0.05 }}
                                                    className="text-xl text-accent-secondary group-hover:text-accent-primary"
                                                    aria-hidden="true"
                                                >
                                                    →
                                                </motion.span>
                                            </motion.button>
                                        )}
                                        {index < items.length - 1 && (
                                            <motion.div
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{ duration: 0.4, delay: 0.1 + index * 0.03 }}
                                                className="mx-auto mt-4 h-px w-full origin-left bg-gradient-to-r from-transparent via-accent-primary/35 to-transparent"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <footer className="relative z-10 px-6 pb-8">
                            {footer}
                        </footer>
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
