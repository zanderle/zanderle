var d3 = require('d3');

var outerWidth = document.querySelector('.tabs-content').offsetWidth;

var width = outerWidth - 100; // For padding
var height = Math.max(width, 300);

var svg = d3.select("#svg-wrap").append("svg")
    .attr("width", width)
    .attr("height", height);

var unit = width * 0.05;

var sScale = d3.scale.linear()
                .range([1, 0.05])
                .domain([0, 5]);

var dScale = d3.scale.ordinal()
                    .range([3, 5, 8, 10, 12])
                    .domain([1, 2, 3, 4, 5]);

var defs = svg.append('defs');

defs
    .append('clipPath')
    .attr('id', 'large-circle-clip')
    // .attr('clipPathUnits', 'objectBoundingBox')
    .append('circle')
    .attr('r', 2 * unit);

defs
    .append('clipPath')
    .attr('id', 'small-circle-clip')
    // .attr('clipPathUnits', 'objectBoundingBox')
    .append('circle')
    .attr('r', unit);

var force = d3.layout.force()
    .gravity(0.05)
    .friction(0.8)
    .linkDistance(function(d) { return dScale(d.level) * unit; })
    // .linkDistance(function(d) { return unit * (3 + 1.5 * d.level); })
    .linkStrength(function(d) { return d.strength;  })
    // .linkStrength(0.2)
    .charge(function(d) { if (d.size == "large") { return -1000; } else if (d.size == "small") { return -500; } else { return -120; } })
    .size([width, height]);

d3.json("../../data/intro-graph.json", function(error, json) {
    if (error) throw error;

    var inputNodes = json.nodes;
    
    inputNodes.map(function(el, i) { if (i < 4) { el.x = width / 2; el.y = height / 2; } return el; });

    force
        .nodes(inputNodes)
        .links(json.links)
        .start();

    var link = svg.selectAll(".link")
                .data(json.links)
                .enter().append("line")
                .attr("class", "link")
                .style('stroke-width', function(d) { return d.show ? 2 : 0; })
                .style('stroke', function(d) { return d.show ? 'black' : 'none'; });

    var node = svg.selectAll(".node")
                .data(json.nodes)
                .enter().append("g")
                .attr("class", "node")
                .call(force.drag);

    node.each(setContent);

    force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
});

function setContent(d, i) {
    var here = d3.select(this);
    if (d.type == "img") {
        // do this
        here.append('circle')
            .attr('r', (d.size == "large" ? 2 * unit : unit))
            .style('fill', 'white')
            .style('stroke-width', 2)
            .style('stroke', 'black');
        here.append('image')
            .attr('xlink:href', d.img)
            .attr('x', (d.size == "large" ? -2 : -1) * unit)
            .attr('y', (d.size == "large" ? -2 : -1) * unit)
            .attr('width', (d.size == "large" ? 4 : 2) * unit)
            .attr('height', (d.size == "large" ? 4 : 2) * unit)
            .attr('clip-path', d.size == "large" ? 'url(#large-circle-clip)' : 'url(#small-circle-clip)');
    } else if (d.type == "icon") {
        // do that
        here.append('circle')
            .style('stroke-width', 3)
            .style('stroke', 'black')
            .style('fill', 'white')
            .attr('r', unit * 1.1);
        here.append('text')
            .text(d.iconCode)
            .style('font-size', unit)
            .style('text-anchor', 'middle')
            .style('font-family', 'FontAwesome');
        here.append('text')
            .text(d.text)
            .style('font-size', unit/2 - unit/10)
            .attr('y', unit/2 + unit/10)
            .style('text-anchor', 'middle');
    } else {
        // do it like that
        here.append('circle')
            .style('stroke-width', function () { return 2 + i; })
            .style('stroke', 'black')
            .style('fill', 'red')
            .attr('r', unit);
    }
}