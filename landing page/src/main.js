import initColorSelector from "./js/colorSelector.js";
import initNavbar from "./js/navbar.js";
import initSwiper from "./js/swiper.js";
import { initContactForm } from "./js/contactForm.js";
import { initDeliveryForm } from "./js/deliveryForm.js";
import { initCartManager } from "./js/cartManager.js";
import { initPaymentGateway } from "./js/paymentIntegration.js";
import initSeoHelper from "./js/seoHelper.js";
import { initReviewManager } from "./js/reviewManager.js";
// The emailService.js will be imported by paymentIntegration.js

// Initialize all modules
document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI components
  initColorSelector();
  initNavbar();
  initSwiper();

  // Initialize SEO helper
  initSeoHelper();

  // Initialize cart manager first to get cart items
  const { cartItems, clearCart, getCartTotal, showNotification } =
    initCartManager();

  // Make cart functions available globally
  window.clearCart = clearCart;
  window.getCartTotal = getCartTotal;
  window.showNotification = showNotification;

  // Store initial cart total
  window.cartTotal = getCartTotal();

  // Pass cart items to delivery form
  initDeliveryForm(cartItems, clearCart);

  // Initialize contact form
  initContactForm();

  // Initialize payment gateway
  initPaymentGateway();

  // Initialize review manager
  initReviewManager();

  // Add page loading optimization
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    window.addEventListener("load", () => {
      loadingIndicator.classList.remove("show");
    });
  }
});
