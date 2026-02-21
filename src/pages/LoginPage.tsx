import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, setPendingRedirect } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const nextParam = searchParams.get('next');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error, isAdmin } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (nextParam) {
      setPendingRedirect(nextParam);
    }

    // Redirect admins to admin dashboard, regular users to user dashboard
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-section-gradient px-4 py-12 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="group mb-6 inline-flex items-center space-x-2">
            <Sparkles className="h-10 w-10 text-accent-primary transition-colors group-hover:text-accent-secondary" />
            <span className="text-3xl font-display font-bold text-text-primary transition-colors group-hover:text-accent-primary">
              CustoSasho
            </span>
          </Link>
          <h2 className="mb-2 text-3xl font-display font-bold text-text-primary">Welcome Back</h2>
          <p className="text-text-secondary">Sign in to continue your design journey</p>
        </div>

        <div className="rounded-2xl border border-border-subtle/40 bg-app-surface/70 p-8 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start rounded-lg border border-red-500/40 bg-red-500/10 p-4"
              >
                <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-text-secondary">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-text-secondary/70" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 pl-10 text-text-primary placeholder:text-text-secondary/60 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-text-secondary/70" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border-subtle/50 bg-app-elevated px-4 py-3 pl-10 text-text-primary placeholder:text-text-secondary/60 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent-gradient w-full transform rounded-lg py-3 font-semibold text-text-inverted transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-accent-primary transition-colors hover:text-accent-secondary">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
