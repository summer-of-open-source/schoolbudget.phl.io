//buckets for normalized and nested object lists
var normal, nested;

/********************************************************/
/**************   Normalized CSV Format   ***************/
/********************************************************/


function parseNormalizedCSV() {
    var index = -1;

    return d3.csv("../data/budget-information-test.csv",
        function(d) {
            index++; //I'm pretty sure there's a better way to do this...
            return makeNormalizedListItem(index, d);
        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
            //dataArray contains an array of objects, 1 for each row of the csv file
            //object property names correspond to csv headings (FUNCTION, ACTIVITY_CODE, etc), 
            //unless there's an accessor function involved
            console.log("********   NORMALIZED   ********");
            console.log(dataArray);
            return(dataArray);
        });
}

function makeNormalizedListItem(index, d) {
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

normal = parseNormalizedCSV();















/**********************************************/
/************ Nested CSV Formatter ************/
/**********************************************/

/**************  nested tree variables  *************/

var tree;
var keys = {
    0: {
        "name": "FUNCTION_CLASS_NAME",
        "code": "FUNCTION_CLASS"
    },
    1: {
        "name": "FUNCTION_GROUP_NAME",
        "code": "FUNCTION_GROUP"
    },
    2: {
        "name": "FUNCTION_NAME",
        "code": "FUNCTION"
    },
    3: {
        "name": "ACTIVITY_NAME",
        "code": "ACTIVITY_CODE"
    }
};

//**************  nested tree utilities  ****************//


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

/**************   Nested CSV Formater   ***************/


function parseNestedCSV() {
    tree = {
        "name": "School District of Philadelphia Budget",
        "yearCurrent": 2014,
        "yearNext": 2015,
        "children": {}
    };

    return d3.csv("../data/budget-information-test.csv",
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

            console.log("********  NESTED TREE  *******");
            console.log(tree);

            return tree;
        });
}

nested = parseNestedCSV();

/**************   Adjustments    **************/

// extract gap closing cuts and undistributed budgetary adjustments

// var gapClosingAmounts = [{'Function' => 'F49992', 'ActivityCode' => '114A'}  // Budget Reductions - Instructional & Instructional Support
//                         ,{'Function' => 'F49995', 'ActivityCode' => '114C'} // Budget Reductions - Operating Support
//                         ,{'Function' => 'F49994', 'ActivityCode' => '114E'} // Budget Reductions - Administration
//                         ,{'Function' => 'F49991', 'ActivityCode' => '114B'} // Budget Reductions - Pupil & Family Support
//                         ,{'Function' => 'F41073', 'ActivityCode' => '5999'} // Undistributed Budgetary Adjustments - Other
//                         ,{'Function' => 'F41073', 'ActivityCode' => '5221'} // Undistributed Budgetary Adjustments - Other
//                         ,{'Function' => 'F41073', 'ActivityCode' => '5130'} // Undistributed Budgetary Adjustments - Other
//                         ,{'Function' => 'F41073', 'ActivityCode' => '2817'} // Undistributed Budgetary Adjustments - Other
//                 ];

