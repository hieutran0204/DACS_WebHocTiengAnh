const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDirectoryExists = (directory) => {
  console.log('Đang kiểm tra/tạo thư mục:', directory);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  if (!fs.existsSync(directory)) {
    throw new Error(`Không thể tạo thư mục: ${directory}`);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    console.log('req.path:', req.path);
    console.log('req.baseUrl:', req.baseUrl);
    console.log('req.originalUrl:', req.originalUrl);
    console.log('req.body:', req.body);
    console.log('file:', file);

    const skillType = 'listening_TOEIC';

    if (file.fieldname === 'audio') {
      uploadPath = path.join(__dirname, '..', 'public', 'shared', 'audio', skillType);
    } else if (file.fieldname === 'image') {
      uploadPath = path.join(__dirname, '..', 'public', 'shared', 'images', skillType);
    } else if (file.fieldname === 'diagram') {
      uploadPath = path.join(__dirname, '..', 'public', 'shared', 'diagrams', skillType);
    } else {
      return cb(new Error(`Trường file không hợp lệ: ${file.fieldname}`));
    }

    console.log('uploadPath:', uploadPath);
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    console.log('req.path trong filename:', req.path);
    console.log('req.baseUrl trong filename:', req.baseUrl);
    console.log('req.originalUrl trong filename:', req.originalUrl);
    console.log('req.body trong filename:', req.body);
    console.log('file trong filename:', file);

    const skillType = 'listening';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname).toLowerCase();

    const validAudioExt = ['.mp3', '.wav'];
    const validImageExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    if (file.fieldname === 'audio' && !validAudioExt.includes(extname)) {
      return cb(new Error(`File audio phải có định dạng: ${validAudioExt.join(', ')}`));
    }
    if ((file.fieldname === 'image' || file.fieldname === 'diagram') && !validImageExt.includes(extname)) {
      return cb(new Error(`File ${file.fieldname} phải có định dạng: ${validImageExt.join(', ')}`));
    }

    const fileType = file.fieldname === 'diagram' ? 'diagram' : file.fieldname === 'image' ? 'image' : 'audio';
    const filename = `${skillType}-${fileType}-${uniqueSuffix}${extname}`;
    console.log('Tên file được tạo:', filename);
    cb(null, filename);
  }
});

const checkFileType = (req, file, cb) => {
  const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  console.log('Kiểm tra file type, fieldname:', file.fieldname);

  if (file.fieldname === 'audio') {
    if (validAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File audio không hợp lệ, mimetype phải là: ${validAudioTypes.join(', ')}`));
    }
  } else if (file.fieldname === 'image' || file.fieldname === 'diagram') {
    if (validImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File ${file.fieldname} không hợp lệ, mimetype phải là: ${validImageTypes.join(', ')}`));
    }
  } else {
    cb(new Error(`Trường file không hợp lệ: ${file.fieldname}`));
  }
};

const checkFileSize = (req, file, cb) => {
  const limits = {
    audio: 50 * 1024 * 1024, // 50MB cho audio
    image: 10 * 1024 * 1024, // 10MB cho image
    diagram: 10 * 1024 * 1024 // 10MB cho diagram
  };

  const fieldType = file.fieldname === 'diagram' ? 'diagram' : file.fieldname === 'image' ? 'image' : 'audio';
  const maxSize = limits[fieldType];
  if (file.size > maxSize) {
    return cb(new Error(`File ${fieldType} vượt quá giới hạn kích thước (${maxSize / 1024 / 1024}MB)`));
  }
  cb(null, true);
};

const combinedFileFilter = (req, file, cb) => {
  checkFileType(req, file, (err, accepted) => {
    if (err) {
      return cb(err);
    }
    if (!accepted) {
      return cb(new Error(`File ${file.fieldname} không được chấp nhận`));
    }
    checkFileSize(req, file, (err, sizeAccepted) => {
      if (err) {
        return cb(err);
      }
      cb(null, true);
    });
  });
};

const uploadListening = multer({
  storage,
  fileFilter: combinedFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB tổng
    fieldSize: 50 * 1024 * 1024, // 50MB cho trường văn bản
    files: 3 // Tối đa 3 file
  }
});

const handleListeningError = (err, req, res, next) => {
  console.error('Multer error (Listening):', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'PROTOCOL_UNEXPECTED_END_OF_FORM') {
      return res.status(400).json({ error: 'Dữ liệu form không hoàn chỉnh. Vui lòng kiểm tra và thử lại.' });
    }
    return res.status(400).json({ error: `Lỗi upload file: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: `Lỗi upload file: ${err.message}` });
  }
  next();
};

module.exports = { uploadListening, handleListeningError };