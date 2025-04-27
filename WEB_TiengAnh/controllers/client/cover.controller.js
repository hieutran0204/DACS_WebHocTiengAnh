exports.getCoverPage = (req, res) => {
    res.render('client/pages/cover', {
      title: 'Trang Chủ | Học Tiếng Anh Online',
      newsItems: [
        'Two More Infant Nutrition Products...',
        'English Competency Survey...', 
        'Chinese Military Joins Parade...',
        '50 Years of Change...',
        'New Discoveries in English Learning...'
      ]
    });
};