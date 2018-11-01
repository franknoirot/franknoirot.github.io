var chart = d3.select("div#lineChart");

var chartContainer = chart.append("div")
   .classed("svg-container svg-container-narrow", true); //container class to make it responsive

var svg = chartContainer.append("svg")
   //responsive SVG needs these 2 attributes and no width and height attr
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 100 25")
   //class to make it responsive
   .classed("svg-content-responsive", true);

var lineGroup = svg.append('g')

var width = svg.node().viewBox.baseVal.width;
var height = svg.node().viewBox.baseVal.height;
var pad = Math.min(width, height)/2;

console.log(svg.node().getBoundingClientRect());

var line = lineGroup.append('line')
  .attr('x1', pad)
  .attr('y1', height/2)
  .attr('x2', width-pad)
  .attr('y2', height/2)
  .style('stroke', 'black')
  .style('stroke-width', .75);

var circle1 = lineGroup.append('circle')
  .attr('cx', pad)
  .attr('cy', height/2)
  .attr('r', 1);

var circle2 = lineGroup.append('circle')
    .attr('cx', width-pad)
    .attr('cy', height/2)
    .attr('r', 1);

var annotationBracket = lineGroup.select('path')
  .data(line)
  .enter()
  .append('path')
  .attr('d', function(d) {
    console.log('HELLO');
  });

var annotationColor = 'red';
var annotationText = lineGroup.append('text')
  .attr('x', width/2)
  .attr('y', height/3)
  .style('text-anchor', 'middle')
  .style('font-size', 3)
  .style('cursor', 'e-resize')
  .text('length')
  .call(d3.drag()
      .on('start', scrubStart)
      .on('drag', scrub)
      .on('end', scrubEnd));

function getLength(line) {
  length = Math.sqrt(Math.pow(line.x2.value - line.x1.value, 2) + Math.pow(line.y2.value - line.y1.value, 2));
  return length;
}

var mouseXInit, xScrub, scrubFactor=width, objSelect, objInit, lenInit, lenDrag;
function scrubStart(d){
  mouseXInit = d3.event.x;

  objSelect = d3.select(this.parentNode).select('line');
  endPoints = d3.select(this.parentNode).selectAll('circle');
  objInit = objSelect.node();
  lenInit = getLength(objInit.attributes);
  lenDrag = lenInit;
}

function scrub(d) {
  xScrub = 3*(d3.event.x - mouseXInit)/scrubFactor;

  lenDrag += xScrub;

  objSelect
    .attr('x1', parseFloat(objInit.attributes.x1.value) - xScrub)
    .attr('x2', parseFloat(objInit.attributes.x2.value) + xScrub);


  circle1.attr('cx', parseFloat(objInit.attributes.x1.value) - xScrub);
  circle2.attr('cx', parseFloat(objInit.attributes.x2.value) - xScrub);

  d3.select(this).text(getLength(objInit.attributes).toPrecision(4) )
    .style('fill', annotationColor);

  // console.log();
  // d3.select(this).attr('x1');
}

function scrubEnd(d) {
  d3.select(this).text('length')
    .style('fill', 'black');
}

function keyHandler() {
     document.onkeydown = null;
     if (event.ctrlKey) {
       annotationColor = '#f0f';
       scrubFactor *= 15;
       console.log('pressed!, ',scrubFactor);
     }
}

document.onkeydown = keyHandler;

document.onkeyup = function() {
    this.onkeydown = keyHandler;
    annotationColor = 'red';
    scrubFactor /= 5;
    console.log('released!, ',scrubFactor);
};
