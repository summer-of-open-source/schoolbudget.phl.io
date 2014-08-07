(function() {

  $.getJSON('/data/budget-list-normalized.json', function(data) {
    parseDeStuff(data);
  });

  function parseDeStuff(data) {
    var c1 = [];
    for(var val in data) {
      
    }
  }

})();