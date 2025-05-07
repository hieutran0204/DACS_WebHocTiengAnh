let recognition;
let originalWords = [];
let isContinuous = false;
let accumulatedResults = ""; // Lưu trữ kết quả tích lũy
let isRecording = false; // Theo dõi trạng thái ghi âm

document.addEventListener('DOMContentLoaded', () => {
  const originalText = document.getElementById('originalText').textContent;
  originalWords = cleanText(originalText).split(/\s+/).filter(word => word.length > 0);
  
  const recordBtn = document.getElementById('recordBtn');
  recordBtn.addEventListener('click', toggleRecording);
  
  // Cải tiến nút chuyển đổi chế độ
  const toggleModeBtn = document.createElement('button');
  toggleModeBtn.id = 'toggleModeBtn';
  toggleModeBtn.className = 'mode-btn';
  toggleModeBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Chế độ liên tục: TẮT';
  toggleModeBtn.addEventListener('click', toggleContinuousMode);
  recordBtn.parentNode.insertBefore(toggleModeBtn, recordBtn.nextSibling);
});

function toggleContinuousMode() {
  isContinuous = !isContinuous;
  document.getElementById('toggleModeBtn').innerHTML = 
    `<i class="fas fa-sync-alt"></i> Chế độ liên tục: ${isContinuous ? 'BẬT' : 'TẮT'}`;
  document.getElementById('toggleModeBtn').classList.toggle('active-mode', isContinuous);
  
  // Nếu đang ghi âm, khởi động lại với chế độ mới
  if (isRecording) {
    stopRecording();
    startRecording();
  }
}

function toggleRecording() {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
}

function startRecording() {
  // Dừng recognition cũ nếu có
  if (recognition) {
    recognition.stop();
  }

  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = isContinuous;
  recognition.maxAlternatives = 5; // Tăng số phương án thay thế
  
  // Reset kết quả tích lũy nếu không ở chế độ liên tục
  if (!isContinuous) {
    accumulatedResults = "";
    clearResults();
  }

  recognition.onstart = () => {
    isRecording = true;
    updateStatus(isContinuous ? "Đang nghe liên tục..." : "Đang nghe...", 'info');
    document.getElementById('recordBtn').innerHTML = '<i class="fas fa-stop"></i> Dừng';
    document.getElementById('recordBtn').classList.add('recording');
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let newFinalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        newFinalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Hiển thị kết quả tạm thời
    if (interimTranscript) {
      document.getElementById('result').textContent = interimTranscript;
    }
    
    // Xử lý kết quả cuối cùng
    if (newFinalTranscript) {
      accumulatedResults += newFinalTranscript;
      
      const bestMatch = accumulatedResults.toLowerCase();
      const alternatives = getAlternatives(event);
      
      checkPronunciation(bestMatch, alternatives);
      
      // Nếu không ở chế độ liên tục, dừng lại sau khi có kết quả cuối cùng
      if (!isContinuous) {
        setTimeout(() => stopRecording(), 500);
      }
    }
  };

  recognition.onerror = (event) => {
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      updateStatus(`Lỗi: ${event.error}`, 'error');
    }
    
    // Tự động khởi động lại nếu ở chế độ liên tục
    if (isContinuous && isRecording) {
      setTimeout(() => startRecording(), 1000);
    }
  };

  recognition.onend = () => {
    if (isContinuous && isRecording) {
      startRecording();
    }
  };

  recognition.start();
}

function stopRecording() {
  if (recognition) {
    recognition.stop();
  }
  recognition = null;
  isRecording = false;
  updateStatus("Đã dừng ghi âm", 'success');
  document.getElementById('recordBtn').innerHTML = '<i class="fas fa-microphone"></i> Bắt đầu';
  document.getElementById('recordBtn').classList.remove('recording');
}

function getAlternatives(event) {
  const alternatives = new Set();
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      for (let j = 1; j < event.results[i].length; j++) {
        alternatives.add(event.results[i][j].transcript.toLowerCase());
      }
    }
  }
  return Array.from(alternatives);
}

