const WritingTOEIC = require('../../models/TOEIC/writingTOEIC.model');
const fs = require('fs');
const path = require('path');

// Xóa hàm createWritingQuestions trùng lặp và chỉ giữ lại phiên bản hoàn chỉnh này
exports.createWritingQuestions = async (req, res) => {
    try {
      // Xử lý Part 1
      const part1Questions = Array.isArray(req.body.part1) ? req.body.part1 : [req.body.part1];
      const processedPart1 = part1Questions.map((item, index) => {
        const file = req.files.find(f => f.fieldname.includes(`part1[${index}][image]`));
        if (!file) throw new Error(`Thiếu ảnh cho câu Part 1 số ${index + 1}`);
        
        return {
          keyword1: item.keyword1 || '',
          keyword2: item.keyword2 || '',
          imagePath: path.join('uploads', path.basename(file.path)).replace(/\\/g, '/')
        };
      });
  
      // Xử lý Part 2
      const part2Questions = Array.isArray(req.body.part2) ? req.body.part2 : [req.body.part2];
      const processedPart2 = part2Questions.map(item => ({
        situation: item.situation || '',
        requirements: item.requirements || '',
        sampleAnswer: item.sampleAnswer || ''
      }));
  
      // Xử lý Part 3
      const part3Questions = Array.isArray(req.body.part3) ? req.body.part3 : [req.body.part3];
      const processedPart3 = part3Questions.map(item => ({
        question: item.question || '',
        sampleAnswer: item.sampleAnswer || ''
      }));
  
      // Tạo document mới chứa cả 3 parts
      const newTest = new WritingTOEIC({
        part1: processedPart1,
        part2: processedPart2,
        part3: processedPart3
      });
  
      await newTest.save();
      req.flash('success', 'Tạo đề thi thành công!');
      res.redirect('/admin/toeic-writing');
  
    } catch (error) {
      console.error('Lỗi khi tạo đề:', error);
      // Xóa file đã upload nếu có lỗi
      if (req.files) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      req.flash('error', error.message);
      res.redirect('/admin/toeic-writing/create');
    }
  };
// Các hàm khác giữ nguyên...
exports.listWritingQuestions = async (req, res) => {
  const writings = await WritingTOEIC.find().sort({ createdAt: -1 });
  res.render('admin/pages/TOEIC/writing-list', { writings });
};

exports.showEditForm = async (req, res) => {
  const writing = await WritingTOEIC.findById(req.params.id);
  res.render('admin/pages/TOEIC/edit-writing-question', { writing });
};

// exports.updateWritingQuestion = async (req, res) => {
//     try {
//       const id = req.params.id;
//       const part = req.body.part === '999' ? 999 : parseInt(req.body.part);
      
//       if (![1, 2, 3, 999].includes(part)) {
//         throw new Error('Part không hợp lệ');
//       }

//       const updateData = {};
//       const test = await WritingTOEIC.findById(id);
      
//       if (!test) {
//         throw new Error('Không tìm thấy bài test');
//       }

//       if (part === 1 || part === 999) {
//         const part1Data = Array.isArray(req.body.part1) ? req.body.part1 : [req.body.part1];
//         updateData.part1 = part1Data.map((item, index) => {
//           const file = req.files?.find(f => f.fieldname.includes(`part1[${index}][image]`));
          
//           return {
//             keyword1: item.keyword1 || test.part1[index]?.keyword1 || '',
//             keyword2: item.keyword2 || test.part1[index]?.keyword2 || '',
//             imagePath: file 
//               ? path.join('uploads', path.basename(file.path)).replace(/\\/g, '/')
//               : item.existingImagePath || test.part1[index]?.imagePath || ''
//           };
//         });
//       } 
      
//       if (part === 2 || part === 999) {
//         const part2Data = Array.isArray(req.body.part2) ? req.body.part2 : [req.body.part2];
//         updateData.part2 = part2Data.map((item, index) => ({
//           situation: item.situation || test.part2[index]?.situation || '',
//           requirements: item.requirements || test.part2[index]?.requirements || '',
//           sampleAnswer: item.sampleAnswer || test.part2[index]?.sampleAnswer || ''
//         }));
//       }
      
