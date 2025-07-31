document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('a.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const toggleBtn = document.getElementById('mode-toggle');
  let theme = localStorage.getItem('theme') || 'dark';

  document.documentElement.setAttribute('data-theme', theme);
  toggleBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

  toggleBtn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    toggleBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  });

  navLinks.forEach(l => l.classList.remove('active'));
  document.querySelector('a[href="#home"]').classList.add('active');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const link = document.querySelector(`.sticky-nav a[href="#${entry.target.id}"]`);
        navLinks.forEach(l => l.classList.remove('active'));
        link?.classList.add('active');
      }
    });
  }, { root: null, threshold: 0.5 });
  sections.forEach(sec => observer.observe(sec));
});
