import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to the top of the page (0,0) whenever the route changes.
 * This ensures users always see the hero section/top of every page first,
 * creating a consistent and elegant navigation experience.
 * 
 * Usage: Place inside BrowserRouter (has access to useLocation hook)
 */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top with smooth behavior for better UX
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });

        // Alternative instant scroll (uncomment if smooth causes issues on slower devices)
        // window.scrollTo(0, 0);
    }, [pathname]); // Trigger on pathname change

    // This component doesn't render anything
    return null;
}
