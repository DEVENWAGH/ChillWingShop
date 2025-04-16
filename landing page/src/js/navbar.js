const initNavbar = () => {
  // Sticky navbar
  const navbar = document.querySelector(".navbar");

  if (navbar) {
    window.onscroll = () => {
      window.scrollY > 20
        ? navbar.classList.add("sticky")
        : navbar.classList.remove("sticky");
    };
  }

  // Navbar Toggling
  const navMenu = document.querySelector(".menu");
  const navToggle = document.querySelector(".menu-btn");

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Closing Menu when navlink is clicked
  const navLink = document.querySelectorAll(".nav-link");

  function linkAction() {
    if (navMenu) navMenu.classList.remove("active");
  }

  navLink.forEach((n) => n.addEventListener("click", linkAction));
};

export default initNavbar;
