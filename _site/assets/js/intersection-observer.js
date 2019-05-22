"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var lazyImgs = [].slice.call(document.querySelectorAll(".lazy"));


  if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
    var lazyImageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var lazyImage = entry.target;
          console.log(lazyImage, lazyImage.tagName, lazyImage.tagName === "VIDEO");
          if (lazyImage.tagName === "VIDEO") lazyImage.children[0].src = lazyImage.children[0].dataset.src;else lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });
    lazyImgs.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    let active = false;

    const lazyLoad = function() {
        if (active === false) {
        active = true;

        setTimeout(function() {
            lazyImgs.forEach(function(lazyImage) {
            if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
                lazyImage.src = lazyImage.dataset.src;
                lazyImage.srcset = lazyImage.dataset.srcset;
                lazyImage.classList.remove("lazy");

                lazyImgs = lazyImgs.filter(function(image) {
                return image !== lazyImage;
                });

                if (lazyImgs.length === 0) {
                document.removeEventListener("scroll", lazyLoad);
                window.removeEventListener("resize", lazyLoad);
                window.removeEventListener("orientationchange", lazyLoad);
                }
            }
            });

            active = false;
        }, 200);
        }
    };

    document.addEventListener("scroll", lazyLoad);
    window.addEventListener("resize", lazyLoad);
    window.addEventListener("orientationchange", lazyLoad);
  }
});