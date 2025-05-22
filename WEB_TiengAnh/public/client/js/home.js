$(document).ready(function() {
  // Initialize Bootstrap Carousel
  $('#heroCarousel').carousel({
    interval: 5000,
    pause: 'hover'
  });

  // Toggle navigation overlay
  $('#nav-icon').click(function() {
    $(this).toggleClass('open');
    $('.overlay').toggleClass('open');
    $('.overlay a').toggleClass('open');
    $('.overlay p').toggleClass('open');
  });

  // Smooth scroll for anchor links
  $('a[href^="#"]').on('click', function(e) {
    e.preventDefault();
    const target = $(this.getAttribute('href'));
    if (target.length) {
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 1000);
    }
  });

  // Animation on scroll for cards
  const animateOnScroll = function() {
    $('.card').each(function() {
      const elementPosition = $(this).offset().top;
      const windowHeight = $(window).height();
      if (elementPosition < windowHeight - 100) {
        $(this).css({
          opacity: '1',
          transform: 'translateY(0)'
        });
      }
    });
  };

  // Initialize cards with hidden state
  $('.card').css({
    opacity: '0',
    transform: 'translateY(30px)',
    transition: 'opacity 0.6s ease, transform 0.6s ease'
  });

  $(window).on('load scroll', animateOnScroll);

  // Inview for .square.blue
  $('.square.blue').on('inview', function(event, isInView) {
    if (isInView) {
      $(this).addClass('in-view');
    } else {
      $(this).removeClass('in-view');
    }
  });

  // Dynamic news loading
  const newsGrid = $('#newsGrid');
  const newsList = window.newsList || [
    {
      _id: '1',
      title: 'Tin tức 1',
      content: 'Nội dung tin tức 1...',
      image: '/client/images/placeholder.jpg',
      author: 'Tác giả 1',
      createdAt: new Date()
    },
    {
      _id: '2',
      title: 'Tin tức 2',
      content: 'Nội dung tin tức 2...',
      image: '/client/images/placeholder.jpg',
      author: 'Tác giả 2',
      createdAt: new Date()
    },
    {
      _id: '3',
      title: 'Tin tức 3',
      content: 'Nội dung tin tức 3...',
      image: '/client/images/placeholder.jpg',
      author: 'Tác giả 3',
      createdAt: new Date()
    }
  ];

  if (newsList && newsList.length) {
    newsGrid.empty(); // Clear existing content
    $.each(newsList.slice(0, 3), function(index, news) {
      const card = `
        <div class="card">
          <a href="/news/${news._id}" style="text-decoration: none; color: inherit;">
            <img src="${news.image || '/client/images/placeholder.jpg'}" alt="${news.title || 'Hình ảnh tin tức'}" style="height: 200px; object-fit: cover;">
            <h3>${news.title || 'Không có tiêu đề'}</h3>
            <p>${news.content ? news.content.substring(0, 100) + '...' : 'Không có nội dung'}</p>
            <div class="d-flex justify-content-between text-muted small">
              <span>${news.author || 'Không rõ tác giả'}</span>
              <span>${news.createdAt ? new Date(news.createdAt).toLocaleDateString() : 'Không rõ ngày'}</span>
            </div>
          </a>
        </div>
      `;
      newsGrid.append(card);
    });
  } else {
    newsGrid.html('<p class="text-center text-muted fs-5">Không có tin tức nào để hiển thị.</p>');
  }
});