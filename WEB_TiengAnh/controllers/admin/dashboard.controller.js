// const mongoose = require('mongoose');
// const ListeningTOEICPart1 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart1;
// const ListeningTOEICPart2 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart2;
// const ListeningTOEICPart3 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart3;
// const ListeningTOEICPart4 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart4;
// const Question = require('../../models/TOEIC/readingToiec.model');


// let User;
// try {
//   User = mongoose.model('User');
// } catch (error) {
//   User = mongoose.model('User', new mongoose.Schema({ username: String }));
// }

// exports.index = async (req, res) => {
//   res.render('admin/pages/dashboard', {
//     totalQuestions: 0,
//     questionsByPart: { part1: 0, part2: 0, part3: 0, part4: 0, part5: 0, part6: 0, part7: 0 },
//     totalExams: 0,
//     examsByType: { listening: 0, reading: 0 },
//     totalUsers: 0,
//     totalReports: 0,
//     recentActivities: [],
//   });
// };

// exports.getDashboard_TOEIC = async (req, res) => {
//   const defaultData = {
//     totalQuestions: 0,
//     questionsByPart: { part1: 0, part2: 0, part3: 0, part4: 0, part5: 0, part6: 0, part7: 0 },
//     totalExams: 0,
//     examsByType: { listening: 0, reading: 0 },
//     totalUsers: 0,
//     totalReports: 0,
//     recentActivities: [],
//   };

//   try {
//     let listeningCounts = [0, 0, 0, 0];
//     try {
//       listeningCounts = await Promise.all([
//         ListeningTOEICPart1.countDocuments(),
//         ListeningTOEICPart2.countDocuments(),
//         ListeningTOEICPart3.countDocuments(),
//         ListeningTOEICPart4.countDocuments(),
//       ]);
//     } catch (error) {
//       console.error('Error counting listening questions:', error);
//     }

//     let readingCount = 0;
//     try {
//       readingCount = await Question.countDocuments();
//     } catch (error) {
//       console.error('Error counting reading questions:', error);
//     }

//     const totalQuestions = listeningCounts.reduce((sum, count) => sum + count, 0) + readingCount;

//     const questionsByPart = {
//       part1: listeningCounts[0],
//       part2: listeningCounts[1],
//       part3: listeningCounts[2],
//       part4: listeningCounts[3],
//       part5: 0,
//       part6: 0,
//       part7: 0,
//     };

//     try {
//       questionsByPart.part5 = await Question.countDocuments({ part: '5' });
//       questionsByPart.part6 = await Question.countDocuments({ part: '6' });
//       questionsByPart.part7 = await Question.countDocuments({ part: '7' });
//     } catch (error) {
//       console.error('Error counting reading questions by part:', error);
//     }

//     let totalExams = 0;
//     try {
//       totalExams = await ExamPart.countDocuments();
//     } catch (error) {
//       console.error('Error counting exams:', error);
//     }

//     const examsByType = {
//       listening: 0,
//       reading: 0,
//     };
//     try {
//       examsByType.listening = await ExamPart.countDocuments({ examType: 'Listening' });
//       examsByType.reading = await ExamPart.countDocuments({ examType: 'Reading' });
//     } catch (error) {
//       console.error('Error counting exams by type:', error);
//     }

//     let totalUsers = 0;
//     try {
//       totalUsers = await User.countDocuments();
//     } catch (error) {
//       console.error('Error counting users:', error);
//     }

//     const totalReports = 0;

//     let recentActivities = [];
//     try {
//       recentActivities = await ExamPart.find()
//         .sort({ createdAt: -1 })
//         .limit(3)
//         .select('examType part createdAt createdBy')
//         .populate('createdBy', 'username')
//         .lean();
//     } catch (populateError) {
//       console.error('Populate error:', populateError);
//       try {
//         recentActivities = await ExamPart.find()
//           .sort({ createdAt: -1 })
//           .limit(3)
//           .select('examType part createdAt createdBy')
//           .lean();
//       } catch (error) {
//         console.error('Error fetching recent activities:', error);
//       }
//     }

//     res.render('admin/pages/dashboard', {
//       totalQuestions,
//       questionsByPart,
//       totalExams,
//       examsByType,
//       totalUsers,
//       totalReports,
//       recentActivities,
//     });
//   } catch (error) {
//     console.error('Dashboard error:', error);
//     res.render('admin/pages/dashboard', defaultData);
//   }
// };

