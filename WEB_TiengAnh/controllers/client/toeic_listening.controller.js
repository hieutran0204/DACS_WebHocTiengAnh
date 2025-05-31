const ExamPartListening = require("../../models/TOEIC/ExamPart_Listening.model");
const {
  ListeningTOEICPart1,
  ListeningTOEICPart2,
  ListeningTOEICPart3,
  ListeningTOEICPart4,
} = require("../../models/TOEIC/listeningTOEIC.model");

// Ánh xạ model theo modelName
const modelMap = {
  ListeningTOEICPart1,
  ListeningTOEICPart2,
  ListeningTOEICPart3,
  ListeningTOEICPart4,
};

// Hiển thị danh sách các đề Listening TOEIC đã public
exports.getExamListeningList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const listeningExams = await ExamPartListening.find({ status: "public" })
      .select("part difficulty createdAt createdBy")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ExamPartListening.countDocuments({ status: "public" });

    res.render("client/pages/exam-listening-list", {
      examParts: listeningExams,
      difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      error: null, // Thêm error để đồng bộ với giao diện
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đề thi Listening:", error);
    res.render("client/pages/exam-listening-list", {
      examParts: [],
      error: "Lỗi server khi lấy danh sách đề thi Listening",
      difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
      page: 1,
      limit: 10,
      total: 0,
    });
  }
};

// Hiển thị một đề Listening cụ thể để làm bài, nhóm theo Part
exports.getPublicListeningExams = async (req, res) => {
  try {
    const { id } = req.params;

    const listeningExam = await ExamPartListening.findOne({
      _id: id,
      status: "public",
    })
      .populate({
        path: "questions.questionId",
        select:
          "part questionNumber questionText paragraph audioUrl imageUrl transcript diagramUrl questions options correctAnswer explanation", // Thêm explanation
        refPath: "questions.modelName",
      })
      .populate("createdBy", "username")
      .lean();

    if (!listeningExam) {
      return res.render("client/pages/exam-listening", {
        examPart: null,
        questionsByPart: {},
        error: "Không tìm thấy đề thi hoặc đề thi chưa được public",
      });
    }

    // Nhóm câu hỏi theo Part (1, 2, 3, 4)
    const questionsByPart = {};
    listeningExam.questions.forEach((q) => {
      if (!q.questionId || !q.modelName) {
        console.warn(
          `Câu hỏi không hợp lệ: questionId=${q.questionId}, modelName=${q.modelName}`
        );
        return;
      }

      const part = q.questionId.part;
      const partKey = `Part ${part}`;
      if (!questionsByPart[partKey]) questionsByPart[partKey] = [];

      let questionData;
      if (
        q.modelName === "ListeningTOEICPart3" ||
        q.modelName === "ListeningTOEICPart4"
      ) {
        if (
          q.subQuestionIndex === undefined ||
          !q.questionId.questions?.[q.subQuestionIndex]
        ) {
          console.warn(
            `SubQuestion không hợp lệ: questionId=${q.questionId._id}, subQuestionIndex=${q.subQuestionIndex}`
          );
          return;
        }
        const subQuestion = q.questionId.questions[q.subQuestionIndex];
        questionData = {
          questionId: q.questionId._id,
          part,
          questionNumber: q.questionId.questionNumber,
          questionText: subQuestion.text,
          options: subQuestion.options,
          audioUrl: q.questionId.audioUrl,
          transcript: q.questionId.transcript,
          diagramUrl: q.questionId.diagramUrl,
          subQuestionIndex: q.subQuestionIndex,
          explanation: subQuestion.explanation, // Thêm explanation
        };
      } else {
        questionData = {
          questionId: q.questionId._id,
          part,
          questionNumber: q.questionId.questionNumber,
          questionText: q.questionId.questionText || q.questionId.paragraph,
          options: q.questionId.options,
          audioUrl: q.questionId.audioUrl,
          imageUrl: q.questionId.imageUrl,
          transcript: q.questionId.transcript,
          explanation: q.questionId.explanation, // Thêm explanation
        };
      }
      questionsByPart[partKey].push(questionData);
    });

    // Sắp xếp câu hỏi theo questionNumber và subQuestionIndex
    for (const partKey in questionsByPart) {
      questionsByPart[partKey].sort((a, b) => {
        if (a.questionNumber === b.questionNumber) {
          return (a.subQuestionIndex || 0) - (b.subQuestionIndex || 0);
        }
        return a.questionNumber - b.questionNumber;
      });
    }

    res.render("client/pages/exam-listening", {
      examPart: listeningExam,
      questionsByPart,
      difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
      error: null,
    });
  } catch (error) {
    console.error("Lỗi khi lấy đề thi Listening:", error);
    res.render("client/pages/exam-listening", {
      examPart: null,
      questionsByPart: {},
      error: "Lỗi server khi lấy đề thi Listening",
    });
  }
};

