const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
        const currentlyActive = document.querySelector('.accordion-item.active');
        if (currentlyActive && currentlyActive !== item) {
            currentlyActive.classList.remove('active');
        }
        item.classList.toggle('active');
    });
});

// GSAP Animations
gsap.from('.payment-container', { 
    opacity: 0,
    y: -50,
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

// Intercept payments and trigger processing animation
const overlay = document.getElementById('payment-overlay');

document.querySelectorAll('.accordion-content form:not(#cod-form)').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const accordionItem = form.closest('.accordion-item');
        const title = accordionItem.querySelector('.accordion-title')?.textContent || 'Credit/Debit Card';
        triggerPaymentProcessing(title);
    });
});

const codForm = document.getElementById('cod-form');
if (codForm) {
    codForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cartItems = JSON.parse(localStorage.getItem('nexbuy_cart') || '[]');
        const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
        
        const btn = codForm.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;

        fetch('/place-order/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                payment_mode: 'Cash on Delivery',
                items: cartItems
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                localStorage.removeItem('nexbuy_cart');
                window.location.href = '/order_success.html';
            } else {
                alert("Order booking failed: " + data.message);
                if (btn) btn.disabled = false;
            }
        })
        .catch(err => {
            alert("An error occurred while placing the order.");
            if (btn) btn.disabled = false;
        });
    });
}

document.querySelectorAll('.bank-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerPaymentProcessing('Net Banking');
    });
});

function triggerPaymentProcessing(paymentMode) {
    if (overlay) {
        overlay.classList.add('active');
    }
    
    const cartItems = JSON.parse(localStorage.getItem('nexbuy_cart') || '[]');
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
    
    fetch('/place-order/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            payment_mode: paymentMode,
            items: cartItems
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            localStorage.removeItem('nexbuy_cart');
            setTimeout(() => {
                window.location.href = '/order_success.html';
            }, 3000);
        } else {
            alert("Checkout failed: " + data.message);
            overlay.classList.remove('active');
        }
    })
    .catch(err => {
        alert("An error occurred during payment processing.");
        overlay.classList.remove('active');
    });
}
