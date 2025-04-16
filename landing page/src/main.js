import initColorSelector from "./js/colorSelector.js";
import initNavbar from "./js/navbar.js";
import initSwiper from "./js/swiper.js";
import { initContactForm } from "./js/contactForm.js";
import { initDeliveryForm } from "./js/deliveryForm.js";
import { initCartManager } from "./js/cartManager.js";

// Initialize all modules
document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI components
  initColorSelector();
  initNavbar();
  initSwiper();

  // Initialize cart manager first to get cart items
  const { cartItems, clearCart } = initCartManager();

  // Pass cart items to delivery form
  initDeliveryForm(cartItems, clearCart);

  // Initialize contact form
  initContactForm();
});
