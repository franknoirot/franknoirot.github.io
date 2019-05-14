let warped = document.querySelectorAll("img.warp");

function updateWarp(e) {
    let pointLight = document.getElementById('point-light');
    let rect = e.target.getBoundingClientRect();
    let rX = e.x - rect.left;
    let rY = e.y - rect.top;
    
    pointLight.setAttribute("x", rX);
    pointLight.setAttribute("y", rY);
}

for (let i=0; i<warped.length; i++) {
    warped[i].addEventListener('mousemove', updateWarp);
}