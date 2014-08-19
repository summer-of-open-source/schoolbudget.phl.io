
/************ Nested CSV Formatter ************/

var tree;
var keys = {
    0: {"name": "FUNCTION_CLASS_NAME",
        "code": "FUNCTION_CLASS"         },
    1: {"name": "FUNCTION_GROUP_NAME",
        "code": "FUNCTION_GROUP"         },
    2: {"name": "FUNCTION_NAME",
        "code": "FUNCTION"               },
    3: {"name": "ACTIVITY_NAME",
        "code": "ACTIVITY_CODE"          }
};

//makes a new object out of passed datum and returns it
function makeNode(level, d) {
    var newNode;

    var name = keys[level]["name"];
    var code = keys[level]["code"];

    newNode = {
        "name": d[name],
        "code": d[code]
    }

    if (level < 3)
        newNode.children = {}; //need an array here eventually
    else{
             newNode["current"] = {
                "operating": +d.OPERATING_CYEST_LUMPSUM_AMT,
                "grant": +d.GRANT_CYEST_LUMPSUM_AMT,
                "capital": +d.CAPITAL_CYEST_LUMPSUM_AMT,
                "other": +d.OTHER_CYEST_LUMPSUM_AMT,
                "total": +d.CYEST_LUMPSUM_TOT
            }

            newNode["next"] = {
                "operating": +d.OPERATING_ACT_LUMPSUM_AMT,
                "grant": +d.GRANT_ACT_LUMPSUM_AMT,
                "capital": +d.CAPITAL_ACT_LUMPSUM_AMT,
                "other": +d.OTHER_ACT_LUMPSUM_AMT,
                "total": +d.ACT_LUMPSUM_TOT
                }
    }

    return newNode;
}

//iterates all objects in a nested tree
//converts everything in a property named 
//"children" from an object to an array
function convertChildren(value, index, array){
    //convert this element's children to an array
    value["children"] = convertObjectToArray(value["children"]);

    if(value["children"][0]["children"]){//if this element has children
        //iterate through this element's children array; recursively call self each time
        value["children"].forEach(convertChildren);
    }
    return;
}

//converts passed object into an array
function convertObjectToArray(obj){
    var arr = [];

    for (property in obj){
        arr.push(obj[property]);
    }
    return arr;
}

//main function.  parses/formats csv file.  
//calls function main as a callback after data is formatted
function parseNestedCSV() {
    tree = {
        // "name": "School District of Philadelphia Budget",
        "yearCurrent": 2014,
        "yearNext": 2015,
        "children": {}
    };

    d3.csv("../data/budget-information-test.csv",
        //accessor.  Controls how data is structured as it's pulled in
        function(d) {
            var key;
            var nameKey00, nameKey01, nameKey02, nameKey03;
            var siblings00, siblings01, siblings02, siblings03; //stores sibling arrays
            var name00, name01, name02, name03;
            var i = 0;

            key = keys[i];
            nameKey00 = key["name"];
            siblings00 = tree["children"];//array containing level 0's children
            name00 = d[nameKey00];

            //if level 0 key node doesn't exist, add it
            if (!siblings00[name00]){
                tree["children"][name00] = makeNode(i, d); 
            }


            i++;
            key = keys[i];
            nameKey01 = key["name"];
            siblings01 = tree["children"][name00]["children"];
            name01 = d[nameKey01];

            //if level 1 key node doesn't exist, add it
            if (!siblings01[name01]){
                tree["children"][name00]["children"][name01] = makeNode(i, d); 
            }


            i++;
            key = keys[i];
            nameKey02 = key["name"];
            siblings02 = tree["children"][name00]["children"][name01]["children"];
            name02 = d[nameKey02];

            //if level 2 key node doesn't exist, add it
            if (!siblings02[name02]){
                tree["children"][name00]["children"][name01]["children"][name02] = makeNode(i, d);
             }


            i++;
            key = keys[i];
            nameKey03 = key["name"];
            siblings03 = tree["children"][name00]["children"][name01]["children"][name02]["children"];
            name03 = d[nameKey03];

            //if level 3 key node doesn't exist, add it
            if (!siblings03[name03]){
                tree["children"][name00]["children"][name01]["children"][name02]["children"][name03] = makeNode(i, d); 
            }

        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
            convertChildren(tree, null, null);
            main(tree); //calling main here to ensure data will be assembled when it runs
        });

    console.log("********  NESTED TREE  *******");
    console.log(tree);
    return tree;
}

parseNestedCSV();



/*************** Sunburst Setup ****************/

// Dimensions of sunburst.
var width = 750;
var height = 600;
var radius = Math.min(width, height) / 2;

// Mapping of step names to colors.
var colors = {
    'F21001': '#53B4BF',    // Administrative Support Operations
    'F21003': '#163033',    // School Budgets including Non-District Operated Schools
    'F31330': '#ADBF00',    // L_ District Operated Schools - Instructional
    'F41035': '#CFE600',    //    L_ Elementary K-8 Education
    'F41063': '#DAEA46',    //    L_ Secondary Education
    'F31350': '#BFD400',    // L_ District Operated Schools - Instructional Support
    'F31360': '#738000',    // L_ District Operated Schools - Pupil - Family Support
    'F31620': '#3A4000',    // L_ District Operated Schools - Operational Support
    'F31361': '#326C73',    // L_ Non-District Operated Schools
  //'F49012': '#324359',    //    L_All Other Philadelphia Charters
    'F41038': '#CB1E0A'     // L_ Debt Service
};

var legendLabels = {};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0,
    selectedYear = 'current',
    selectedFund = 'total',
    yearCurrent,
    yearNext;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d[selectedYear][selectedFund]; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

