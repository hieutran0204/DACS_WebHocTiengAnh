const News = require('../../models/TOEIC/news.model');

exports.getNews = async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 });
    res.render('client/pages/news-list', { 
      newsList,
      title: 'Danh sách tin tức' 
    });
  } catch (error) {
    res.status(500).render('client/pages/error', { 
      message: 'Lỗi khi tải danh sách tin tức' 
    });
  }
};

exports.getNewsDetail = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).render('client/pages/error', {
        message: 'Không tìm thấy bài viết'
      });
    }
    res.render('client/pages/news-detail', { 
      news,
      title: news.title 
    });
  } catch (error) {
    res.status(500).render('client/pages/error', {
      message: 'Lỗi khi tải chi tiết bài viết'
    });
  }
};
