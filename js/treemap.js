var margin = {top: 40, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var color = d3.scale.category20c();

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .sort(function (a, b) {
        return a.value - b.value;
    })
//    .children(function (d, depth) {
//        return depth ? null : d.children;
//    })
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false)
    .value(function(d) { return d.current.total; });

var div = d3.select("body").append("div")
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

d3.json("data/budget-tree-normalized.json", function(error, root) {
    var node = div.datum(root).selectAll(".node")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "node")
        .call(position)
        .style("background", function(d) { return d.children ? color(d.name) : null; })
        .text(function(d) { return d.children ? null : d.name; });

    d3.selectAll("input").on("change", function change() {
        var key = this.value;

        node
            .data(treemap.value(function(d) { return d.current[key]; }).nodes)
            .transition()
            .duration(1500)
            .call(position);
    });
});

function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}