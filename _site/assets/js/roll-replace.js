"use strict";

var rollReplace = function rollReplace(e) {
  e.target.removeEventListener("click", rollReplace);
  e.target.removeEventListener('keydown', keyCheck);
  var oldStr = e.target.innerText.split('');
  var duration = e.target.getAttribute('data-duration') ? parseFloat(e.target.getAttribute('data-duration')) : .3;
  var delay = e.target.getAttribute('data-delay') ? parseFloat(e.target.getAttribute('data-delay')) : .1;
  e.target.innerText = '';
  oldStr.forEach(function (letter, i) {
    var span = document.createElement('span');
    span.classList.add('replaced');
    span.innerHTML = letter.replace(' ', '&nbsp;');
    e.target.appendChild(span);
    span.style.animation = "rollUp ".concat(duration, "s ").concat(i * delay, "s ease-in-out forwards"); //
  });
  setTimeout(function () {
    while (e.target.children.length > 0) {
      e.target.children[0].remove();
    }

    var newStr = e.target.getAttribute('data-replace').split('');
    newStr.forEach(function (letter, i) {
      var span = document.createElement('span');
      span.classList.add('replacer');
      span.innerHTML = letter.replace(' ', '&nbsp;');
      e.target.appendChild(span);
      span.style.animation = "rollIn ".concat(duration, "s ").concat(i * delay, "s ease-in-out forwards");
    });
    setTimeout(function () {
      while (e.target.children.length > 0) {
        e.target.children[0].remove();
      }

      e.target.innerText = newStr.join('');
      e.target.setAttribute('data-replace', oldStr.join(''));
      e.target.addEventListener("click", rollReplace);
      e.target.addEventListener('keydown', keyCheck);
    }, newStr.length * 500 * duration);
  }, oldStr.length * 500 * duration);
};

function keyCheck(e) {
  if (e.code === "Tab" || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  e.preventDefault();
  rollReplace(e);
}

window.addEventListener('DOMContentLoaded', function () {
  var roll = document.querySelector('.roll-replace');

  if (roll) {
    roll.tabIndex = 0;
    roll.addEventListener('click', rollReplace);
    roll.addEventListener('keydown', keyCheck);
  }
});