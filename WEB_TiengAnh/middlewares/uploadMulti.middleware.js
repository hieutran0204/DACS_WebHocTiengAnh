const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let skillType;
    if (req.path.includes('listening')) {
      skillType = 'listening';
    } else if (req.path.includes('reading')) {
      skillType = 'reading';
    } else if (req.path.includes('writing')) {
      skillType = 'writing';
    } else {
      skillType = 'common';
    }
    
    let uploadPath = path.join('public', 'images', skillType);
    if (file.fieldname.includes('audio')) {
      uploadPath = path.join('public', 'audio', skillType);
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    let skillType;
    if (req.path.includes('listening')) {
      skillType = 'listening';
    } else if (req.path.includes('reading')) {
      skillType = 'reading';
    } else if (req.path.includes('writing')) {
      skillType = 'writing';
    } else {
      skillType = 'common';
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname);
    
    const filename = `${skillType}-${file.fieldname}-${uniqueSuffix}${extname}`;
    cb(null, filename);
  }
});

const checkFileType = (req, file, cb) => {
  const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.fieldname.includes('audio')) {
    if (validAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file âm thanh định dạng MP3, WAV'), false);
    }
  } else if (file.fieldname.includes('image')) { // Sửa để kiểm tra fieldname chứa 'image'
    if (validImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh định dạng JPEG, PNG, GIF, WEBP'), false);
    }
  } else if (file.fieldname.includes('diagram')) { // Thêm kiểm tra cho diagram
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
    audio: 10 * 1024 * 1024,
    image: 5 * 1024 * 1024,
    diagram: 5 * 1024 * 1024
  };

  let maxSize;
  if (file.fieldname.includes('audio')) {
    maxSize = limits.audio;
  } else if (file.fieldname.includes('image') || file.fieldname.includes('diagram')) {
    maxSize = limits.image;
  } else {
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