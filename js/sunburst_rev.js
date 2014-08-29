// this function runs right away unlike the typical named functions.
(function() {

// Dimensions of sunburst.
var width = 400,
    height = 450,
    r = Math.min(width, height) / 2;

// Mapping of step names to colors.
 var COLOR_1 = "#98abc5";
  var COLOR_2 = "#8a89a6";
  var COLOR_3 = "#7b6888";
  var COLOR_4 = "#6b486b";
  var COLOR_5 = "#a05d56";

  var color = d3.scale.ordinal()
    .range([COLOR_1, COLOR_2, COLOR_3,
      COLOR_4, COLOR_5
    ]);


  // AJAX REQUEST
  // This starts the rendering of the pie chart once we have the data in hand.
  $.getJSON('/data/revenue.json', function(data) {
    // call the function to render the pie chart with the known data
    drawD3Document(data);
    makelabels(data);
    bindEvents();
  });

// this is the guts of our rendering - but this won't be run unless we call it.
  function drawD3Document(data) {

var arc = d3.svg.arc()
        .outerRadius(r);

var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d.revenue; 
      });

var svg = d3.select("#chart")
      .append("svg") //create the SVG element inside the <body>
      .data([data]) //associate our data with the document
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

 var arcs = svg.selectAll("g.slice") 
      .data(pie) 
      .enter() 
      .append("svg:g") 
      .attr("class", "slice");

 var count = 0;

    arcs.append("svg:path")
      .attr("d", arc)
      .attr("id", function(d) {
        return "arc-" + (count++);
      })
      .attr("fill", function(d, i) {
        // we use the index number here to reference a corresponding
        // color within the colors object.
        return color(i);
      })
      .attr("class", "item-value")
      .attr("data-id", function(d, i){
        return i;
      });

}

function makelabels(data) {
    var $target = $('#key');

    $.each(data, function(index, item) {
      var $div = $('<div />');

      $div.html('<span class="name">' + item.name + '</span>' +
         '<span class="revenue hidden">' + numeral(item.revenue).format('$0,0') + '</span>');
      $div.addClass('key-item')
        .css('backgroundColor', color(index))
        .attr('data-id', index);
      $target.append($div);
      // debugger
    })
}

function bindEvents() {
    $('.item-value, .key-item')
      .mouseover(function() {
        var id = $(this).data('id');

        var $key = $('.key-item[data-id="' + id + '"]');
        $key.find('.name').addClass('hidden');
        $key.find('.revenue').removeClass('hidden');

        var $value = $('.item-value[data-id="' + id + '"]');
        $value.css('opacity', 0.5);
    })
    .mouseout(function() {
      var id = $(this).data('id');

        var $key = $('.key-item[data-id="' + id + '"]');
        $key.find('.name').removeClass('hidden');
        $key.find('.revenue').addClass('hidden');

        var $value = $('.item-value[data-id="' + id + '"]');
        $value.css('opacity', 1);
    });

}
})();