const initColorSelector = () => {
  const pic = document.querySelector("#main-watch");
  const black = document.querySelector(".black");
  const silver = document.querySelector(".silver");
  const pink = document.querySelector(".pink");

  const colors = document.querySelectorAll(".color");

  const info = [
    { src: "black.png" },
    { src: "silver.png" },
    { src: "pink.png" },
  ];

  const handleColorChange = function (src) {
    if (pic) pic.src = src;
  };

  if (black)
    black.addEventListener("click", () => handleColorChange(info[0].src));
  if (silver)
    silver.addEventListener("click", () => handleColorChange(info[1].src));
  if (pink)
    pink.addEventListener("click", () => handleColorChange(info[2].src));

  function setActiveColor() {
    colors.forEach((c) => c.classList.remove("active"));
    this.classList.add("active");
  }

  colors.forEach((c) => c.addEventListener("click", setActiveColor));
};

export default initColorSelector;
