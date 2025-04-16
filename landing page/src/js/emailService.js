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
  // Format the order details for the email with proper INR formatting
  const formattedOrderDetails = `
    Order ID: ${paymentResponse?.razorpay_payment_id || "N/A"}
    Customer Name: ${orderDetails.name || "N/A"}
    Email: ${orderDetails.email || "N/A"}
    Phone: ${orderDetails.phone || "N/A"}
    Address: ${orderDetails.address || "N/A"}
    Pincode: ${orderDetails.pincode || "N/A"}
    
    Product: Pocket Breeze 3-in-1 Mini Turbo Fan
    Color: ${orderDetails.color || "Silver"}
    Quantity: ${orderDetails.quantity || "1"}
    
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
