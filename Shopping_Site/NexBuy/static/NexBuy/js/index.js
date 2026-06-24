// ========== GSAP SCROLL ANIMATIONS ==========
gsap.registerPlugin(ScrollTrigger);

// Target specific components rather than layout-heavy section wrappers to prevent scroll paint stutters
gsap.utils.toArray('.features-header, .features-content, .pricing-header, .pricing-cards, .trending-grid, .final-cta').forEach((el) => {
    gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none'
        }
    });
});


// ========== PAGE LOAD ANIMATIONS ==========
gsap.from('.hero-left .ai-badge', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.out', delay: 0.3 });
gsap.from('.hero-title', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.4 });
gsap.from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 0.6 });
gsap.from('.hero-left .hero-buttons', { opacity: 0, y: 15, duration: 0.8, ease: 'power3.out', delay: 0.75 });
gsap.from('.card-stack-container', { opacity: 0, x: 80, duration: 1.0, ease: 'power3.out', delay: 0.5 });


// ========== STATS COUNT-UP ANIMATION ==========
const statNumbers = document.querySelectorAll('.stat-number');
statNumbers.forEach(stat => {
    const target = parseFloat(stat.dataset.target);
    gsap.fromTo(stat, 
        { textContent: 0 }, 
        { 
            textContent: target,
            duration: 1.8, 
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
                trigger: '.hero-stats-strip',
                start: 'top 95%',
                toggleActions: 'play none none none'
            }
        }
    );
});


// ========== INTERACTIVE CARD STACK ==========
let cards = Array.from(document.querySelectorAll('.stack-card'));
let activeIndex = 1; // Center card (iPhone 16 Pro) initially active
let isDragging = false;
let isScrolling = false;
let startX = 0;

function updateCardPositions() {
    const totalCards = cards.length;
    cards.forEach((card, idx) => {
        card.classList.remove('pos-center', 'pos-left', 'pos-right', 'pos-hidden-left', 'pos-hidden-right');
        
        let leftIdx = (activeIndex - 1 + totalCards) % totalCards;
        let rightIdx = (activeIndex + 1) % totalCards;
        
        if (idx === activeIndex) {
            card.classList.add('pos-center');
        } else if (idx === leftIdx) {
            card.classList.add('pos-left');
        } else if (idx === rightIdx) {
            card.classList.add('pos-right');
        } else {
            // Determine shortest distance around the circle to decide hidden direction
            let diff = idx - activeIndex;
            if (diff > totalCards / 2) diff -= totalCards;
            if (diff < -totalCards / 2) diff += totalCards;
            
            if (diff < 0) {
                card.classList.add('pos-hidden-left');
            } else {
                card.classList.add('pos-hidden-right');
            }
        }
    });
}

// Initialize positions
if (cards.length > 0) {
    updateCardPositions();
}

// Click on side card to focus it
cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
        if (!card.classList.contains('pos-center') && window.innerWidth > 768) {
            activeIndex = idx;
            updateCardPositions();
        }
    });
});

// Arrow Navigation Click handlers
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        activeIndex = (activeIndex - 1 + cards.length) % cards.length;
        updateCardPositions();
    });
}
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        activeIndex = (activeIndex + 1) % cards.length;
        updateCardPositions();
    });
}

// Scroll wheel cycle interaction (de-sensitized trackpad/wheel support)
const stackContainer = document.querySelector('.card-stack-container');
let accumulatedDelta = 0;
const deltaThreshold = 100; // Accumulated scroll distance required

if (stackContainer) {
    stackContainer.addEventListener('wheel', (e) => {
        if (window.innerWidth <= 768) return; // Allow natural scrolling on mobile
        e.preventDefault();
        
        let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        accumulatedDelta += delta;

        if (isScrolling) return;

        if (Math.abs(accumulatedDelta) >= deltaThreshold) {
            isScrolling = true;
            if (accumulatedDelta > 0) {
                activeIndex = (activeIndex + 1) % cards.length;
            } else {
                activeIndex = (activeIndex - 1 + cards.length) % cards.length;
            }
            updateCardPositions();
            accumulatedDelta = 0;
            
            setTimeout(() => {
                isScrolling = false;
                accumulatedDelta = 0;
            }, 800); // Throttling wheel transition speed to 800ms for stable scrolling
        }
    }, { passive: false });
}

