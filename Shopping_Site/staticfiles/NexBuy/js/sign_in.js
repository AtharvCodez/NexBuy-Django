const flipCard = document.getElementById('flipCard');
const goToLoginBtn = document.getElementById('go-to-login');
const goToSignupBtn = document.getElementById('go-to-signup');

if (goToLoginBtn && flipCard) {
    goToLoginBtn.addEventListener('click', () => {
        flipCard.classList.add('flipped');
    });
}

if (goToSignupBtn && flipCard) {
    goToSignupBtn.addEventListener('click', () => {
        flipCard.classList.remove('flipped');
    });
}

// GSAP Animations
if (typeof gsap !== 'undefined') {
    gsap.from('.auth-container', {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        delay: 0.3,
        ease: 'power2.out'
    });
    gsap.from('footer', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.5,
        ease: 'power2.out'
    });
}