// Xử lý nộp bài và chấm điểm
// exports.submitListeningExam = async (req, res) => {
//   try {
//     const { examPartId, answers } = req.body;

//     // Validate input
//     if (!examPartId || !answers || typeof answers !== "object") {
//       console.error("Dữ liệu đầu vào không hợp lệ:", { examPartId, answers });
//       return res.render("client/pages/exam-listening", {
//         examPart: null,
//         questionsByPart: {},
//         error: "Dữ liệu nộp bài không hợp lệ",
//       });
//     }

//     const examPart = await ExamPartListening.findById(examPartId)
//       .populate({
//         path: "questions.questionId",
//         select:
//           "part questionNumber questions correctAnswer explanation imageUrl", // Thêm explanation và imageUrl
//         refPath: "questions.modelName",
//       })
//       .lean();

//     if (!examPart) {
//       console.error(`Không tìm thấy đề thi: examPartId=${examPartId}`);
//       return res.render("client/pages/exam-listening", {
//         examPart: null,
//         questionsByPart: {},
//         error: "Không tìm thấy đề thi",
//       });
//     }

//     let score = 0;
//     const totalQuestions = examPart.questions.length;
//     const results = [];

//     examPart.questions.forEach((q, index) => {
//       if (!q.questionId) {
//         console.warn(
//           `Câu hỏi không hợp lệ tại index ${index}: questionId=${q.questionId}`
//         );
//         return;
//       }

//       const key =
//         q.subQuestionIndex !== undefined
//           ? `${q.questionId._id}-${q.subQuestionIndex}`
//           : `${q.questionId._id}-0`;
//       const userAnswer = answers[key];

//       let correctAnswer;
//       let explanation;
//       if (
//         q.modelName === "ListeningTOEICPart3" ||
//         q.modelName === "ListeningTOEICPart4"
//       ) {
//         if (
//           q.subQuestionIndex === undefined ||
//           !q.questionId.questions?.[q.subQuestionIndex]
//         ) {
//           console.warn(
//             `SubQuestion không hợp lệ: questionId=${q.questionId._id}, subQuestionIndex=${q.subQuestionIndex}`
//           );
//           return;
//         }
//         correctAnswer =
//           q.questionId.questions[q.subQuestionIndex].correctAnswer;
//         explanation = q.questionId.questions[q.subQuestionIndex].explanation;
//       } else {
//         correctAnswer = q.questionId.correctAnswer;
//         explanation = q.questionId.explanation;
//       }

//       // Validate correctAnswer
//       if (!correctAnswer) {
//         console.warn(`Câu hỏi ${q.questionId._id} thiếu correctAnswer`);
//         results.push({
//           questionId: q.questionId._id,
//           subQuestionIndex: q.subQuestionIndex || 0,
//           questionNumber: q.questionId.questionNumber,
//           userAnswer: userAnswer || "Không chọn",
//           correctAnswer: "Không xác định",
//           isCorrect: false,
//           explanation: "Câu hỏi thiếu đáp án đúng trong hệ thống",
//           imageUrl: q.questionId.imageUrl, // Thêm imageUrl cho Part 1
//         });
//         return;
//       }

//       const isCorrect = userAnswer && userAnswer === correctAnswer;
//       if (isCorrect) score++;