// Main function to draw and set up the visualization, once we have the data.
function main (root){

    yearCurrent = root.yearCurrent;
    yearNext = root.yearNext;

    d3.select('#headline')
        .text(root.name);

    d3.select('#yearCurrent')
        .text(yearCurrent);

    d3.select('#yearNext')
        .text(yearNext);

    d3.select('#budget-header')
        .style('visibility', '');

    // Bounding circle underneath the sunburst, to make it easier to detect
    // when the mouse leaves the parent g.
    vis.append("svg:circle")
        .attr("r", radius)
        .style("opacity", 0);
//debugger;
//    var nodes = partition.nodes(root).filter(function(d) {
//        return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
//    });

    var path = vis.data([root]).selectAll("path")
        .data(partition) //value of partition is a function.  See above.
        .enter().append("svg:path")
        .attr("display", function(d) {
            return d.depth ? null : "none";
        })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", getColorForNode)
        .style("opacity", 1)
        .on("mouseover", mouseover)
        .each(stash);

    // Basic setup of page elements.
    drawLegend(path);

    // Add the mouseleave handler to the bounding circle.
    d3.select("#container").on("mouseleave", mouseleave);

    // Get total size of the tree = value of root node from partition.
    totalSize = path.node().__data__.value;

    // Show explanation
    setRootExplanation();
    d3.select("#explanation")
        .style("visibility", "");

    d3.selectAll("input").on("change", function change() {
        var yearFund = this.value.split('.');

        selectedYear = yearFund[0];
        selectedFund = yearFund[1];

        partition
            .sort(null);

        path
            .data(partition.value(function(d) {
                return d[selectedYear][selectedFund];
            }).nodes)
            .style("fill", getColorForNode)
            .transition()
            .duration(1500)
            .attrTween("d", arcTween);

        // update total size
        totalSize = path.node().__data__.value;

        setRootExplanation();
    });
}

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

    var percentage = (100 * d.value / totalSize).toPrecision(3);
    var percentageString = percentage + "%";
    var totalString = '$'+numberWithCommas(Math.round(d.value));

    if (percentage < 0.1) {
        percentageString = "< 0.1%";
    }

    d3.select("#percentage")
        .text(percentageString)
        .style("visibility", "");

    d3.select('#total')
        .text(totalString);

    d3.select('#category')
        .text(d.name);

    var sequenceArray = getAncestors(d);
    updateBreadcrumbs(sequenceArray, percentageString, totalString);

    // Fade all the segments.
    d3.selectAll("path")
        .style("opacity", 0.3);

    // Then highlight only those that are an ancestor of the current segment.
    vis.selectAll("path")
        .filter(function(node) {
            return (sequenceArray.indexOf(node) >= 0);
        })
        .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

    // Hide the breadcrumb trail
    d3.select("#trail")
        .style("visibility", "hidden");

    // Deactivate all segments during transition.
    d3.selectAll("path").on("mouseover", null);

    // Transition each segment to full opacity and then reactivate it.
    d3.selectAll("path")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .each("end", function() {
            d3.select(this).on("mouseover", mouseover);
        });

    d3.select("#sequence")
        .transition()
        .duration(1000)
        .style("visibility", "hidden");

    setRootExplanation();
}

// update the explanation content at the center to reflect
// the entire budget
function setRootExplanation() {
    var title;

    if (selectedYear == 'current') {
        title = 'Estimated ' + yearCurrent;
    } else {
        title = 'Proposed ' + yearNext;
    }

    title += ' budget &mdash; ' + selectedFund + ' funds.';

    d3.select("#percentage")
        .style("visibility", "hidden");

    d3.select('#total')
        .text('$'+numberWithCommas(Math.round(totalSize)));

    d3.select('#category')
        .html(title);
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
    var path = [];
    var current = node;
    while (current.parent) {
        path.unshift(current);
        current = current.parent;
    }
    return path;
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString, totalString) {
    var crumbsList = d3.select('#sequence .crumbs'),
        crumbs = crumbsList.selectAll('li'),
        crumbsLen = crumbs.size(),
        i = 0, nodesLen = nodeArray.length, node;

    for (; i < nodesLen; i++) {
        node = nodeArray[i];
        if (i < crumbsLen) {
            d3.select(crumbs[0][i]).text(node.name).style({
                display: '',
                'background-color': getColorForNode(node)
            });
        } else {
            crumbsList.append('li').text(node.name);
        }
    }

    while (i < crumbsLen) {
        d3.select(crumbs[0][i++]).style("display", "none");
    }

    d3.select('#sequence .total').text(totalString);

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#sequence")
        .style("visibility", "");
}

// Creates legend list
function drawLegend(path) {
    // discover full names
    path.each(function(d) {
        if (d.code in colors && !(d.code in legendLabels)) {
            legendLabels[d.code] = d.name;
        }
    });

    d3.select('#legend')
        .selectAll('li')
        .data(d3.entries(legendLabels))
        .enter().append('li')
            .text(function(d) { return d.value; })
            .style('background-color', function(d) { return colors[d.key]; });
}

// Gets color for a node by searching up the hierarchy for a code
// that has an assigned color
function getColorForNode(node) {
    var current = node;
    while (current.parent) {
        if (current.code in colors) {
            return colors[current.code];
        }
        current = current.parent;
    }
    return '#000000';
}

// Stash the old values for transition.
function stash(d) {
    d.x0 = d.x;
    d.dx0 = d.dx;
}

// Interpolate the arcs in data space.
function arcTween(a) {
    var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
    return function(t) {
        var b = i(t);
        a.x0 = b.x;
        a.dx0 = b.dx;
        return arc(b);
    };
}

// Add thousands separators
function numberWithCommas(n) {
    var parts=n.toString().split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
}