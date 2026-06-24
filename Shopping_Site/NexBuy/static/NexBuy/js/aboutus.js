// ========== GSAP SCROLL ANIMATIONS ==========
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Animate sections fading in
    gsap.utils.toArray('.about-header, .content-section, .founder-section, .final-cta, .assets-section').forEach((section) => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });
}

