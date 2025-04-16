/**
 * Email Service Module
 * Handles sending emails using Web3Forms API
 */

export async function sendEmail(data) {
  try {
    // Make sure we have the required environment variables
    if (!process.env.EMAIL_ACCESS_KEY) {
      console.error("Missing EMAIL_ACCESS_KEY environment variable");
      return false;
    }

    // Create payload for email
    const payload = {
      ...data,
      access_key: process.env.EMAIL_ACCESS_KEY,
    };

    // Send the email via Web3Forms API
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.status === 200) {
      console.log("Email sent successfully");
      return true;
    } else {
      console.error("Failed to send email:", result.message);
      return false;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send order confirmation email to admin
 */
export async function sendOrderConfirmationToAdmin(
  orderDetails,
  paymentResponse
) {
  // Compose the product summary from cart items if available
  let productSummary = "";

  // Try to use cartItems if present (array of items)
  if (
    orderDetails.cartItems &&
    Array.isArray(orderDetails.cartItems) &&
    orderDetails.cartItems.length > 0
  ) {
    // Calculate total from orderDetails.cartItems for consistency
    let calculatedTotal = orderDetails.cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    productSummary = orderDetails.cartItems
      .map(
        (item) =>
          `${item.name} (${item.color}) - Quantity: ${item.quantity} - ₹${
            Number(item.price) * Number(item.quantity)
          }`
      )
      .join("\n");

    // Update orderDetails.totalAmount with calculated total if needed
    if (
      !orderDetails.totalAmount ||
      orderDetails.totalAmount < calculatedTotal
    ) {
      console.log(
        `Updating totalAmount from ${orderDetails.totalAmount} to ${calculatedTotal}`
      );
      orderDetails.totalAmount = calculatedTotal;
    }

    // Add total using the calculated value
    productSummary += `\n\nTotal: ₹${calculatedTotal.toFixed(2)}`;
  }
  // Try using window.cartItems as a fallback for COD orders
  else if (
    window.cartItems &&
    Array.isArray(window.cartItems) &&
    window.cartItems.length > 0
  ) {
    console.log("Using window.cartItems fallback for order summary");

    // Calculate the total from window.cartItems
    const calculatedTotal = window.cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    // Always use the calculated total or window.cartTotal, whichever is higher
    const total = Math.max(calculatedTotal, window.cartTotal || 0);

    // Update orderDetails.totalAmount with the correct total
    orderDetails.totalAmount = total;
    console.log(
      `Setting order total to: ₹${total.toFixed(2)} from ${
        window.cartItems.length
      } items`
    );

    productSummary = window.cartItems
      .map(
        (item) =>
          `${item.name} (${item.color}) - Quantity: ${item.quantity} - ₹${
            Number(item.price) * Number(item.quantity)
          }`
      )
      .join("\n");

    // Add total using the newly calculated value
    productSummary += `\n\nTotal: ₹${total.toFixed(2)}`;

    // Update orderDetails to include the cart items for future reference
    orderDetails.cartItems = window.cartItems;
  } else if (orderDetails.order_summary) {
    // Fallback to order_summary string
    productSummary = orderDetails.order_summary;
  } else {
    // Fallback to single product
    productSummary = `Product: Pocket Breeze 3-in-1 Mini Turbo Fan\nColor: ${
      orderDetails.color || "Silver"
    }\nQuantity: ${orderDetails.quantity || "1"}`;
  }

  // Determine payment method - Adding more robust detection
  const isCOD =
    paymentResponse?.cod === true ||
    orderDetails.payment_method === "cod" ||
    (typeof paymentResponse?.payment_method === "string" &&
      paymentResponse.payment_method.toLowerCase() === "cod");

  console.log("Payment method detection:", {
    fromResponse: paymentResponse?.payment_method,
    fromOrderDetails: orderDetails.payment_method,
    isCodFlag: paymentResponse?.cod,
    finalIsCOD: isCOD,
    hasCartItems: Boolean(orderDetails.cartItems?.length),
    windowCartItemsCount: window.cartItems?.length || 0,
  });

  const paymentMethod = isCOD ? "Cash on Delivery (COD)" : "Razorpay (Online)";
  const paymentStatus = isCOD ? "Pending - COD" : "Successful";

  // Format the order details for the email with full summary
  const formattedOrderDetails = `
Order ID: ${paymentResponse?.razorpay_payment_id || "N/A"}
Customer Name: ${orderDetails.name || "N/A"}
Email: ${orderDetails.email || "N/A"}
Phone: ${orderDetails.phone || "N/A"}
Address: ${orderDetails.address || "N/A"}
Pincode: ${orderDetails.pincode || "N/A"}

Order Summary:
${productSummary}

Total Amount: ₹${orderDetails.totalAmount?.toFixed(2)} (INR)

Payment Status: ${paymentStatus}
Payment ID: ${paymentResponse?.razorpay_payment_id || "N/A"}
Payment Method: ${paymentMethod}

${
  isCOD
    ? "IMPORTANT: This is a Cash on Delivery order. Payment will be collected upon delivery."
    : ""
}
`;

  // Prepare email data
  const emailData = {
    from_name: "ChillWing Fan Website",
    subject: isCOD
      ? "New COD Order Received - ChillWing Fan"
      : "New Order Received - ChillWing Fan",
    to_email: process.env.ADMIN_EMAIL,
    message: formattedOrderDetails,
  };

  // Send the email
  return await sendEmail(emailData);
}
