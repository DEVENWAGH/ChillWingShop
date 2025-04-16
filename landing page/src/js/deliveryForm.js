/**
 * Delivery form functionality
 */
export function initDeliveryForm(cartItems, clearCart) {
  const deliveryForm = document.getElementById("delivery-form");
  const deliveryResult = document.getElementById("delivery-result");
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
      // Allow only numbers - using \D instead of [^0-9]
      this.value = this.value.replace(/\D/g, "");

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

    // Use window.cartItems to always get latest cart state
    const currentCartItems = window.cartItems || [];

    if (currentCartItems.length > 0) {
      // Always show cart items if present
      let total = 0;
      let orderItemsHTML = "";

      currentCartItems.forEach((item) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity); // <-- this is the cart quantity
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
        currentCartItems.length,
        "items"
      );
    } else {
      // If cart is empty, show nothing or a message
      orderSummaryContainer.innerHTML = `<div class="order-total">Cart is empty.</div>`;
    }
  }

  // Remove product selection fields completely instead of just hiding them
  function toggleProductSelectionFields() {
    try {
      // Remove color select section if it exists and has a parent
      if (colorSelectSection && colorSelectSection.parentNode) {
        colorSelectSection.parentNode.removeChild(colorSelectSection);
      }

      // Remove quantity input section if it exists and has a parent
      if (
        quantityInput &&
        quantityInput.parentElement &&
        quantityInput.parentElement.parentNode
      ) {
        quantityInput.parentElement.parentNode.removeChild(
          quantityInput.parentElement
        );
      }

      // Update order summary
      updateOrderSummary();
    } catch (err) {
      console.error("Error toggling product fields:", err);
      // Still update the order summary even if removal fails
      updateOrderSummary();
    }
  }

  // Modify the payment section to include COD option
  const paymentSection = document.querySelector(".payment-section");
  if (paymentSection) {
    // Update payment section to include payment options
    paymentSection.innerHTML = `
      <h3 style="margin-bottom: 10px">Payment Method</h3>
      <div class="payment-options">
        <div class="payment-option">
          <input type="radio" id="payment-razorpay" name="payment_method" value="razorpay" checked />
          <label for="payment-razorpay">Online Payment (Credit/Debit Card, UPI, Wallets)</label>
        </div>
        <div class="payment-option">
          <input type="radio" id="payment-cod" name="payment_method" value="cod" />
          <label for="payment-cod">Cash on Delivery (COD)</label>
        </div>
      </div>
      <div class="payment-info">
        Choose your preferred payment method. For online payments, you'll be redirected to our secure payment gateway.
        For Cash on Delivery, payment will be collected upon delivery.
      </div>
    `;
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

    // Check if COD is selected
    const paymentMethod = formData.get("payment_method");
    if (paymentMethod === "cod") {
      // Handle COD order directly
      handleCODOrder(orderDetails);
    } else {
      // Process with Razorpay
      if (window.initRazorpayPayment) {
        window.initRazorpayPayment(orderDetails);
      } else {
        // Show error if payment methods not available
        deliveryForm.style.display = "none";
        deliveryError.style.display = "block";
        deliveryError.innerHTML =
          "Payment processing is currently unavailable. Please try again later.";
      }
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Place Order";
  };

  // Function to handle COD orders
  function handleCODOrder(orderDetails) {
    // Generate a unique order ID for COD orders
    const orderId = "COD" + Date.now();

    // Create response object similar to Razorpay's
    const codResponse = {
      razorpay_payment_id: orderId,
      payment_method: "COD",
      cod: true,
    };

    // Send email to admin
    if (window.sendOrderConfirmationToAdmin) {
      window
        .sendOrderConfirmationToAdmin(orderDetails, codResponse)
        .then(() => {
          console.log("COD order confirmation email sent to admin");
        })
        .catch((error) => {
          console.error("Failed to send COD order confirmation email:", error);
        });
    }

    // Show success message
    const deliverySuccess = document.getElementById("delivery-success");
    const deliveryForm = document.getElementById("delivery-form");

    if (deliveryForm && deliverySuccess) {
      deliveryForm.style.display = "none";
      deliverySuccess.style.display = "block";
      deliverySuccess.innerHTML = `
        <h3>Thank you! Your order has been placed.</h3>
        <p>Order ID: ${orderId}</p>
        <p>Amount: ₹${orderDetails.totalAmount.toFixed(2)}</p>
        <p>Payment Method: Cash on Delivery</p>
        <p>Your order will be processed soon.</p>
      `;
    }

    // Clear cart
    if (window.clearCart) {
      window.clearCart();
    }
  }

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

    // Always update order summary with latest cart state
    updateOrderSummary();
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

  // Always update order summary when modal is shown (in case cart changed)
  if (deliveryModal) {
    deliveryModal.addEventListener("transitionend", updateOrderSummary);
    // Also update immediately when modal is displayed
    const observer = new MutationObserver(() => {
      if (deliveryModal.style.display === "flex") {
        updateOrderSummary();
      }
    });
    observer.observe(deliveryModal, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
}
