/**
 * Cart and product functionality
 */
export function initCartManager() {
  // Modal and Cart functionality
  const modal = document.getElementById("product-modal");
  const closeModal = document.getElementById("close-modal");
  const buyNowBtns = [
    document.getElementById("buy-now-btn"),
    document.getElementById("buy-now-btn-2"),
  ];
  const addToCartBtn = document.getElementById("add-to-cart");
  const payNowBtn = document.getElementById("pay-now");
  const cartCount = document.getElementById("cart-count");
  const modalImg = document.getElementById("modal-img");
  const modalColor = document.getElementById("modal-color");
  const deliveryModal = document.getElementById("delivery-modal");
  const deliveryForm = document.getElementById("delivery-form");
  const deliverySuccess = document.getElementById("delivery-success");
  const deliveryError = document.getElementById("delivery-error");
  let cart = 0;

  // Cart data structure
  let cartItems = [];

  // Get selected color from about section
  function getSelectedColor() {
    const active = document.querySelector(".color.active");
    if (active) {
      if (active.classList.contains("black")) return "Black";
      if (active.classList.contains("silver")) return "Silver";
      if (active.classList.contains("pink")) return "Pink";
    }
    return "Silver";
  }

  function getSelectedImg() {
    const active = document.querySelector(".color.active");
    if (active) {
      if (active.classList.contains("black")) return "/black.png";
      if (active.classList.contains("silver")) return "/silver.png";
      if (active.classList.contains("pink")) return "/pink.png";
    }
    return "/silver.png";
  }

  // Buy Now buttons functionality
  buyNowBtns.forEach((btn) => {
    if (btn) {
      // Remove all previous event listeners
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      // Add the new direct-to-delivery event listener
      newBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.setDeliveryColor();
        deliveryModal.style.display = "flex";
        deliveryForm.style.display = "block";
        deliverySuccess.style.display = "none";
        deliveryError.style.display = "none";
      });
    }
  });

  // Modal functionality
  if (closeModal && modal) {
    closeModal.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) modal.style.display = "none";
    };
  }

  // Add to cart button in modal
  if (addToCartBtn) {
    addToCartBtn.onclick = function () {
      const color = modalColor.textContent;
      addItemToCart(color);
      addToCartBtn.textContent = "Added!";
      setTimeout(() => {
        addToCartBtn.textContent = "Add to Cart";
      }, 1200);
      modal.style.display = "none";
    };
  }

  // Pay Now button in modal
  if (payNowBtn) {
    payNowBtn.onclick = function () {
      modal.style.display = "none"; // Close product modal
      window.setDeliveryColor();
      deliveryModal.style.display = "flex";
      deliveryForm.style.display = "block";
      deliverySuccess.style.display = "none";
      deliveryError.style.display = "none";
    };
  }

  // Add to Cart buttons on page
  const addToCartBtnHome = document.getElementById("add-to-cart-btn-home");
  const addToCartBtnAbout = document.getElementById("add-to-cart-btn-about");

  function handleAddToCart(btn) {
    const color = getSelectedColor();
    addItemToCart(color);
    btn.textContent = "Added!";
    setTimeout(() => {
      btn.textContent = "Add to Cart";
    }, 1200);
  }

  if (addToCartBtnHome)
    addToCartBtnHome.onclick = () => handleAddToCart(addToCartBtnHome);
  if (addToCartBtnAbout)
    addToCartBtnAbout.onclick = () => handleAddToCart(addToCartBtnAbout);

  // Cart functionality with localStorage persistence
  const cartIcon = document.getElementById("cart-icon");
  const cartOverlay = document.getElementById("cart-overlay");
  const closeCartBtn = document.getElementById("close-cart");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartEmptyMessage = document.getElementById("cart-empty");
  const cartTotalElement = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  // Load cart from localStorage on page load
  loadCart();
  updateCartDisplay();

  function saveCart() {
    localStorage.setItem("fanCartItems", JSON.stringify(cartItems));
    localStorage.setItem("fanCartCount", cart);
  }

  function loadCart() {
    const savedItems = localStorage.getItem("fanCartItems");
    const savedCount = localStorage.getItem("fanCartCount");

    if (savedItems) {
      cartItems = JSON.parse(savedItems);
    }

    if (savedCount) {
      cart = parseInt(savedCount);
      cartCount.textContent = cart;
    }
  }

  // Function to clear cart - exported to be used by delivery form
  function clearCart() {
    cartItems = [];
    cart = 0;
    cartCount.textContent = "0";
    saveCart();
  }

  // Add to Cart functionality
  function addItemToCart(color, price = 3999) {
    // Changed price to INR
    const existingItemIndex = cartItems.findIndex(
      (item) => item.color === color
    );

    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity += 1;
    } else {
      cartItems.push({
        name: "Pocket Breeze 3-in-1 Mini Turbo Fan",
        color: color,
        price: price,
        quantity: 1,
        image: `/${color.toLowerCase()}.png`,
      });
    }

    cart++;
    cartCount.textContent = cart;
    saveCart();
  }

  function updateCartDisplay() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (cartItems.length === 0) {
      cartEmptyMessage.style.display = "block";
      cartTotalElement.style.display = "none";
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = "0.5";
    } else {
      cartEmptyMessage.style.display = "none";
      cartTotalElement.style.display = "block";
      checkoutBtn.disabled = false;
      checkoutBtn.style.opacity = "1";

      let total = 0;

      cartItems.forEach((item, index) => {
        total += item.price * item.quantity;

        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";

        itemElement.innerHTML = `
          <img src="${item.image}" alt="${
          item.color
        } fan" class="cart-item-image">
          <div class="cart-item-details">
            <div><b>${item.name}</b></div>
            <div>Color: ${item.color}</div>
            <div>₹${item.price.toFixed(2)} × ${item.quantity}</div>
          </div>
          <div class="cart-item-controls">
            <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
            <button class="remove-btn" data-index="${index}">×</button>
          </div>
        `;

        cartItemsContainer.appendChild(itemElement);
      });

      cartTotalElement.textContent = `Total: ₹${total.toFixed(2)}`;

      // Add event listeners to quantity buttons
      document.querySelectorAll(".quantity-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const index = parseInt(this.getAttribute("data-index"));
          const action = this.getAttribute("data-action");

          if (action === "increase") {
            cartItems[index].quantity += 1;
            cart++;
          } else if (action === "decrease") {
            if (cartItems[index].quantity > 1) {
              cartItems[index].quantity -= 1;
              cart--;
            }
          }

          cartCount.textContent = cart;
          saveCart();
          updateCartDisplay();
        });
      });

      // Add event listeners to remove buttons
      document.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const index = parseInt(this.getAttribute("data-index"));
          cart -= cartItems[index].quantity;
          cartItems.splice(index, 1);
          cartCount.textContent = cart;
          saveCart();
          updateCartDisplay();
        });
      });
    }
  }

  // Open cart overlay when clicking cart icon
  if (cartIcon && cartOverlay) {
    cartIcon.addEventListener("click", function () {
      updateCartDisplay();
      cartOverlay.style.display = "flex";
    });
  }

  // Close cart overlay
  if (closeCartBtn && cartOverlay) {
    closeCartBtn.addEventListener("click", function () {
      cartOverlay.style.display = "none";
    });

    window.addEventListener("click", function (event) {
      if (event.target === cartOverlay) {
        cartOverlay.style.display = "none";
      }
    });
  }

  // Checkout button redirects to delivery form
  if (checkoutBtn && deliveryModal) {
    checkoutBtn.addEventListener("click", function () {
      cartOverlay.style.display = "none";

      // Set delivery color based on selected color
      if (window.setDeliveryColor) window.setDeliveryColor();

      // Show delivery modal
      deliveryModal.style.display = "flex";

      // Show the form and hide success/error messages
      if (deliveryForm) deliveryForm.style.display = "block";
      if (deliverySuccess) deliverySuccess.style.display = "none";
      if (deliveryError) deliveryError.style.display = "none";

      // Auto-scroll to payment section for better UX
      const paymentSection = document.querySelector(".payment-section");
      if (paymentSection) {
        setTimeout(() => {
          paymentSection.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    });
  }

  // Export cartItems and clearCart for use in delivery form
  return {
    cartItems,
    clearCart,
  };
}
