// =============================================================================
// CONFIGURATION & CONSTANTS
// =============================================================================
const CONFIG = {
    MUSIC_VOLUME: 0.4,
    FIREWORK_INTERVAL: 400,
    AUTO_FIREWORK_BURST_INTERVAL: 5000,
    TRAIL_THROTTLE: 100,
    SPARKLE_LIFETIME: 800,
    CONFETTI_COUNT: 150,
    WISH_JAR_STORAGE_KEY: 'newYearWishes'
};

const SPARKLE_TYPES = ['✨', '⭐', '💫', '🌟', '✦', '★'];
const CONFETTI_COLORS = ['#ff6b9d', '#ffd700', '#4ecdc4', '#667eea', '#f093fb'];

// =============================================================================
// CURSOR & VISUAL EFFECTS MODULE
// =============================================================================
const CursorEffects = {
    magicWand: null,
    lastTrailTime: 0,

    init() {
        this.magicWand = document.querySelector('.magic-wand');
        this.bindEvents();
    },

    bindEvents() {
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    },

    handleMouseMove(e) {
        if (this.magicWand) {
            this.magicWand.style.left = e.clientX + 'px';
            this.magicWand.style.top = e.clientY + 'px';
        }
        this.createWandTrail(e.clientX, e.clientY);
        
        // Throttled magic trail
        const now = Date.now();
        if (now - this.lastTrailTime > CONFIG.TRAIL_THROTTLE) {
            this.createMagicTrail(e.clientX, e.clientY);
            this.lastTrailTime = now;
        }
    },

    createWandTrail(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'wand-trail';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.textContent = SPARKLE_TYPES[Math.floor(Math.random() * SPARKLE_TYPES.length)];
        
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), CONFIG.SPARKLE_LIFETIME);
    },

    createMagicTrail(x, y) {
        const trail = document.createElement('div');
        trail.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: rgba(255, 215, 0, 0.8);
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(trail);
        
        trail.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0)', opacity: 0 }
        ], { duration: 500, easing: 'ease-out' });
        
        setTimeout(() => trail.remove(), 500);
    },

    createSparkles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 3; i++) {
            FireworksEngine.addFirework(centerX, centerY);
        }
    }
};

// =============================================================================
// URL PARAMETERS MODULE
// =============================================================================
const URLManager = {
    fromInput: null,
    toInput: null,

    init() {
        this.fromInput = document.getElementById('fromName');
        this.toInput = document.getElementById('toName');
        
        this.setNamesFromUrl();
        this.bindEvents();
    },

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    setNamesFromUrl() {
        const fromName = this.getUrlParameter('from');
        const toName = this.getUrlParameter('to');
        
        if (fromName && this.fromInput) {
            this.fromInput.value = decodeURIComponent(fromName);
        }
        if (toName && this.toInput) {
            this.toInput.value = decodeURIComponent(toName);
        }
    },

    bindEvents() {
        if (this.fromInput) {
            this.fromInput.addEventListener('input', () => this.updateUrl());
        }
        if (this.toInput) {
            this.toInput.addEventListener('input', () => this.updateUrl());
        }
    },

    updateUrl() {
        const fromValue = this.fromInput?.value.trim() || '';
        const toValue = this.toInput?.value.trim() || '';
        
        const params = new URLSearchParams();
        if (fromValue) params.set('from', fromValue);
        if (toValue) params.set('to', toValue);
        
        const newUrl = params.toString() ? 
            `${window.location.pathname}?${params.toString()}` : 
            window.location.pathname;
        
        window.history.replaceState({}, '', newUrl);
    }
};

