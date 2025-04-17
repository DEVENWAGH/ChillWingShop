/**
 * Review Manager Module
 * Handles the customer review system
 */
import { sendEmail } from "./emailService.js";

export function initReviewManager() {
  // DOM Elements
  const writeReviewBtn = document.getElementById("write-review-btn");
  const reviewModal = document.getElementById("review-modal");
  const closeReviewModal = document.getElementById("close-review-modal");
  const reviewForm = document.getElementById("review-form");
  const reviewResult = document.getElementById("review-result");
  const ratingInput = document.getElementById("rating-value");
  const starRating = document.querySelector(".star-rating");

  if (!writeReviewBtn || !reviewModal) return;

  // Open review modal
  writeReviewBtn.addEventListener("click", () => {
    reviewModal.style.display = "flex";
  });

  // Close review modal
  closeReviewModal.addEventListener("click", () => {
    reviewModal.style.display = "none";
  });

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === reviewModal) {
      reviewModal.style.display = "none";
    }
  });

  // Star rating functionality
  if (starRating) {
    const stars = starRating.querySelectorAll("i");

    stars.forEach((star) => {
      star.addEventListener("mouseover", () => {
        const rating = parseInt(star.getAttribute("data-rating"));
        highlightStars(stars, rating);
      });

      star.addEventListener("mouseout", () => {
        const currentRating = parseInt(ratingInput.value);
        highlightStars(stars, currentRating);
      });

      star.addEventListener("click", () => {
        const rating = parseInt(star.getAttribute("data-rating"));
        ratingInput.value = rating;
        highlightStars(stars, rating);
      });
    });
  }

  // Function to highlight stars
  function highlightStars(stars, rating) {
    stars.forEach((star) => {
      const starRating = parseInt(star.getAttribute("data-rating"));
      if (starRating <= rating) {
        star.classList.remove("far");
        star.classList.add("fas");
      } else {
        star.classList.remove("fas");
        star.classList.add("far");
      }
    });
  }

  // Handle review form submission
  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Validate star rating
      if (ratingInput.value === "0") {
        reviewResult.textContent = "Please select a star rating";
        reviewResult.style.color = "red";
        return;
      }

      // Get form data
      const formData = new FormData(reviewForm);
      const reviewDetails = Object.fromEntries(formData);

      // Add current date
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      reviewDetails.date = formattedDate;

      // Show processing message
      reviewResult.textContent = "Submitting your review...";
      reviewResult.style.color = "#333";

      try {
        // Send review to admin email
        await sendReviewToAdmin(reviewDetails);

        // Show success message
        reviewResult.textContent = "Thank you for your review!";
        reviewResult.style.color = "green";

        // Reset form after success
        setTimeout(() => {
          reviewForm.reset();
          ratingInput.value = "0";
          highlightStars(starRating.querySelectorAll("i"), 0);

          // Close modal after 2 seconds
          setTimeout(() => {
            reviewModal.style.display = "none";
            reviewResult.textContent = "";
          }, 2000);
        }, 1000);
      } catch (error) {
        console.error("Error submitting review:", error);
        reviewResult.textContent = "Failed to submit review. Please try again.";
        reviewResult.style.color = "red";
      }
    });
  }

  // Function to send review to admin
  async function sendReviewToAdmin(reviewDetails) {
    const starDisplay =
      "★".repeat(reviewDetails.rating) + "☆".repeat(5 - reviewDetails.rating);

    const reviewMessage = `
      New Customer Review Received
      
      Rating: ${starDisplay} (${reviewDetails.rating}/5)
      From: ${reviewDetails.reviewer_name} (${reviewDetails.reviewer_email})
      Date: ${reviewDetails.date}
      
      Title: ${reviewDetails.review_title}
      
      Review:
      ${reviewDetails.review_content}
    `;

    // Prepare email data
    const emailData = {
      from_name: `${reviewDetails.reviewer_name} via ChillWing Website`,
      subject: `New Customer Review: ${reviewDetails.rating}/5 - ${reviewDetails.review_title}`,
      to_email: process.env.ADMIN_EMAIL,
      message: reviewMessage,
    };

    // Send the email using the existing sendEmail function
    return await sendEmail(emailData);
  }
}
