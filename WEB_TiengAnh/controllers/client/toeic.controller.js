// const Reading = require("../../models/TOEIC/readingToiec.model");
// const Listening = require("../../models/TOEIC/listeningTOEIC.model");

// exports.showExams = async (req, res) => {
//   try {
//     // Lấy các tham số từ query string
//     const { skills = [], parts = [] } = req.query;
    
//     // Xử lý khi skills hoặc parts là string (khi chỉ chọn 1 giá trị)
//     const skillArray = typeof skills === 'string' ? [skills] : skills;
//     const partArray = typeof parts === 'string' ? [parts] : parts;
    
//     // Tạo mảng các model cần query
//     const modelsToQuery = [];
    
//     if (skillArray.includes('listening')) {
//       modelsToQuery.push(Listening);
//     }
//     if (skillArray.includes('reading')) {
//       modelsToQuery.push(Reading);
//     }
//     // Nếu không chọn skill nào thì mặc định query cả 2
//     if (skillArray.length === 0) {
//       modelsToQuery.push(Listening, Reading);
//     }
    
//     // Tạo điều kiện lọc part nếu có
//     const partFilter = partArray.length > 0 ? { part: { $in: partArray.map(Number) } } : {};
    
//     // Thực hiện query trên tất cả các model cần thiết
//     const queryPromises = modelsToQuery.map(model => model.find(partFilter).exec());
//     const results = await Promise.all(queryPromises);
    
//     // Gộp tất cả kết quả lại và thêm trường skill để phân biệt
//     let allExams = [];
//     results.forEach((exams, index) => {
//       const skill = modelsToQuery[index] === Listening ? 'listening' : 'reading';
//       const examsWithSkill = exams.map(exam => ({
//         ...exam.toObject(),
//         skill,
//         title: `${skill.toUpperCase()} Part ${exam.part}`,
//         thumbnail: exam.Img || '/images/default-exam-thumbnail.jpg'
//       }));
//       allExams = [...allExams, ...examsWithSkill];
//     });
    
//     res.render("client/pages/toeic-dashboard", {
//       exams: allExams,
//       selectedSkills: skillArray,
//       selectedParts: partArray
//     });
    
//   } catch (err) {
//     console.error("Error fetching exams:", err);
//     res.status(500).send("Lỗi server");
//   }
// };


const Reading = require("../../models/TOEIC/readingToiec.model");
const Listening = require("../../models/TOEIC/listeningTOEIC.model");

exports.showExams = async (req, res) => {
  try {
    // Lấy các tham số từ query string
    const { skills = [], parts = [] } = req.query;
    
    // Xử lý khi skills hoặc parts là string (khi chỉ chọn 1 giá trị)
    const skillArray = typeof skills === 'string' ? [skills] : skills;
    const partArray = typeof parts === 'string' ? parts.split(',') : parts;
    
    // Tạo mảng các model cần query
    const modelsToQuery = [];
    
    if (skillArray.includes('listening') || skillArray.length === 0) {
      modelsToQuery.push(Listening);
    }
    if (skillArray.includes('reading') || skillArray.length === 0) {
      modelsToQuery.push(Reading);
    }
    
    // Tạo điều kiện lọc part nếu có
    const partFilter = partArray.length > 0 ? { part: { $in: partArray.map(Number) } } : {};
    
    // Thực hiện query trên tất cả các model cần thiết
    const queryPromises = modelsToQuery.map(model => model.find(partFilter).exec());
    const results = await Promise.all(queryPromises);
    
    // Gộp tất cả kết quả lại và thêm trường skill để phân biệt
    let allExams = [];
    results.forEach((exams, index) => {
      const skill = modelsToQuery[index] === Listening ? 'listening' : 'reading';
      const examsWithSkill = exams.map(exam => ({
        ...exam.toObject(),
        skill,
        title: `${skill.toUpperCase()} Part ${exam.part}`,
        thumbnail: exam.Img || '/images/default-exam-thumbnail.jpg'
      }));
      allExams = [...allExams, ...examsWithSkill];
    });
    
    // Lọc lại theo part nếu có (đảm bảo chính xác)
    const filteredExams = partArray.length > 0 
      ? allExams.filter(exam => partArray.includes(exam.part.toString()))
      : allExams;
    
    res.render("client/pages/toeic-dashboard", {
      exams: filteredExams,
      selectedSkills: skillArray,
      selectedParts: partArray
    });
    
  } catch (err) {
    console.error("Error fetching exams:", err);
    res.status(500).send("Lỗi server");
  }
};