// exports.redirectExamType = async (req, res) => {
//   const { examType } = req.params;
//   if (examType === 'Listening' || examType === 'Reading') {
//     res.redirect('/admin/dashboard_TOEIC');
//   } else {
//     res.status(400).send('Exam type không hợp lệ');
//   }
// };

// exports.getDashboardData = async (req, res) => {
//   const defaultData = {
//     totalQuestions: 0,
//     questionsByPart: { part1: 0, part2: 0, part3: 0, part4: 0, part5: 0, part6: 0, part7: 0 },
//     totalExams: 0,
//     examsByType: { listening: 0, reading: 0 },
//     totalUsers: 0,
//     totalReports: 0,
//     recentActivities: [],
//   };

//   try {
//     let listeningCounts = [0, 0, 0, 0];
//     try {
//       listeningCounts = await Promise.all([
//         ListeningTOEICPart1.countDocuments(),
//         ListeningTOEICPart2.countDocuments(),
//         ListeningTOEICPart3.countDocuments(),
//         ListeningTOEICPart4.countDocuments(),
//       ]);
//     } catch (error) {
//       console.error('Error counting listening questions:', error);
//     }

//     let readingCount = 0;
//     try {
//       readingCount = await Question.countDocuments();
//     } catch (error) {
//       console.error('Error counting reading questions:', error);
//     }

//     const totalQuestions = listeningCounts.reduce((sum, count) => sum + count, 0) + readingCount;

//     const questionsByPart = {
//       part1: listeningCounts[0],
//       part2: listeningCounts[1],
//       part3: listeningCounts[2],
//       part4: listeningCounts[3],
//       part5: 0,
//       part6: 0,
//       part7: 0,
//     };

//     try {
//       questionsByPart.part5 = await Question.countDocuments({ part: '5' });
//       questionsByPart.part6 = await Question.countDocuments({ part: '6' });
//       questionsByPart.part7 = await Question.countDocuments({ part: '7' });
//     } catch (error) {
//       console.error('Error counting reading questions by part:', error);
//     }

//     let totalExams = 0;
//     try {
//       totalExams = await ExamPart.countDocuments();
//     } catch (error) {
//       console.error('Error counting exams:', error);
//     }

//     const examsByType = {
//       listening: 0,
//       reading: 0,
//     };
//     try {
//       examsByType.listening = await ExamPart.countDocuments({ examType: 'Listening' });
//       examsByType.reading = await ExamPart.countDocuments({ examType: 'Reading' });
//     } catch (error) {
//       console.error('Error counting exams by type:', error);
//     }

//     let totalUsers = 0;
//     try {
//       totalUsers = await User.countDocuments();
//     } catch (error) {
//       console.error('Error counting users:', error);
//     }

//     const totalReports = 0;

//     let recentActivities = [];
//     try {
//       recentActivities = await ExamPart.find()
//         .sort({ createdAt: -1 })
//         .limit(3)
//         .select('examType part createdAt createdBy')
//         .populate('createdBy', 'username')
//         .lean();
//     } catch (populateError) {
//       console.error('Populate error:', populateError);
//       try {
//         recentActivities = await ExamPart.find()
//           .sort({ createdAt: -1 })
//           .limit(3)
//           .select('examType part createdAt createdBy')
//           .lean();
//       } catch (error) {
//         console.error('Error fetching recent activities:', error);
//       }
//     }

//     res.json({
//       totalQuestions,
//       questionsByPart,
//       totalExams,
//       examsByType,
//       totalUsers,
//       totalReports,
//       recentActivities,
//     });
//   } catch (error) {
//     console.error('Dashboard data error:', error);
//     res.json(defaultData);
//   }
// };

// // Thêm hàm xóa đề thi
// exports.deleteExam = async (req, res) => {
//   try {
//     const { examId } = req.params;
//     const exam = await ExamPart.findByIdAndDelete(examId);
//     if (!exam) {
//       return res.status(404).send('Không tìm thấy đề thi');
//     }
//     // Sau khi xóa thành công, chuyển hướng về trang danh sách đề thi
//     res.redirect('/admin/exam-parts');
//   } catch (error) {
//     console.error('Error deleting exam:', error);
//     res.status(500).send('Lỗi khi xóa đề thi');
//   }
// };
const mongoose = require('mongoose');
const ListeningTOEICPart1 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart1;
const ListeningTOEICPart2 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart2;
const ListeningTOEICPart3 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart3;
const ListeningTOEICPart4 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart4;
const Question = require('../../models/TOEIC/readingToiec.model');
const ExamPart_Listening = require('../../models/TOEIC/ExamPart_Listening.model');
const ExamPart_Reading = require('../../models/TOEIC/ExamPart_Reading.model');

