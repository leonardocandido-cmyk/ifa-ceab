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

  // 2. INTERSECTION OBSERVER FOR SCROLL REVEAL ANIMATIONS
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

  // 3. DYNAMIC SCROLL FEED (ITEM INSERTION AS YOU SCROLL)
  const feedContainer = document.getElementById('dynamicFeedContainer');
  const feedTrigger = document.getElementById('feedTrigger');

  // Database of project updates / physics facts to dynamically insert on scroll
  const dynamicUpdates = [
    {
      date: "Semana 1",
      title: "Mapeamento da Fisiologia Ocular e Óptica",
      content: "Estudo comparativo entre a câmera fotográfica e a anatomia do olho: Córnea e Cristalino como lentes convergentes biológicas, Pupila como diafragma/abertura e Retina como sensor de captura de imagem.",
      tags: ["Anatomia do Olho", "Óptica Biológica", "Fisiologia"]
    },
    {
      date: "Semana 2",
      title: "Análise Óptica dos Erros de Refração (Ametropias)",
      content: "Investigação sobre a Miopia (foco antes da retina), Hipermetropia (foco atrás da retina) e o uso de lentes divergentes e convergentes para correção da distância focal.",
      tags: ["Miopia", "Hipermetropia", "Lentes Corretivas"]
    },
    {
      date: "Semana 3",
      title: "Física do Sensor Ultrassônico HC-SR04",
      content: "Cálculo da velocidade do som no ar (v ≈ 343 m/s à 20°C). O sensor emite pulsos de 40kHz (inaudíveis aos humanos) e mede o intervalo até o retorno do eco: Distância = (Tempo * v) / 2.",
      tags: ["Física Ondulatória", "Ultrassom", "Acústica"]
    },
    {
      date: "Semana 4",
      title: "Montagem da Eletrônica & Arduino Nano",
      content: "Integração do microcontrolador com os pinos Trigger/Echo e o módulo piezoelétrico Buzzer. Desenvolvimento do código em C++ com modulação da frequência sonora baseada na proximidade.",
      tags: ["Robótica", "Arduino", "Programação C++"]
    },
    {
      date: "Semana 5",
      title: "Calibração da Resolução e Modulação de Alerta",
      content: "Definição de zonas de perigo: Objetos a menos de 30cm disparam alerta sonoro contínuo e rápido, enquanto distâncias de 30cm a 200cm produzem bips espaçados.",
      tags: ["Calibração", "Tecnologia Assistiva", "IFA"]
    },
    {
      date: "Semana 6",
      title: "Testes Práticos e Validação no CEAB",
      content: "Ensaio com estudantes vendados simulando deficiência visual severa. A bengala ultrassônica garantiu um tempo de reação de menos de 0.2s, evitando colisões com obstáculos!",
      tags: ["Projeto Integrador", "CEAB 2° Ano", "Acessibilidade"]
    }
  ];

  let currentFeedIndex = 0;
  let isLoadingFeed = false;

  function loadNextFeedItems(count = 2) {
    if (isLoadingFeed || currentFeedIndex >= dynamicUpdates.length) return;
    isLoadingFeed = true;

    for (let i = 0; i < count && currentFeedIndex < dynamicUpdates.length; i++) {
      const item = dynamicUpdates[currentFeedIndex];
      const feedCard = document.createElement('div');
      feedCard.className = 'feed-item';
      feedCard.innerHTML = `
        <div class="feed-date">${item.date}</div>
        <div class="feed-body">
          <h4>${item.title}</h4>
          <p>${item.content}</p>
          <div class="feed-tags">
            ${item.tags.map(t => `<span class="feed-tag">#${t}</span>`).join('')}
          </div>
        </div>
      `;
      feedContainer.appendChild(feedCard);
      currentFeedIndex++;
    }

    isLoadingFeed = false;

    if (currentFeedIndex >= dynamicUpdates.length && feedTrigger) {
      feedTrigger.innerHTML = `<span style="color: var(--text-dim); font-weight: 600;">✨ Todos os registros de física e engenharia do 2° Ano foram carregados!</span>`;
    }
  }

  // Initial load of first 2 items
  loadNextFeedItems(2);

  // Observer to load more items when scrolling down to feedTrigger
  if (feedTrigger) {
    const feedObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => {
          loadNextFeedItems(2);
        }, 400);
      }
    }, { threshold: 0.4 });
    feedObserver.observe(feedTrigger);
  }

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
        toggleAlarmBtn.innerHTML = `<span>🔊 Desativar Alarme Sonoro</span>`;
        updateBuzzerLoop();
      } else {
        toggleAlarmBtn.classList.remove('sound-active');
        toggleAlarmBtn.innerHTML = `<span>🔈 Ativar Alarme Sonoro (Simulador)</span>`;
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

  // 6. BLIND SPOT EXPERIMENT INTERACTION
  const blindSpotContainer = document.getElementById('blindSpotBox');
  if (blindSpotContainer) {
    blindSpotContainer.addEventListener('click', () => {
      alert("Dica de Física: Feche o olho esquerdo, olhe fixamente para a letra 'L' com o olho direito e aproxime/afaste a cabeça do monitor (~30cm) até o sinal '+' desaparecer!");
    });
  }
});
