let currentWord = "";
let hint = "";

function shuffleWord(word) {
  return word.split('').sort(() => 0.5 - Math.random()).join('');
}

async function loadWord() {
  try {
    const res = await fetch('/game/random');
    const data = await res.json();
    currentWord = data.word;
    hint = data.hint || "Không có gợi ý";
    document.getElementById('shuffled-word').innerText = shuffleWord(currentWord);
    document.getElementById('hint-text').innerText = "Gợi ý: " + hint;
    document.getElementById('user-input').value = '';
    document.getElementById('user-input').focus();
    document.getElementById('message').innerText = '';
  } catch (error) {
    console.error('Error loading word:', error);
    document.getElementById('shuffled-word').innerText = "Lỗi khi tải từ";
  }
}

function checkAnswer() {
  const answer = document.getElementById('user-input').value.trim().toLowerCase();
  const messageElement = document.getElementById('message');
  
  if (!answer) {
    messageElement.innerText = "Vui lòng nhập từ của bạn!";
    messageElement.style.color = 'red';
    return;
  }

  if (answer === currentWord) {
    messageElement.innerText = "Chính xác! 👏";
    messageElement.style.color = 'green';
    setTimeout(loadWord, 1000);
  } else {
    messageElement.innerText = "Sai rồi! Thử lại nào!";
    messageElement.style.color = 'red';
  }
}

window.onload = () => {
  loadWord();
  document.getElementById('submit-btn').onclick = checkAnswer;
  
  document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  });
};