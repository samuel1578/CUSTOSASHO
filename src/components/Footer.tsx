import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black border-t border-gold-500/20 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-gold-500" />
              <span className="text-xl font-display font-bold text-white">CustoSasho</span>
            </div>
            <p className="text-sm text-gray-400">
              Luxury custom graduation stoles crafted to represent your unique journey and heritage.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {/* Packages page removed - link intentionally omitted */}
              <li>
                <Link to="/gallery" className="hover:text-gold-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/designer" className="hover:text-gold-400 transition-colors">
                  Design Your Stole
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-gold-400 transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-gold-400 transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-400 transition-colors">
                  Returns Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gold-500" />
                <span>info@custosasho.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gold-500" />
                <span>1-800-SASHO-01</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gold-500" />
                <span>Atlanta, GA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold-500/20 text-center text-sm text-gray-400">
          <p>&copy; 2026 CustoSasho. All rights reserved. Crafted with excellence.</p>
        </div>
      </div>
    </footer>
  );
}
