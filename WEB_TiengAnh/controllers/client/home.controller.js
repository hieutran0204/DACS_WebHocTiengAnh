// controllers/client/home.controller.js

const News = require('../../models/TOEIC/news.model');

exports.renderHomePage = async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 }).limit(3);
    res.render('client/pages/home', { newsList });
  } catch (error) {
    console.error('Error fetching news for homepage:', error);
    res.render('client/pages/home', { newsList: [] });
  }
};
  
  exports.renderDashboard = (req, res) => {
    res.render('client/pages/dashboard', {
      title: 'Bảng điều khiển',
      user: req.user // Đã được middleware verifyToken xử lý
    });
  };
  
  // Nếu sau này có API thì dùng cái này
  exports.getHomeStats = async (req, res) => {
    try {
      // Ví dụ gọi từ service layer
      const stats = await someService.getStats(); 
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi hệ thống' });
    }
  };
  