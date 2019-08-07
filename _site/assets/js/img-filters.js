"use strict";

var warped = document.querySelector("img.warp");

function updateWarp(e) {
  var pointLight = document.getElementById('point-light');
  var displMap = document.querySelector("#filter-warp feDisplacementMap");
  var rect = e.target.getBoundingClientRect();
  var rX, rY;

  if (e.type === "mousemove") {
    rX = e.offsetX
    rY = e.offsetY
  } else if (e.type === "touchmove") {
    rX = e.touches[0].offsetX;
    rY = e.touches[0].offsetY
  }

  pointLight.setAttribute("x", rX);
  pointLight.setAttribute("y", rY);
  displMap.setAttribute("scale", 20 + 1 * (rect.width - 480) / 8);
}

warped.addEventListener('mousemove', updateWarp);
warped.addEventListener('touchmove', function (e) {
  e.preventDefault();
  updateWarp(e);
});