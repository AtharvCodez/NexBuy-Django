document.addEventListener("DOMContentLoaded", () => {
    // 1. REWARDS LIST (15 unique coupons)
    const REWARDS = [
        { code: "NEX50", desc: "Flat ₹50 Off on orders above ₹499" },
        { code: "FREETECH", desc: "Free Shipping on Electronics" },
        { code: "BOGOSELECT", desc: "Buy 1 Get 1 Free on Select Items" },
        { code: "SUPERCOIN2X", desc: "Double SuperCoins on next purchase" },
        { code: "PROPREMIUM", desc: "Free 1-Month NexBuy Pro Membership" },
        { code: "NEX100", desc: "Flat ₹100 Off on orders above ₹999" },
        { code: "CASHBACK20", desc: "Flat 20% Cashback on next Fashion purchase" },
        { code: "GIFTFREE", desc: "Get a surprise free accessory on next checkout" },
        { code: "SAVE15", desc: "Extra 15% discount on Trending Products" },
        { code: "BIGDEAL250", desc: "Flat ₹250 Off on orders above ₹2499" },
        { code: "ELEC10", desc: "Flat 10% Off on all tech products" },
        { code: "FASH25", desc: "Extra 25% Off on all fashion products" },
        { code: "FREESHIPPING", desc: "Free Delivery on your next 3 purchases" },
        { code: "ACCESSORY12", desc: "Extra 12% Off on mobile cases & adapters" },
        { code: "LUCKYNEO", desc: "Win a premium mystery box with code LUCKYNEO" }
    ];

    // Pick a random reward and set it
    const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    const codeEl = document.getElementById("reward-code");
    const descEl = document.getElementById("reward-desc");
    if (codeEl) codeEl.innerText = randomReward.code;
    if (descEl) descEl.innerText = randomReward.desc;

    // 2. SUPERCOINS CALCULATION & ANIMATION
    const orderData = JSON.parse(localStorage.getItem('nexbuy_last_order'));
    let supercoinsEarned = 0;

    if (orderData) {
        // 1 Coin for every ₹100 or $1
        supercoinsEarned += Math.floor((orderData.subtotalRupees || 0) / 100);
        supercoinsEarned += Math.floor(orderData.subtotalDollars || 0);
    }
    
    // Default fallback if order total is empty
    if (supercoinsEarned <= 0) {
        supercoinsEarned = Math.floor(Math.random() * 81) + 40; // 40 to 120 coins
    }

    // Clear the last order cached total
    localStorage.removeItem('nexbuy_last_order');

    // Count up animation using GSAP
    const coinValEl = document.getElementById("supercoins-val");
    if (coinValEl) {
        const counter = { val: 0 };
        gsap.to(counter, {
            val: supercoinsEarned,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
                coinValEl.innerText = Math.floor(counter.val);
            }
        });
    }

    // 3. INTERACTIVE SCRATCH CARD CANVAS
    const canvas = document.getElementById("scratch-canvas");
    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let hasScratched = false;
    let revealFinished = false;

    // Setup Silver Metallic Gradient on Canvas
    function initCanvas() {
        ctx.fillStyle = '#0a0a0f'; // Reset transparent background first
        
        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#d4d4d8'); // Zinc-300
        gradient.addColorStop(0.3, '#a1a1aa'); // Zinc-400
        gradient.addColorStop(0.7, '#71717a'); // Zinc-500
        gradient.addColorStop(1, '#52525b'); // Zinc-600
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add visual interest (sparkle dots/lines)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2 + 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw shiny divider lines
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-50 + i * 150, 0);
            ctx.lineTo(250 + i * 150, canvas.height);
            ctx.stroke();
        }

        // Text Overlay
        ctx.font = "800 1.25rem 'Inter', sans-serif";
        ctx.fillStyle = "#18181b"; // Zinc-900
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
        ctx.shadowBlur = 4;
        ctx.fillText("SCRATCH TO REVEAL!", canvas.width / 2, canvas.height / 2);
        
        ctx.font = "500 0.8rem 'Inter', sans-serif";
        ctx.fillStyle = "#3f3f46"; // Zinc-700
        ctx.fillText("NexBuy Exclusive Reward", canvas.width / 2, canvas.height / 2 + 30);
    }

    initCanvas();

    // Drawing helpers
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        // Handle touch vs mouse
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function scratch(e) {
        if (!isDrawing || revealFinished) return;
        e.preventDefault();
        
        const pos = getMousePos(e);
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        hasScratched = true;
    }

    function startScratch(e) {
        isDrawing = true;
        scratch(e);
    }

    function stopScratch() {
        isDrawing = false;
        if (hasScratched && !revealFinished) {
            checkScratchPercentage();
        }
    }

    // Event listeners for scratch canvas
    canvas.addEventListener("mousedown", startScratch);
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", stopScratch);

    canvas.addEventListener("touchstart", startScratch);
    canvas.addEventListener("touchmove", scratch);
    window.addEventListener("touchend", stopScratch);

    // Calculate transparent pixels to determine reveal
    function checkScratchPercentage() {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const totalPixels = imgData.data.length / 4;
        let transparentPixels = 0;

        for (let i = 3; i < imgData.data.length; i += 4) {
            if (imgData.data[i] === 0) {
                transparentPixels++;
            }
        }

        const percentage = (transparentPixels / totalPixels) * 100;
        if (percentage >= 45) {
            revealReward();
        }
    }

    // Fully reveal coupon details with confetti
    function revealReward() {
        revealFinished = true;
        canvas.style.opacity = 0;
        canvas.style.pointerEvents = "none";
        
        const hintEl = document.getElementById("scratch-hint");
        if (hintEl) {
            hintEl.innerText = "✨ Coupon unlocked successfully!";
            hintEl.style.color = "var(--accent-glow)";
        }

        // Trigger gorgeous confetti explosion
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // double bursts
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    // 4. COPY COUPON TO CLIPBOARD
    const copyBtn = document.getElementById("copy-coupon-btn");
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const codeText = codeEl.innerText;
            navigator.clipboard.writeText(codeText).then(() => {
                copyBtn.innerHTML = '<i class="ph-fill ph-check-circle" style="color:#10b981;"></i> Copied!';
                copyBtn.style.background = "rgba(16, 185, 129, 0.15)";
                copyBtn.style.borderColor = "#10b981";
                
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="ph ph-copy"></i> Copy Code';
                    copyBtn.style.background = "rgba(249, 115, 22, 0.15)";
                    copyBtn.style.borderColor = "var(--accent-primary)";
                }, 2000);
            }).catch(err => {
                console.error("Failed to copy coupon code: ", err);
            });
        });
    }
});