// =============================================================================
// SCROLL MANAGER MODULE
// =============================================================================
const ScrollManager = {
    scrollIndicator: null,
    hiddenContent: null,

    init() {
        this.scrollIndicator = document.getElementById('scrollIndicator');
        this.hiddenContent = document.getElementById('hiddenContent');
        
        if (this.scrollIndicator && this.hiddenContent) {
            this.bindEvents();
        }
        
        window.addEventListener('scroll', () => this.handleScroll());
    },

    bindEvents() {
        this.scrollIndicator.addEventListener('click', () => this.revealContent());
    },

    revealContent() {
        this.hiddenContent.classList.add('revealed');
        this.scrollIndicator.style.opacity = '0';
        this.scrollIndicator.style.pointerEvents = 'none';
        
        setTimeout(() => {
            const firstFeature = document.querySelector('.interactive-feature');
            if (firstFeature) {
                firstFeature.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 300);
    },

    handleScroll() {
        const scrolled = window.scrollY;
        if (scrolled > 100 && Math.random() > 0.95) {
            FireworksEngine.addFirework();
        }
    }
};

// =============================================================================
// POPUP & ANIMATION MANAGER MODULE
// =============================================================================
const PopupManager = {
    initialPopup: null,
    openCardBtn: null,
    bearAnimation: null,
    mainCard: null,

    init() {
        this.initialPopup = document.getElementById('initialPopup');
        this.openCardBtn = document.getElementById('openCardBtn');
        this.bearAnimation = document.getElementById('bearAnimation');
        this.mainCard = document.getElementById('mainCard');
        
        this.bindEvents();
    },

    bindEvents() {
        if (this.openCardBtn) {
            this.openCardBtn.addEventListener('click', () => this.handleOpenCard());
        }
    },

    handleOpenCard() {
        this.initialPopup.style.animation = 'fadeOut 0.5s ease forwards';
        
        setTimeout(() => {
            this.initialPopup.style.display = 'none';
            
            setTimeout(() => {
                this.bearAnimation.classList.add('active');
            }, 1000);
            
            MusicManager.tryPlayMusic();
            
            setTimeout(() => {
                this.mainCard.classList.add('visible');
                FireworksEngine.start();
                
                if (MusicManager.bgMusic.paused) {
                    MusicManager.tryPlayMusic();
                }
            }, 2000);
        }, 500);
    }
};

// =============================================================================
// FIREWORKS ENGINE MODULE
// =============================================================================
const FireworksEngine = {
    canvas: null,
    ctx: null,
    fireworks: [],
    particles: [],
    fireworkInterval: null,

    init() {
        this.canvas = document.getElementById('fireworksCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => this.handleResize());
        
        // Auto firework bursts
        setInterval(() => this.createAutoBurst(), CONFIG.AUTO_FIREWORK_BURST_INTERVAL);
    },

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    start() {
        this.fireworkInterval = setInterval(() => {
            this.addFirework();
        }, CONFIG.FIREWORK_INTERVAL);
        this.animate();
    },

    addFirework(x, y) {
        this.fireworks.push(new Firework(x, y));
    },

    animate() {
        this.ctx.fillStyle = 'rgba(10, 0, 51, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.fireworks = this.fireworks.filter(firework => {
            firework.draw(this.ctx);
            return firework.update(this.particles);
        });

        this.particles = this.particles.filter(particle => {
            particle.draw(this.ctx);
            return particle.update();
        });

        requestAnimationFrame(() => this.animate());
    },

    createAutoBurst() {
        if (document.getElementById('mainCard')?.classList.contains('visible')) {
            const burstCount = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < burstCount; i++) {
                setTimeout(() => this.addFirework(), i * 100);
            }
        }
    },

    createExplosion(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 5; i++) {
            this.addFirework(centerX, centerY);
        }
    }
};

// Firework Class
class Firework {
    constructor(x, y) {
        this.x = Math.random() * (FireworksEngine.canvas?.width || window.innerWidth);
        this.y = FireworksEngine.canvas?.height || window.innerHeight;
        this.targetX = x || Math.random() * (FireworksEngine.canvas?.width || window.innerWidth);
        this.targetY = y || Math.random() * (FireworksEngine.canvas?.height || window.innerHeight) * 0.5;
        this.speed = 2 + Math.random() * 3;
        this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        this.brightness = Math.random() * 50 + 50;
        this.color = `hsl(${Math.random() * 360}, 100%, ${this.brightness}%)`;
    }

    update(particles) {
        this.x += this.velocityX;
        this.y += this.velocityY;

        if (Math.abs(this.x - this.targetX) < 3 && Math.abs(this.y - this.targetY) < 3) {
            this.explode(particles);
            return false;
        }
        return true;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    explode(particles) {
        const particleCount = 50 + Math.random() * 50;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
        }
    }
}

// Particle Class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.gravity = 0.1;
    }

    update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
        return this.alpha > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// =============================================================================