//       if (part === 3 || part === 999) {
//         const part3Data = Array.isArray(req.body.part3) ? req.body.part3 : [req.body.part3];
//         updateData.part3 = part3Data.map((item, index) => ({
//           question: item.question || test.part3[index]?.question || '',
//           sampleAnswer: item.sampleAnswer || test.part3[index]?.sampleAnswer || ''
//         }));
//       }

//       await WritingTOEIC.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      
//       // Xóa file tạm nếu có upload mới
//       if (req.files && req.files.length > 0) {
//         req.files.forEach(file => {
//           fs.unlinkSync(file.path);
//         });
//       }

//       req.flash('success', 'Cập nhật thành công!');
//       res.redirect('/admin/toeic-writing');
//     } catch (error) {
//       console.error('Lỗi khi cập nhật:', error);
//       // Xóa file đã upload nếu có lỗi
//       if (req.files && req.files.length > 0) {
//         req.files.forEach(file => {
//           fs.unlinkSync(file.path);
//         });
//       }
//       req.flash('error', error.message);
//       res.redirect(`/admin/toeic-writing/edit/${req.params.id}`);
//     }
// };
exports.deleteWritingQuestion = async (req, res) => {
  await WritingTOEIC.findByIdAndDelete(req.params.id);
  res.redirect('/admin/toeic-writing');
};
exports.updateWritingQuestion = async (req, res) => {
    try {
      const id = req.params.id;
      const part = req.body.part === '999' ? 999 : parseInt(req.body.part);
      
      if (![1, 2, 3, 999].includes(part)) {
        throw new Error('Part không hợp lệ');
      }

      const updateData = {};
      const test = await WritingTOEIC.findById(id);
      
      if (!test) {
        throw new Error('Không tìm thấy bài test');
      }

      // Xử lý upload file trước khi cập nhật dữ liệu
      if (req.files && req.files.length > 0) {
        // Xóa ảnh cũ nếu có ảnh mới
        if (part === 1 || part === 999) {
          const part1Data = Array.isArray(req.body.part1) ? req.body.part1 : [req.body.part1];
          part1Data.forEach((item, index) => {
            const file = req.files.find(f => f.fieldname.includes(`part1[${index}][image]`));
            if (file && item.existingImagePath) {
              try {
                fs.unlinkSync(path.join(__dirname, '../../../public', item.existingImagePath));
              } catch (err) {
                console.error('Lỗi khi xóa ảnh cũ:', err);
              }
            }
          });
        }
      }

      if (part === 1 || part === 999) {
        const part1Data = Array.isArray(req.body.part1) ? req.body.part1 : [req.body.part1];
        updateData.part1 = part1Data.map((item, index) => {
          const file = req.files?.find(f => f.fieldname.includes(`part1[${index}][image]`));
          
          // Kiểm tra và xử lý đường dẫn ảnh
          let imagePath = item.existingImagePath || test.part1[index]?.imagePath || '';
          if (file) {
            imagePath = path.join('uploads', path.basename(file.path)).replace(/\\/g, '/');
          }

          return {
            keyword1: item.keyword1 || test.part1[index]?.keyword1 || '',
            keyword2: item.keyword2 || test.part1[index]?.keyword2 || '',
            imagePath: imagePath
          };
        });
      }
      
      // ... (phần xử lý part 2 và 3 giữ nguyên)

      await WritingTOEIC.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      
      req.flash('success', 'Cập nhật thành công!');
      res.redirect('/admin/toeic-writing');
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Lỗi khi xóa file tạm:', err);
          }
        });
      }
      req.flash('error', error.message);
      res.redirect(`/admin/toeic-writing/edit/${req.params.id}`);
    }
};
exports.showCreateForm = (req, res) => {
    res.render('admin/pages/TOEIC/create-writing-question');
  };
  
  
  