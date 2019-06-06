"use strict";

var warped = document.querySelector("img.warp");

function updateWarp(e) {
  var pointLight = document.getElementById('point-light');
  var displMap = document.querySelector("#filter-warp feDisplacementMap");
  var rect = e.target.getBoundingClientRect();
  var rX, rY;

  if (e.type === "mousemove") {
    rX = e.x;
    rY = e.y;
  } else if (e.type === "touchmove") {
    rX = e.touches[0].clientX;
    rY = e.touches[0].clientY;
  }

  rX -= rect.left;
  rY -= rect.top;
  pointLight.setAttribute("x", rX * 1.1);
  pointLight.setAttribute("y", rY * 1.1);
  displMap.setAttribute("scale", 20 + .8 * (rect.width - 480) / 8);
}

warped.addEventListener('mousemove', updateWarp);
warped.addEventListener('touchmove', function (e) {
  e.preventDefault();
  updateWarp(e);
});