function parseCSV() {
    console.log("in parseCSV");
    return d3.csv("../data/budget-information-test.csv",
        //actions to take after csv file has fully loaded
        function(dataArray) {
            //dataArray contains an array of objects, 1 for each row of the csv file
            //object property names correspond to csv headings (FUNCTION, ACTIVITY_CODE, etc)
            //property values correspond to matching values
            //this essentially the same as the Budget-list-normalized.json file, except the property names are slightly different
            console.log(dataArray.valueOf());

            var normalizedData = {};
            dataArray.forEach(function(d) {});
        });
}

var testData = parseCSV();