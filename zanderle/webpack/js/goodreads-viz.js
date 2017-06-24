var d3 = require('d3');

var width = 600;
var height = 400;

var wrap = d3.select("#svg-wrap");

var svg = wrap.append("svg")
    .attr("width", width)
    .attr("height", height);

var rScale = d3.scale.linear()
								.range([5, 50])
								.domain([100, 1000]);

var mindate = new Date(2016, 0, 1);
var maxdate = new Date(2016, 12, 31);

var xScale = d3.time.scale()
								.domain([mindate, maxdate])
								.range([0, width]);

var xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(xScale);

d3.json('http://localhost:8000/api/v1/user/books/?id=14559262', function(booksData) {
	console.log(booksData);

	svg.selectAll('circle').data(booksData).enter()
		.append('circle')
		.filter(function(d) {
			var read = new Date(d.read_at);
			return read.getFullYear() === 2016
		})
		.attr('cx', function(d) { return xScale(new Date(d.read_at)); })
		.attr('cy', height/2)
		.attr('r', function(d) { return rScale(+d.num_pages); });
});

svg.append("g")
    .attr("class", "axis")   // give it a class so it can be used to select only xaxis labels  below
    .attr("transform", "translate(0," + (height - 40) + ")")
    .call(xAxis);
