// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"
// import 'graph.js'


var margin = {top: 40, right: 20, bottom: 30, left: 50},
    width = 980 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

    var interval = "annual";
    var parseDate = d3.timeParse("%Y-%m-%d");
    var bisectDate = d3.bisector(function(d) { return d[interval].date; }).left;
    var formatPrecip = d3.format(",.2f");

    var x = d3.scaleTime()
    .range([0, width]);

    var y = d3.scaleLinear()
    .range([height, 0]);

    var normal = d3.line()
    .x(function(d) { return x(d[interval].date); })
    .y(function(d) { return y(d[interval].ytd); });

    normal.defined(function(d) { return !isNaN(d[interval].ytd); });

    var precips = d3.line()
    .x(function(d) {return x(d[interval].date); })
    .y(function(d) {return y(d[interval].precip); })

    precips.defined(function(d) { return !isNaN(d[interval].precip); });

    var svg = d3.select("#graph").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xaxis = d3.axisBottom(x);
    var yaxis = d3.axisLeft(y);

d3.json("/drought/drought", function(error, data) {
      if (error) throw error;

      data.forEach(function(d) {
        d["growing"] = parseValues(d["growing"]);
        d["annual"] = parseValues(d["annual"]);
      });

      x.domain(d3.extent(data, function(d) { return d[interval].date; })).nice();
      y.domain(d3.extent(data, function(d) { return d[interval].ytd; })).nice();

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

      var ytdFocus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

      ytdFocus.append("circle")
      .attr("r", 4.5);

      var diffLine = svg.append("g")
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

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        var diff = d[interval].precip - d[interval].ytd;
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

        var t0 = svg.transition().duration(450);
        t0.selectAll("path.normal").attr("d", normal);
        t0.selectAll("path.precip").attr("d", precips);

        x.domain(d3.extent(data, function(d) { return d[interval].date; })).nice();
        y.domain(d3.extent(data, function(d) {return d[interval].ytd})).nice();
        var t1 = t0.transition();
        t1.selectAll("g.axis--x").call(xaxis);
        t1.selectAll("g.axis--y").call(yaxis);
        t1.selectAll("path.normal").attr("d", normal);
        t1.selectAll("path.precip").attr("d", precips);
      }


    });

    function parseValues(d) {
      d.date = parseDate(d.date);
      d.ytd = parseFloat(d.ytd);
      d.precip = parseFloat(d.precip);
      return d
    };