// MUSIC MANAGER MODULE
// =============================================================================
const MusicManager = {
    bgMusic: null,
    musicBtn: null,
    musicIcon: null,
    isMusicPlaying: true,

    init() {
        this.bgMusic = document.getElementById('bgMusic');
        this.musicBtn = document.getElementById('musicBtn');
        this.musicIcon = document.getElementById('musicIcon');
        
        this.bindEvents();
    },

    bindEvents() {
        if (this.musicBtn) {
            this.musicBtn.addEventListener('click', () => this.toggleMusic());
        }
        
        // Auto-start music on user interaction
        document.addEventListener('click', () => this.autoStartMusic(), { once: true });
    },

    tryPlayMusic() {
        if (!this.bgMusic) return;
        
        this.bgMusic.volume = CONFIG.MUSIC_VOLUME;
        this.bgMusic.muted = false;
        
        const playPromise = this.bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('✅ Music playing successfully');
            }).catch(error => {
                console.log('⚠️ Autoplay blocked. Click anywhere to start music.', error);
                document.body.addEventListener('click', () => {
                    this.bgMusic.play().catch(e => {
                        console.log('❌ Music failed:', e);
                        this.bgMusic.volume = 0.3;
                        this.bgMusic.play();
                    });
                }, { once: true });
            });
        }
    },

    toggleMusic() {
        if (this.isMusicPlaying) {
            this.bgMusic.pause();
            this.musicIcon.textContent = '🔇';
            this.isMusicPlaying = false;
        } else {
            this.bgMusic.play().catch(e => console.log('Music play prevented'));
            this.musicIcon.textContent = '🔊';
            this.isMusicPlaying = true;
        }
    },

    autoStartMusic() {
        if (this.bgMusic && this.bgMusic.paused && this.isMusicPlaying) {
            this.bgMusic.volume = CONFIG.MUSIC_VOLUME;
            this.bgMusic.play().catch(e => console.log('Music autoplay prevented'));
        }
    }
};

// =============================================================================
// INTERACTIVE FEATURES MODULE
// =============================================================================
const InteractiveFeatures = {
    init() {
        this.initSurpriseButtons();
        this.initChampagneButton();
        this.initLanternRelease();
        this.initConfettiButton();
        this.initNameInputs();
    },

    initSurpriseButtons() {
        const surpriseBtn1 = document.getElementById('surpriseBtn1');
        const surprise1 = document.getElementById('surprise1');
        
        if (surpriseBtn1 && surprise1) {
            surpriseBtn1.addEventListener('click', () => {
                surprise1.classList.toggle('active');
                FireworksEngine.createExplosion(surpriseBtn1);
            });
        }

        const surpriseBtn3 = document.getElementById('surpriseBtn3');
        const surprise3 = document.getElementById('surprise3');
        
        if (surpriseBtn3 && surprise3) {
            surpriseBtn3.addEventListener('click', () => {
                surprise3.classList.toggle('active');
                FireworksEngine.createExplosion(surpriseBtn3);
            });
        }
    },

    initChampagneButton() {
        const champagneBtn = document.getElementById('champagneBtn');
        const champagneAnimation = document.getElementById('champagneAnimation');

        if (!champagneBtn || !champagneAnimation) return;

        champagneBtn.addEventListener('click', () => {
            champagneBtn.style.display = 'none';
            champagneAnimation.classList.add('active');
            
            const cork = document.querySelector('.champagne-cork');
            cork?.classList.add('pop');
            
            setTimeout(() => this.createChampagneBubbles(), 300);
            
            const message = document.querySelector('.champagne-message');
            message?.classList.add('show');
            
            FireworksEngine.createExplosion(champagneBtn);
        });
    },

    createChampagneBubbles() {
        const bubblesContainer = document.querySelector('.champagne-bubbles');
        if (!bubblesContainer) return;
        
        const bubbleCount = 50;
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            const size = Math.random() * 30 + 10;
            bubble.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${50 + (Math.random() - 0.5) * 40}%;
                bottom: 80px;
                --drift: ${(Math.random() - 0.5) * 200}px;
                animation-delay: ${Math.random() * 0.5}s;
                animation-duration: ${Math.random() * 2 + 2}s;
            `;
            
            bubblesContainer.appendChild(bubble);
            setTimeout(() => bubble.remove(), 5000);
        }
    },

    initLanternRelease() {
        const mainLantern = document.getElementById('mainLantern');
        const skyLanternsContainer = document.getElementById('skyLanternsContainer');

        if (!mainLantern || !skyLanternsContainer) return;

        mainLantern.addEventListener('click', () => {
            mainLantern.classList.add('opening');
            
            const lanternBody = mainLantern.querySelector('.lantern-body');
            const rect = lanternBody.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;

            setTimeout(() => {
                const lanternCount = 8;
                for (let i = 0; i < lanternCount; i++) {
                    setTimeout(() => {
                        this.createSkyLantern(startX, startY, skyLanternsContainer);
                    }, i * 250);
                }

                FireworksEngine.createExplosion(mainLantern);
            }, 600);
        });
    },

    createSkyLantern(startX, startY, container) {
        if (!container) return;

        const lantern = document.createElement('div');
        lantern.className = 'sky-lantern';
        
        const driftStart = (Math.random() - 0.5) * 120;
        const driftEnd = (Math.random() - 0.5) * 360;
        
        lantern.style.cssText = `
            left: ${startX}px;
            top: ${startY}px;
            --drift-start: ${driftStart}px;
            --drift-end: ${driftEnd}px;
        `;

        lantern.innerHTML = `
            <div class="sky-lantern-top"></div>
            <div class="sky-lantern-body">
                <div class="sky-lantern-flame"></div>
            </div>
            <div class="sky-lantern-bottom"></div>
        `;
        
        container.appendChild(lantern);
        setTimeout(() => lantern.remove(), 8000);
    },

    initConfettiButton() {
        const confettiBtn = document.getElementById('confettiBtn');
        
        if (confettiBtn) {
            confettiBtn.addEventListener('click', () => this.createConfetti());
        }
    },

    createConfetti() {
        const confettiCount = CONFIG.CONFETTI_COUNT;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background-color: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
                left: ${Math.random() * window.innerWidth}px;
                top: -10px;
                z-index: 9999;
                pointer-events: none;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            `;
            document.body.appendChild(confetti);
            
            const duration = 2 + Math.random() * 2;
            const xMovement = (Math.random() - 0.5) * 200;
            
            confetti.animate([
                { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight}px) translateX(${xMovement}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            setTimeout(() => confetti.remove(), duration * 1000);
        }
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => FireworksEngine.addFirework(), i * 150);
        }
    },

    initNameInputs() {
        const fromName = document.getElementById('fromName');
        const toName = document.getElementById('toName');

        [fromName, toName].forEach(input => {
            if (input) {
                input.addEventListener('focus', () => CursorEffects.createSparkles(input));
            }
        });
    }
};

