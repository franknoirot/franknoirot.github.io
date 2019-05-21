let warped = document.querySelector("img.warp");

function updateWarp(e) {
    const pointLight = document.getElementById('point-light');
    const displMap = document.querySelector("#filter-warp feDisplacementMap");
    let rect = e.target.getBoundingClientRect();
    let rX, rY;
    if (e.type === "mousemove") {
        rX = e.x;
        rY = e.y;
    } else if (e.type === "touchmove") {
        rX = e.touches[0].clientX;
        rY = e.touches[0].clientY;
    }
    rX -= rect.left;
    rY -= rect.top;
    
    pointLight.setAttribute("x", rX*1.2);
    pointLight.setAttribute("y", rY*1.2);
    displMap.setAttribute("scale", 20 + (.8 * (rect.width-480)/8));
}

warped.addEventListener('mousemove', updateWarp);
warped.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateWarp(e);
});