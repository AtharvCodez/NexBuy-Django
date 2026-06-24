document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".add-to-cart-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            alert("🛒 Item added to cart!");
        });
    });
});
