// Custom Cursor Movement
const magicWand = document.querySelector('.magic-wand');
let wandTrails = [];
const maxTrails = 10;

document.addEventListener('mousemove', (e) => {
    magicWand.style.left = e.clientX + 'px';
    magicWand.style.top = e.clientY + 'px';
    
    // Create magic trail
    createWandTrail(e.clientX, e.clientY);
});

function createWandTrail(x, y) {
    // Create sparkle element
    const sparkle = document.createElement('div');
    sparkle.className = 'wand-trail';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    
    // Random sparkle type
    const sparkles = ['✨', '⭐', '💫', '🌟', '✦', '★'];
    sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    
    document.body.appendChild(sparkle);
    
    // Animate and remove
    setTimeout(() => {
        sparkle.remove();
    }, 800);
}

// Get URL parameters and populate From/To fields
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function setNamesFromUrl() {
    const fromName = getUrlParameter('from');
    const toName = getUrlParameter('to');
    
    const fromInput = document.getElementById('fromName');
    const toInput = document.getElementById('toName');
    
    if (fromName) {
        fromInput.value = decodeURIComponent(fromName);
    }
    if (toName) {
        toInput.value = decodeURIComponent(toName);
    }
}

// Update URL when user types in the fields
function updateUrlParams() {
    const fromInput = document.getElementById('fromName');
    const toInput = document.getElementById('toName');
    
    fromInput.addEventListener('input', () => {
        updateUrl();
    });
    
    toInput.addEventListener('input', () => {
        updateUrl();
    });
}

function updateUrl() {
    const fromInput = document.getElementById('fromName');
    const toInput = document.getElementById('toName');
    const fromValue = fromInput.value.trim();
    const toValue = toInput.value.trim();
    
    const params = new URLSearchParams();
    if (fromValue) params.set('from', fromValue);
    if (toValue) params.set('to', toValue);
    
    const newUrl = params.toString() ? 
        `${window.location.pathname}?${params.toString()}` : 
        window.location.pathname;
    
    window.history.replaceState({}, '', newUrl);
}

// Initialize on page load
setNamesFromUrl();
updateUrlParams();

// Scroll Indicator
const scrollIndicator = document.getElementById('scrollIndicator');
const hiddenContent = document.getElementById('hiddenContent');

if (scrollIndicator && hiddenContent) {
    scrollIndicator.addEventListener('click', () => {
        // Reveal the hidden content
        hiddenContent.classList.add('revealed');
        
        // Hide the scroll indicator after revealing content
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
        
        // Scroll to the revealed content smoothly
        setTimeout(() => {
            const firstFeature = document.querySelector('.interactive-feature');
            if (firstFeature) {
                firstFeature.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 300);
    });
}

// Initial Popup
const initialPopup = document.getElementById('initialPopup');
const openCardBtn = document.getElementById('openCardBtn');
const bearAnimation = document.getElementById('bearAnimation');
const mainCard = document.getElementById('mainCard');
const bgMusic = document.getElementById('bgMusic');

openCardBtn.addEventListener('click', () => {
    // Hide popup
    initialPopup.style.animation = 'fadeOut 0.5s ease forwards';
    
    setTimeout(() => {
        initialPopup.style.display = 'none';
        
        // Show bear animation after 1 second
        setTimeout(() => {
            bearAnimation.classList.add('active');
        }, 1000);
        
        // Play music with multiple attempts
        function tryPlayMusic() {
            bgMusic.volume = 0.4;
            bgMusic.muted = false;
            
            const playPromise = bgMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('✅ Music playing successfully at 40% volume');
                }).catch(error => {
                    console.log('⚠️ Autoplay blocked. Click anywhere to start music.', error);
                    // Try unmuted play on next interaction
                    document.body.addEventListener('click', function enableMusic() {
                        bgMusic.play().then(() => {
                            console.log('✅ Music started after interaction');
                        }).catch(e => {
                            console.log('❌ Music failed:', e);
                            // Last resort: try with lower volume
                            bgMusic.volume = 0.3;
                            bgMusic.play();
                        });
                    }, { once: true });
                });
            }
        }
        
        tryPlayMusic();
        
        // Show main card after bear runs
        setTimeout(() => {
            mainCard.classList.add('visible');
            startFireworks();
            // Try music again when card appears
            if (bgMusic.paused) {
                tryPlayMusic();
            }
        }, 2000);
    }, 500);
});

// Fireworks
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fireworks = [];
let particles = [];

class Firework {
    constructor(x, y) {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetX = x || Math.random() * canvas.width;
        this.targetY = y || Math.random() * canvas.height * 0.5;
        this.speed = 2 + Math.random() * 3;
        this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        this.brightness = Math.random() * 50 + 50;
        this.color = `hsl(${Math.random() * 360}, 100%, ${this.brightness}%)`;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;

        if (Math.abs(this.x - this.targetX) < 3 && Math.abs(this.y - this.targetY) < 3) {
            this.explode();
            return false;
        }
        return true;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    explode() {
        const particleCount = 50 + Math.random() * 50;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
        }
    }
}

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

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

