document.addEventListener('DOMContentLoaded', () => {
  const toggleText = document.getElementById('mode-toggle');  
  let currentTheme = localStorage.getItem('theme') || 'dark';

  // Theme beim Laden setzen
  document.documentElement.setAttribute('data-theme', currentTheme);
  toggleText.textContent = currentTheme === 'dark' ? '☀️ Hellmodus' : '🌙 Dunkelmodus';

  toggleText.addEventListener('click', () => {
    // Toggle
    currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    toggleText.textContent = currentTheme === 'dark' ? '☀️ Hellmodus' : '🌙 Dunkelmodus';
  });
});






let player, container;

// YouTube API laden
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
  // API ready – Player wird später erstellt
}

function setupEmbed() {
  const id = container.dataset.videoId;
  container.innerHTML = `<div id="yt-player"></div>`;
  player = new YT.Player('yt-player', {
    videoId: id,
    playerVars: {
      autoplay: 1,
      rel: 0,
      controls: 1,
      modestbranding: 1,
      enablejsapi: 1,
      playsinline: 1,
      mute: 1 // startet stumm
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(e) {
  e.target.playVideo();
  attemptFullscreen();
  addCloseButton();
}

function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) {
    destroyPlayer(); // nur beim Ende zurücksetzen
  }
}

function addCloseButton() {
  const btn = document.createElement('button');
  btn.textContent = '✕';
  Object.assign(btn.style, {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    zIndex: 9999,
    fontSize: '1.5rem',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer'
  });
  btn.onclick = destroyPlayer;
  document.getElementById('yt-player').appendChild(btn);
}

function attemptFullscreen() {
  const iframe = document.querySelector('#yt-player iframe');
  if (iframe.requestFullscreen) iframe.requestFullscreen();
  else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
}

function destroyPlayer() {
  if (player) {
    player.destroy();
    player = null;
  }
  renderThumbnail();
}

function renderThumbnail() {
  const id = container.dataset.videoId;
  container.innerHTML = `
    <img src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
         alt="Video Thumbnail"
         loading="lazy" />
  `;
  container.onclick = () => setupEmbed(); // nur auf thumbnail reagieren
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  container = document.querySelector('.youtube-embed');
  renderThumbnail();
});


document.addEventListener('DOMContentLoaded', () => {
  // Direkt beim Laden: "HOME" als aktive Sektion festlegen
  document.querySelector('nav a[href="#home"]').classList.add('active');

  // Scroll‑Spy – markiert den jeweils aktiven Navi-Link
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const id = e.target.id;
      const link = document.querySelector(`nav a[href="#${id}"]`);
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        link?.classList.add('active');
      }
    });
  }, {
    root: document.querySelector('.parallax-container'),
    threshold: 0.6
  });

  sections.forEach(sec => observer.observe(sec));
});






