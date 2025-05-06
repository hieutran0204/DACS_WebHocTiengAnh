const Transcription = require('../../models/TOEIC/transcription.model');
const path = require('path');

exports.createTranscription = async (req, res) => {
    try {
      const audioFile = req.files['audio'][0];
      const { title, transcriptText } = req.body;
  
      const newTranscription = new Transcription({
        title,
        audioPath: '/' + audioFile.path.replace(/\\/g, '/'),
        transcriptText
      });
  
      await newTranscription.save();
      res.redirect('/admin/transcription/list');
    } catch (error) {
      res.status(500).send('Lỗi tạo transcription: ' + error.message);
    }
  };
  
  exports.listTranscriptions = async (req, res) => {
    const items = await Transcription.find().sort({ createdAt: -1 });
    res.render('admin/pages/TOEIC/transcription-list', { items });
  };
  
  exports.deleteTranscription = async (req, res) => {
    await Transcription.findByIdAndDelete(req.params.id);
    res.redirect('/admin/transcription/list');
  };