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
    const skillType = 'transcription'; // Mặc định là transcription
    let uploadPath;

    if (file.fieldname === 'audio') {
      uploadPath = path.join(__dirname, '..', 'public', 'shared', 'audio', 'transcription');
    } else if (file.fieldname === 'image') {
      uploadPath = path.join(__dirname, '..', 'public', 'shared', 'images', 'transcription');
    } else if (file.fieldname === 'diagram') {
      uploadPath = path.join(__dirname, '..', 'public', 'shared', 'diagrams', 'transcription');
    }

    console.log('uploadPath:', uploadPath);
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const skillType = 'transcription'; // Mặc định là transcription

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname).toLowerCase();

    const validAudioExt = ['.mp3', '.wav'];
    const validImageExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (file.fieldname === 'audio' && !validAudioExt.includes(extname)) {
      return cb(new Error('File âm thanh phải có định dạng MP3 hoặc WAV'), false);
    }
    if (['image', 'diagram'].includes(file.fieldname) && !validImageExt.includes(extname)) {
      return cb(new Error('File ảnh phải có định dạng JPEG, PNG, GIF hoặc WEBP'), false);
    }

    const filename = `${skillType}-${file.fieldname}-${uniqueSuffix}${extname}`;
    console.log('Tên file được tạo:', filename);
    cb(null, filename);
  }
});

const checkFileType = (req, file, cb) => {
  const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (file.fieldname === 'audio') {
    if (validAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file âm thanh định dạng MP3, WAV'), false);
    }
  } else if (['image', 'diagram'].includes(file.fieldname)) {
    if (validImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh định dạng JPEG, PNG, GIF, WEBP'), false);
    }
  } else {
    cb(new Error('Trường upload không hợp lệ'), false);
  }
};

const checkFileSize = (req, file, cb) => {
  const limits = {
    audio: 10 * 1024 * 1024, // 10MB
    image: 5 * 1024 * 1024,  // 5MB
    diagram: 5 * 1024 * 1024 // 5MB
  };

  const maxSize = limits[file.fieldname];
  if (!maxSize) {
    return cb(new Error('Trường upload không hợp lệ'), false);
  }

  if (file.size > maxSize) {
    return cb(new Error(`File ${file.fieldname} vượt quá giới hạn kích thước (${maxSize / 1024 / 1024}MB)`), false);
  }

  cb(null, true);
};

const combinedFileFilter = (req, file, cb) => {
  checkFileType(req, file, (err, accepted) => {
    if (err || !accepted) {
      return cb(err || new Error('File không được chấp nhận'));
    }

    checkFileSize(req, file, (err, sizeAccepted) => {
      if (err || !sizeAccepted) {
        return cb(err || new Error('File không được chấp nhận'));
      }

      cb(null, true);
    });
  });
};

const uploadMulti = multer({ 
  storage,
  fileFilter: combinedFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = uploadMulti;