let fireworkInterval;

function startFireworks() {
    fireworkInterval = setInterval(() => {
        fireworks.push(new Firework());
    }, 400);
    animateFireworks();
}

function animateFireworks() {
    ctx.fillStyle = 'rgba(10, 0, 51, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks = fireworks.filter(firework => {
        firework.draw();
        return firework.update();
    });

    particles = particles.filter(particle => {
        particle.draw();
        return particle.update();
    });

    requestAnimationFrame(animateFireworks);
}

// Window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Interactive Surprise Buttons (guard in case elements are removed)
const surpriseBtn1 = document.getElementById('surpriseBtn1');
const surprise1 = document.getElementById('surprise1');

if (surpriseBtn1 && surprise1) {
    surpriseBtn1.addEventListener('click', () => {
        surprise1.classList.toggle('active');
        createExplosion(surpriseBtn1);
    });
}

// Champagne Toast Animation
const champagneBtn = document.getElementById('champagneBtn');
const champagneAnimation = document.getElementById('champagneAnimation');

if (champagneBtn && champagneAnimation) {
    champagneBtn.addEventListener('click', () => {
        champagneBtn.style.display = 'none';
        champagneAnimation.classList.add('active');
        
        // Animate cork
        const cork = document.querySelector('.champagne-cork');
        cork.classList.add('pop');
        
        // Create bubbles
        setTimeout(() => {
            createChampagneBubbles();
        }, 300);
        
        // Show message
        const message = document.querySelector('.champagne-message');
        message.classList.add('show');
        
        // Create explosion effect
        createExplosion(champagneBtn);
    });
}

function createChampagneBubbles() {
    const bubblesContainer = document.querySelector('.champagne-bubbles');
    const bubbleCount = 50;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        const size = Math.random() * 30 + 10;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = (50 + (Math.random() - 0.5) * 40) + '%';
        bubble.style.bottom = '80px';
        bubble.style.setProperty('--drift', (Math.random() - 0.5) * 200 + 'px');
        bubble.style.animationDelay = (Math.random() * 0.5) + 's';
        bubble.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        bubblesContainer.appendChild(bubble);
        
        setTimeout(() => bubble.remove(), 5000);
    }
}

const surpriseBtn3 = document.getElementById('surpriseBtn3');
const surprise3 = document.getElementById('surprise3');

if (surpriseBtn3 && surprise3) {
    surpriseBtn3.addEventListener('click', () => {
        surprise3.classList.toggle('active');
        createExplosion(surpriseBtn3);
    });
}

function createExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 5; i++) {
        fireworks.push(new Firework(centerX, centerY));
    }
}

// Lantern Release (run after page load to ensure elements exist)
function initLanternRelease() {
    const mainLantern = document.getElementById('mainLantern');
    const skyLanternsContainer = document.getElementById('skyLanternsContainer');

    if (!mainLantern || !skyLanternsContainer) {
        return;
    }

    mainLantern.addEventListener('click', () => {
        // Add opening class to trigger door animation
        mainLantern.classList.add('opening');
        
        // Get position of the lantern body (not the whole lantern)
        const lanternBody = mainLantern.querySelector('.lantern-body');
        const rect = lanternBody.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        // Wait for doors to open, then release lanterns
        setTimeout(() => {
            // Release multiple sky lanterns from inside
            const lanternCount = 8;
            for (let i = 0; i < lanternCount; i++) {
                setTimeout(() => {
                    createSkyLantern(startX, startY, skyLanternsContainer);
                }, i * 250);
            }

            // Create explosion effect at the lantern
            createExplosion(mainLantern);
        }, 600);
    });
}

function createSkyLantern(startX, startY, container) {
    if (!container) return;

    const lantern = document.createElement('div');
    lantern.className = 'sky-lantern';
    
    // Random drift values for more natural floating
    const driftStart = (Math.random() - 0.5) * 120;
    const driftEnd = (Math.random() - 0.5) * 360;
    
    lantern.style.left = startX + 'px';
    lantern.style.top = startY + 'px';
    lantern.style.setProperty('--drift-start', driftStart + 'px');
    lantern.style.setProperty('--drift-end', driftEnd + 'px');

    lantern.innerHTML = `
        <div class="sky-lantern-top"></div>
        <div class="sky-lantern-body">
            <div class="sky-lantern-flame"></div>
        </div>
        <div class="sky-lantern-bottom"></div>
    `;
    
    container.appendChild(lantern);
    
    // Remove after animation
    setTimeout(() => {
        lantern.remove();
    }, 8000);
}

// Initialize lantern click behavior (HTML is already loaded because script is at the end of body)
initLanternRelease();