// Drag & Swipe gesture interaction
if (stackContainer) {
    stackContainer.addEventListener('mousedown', (e) => {
        // Ignore drag start if clicking inner action buttons or navigation buttons
        if (e.target.closest('.card-action-btn') || e.target.closest('.stack-nav-btn')) return;
        
        startX = e.clientX;
        isDragging = true;
        document.querySelector('.pos-center')?.classList.add('dragging');
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let diffX = e.clientX - startX;
        const centerCard = document.querySelector('.pos-center');
        if (centerCard) {
            centerCard.style.transform = `translate3d(${diffX * 0.4}px, 0, 0) scale(1) rotateY(${diffX * 0.04}deg)`;
        }
    });
    
    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const centerCard = document.querySelector('.pos-center');
        if (centerCard) {
            centerCard.classList.remove('dragging');
            centerCard.style.transform = ''; // reset drag styles
        }
        
        let diffX = e.clientX - startX;
        if (Math.abs(diffX) > 75) {
            if (diffX > 0) {
                activeIndex = (activeIndex - 1 + cards.length) % cards.length;
            } else {
                activeIndex = (activeIndex + 1) % cards.length;
            }
        }
        updateCardPositions();
    });

    // Touch Swipe interaction
    stackContainer.addEventListener('touchstart', (e) => {
        if (e.target.closest('.card-action-btn') || e.target.closest('.stack-nav-btn')) return;
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    stackContainer.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        let diffX = e.changedTouches[0].clientX - startX;
        if (Math.abs(diffX) > 60) {
            if (diffX > 0) {
                activeIndex = (activeIndex - 1 + cards.length) % cards.length;
            } else {
                activeIndex = (activeIndex + 1) % cards.length;
            }
            updateCardPositions();
        }
    });
}





// ===== Countdown Timer Logic =====
function updateCountdown() {
    const cardsWithTimers = document.querySelectorAll('.stack-card');
    cardsWithTimers.forEach(card => {
        const hoursEl = card.querySelector('.timer-h');
        const minsEl = card.querySelector('.timer-m');
        const secsEl = card.querySelector('.timer-s');
        
        if (!hoursEl || !minsEl || !secsEl) return;

        let currentH = parseInt(hoursEl.innerText);
        let currentM = parseInt(minsEl.innerText);
        let currentS = parseInt(secsEl.innerText);

        currentS--;
        if (currentS < 0) {
            currentS = 59;
            currentM--;
            if (currentM < 0) {
                currentM = 59;
                currentH--;
                if (currentH < 0) {
                    currentH = 0;
                    currentM = 0;
                    currentS = 0;
                }
            }
        }

        hoursEl.innerText = currentH.toString().padStart(2, '0');
        minsEl.innerText = currentM.toString().padStart(2, '0');
        secsEl.innerText = currentS.toString().padStart(2, '0');
    });
}

setInterval(updateCountdown, 1000);




// ========== FEATURES TABS & LINE GRAPH ==========
const tabButtons = document.querySelectorAll('.tab-btn');
const featureTitle = document.getElementById('feature-title');
const featureDescription = document.getElementById('feature-description');

