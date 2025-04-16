/**
 * SEO Helper Module
 * Enhances SEO functionality for the ChillWing website
 */

// Function to lazy load images for better performance
const setupLazyLoading = () => {
  // Check for IntersectionObserver support
  if ("IntersectionObserver" in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

// Implement structured breadcrumbs in the page - Now disabled
const implementBreadcrumbs = () => {
  // Breadcrumbs implementation removed as requested
  return;
};

// Track outbound links for analytics
const trackOutboundLinks = () => {
  document.querySelectorAll('a[href^="http"]').forEach((link) => {
    if (!link.hostname.includes(window.location.hostname)) {
      link.setAttribute("rel", "noopener noreferrer");
      link.addEventListener("click", () => {
        if (window.gtag) {
          gtag("event", "click", {
            event_category: "outbound",
            event_label: link.href,
          });
        }
      });
    }
  });
};

// Generate meta tags dynamically based on content
const updateMetaTags = () => {
  const currentSection = window.location.hash.replace("#", "") || "home";
  const title =
    document.querySelector("h1, h2, h3")?.textContent || "ChillWing Fan";

  // Update page title based on current section
  document.title = `${title} - ChillWing | ${
    currentSection.charAt(0).toUpperCase() + currentSection.slice(1)
  }`;

  // Update meta description if needed for specific sections
  const descriptions = {
    home: "The Pocket Breeze 3-in-1 Mini Turbo Fan from ChillWing is a compact, rechargeable fan with powerful airflow for instant cooling.",
    about:
      "Learn about the ChillWing Pocket Breeze Fan, its key features, and why it's the perfect portable cooling solution.",
    product:
      "Explore our premium ChillWing Pocket Breeze Fan collection with multiple color options and powerful cooling capabilities.",
    contact:
      "Get in touch with ChillWing customer support for any questions about our Pocket Breeze Fan products.",
  };

  if (descriptions[currentSection]) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", descriptions[currentSection]);
    }
  }
};

// Initialize all SEO helper functions
const initSeoHelper = () => {
  // Setup initial functionality
  setupLazyLoading();
  trackOutboundLinks();

  // Handle section changes for SPA-like behavior
  window.addEventListener("hashchange", () => {
    updateMetaTags();
  });

  // Initial setup for current page state
  updateMetaTags();

  console.log("SEO Helper initialized");
};

export default initSeoHelper;
