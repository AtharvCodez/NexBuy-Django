document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".trending-btn");

  // Create toast container (only one for whole page)
  const toast = document.createElement("div");
  toast.id = "toast-message";
  document.body.appendChild(toast);

  // Add CSS directly from JS
  const style = document.createElement("style");
  style.textContent = `
    #toast-message {
      position: fixed;
      bottom: -80px;
      left: 50%;
      transform: translateX(-50%);
      background: black;
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      border : 2px solid white;
      box-shadow: 0 0 8px 5px rgba(249, 116, 22, 1);
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.5s ease;
      opacity: 0;
      z-index: 9999;
    }
    #toast-message.show {
      bottom: 30px;
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  // Function to show the toast
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000); // visible for 2 seconds
  }

  // Attach to all buttons
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      showToast("🛒 Added to cart successfully!");
    });
  });
});
