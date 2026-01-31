import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, profileComplete, signOut, setPendingRedirect } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleGetStarted = (target: string = '/designer') => {
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
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gold-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src={logo}
              alt="CustoSasho Logo"
              style={{ width: '100px', height: '100px' }}
              className="object-contain group-hover:opacity-80 transition-opacity"
            />
            <span className="text-2xl font-display font-bold text-white group-hover:text-gold-400 transition-colors">
              CustoSasho
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-300 hover:text-gold-400 transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-gray-300 hover:text-gold-400 transition-colors font-medium"
                >
                  {profile?.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-gold-400 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:text-gold-400 transition-colors font-medium"
              >
                Login
              </Link>
            )}
            <button
              onClick={() => handleGetStarted()}
              className="bg-gradient-to-r from-gold-500 to-gold-600 text-black px-6 py-2.5 rounded-lg font-semibold hover:from-gold-400 hover:to-gold-500 transition-all transform hover:scale-105"
            >
              Get Started
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-gold-400 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/98 border-t border-gold-500/20"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-gold-400 transition-colors font-medium py-2"
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="block text-gray-300 hover:text-gold-400 transition-colors font-medium py-2"
                  >
                    {profile?.role === 'admin' ? 'Admin' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-gold-400 transition-colors font-medium py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-gold-400 transition-colors font-medium py-2"
                >
                  Login
                </Link>
              )}
              <button
                onClick={() => {
                  handleGetStarted();
                  setIsOpen(false);
                }}
                className="block w-full bg-gradient-to-r from-gold-500 to-gold-600 text-black px-6 py-3 rounded-lg font-semibold text-center hover:from-gold-400 hover:to-gold-500 transition-all"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
