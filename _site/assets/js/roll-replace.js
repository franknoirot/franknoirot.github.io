const rollReplace = (e) => {
    e.target.removeEventListener("click", rollReplace);
    e.target.removeEventListener('keydown', keyCheck);
    let oldStr = e.target.innerText.split('');
    let duration = (e.target.getAttribute('data-duration')) ? parseFloat(e.target.getAttribute('data-duration')) : .3;
    let delay = (e.target.getAttribute('data-delay')) ? parseFloat(e.target.getAttribute('data-delay')) : .1;
    
    e.target.innerText = '';
    
    oldStr.forEach((letter, i) => {
      let span = document.createElement('span');
      span.classList.add('replaced');
      span.innerHTML = letter.replace(' ', '&nbsp;');
      e.target.appendChild(span);
      span.style.animation = `rollUp ${duration}s ${i*delay}s ease-in-out forwards`;//
    });
    
    setTimeout(() => {
      while(e.target.children.length > 0) {
        e.target.children[0].remove();
      }
      
      let newStr = e.target.getAttribute('data-replace').split('');
  
      newStr.forEach((letter, i) => {
        let span = document.createElement('span');
        span.classList.add('replacer');
        span.innerHTML = letter.replace(' ', '&nbsp;');
        e.target.appendChild(span);
        span.style.animation = `rollIn ${duration}s ${i*delay}s ease-in-out forwards`;
      });
      
      setTimeout(() => {
        while(e.target.children.length > 0) {
          e.target.children[0].remove();
        }
  
        e.target.innerText = newStr.join('');
        e.target.setAttribute('data-replace', oldStr.join(''));
        
        e.target.addEventListener("click", rollReplace);
        e.target.addEventListener('keydown', keyCheck);
      }, newStr.length*500*duration);
    }, oldStr.length*500*duration);
  }
  
  function keyCheck(e) {
    if (e.code === "Tab" || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    rollReplace(e);
  }

  window.addEventListener('DOMContentLoaded', () => {
    let roll = document.querySelector('.roll-replace');
    if (roll) {
      roll.tabIndex = 0;
      roll.addEventListener('click', rollReplace);
      roll.addEventListener('keydown', keyCheck);
    }
  });