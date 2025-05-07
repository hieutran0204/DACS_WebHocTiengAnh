const WordGame = require('../../models/TOEIC/wordgame.model');

// Lấy ngẫu nhiên một từ cho trò chơi
exports.getRandomWord = (req, res) => {
  WordGame.countDocuments()
    .then(count => {
      if (count === 0) {
        return res.status(404).send('Không có từ nào trong trò chơi');
      }

      const randomIndex = Math.floor(Math.random() * count);

      WordGame.findOne()
        .skip(randomIndex)
        .then(word => {
          if (!word) {
            return res.status(404).send('Không tìm thấy từ ngẫu nhiên');
          }
          res.render('client/pages/wordgame', { 
            words: [{ word: word.word, hint: word.hint }]
          });
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Có lỗi xảy ra khi lấy từ ngẫu nhiên');
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Có lỗi xảy ra khi tính tổng số từ');
    });
};

// Kiểm tra câu trả lời và trả về từ mới
exports.checkAnswer = (req, res) => {
  const { userAnswer } = req.body;
  
  WordGame.findOne({ word: userAnswer.toLowerCase() })
    .then(word => {
      if (word) {
        // Trả lời đúng, lấy từ mới
        WordGame.countDocuments()
          .then(count => {
            const randomIndex = Math.floor(Math.random() * count);
            WordGame.findOne()
              .skip(randomIndex)
              .then(newWord => {
                res.json({ 
                  correct: true, 
                  newWord: {
                    word: newWord.word,
                    hint: newWord.hint,
                    shuffled: newWord.word.split('').sort(() => Math.random() - 0.5).join('')
                  }
                });
              });
          });
      } else {
        res.json({ correct: false, message: 'Từ không đúng!' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Có lỗi xảy ra' });
    });
};