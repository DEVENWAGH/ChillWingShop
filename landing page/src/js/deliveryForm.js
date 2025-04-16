/**
 * Delivery form functionality
 */
export function initDeliveryForm(cartItems, clearCart) {
  const deliveryForm = document.getElementById("delivery-form");
  const deliveryResult = document.getElementById("delivery-result");
  const deliverySuccess = document.getElementById("delivery-success");
  const deliveryError = document.getElementById("delivery-error");
  const deliveryColor = document.getElementById("delivery-color");
  const colorSelectSection = document.getElementById("color-select-section");
  const quantityInput = document.querySelector('input[name="quantity"]');
  const orderSummaryContainer = document.getElementById(
    "order-summary-container"
  );

  if (!deliveryForm) return;

  // Pincode validation
  const pincodeInput = document.querySelector('input[name="pincode"]');
  if (pincodeInput) {
    pincodeInput.addEventListener("input", function (e) {
      // Allow only numbers
      this.value = this.value.replace(/[^0-9]/g, "");

      // Limit to 6 digits
      if (this.value.length > 6) {
        this.value = this.value.slice(0, 6);
      }
    });
  }

  // Function to update order summary display
  function updateOrderSummary() {
    if (!orderSummaryContainer) return;

    // Clear previous content
    orderSummaryContainer.innerHTML = "";

    if (cartItems.length === 0) {
      // If cart is empty, show just the selected color and quantity
      const color = deliveryColor.value;
      const quantity = parseInt(quantityInput.value) || 1;
      const price = 3999;
      const itemTotal = price * quantity;

      orderSummaryContainer.innerHTML = `
        <div class="order-item">
          <div class="order-item-details">
            <div class="order-item-name">Pocket Breeze 3-in-1 Mini Turbo Fan (${color})</div>
            <div class="order-item-price">₹${price.toFixed(
              2
            )} × ${quantity}</div>
          </div>
          <div class="order-item-total">₹${itemTotal.toFixed(2)}</div>
        </div>
        <div class="order-total">Total: ₹${itemTotal.toFixed(2)}</div>
      `;
    } else {
      // If there are items in cart, show all items
      let total = 0;
      let orderItemsHTML = "";

      cartItems.forEach((item) => {
        // Ensure price and quantity are numbers
        const price = Number(item.price);
        const quantity = Number(item.quantity);
        const itemTotal = price * quantity;
        total += itemTotal;

        orderItemsHTML += `
          <div class="order-item">
            <div class="order-item-details">
              <div class="order-item-name">${item.name} (${item.color})</div>
              <div class="order-item-price">₹${price.toFixed(
                2
              )} × ${quantity}</div>
            </div>
            <div class="order-item-total">₹${itemTotal.toFixed(2)}</div>
          </div>
        `;
      });

      orderSummaryContainer.innerHTML =
        orderItemsHTML +
        `
        <div class="order-total">Total: ₹${total.toFixed(2)}</div>
      `;

      // Store total for payment processing
      window.orderTotal = total;
      console.log(
        "Order summary total (cart items):",
        total,
        "for",
        cartItems.length,
        "items"
      );
    }
  }

  // Toggle product selection fields based on cart state
  function toggleProductSelectionFields() {
    if (colorSelectSection && quantityInput) {
      if (cartItems.length > 0) {
        // Hide color and quantity selectors when items are in cart
        colorSelectSection.style.display = "none";
        quantityInput.parentElement.style.display = "none";
      } else {
        // Show color and quantity selectors when cart is empty
        colorSelectSection.style.display = "block";
        quantityInput.parentElement.style.display = "block";
      }
    }

    // Update order summary
    updateOrderSummary();
  }

  deliveryForm.onsubmit = function (e) {
    e.preventDefault();

    // Validate pincode if present
    if (pincodeInput && pincodeInput.value.length !== 6) {
      alert("Please enter a valid 6-digit pincode");
      pincodeInput.focus();
      return false;
    }

    // Show loading state
    const submitBtn = deliveryForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";
    deliveryResult.innerHTML = "Please wait...";

    // Prepare order summary for form submission
    let orderSummary = "";
    let total = 0;

    if (cartItems.length === 0) {
      // If cart is empty, use the selected color and quantity from the form
      const color = deliveryColor.value;
      const quantity = parseInt(quantityInput.value) || 1;
      const price = 3999;
      const itemTotal = price * quantity;
      total = itemTotal;
      orderSummary = `Pocket Breeze 3-in-1 Mini Turbo Fan (${color}) - Quantity: ${quantity} - ₹${itemTotal.toFixed(
        2
      )}\n`;
    } else {
      // Calculate total from cart items
      cartItems.forEach((item) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);
        const itemTotal = price * quantity;
        total += itemTotal;
        orderSummary += `${item.name} (${
          item.color
        }) - Quantity: ${quantity} - ₹${itemTotal.toFixed(2)}\n`;
      });
      console.log("Cart total for", cartItems.length, "items:", total);
    }

    // Add total to order summary
    orderSummary += `\nTotal: ₹${total.toFixed(2)}`;

    // Get form data and add order summary
    const formData = new FormData(deliveryForm);
    formData.append("order_summary", orderSummary);

    // Convert to object for processing
    const orderDetails = Object.fromEntries(formData);

    // Add total amount to order details and ensure it's a number
    orderDetails.totalAmount = Number(total);

    // Log the total amount for debugging
    console.log(
      "Submitting order with total amount:",
      orderDetails.totalAmount
    );

    // Process with Razorpay
    if (window.initRazorpayPayment) {
      window.initRazorpayPayment(orderDetails);
      submitBtn.disabled = false;
      submitBtn.textContent = "Place Order";
    } else {
      // Show error if payment methods not available
      deliveryForm.style.display = "none";
      deliveryError.style.display = "block";
      deliveryError.innerHTML =
        "Payment processing is currently unavailable. Please try again later.";
    }
  };

  // Add event listeners to update order summary when color or quantity changes
  if (deliveryColor) {
    deliveryColor.addEventListener("change", updateOrderSummary);
  }

  if (quantityInput) {
    quantityInput.addEventListener("input", updateOrderSummary);
    // Ensure minimum quantity is 1
    quantityInput.addEventListener("blur", function () {
      if (this.value === "" || parseInt(this.value) < 1) {
        this.value = "1";
        updateOrderSummary();
      }
    });
  }

  // Set color in delivery modal to match selected color - optimized for performance
  window.setDeliveryColor = function () {
    // Don't redraw UI if not needed (when already displayed)
    if (deliveryModal && deliveryModal.style.display !== "flex") return;

    const active = document.querySelector(".color.active");
    if (active) {
      if (active.classList.contains("black")) deliveryColor.value = "Black";
      else if (active.classList.contains("silver"))
        deliveryColor.value = "Silver";
      else if (active.classList.contains("pink")) deliveryColor.value = "Pink";
    } else {
      deliveryColor.value = "Silver";
    }

    // Toggle fields and update summary
    toggleProductSelectionFields();
  };

  // Pre-initialize order summary for cached items
  if (cartItems && cartItems.length > 0) {
    window.addEventListener("DOMContentLoaded", function () {
      toggleProductSelectionFields();
    });
  }

  // Close delivery modal
  const closeDeliveryModal = document.getElementById("close-delivery-modal");
  const deliveryModal = document.getElementById("delivery-modal");

  if (closeDeliveryModal && deliveryModal) {
    closeDeliveryModal.onclick = function () {
      deliveryModal.style.display = "none";
    };

    window.addEventListener("click", function (event) {
      if (event.target == deliveryModal) deliveryModal.style.display = "none";
    });
  }

  // Initialize product selection fields and order summary
  toggleProductSelectionFields();
}
