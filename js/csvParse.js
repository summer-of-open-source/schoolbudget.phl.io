function parseCSV() {
    var index = -1;
    return d3.csv("../data/budget-information-test.csv",
        //accessor.  Controls how data is structured as it's pulled in
        function(d) {
            index++; //I'm pretty sure there's a better way to do this...
            return makeNormalizedList(index, d);
        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
            //dataArray contains an array of objects, 1 for each row of the csv file
            //object property names correspond to csv headings (FUNCTION, ACTIVITY_CODE, etc)
            console.log(dataArray.valueOf());
        });
}

function makeNormalizedList(index, d) {
    return {
        "ID": index,
        "Class": "NormalizedBudgetLine",
        "Created": Date.now(), //value in budget-list-normalized: 1400189228  looked like a time to me but I think I'm wrong.  Too many digits 
        "CreatorID": 1,
        "FunctionClass": d.FUNCTION_CLASS,
        "FunctionClassName": d.FUNCTION_CLASS_NAME,
        "FunctionGroup": d.FUNCTION_GROUP,
        "FunctionGroupName": d.FUNCTION_GROUP_NAME,
        "Function": d.FUNCTION,
        "FunctionName": d.FUNCTION_NAME,
        "ActivityCode": d.ACTIVITY_CODE,
        "ActivityName": d.ACTIVITY_NAME,
        "CurrentOperating": +d.OPERATING_CYEST_LUMPSUM_AMT,
        "CurrentGrant": +d.GRANT_CYEST_LUMPSUM_AMT,
        "CurrentCapital": +d.CAPITAL_CYEST_LUMPSUM_AMT,
        "CurrentOther": +d.OTHER_CYEST_LUMPSUM_AMT,
        "CurrentTotal": +d.CYEST_LUMPSUM_TOT,
        "ProposedOperating": +d.OPERATING_ACT_LUMPSUM_AMT,
        "ProposedGrant": +d.GRANT_ACT_LUMPSUM_AMT,
        "ProposedCapital": +d.CAPITAL_ACT_LUMPSUM_AMT,
        "ProposedOther": +d.OTHER_ACT_LUMPSUM_AMT,
        "ProposedTotal": +d.ACT_LUMPSUM_TOT,
        "RunDate": d.RUN_DATE.replace(RegExp("/", "g"), "-")
    };
}

var testData = parseCSV();