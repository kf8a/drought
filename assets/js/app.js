// We import the CSS which is extracted to its own file by esbuild.
// Remove this line if you add a your own CSS build pipeline (e.g postcss).
import "../css/app.css"

// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import topbar from "../vendor/topbar"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {params: {_csrf_token: csrfToken}})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", info => topbar.show())
window.addEventListener("phx:page-loading-stop", info => topbar.hide())

// import * as d3 from "d3";

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket

var max_extent = function(a,b) {
      if (a[1] > b[1]) {
        return a;
      } else {
        return b;
      };
};

var today = new Date();
var years = d3.range(today.getFullYear(), 1990, -1)
var selected_year = today.getFullYear();

var margin = {top: 60, right: 20, bottom: 30, left: 50},
    width = 980 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

var interval = "annual";
var parseDate = d3.timeParse("%Y-%m-%d");
var bisectDate = d3.bisector(function(d) { return d[interval].date; }).left;
var formatPrecip = d3.format(",.2f");

var x = d3.scaleTime().range([0, width]);

var y = d3.scaleLinear().range([height, 0]);

var normal = d3.line()
  .x(function(d) { return x(d[interval].date); })
  .y(function(d) { return y(d[interval].ytd); });

normal.defined(function(d) { return !isNaN(d[interval].ytd); });

var precips = d3.line()
  .x(function(d) {return x(d[interval].date); })
  .y(function(d) {return y(d[interval].precip); })

precips.defined(function(d) { return !isNaN(d[interval].precip); });

var xaxis = d3.axisBottom(x);
var yaxis = d3.axisLeft(y);

d3.select('#year')
  .selectAll("option")
  .data(years)
  .enter()
  .append("option")
  .attr("value", function(option) { return option; })
  .text(function(option) { return option; });

function update_plot(current_year) {

  var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("/drought?year=" + current_year).then((data) => {

  console.log("got data");

  console.log(data);
  data.forEach(function(d) {
    d["growing"] = parseValues(d["growing"]);
    d["annual"] = parseValues(d["annual"]);
  });
  console.log(data);

  // x.domain(d3.extent(data, function(d) { return d[interval].date; })).nice();
  x.domain([new Date(current_year + "-1-1"), new Date(current_year + "-12-31")]).nice();
  let y_ytd = d3.extent(data, function(d) { return d[interval].ytd; })
  let y_precip = d3.extent(data, function(d) { return d[interval].precip; })

  let y_use = max_extent(y_ytd, y_precip);

  y.domain(y_use).nice();

  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(yaxis);

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Cummulative Precipitation (inches)");

  svg.append("line")
    .attr("x1", 50)
    .attr("y1", 40)
    .attr("x2", 80)
    .attr("y2", 40)
    .attr("class","normal line")

  svg.append("text")
    .attr("y", 40)
    .attr("x", 100)
    .attr("dy", "5px")
    .text("30 year normal precipitation");

  svg.append("line")
    .attr("x1", 50)
    .attr("y1", 60)
    .attr("x2", 80)
    .attr("y2", 60)
    .attr("class","precip line")

  svg.append("text")
    .attr("y", 60)
    .attr("x", 100)
    .attr("dy", "5px")
    .text("current year precipitation");

  svg.append("path")
    .datum(data)
    .attr("class", "line precip")
    .attr("d", precips);

  svg.append("path")
    .datum(data)
    .attr("class", "line normal")
    .attr("d", normal);

  var precipFocus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

  precipFocus.append("circle")
    .attr("r", 4.5);

  precipFocus.append("text")
    .attr("x", 9)
    .attr("dy", ".35em");

  let ytdFocus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

  ytdFocus.append("circle")
    .attr("r", 4.5);

  let diffLine = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

  diffLine.append("line")
    .style("stroke", "black")

  // handle mouse events
  var mouse_handler = svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function() {
      precipFocus.style("display", null);
      ytdFocus.style("display", null);
      diffLine.style("display", null);
    })
    .on("mouseout", function() {
      precipFocus.style("display", "none");
      ytdFocus.style("display", "none");
      diffLine.style("display","none")
    })
    .on("mousemove", mousemove);

  d3.selectAll("input").on("change", change);

  function mousemove(evt) {
    let x0 = x.invert(d3.pointer(evt, this)[0]);
    let i = bisectDate(data, x0, 1);
    if (i > data.length - 1) {
      return;
    }
    let d0 = data[i - 1];
    let d1 = data[i];
    let d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    let diff = d[interval].precip - d[interval].ytd;
    if (!isNaN(diff)) {
      precipFocus.attr("transform", "translate(" + x(d[interval].date) + "," + y(d[interval].precip) + ")");
      precipFocus.select("text").text(formatPrecip(diff));
      ytdFocus.attr("transform", "translate(" + x(d[interval].date) + "," + y(d[interval].ytd) + ")");
      diffLine.select("line").attr("x1", x(d[interval].date))
        .attr("x2", x(d[interval].date))
        .attr("y1", y(d[interval].precip))
        .attr("y2", y(d[interval].ytd));
    }
  };

  function change() {
    interval = this.value;

    let t0 = svg.transition().duration(450);
    t0.selectAll("path.normal").attr("d", normal);
    t0.selectAll("path.precip").attr("d", precips);

    x.domain(d3.extent(data, function(d) { return d[interval].date; })).nice();
    y.domain(d3.extent(data, function(d) {return d[interval].ytd})).nice();
    let t1 = t0.transition();
    t1.selectAll("g.axis--x").call(xaxis);
    t1.selectAll("g.axis--y").call(yaxis);
    t1.selectAll("path.normal").attr("d", normal);
    t1.selectAll("path.precip").attr("d", precips);
  };
  });
};

function parseValues(d) {
  d.date = parseDate(d.date);
  d.ytd = parseFloat(d.ytd);
  d.precip = parseFloat(d.precip);
  return d
};

// dropdown dataset selection
d3.select("#year").on("change", function(evt) {

  let selected_year = evt.target.value;

  let svg = d3.select("#graph");
  svg.selectAll("*").remove();

  update_plot(selected_year);

});

update_plot(selected_year);
