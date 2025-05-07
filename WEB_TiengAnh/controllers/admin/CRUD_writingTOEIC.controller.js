const WritingTOEIC = require('../../models/TOEIC/writingTOEIC.model');
const fs = require('fs');
const path = require('path');

exports.createWritingQuestions = async (req, res) => {
    try {
      const part1Questions = Array.isArray(req.body.part1) ? req.body.part1 : [req.body.part1];
      const processedPart1 = part1Questions.map((item, index) => {
        const file = req.files.find(f => f.fieldname.includes(`part1[${index}][image]`));
        if (!file) throw new Error(`Thiếu ảnh cho câu Part 1 số ${index + 1}`);
        
        return {
          keyword1: item.keyword1 || '',
          keyword2: item.keyword2 || '',
          imagePath: path.join('images/writing', path.basename(file.path)).replace(/\\/g, '/')
        };
      });
  
      const part2Questions = Array.isArray(req.body.part2) ? req.body.part2 : [req.body.part2];
      const processedPart2 = part2Questions.map(item => ({
        situation: item.situation || '',
        requirements: item.requirements || '',
        sampleAnswer: item.sampleAnswer || ''
      }));
  
      const part3Questions = Array.isArray(req.body.part3) ? req.body.part3 : [req.body.part3];
      const processedPart3 = part3Questions.map(item => ({
        question: item.question || '',
        sampleAnswer: item.sampleAnswer || ''
      }));
  
      const newTest = new WritingTOEIC({
        part1: processedPart1,
        part2: processedPart2,
        part3: processedPart3,
        notes: req.body.notes || ''
      });
  
      await newTest.save();
      req.flash('success', 'Tạo đề thi thành công!');
      res.redirect('/admin/toeic-writing');
    } catch (error) {
      console.error('Lỗi khi tạo đề:', error);
      if (req.files) {
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Lỗi khi xóa file tạm:', err);
          }
        });
      }
      req.flash('error', error.message);
      res.redirect('/admin/toeic-writing/create');
    }
};

exports.listWritingQuestions = async (req, res) => {
  try {
    const writings = await WritingTOEIC.find().sort({ createdAt: -1 });
    console.log('Dữ liệu writings:', writings); // Debug dữ liệu
    res.render('admin/pages/TOEIC/writing-list', { writings });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách:', error);
    res.render('admin/pages/TOEIC/writing-list', { writings: [] });
  }
};

exports.showEditForm = async (req, res) => {
  const writing = await WritingTOEIC.findById(req.params.id);
  if (!writing) {
    req.flash('error', 'Không tìm thấy bài test');
    return res.redirect('/admin/toeic-writing');
  }
  res.render('admin/pages/TOEIC/edit-writing-question', { writing });
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

      console.log('req.body.notes:', req.body.notes); // Debug giá trị notes

      if (req.files && req.files.length > 0) {
        if (part === 1 || part === 999) {
          const part1Data = Array.isArray(req.body.part1) ? req.body.part1 : [req.body.part1];
          part1Data.forEach((item, index) => {
            const file = req.files.find(f => f.fieldname.includes(`part1[${index}][image]`));
            if (file && item.existingImagePath) {
              try {
                const oldImagePath = path.join(__dirname, '../../../public', item.existingImagePath);
                if (fs.existsSync(oldImagePath)) {
                  fs.unlinkSync(oldImagePath);
                }
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
          
          let imagePath = item.existingImagePath || test.part1[index]?.imagePath || '';
          if (file) {
            imagePath = path.join('images/writing', path.basename(file.path)).replace(/\\/g, '/');
          }

          return {
            keyword1: item.keyword1 || test.part1[index]?.keyword1 || '',
            keyword2: item.keyword2 || test.part1[index]?.keyword2 || '',
            imagePath: imagePath
          };
        });
      }
      
      if (part === 2 || part === 999) {
        const part2Data = Array.isArray(req.body.part2) ? req.body.part2 : [req.body.part2];
        updateData.part2 = part2Data.map((item, index) => ({
          situation: item.situation || test.part2[index]?.situation || '',
          requirements: item.requirements || test.part2[index]?.requirements || '',
          sampleAnswer: item.sampleAnswer || test.part2[index]?.sampleAnswer || ''
        }));
      }
      
      if (part === 3 || part === 999) {
        const part3Data = Array.isArray(req.body.part3) ? req.body.part3 : [req.body.part3];
        updateData.part3 = part3Data.map((item, index) => ({
          question: item.question || test.part3[index]?.question || '',
          sampleAnswer: item.sampleAnswer || test.part3[index]?.sampleAnswer || ''
        }));
      }

      if (req.body.notes) {
        updateData.notes = req.body.notes;
      }

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

exports.deleteWritingQuestion = async (req, res) => {
  try {
    const test = await WritingTOEIC.findById(req.params.id);
    if (test) {
      test.part1.forEach(item => {
        if (item.imagePath) {
          try {
            const imagePath = path.join(__dirname, '../../../public', item.imagePath);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          } catch (err) {
            console.error('Lỗi khi xóa ảnh:', err);
          }
        }
      });
      await WritingTOEIC.findByIdAndDelete(req.params.id);
      req.flash('success', 'Xóa đề thi thành công!');
    } else {
      req.flash('error', 'Không tìm thấy đề thi');
    }
    res.redirect('/admin/toeic-writing');
  } catch (error) {
    console.error('Lỗi khi xóa:', error);
    req.flash('error', error.message);
    res.redirect('/admin/toeic-writing');
  }
};

exports.showCreateForm = (req, res) => {
    res.render('admin/pages/TOEIC/create-writing-question');
};