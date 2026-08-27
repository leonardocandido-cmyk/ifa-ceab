/* ==========================================================================
   Limites da Visão & Bengala Ultrassônica - Script Principal (Tema Claro)
   Recursos: Scroll Reveal, Dynamic Item Insertion, Web Audio API Ultrasonic Alarm,
   Blind Spot Test, Image Placeholder Upload Support
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. SCROLL PROGRESS BAR & NAVBAR STATE
  const progressBar = document.getElementById('scrollProgressBar');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressBar) progressBar.style.width = scrolled + '%';

    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // 2. HAMBURGER MENU
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMenu() {
    if (!hamburgerBtn || !mobileMenuOverlay) return;
    hamburgerBtn.classList.add('is-open');
    mobileMenuOverlay.classList.add('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  }

  function closeMenu() {
    if (!hamburgerBtn || !mobileMenuOverlay) return;
    hamburgerBtn.classList.remove('is-open');
    mobileMenuOverlay.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.contains('is-open') ? closeMenu() : openMenu();
    });
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', (e) => {
      if (e.target === mobileMenuOverlay) closeMenu();
    });
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // 3. INTERSECTION OBSERVER FOR SCROLL REVEAL ANIMATIONS
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. ULTRASONIC SENSOR WEB AUDIO API SIMULATOR
  const distanceSlider = document.getElementById('distanceSlider');
  const distanceValueDisplay = document.getElementById('distanceValueDisplay');
  const toggleAlarmBtn = document.getElementById('toggleAlarmBtn');
  const simObstacle = document.getElementById('simObstacle');
  const simRadarWaves = document.getElementById('simRadarWaves');

  let audioCtx = null;
  let isAlarmActive = false;
  let beepInterval = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playBuzzerBeep(freq = 880, duration = 0.08) {
    if (!audioCtx || !isAlarmActive) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'square'; // Piezo sound waveform
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio error:", e);
    }
  }

  function updateBuzzerLoop() {
    if (beepInterval) clearInterval(beepInterval);

    if (!isAlarmActive) return;

    const distance = parseInt(distanceSlider.value, 10);
    
    // Interval logic: Closer obstacle = faster beeps & higher pitch sound!
    let intervalMs = Math.max(50, Math.round((distance / 200) * 750));
    let freq = Math.round(1200 - (distance * 3.5)); // Freq range 500Hz to 1100Hz

    playBuzzerBeep(freq, 0.07);

    beepInterval = setInterval(() => {
      if (isAlarmActive) {
        playBuzzerBeep(freq, 0.07);
      }
    }, intervalMs);
  }

  if (distanceSlider) {
    distanceSlider.addEventListener('input', (e) => {
      const dist = e.target.value;
      if (distanceValueDisplay) distanceValueDisplay.textContent = `${dist} cm`;

      if (simObstacle) {
        const offsetPercent = 8 + ((200 - dist) / 190) * 65;
        simObstacle.style.marginRight = `${offsetPercent}%`;
      }

      if (simRadarWaves) {
        const animDuration = Math.max(0.2, (dist / 200) * 1.2);
        simRadarWaves.style.animationDuration = `${animDuration}s`;
      }

      if (isAlarmActive) {
        updateBuzzerLoop();
      }
    });
  }

  if (toggleAlarmBtn) {
    toggleAlarmBtn.addEventListener('click', () => {
      initAudioContext();
      isAlarmActive = !isAlarmActive;

      if (isAlarmActive) {
        toggleAlarmBtn.classList.add('sound-active');
        toggleAlarmBtn.querySelector('span').textContent = '🔊 Desativar Alarme Sonoro';
        updateBuzzerLoop();
      } else {
        toggleAlarmBtn.classList.remove('sound-active');
        toggleAlarmBtn.querySelector('span').textContent = '🔈 Ativar Alarme Sonoro (Simulador)';
        if (beepInterval) clearInterval(beepInterval);
      }
    });
  }

  // 5. IMAGE PLACEHOLDERS CLICK & DROP TO UPLOAD PREVIEW
  const placeholders = document.querySelectorAll('.image-placeholder');

  placeholders.forEach(ph => {
    const fileInput = ph.querySelector('input[type="file"]');

    ph.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const oldImg = ph.querySelector('.preview-img');
            if (oldImg) oldImg.remove();

            const img = document.createElement('img');
            img.className = 'preview-img';
            img.src = event.target.result;
            ph.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    ph.addEventListener('dragover', (e) => {
      e.preventDefault();
      ph.style.borderColor = 'var(--primary-cyan)';
    });

    ph.addEventListener('dragleave', () => {
      ph.style.borderColor = 'rgba(2, 132, 199, 0.4)';
    });

    ph.addEventListener('drop', (e) => {
      e.preventDefault();
      ph.style.borderColor = 'rgba(2, 132, 199, 0.4)';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const oldImg = ph.querySelector('.preview-img');
          if (oldImg) oldImg.remove();

          const img = document.createElement('img');
          img.className = 'preview-img';
          img.src = event.target.result;
          ph.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  });

  // 4. BLIND SPOT EXPERIMENT INTERACTION
  const blindSpotContainer = document.getElementById('blindSpotBox');
  if (blindSpotContainer) {
    blindSpotContainer.addEventListener('click', () => {
      alert("Dica de Física: Feche o olho esquerdo, olhe fixamente para a letra 'L' com o olho direito e aproxime/afaste a cabeça do monitor (~30cm) até o sinal '+' desaparecer!");
    });
  }
});
