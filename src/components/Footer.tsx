import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '../assets/logo.png';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle/50 bg-app-base text-text-secondary transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="CustoSasho Logo" className="h-10 w-10 object-contain" />
              <span className="text-xl font-display font-bold text-text-primary">CustoSasho</span>
            </div>
            <p className="text-sm text-text-secondary">
              Luxury custom graduation stoles crafted to represent your unique journey and heritage.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {/* Packages page removed - link intentionally omitted */}
              <li>
                <Link to="/gallery" className="transition-colors hover:text-accent-primary">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-accent-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-accent-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/designer" className="transition-colors hover:text-accent-primary">
                  Design Your Stole
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="transition-colors hover:text-accent-primary">
                  My Orders
                </Link>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-primary">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-primary">
                  Returns Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-accent-primary" />
                <span>info@custosasho.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-accent-primary" />
                <span>020-555-2252</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-accent-primary" />
                <span>Accra, GH</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border-subtle/40 pt-8 text-center text-sm text-text-secondary/80">
          <p>&copy; 2026 CustoSasho. All rights reserved. Crafted with excellence.</p>
        </div>
      </div>
    </footer>
  );
}
