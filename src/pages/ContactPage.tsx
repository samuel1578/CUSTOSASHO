import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-hero-gradient pt-28 pb-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h1 className="text-5xl font-display font-bold text-gold-400 mb-4">Contact Us</h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Have questions? We're here to help bring your vision to life
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Mail,
                title: 'Email',
                info: 'info@custosasho.com',
                subInfo: 'We respond within 24 hours',
              },
              {
                icon: Phone,
                title: 'Phone',
                info: '020-555-2252 / 0592299859',
                subInfo: 'Mon-Fri, 9am-6pm',
              },
              {
                icon: MapPin,
                title: 'Location',
                info: 'Accra, GH',
                subInfo: 'Serving nationwide',
              },
            ].map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                className="bg-app-surface/70 backdrop-blur border border-accent-primary/25 rounded-xl p-8 text-center hover:border-accent-primary/50 transition-all"
              >
                <contact.icon className="h-12 w-12 text-gold-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">{contact.title}</h3>
                <p className="text-gold-400 font-medium mb-1">{contact.info}</p>
                <p className="text-text-secondary text-sm">{contact.subInfo}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-app-surface/70 backdrop-blur border border-accent-primary/25 rounded-2xl p-8 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-display font-bold text-text-primary mb-6 text-center">
              Send Us a Message
            </h2>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-center"
              >
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <p className="text-green-400">
                  Thank you for your message! We'll get back to you soon.
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-app-elevated border border-border-subtle rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-app-elevated border border-border-subtle rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-app-elevated border border-border-subtle rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-app-elevated border border-border-subtle rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="design">Design Consultation</option>
                    <option value="order">Order Status</option>
                    <option value="custom">Custom Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-app-elevated border border-border-subtle rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all resize-none"
                  placeholder="Tell us about your project or question..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-black py-4 rounded-lg font-semibold text-lg hover:from-gold-400 hover:to-gold-500 transition-all transform hover:scale-105 flex items-center justify-center"
              >
                <Send className="h-5 w-5 mr-2" />
                Send Message
              </button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
