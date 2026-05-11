import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Palette, Truck, Award, Check } from 'lucide-react';
import { PACKAGES } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { getGalleryImages, GalleryImage } from '../lib/appwrite';
import logo from '../assets/logo.png';
import stdImage from '../assets/STD.png';
import ogImage from '../assets/og-image.jpg';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

type PackageKey = keyof typeof PACKAGES;
type PackageConfig = (typeof PACKAGES)[PackageKey];

export function LandingPage() {
  const [flippedKey, setFlippedKey] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [flippedGalleryImage, setFlippedGalleryImage] = useState<GalleryImage | null>(null);
  const { user, profileComplete, setPendingRedirect } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadGalleryImages = async () => {
      const images = await getGalleryImages();
      setGalleryImages(images.slice(0, 6)); // Show first 6 images
    };
    loadGalleryImages();
  }, []);

  useEffect(() => {
    // Dynamically update Open Graph metadata
    const metaData = [
      { property: 'og:title', content: 'CustoSasho - Custom Graduation Stoles' },
      { property: 'og:description', content: 'Design your custom graduation stole with CustoSasho. Premium quality, kente-inspired designs celebrating African heritage and your unique journey.' },
      { property: 'og:image', content: ogImage },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: ogImage },
      { name: 'description', content: 'Design your custom graduation stole with CustoSasho. Premium quality, kente-inspired designs celebrating African heritage and your unique journey.' }
    ];

    metaData.forEach(({ property, name, content }) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (property) tag.setAttribute('property', property);
        if (name) tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
  }, []);

  const handleStartDesign = (targetPath: string) => {
    if (!user) {
      setPendingRedirect(targetPath);
      navigate(`/register?next=${encodeURIComponent(targetPath)}`);
      return;
    }

    if (!profileComplete) {
      setPendingRedirect(targetPath);
      navigate('/dashboard');
      return;
    }

    navigate(targetPath);
  };

  const sortedPackages = useMemo<[PackageKey, PackageConfig][]>(() => {
    const entries = Object.entries(PACKAGES) as [PackageKey, PackageConfig][];
    return entries.sort((a, b) => {
      if (a[0] === 'standard') return -1;
      if (b[0] === 'standard') return 1;
      return 0;
    });
  }, []);

  const getRandomFlipImage = () => {
    if (galleryImages.length === 0) {
      return null;
    }

    if (galleryImages.length === 1) {
      return galleryImages[0];
    }

    const currentId = flippedGalleryImage?.id;
    const candidatePool = currentId
      ? galleryImages.filter((image) => image.id !== currentId)
      : galleryImages;
    const randomIndex = Math.floor(Math.random() * candidatePool.length);
    return candidatePool[randomIndex] ?? galleryImages[0];
  };

  const handleFlipToSee = (key: PackageKey) => {
    const nextImage = getRandomFlipImage();
    setFlippedGalleryImage(nextImage);
    setFlippedKey(key);
  };

  const renderPackageCard = (
    [key, pkg]: [PackageKey, PackageConfig],
    index: number,
    display: 'mobile' | 'desktop',
  ) => {
    const isMobile = display === 'mobile';
    const transitionDelay = isMobile ? 0 : index * 0.2;

    const motionProps = isMobile
      ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
      : {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { delay: transitionDelay, duration: 0.6 },
      };

    return (
      <motion.div
        key={`${display}-${key}`}
        {...motionProps}
        className={`group relative flex h-full flex-col rounded-2xl border-2 bg-gradient-to-b from-app-elevated/80 to-app-surface/80 p-8 transition-all ${key === 'custom'
          ? 'border-accent-primary shadow-lg shadow-accent-primary/20 hover:border-accent-secondary'
          : 'border-border-subtle/60 hover:border-accent-primary/60'
          }`}
      >
        {key === 'custom' && (
          <div className="btn-accent-gradient absolute -top-4 left-1/2 w-max -translate-x-1/2 rounded-full px-4 py-1 text-sm font-semibold text-text-inverted shadow-md">
            Most Personalized
          </div>
        )}

        <div className="mb-6 text-center">
          <h3 className="mb-2 text-2xl font-display font-bold text-text-primary">{pkg.name}</h3>
          <div className="flex items-baseline justify-center">
            {pkg.available ? (
              <span className="text-5xl font-bold text-accent-primary">¢{pkg.price}</span>
            ) : (
              <span className="rounded-full bg-accent-primary/10 px-3 py-1 text-sm font-semibold text-accent-primary/80">
                COMING SOON
              </span>
            )}
          </div>
        </div>

        {key === 'standard' ? (
          <>
            {flippedKey === key ? (
              <div className="mb-6 flex-1 overflow-visible">
                <img
                  src={flippedGalleryImage?.imageUrl || stdImage}
                  alt="Standard preview"
                  className="mx-auto h-auto max-h-[420px] w-full rounded-lg object-contain"
                />
              </div>
            ) : (
              <ul className={`mb-6 flex-1 space-y-4 ${pkg.available ? '' : 'opacity-60'}`}>
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-accent-primary" />
                    <span className="text-sm leading-relaxed text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto flex flex-col gap-3 sm:flex-row">
              {flippedKey === key ? (
                <button
                  onClick={() => setFlippedKey(null)}
                  className="flex-1 rounded-lg bg-app-elevated py-3 font-semibold text-text-primary transition-all hover:bg-app-muted"
                >
                  Back
                </button>
              ) : pkg.available ? (
                <>
                  <button
                    onClick={() => handleStartDesign(`/designer?package=${key}`)}
                    className="btn-accent-gradient flex-1 rounded-lg py-3 font-semibold text-text-inverted transition-all hover:scale-[1.02]"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => handleFlipToSee(key)}
                    className="w-full rounded-lg border border-accent-primary py-3 font-semibold text-accent-primary transition-all hover:bg-accent-primary/10 sm:w-40"
                  >
                    Flip to See
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full rounded-lg bg-app-elevated py-3 font-semibold text-text-secondary/70 transition-all"
                >
                  Coming Soon
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <ul className={`mb-6 flex-1 space-y-4 ${pkg.available ? '' : 'opacity-60'}`}>
              {pkg.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-accent-primary" />
                  <span className="text-sm leading-relaxed text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {pkg.available ? (
                <button
                  onClick={() => handleStartDesign(`/designer?package=${key}`)}
                  className={`w-full rounded-lg py-3 font-semibold transition-all ${key === 'custom'
                    ? 'btn-accent-gradient text-text-inverted hover:scale-[1.02]'
                    : 'bg-app-elevated text-text-primary hover:bg-app-muted'
                    }`}
                >
                  Get Started
                </button>
              ) : (
                <button
                  disabled
                  className="w-full rounded-lg bg-app-elevated py-3 font-semibold text-text-secondary/70 transition-all"
                >
                  Coming Soon
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="bg-app-base text-text-primary transition-colors">
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient"></div>
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-20 left-10 h-72 w-72 rounded-full filter blur-3xl animate-pulse"
            style={{ backgroundColor: 'rgba(var(--accent-primary) / 0.45)' }}
          ></div>
          <div
            className="absolute bottom-20 right-10 h-96 w-96 rounded-full filter blur-3xl animate-pulse"
            style={{ backgroundColor: 'rgba(var(--accent-secondary) / 0.4)', animationDelay: '1s' }}
          ></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 short:py-16 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
              className="inline-block mb-2"
            >
              <img src={logo} alt="Custosasho Logo" className="mx-auto w-48 short:w-32 h-auto" />
            </motion.div>

            <h1 className="mb-2 text-5xl font-display font-bold text-transparent bg-heading-gradient bg-clip-text sm:text-6xl lg:text-7xl short:text-4xl">
              Crafted to Represent
            </h1>

            <p className="mx-auto mb-12 short:mb-6 max-w-3xl text-xl leading-relaxed text-text-secondary sm:text-2xl short:text-lg">
              Honor your heritage and celebrate your achievement with a custom graduation stole that tells your unique story
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() => handleStartDesign('/designer')}
                className="btn-accent-gradient transform rounded-lg px-8 py-4 text-lg font-semibold text-text-inverted transition-all hover:scale-105"
              >
                Design Your Stole
              </button>
              <Link
                to="/gallery"
                className="inline-block rounded-lg border-2 border-accent-primary px-8 py-4 text-lg font-semibold text-accent-primary transition-all hover:bg-accent-primary/10"
              >
                View Gallery
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 transform"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-accent-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-section-gradient py-24 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-4xl font-display font-bold text-accent-primary sm:text-5xl">
              Why Choose CustoSasho
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-text-secondary">
              Premium quality meets cultural authenticity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Palette,
                title: 'Custom Design',
                description: 'Create a stole that perfectly represents your heritage and achievements',
              },
              {
                icon: Award,
                title: 'Premium Quality',
                description: 'Handcrafted with luxury fabrics and meticulous attention to detail',
              },
              {
                icon: Sparkles,
                title: 'Cultural Pride',
                description: 'Kente-inspired designs celebrating African heritage and traditions',
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                description: 'Rush options available to meet your graduation timeline',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group rounded-xl border border-border-subtle/40 bg-app-surface/60 p-8 transition-all backdrop-blur hover:border-accent-primary/50 hover:bg-app-surface/80"
              >
                <feature.icon className="mb-4 h-12 w-12 text-accent-primary transition-transform group-hover:scale-110" />
                <h3 className="mb-3 text-xl font-semibold text-text-primary">{feature.title}</h3>
                <p className="leading-relaxed text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-app-base py-24 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-4xl font-display font-bold text-accent-primary sm:text-5xl">
              Choose Your Package
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-text-secondary">
              Select the perfect tier for your custom stole
            </p>
          </motion.div>

          <div className="-mx-4 md:hidden">
            <Swiper
              slidesPerView={1.1}
              spaceBetween={16}
              centeredSlides
              initialSlide={0}
              modules={[Pagination]}
              pagination={{ clickable: true }}
              className="pb-12"
            >
              {sortedPackages.map((entry, index) => (
                <SwiperSlide key={entry[0]} className="h-auto">
                  <div className="h-full px-4">
                    {renderPackageCard(entry, index, 'mobile')}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <p className="mt-4 text-center text-sm text-text-secondary">Swipe to explore all packages</p>
          </div>

          <div className="hidden grid-cols-1 gap-8 md:grid lg:grid-cols-3">
            {sortedPackages.map((entry, index) => renderPackageCard(entry, index, 'desktop'))}
          </div>
        </div>
      </section>

      <section className="bg-section-gradient py-24 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-4xl font-display font-bold text-accent-primary sm:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-text-secondary">
              Four simple steps to your perfect stole
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: 1, title: 'Choose Package', description: 'Select the tier that fits your vision and budget' },
              { step: 2, title: 'Design Stole', description: 'Customize colors, text, symbols, and fabrics in real-time' },
              { step: 3, title: 'Review & Order', description: 'Preview your design and complete your secure order' },
              { step: 4, title: 'Receive & Celebrate', description: 'Get your custom stole delivered in time for graduation' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative text-center"
              >
                <div className="btn-accent-gradient mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-text-inverted shadow-lg shadow-accent-primary/40">
                  {item.step}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-text-primary">{item.title}</h3>
                <p className="leading-relaxed text-text-secondary">{item.description}</p>
                {index < 3 && (
                  <div className="absolute top-8 -right-4 hidden text-4xl text-accent-primary/30 lg:block">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-section-gradient py-24 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 text-4xl font-display font-bold text-accent-primary sm:text-5xl">
              Gallery
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-text-secondary">
              See what others have created
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.length === 0 ? (
              <div className="col-span-full text-center py-12 text-text-secondary">
                Loading gallery...
              </div>
            ) : (
              galleryImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative group overflow-hidden rounded-xl aspect-square"
                >
                  <img
                    src={img.imageUrl}
                    alt={`Gallery item ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-app-base/80 via-app-base/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/gallery"
              className="inline-block rounded-lg border-2 border-accent-primary px-8 py-3 font-semibold text-accent-primary transition-all hover:bg-accent-primary/10"
            >
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
