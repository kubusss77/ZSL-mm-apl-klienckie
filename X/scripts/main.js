const userInput = document.getElementById('user-input');

userInput.focus();

setTimeout(function () {
  userInput.focus();
}, 1000);

userInput.addEventListener('blur', function () {
  setTimeout(() => {
    this.focus();
  }, 0);
});

