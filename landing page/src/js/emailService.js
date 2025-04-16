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
    productSummary = orderDetails.cartItems
      .map(
        (item) =>
          `${item.name} (${item.color}) - Quantity: ${item.quantity} - ₹${
            Number(item.price) * Number(item.quantity)
          }`
      )
      .join("\n");
    // Add total
    productSummary += `\n\nTotal: ₹${
      orderDetails.totalAmount?.toFixed(2) || "3999.00"
    }`;
  } else if (orderDetails.order_summary) {
    // Fallback to order_summary string
    productSummary = orderDetails.order_summary;
  } else {
    // Fallback to single product
    productSummary = `Product: Pocket Breeze 3-in-1 Mini Turbo Fan\nColor: ${
      orderDetails.color || "Silver"
    }\nQuantity: ${orderDetails.quantity || "1"}`;
  }

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

Total Amount: ₹${orderDetails.totalAmount?.toFixed(2) || "3999.00"} (INR)

Payment Status: Successful
Payment ID: ${paymentResponse?.razorpay_payment_id || "N/A"}
Payment Method: Razorpay
`;

  // Prepare email data
  const emailData = {
    from_name: "ChillWing Fan Website",
    subject: "New Order Received - ChillWing Fan",
    to_email: process.env.ADMIN_EMAIL,
    message: formattedOrderDetails,
  };

  // Send the email
  return await sendEmail(emailData);
}
