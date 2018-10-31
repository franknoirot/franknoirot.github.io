console.log("HELLO IS ANYONE THERE?");

// SVG Setup //
var size = 500,
    margin = {top:5, left:5};
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const era = 100;

//toolTip framework
var tooltip = d3.select("body").append("div").attr("class", "toolTip");

var svg = d3.select("#chart").append("svg")
.attr("width", size - margin.left*2)
.attr("height", size - margin.top*2)
.append("g")
.attr("transform", "translate(" + (size) / 2 + "," + (size) / 2 + ")");

var outerRadius = .5 * size - 27,
    innerRadius = 50;
var r = d3.scaleLinear()
.domain([era, 0])
.range([innerRadius, outerRadius]);

var gr = svg.append("g")
  .attr("class", "r axis")
  .selectAll("g")
  .data(r.ticks(era).slice(1))
  .enter();

gr.append("circle")
  .attr("r", r)
  .attr("cx", size / 2 + "\"")
  .attr("cy", "\"" + size / 2);

gr.append("text")
  .attr("y", function(d) { return -r(d) - 1; })
  .attr("transform", "rotate(18)")
  .attr('class', 'age-scale')
  .attr("text-anchor", "middle")
  .text(function(d) { return d; });

gr.append("text")
  .attr("class", "age-scale label")
  .attr("y", -outerRadius - 25)
  .attr("transform", "rotate(18)")
  .attr("text-anchor", "middle")
  .text("Age");

//calendar axis setup
var ga = svg.append("g")
  .attr("class", "a axis")
  .selectAll("g")
  .data(months)
  .enter().append("g")
  .attr("transform", function(d,i) { return "rotate(" + i*30 + ")"; });

ga.append("line")
  .attr("y1", -innerRadius)
  .attr("y2", -outerRadius);

ga.append("text")
  .attr("y", -outerRadius - 8)
  .style("text-anchor", function(d,i) { return i*30 < 270 && i*30 > 90 ? "end" : null; })
  .attr("transform", function(d,i) { return i*30 < 270 && i*30 > 90 ? "rotate(180, 0," +(-outerRadius - 12) + ")" : null; })
  .text(function(d) { return d; });


//JSON setup
var parseDate = d3.timeParse("%Y-%m-%d");
d3.json("../assets/js/birthdays.json", function(error, json) {
  if (error) throw error;

  var data = json;
  var now = new Date();
  var then = new Date();
  then.setFullYear(now.getFullYear()-era);
  console.log("NOW", now);
  console.log("THEN", then);

  data.forEach(function(d) {
      d.name = d.name;
      d.birthday = parseDate(d.birthday);
  });

  console.log("DATA", data);

  var timeScale = d3.scaleTime()
    .domain([now, then])
    .range([outerRadius, innerRadius]);
  var timeForm = d3.timeFormat("%Y-%m-%d");
  var minutes = 1000 * 60;
  var hours = minutes * 60;
  var days = hours * 24;
  var years = days * 365;
  var endAngle = d3.timeDay.count(d3.timeYear(now), now)*360/365 * Math.PI/180;

  var arc = d3.arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius)
    .startAngle(0)
    .endAngle(endAngle);

  console.log("ENDANGLE", d3.timeDay.count(d3.timeYear(now), now)*360.0/365);

  var wedge = svg.append("g")
    .attr("class", "wedge");

  wedge.append("path")
    .attr("d", arc);

  var dots = svg.append("g")
    .attr("class", "dots")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function(d) { return "rotate(" + (d.birthday.getMonth()*30 + d.birthday.getDate()/31*30) + ")"; });

  dots.append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("cy", function(d) {
      console.log("BIRTHDAY", timeScale(d.birthday));
      return -timeScale(d.birthday);
    })
    .on("mouseenter", function(d){
        tooltip
          .style("left", d3.event.pageX - 75 + "px")
          .style("top", d3.event.pageY - 90 + "px")
          .style("display", "inline-block")
          .html((d.name) + "<br>Birthdate: " + timeForm(d.birthday) + "<br>Age: " + (Math.floor((now-d.birthday)/years)));
    })
    .on("mouseexit", function(d){
      tooltip.style("display","none");
    });
});
