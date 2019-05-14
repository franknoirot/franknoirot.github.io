const rollReplace = (e) => {
    e.target.removeEventListener("click", rollReplace);
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
      }, newStr.length*500*duration);
    }, oldStr.length*500*duration);
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.roll-replace').addEventListener('click', rollReplace);
  });