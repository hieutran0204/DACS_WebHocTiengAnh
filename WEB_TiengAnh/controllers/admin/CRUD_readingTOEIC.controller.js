const Question = require("../../models/TOEIC/readingToiec.model");
const upload = require('../../middlewares/uploadMulti.middleware');
const Exam = require("../../models/TOEIC/exam.model");
// Lấy danh sách câu hỏi
exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find().lean();
        res.render("admin/pages/TOEIC/dashboard-questionTOEIC", { questions });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi lấy danh sách câu hỏi");
    }
};

// Trang dashboard admin
exports.getDashboard = async (req, res) => {
    try {
        const questions = await Question.find();
        res.render("admin/pages/dashboard", { questions });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
exports.getDashboard_TOEIC = async (req, res) => {
    try {
        const questions = await Question.find();
        res.render("admin/pages/TOEIC/dashboard_TOEIC", { questions });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};

// Hiển thị form thêm câu hỏi
exports.showCreateForm = (req, res) => {
    res.render("admin/pages/TOEIC/create-question");
};
exports.showCreateFormExam = (req, res) => {
    try {
        res.render("admin/pages/TOEIC/create-exam");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi tải trang tạo đề");
    }
};
// Xử lý thêm câu hỏi
// Cập nhật hàm createQuestion để hỗ trợ cả 3 part
exports.createQuestion = async (req, res) => {
    try {
        const {
            MaCC,
            TopicN,
            part,
            questionN,
            question,
            options,
            correctAnswer,
            passage,
            blanks,
            questions,
            explanation,
            difficulty
        } = req.body;

        // Validate chung
        if (!MaCC || !TopicN || !part || !questionN) {
            return res.status(400).send("Vui lòng điền đầy đủ các trường bắt buộc.");
        }

        const partNum = parseInt(part);
        const questionData = {
            MaCC,
            TopicN: parseInt(TopicN),
            part: partNum,
            questionN: parseInt(questionN),
            explanation: explanation || '',
            difficulty: parseInt(difficulty) || 0,
            Img: req.file ? "/admin/img/uploads_reading_TOEIC/" + req.file.filename : null
        };

        // Xử lý theo từng Part
        switch (partNum) {
            case 5:
                if (!question || !options || !correctAnswer) {
                    return res.status(400).send("Vui lòng điền đầy đủ các trường cho Part 5.");
                }
                questionData.question = question;
                questionData.options = Array.isArray(options) ? options : [options];
                questionData.correctAnswer = correctAnswer;
                break;

            case 6:
                if (!passage || !blanks) {
                    return res.status(400).send("Vui lòng điền đầy đủ các trường cho Part 6.");
                }
                questionData.passage = passage;
                questionData.blanks = Array.isArray(blanks) ? blanks : [];
                break;

            case 7:
                if (!passage || !questions) {
                    return res.status(400).send("Vui lòng điền đầy đủ các trường cho Part 7.");
                }
                questionData.passage = passage;
                questionData.questions = Array.isArray(questions) ? questions : [];
                break;

            default:
                return res.status(400).send("Part không hợp lệ");
        }

        const newQuestion = new Question(questionData);
        await newQuestion.save();
        
        req.flash('success', 'Thêm câu hỏi thành công');
        res.redirect(`/admin/questions/by-part/${partNum}`);

    } catch (error) {
        console.error("Lỗi khi thêm câu hỏi:", error);
        req.flash('error', 'Có lỗi khi thêm câu hỏi: ' + error.message);
        res.redirect('/admin/questions/add');
    }
};

// Ramdom exam generation
// Lọc câu hỏi theo độ khó (Dễ/Trung bình/Kho)
exports. generateRandomExam = async (req, res) => {
    try {
        const { parts, difficulty, questionCount, minTopic, maxTopic } = req.body;

        // Validate input
        if (!parts || !difficulty || !questionCount) {
            return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin bắt buộc" });
        }

        // Convert parts to array of numbers
        const partsArray = Array.isArray(parts) 
            ? parts.map(Number) 
            : [Number(parts)];

        // Build query
        const query = {
            part: { $in: partsArray },
            difficulty: Number(difficulty)
        };

        // Add topic range if provided
        if (minTopic && maxTopic) {
            query.TopicN = { 
                $gte: Number(minTopic), 
                $lte: Number(maxTopic) 
            };
        }

        // Get all questions matching criteria
        const allQuestions = await Question.find(query).lean();

        // Check if enough questions available
        if (allQuestions.length < questionCount) {
            return res.status(400).json({ 
                error: `Chỉ có ${allQuestions.length} câu hỏi phù hợp trong database (yêu cầu: ${questionCount})` 
            });
        }

        // Shuffle and select random questions
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, questionCount);

        // Generate exam code
        const examCode = `RND-${partsArray.join('')}-${Date.now().toString().slice(-4)}`;

        // Create exam document (you may need to create a new Exam model)
        const newExam = new Exam({
            examCode,
            questions: selectedQuestions.map(q => q._id),
            parts: partsArray,
            difficulty: Number(difficulty),
            questionCount: Number(questionCount),
            createdBy: req.user._id // Assuming you have user authentication
        });

        await newExam.save();

        // Return success with exam data
        res.json({
            success: true,
            examId: newExam._id,
            examCode,
            questionCount: selectedQuestions.length,
            parts: partsArray,
            difficulty: ['Dễ', 'Trung bình', 'Khó'][difficulty]
        });

    } catch (error) {
        console.error("Error generating random exam:", error);
        res.status(500).json({ error: "Lỗi server khi tạo đề ngẫu nhiên" });
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
            examStatus: {
                0: "Draft",
                1: "Published",
                2: "Archived"
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy danh sách đề thi");
    }
};

// Xem chi tiết đề thi
exports.getExamDetail = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate({
                path: 'questions',
                select: 'MaCC part questionN question options correctAnswer'
            })
            .lean();

        if (!exam) {
            return res.status(404).send("Không tìm thấy đề thi");
        }

        // Nhóm câu hỏi theo Part
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
            difficultyMap: {
                0: "Dễ",
                1: "Trung bình",
                2: "Khó"
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy chi tiết đề thi");
    }
};



exports.showEditForm = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id).lean();
        if (!question) {
            return res.status(404).send("Không tìm thấy câu hỏi");
        }

        // Xử lý dữ liệu cho Part 6
        if (question.part == 6) {
            // Nếu không có blanks hoặc không phải mảng, gán mảng rỗng mẫu
            if (!Array.isArray(question.blanks) || question.blanks.length === 0) {
                question.blanks = [{
                    blank: 1,
                    options: ["", "", "", ""],
                    correctAnswer: ""
                }];
            } else {
                // Đảm bảo mỗi blank có đủ 4 options
                question.blanks = question.blanks.map((b, i) => ({
                    blank: b.blank || i + 1,
                    options: Array.isArray(b.options) ? b.options.concat(Array(4 - b.options.length).fill("")) : ["", "", "", ""],
                    correctAnswer: b.correctAnswer || ""
                }));
            }
        }

        // Xử lý dữ liệu cho Part 7
        if (question.part == 7) {
            if (!Array.isArray(question.questions) || question.questions.length === 0) {
                question.questions = [{
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: ""
                }];
            } else {
                // Đảm bảo mỗi câu có đủ 4 options
                question.questions = question.questions.map((q) => ({
                    question: q.question || "",
                    options: Array.isArray(q.options) ? q.options.concat(Array(4 - q.options.length).fill("")) : ["", "", "", ""],
                    correctAnswer: q.correctAnswer || ""
                }));
            }
        }

        res.render("admin/pages/TOEIC/edit-question", { question });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi tải form chỉnh sửa");
    }
};

