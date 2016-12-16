var margin = {top: 20, right: 20, bottom: 30, left: 50},
  width = 980 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var interval = "annual";
    var parseTime = d3.timeParse("%Y-%m-%d");
    var bisectDate = d3.bisector(function(d) { return d.date; }).left;
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

    d3.csv("/2016-cummulative-rain.csv", type, function(error, data) {
      if (error) throw error;

      console.log(data);

      x.domain(d3.extent(data, function(d) { return d[interval].date; })).nice();;
      y.domain(d3.extent(data, function(d) { return d[interval].ytd; }));

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
      .text("Cummulative Precip (inch)");

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

      var ytdFocus = svg.append('g')
                        .attr('class', 'focus')
                        .style('display', 'none');

      ytdFocus.append('circle')
      .attr('r', 4.5);

      var diffLine = svg.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

      diffLine.append('line')
      .style('stroke', 'black')

      // handle mouse events
      var mouse_handler = svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .on('mouseover", function() { 
        precipFocus.style('display', null); 
        ytdFocus.style('display', null);
        diffLine.style('display', null);
      })
      .on('mouseout', function() { 
        precipFocus.style('display', 'none'); 
        ytdFocus.style('display', 'none');
        diffLine.style('display','none')
      })
      .on('mousemove', mousemove);

      d3.selectAll('input').on('change', change);

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
              d1 = data[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                var diff = d[interval].precip - d[interval].ytd;
                if (!isNaN(diff)) {
                  precipFocus.attr('transform', 'translate(' + x(d[interval].date) + ',' + y(d[interval].precip) + ')');
                  precipFocus.select('text').text(formatPrecip(diff));
                  ytdFocus.attr('transform', 'translate(' + x(d[interval].date) + ',' + y(d[interval].ytd) + ')');
                  diffLine.select('line').attr('x1', x(d[interval].date))
                  .attr('x2', x(d[interval].date))
                  .attr('y1', y(d[interval].precip))
                  .attr('y2', y(d[interval].ytd));
                }
      };

      function change() {
        interval = this.value;

        var t0 = svg.transition().duration(450);
        t0.selectAll('path.normal').attr('d', normal);
        t0.selectAll('path.precip').attr('d', precips);

        x.domain(d3.extent(data, function(d) { return d[interval].date; })).nice();
        y.domain(d3.extent(data, function(d) {return d[interval].ytd}));
        var t1 = t0.transition();
        t1.selectAll('g.axis--x').call(xaxis);
        t1.selectAll('g.axis--y').call(yaxis);
        t1.selectAll('path.normal').attr('d', normal);
        t1.selectAll('path.precip').attr('d', precips);
      }
    });

    function type(d) {
      d.date = parseTime(d.date);
      d.annual = {};
      d.growing = {};
      d['annual'].date = d.date;
      d['annual'].ytd = parseFloat(d.normal_cumulative_precip_in);
      d['annual'].precip = parseFloat(d.cum_precip_in);
      if (!isNaN(parseFloat(d.growing_cumulative_precip_in))) {
        d['growing'].date = d.date;
        d['growing'].ytd = parseFloat(d.growing_normal_cumulative_precip_in);
        d['growing'].precip = parseFloat(d.growing_cumulative_precip_in);
      }
      return d;
    }
