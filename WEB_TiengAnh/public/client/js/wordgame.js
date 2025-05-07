$(document).ready(function() {
    const $submitBtn = $('#submit-btn');
    const $userInput = $('#user-input');
    const $message = $('.message');
    const $shuffledWord = $('#shuffled-word');
    const $hintText = $('#hint-text');
  
    // Xử lý khi nhấn nút Kiểm tra hoặc Enter
    function checkAnswer() {
      const userAnswer = $userInput.val().trim();
      
      if (!userAnswer) {
        $message.text('Vui lòng nhập từ!').addClass('text-danger');
        return;
      }
  
      $.ajax({
        url: '/wordgame/check',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ userAnswer }),
        success: function(response) {
          if (response.correct) {
            $message.text('Chính xác! Chuẩn bị từ mới...').addClass('text-success').removeClass('text-danger');
            
            // Chờ 5 giây trước khi hiển thị từ mới
            setTimeout(() => {
              $shuffledWord.text(response.newWord.shuffled);
              $hintText.text(`Gợi ý: ${response.newWord.hint}`);
              $userInput.val('');
              $message.text('');
            }, 5000);
          } else {
            $message.text(response.message).addClass('text-danger').removeClass('text-success');
          }
        },
        error: function() {
          $message.text('Có lỗi xảy ra, vui lòng thử lại!').addClass('text-danger');
        }
      });
    }
  
    $submitBtn.click(checkAnswer);
    
    $userInput.keypress(function(e) {
      if (e.which === 13) { // Enter key
        checkAnswer();
      }
    });
  });