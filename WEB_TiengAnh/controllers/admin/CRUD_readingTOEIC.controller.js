const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Question = require("../../models/TOEIC/readingToiec.model");
const Exam = require("../../models/TOEIC/exam.model");

// Hàm xóa tệp
const deleteFile = (filePath) => {
    if (!filePath) return;
    let normalizedPath = filePath;
    // Nếu là đường dẫn tuyệt đối, lấy phần từ 'public' trở đi
    if (path.isAbsolute(filePath)) {
        const publicIndex = filePath.indexOf('public');
        if (publicIndex !== -1) {
            normalizedPath = filePath.slice(publicIndex + 'public'.length);
        } else {
            normalizedPath = path.basename(filePath);
        }
    }
    // Chuẩn hóa đường dẫn
    normalizedPath = normalizedPath.replace(/^\/admin\/img\/Uploads_reading_TOEIC\//, '/shared/images/reading_TOEIC/');
    normalizedPath = normalizedPath.replace(/^\\shared\\images\\reading_TOEIC\\/, '/shared/images/reading_TOEIC/');
    const fullPath = path.join(__dirname, '../../public', normalizedPath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Đã xóa tệp: ${fullPath}`);
    } else {
        console.warn(`Tệp không tồn tại: ${fullPath}`);
    }
};

// Lấy danh sách câu hỏi
exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find().lean();
        res.render("admin/pages/TOEIC/dashboard-questionTOEIC", {
            questions,
            difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" }
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách câu hỏi:", error);
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin/dashboard');
    }
};

// Trang dashboard admin
exports.getDashboard = async (req, res) => {
    try {
        const questions = await Question.find().lean();
        res.render("admin/pages/dashboard", {
            questions,
            difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" }
        });
    } catch (error) {
        console.error("Lỗi lấy dashboard:", error);
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin');
    }
};

// Trang dashboard TOEIC
exports.getDashboard_TOEIC = async (req, res) => {
    try {
        const questions = await Question.find().lean();
        res.render("admin/pages/TOEIC/dashboard_TOEIC", {
            questions,
            difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" }
        });
    } catch (error) {
        console.error("Lỗi lấy dashboard TOEIC:", error);
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin');
    }
};

// Hiển thị form thêm câu hỏi
exports.showCreateForm = (req, res) => {
    res.render("admin/pages/TOEIC/create-question", {
        error: req.flash('error'),
        success: req.flash('success')
    });
};

// Hiển thị form tạo đề thi
exports.showCreateFormExam = (req, res) => {
    try {
        res.render("admin/pages/TOEIC/create-exam", {
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error("Lỗi khi tải trang tạo đề:", error);
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin/questions/exams');
    }
};

// Xử lý thêm câu hỏi
exports.createQuestion = async (req, res) => {
    try {
        const {
            MaCC, TopicN, part, questionN, question, options, correctAnswer,
            passage, blanks, questions, explanation, difficulty
        } = req.body;

        console.log('Dữ liệu form:', JSON.stringify(req.body, null, 2));
        console.log('Tệp:', req.file);

        // Xác thực chung
        if (!MaCC || !TopicN || !part || !questionN || !difficulty) {
            throw new Error("Vui lòng điền đầy đủ các trường bắt buộc (MaCC, TopicN, Part, Số câu hỏi, Độ khó).");
        }

        const partNum = parseInt(part);
        if (![5, 6, 7].includes(partNum)) {
            throw new Error("Part không hợp lệ. Chỉ hỗ trợ Part 5, 6, 7.");
        }

        const questionNumber = parseInt(questionN);
        if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > 100) {
            throw new Error("Số câu hỏi phải từ 1 đến 100.");
        }

        const topicNum = parseInt(TopicN);
        if (isNaN(topicNum) || topicNum < 1) {
            throw new Error("Mã đề phải là số lớn hơn 0.");
        }

        const difficultyLevel = parseInt(difficulty);
        if (isNaN(difficultyLevel) || ![0, 1, 2].includes(difficultyLevel)) {
            throw new Error("Độ khó không hợp lệ. Chỉ chấp nhận 0 (Dễ), 1 (Trung bình), 2 (Khó).");
        }

        // Kiểm tra trùng lặp
        const duplicateQuestion = await Question.findOne({
            MaCC: MaCC.trim(),
            TopicN: topicNum,
            part: partNum,
            questionN: questionNumber
        });
        if (duplicateQuestion) {
            throw new Error(`Câu hỏi số ${questionNumber} đã tồn tại trong Part ${partNum}, Mã đề ${topicNum}, Chứng chỉ ${MaCC}.`);
        }

        const questionData = {
            MaCC: MaCC.trim(),
            TopicN: topicNum,
            part: partNum,
            questionN: questionNumber,
            explanation: explanation?.trim() || '',
            difficulty: difficultyLevel,
            Img: req.file ? `/shared/images/reading_TOEIC/${req.file.filename}` : null
        };

        // Xử lý theo từng Part
        switch (partNum) {
            case 5:
                if (!question || !options || !correctAnswer || !Array.isArray(options) || options.length !== 4) {
                    throw new Error("Part 5 yêu cầu câu hỏi, đúng 4 đáp án, và đáp án đúng.");
                }
                if (options.some(opt => !opt?.trim())) {
                    throw new Error("Đáp án Part 5 không được để trống.");
                }
                const correctAns5 = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
                if (!['A', 'B', 'C', 'D'].includes(correctAns5.toUpperCase())) {
                    throw new Error("Đáp án đúng phải là A, B, C hoặc D.");
                }
                questionData.question = question.trim();
                questionData.options = options.map(opt => opt.trim());
                questionData.correctAnswer = correctAns5.toUpperCase();
                questionData.passage = undefined;
                questionData.blanks = [];
                questionData.questions = [];
                break;

            case 6:
                if (!passage || !blanks || !Array.isArray(blanks) || blanks.length === 0) {
                    throw new Error("Part 6 yêu cầu đoạn văn và ít nhất một chỗ trống.");
                }
                questionData.passage = passage.trim();
                questionData.blanks = blanks.map((b, index) => {
                    if (!b.options || !Array.isArray(b.options) || b.options.length !== 4) {
                        throw new Error(`Chỗ trống ${index + 1} phải có đúng 4 đáp án.`);
                    }
                    if (b.options.some(opt => !opt?.trim())) {
                        throw new Error(`Chỗ trống ${index + 1} không được để trống đáp án.`);
                    }
                    const correctAns6 = Array.isArray(b.correctAnswer) ? b.correctAnswer[0] : b.correctAnswer;
                    if (!correctAns6 || !['A', 'B', 'C', 'D'].includes(correctAns6.toUpperCase())) {
                        throw new Error(`Chỗ trống ${index + 1} phải có đáp án đúng A, B, C hoặc D.`);
                    }
                    return {
                        blank: parseInt(b.blank) || (index + 1),
                        options: b.options.map(opt => opt.trim()),
                        correctAnswer: correctAns6.toUpperCase()
                    };
                });
                questionData.question = undefined;
                questionData.options = [];
                questionData.correctAnswer = undefined;
                questionData.questions = [];
                break;

            case 7:
                if (!passage || !questions || !Array.isArray(questions) || questions.length === 0) {
                    throw new Error("Part 7 yêu cầu đoạn văn và ít nhất một câu hỏi.");
                }
                questionData.passage = passage.trim();
                questionData.questions = questions.map((q, index) => {
                    if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
                        throw new Error(`Câu hỏi ${index + 1} không hợp lệ: yêu cầu nội dung, 4 đáp án, và đáp án đúng.`);
                    }
                    if (!q.question.trim() || q.options.some(opt => !opt?.trim())) {
                        throw new Error(`Câu hỏi ${index + 1} không được để trống nội dung hoặc đáp án.`);
                    }
                    const correctAns7 = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer;
                    if (!['A', 'B', 'C', 'D'].includes(correctAns7.toUpperCase())) {
                        throw new Error(`Câu hỏi ${index + 1} phải có đáp án đúng A, B, C hoặc D.`);
                    }
                    return {
                        question: q.question.trim(),
                        options: q.options.map(opt => opt.trim()),
                        correctAnswer: correctAns7.toUpperCase()
                    };
                });
                questionData.question = undefined;
                questionData.options = [];
                questionData.correctAnswer = undefined;
                questionData.blanks = [];
                break;

            default:
                throw new Error("Part không hợp lệ.");
        }

        const newQuestion = new Question(questionData);
        await newQuestion.save();
        console.log(`Đã lưu câu hỏi: Part ${partNum}, Câu ${questionNumber}`);

        req.flash('success', 'Thêm câu hỏi thành công');
        res.redirect(`/admin/questions/by-part/${partNum}`);
    } catch (error) {
        console.error("Lỗi khi thêm câu hỏi:", error);
        if (req.file && req.file.path) {
            deleteFile(req.file.path);
        }
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin/questions/add');
    }
};

// Tạo đề thi ngẫu nhiên
exports.generateRandomExam = async (req, res) => {
    try {
        const { parts, difficulty, questionCount, minTopic, maxTopic } = req.body;

        if (!parts || !difficulty || !questionCount) {
            return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin bắt buộc." });
        }

        const partsArray = Array.isArray(parts) ? parts.map(Number) : [Number(parts)];
        if (!partsArray.every(part => [5, 6, 7].includes(part))) {
            return res.status(400).json({ error: "Chỉ hỗ trợ Part 5, 6, 7." });
        }

        const difficultyLevel = parseInt(difficulty);
        if (isNaN(difficultyLevel) || ![0, 1, 2].includes(difficultyLevel)) {
            return res.status(400).json({ error: "Độ khó không hợp lệ." });
        }

        const questionCountNum = parseInt(questionCount);
        if (isNaN(questionCountNum) || questionCountNum < 1 || questionCountNum > 100) {
            return res.status(400).json({ error: "Số câu hỏi phải từ 1 đến 100." });
        }

        const query = {
            part: { $in: partsArray },
            difficulty: difficultyLevel
        };

        if (minTopic && maxTopic) {
            const minTopicNum = parseInt(minTopic);
            const maxTopicNum = parseInt(maxTopic);
            if (isNaN(minTopicNum) || isNaN(maxTopicNum) || minTopicNum > maxTopicNum) {
                return res.status(400).json({ error: "Phạm vi mã đề không hợp lệ." });
            }
            query.TopicN = { $gte: minTopicNum, $lte: maxTopicNum };
        }

        const allQuestions = await Question.find(query).lean();
        if (allQuestions.length < questionCountNum) {
            return res.status(400).json({
                error: `Chỉ có ${allQuestions.length} câu hỏi phù hợp (yêu cầu: ${questionCountNum}).`
            });
        }

        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, questionCountNum);

        const examCode = `RND-${partsArray.join('')}-${Date.now().toString().slice(-4)}`;
        const newExam = new Exam({
            examCode,
            questions: selectedQuestions.map(q => q._id),
            parts: partsArray,
            difficulty: difficultyLevel,
            questionCount: questionCountNum,
            createdBy: req.user ? req.user._id : null
        });

        await newExam.save();

        res.json({
            success: true,
            examId: newExam._id,
            examCode,
            questionCount: selectedQuestions.length,
            parts: partsArray,
            difficulty: ['Dễ', 'Trung bình', 'Khó'][difficultyLevel]
        });
    } catch (error) {
        console.error("Lỗi tạo đề ngẫu nhiên:", error);
        res.status(500).json({ error: `Lỗi: ${error.message}` });
    }
};

// Lấy danh sách tất cả đề thi
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .sort({ createdAt: -1 })
            .populate('questions')
            .lean();

        res.render("admin/pages/TOEIC/exam-list", {
            exams,
            examStatus: { 0: "Draft", 1: "Published", 2: "Archived" },
            difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" }
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách đề thi:", error);
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin/dashboard');
    }
};

// Xem chi tiết đề thi
exports.getExamDetail = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate({
                path: 'questions',
                select: 'MaCC part questionN question options correctAnswer passage blanks questions'
            })
            .lean();

        if (!exam) {
            req.flash('error', 'Không tìm thấy đề thi.');
            return res.redirect('/admin/questions/exams');
        }

        const questionsByPart = {};
        exam.questions.forEach(q => {
            if (!questionsByPart[`Part ${q.part}`]) {
                questionsByPart[`Part ${q.part}`] = [];
            }
            questionsByPart[`Part ${q.part}`].push(q);
        });

        res.render("admin/pages/TOEIC/exam-detail", {
            exam,
            questionsByPart,
            difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" }
        });
    } catch (error) {
        console.error("Lỗi lấy chi tiết đề thi:", error);
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin/questions/exams');
    }
};

// Hiển thị form chỉnh sửa câu hỏi
exports.showEditForm = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id).lean();
        if (!question) {
            req.flash('error', 'Không tìm thấy câu hỏi.');
            return res.redirect('/admin/dashboard');
        }

        res.render("admin/pages/TOEIC/edit-question", {
            question,
            difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
            error: req.flash('error')
        });
    } catch (error) {
        console.error("Lỗi khi tải form chỉnh sửa:", error);
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin/dashboard');
    }
};

// Cập nhật câu hỏi
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            MaCC, TopicN, part, questionN, question, options, correctAnswer,
            explanation, passage, blanks, questions, difficulty, removeImage
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("ID không hợp lệ.");
        }

        const existingQuestion = await Question.findById(id);
        if (!existingQuestion) {
            throw new Error("Không tìm thấy câu hỏi.");
        }

        // Xác thực chung
        if (!MaCC || !TopicN || !part || !questionN || !difficulty) {
            throw new Error("Vui lòng điền đầy đủ các trường bắt buộc (MaCC, TopicN, Part, Số câu hỏi, Độ khó).");
        }

        const partNum = parseInt(part);
        if (![5, 6, 7].includes(partNum)) {
            throw new Error("Part không hợp lệ. Chỉ hỗ trợ Part 5, 6, 7.");
        }

        const questionNumber = parseInt(questionN);
        if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > 100) {
            throw new Error("Số câu hỏi phải từ 1 đến 100.");
        }

        const topicNum = parseInt(TopicN);
        if (isNaN(topicNum) || topicNum < 1) {
            throw new Error("Mã đề phải là số lớn hơn 0.");
        }

        const difficultyLevel = parseInt(difficulty);
        if (isNaN(difficultyLevel) || ![0, 1, 2].includes(difficultyLevel)) {
            throw new Error("Độ khó không hợp lệ. Chỉ chấp nhận 0 (Dễ), 1 (Trung bình), 2 (Khó).");
        }

        // Kiểm tra trùng lặp
        const duplicateQuestion = await Question.findOne({
            MaCC: MaCC.trim(),
            TopicN: topicNum,
            part: partNum,
            questionN: questionNumber,
            _id: { $ne: id }
        });
        if (duplicateQuestion) {
            throw new Error(`Câu hỏi số ${questionNumber} đã tồn tại trong Part ${partNum}, Mã đề ${topicNum}, Chứng chỉ ${MaCC}.`);
        }

        // Cập nhật dữ liệu chung
        existingQuestion.MaCC = MaCC.trim();
        existingQuestion.TopicN = topicNum;
        existingQuestion.part = partNum;
        existingQuestion.questionN = questionNumber;
        existingQuestion.explanation = explanation?.trim() || '';
        existingQuestion.difficulty = difficultyLevel;
        existingQuestion.updatedAt = Date.now();

        // Xử lý hình ảnh
        if (removeImage === 'on') {
            if (existingQuestion.Img) {
                deleteFile(existingQuestion.Img);
            }
            existingQuestion.Img = null;
        } else if (req.file) {
            if (existingQuestion.Img) {
                deleteFile(existingQuestion.Img);
            }
            existingQuestion.Img = `/shared/images/reading_TOEIC/${req.file.filename}`;
        }

        // Xử lý theo từng Part
        switch (partNum) {
            case 5:
                if (!question || !options || !correctAnswer || !Array.isArray(options) || options.length !== 4) {
                    throw new Error("Part 5 yêu cầu câu hỏi, đúng 4 đáp án, và đáp án đúng.");
                }
                if (options.some(opt => !opt?.trim())) {
                    throw new Error("Đáp án Part 5 không được để trống.");
                }
                const correctAns5 = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
                if (!['A', 'B', 'C', 'D'].includes(correctAns5.toUpperCase())) {
                    throw new Error("Đáp án đúng phải là A, B, C hoặc D.");
                }
                existingQuestion.question = question.trim();
                existingQuestion.options = options.map(opt => opt.trim());
                existingQuestion.correctAnswer = correctAns5.toUpperCase();
                existingQuestion.passage = undefined;
                existingQuestion.blanks = [];
                existingQuestion.questions = [];
                break;

            case 6:
                if (!passage || !blanks || !Array.isArray(blanks) || blanks.length === 0) {
                    throw new Error("Part 6 yêu cầu đoạn văn và ít nhất một chỗ trống.");
                }
                existingQuestion.passage = passage.trim();
                existingQuestion.blanks = blanks.map((b, index) => {
                    if (!b.options || !Array.isArray(b.options) || b.options.length !== 4) {
                        throw new Error(`Chỗ trống ${index + 1} phải có đúng 4 đáp án.`);
                    }
                    if (b.options.some(opt => !opt?.trim())) {
                        throw new Error(`Chỗ trống ${index + 1} không được để trống đáp án.`);
                    }
                    const correctAns6 = Array.isArray(b.correctAnswer) ? b.correctAnswer[0] : b.correctAnswer;
                    if (!correctAns6 || !['A', 'B', 'C', 'D'].includes(correctAns6.toUpperCase())) {
                        throw new Error(`Chỗ trống ${index + 1} phải có đáp án đúng A, B, C hoặc D.`);
                    }
                    return {
                        blank: parseInt(b.blank) || (index + 1),
                        options: b.options.map(opt => opt.trim()),
                        correctAnswer: correctAns6.toUpperCase()
                    };
                });
                existingQuestion.question = undefined;
                existingQuestion.options = [];
                existingQuestion.correctAnswer = undefined;
                existingQuestion.questions = [];
                break;

            case 7:
                if (!passage || !questions || !Array.isArray(questions) || questions.length === 0) {
                    throw new Error("Part 7 yêu cầu đoạn văn và ít nhất một câu hỏi.");
                }
                existingQuestion.passage = passage.trim();
                existingQuestion.questions = questions.map((q, index) => {
                    if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
                        throw new Error(`Câu hỏi ${index + 1} không hợp lệ: yêu cầu nội dung, 4 đáp án, và đáp án đúng.`);
                    }
                    if (!q.question.trim() || q.options.some(opt => !opt?.trim())) {
                        throw new Error(`Câu hỏi ${index + 1} không được để trống nội dung hoặc đáp án.`);
                    }
                    const correctAns7 = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer;
                    if (!['A', 'B', 'C', 'D'].includes(correctAns7.toUpperCase())) {
                        throw new Error(`Câu hỏi ${index + 1} phải có đáp án đúng A, B, C hoặc D.`);
                    }
                    return {
                        question: q.question.trim(),
                        options: q.options.map(opt => opt.trim()),
                        correctAnswer: correctAns7.toUpperCase()
                    };
                });
                existingQuestion.question = undefined;
                existingQuestion.options = [];
                existingQuestion.correctAnswer = undefined;
                existingQuestion.blanks = [];
                break;

            default:
                throw new Error("Part không hợp lệ.");
        }

        await existingQuestion.save();
        req.flash('success', 'Cập nhật câu hỏi thành công');
        res.redirect(`/admin/questions/by-part/${partNum}`);
    } catch (error) {
        console.error("Lỗi khi cập nhật câu hỏi:", error);
        if (req.file && req.file.path) {
            deleteFile(req.file.path);
        }
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect(`/admin/questions/edit/${req.params.id}`);
    }
};

// Hiển thị câu hỏi theo Part
exports.getQuestionsByPart = async (req, res) => {
    try {
        const { part } = req.params;
        const partNum = Number(part);
        if (![5, 6, 7].includes(partNum)) {
            req.flash('error', 'Part không hợp lệ.');
            return res.redirect('/admin/dashboard');
        }

        const questions = await Question.find({ part: partNum }).lean();
        const partNames = { 5: "Part 5", 6: "Part 6", 7: "Part 7" };

        res.render("admin/pages/TOEIC/questions-by-part", {
            questions,
            currentPart: partNum,
            partNames,
            difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
            success: req.flash('success'),
            error: req.flash('error')
        });
    } catch (error) {
        console.error("Lỗi khi lọc câu hỏi theo Part:", error);
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin/dashboard');
    }
};

// Hiển thị form tìm kiếm
exports.showSearchForm = (req, res) => {
    res.render("search-question", {
        questions: null,
        error: req.flash('error')
    });
};

// Xử lý tìm kiếm
exports.searchQuestions = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword || !keyword.trim()) {
            req.flash('error', 'Vui lòng nhập từ khóa tìm kiếm.');
            return res.redirect('/admin/questions/search');
        }

        const questions = await Question.find({
            $or: [
                { MaCC: { $regex: keyword, $options: "i" } },
                { question: { $regex: keyword, $options: "i" } },
                { passage: { $regex: keyword, $options: "i" } },
                { correctAnswer: { $regex: keyword, $options: "i" } }
            ]
        }).lean();

        res.render("search-question", {
            questions,
            difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" }
        });
    } catch (error) {
        console.error("Lỗi tìm kiếm câu hỏi:", error);
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin/questions/search');
    }
};

// Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            req.flash('error', 'Không tìm thấy câu hỏi.');
            return res.redirect('/admin/dashboard');
        }

        if (question.Img) {
            deleteFile(question.Img);
        }

        await Question.findByIdAndDelete(req.params.id);
        req.flash('success', 'Xóa câu hỏi thành công.');
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error("Lỗi xóa câu hỏi:", error);
        req.flash('error', `Lỗi: ${error.message}`);
        res.redirect('/admin/dashboard');
    }
};

// Xóa đề thi
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đề thi." });
        }
        res.json({ success: true, message: "Đã xóa đề thi thành công." });
    } catch (error) {
        console.error("Lỗi xóa đề thi:", error);
        res.status(500).json({ success: false, message: `Lỗi: ${error.message}` });
    }
};