//       results.push({
//         questionId: q.questionId._id,
//         subQuestionIndex: q.subQuestionIndex || 0,
//         questionNumber: q.questionId.questionNumber,
//         userAnswer: userAnswer || "Không chọn",
//         correctAnswer,
//         isCorrect,
//         explanation: isCorrect ? null : explanation, // Chỉ hiển thị explanation nếu sai
//         imageUrl: q.questionId.imageUrl, // Thêm imageUrl cho Part 1
//       });
//     });

//     const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

//     // Log kết quả để debug
//     console.log("Kết quả chấm điểm:", {
//       examPartId,
//       score,
//       totalQuestions,
//       percentage,
//       results: results.map((r) => ({
//         questionNumber: r.questionNumber,
//         userAnswer: r.userAnswer,
//         correctAnswer: r.correctAnswer,
//         isCorrect: r.isCorrect,
//       })),
//     });

//     res.render("client/pages/exam-result", {
//       score,
//       totalQuestions,
//       percentage,
//       results,
//       examType: "Listening",
//       examPart,
//       difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
//       error: null,
//     });
//   } catch (error) {
//     console.error("Lỗi khi chấm điểm:", error);
//     res.render("client/pages/exam-listening", {
//       examPart: null,
//       questionsByPart: {},
//       error: "Lỗi server khi chấm điểm",
//     });
//   }
// };
// Trong file controller client-facing (Listening)
exports.submitListeningExam = async (req, res) => {
  try {
    const { examPartId, answers } = req.body;

    // Validate input
    if (!examPartId || !answers || typeof answers !== "object") {
      console.error("Dữ liệu đầu vào không hợp lệ:", { examPartId, answers });
      return res.render("client/pages/exam-listening", {
        examPart: null,
        questionsByPart: {},
        error: "Dữ liệu nộp bài không hợp lệ",
        results: null,
        score: 0,
        totalQuestions: 0,
        percentage: 0,
      });
    }

    const examPart = await ExamPartListening.findById(examPartId)
      .populate({
        path: "questions.questionId",
        select:
          "part questionNumber questionText paragraph audioUrl imageUrl transcript diagramUrl questions options correctAnswer explanation",
        refPath: "questions.modelName",
      })
      .lean();

    if (!examPart) {
      console.error(`Không tìm thấy đề thi: examPartId=${examPartId}`);
      return res.render("client/pages/exam-listening", {
        examPart: null,
        questionsByPart: {},
        error: "Không tìm thấy đề thi",
        results: null,
        score: 0,
        totalQuestions: 0,
        percentage: 0,
      });
    }

    // Tạo questionsByPart để hiển thị lại câu hỏi
    const questionsByPart = {};
    examPart.questions.forEach((q) => {
      if (!q.questionId || !q.modelName) {
        console.warn(
          `Câu hỏi không hợp lệ: questionId=${q.questionId}, modelName=${q.modelName}`
        );
        return;
      }

      const part = q.questionId.part;
      const partKey = `Part ${part}`;
      if (!questionsByPart[partKey]) questionsByPart[partKey] = [];

      let questionData;
      if (
        q.modelName === "ListeningTOEICPart3" ||
        q.modelName === "ListeningTOEICPart4"
      ) {
        if (
          q.subQuestionIndex === undefined ||
          !q.questionId.questions?.[q.subQuestionIndex]
        ) {
          console.warn(
            `SubQuestion không hợp lệ: questionId=${q.questionId._id}, subQuestionIndex=${q.subQuestionIndex}`
          );
          return;
        }
        const subQuestion = q.questionId.questions[q.subQuestionIndex];
        questionData = {
          questionId: q.questionId._id,
          part,
          questionNumber: q.questionId.questionNumber,
          questionText: subQuestion.text,
          options: subQuestion.options,
          audioUrl: q.questionId.audioUrl,
          transcript: q.questionId.transcript,
          diagramUrl: q.questionId.diagramUrl,
          subQuestionIndex: q.subQuestionIndex,
          explanation: subQuestion.explanation,
        };
      } else {
        questionData = {
          questionId: q.questionId._id,
          part,
          questionNumber: q.questionId.questionNumber,
          questionText: q.questionId.questionText || q.questionId.paragraph,
          options: q.questionId.options,
          audioUrl: q.questionId.audioUrl,
          imageUrl: q.questionId.imageUrl,
          transcript: q.questionId.transcript,
          explanation: q.questionId.explanation,
        };
      }
      questionsByPart[partKey].push(questionData);
    });

    for (const partKey in questionsByPart) {
      questionsByPart[partKey].sort((a, b) => {
        if (a.questionNumber === b.questionNumber) {
          return (a.subQuestionIndex || 0) - (b.subQuestionIndex || 0);
        }
        return a.questionNumber - b.questionNumber;
      });
    }

    // Chấm điểm
    let score = 0;
    const totalQuestions = examPart.questions.length;
    const results = [];

    examPart.questions.forEach((q) => {
      if (!q.questionId) {
        console.warn(`Câu hỏi không hợp lệ: questionId=${q.questionId}`);
        return;
      }

      const key =
        q.subQuestionIndex !== undefined
          ? `${q.questionId._id}-${q.subQuestionIndex}`
          : `${q.questionId._id}-0`;
      const userAnswer = answers[key];

      let correctAnswer;
      let explanation;
      if (
        q.modelName === "ListeningTOEICPart3" ||
        q.modelName === "ListeningTOEICPart4"
      ) {
        if (
          q.subQuestionIndex === undefined ||
          !q.questionId.questions?.[q.subQuestionIndex]
        ) {
          console.warn(
            `SubQuestion không hợp lệ: questionId=${q.questionId._id}, subQuestionIndex=${q.subQuestionIndex}`
          );
          return;
        }
        correctAnswer =
          q.questionId.questions[q.subQuestionIndex].correctAnswer;
        explanation = q.questionId.questions[q.subQuestionIndex].explanation;
      } else {
        correctAnswer = q.questionId.correctAnswer;
        explanation = q.questionId.explanation;
      }

      if (!correctAnswer) {
        console.warn(`Câu hỏi ${q.questionId._id} thiếu correctAnswer`);
        results.push({
          questionId: q.questionId._id,
          subQuestionIndex: q.subQuestionIndex || 0,
          questionNumber: q.questionId.questionNumber,
          userAnswer: userAnswer || "Không chọn",
          correctAnswer: "Không xác định",
          isCorrect: false,
          explanation: "Câu hỏi thiếu đáp án đúng trong hệ thống",
          imageUrl: q.questionId.imageUrl,
        });
        return;
      }

      const isCorrect = userAnswer && userAnswer === correctAnswer;
      if (isCorrect) score++;

      results.push({
        questionId: q.questionId._id,
        subQuestionIndex: q.subQuestionIndex || 0,
        questionNumber: q.questionId.questionNumber,
        userAnswer: userAnswer || "Không chọn",
        correctAnswer,
        isCorrect,
        explanation: isCorrect ? null : explanation,
        imageUrl: q.questionId.imageUrl,
      });
    });

    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    // Log kết quả để debug
    console.log("Kết quả chấm điểm:", {
      examPartId,
      score,
      totalQuestions,
      percentage,
      results: results.map((r) => ({
        questionNumber: r.questionNumber,
        userAnswer: r.userAnswer,
        correctAnswer: r.correctAnswer,
        isCorrect: r.isCorrect,
      })),
    });

    // Render lại exam-listening với kết quả
    res.render("client/pages/exam-listening", {
      examPart,
      questionsByPart,
      difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
      error: null,
      results,
      score,
      totalQuestions,
      percentage,
      isSubmitted: true, // Cờ để biết đã nộp bài
    });
  } catch (error) {
    console.error("Lỗi khi chấm điểm:", error.message);
    res.render("client/pages/exam-listening", {
      examPart: null,
      questionsByPart: {},
      error: "Lỗi server khi chấm điểm",
      results: null,
      score: 0,
      totalQuestions: 0,
      percentage: 0,
      isSubmitted: false,
    });
  }
};
