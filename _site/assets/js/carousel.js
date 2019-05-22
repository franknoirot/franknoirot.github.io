"use strict";

var carousels = [].slice.call(document.querySelectorAll(".carousel"));

var setup = function setup(carousel) {
  var container = carousel.querySelector(".carousel__track-container");
  var track = carousel.querySelector(".carousel__track");
  var slides = [].slice.call(track.children);
  var nextBtn = carousel.querySelector(".carousel__button--right");
  var prevBtn = carousel.querySelector(".carousel__button--left");
  var dotsNav = carousel.querySelector(".carousel__nav");
  var dots = [].slice.call(dotsNav.children);

  var setSlidePos = function setSlidePos(slides) {
    var slideW = slides[0].getBoundingClientRect().width;
    slides.forEach(function (slide, i) {
      slide.style.left = slideW * i + "px";
    });
  };

  setSlidePos(slides);

  var updateCarousel = function updateCarousel(current, target, track) {
    if (track) track.style.transform = "translateX(-".concat(target.style.left, ")");
    current.classList.remove('active');
    target.classList.add('active');
  };

  var slideRight = function slideRight() {
    var curSlide = track.querySelector(".active");
    var nextSlide = curSlide.nextElementSibling ? curSlide.nextElementSibling : slides[0];
    updateCarousel(curSlide, nextSlide, track);
    var curDot = dotsNav.querySelector(".active");
    var nextDot = curDot.nextElementSibling ? curDot.nextElementSibling : dots[0];
    updateCarousel(curDot, nextDot);
  };

  nextBtn.addEventListener('click', slideRight); // slide right on nextBtn click

  var slideLeft = function slideLeft() {
    var curSlide = track.querySelector(".active");
    var prevSlide = curSlide.previousElementSibling ? curSlide.previousElementSibling : slides[slides.length - 1];
    updateCarousel(curSlide, prevSlide, track);
    var curDot = dotsNav.querySelector(".active");
    var prevDot = curDot.previousElementSibling ? curDot.previousElementSibling : dots[dots.length - 1];
    updateCarousel(curDot, prevDot);
  };

  prevBtn.addEventListener('click', slideLeft); // slide left on prevBtn click

  dotsNav.addEventListener('click', function (e) {
    var targetDot = e.target.closest("button");
    if (!targetDot) return;
    var curSlide = track.querySelector('.active');
    var curDot = dotsNav.querySelector('.active');
    var targetIndex = dots.findIndex(function (d) {
      return d === targetDot;
    });
    var targetSlide = slides[targetIndex];
    updateCarousel(curSlide, targetSlide, track);
    updateCarousel(curDot, targetDot);
  });

  function keyboardDispatch(e) {
    if (e.code === "Tab" || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var digit = parseInt(e.code.replace("Digit", "")) - 1;

    if (digit !== NaN && digit >= 0 && digit < slides.length) {
      var curSlide = track.querySelector('.active');
      var curDot = dotsNav.querySelector('.active');
      var targetSlide = slides[digit];
      var targetDot = dots[digit];
      updateCarousel(curSlide, targetSlide, track);
      updateCarousel(curDot, targetDot);
    }

    switch (e.code) {
      case "Escape":
        lightBoxSetup();
        break;

      case "ArrowLeft":
        slideLeft();
        break;

      case "ArrowRight":
        slideRight();
    }
  }

  ;

  function lightBoxSetup() {
    carousel.classList.toggle('lightbox');

    if (carousel.classList.contains('lightbox')) {
      document.addEventListener('keydown', keyboardDispatch);
      track.removeEventListener('keydown', trackKeyCheck);
    } else {
      document.removeEventListener('keydown', keyboardDispatch);
      track.addEventListener('keydown', trackKeyCheck);
    }

    setSlidePos(slides);
    var curSlide = track.querySelector('.active');
    updateCarousel(curSlide, curSlide, track);
  }

  ;

  function trackKeyCheck(e) {
    if (e.code === "Tab" || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    lightBoxSetup();
  }

  ;
  track.addEventListener('click', lightBoxSetup);
  track.addEventListener('keydown', trackKeyCheck); // SWIPE LISTENING

  var swipeX = null;
  var swipeThresh = 50;
  track.addEventListener('touchstart', function (e) {
    swipeX = e.changedTouches[0].pageX;
  }, false);
  track.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, false);
  track.addEventListener('touchend', function (e) {
    if (!swipeX) return;
    var dist = swipeX - e.changedTouches[0].pageX;

    if (Math.abs(dist) > swipeThresh) {
      if (dist >= 0) slideRight();else slideLeft();
    }
  }, false);
};


// DO THE DANG THING
carousels.forEach(setup);



// POLYFILLS
// Array.findIndex()
// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    },
    configurable: true,
    writable: true
  });
}

// Element.closest()
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || 
                              Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;

    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}