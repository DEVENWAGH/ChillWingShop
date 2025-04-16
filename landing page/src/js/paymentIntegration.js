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
        Thank you! Your order has been placed.<br>
        Order ID: ${orderResponse.razorpay_payment_id}<br>
        Amount: ₹${orderDetails.totalAmount.toFixed(2)}<br>
        Your order will be processed soon.
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
      // Price is already in INR - no conversion needed
      const amountInINR = orderDetails.totalAmount;

      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: amountInINR * 100, // Amount in paise
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
      const modalColor = document.getElementById("modal-color");
      const color = modalColor ? modalColor.textContent : "Silver";

      const orderDetails = {
        name: "Customer",
        email: "",
        phone: "",
        address: "",
        color: color,
        quantity: 1,
        order_summary: `Pocket Breeze 3-in-1 Mini Turbo Fan (${color}) - Quantity: 1 - ₹3999.00`,
        totalAmount: 3999, // Default amount in INR
      };

      document.getElementById("product-modal").style.display = "none";
      document.getElementById("delivery-modal").style.display = "flex";

      // Ensure the color dropdown is properly updated
      if (window.setDeliveryColor) {
        window.setDeliveryColor();
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

      // Add order summary
      const color = orderDetails.color || "Silver";
      const quantity = parseInt(orderDetails.quantity) || 1;
      const price = 3999; // Price in INR
      const itemTotal = price * quantity;
      orderDetails.totalAmount = itemTotal;
      orderDetails.order_summary = `Pocket Breeze 3-in-1 Mini Turbo Fan (${color}) - Quantity: ${quantity} - ₹${itemTotal.toFixed(
        2
      )}`;

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
    });
  }
}