function checkPronunciation(userSpeech, alternatives = []) {
  const userWords = cleanText(userSpeech).split(/\s+/).filter(word => word.length > 0);
  let correctCount = 0;
  const feedback = [];
  const details = [];

  // Chỉ kiểm tra số từ tương ứng với bản gốc
  const wordsToCheck = Math.min(originalWords.length, userWords.length);
  
  for (let i = 0; i < wordsToCheck; i++) {
    const originalWord = originalWords[i];
    const userWord = userWords[i] || '';
    
    // Kiểm tra độ tương đồng thay vì so khớp chính xác
    const similarity = calculateSimilarity(originalWord, userWord);
    const isCorrect = similarity > 0.7; // Ngưỡng tương đồng 70%
    
    if (isCorrect) {
      correctCount++;
      feedback.push(`<span class="correct">${originalWord}</span>`);
      details.push({ word: originalWord, status: 'correct', userSaid: userWord });
    } else {
      // Tìm phương án thay thế gần nhất
      const closestAlt = findClosestAlternative(originalWord, alternatives);
      feedback.push(`
        <span class="incorrect">
          ${originalWord}
          <span class="tooltip">${closestAlt ? `Gợi ý: ${closestAlt}` : `Bạn nói: ${userWord || '(không rõ)'}`}</span>
        </span>
      `);
      details.push({ 
        word: originalWord, 
        status: 'incorrect', 
        userSaid: userWord, 
        suggestions: closestAlt ? [closestAlt] : alternatives 
      });
    }
  }

  const accuracy = Math.round((correctCount / originalWords.length) * 100);
  showResults(accuracy, feedback.join(' '), details);
}

function calculateSimilarity(word1, word2) {
  if (word1 === word2) return 1.0;
  if (word1.length === 0 || word2.length === 0) return 0.0;
  
  // Tính điểm tương đồng dựa trên:
  // 1. Tỉ lệ độ dài (30%)
  // 2. Ký tự đầu giống nhau (20%)
  // 3. Ký tự cuối giống nhau (20%)
  // 4. Số ký tự chung (30%)
  const lengthScore = Math.min(word1.length, word2.length) / Math.max(word1.length, word2.length) * 0.3;
  const startScore = word1[0] === word2[0] ? 0.2 : 0;
  const endScore = word1.slice(-1) === word2.slice(-1) ? 0.2 : 0;
  
  const commonLetters = [...new Set(word1)].filter(c => word2.includes(c)).length;
  const commonScore = (commonLetters / Math.max(word1.length, word2.length)) * 0.3;
  
  return lengthScore + startScore + endScore + commonScore;
}

function findClosestAlternative(target, alternatives) {
  if (!alternatives || alternatives.length === 0) return null;
  
  let maxSimilarity = 0;
  let closest = null;
  
  for (const alt of alternatives) {
    const similarity = calculateSimilarity(target, alt);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      closest = alt;
    }
  }
  
  return maxSimilarity > 0.5 ? closest : null;
}

// Các hàm helper giữ nguyên
function showResults(accuracy, feedbackHtml, details) {
  document.getElementById('accuracy-score').innerHTML = `
    <div class="accuracy">
      <div class="score ${getAccuracyClass(accuracy)}">${accuracy}%</div>
      <div class="progress">
        <div class="progress-bar" style="width: ${accuracy}%"></div>
      </div>
    </div>
  `;

  document.getElementById('word-feedback').innerHTML = feedbackHtml;
}

function getAccuracyClass(accuracy) {
  if (accuracy >= 80) return 'high-accuracy';
  if (accuracy >= 50) return 'medium-accuracy';
  return 'low-accuracy';
}

function cleanText(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function updateStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `alert alert-${type}`;
  statusEl.style.display = 'block';
  
  // Tự động ẩn thông báo sau 3 giây
  if (type !== 'info') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }
}

function clearResults() {
  document.getElementById('result').textContent = '';
  document.getElementById('word-feedback').innerHTML = '';
  document.getElementById('accuracy-score').innerHTML = '';
}