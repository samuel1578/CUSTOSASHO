import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import { MobileMenu } from './MobileMenu';
import { HamburgerButton } from './HamburgerButton';
import { ThemeToggle } from './ThemeToggle';

const MENU_CLOSE_DELAY_MS = 340;

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, profileComplete, signOut, setPendingRedirect, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const reactId = useId();
  const menuId = useMemo(() => `mobile-menu-${reactId.replace(/:/g, '')}`, [reactId]);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [navigate, signOut]);

  const handleGetStarted = useCallback(
    (target: string = '/designer') => {
      if (!user) {
        setPendingRedirect(target);
        navigate(`/register?next=${encodeURIComponent(target)}`);
        return;
      }

      if (!profileComplete) {
        setPendingRedirect(target);
        navigate('/dashboard');
        return;
      }

      navigate(target);
    },
    [navigate, profileComplete, setPendingRedirect, user],
  );

  const runAfterMenuClose = useCallback(
    (action: () => void) => {
      if (isMenuOpen) {
        pendingActionRef.current = action;
        setIsMenuOpen(false);
        return;
      }

      action();
    },
    [isMenuOpen],
  );

  useEffect(() => {
    if (!isMenuOpen && pendingActionRef.current) {
      const timeout = window.setTimeout(() => {
        pendingActionRef.current?.();
        pendingActionRef.current = null;
      }, MENU_CLOSE_DELAY_MS);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = useMemo(
    () => [
      { name: 'Home', path: '/' },
      { name: 'Gallery', path: '/gallery' },
      { name: 'About', path: '/about' },
      { name: 'Contact', path: '/contact' },
    ],
    [],
  );

  const mobileMenuItems = useMemo(() => {
    const items = [
      {
        id: 'home',
        label: 'Home',
        description: 'Where stories begin',
        onSelect: () => runAfterMenuClose(() => navigate('/')),
      },
      {
        id: 'gallery',
        label: 'Gallery',
        description: 'Inspiration from our clients',
        onSelect: () => runAfterMenuClose(() => navigate('/gallery')),
      },
      {
        id: 'about',
        label: 'About',
        description: 'Our story and heritage',
        onSelect: () => runAfterMenuClose(() => navigate('/about')),
      },
      {
        id: 'contact',
        label: 'Contact',
        description: "Let's create together",
        onSelect: () => runAfterMenuClose(() => navigate('/contact')),
      },
    ];

    if (user) {
      items.push({
        id: 'dashboard',
        label: isAdmin ? 'Admin' : 'Dashboard',
        description: isAdmin ? 'Manage orders and designs' : 'Continue your journey',
        onSelect: () => runAfterMenuClose(() => navigate(isAdmin ? '/admin' : '/dashboard')),
      });

      items.push({
        id: 'logout',
        label: 'Logout',
        description: 'Sign out of your account',
        onSelect: () => runAfterMenuClose(() => {
          void handleSignOut();
        }),
      });
    } else {
      items.push({
        id: 'login',
        label: 'Login',
        description: 'Access your saved designs',
        onSelect: () => runAfterMenuClose(() => navigate('/login')),
      });
    }

    items.push({
      id: 'designer',
      label: 'Get Started',
      description: 'Launch the stole designer',
      onSelect: () => runAfterMenuClose(() => handleGetStarted()),
    });

    return items;
  }, [handleGetStarted, handleSignOut, navigate, profile?.role, runAfterMenuClose, user]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-accent-primary/20 bg-app-base/80 backdrop-blur-lg transition-colors">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center space-x-3">
            <img
              src={logo}
              alt="CustoSasho Logo"
              width={100}
              height={100}
              className="object-contain transition-opacity group-hover:opacity-80"
            />
            <span className="text-2xl font-display font-bold text-text-primary transition-colors group-hover:text-accent-primary">
              CustoSasho
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-medium text-text-secondary transition-colors hover:text-accent-primary"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:text-accent-primary"
                >
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={() => void handleSignOut()}
                  className="font-medium text-text-secondary transition-colors hover:text-accent-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="font-medium text-text-secondary transition-colors hover:text-accent-primary"
              >
                Login
              </Link>
            )}
            <ThemeToggle emphasizeLabel className="hidden md:flex" />
            <button
              onClick={() => handleGetStarted()}
              className="btn-accent-gradient rounded-lg px-6 py-2.5 font-semibold text-text-inverted transition-all hover:scale-105"
            >
              Get Started
            </button>
          </div>

          <div className="md:hidden">
            <HamburgerButton
              isOpen={isMenuOpen}
              onToggle={() => setIsMenuOpen((prev) => !prev)}
              controlsId={menuId}
            />
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMenuOpen}
        menuId={menuId}
        title="Explore"
        items={mobileMenuItems}
        onRequestClose={() => setIsMenuOpen(false)}
        footer={
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-text-secondary/80">
            <span>Crafted to Represent</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        }
      />
    </>
  );
}
