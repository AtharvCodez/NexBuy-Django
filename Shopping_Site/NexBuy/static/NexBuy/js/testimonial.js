// ========== GSAP SCROLL ANIMATIONS ==========
gsap.registerPlugin(ScrollTrigger);

// Animate cards fading in
gsap.utils.toArray('.testimonial-card, .stat-card, .review-form, .bar-graph').forEach((card) => {
    gsap.from(card, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
        }
    });
});

// Animate stats numbers counting up
gsap.utils.toArray('.stat-number').forEach((statNum) => {
    const endValue = parseFloat(statNum.dataset.target);
    const isFloat = endValue % 1 !== 0;

    gsap.from(statNum, {
        textContent: 0,
        duration: 2.5,
        ease: 'power1.inOut',
        snap: { textContent: isFloat ? 0.1 : 1 },
        scrollTrigger: {
            trigger: statNum,
            start: 'top 90%',
            toggleActions: 'play none none none'
        },
        onUpdate: function() {
            const num = parseFloat(this.targets()[0].textContent);
            // Format to millions (M)
            this.targets()[0].textContent = (isFloat ? num.toFixed(1) : Math.ceil(num).toLocaleString()) + "M";
        }
    });
});

// NEW: Animate bar graph
gsap.utils.toArray('.bar').forEach((bar) => {
    gsap.to(bar, {
        width: bar.dataset.width,
        duration: 1.5,
        ease: 'power2.inOut',
        scrollTrigger: {
            trigger: bar,
            start: 'top 90%',
            toggleActions: 'play none none none',
            onEnter: () => bar.classList.add('animate') // For percentage text fade-in
        }
    });
});

// ========== INTERACTIVE STAR RATING ==========
const starRatingContainer = document.getElementById('star-rating-input');
if (starRatingContainer) {
    const stars = starRatingContainer.querySelectorAll('i');
    const ratingValueInput = document.getElementById('rating-value');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const ratingValue = star.dataset.value;
            ratingValueInput.value = ratingValue;
            starRatingContainer.dataset.rating = ratingValue;
            updateStarSelection(ratingValue);
        });

        star.addEventListener('mouseover', () => {
            updateStarSelection(star.dataset.value);
        });

        star.addEventListener('mouseout', () => {
            updateStarSelection(starRatingContainer.dataset.rating);
        });
    });

    function updateStarSelection(rating) {
        stars.forEach(star => {
            if (star.dataset.value <= rating) {
                star.classList.add('ph-fill', 'selected');
                star.classList.remove('ph');
            } else {
                star.classList.remove('ph-fill', 'selected');
                star.classList.add('ph');
            }
        });
    }
}

// Form submission handled natively by Django backend

