import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ChatBot from '../common/ChatBot';
import { themeService } from '../../services/themeService';

const MainLayout = ({ children }) => {
  const location = useLocation();

  // Initialize theme on mount
  useEffect(() => {
    themeService.initTheme();
  }, []);

  // Continuous Two-Way Scroll Reveal (Scroll Up & Down)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
            } else {
              // Re-arm animation when scrolling out of view so it repeats seamlessly!
              entry.target.classList.remove('is-revealed');
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -40px 0px',
          threshold: 0.05
        }
      );

      const targets = document.querySelectorAll(
        'section, .reveal-on-scroll, aside, .card-hover-effect'
      );

      targets.forEach((el) => {
        if (!el.classList.contains('reveal-on-scroll')) {
          el.classList.add('reveal-on-scroll');
        }
        observer.observe(el);
      });

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, children]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] dark:bg-[#0b0c10] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default MainLayout;
