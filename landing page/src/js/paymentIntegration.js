/**
 * Payment Integration
 */
import { sendOrderConfirmationToAdmin } from "./emailService.js";

export function initPaymentGateway() {
  // Handle successful order
  const handlePaymentSuccess = async (orderResponse, orderDetails) => {
    // Show success message
    const deliverySuccess = document.getElementById("delivery-success");
    const deliveryForm = document.getElementById("delivery-form");

    if (deliveryForm && deliverySuccess) {
      deliveryForm.style.display = "none";
      deliverySuccess.style.display = "block";
      deliverySuccess.innerHTML = `
        <h3>Thank you! Your order has been placed.</h3>
        <p>Order ID: ${orderResponse.razorpay_payment_id}</p>
        <p>Amount: ₹${orderDetails.totalAmount.toFixed(2)}</p>
        <p>Your order will be processed soon.</p>
      `;
    }

    // Send email notification to admin
    try {
      await sendOrderConfirmationToAdmin(orderDetails, orderResponse);
      console.log("Order confirmation email sent to admin");
    } catch (error) {
      console.error("Failed to send order confirmation email:", error);
    }

    // Clear cart
    if (window.clearCart) {
      window.clearCart();
    }
  };

  // Initialize Razorpay payment
  const initRazorpayPayment = (orderDetails) => {
    try {
      // Get correct cart total either from orderDetails or window.cartTotal
      let amount = 0;

      // If using cart checkout, prioritize window.cartTotal
      if (window.cartTotal && cartItems && cartItems.length > 0) {
        amount = window.cartTotal;
        console.log("Using cart total for payment:", amount);
      }
      // Use orderDetails.totalAmount if available
      else if (orderDetails.totalAmount) {
        amount = orderDetails.totalAmount;
        console.log("Using order details total for payment:", amount);
      }
      // Fallback to calculating based on quantity
      else {
        const quantity = parseInt(orderDetails.quantity) || 1;
        amount = 3999 * quantity;
        console.log("Using calculated total for payment:", amount);
      }

      // Ensure amount is a number
      amount = Number(amount);

      // Override orderDetails.totalAmount with our calculated amount
      orderDetails.totalAmount = amount;

      console.log("Final payment amount:", amount);

      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: amount * 100, // Amount in paise
        currency: "INR",
        name: "ChillWing Fan",
        description: "Payment for Pocket Breeze 3-in-1 Mini Turbo Fan",
        image: "/black.png",
        handler: function (response) {
          // Payment successful
          handlePaymentSuccess(response, orderDetails);
        },
        prefill: {
          name: orderDetails.name,
          email: orderDetails.email,
          contact: orderDetails.phone,
        },
        notes: {
          address: orderDetails.address,
          color: orderDetails.color,
          quantity: orderDetails.quantity,
          currency: "INR",
        },
        theme: {
          color: "#3691e6",
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
      return true;
    } catch (error) {
      console.error("Razorpay initialization failed:", error);
      alert("Payment initialization failed. Please try again.");
      return false;
    }
  };

  // Expose functions to global scope for use in HTML
  window.initRazorpayPayment = initRazorpayPayment;

  // Connect to pay now buttons
  const payNowBtn = document.getElementById("pay-now");
  if (payNowBtn) {
    // Remove existing event listener and add new one
    const newPayNowBtn = payNowBtn.cloneNode(true);
    payNowBtn.parentNode.replaceChild(newPayNowBtn, payNowBtn);

    newPayNowBtn.addEventListener("click", function () {
      // Check if any item is in cart
      if (!window.cartItems || window.cartItems.length === 0) {
        if (window.showNotification) {
          // First add the current item to cart
          const addToCartBtn = document.getElementById("add-to-cart");
          if (addToCartBtn) {
            // Simulate a click on the add to cart button
            addToCartBtn.click();
          }

          // Then show delivery form
          document.getElementById("product-modal").style.display = "none";
          document.getElementById("delivery-modal").style.display = "flex";

          // Ensure the color dropdown is properly updated
          if (window.setDeliveryColor) {
            window.setDeliveryColor();
          }

          // Also make sure the quantity is set to 1 when coming from the modal
          const quantityInput = document.querySelector(
            'input[name="quantity"]'
          );
          if (quantityInput) {
            quantityInput.value = "1";
            // Trigger the order summary update
            const event = new Event("input");
            quantityInput.dispatchEvent(event);
          }

          return;
        }
      }

      // If already has items in cart, continue with original behavior
      document.getElementById("product-modal").style.display = "none";
      document.getElementById("delivery-modal").style.display = "flex";

      // Ensure the color dropdown is properly updated
      if (window.setDeliveryColor) {
        window.setDeliveryColor();
      }

      // Also make sure the quantity is set to 1 when coming from the modal
      const quantityInput = document.querySelector('input[name="quantity"]');
      if (quantityInput) {
        quantityInput.value = "1";
        // Trigger the order summary update
        const event = new Event("input");
        quantityInput.dispatchEvent(event);
      }
    });
  }

  // Update delivery form submit handler
  const deliveryForm = document.getElementById("delivery-form");
  if (deliveryForm) {
    // Clone and replace to remove old event listeners
    const newForm = deliveryForm.cloneNode(true);
    deliveryForm.parentNode.replaceChild(newForm, deliveryForm);

    newForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(newForm);
      const orderDetails = Object.fromEntries(formData);

      // Get the current selected color and quantity from the form
      const color = orderDetails.color || "Silver";
      const quantity = parseInt(orderDetails.quantity) || 1;

      // Recalculate total amount based on current form values
      const price = 3999; // Price in INR
      const itemTotal = price * quantity;

      // Set the correct amount
      orderDetails.totalAmount = itemTotal;

      // Update the order summary with current values
      orderDetails.order_summary = `Pocket Breeze 3-in-1 Mini Turbo Fan (${color}) - Quantity: ${quantity} - ₹${itemTotal.toFixed(
        2
      )}`;

      // Log total amount for debugging
      console.log("Submitting payment with amount:", orderDetails.totalAmount);

      // Show payment processing message
      const submitBtn = newForm.querySelector('button[type="submit"]');
      const deliveryResult = document.getElementById("delivery-result");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
      }
      if (deliveryResult) {
        deliveryResult.innerHTML = "Processing your order...";
      }

      // Process with Razorpay
      initRazorpayPayment(orderDetails);

      // Reset button
      if (submitBtn) {
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Place Order";
        }, 2000);
      }
    });
  }

  // Update checkout button
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    const newCheckoutBtn = checkoutBtn.cloneNode(true);
    checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);

    newCheckoutBtn.addEventListener("click", function () {
      const cartOverlay = document.getElementById("cart-overlay");
      if (cartOverlay) cartOverlay.style.display = "none";

      // Set delivery color
      if (window.setDeliveryColor) window.setDeliveryColor();

      // Show delivery modal
      const deliveryModal = document.getElementById("delivery-modal");
      if (deliveryModal) deliveryModal.style.display = "flex";

      const deliveryForm = document.getElementById("delivery-form");
      if (deliveryForm) deliveryForm.style.display = "block";

      const deliverySuccess = document.getElementById("delivery-success");
      if (deliverySuccess) deliverySuccess.style.display = "none";

      const deliveryError = document.getElementById("delivery-error");
      if (deliveryError) deliveryError.style.display = "none";

      // Calculate and store the current cart total
      if (window.getCartTotal) {
        window.cartTotal = window.getCartTotal();
        // Make it available to the global scope for Razorpay
        window.orderDetails = {
          totalAmount: window.cartTotal,
        };
        console.log("Cart total set for checkout:", window.cartTotal);
      }
    });
  }
}