// Cập nhật hàm updateQuestion
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            MaCC,
            TopicN,
            part,
            questionN,
            question,
            options,
            correctAnswer,
            explanation,
            passage,
            blanks,
            questions,
            removeImage
        } = req.body;

        // Validate input
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("ID không hợp lệ");
        }

        const existingQuestion = await Question.findById(id);
        if (!existingQuestion) {
            return res.status(404).send("Không tìm thấy câu hỏi");
        }

        // Cập nhật thông tin chung
        existingQuestion.MaCC = MaCC || 'TOEIC';
        existingQuestion.TopicN = parseInt(TopicN) || 1;
        existingQuestion.part = parseInt(part);
        existingQuestion.questionN = parseInt(questionN) || 1;
        existingQuestion.explanation = explanation || '';
        existingQuestion.updatedAt = Date.now();

        // Xử lý ảnh
        if (removeImage === 'on') {
            existingQuestion.Img = '';
        } else if (req.file) {
            existingQuestion.Img = "/admin/img/uploads_reading_TOEIC/" + req.file.filename;
        }

        // Xử lý theo từng Part
        switch (parseInt(part)) {
            case 5:
                existingQuestion.question = question || '';
                existingQuestion.options = Array.isArray(options) ? options.slice(0, 4) : 
                                          (typeof options === 'string' ? [options, '', '', ''] : ['', '', '', '']);
                existingQuestion.correctAnswer = ['A', 'B', 'C', 'D'].includes(correctAnswer) ? correctAnswer : '';
                
                // Xóa các trường không dùng
                existingQuestion.passage = undefined;
                existingQuestion.blanks = [];
                existingQuestion.questions = [];
                break;

            case 6:
                existingQuestion.passage = passage || '';
                
                // Xử lý blanks
                if (Array.isArray(blanks)) {
                    existingQuestion.blanks = blanks.map(b => ({
                        blank: parseInt(b.blank) || 1,
                        options: Array.isArray(b.options) ? b.options.slice(0, 4) : ['', '', '', ''],
                        correctAnswer: ['A', 'B', 'C', 'D'].includes(b.correctAnswer) ? b.correctAnswer : ''
                    })).filter(b => b.blank > 0);
                } else {
                    existingQuestion.blanks = [];
                }
                
                // Xóa các trường không dùng
                existingQuestion.question = undefined;
                existingQuestion.options = [];
                existingQuestion.correctAnswer = undefined;
                existingQuestion.questions = [];
                break;

            case 7:
                existingQuestion.passage = passage || '';
                
                // Xử lý questions
                if (Array.isArray(questions)) {
                    existingQuestion.questions = questions.map(q => ({
                        question: q.question || '',
                        options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['', '', '', ''],
                        correctAnswer: ['A', 'B', 'C', 'D'].includes(q.correctAnswer) ? q.correctAnswer : ''
                    }));
                } else {
                    existingQuestion.questions = [];
                }
                
                // Xóa các trường không dùng
                existingQuestion.question = undefined;
                existingQuestion.options = [];
                existingQuestion.correctAnswer = undefined;
                existingQuestion.blanks = [];
                break;

            default:
                return res.status(400).send("Part không hợp lệ");
        }

        await existingQuestion.save();
        res.redirect("/admin/questions/by-part/" + existingQuestion.part);
    } catch (error) {
        console.error("Lỗi khi cập nhật câu hỏi:", error);
        res.redirect(`/admin/questions/edit/${id}?error=Có lỗi khi cập nhật câu hỏi`);
    }
};

