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

  deliveryForm.onsubmit = function (e) {
    e.preventDefault();

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

    // Convert to object and then JSON
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    // Submit to Web3Forms API
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: json,
    })
      .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
          // Order successful
          deliveryForm.style.display = "none";
          deliverySuccess.style.display = "block";
          deliveryError.style.display = "none";

          // Clear the cart after successful order
          setTimeout(() => {
            const deliveryModal = document.getElementById("delivery-modal");
            deliveryModal.style.display = "none";
            deliveryForm.reset();
            deliveryForm.style.display = "block";
            deliverySuccess.style.display = "none";
            submitBtn.disabled = false;
            submitBtn.textContent = "Place Order";

            // Clear cart
            clearCart();
          }, 3000);
        } else {
          console.log(response);
          deliveryForm.style.display = "none";
          deliveryError.style.display = "block";

          setTimeout(() => {
            deliveryError.style.display = "none";
            deliveryForm.style.display = "block";
            submitBtn.disabled = false;
            submitBtn.textContent = "Place Order";
          }, 3000);
        }
      })
      .catch((error) => {
        console.log(error);
        deliveryForm.style.display = "none";
        deliveryError.style.display = "block";

        setTimeout(() => {
          deliveryError.style.display = "none";
          deliveryForm.style.display = "block";
          submitBtn.disabled = false;
          submitBtn.textContent = "Place Order";
        }, 3000);
      });
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