const graphData = {
    billing: {
        title: 'Checkout in Seconds',
        description: 'Our streamlined checkout process accepts all major cards and digital wallets. Save your info for one-click purchases.',
        path: 'M 50 224 L 136 166.5 L 222 189.5 L 308 109 L 394 132 L 480 63',
        area: 'M 50 224 L 136 166.5 L 222 189.5 L 308 109 L 394 132 L 480 63 L 480 270 L 50 270 Z',
        values: [20, 45, 35, 70, 60, 90],
        points: [
            { x: 50, y: 224 },
            { x: 136, y: 166.5 },
            { x: 222, y: 189.5 },
            { x: 308, y: 109 },
            { x: 394, y: 132 },
            { x: 480, y: 63 }
        ],
        xLabels: ['Start', 'Cart', 'Pay Info', 'Verify', 'Processing', 'Success']
    },
    analytics: {
        title: 'Rapid Delivery Network',
        description: 'Get your products delivered to your door in record time. We partner with top carriers to ensure your package arrives safely and quickly.',
        path: 'M 50 247 L 136 201 L 222 143.5 L 308 166.5 L 394 86 L 480 51.5',
        area: 'M 50 247 L 136 201 L 222 143.5 L 308 166.5 L 394 86 L 480 51.5 L 480 270 L 50 270 Z',
        values: [10, 30, 55, 45, 80, 95],
        points: [
            { x: 50, y: 247 },
            { x: 136, y: 201 },
            { x: 222, y: 143.5 },
            { x: 308, y: 166.5 },
            { x: 394, y: 86 },
            { x: 480, y: 51.5 }
        ],
        xLabels: ['Order', 'Sorted', 'In Transit', 'Local Hub', 'Out Delivery', 'Delivered']
    },
    automation: {
        title: 'Live Order Tracking',
        description: 'Know exactly where your order is at all times. From our warehouse to your front door, you\'ll get live updates every step of the way.',
        path: 'M 50 235.5 L 136 178 L 222 120.5 L 308 155 L 394 97.5 L 480 74.5',
        area: 'M 50 235.5 L 136 178 L 222 120.5 L 308 155 L 394 97.5 L 480 74.5 L 480 270 L 50 270 Z',
        values: [15, 40, 65, 50, 75, 85],
        points: [
            { x: 50, y: 235.5 },
            { x: 136, y: 178 },
            { x: 222, y: 120.5 },
            { x: 308, y: 155 },
            { x: 394, y: 97.5 },
            { x: 480, y: 74.5 }
        ],
        xLabels: ['Packed', 'Shipped', 'Customs', 'Transit', 'Out Gate', 'Arrived']
    },
    security: {
        title: 'Ironclad Security',
        description: 'Shop with confidence. Your personal and payment information is protected by bank-level encryption and the latest security standards.',
        path: 'M 50 201 L 136 132 L 222 155 L 308 97.5 L 394 120.5 L 480 42.3',
        area: 'M 50 201 L 136 132 L 222 155 L 308 97.5 L 394 120.5 L 480 42.3 L 480 270 L 50 270 Z',
        values: [30, 60, 50, 85, 75, 99],
        points: [
            { x: 50, y: 201 },
            { x: 136, y: 132 },
            { x: 222, y: 155 },
            { x: 308, y: 97.5 },
            { x: 394, y: 120.5 },
            { x: 480, y: 42.3 }
        ],
        xLabels: ['Scan', 'Handshake', 'Certify', 'Hash Key', 'Wall Shield', 'Secured']
    }
};

let currentTab = 'billing';

function animateGraph(tabKey) {
    const data = graphData[tabKey];
    if (!data) return;
    currentTab = tabKey;

    // Animate the stroke path (zig-zag curve)
    gsap.to('#graph-line', {
        attr: { d: data.path },
        duration: 1.2,
        ease: 'power2.out'
    });

    // Animate the fill area path under curve
    gsap.to('#graph-area', {
        attr: { d: data.area },
        duration: 1.2,
        ease: 'power2.out'
    });

    // Animate points and value text labels
    data.points.forEach((pt, i) => {
        // Animate dot center Y coordinates
        gsap.to(`#graph-dot-${i}`, {
            attr: { cy: pt.y },
            duration: 1.2,
            ease: 'power2.out',
            delay: i * 0.05
        });

        // Animate text label Y coordinate (12px offset above dot)
        gsap.to(`#graph-val-${i}`, {
            attr: { y: pt.y - 12 },
            duration: 1.2,
            ease: 'power2.out',
            delay: i * 0.05
        });

        // Count up values text animation
        const valEl = document.getElementById(`graph-val-${i}`);
        if (valEl) {
            const startVal = parseInt(valEl.textContent) || 0;
            const endVal = data.values[i];
            let obj = { val: startVal };
            gsap.to(obj, {
                val: endVal,
                duration: 1.0,
                ease: 'power1.out',
                delay: i * 0.05,
                onUpdate: () => {
                    valEl.textContent = Math.round(obj.val) + '%';
                }
            });
        }

        // Cross-fade X labels text update
        const labelEl = document.getElementById(`x-label-${i}`);
        if (labelEl) {
            gsap.to(labelEl, {
                opacity: 0,
                duration: 0.25,
                onComplete: () => {
                    labelEl.textContent = data.xLabels[i];
                    gsap.to(labelEl, {
                        opacity: 1,
                        duration: 0.25
                    });
                }
            });
        }
    });
}

