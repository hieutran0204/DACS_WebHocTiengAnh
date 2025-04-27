function initSlider() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    let currentIndex = 0;
    const slides = document.querySelectorAll('.carousel img');
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    setInterval(nextSlide, 3000);
  }
  
  document.addEventListener('DOMContentLoaded', initSlider);