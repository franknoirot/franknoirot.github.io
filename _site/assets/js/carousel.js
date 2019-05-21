const carousels = Array.from(document.querySelectorAll(".carousel"));

const setup = (carousel) => {
    const container = carousel.querySelector(".carousel__track-container");
    const track = carousel.querySelector(".carousel__track");
    const slides = Array.from(track.children);
    const nextBtn = carousel.querySelector(".carousel__button--right");
    const prevBtn = carousel.querySelector(".carousel__button--left");
    const dotsNav = carousel.querySelector(".carousel__nav");
    const dots = Array.from(dotsNav.children);
    console.log(slides);

    const setSlidePos = (slides) => {
        const slideW = slides[0].getBoundingClientRect().width;

        slides.forEach((slide, i) => {
            slide.style.left = slideW * i + "px";
        });
    };

    setSlidePos(slides);

    const updateCarousel = (current, target, track) => {
        if (track) track.style.transform = `translateX(-${target.style.left})`;
        current.classList.remove('active');
        target.classList.add('active');
    };

    const slideRight = () => {
        const curSlide = track.querySelector(".active");
        const nextSlide = (curSlide.nextElementSibling) ? curSlide.nextElementSibling : slides[0];
        updateCarousel(curSlide, nextSlide, track);

        const curDot = dotsNav.querySelector(".active");
        const nextDot = (curDot.nextElementSibling) ? curDot.nextElementSibling : dots[0];
        updateCarousel(curDot, nextDot);
    }
    nextBtn.addEventListener('click', slideRight); // slide right on nextBtn click

    const slideLeft = () => {
        const curSlide = track.querySelector(".active");
        const prevSlide = (curSlide.previousElementSibling) ? curSlide.previousElementSibling : slides[slides.length-1];
        updateCarousel(curSlide, prevSlide, track);

        const curDot = dotsNav.querySelector(".active");
        const prevDot = (curDot.previousElementSibling) ? curDot.previousElementSibling : dots[dots.length-1];
        updateCarousel(curDot, prevDot);
    };
    prevBtn.addEventListener('click', slideLeft); // slide left on prevBtn click

    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest("button");
        if (!targetDot) return;

        const curSlide = track.querySelector('.active');
        const curDot = dotsNav.querySelector('.active');
        const targetIndex = dots.findIndex(d => d === targetDot);
        const targetSlide = slides[targetIndex];

        updateCarousel(curSlide, targetSlide, track);
        updateCarousel(curDot, targetDot);
    });

    function keyboardDispatch(e) {
        if (e.code === "Tab" || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

        let digit = parseInt(e.code.replace("Digit", "")) - 1;
        if (digit !== NaN && digit >= 0 && digit < slides.length) {
            let curSlide = track.querySelector('.active');
            let curDot = dotsNav.querySelector('.active');
            let targetSlide = slides[digit];
            let targetDot = dots[digit];

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
    };

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
        const curSlide = track.querySelector('.active');
        updateCarousel(curSlide, curSlide, track);
    };

    function trackKeyCheck(e) {
        if (e.code === "Tab" || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        lightBoxSetup();
    };

    track.addEventListener('click', lightBoxSetup);
    track.addEventListener('keydown', trackKeyCheck);

    // SWIPE LISTENING
    let swipeX = null;
    let swipeThresh = 50;
    track.addEventListener('touchstart', e => {
        console.log(e);
        swipeX = e.changedTouches[0].pageX;
    }, false);
    track.addEventListener('touchmove', e => {
        e.preventDefault();
    }, false);
    track.addEventListener('touchend', e => {
        if (!swipeX) return;

        let dist = swipeX - e.changedTouches[0].pageX;
        if (Math.abs(dist) > swipeThresh) {
            if (dist >= 0) slideRight();
            else slideLeft();
        }
    },false);
};


carousels.forEach(setup);