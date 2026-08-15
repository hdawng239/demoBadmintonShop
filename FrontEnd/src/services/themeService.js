export const themeService = {
  getTheme: () => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  },

  toggleTheme: () => {
    const current = themeService.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    themeService.setTheme(next);
    return next;
  },

  initTheme: () => {
    const current = themeService.getTheme();
    if (current === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};
