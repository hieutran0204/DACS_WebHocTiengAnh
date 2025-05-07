
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

exports.checkGuess = (req, res) => {
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
};

exports.getRandomWord = async (req, res) => {
    try {
        const count = await HiddenWord.countDocuments();
        
        if (count === 0) {
            return res.status(404).json({ error: 'Không tìm thấy từ nào' });
        }
        
        const random = Math.floor(Math.random() * count);
        const randomWord = await HiddenWord.findOne().skip(random);
        
        res.json({
            success: true,
            word: randomWord
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi tải từ ngẫu nhiên' });
    }
};
