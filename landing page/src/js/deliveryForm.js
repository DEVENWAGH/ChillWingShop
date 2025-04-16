/**
 * Delivery form functionality
 */
export function initDeliveryForm(cartItems, clearCart) {
  const deliveryForm = document.getElementById("delivery-form");
  const deliveryResult = document.getElementById("delivery-result");
  const deliverySuccess = document.getElementById("delivery-success");
  const deliveryError = document.getElementById("delivery-error");
  const deliveryColor = document.getElementById("delivery-color");

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

    cartItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      orderSummary += `${item.name} (${item.color}) - Quantity: ${
        item.quantity
      } - $${itemTotal.toFixed(2)}\n`;
    });

    // If cart is empty, use the selected color and quantity from the form
    if (cartItems.length === 0) {
      const color = deliveryColor.value;
      const quantity = document.querySelector('input[name="quantity"]').value;
      const price = 45.0;
      const itemTotal = price * quantity;
      total = itemTotal;
      orderSummary = `Pocket Breeze 3-in-1 Mini Turbo Fan (${color}) - Quantity: ${quantity} - $${itemTotal.toFixed(
        2
      )}\n`;
    }

    // Add total to order summary
    orderSummary += `\nTotal: $${total.toFixed(2)}`;

    // Get form data and add order summary
    const formData = new FormData(deliveryForm);
    formData.append("order_summary", orderSummary);

    // Convert to object for processing
    const orderDetails = Object.fromEntries(formData);

    // Add total amount to order details
    orderDetails.totalAmount = total;

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

  // Set color in delivery modal to match selected color
  window.setDeliveryColor = function () {
    const active = document.querySelector(".color.active");
    if (active) {
      if (active.classList.contains("black")) deliveryColor.value = "Black";
      else if (active.classList.contains("silver"))
        deliveryColor.value = "Silver";
      else if (active.classList.contains("pink")) deliveryColor.value = "Pink";
    } else {
      deliveryColor.value = "Silver";
    }
  };

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
}
