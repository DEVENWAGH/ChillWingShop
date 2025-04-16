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

      // Make sure we use the correct total amount
      let displayAmount = orderDetails.totalAmount;

      // If cart has multiple items, ensure correct total is used
      if (window.cartTotal && window.cartItems && window.cartItems.length > 0) {
        displayAmount = window.cartTotal;
        console.log("Using cart total for success message:", displayAmount);
      }

      // Display different success message based on payment method
      if (orderResponse.cod) {
        deliverySuccess.innerHTML = `
          <h3>Thank you! Your order has been placed.</h3>
          <p>Order ID: ${orderResponse.razorpay_payment_id}</p>
          <p>Amount: ₹${displayAmount.toFixed(2)}</p>
          <p>Payment Method: Cash on Delivery</p>
          <p>Your order will be processed soon.</p>
        `;
      } else {
        deliverySuccess.innerHTML = `
          <h3>Thank you! Your order has been placed.</h3>
          <p>Order ID: ${orderResponse.razorpay_payment_id}</p>
          <p>Amount: ₹${displayAmount.toFixed(2)}</p>
          <p>Your order will be processed soon.</p>
        `;
      }
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

      // Use window.cartItems instead of cartItems (fixes checkout bug)
      if (window.cartTotal && window.cartItems && window.cartItems.length > 0) {
        amount = window.cartTotal;
        console.log("Using cart total for payment:", amount);
        // Also attach cartItems to orderDetails for email summary
        orderDetails.cartItems = window.cartItems;
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
        image: "black.png",
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

  // Expose functions to global scope for use in HTML and other modules
  window.initRazorpayPayment = initRazorpayPayment;
  window.sendOrderConfirmationToAdmin = sendOrderConfirmationToAdmin;
  window.handlePaymentSuccess = handlePaymentSuccess;

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

      // Check payment method directly from the radio button
      let paymentMethod = "razorpay"; // Default
      const codRadio = document.getElementById("payment-cod");
      if (codRadio && codRadio.checked) {
        paymentMethod = "cod";
      }

      console.log("Selected payment method (from radio):", paymentMethod);
      console.log(
        "Selected payment method (from formData):",
        formData.get("payment_method")
      );

      const orderDetails = Object.fromEntries(formData);
      // Ensure payment method is correctly set in orderDetails
      orderDetails.payment_method = paymentMethod;

      console.log("Order details payment_method:", orderDetails.payment_method);

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

      // Check the payment method more explicitly with our reliable value
      if (paymentMethod === "cod") {
        console.log("COD payment selected - handling directly");
        handleCODOrder(orderDetails);
      } else {
        console.log("Online payment selected - initializing Razorpay");
        initRazorpayPayment(orderDetails);
      }

      // Reset button
      if (submitBtn) {
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Place Order";
        }, 2000);
      }
    });
  }

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

    // Ensure cart items are included in the order details
    if (
      !orderDetails.cartItems &&
      window.cartItems &&
      window.cartItems.length > 0
    ) {
      console.log("Adding window.cartItems to COD order details");
      orderDetails.cartItems = JSON.parse(JSON.stringify(window.cartItems));
    }

    // Add cart total if missing or incorrect
    if (
      window.cartTotal &&
      (!orderDetails.totalAmount ||
        orderDetails.totalAmount != window.cartTotal)
    ) {
      console.log(
        "Updating COD order total amount from",
        orderDetails.totalAmount,
        "to",
        window.cartTotal
      );
      orderDetails.totalAmount = window.cartTotal;
    }

    console.log("COD Order Details:", {
      orderId,
      cartItemCount: orderDetails.cartItems?.length || 0,
      totalAmount: orderDetails.totalAmount,
      windowCartTotal: window.cartTotal,
    });

    // Call the existing payment success handler
    handlePaymentSuccess(codResponse, orderDetails);
  }

  // Update checkout button
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    // Instead of creating a new event handler, use the one from cartManager
    // First remove any existing listeners by replacing the button
    const newCheckoutBtn = checkoutBtn.cloneNode(true);
    checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);

    newCheckoutBtn.addEventListener("click", function () {
      // Use the global checkout handler if available, otherwise proceed with fallback
      if (window.handleCheckout) {
        return window.handleCheckout();
      } else {
        // Fallback code (simplified version of original handler)
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
          window.orderDetails = {
            totalAmount: window.cartTotal,
          };
        }

        // Trigger order summary update
        if (window.setDeliveryColor) {
          setTimeout(() => window.setDeliveryColor(), 100);
        }
      }
    });
  }
}