// Wish Jar
const wishInput = document.getElementById('wishInput');
const visitorName = document.getElementById('visitorName');
const addWishBtn = document.getElementById('addWishBtn');
const collectedWishes = document.getElementById('collectedWishes');
const wishesDisplay = document.getElementById('wishesDisplay');
const recipientEmail = document.getElementById('recipientEmail');
let wishes = [];

// Load wishes from localStorage on page load
function loadWishesFromStorage() {
    const storedWishes = localStorage.getItem('newYearWishes');
    if (storedWishes) {
        wishes = JSON.parse(storedWishes);
        // Display all stored wishes
        wishes.forEach(wishData => {
            displayWishInJar(wishData.wish);
        });
    }
}

// Save wishes to localStorage
function saveWishesToStorage() {
    localStorage.setItem('newYearWishes', JSON.stringify(wishes));
}

// Display a single wish in the jar
function displayWishInJar(wishText) {
    const wishItem = document.createElement('div');
    wishItem.className = 'wish-item';
    wishItem.textContent = '⭐ ' + wishText;
    collectedWishes.prepend(wishItem);
    
    // Scroll to bottom to show the new wish
    const jarBody = collectedWishes.parentElement;
    jarBody.scrollTop = jarBody.scrollHeight;
}

// Load wishes when page loads
loadWishesFromStorage();

addWishBtn.addEventListener('click', () => {
    const wish = wishInput.value.trim();
    const name = visitorName.value.trim() || 'Anonymous';
    
    if (wish) {
        // Save to array
        const wishData = { name, wish, date: new Date().toLocaleString() };
        wishes.push(wishData);
        
        // Save to localStorage
        saveWishesToStorage();
        
        // Display in jar
        displayWishInJar(wish);
        
        // Send email via FormSubmit
        sendWishEmail(name, wish);
        
        // Clear inputs
        wishInput.value = '';
        visitorName.value = '';
        
        // Create celebration
        createWishCelebration();
    }
});

function sendWishEmail(name, wish) {
    const email = recipientEmail.value;
    
    // Use FormSubmit.io for free email sending
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
    .then(data => {
        console.log('Wish sent to email successfully!', data);
    })
    .catch(error => {
        console.log('Email sending failed (but wish is saved locally):', error);
    });
}

function createWishCelebration() {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            fireworks.push(new Firework());
        }, i * 100);
    }
}

// Confetti Button
const confettiBtn = document.getElementById('confettiBtn');

confettiBtn.addEventListener('click', () => {
    createConfetti();
});

function createConfetti() {
    const colors = ['#ff6b9d', '#ffd700', '#4ecdc4', '#667eea', '#f093fb'];
    const confettiCount = 150;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
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
        
        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }
    
    // Add extra fireworks
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            fireworks.push(new Firework());
        }, i * 150);
    }
}

// Music Control
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');
let isMusicPlaying = true;

musicBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicIcon.textContent = '🔇';
        isMusicPlaying = false;
    } else {
        bgMusic.play().catch(e => console.log('Music play prevented'));
        musicIcon.textContent = '🔊';
        isMusicPlaying = true;
    }
});

// Auto-start music on any user interaction
document.addEventListener('click', function startMusic() {
    if (bgMusic.paused && isMusicPlaying) {
        bgMusic.volume = 0.4; // Set volume to 40%
        bgMusic.play().catch(e => console.log('Music autoplay prevented'));
    }
}, { once: true });

// Name inputs animation
const fromName = document.getElementById('fromName');
const toName = document.getElementById('toName');

[fromName, toName].forEach(input => {
    input.addEventListener('focus', () => {
        createSparkles(input);
    });
});

function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 3; i++) {
        fireworks.push(new Firework(centerX, centerY));
    }
}

// Scroll animation trigger
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled > 100) {
        // Add more fireworks on scroll
        if (Math.random() > 0.95) {
            fireworks.push(new Firework());
        }
    }
});

// Add fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Random automatic fireworks burst
setInterval(() => {
    if (mainCard.classList.contains('visible')) {
        const burstCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < burstCount; i++) {
            setTimeout(() => {
                fireworks.push(new Firework());
            }, i * 100);
        }
    }
}, 5000);

// Create magical trail effect on cursor movement
let lastTrailTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime > 100) {
        createMagicTrail(e.clientX, e.clientY);
        lastTrailTime = now;
    }
});

function createMagicTrail(x, y) {
    const trail = document.createElement('div');
    trail.style.position = 'fixed';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    trail.style.width = '5px';
    trail.style.height = '5px';
    trail.style.borderRadius = '50%';
    trail.style.background = 'rgba(255, 215, 0, 0.8)';
    trail.style.pointerEvents = 'none';
    trail.style.zIndex = '9999';
    document.body.appendChild(trail);
    
    trail.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0)', opacity: 0 }
    ], {
        duration: 500,
        easing: 'ease-out'
    });
    
    setTimeout(() => trail.remove(), 500);
}

console.log('🎊 Happy New Year 2026! 🎊');
