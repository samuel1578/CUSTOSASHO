import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getGalleryImages, GalleryImage } from '../lib/appwrite';

export function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const images = await getGalleryImages();
      setGalleryImages(images);
    } catch (err) {
      console.error('Failed to load gallery images:', err);
      setError('Failed to load gallery images');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-app-base pt-28 pb-16 text-text-primary transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-4 text-5xl font-display font-bold text-accent-primary">Gallery</h1>
          <p className="mx-auto max-w-2xl text-xl text-text-secondary">
            Discover stunning custom stoles created by our community
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 h-12 w-12 rounded-full border-4 border-accent-primary border-t-transparent animate-spin"></div>
            <p className="text-text-secondary">Loading gallery...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-12 rounded-lg border border-red-500/50 bg-red-50 dark:bg-red-900/20 p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && galleryImages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 text-6xl">📸</div>
            <h2 className="mb-2 text-2xl font-semibold text-text-primary">Gallery Coming Soon</h2>
            <p className="mb-8 text-text-secondary">
              Check back soon to see featured custom stoles
            </p>
            <Link
              to="/designer"
              className="btn-accent-gradient inline-block transform rounded-lg px-8 py-4 text-lg font-semibold text-text-inverted transition-all hover:scale-105"
            >
              Start Designing Now
            </Link>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && galleryImages.length > 0 && (
          <>
            <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border-subtle/40 bg-app-surface/60 transition-colors"
                >
                  <img
                    src={item.imageUrl}
                    alt={`Gallery item ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-app-base/90 via-app-base/40 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <h3 className="mb-1 text-xl font-semibold text-text-primary">Gallery #{item.order + 1}</h3>
                    <p className="text-sm text-accent-primary">Featured Stole</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="mb-8 text-lg text-text-secondary">
                Ready to create your own masterpiece?
              </p>
              <Link
                to="/designer"
                className="btn-accent-gradient inline-block transform rounded-lg px-8 py-4 text-lg font-semibold text-text-inverted transition-all hover:scale-105"
              >
                Start Designing Now
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