let User;
try {
  User = mongoose.model('User');
} catch (error) {
  User = mongoose.model('User', new mongoose.Schema({ username: String }));
}

exports.index = async (req, res) => {
  res.render('admin/pages/dashboard', {
    totalQuestions: 0,
    questionsByPart: { part1: 0, part2: 0, part3: 0, part4: 0, part5: 0, part6: 0, part7: 0 },
    totalExams: 0,
    examsByType: { listening: 0, reading: 0 },
    totalUsers: 0,
    totalReports: 0,
    recentActivities: [],
  });
};

exports.getDashboard_TOEIC = async (req, res) => {
  const defaultData = {
    totalQuestions: 0,
    questionsByPart: { part1: 0, part2: 0, part3: 0, part4: 0, part5: 0, part6: 0, part7: 0 },
    totalExams: 0,
    examsByType: { listening: 0, reading: 0 },
    totalUsers: 0,
    totalReports: 0,
    recentActivities: [],
  };

  try {
    // Đếm câu hỏi Listening
    let listeningCounts = [0, 0, 0, 0];
    try {
      listeningCounts = await Promise.all([
        ListeningTOEICPart1.countDocuments(),
        ListeningTOEICPart2.countDocuments(),
        ListeningTOEICPart3.countDocuments(),
        ListeningTOEICPart4.countDocuments(),
      ]);
    } catch (error) {
      console.error('Error counting listening questions:', error);
    }

    // Đếm câu hỏi Reading
    let readingCount = 0;
    try {
      readingCount = await Question.countDocuments();
    } catch (error) {
      console.error('Error counting reading questions:', error);
    }

    const totalQuestions = listeningCounts.reduce((sum, count) => sum + count, 0) + readingCount;

    const questionsByPart = {
      part1: listeningCounts[0],
      part2: listeningCounts[1],
      part3: listeningCounts[2],
      part4: listeningCounts[3],
      part5: 0,
      part6: 0,
      part7: 0,
    };

    try {
      questionsByPart.part5 = await Question.countDocuments({ part: '5' });
      questionsByPart.part6 = await Question.countDocuments({ part: '6' });
      questionsByPart.part7 = await Question.countDocuments({ part: '7' });
    } catch (error) {
      console.error('Error counting reading questions by part:', error);
    }

    // Đếm tổng số đề thi (Listening + Reading)
    let totalExams = 0;
    try {
      const listeningExams = await ExamPart_Listening.countDocuments();
      const readingExams = await ExamPart_Reading.countDocuments();
      totalExams = listeningExams + readingExams;
    } catch (error) {
      console.error('Error counting exams:', error);
    }

    const examsByType = {
      listening: 0,
      reading: 0,
    };
    try {
      examsByType.listening = await ExamPart_Listening.countDocuments();
      examsByType.reading = await ExamPart_Reading.countDocuments();
    } catch (error) {
      console.error('Error counting exams by type:', error);
    }

    // Đếm số người dùng
    let totalUsers = 0;
    try {
      totalUsers = await User.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
    }

    const totalReports = 0;

    // Lấy hoạt động gần đây từ cả Listening và Reading
    let recentActivities = [];
    try {
      const listeningActivities = await ExamPart_Listening.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('examType part createdAt createdBy')
        .populate('createdBy', 'username')
        .lean();

      const readingActivities = await ExamPart_Reading.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('examType part createdAt createdBy')
        .populate('createdBy', 'username')
        .lean();

      recentActivities = [...listeningActivities, ...readingActivities]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    } catch (populateError) {
      console.error('Populate error:', populateError);
      try {
        const listeningActivities = await ExamPart_Listening.find()
          .sort({ createdAt: -1 })
          .limit(3)
          .select('examType part createdAt createdBy')
          .lean();

        const readingActivities = await ExamPart_Reading.find()
          .sort({ createdAt: -1 })
          .limit(3)
          .select('examType part createdAt createdBy')
          .lean();

        recentActivities = [...listeningActivities, ...readingActivities]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    }

    res.render('admin/pages/dashboard', {
      totalQuestions,
      questionsByPart,
      totalExams,
      examsByType,
      totalUsers,
      totalReports,
      recentActivities,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('admin/pages/dashboard', defaultData);
  }
};

exports.redirectExamType = async (req, res) => {
  const { examType } = req.params;
  if (examType === 'Listening' || examType === 'Reading') {
    res.redirect('/admin/dashboard_TOEIC');
  } else {
    res.status(400).send('Exam type không hợp lệ');
  }
};

exports.getDashboardData = async (req, res) => {
  const defaultData = {
    totalQuestions: 0,
    questionsByPart: { part1: 0, part2: 0, part3: 0, part4: 0, part5: 0, part6: 0, part7: 0 },
    totalExams: 0,
    examsByType: { listening: 0, reading: 0 },
    totalUsers: 0,
    totalReports: 0,
    recentActivities: [],
  };

  try {
    // Đếm câu hỏi Listening
    let listeningCounts = [0, 0, 0, 0];
    try {
      listeningCounts = await Promise.all([
        ListeningTOEICPart1.countDocuments(),
        ListeningTOEICPart2.countDocuments(),
        ListeningTOEICPart3.countDocuments(),
        ListeningTOEICPart4.countDocuments(),
      ]);
    } catch (error) {
      console.error('Error counting listening questions:', error);
    }

    // Đếm câu hỏi Reading
    let readingCount = 0;
    try {
      readingCount = await Question.countDocuments();
    } catch (error) {
      console.error('Error counting reading questions:', error);
    }

    const totalQuestions = listeningCounts.reduce((sum, count) => sum + count, 0) + readingCount;

    const questionsByPart = {
      part1: listeningCounts[0],
      part2: listeningCounts[1],
      part3: listeningCounts[2],
      part4: listeningCounts[3],
      part5: 0,
      part6: 0,
      part7: 0,
    };

    try {
      questionsByPart.part5 = await Question.countDocuments({ part: '5' });
      questionsByPart.part6 = await Question.countDocuments({ part: '6' });
      questionsByPart.part7 = await Question.countDocuments({ part: '7' });
    } catch (error) {
      console.error('Error counting reading questions by part:', error);
    }

    // Đếm tổng số đề thi (Listening + Reading)
    let totalExams = 0;
    try {
      const listeningExams = await ExamPart_Listening.countDocuments();
      const readingExams = await ExamPart_Reading.countDocuments();
      totalExams = listeningExams + readingExams;
    } catch (error) {
      console.error('Error counting exams:', error);
    }

    const examsByType = {
      listening: 0,
      reading: 0,
    };
    try {
      examsByType.listening = await ExamPart_Listening.countDocuments();
      examsByType.reading = await ExamPart_Reading.countDocuments();
    } catch (error) {
      console.error('Error counting exams by type:', error);
    }

    // Đếm số người dùng
    let totalUsers = 0;
    try {
      totalUsers = await User.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
    }

    const totalReports = 0;

    // Lấy hoạt động gần đây từ cả Listening và Reading
    let recentActivities = [];
    try {
      const listeningActivities = await ExamPart_Listening.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('examType part createdAt createdBy')
        .populate('createdBy', 'username')
        .lean();

      const readingActivities = await ExamPart_Reading.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('examType part createdAt createdBy')
        .populate('createdBy', 'username')
        .lean();

      recentActivities = [...listeningActivities, ...readingActivities]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    } catch (populateError) {
      console.error('Populate error:', populateError);
      try {
        const listeningActivities = await ExamPart_Listening.find()
          .sort({ createdAt: -1 })
          .limit(3)
          .select('examType part createdAt createdBy')
          .lean();

        const readingActivities = await ExamPart_Reading.find()
          .sort({ createdAt: -1 })
          .limit(3)
          .select('examType part createdAt createdBy')
          .lean();

        recentActivities = [...listeningActivities, ...readingActivities]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    }

    res.json({
      totalQuestions,
      questionsByPart,
      totalExams,
      examsByType,
      totalUsers,
      totalReports,
      recentActivities,
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.json(defaultData);
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Thử xóa từ ExamPart_Listening
    let exam = await ExamPart_Listening.findByIdAndDelete(examId);
    if (!exam) {
      // Nếu không tìm thấy trong Listening, thử xóa từ ExamPart_Reading
      exam = await ExamPart_Reading.findByIdAndDelete(examId);
      if (!exam) {
        req.flash('error', 'Không tìm thấy đề thi');
        return res.redirect('/admin/TOEIC/exam-listening');
      }
    }

    req.flash('success', 'Xóa đề thi thành công');
    res.redirect(exam.examType === 'Listening' ? '/admin/TOEIC/exam-listening' : '/admin/TOEIC/exam-reading');
  } catch (error) {
    console.error('Error deleting exam:', error);
    req.flash('error', 'Lỗi khi xóa đề thi');
    res.redirect('/admin/TOEIC/exam-listening');
  }
};