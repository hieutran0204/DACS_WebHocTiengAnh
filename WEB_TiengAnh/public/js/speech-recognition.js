let recognition;
let originalWords = []; // Lưu trữ từ gốc để so sánh

// Khởi tạo khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
  // Lấy text gốc từ thẻ HTML
  const originalText = document.getElementById('originalText').textContent;
  originalWords = cleanText(originalText).split(' ');
  
  // Thiết lập sự kiện cho nút ghi âm
  const recordBtn = document.getElementById('recordBtn');
  recordBtn.addEventListener('click', toggleRecording);
});

// Hàm bật/tắt ghi âm
function toggleRecording() {
  if (!recognition) {
    startRecording();
  } else {
    stopRecording();
  }
}

// Hàm bắt đầu ghi âm
function startRecording() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3; // Lấy 3 kết quả dự đoán

  recognition.onstart = () => {
    updateStatus("Đang nghe...", 'info');
    document.getElementById('recordBtn').innerHTML = '<i class="fas fa-stop"></i> Dừng';
    clearResults();
  };

  recognition.onresult = (event) => {
    const result = event.results[0];
    const bestMatch = result[0].transcript.toLowerCase();
    const alternatives = Array.from(result).slice(1).map(alt => alt.transcript);
    
    document.getElementById('result').textContent = bestMatch;
    checkPronunciation(bestMatch, alternatives);
  };

  recognition.onerror = (event) => {
    updateStatus(`Lỗi: ${event.error}`, 'error');
  };

  recognition.start();
}

// Hàm dừng ghi âm
function stopRecording() {
  recognition.stop();
  recognition = null;
  updateStatus("Đã dừng ghi âm", 'success');
  document.getElementById('recordBtn').innerHTML = '<i class="fas fa-microphone"></i> Bắt đầu';
}

// Hàm kiểm tra phát âm (cải tiến)
function checkPronunciation(userSpeech, alternatives = []) {
  const userWords = cleanText(userSpeech).split(' ');
  let correctCount = 0;
  const feedback = [];
  const details = [];

  originalWords.forEach((word, index) => {
    const userWord = userWords[index] || '';
    const isCorrect = userWord === word;
    
    if (isCorrect) {
      correctCount++;
      feedback.push(`<span class="correct">${word}</span>`);
      details.push({ word, status: 'correct', userSaid: userWord });
    } else {
      // Kiểm tra trong các phương án thay thế
      const matchedAlt = alternatives.find(alt => alt.includes(word));
      feedback.push(`
        <span class="incorrect">
          ${word}
          <span class="tooltip">${matchedAlt ? `Gợi ý: ${matchedAlt}` : `Nghe: ${userWord || '?'}`}</span>
        </span>
      `);
      details.push({ word, status: 'incorrect', userSaid: userWord, suggestions: alternatives });
    }
  });

  const accuracy = Math.round((correctCount / originalWords.length) * 100);
  showResults(accuracy, feedback.join(' '), details);
}

// Hiển thị kết quả chi tiết
function showResults(accuracy, feedbackHtml, details) {
  document.getElementById('accuracy-score').innerHTML = `
    <div class="accuracy">
      <div class="score">${accuracy}%</div>
      <div class="progress">
        <div class="progress-bar" style="width: ${accuracy}%"></div>
      </div>
    </div>
  `;

  document.getElementById('word-feedback').innerHTML = feedbackHtml;
  console.log('Chi tiết:', details); // Có thể dùng để phân tích sau
}

// Helper functions
function cleanText(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]|_/g, '') // Bỏ dấu câu
    .replace(/\s+/g, ' '); // Chuẩn hóa khoảng trắng
}

function updateStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `alert alert-${type}`;
  statusEl.style.display = 'block';
}

function clearResults() {
  document.getElementById('result').textContent = '';
  document.getElementById('word-feedback').innerHTML = '';
  document.getElementById('accuracy-score').innerHTML = '';
}