const ListeningTOEIC = require('../../models/TOEIC/listeningTOEIC.model');

exports.createListeningQuestion = async (req, res) => {
    try {
        const { part, questionText, options, correctAnswer, explanation } = req.body;
        const audioUrl = '/audio/listening/' + req.file.filename;

        const newQuestion = new ListeningTOEIC({
            part,
            audioUrl,
            questionText,
            options: JSON.parse(options),
            correctAnswer,
            explanation
        });

        await newQuestion.save();
        res.redirect('/admin/listening');
    } catch (err) {
        res.status(500).send('Error creating question: ' + err.message);
    }
};

exports.getAllListeningQuestions = async (req, res) => {
    const questions = await ListeningTOEIC.find().sort({ createdAt: -1 });
    res.render('admin/pages/TOEIC/listening-list', { questions });
};


// XÓA câu hỏi
exports.deleteListeningQuestion = async (req, res) => {
    try {
        await ListeningTOEIC.findByIdAndDelete(req.params.id);
        res.redirect('/admin/listening');
    } catch (err) {
        res.status(500).send('Lỗi khi xóa câu hỏi: ' + err.message);
    }
};

// HIỂN THỊ form sửa
exports.getEditListeningQuestion = async (req, res) => {
    try {
        const question = await ListeningTOEIC.findById(req.params.id);
        res.render('admin/pages/TOEIC/edit-listening-question', { question });
    } catch (err) {
        res.status(500).send('Lỗi khi tải câu hỏi để sửa: ' + err.message);
    }
};

// XỬ LÝ cập nhật
exports.updateListeningQuestion = async (req, res) => {
    try {
        const { part, questionText, options, correctAnswer, explanation } = req.body;
        const updatedFields = {
            part,
            questionText,
            options: JSON.parse(options),
            correctAnswer,
            explanation,
        };

        if (req.file) {
            updatedFields.audioUrl = '/audio/listening/' + req.file.filename;
        }

        await ListeningTOEIC.findByIdAndUpdate(req.params.id, updatedFields);
        res.redirect('/admin/listening');
    } catch (err) {
        res.status(500).send('Lỗi khi cập nhật câu hỏi: ' + err.message);
    }
};

// HIỂN THỊ form tạo mới
exports.getCreateListeningQuestion = (req, res) => {
    res.render('admin/pages/TOEIC/create-listening-question');
};
