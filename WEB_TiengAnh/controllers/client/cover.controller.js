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

// // Lấy danh sách tin tức đã sắp xếp theo thời gian (mới nhất đầu tiên)
// exports.getNewsList = async (req, res) => {
//   try {
//     const newsList = await News.find()
//       .sort({ createdAt: -1 }) // Sắp xếp giảm dần theo ngày tạo
//       .limit(3); // Chỉ lấy 3 tin mới nhất

//     res.render('client/pages/cover', {
//       newsList, // Truyền 3 tin mới nhất vào template
//       // Các dữ liệu khác...
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };

// controllers/client/cover.controller.js
