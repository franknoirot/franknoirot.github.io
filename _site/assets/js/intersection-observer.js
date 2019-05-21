document.addEventListener("DOMContentLoaded", function() {
    var lazyImgs = [].slice.call(document.querySelectorAll(".lazy"));

    console.log(lazyImgs);
    
    if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
      let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            let lazyImage = entry.target;
            console.log(lazyImage, lazyImage.tagName, lazyImage.tagName === "VIDEO");
            if (lazyImage.tagName === "VIDEO") lazyImage.children[0].src = lazyImage.children[0].dataset.src;
            else lazyImage.src = lazyImage.dataset.src;
            lazyImage.classList.remove("lazy");
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      });
      
      lazyImgs.forEach(function(lazyImage) {
        lazyImageObserver.observe(lazyImage);
      });
    } else {
      alert("Sorry, this is a test of IntersectionObserver, and it looks like your browser doesn't support it!");
    }
  });