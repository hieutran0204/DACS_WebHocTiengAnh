const News = require('../../models/TOEIC/news.model');

exports.getCoverPage = async (req, res) => {
  try {
    const newsList = await News.find().limit(3); // Lấy 3 tin tức mới nhất từ CSDL
    res.render('client/pages/cover', {
      title: 'Trang Chủ | Học Tiếng Anh Online',
      newsList, // Truyền vào template
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error');
  }
};

// const News = require('../../models/TOEIC/news.model'); // Đảm bảo đường dẫn đúng tới model

// exports.getCoverPage = async (req, res) => {
//   try {
//     const newsItems = await News.find().sort({ createdAt: -1 }).limit(3); // Lấy 3 bài mới nhất
//     res.render('client/pages/cover', {
//       title: 'Trang Chủ | Học Tiếng Anh Online',
//       newsItems
//     });
//   } catch (error) {
//     console.error('Error fetching news:', error);
//     res.status(500).send('Lỗi máy chủ');
//   }
// };

// controllers/client/cover.controller.js
