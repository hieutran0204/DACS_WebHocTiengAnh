// const express = require('express');
// const router = express.Router();
// const controller = require('../../controllers/client/hiddenWord.controller');

// router.get('/', controller.playGame);
// router.post('/check', (req, res) => {
//     const { guess, correctAnswer, currentHintIndex, tilesRevealed, wrongAttempts } = req.body;
    
//     const correct = guess.toLowerCase() === correctAnswer.toLowerCase();
//     let gameOver = false;
//     let newHintIndex = currentHintIndex;
//     let newTilesRevealed = tilesRevealed;
//     let newWrongAttempts = wrongAttempts;
    
//     if (!correct) {
//       newWrongAttempts++;
      
//       if (newTilesRevealed < 4) {
//         newTilesRevealed++;
//       }
      
//       if (newWrongAttempts % 2 === 0 && newHintIndex < 4) {
//         newHintIndex++;
//       }
      
//       gameOver = newTilesRevealed >= 4;
//     }
    
//     res.json({
//       correct,
//       gameOver,
//       correctAnswer,
//       newHintIndex,
//       newTilesRevealed,
//       newWrongAttempts
//     });
//   });
//   // Thêm route này vào server của bạn
// router.get('/hidden-word/random', async (req, res) => {
//     try {
//       // Lấy tổng số từ trong database
//       const count = await Word.countDocuments();
      
//       // Lấy một từ ngẫu nhiên
//       const random = Math.floor(Math.random() * count);
//       const randomWord = await Word.findOne().skip(random);
      
//       // Chuyển hướng đến trang với từ ngẫu nhiên
//       res.redirect(`/hidden-word-game?id=${randomWord._id}`);
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Lỗi khi tải từ ngẫu nhiên');
//     }
//   });
// module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/hiddenWord.controller');
const HiddenWord = require('../../models/TOEIC/hiddenWord.model'); // Thêm dòng này

router.get('/', controller.playGame);

router.post('/check', (req, res) => {
    const { guess, correctAnswer, currentHintIndex, tilesRevealed, wrongAttempts } = req.body;
    
    const correct = guess.toLowerCase() === correctAnswer.toLowerCase();
    let gameOver = false;
    let newHintIndex = currentHintIndex;
    let newTilesRevealed = tilesRevealed;
    let newWrongAttempts = wrongAttempts;
    
    if (!correct) {
      newWrongAttempts++;
      
      if (newTilesRevealed < 4) {
        newTilesRevealed++;
      }
      
      if (newWrongAttempts % 2 === 0 && newHintIndex < 4) {
        newHintIndex++;
      }
      
      gameOver = newTilesRevealed >= 4;
    }
    
    res.json({
      correct,
      gameOver,
      correctAnswer,
      newHintIndex,
      newTilesRevealed,
      newWrongAttempts
    });
});

// Route lấy từ ngẫu nhiên
router.get('/random', async (req, res) => {
    try {
      // Lấy tổng số từ trong database
      const count = await HiddenWord.countDocuments();
      
      // Nếu không có từ nào
      if (count === 0) {
        return res.status(404).json({ error: 'Không tìm thấy từ nào' });
      }
      
      // Lấy một từ ngẫu nhiên
      const random = Math.floor(Math.random() * count);
      const randomWord = await HiddenWord.findOne().skip(random);
      
      // Trả về JSON thay vì redirect
      res.json({
        success: true,
        word: randomWord
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lỗi khi tải từ ngẫu nhiên' });
    }
});

module.exports = router;