// Set initial 0 state on page load
for (let i = 0; i < 6; i++) {
    const valEl = document.getElementById(`graph-val-${i}`);
    if (valEl) valEl.textContent = '0%';
}

// Scroll Trigger to animate from 0 to full values when scrolled into view
ScrollTrigger.create({
    trigger: '.features',
    start: 'top 80%',
    onEnter: () => {
        animateGraph('billing');
    },
    once: true
});

// Click handlers for the Feature Tabs
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.dataset.tab;
        const data = graphData[tab];

        // Animate feature title and description text
        gsap.to([featureTitle, featureDescription], {
            opacity: 0,
            y: -10,
            duration: 0.25,
            onComplete: () => {
                featureTitle.textContent = data.title;
                featureDescription.textContent = data.description;
                gsap.to([featureTitle, featureDescription], {
                    opacity: 1,
                    y: 0,
                    duration: 0.25
                });
            }
        });

        // Trigger line graph update animation
        animateGraph(tab);
    });
});

// ========== PARALLAX SECTION ==========
gsap.to('.parallax-bg', {
    y: -100,
    scrollTrigger: { trigger: '.parallax-section', start: 'top bottom', end: 'bottom top', scrub: 1 }
});
gsap.to('.parallax-mid', {
    y: -200,
    scrollTrigger: { trigger: '.parallax-section', start: 'top bottom', end: 'bottom top', scrub: 1 }
});
gsap.to('.parallax-fg', {
    y: -300,
    scrollTrigger: { trigger: '.parallax-section', start: 'top bottom', end: 'bottom top', scrub: 1 }
});

// ========== PRICING TOGGLE ==========
const pricingToggle = document.getElementById('pricingToggle');
const pricingCards = document.querySelectorAll('.pricing-card');
const pricingPrices = document.querySelectorAll('.pricing-price');

if (pricingToggle) {
    pricingToggle.addEventListener('click', () => {
        pricingToggle.classList.toggle('active');
        const isAnnual = pricingToggle.classList.contains('active');

        pricingCards.forEach(card => card.classList.remove('featured'));
        if (pricingCards.length >= 3) {
            if (isAnnual) {
                pricingCards[2].classList.add('featured');
            } else {
                pricingCards[1].classList.add('featured');
            }
        }

        pricingPrices.forEach((price, i) => {
            const card = pricingCards[i];
            if (card) {
                const priceValue = isAnnual ? card.dataset.annual : card.dataset.monthly;

                gsap.to(price, {
                    opacity: 0,
                    y: -10,
                    duration: 0.2,
                    onComplete: () => {
                        if (parseFloat(priceValue) === 0) {
                            price.innerHTML = '$0';
                        } else {
                            price.innerHTML = `<span>$</span>${priceValue}<span>/month</span>`;
                        }
                        gsap.to(price, {
                            opacity: 1,
                            y: 0,
                            duration: 0.2
                        });
                    }
                });
            }
        });
    });
}

// Pricing cards hover effect
pricingCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            scale: 1.02,
            duration: 0.3
        });
    });
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            scale: 1,
            duration: 0.3
        });
    });
});



