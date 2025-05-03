const HiddenWord = require('../../models/TOEIC/hiddenWord.model');

exports.playGame = async (req, res) => {
    try {
        // Nếu có query parameter 'id' thì lấy từ theo ID
        if (req.query.id) {
            const question = await HiddenWord.findById(req.query.id);
            if (!question) {
                return res.redirect('/hidden-word');
            }
            return res.render('client/pages/play-hidden-word', { 
                question: question,
                currentHintIndex: 0,
                tilesRevealed: 0,
                wrongAttempts: 0
            });
        }

        // Nếu không có ID thì lấy từ ngẫu nhiên
        const questions = await HiddenWord.find();
        if (questions.length === 0) {
            return res.status(404).send('Không tìm thấy từ nào');
        }
        
        const random = questions[Math.floor(Math.random() * questions.length)];
        res.render('client/pages/play-hidden-word', { 
            question: random,
            currentHintIndex: 0,
            tilesRevealed: 0,
            wrongAttempts: 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server');
    }
};

// const HiddenWord = require('../../models/TOEIC/hiddenWord.model');

// exports.playGame = async (req, res) => {
//     const questions = await HiddenWord.find();
//     const random = questions[Math.floor(Math.random() * questions.length)];
//     res.render('client/pages/play-hidden-word', { 
//       question: random, // Giữ nguyên là 'question' để phù hợp với template
//       currentHintIndex: 0,
//       tilesRevealed: 0,
//       wrongAttempts: 0
//     });
//   };