// exports.getQuestionsByPart = async (req, res) => {
//     try {
//         const { part } = req.params;
//         const questions = await Question.find({ part: Number(part) }).lean(); // Ép kiểu số vì part trong schema là Number
//         res.render("admin/pages/TOEIC/questions-by-part", { 
//             questions,
//             currentPart: part,
//             partNames: { 5: "Part 5", 6: "Part 6", 7: "Part 7" } // Đặt tên hiển thị
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Lỗi khi lọc câu hỏi theo Part");
//     }
// };
// Hiện thị câu hỏi theo Part (5/6/7)
exports.getQuestionsByPart = async (req, res) => {
    try {
        const { part } = req.params;
        const questions = await Question.find({ part: Number(part) }).lean(); // Ép kiểu số vì part trong schema là Number
        const partNames = { 5: "Part 5", 6: "Part 6", 7: "Part 7" }; // Đặt tên hiển thị
        const currentPart = Number(part);

        res.render("admin/pages/TOEIC/questions-by-part", { 
            questions,
            currentPart,
            partNames
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lọc câu hỏi theo Part");
    }
};

// Hiển thị form tìm kiếm
exports.showSearchForm = (req, res) => {
    res.render("search-question", { questions: null });
};

// Xử lý tìm kiếm
exports.searchQuestions = async (req, res) => {
    try {
        const { keyword } = req.query;
        const questions = await Question.find({
            $or: [
                { MaCC: { $regex: keyword, $options: "i" } },
                { question: { $regex: keyword, $options: "i" } },
                { correctAnswer: { $regex: keyword, $options: "i" } }
            ]
        }).lean();
        res.render("search-question", { questions });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi tìm kiếm câu hỏi");
    }
};

// Xóa một câu hỏi
exports.deleteQuestion = async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.redirect("/admin/dashboard");
    } catch (error) {
        res.status(500).send("Lỗi xóa câu hỏi");
    }
};

// Xóa một đề thi
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
        }
        res.json({ success: true, message: "Đã xóa đề thi thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi xóa đề thi" });
    }
};