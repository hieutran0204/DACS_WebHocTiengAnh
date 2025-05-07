document.addEventListener('DOMContentLoaded', function() {
    const currentWordData = {
      id: `${question._id}`,
      word: `${question.word}`.toLowerCase(),
      image: `${question.image}`,
      hints: JSON.parse(`${JSON.stringify(question.hints)}`)
    };
  
    const maskPieces = Array.from(document.querySelectorAll('.mask-piece'));
    const guessForm = document.getElementById('guessForm');
    const resultModal = document.getElementById('resultModal');
    const resultText = document.getElementById('resultText');
    const nextWordBtn = document.getElementById('nextWordBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const hintDisplay = document.getElementById('hintDisplay');
    
    let revealedPieces = 0;
    let gameEnded = false;
  
    // Initialize game
    initGame();
  
    // Form submission handler
    guessForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (gameEnded) return;
      
      const guess = this.elements.guess.value.trim().toLowerCase();
      
      if (!guess) {
        alert('Vui lòng nhập từ đoán của bạn!');
        return;
      }
      
      if (guess === currentWordData.word) {
        // Correct guess
        revealAllPieces();
        showResult(true, guess);
        disableForm();
      } else {
        // Wrong guess - reveal next piece
        revealedPieces++;
        this.elements.revealedPieces.value = revealedPieces;
        
        if (revealedPieces <= 4) {
          revealPiece(revealedPieces - 1);
          updateHint(revealedPieces);
          
          if (revealedPieces >= 4) {
            showResult(false, guess);
            disableForm();
          } else {
            animateWrongGuess();
          }
        }
        
        this.elements.guess.value = '';
        this.elements.guess.focus();
      }
    });
  
    // Next word button - load a random word
    nextWordBtn.addEventListener('click', function() {
      this.disabled = true;
      this.textContent = 'Đang tải...';
      fetchRandomWord();
    });
  
    // Play again button - reset current word
    playAgainBtn.addEventListener('click', function() {
      resetGame();
      resultModal.style.display = 'none';
    });
  
    function initGame() {
      revealedPieces = 0;
      gameEnded = false;
      guessForm.elements.revealedPieces.value = '0';
      guessForm.elements.guess.value = '';
      guessForm.elements.guess.disabled = false;
      guessForm.querySelector('button').disabled = false;
      
      // Reset mask pieces to initial state
      maskPieces.forEach(piece => {
        piece.style.backgroundColor = '#000';
        piece.style.animation = ''; // Remove any animations
        piece.style.transition = 'background-color 0.5s ease-out'; // Ensure smooth transition
      });
      
      updateHint(0);
    }
  
    function revealPiece(index) {
      if (index >= 0 && index < maskPieces.length) {
        maskPieces[index].style.backgroundColor = 'transparent';
        maskPieces[index].style.animation = 'fadeIn 0.5s ease-out';
      }
    }
  
    function revealAllPieces() {
      maskPieces.forEach(piece => {
        piece.style.backgroundColor = 'transparent';
        piece.style.animation = 'fadeIn 0.5s ease-out';
      });
    }
  
    function updateHint(revealedCount) {
      let hintText;
      if (revealedCount === 0) {
        hintText = currentWordData.hints[0];
      } else if (revealedCount <= currentWordData.hints.length) {
        hintText = currentWordData.hints[revealedCount];
      } else {
        hintText = `Đáp án là: ${currentWordData.word}`;
      }
      
      hintDisplay.textContent = `Gợi ý: ${hintText}`;
      hintDisplay.style.animation = 'none';
      void hintDisplay.offsetWidth;
      hintDisplay.style.animation = 'fadeIn 0.3s ease-out';
    }
  
    function showResult(isCorrect, userGuess) {
      gameEnded = true;
      
      if (isCorrect) {
        resultText.innerHTML = `
          <span class="correct">Chính xác! 🎉</span><br>
          Bạn đã đoán đúng từ: <strong>${currentWordData.word}</strong>
        `;
      } else {
        resultText.innerHTML = `
          <span class="wrong">Chưa chính xác!</span><br>
          ${revealedPieces >= 4 ? `Đáp án là: <strong>${currentWordData.word}</strong>` : `Bạn đã mở ${revealedPieces}/4 ô`}<br>
          ${userGuess ? `Bạn đã đoán: <strong>${userGuess}</strong>` : ''}
        `;
      }
      
      resultModal.style.display = 'flex';
    }
  
    function disableForm() {
      guessForm.elements.guess.disabled = true;
      guessForm.querySelector('button').disabled = true;
    }
  
    function resetGame() {
      initGame();
    }
  
    function animateWrongGuess() {
      const input = guessForm.elements.guess;
      input.style.animation = 'none';
      void input.offsetWidth;
      input.style.animation = 'shake 0.5s';
      
      setTimeout(() => {
        input.style.animation = '';
      }, 500);
    }
  
    async function fetchRandomWord() {
      try {
        const response = await fetch('/hidden-word/random');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.word) {
            // Chuyển hướng đến trang với từ mới
            window.location.href = `/hidden-word?id=${data.word._id}`;
          } else {
            throw new Error('Không nhận được dữ liệu từ server');
          }
        } else {
          throw new Error('Failed to fetch random word');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Không thể tải từ mới. Vui lòng thử lại!');
        nextWordBtn.disabled = false;
        nextWordBtn.textContent = 'Tiếp Tục';
      }
    }
  });