// =============================================================================
// WISH JAR MODULE
// =============================================================================
const WishJar = {
    wishInput: null,
    visitorName: null,
    addWishBtn: null,
    collectedWishes: null,
    recipientEmail: null,
    wishes: [],

    init() {
        this.wishInput = document.getElementById('wishInput');
        this.visitorName = document.getElementById('visitorName');
        this.addWishBtn = document.getElementById('addWishBtn');
        this.collectedWishes = document.getElementById('collectedWishes');
        this.recipientEmail = document.getElementById('recipientEmail');
        
        this.loadWishesFromStorage();
        this.bindEvents();
    },

    bindEvents() {
        if (this.addWishBtn) {
            this.addWishBtn.addEventListener('click', () => this.handleAddWish());
        }
    },

    loadWishesFromStorage() {
        const storedWishes = localStorage.getItem(CONFIG.WISH_JAR_STORAGE_KEY);
        if (storedWishes) {
            this.wishes = JSON.parse(storedWishes);
            this.wishes.forEach(wishData => this.displayWishInJar(wishData.wish));
        }
    },

    saveWishesToStorage() {
        localStorage.setItem(CONFIG.WISH_JAR_STORAGE_KEY, JSON.stringify(this.wishes));
    },

    displayWishInJar(wishText) {
        if (!this.collectedWishes) return;
        
        const wishItem = document.createElement('div');
        wishItem.className = 'wish-item';
        wishItem.textContent = '⭐ ' + wishText;
        this.collectedWishes.prepend(wishItem);
        
        const jarBody = this.collectedWishes.parentElement;
        if (jarBody) {
            jarBody.scrollTop = jarBody.scrollHeight;
        }
    },

    handleAddWish() {
        const wish = this.wishInput?.value.trim();
        const name = this.visitorName?.value.trim() || 'Anonymous';
        
        if (!wish) return;
        
        const wishData = { name, wish, date: new Date().toLocaleString() };
        this.wishes.push(wishData);
        
        this.saveWishesToStorage();
        this.displayWishInJar(wish);
        this.sendWishEmail(name, wish);
        
        if (this.wishInput) this.wishInput.value = '';
        if (this.visitorName) this.visitorName.value = '';
        
        this.createWishCelebration();
    },

    sendWishEmail(name, wish) {
        if (!this.recipientEmail) return;
        
        const email = this.recipientEmail.value;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('wish', wish);
        formData.append('_subject', `New Year Wish from ${name} 🎊`);
        formData.append('_captcha', 'false');
        
        fetch(`https://formsubmit.co/ajax/${email}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => console.log('Wish sent to email successfully!', data))
        .catch(error => console.log('Email sending failed (but wish is saved locally):', error));
    },

    createWishCelebration() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => FireworksEngine.addFirework(), i * 100);
        }
    }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
const Utils = {
    addFadeOutAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
};

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================
// Initialize all modules when DOM is ready
CursorEffects.init();
URLManager.init();
ScrollManager.init();
PopupManager.init();
FireworksEngine.init();
MusicManager.init();
InteractiveFeatures.init();
WishJar.init();
Utils.addFadeOutAnimation();

console.log('🎊 Happy New Year 2026! 🎊');

