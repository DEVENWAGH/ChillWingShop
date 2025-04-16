const initSwiper = () => {
  // Check if Swiper is available
  if (typeof Swiper !== 'undefined') {
    new Swiper(".swiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: true
      },
      keyboard: {
        enabled: true
      },
      mousewheel: {
        thresholdDelta: 70
      },
      spaceBetween: 60,
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      }
    });
  } else {
    console.warn('Swiper is not defined. Make sure the Swiper library is loaded.');
  }
};

export default initSwiper;
