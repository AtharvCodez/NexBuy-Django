// ========== CLIENT-SIDE PRODUCT FILTERING & SORTING ==========
const priceSlider = document.getElementById('price-slider');
const priceValue = document.getElementById('price-value');
const grid = document.querySelector('.product-grid');

function applyFilters() {
    if (!grid) return;
    
    const maxPrice = priceSlider ? parseFloat(priceSlider.value) : 2000;
    
    const ratingRadios = document.querySelectorAll('input[name="rating"]');
    let minRating = 0;
    ratingRadios.forEach(radio => {
        if (radio.checked) {
            minRating = parseFloat(radio.value);
        }
    });
    
    const brandCheckboxes = document.querySelectorAll('input[name^="brand-"]');
    const selectedBrands = [];
    brandCheckboxes.forEach(cb => {
        if (cb.checked) {
            const label = document.querySelector(`label[for="${cb.id}"]`);
            if (label) {
                selectedBrands.push(label.textContent.trim().toLowerCase());
            }
        }
    });
    
    const sortRadios = document.querySelectorAll('input[name="sort"]');
    let sortBy = 'popular';
    sortRadios.forEach(radio => {
        if (radio.checked) {
            sortBy = radio.value;
        }
    });

    const cards = Array.from(grid.querySelectorAll('.product-card-large'));
    cards.forEach(card => {
        const priceText = card.querySelector('.price-new-large').textContent;
        const price = parseFloat(priceText.replace('$', ''));
        
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        
        const ratingText = card.querySelector('.product-rating span').textContent;
        const rating = parseFloat(ratingText.replace('(', '').replace(')', ''));
        
        const matchesPrice = price <= maxPrice;
        const matchesRating = rating >= minRating;
        
        let matchesBrand = true;
        if (selectedBrands.length > 0) {
            matchesBrand = selectedBrands.some(brand => {
                if (brand === 'apple' && title.includes('airpods')) return true;
                return title.includes(brand);
            });
        }
        
        if (matchesPrice && matchesRating && matchesBrand) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    cards.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.price-new-large').textContent.replace('$', ''));
        const ratingA = parseFloat(a.querySelector('.product-rating span').textContent.replace('(', '').replace(')', ''));
        
        const priceB = parseFloat(b.querySelector('.price-new-large').textContent.replace('$', ''));
        const ratingB = parseFloat(b.querySelector('.product-rating span').textContent.replace('(', '').replace(')', ''));
        
        if (sortBy === 'low-high') {
            return priceA - priceB;
        } else if (sortBy === 'high-low') {
            return priceB - priceA;
        } else if (sortBy === 'rated' || sortBy === 'popular') {
            return ratingB - ratingA;
        }
        return 0;
    });

    cards.forEach(card => grid.appendChild(card));
}

if (priceSlider) {
    priceSlider.addEventListener('input', (e) => {
        if (priceValue) priceValue.textContent = `$${e.target.value}`;
        applyFilters();
    });
}

document.querySelectorAll('input[name^="brand-"]').forEach(cb => {
    cb.addEventListener('change', applyFilters);
});

document.querySelectorAll('input[name="rating"]').forEach(radio => {
    radio.addEventListener('change', applyFilters);
});

document.querySelectorAll('input[name="sort"]').forEach(radio => {
    radio.addEventListener('change', applyFilters);
});

// Run initially
applyFilters();


// ========== NEW: SLIDE-IN FILTER PANE LOGIC ==========
const filterToggleBtn = document.querySelector('.filter-toggle-btn');
const filterSidebar = document.querySelector('.filter-sidebar');
const filterOverlay = document.querySelector('.filter-overlay');
const filterCloseBtn = document.querySelector('.filter-close-btn');

const openFilters = () => {
    if (filterSidebar && filterOverlay) {
        filterSidebar.classList.add('open');
        filterOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
};

const closeFilters = () => {
    if (filterSidebar && filterOverlay) {
        filterSidebar.classList.remove('open');
        filterOverlay.classList.remove('open');
        document.body.style.overflow = ''; // Restore scrolling
    }
};

if (filterToggleBtn && filterSidebar && filterOverlay && filterCloseBtn) {
    filterToggleBtn.addEventListener('click', openFilters);
    filterOverlay.addEventListener('click', closeFilters);
    filterCloseBtn.addEventListener('click', closeFilters);
}



// ========== NEW: CATEGORY BUTTON ACTIVE STATE ==========
const categoryButtons = document.querySelectorAll('.category-btn');
const gridHeader = document.querySelector('.product-grid-header');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to the clicked button
        button.classList.add('active');
        
        // Update the grid header title (in a real app, this would also fetch new products)
        const categoryName = button.querySelector('span').textContent;
        if (gridHeader) {
            gridHeader.textContent = categoryName;
        }
    });
});
