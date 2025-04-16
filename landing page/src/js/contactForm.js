/**
 * Contact form functionality
 */
export function initContactForm() {
  const contactForm = document.getElementById("contact-form");
  const contactResult = document.getElementById("contact-result");

  if (!contactForm) return;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);
    contactResult.innerHTML = "Please wait...";

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
          contactResult.innerHTML = "Message sent successfully!";
          contactResult.style.color = "green";
        } else {
          console.log(response);
          contactResult.innerHTML = json.message;
          contactResult.style.color = "red";
        }
      })
      .catch((error) => {
        console.log(error);
        contactResult.innerHTML = "Something went wrong!";
        contactResult.style.color = "red";
      })
      .then(function () {
        contactForm.reset();
        setTimeout(() => {
          contactResult.innerHTML = "";
        }, 5000);
      });
  });
}
