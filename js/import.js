/***********************************************/
/************ Budgetary Adjustments ************/
/***********************************************/

var gapClosingAmounts = [{  "FUNCTION" : "F49992", "ACTIVITY_CODE" : "114A"    }, // Budget Reductions - Instructional & Instructional Support
                         {  "FUNCTION" : "F49995", "ACTIVITY_CODE" : "114C"    }, // Budget Reductions - Operating Support
                         {  "FUNCTION" : "F49994", "ACTIVITY_CODE" : "114E"    }, // Budget Reductions - Administration
                         {  "FUNCTION" : "F49991", "ACTIVITY_CODE" : "114B"    }, // Budget Reductions - Pupil & Family Support
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5999"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5221"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5130"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "2817"    }]; // Undistributed Budgetary Adjustments - Other



var miscCodes = [   { 0: "F21003", 1: "F31620", 2: "F49000", 3: "5221", 4: "code" }, //[0, 2, 3, 8] 
                    { 0: "F21003", 1: "F31620", 2: "F41071", 3: "5221", 4: "code" }, //[0, 2, 8, 3]
                    { 0: "F21005", 1: "F31999", 2: "F41073", 3: "2515", 4: "code" }, //[3, 0, 0, 4]
                    { 0: "F21005", 1: "F31999", 2: "F41073", 3: "2520", 4: "code" }, //[3, 0, 0, 3]
                    { 0: "F21005", 1: "F31999", 2: "F41073", 3: "2512", 4: "code" }, 
                    { 0: "F21005", 1: "F31999", 2: "F41073", 3: "2519", 4: "code" }, //[3, 0, 0, 0]
                ];

// this method removes lines matching one of the supplied conditions and returns their totals
function extractLines(root, queries){
    var currentGrantTotals = [], currentOperatingTotals = [], currentTotals = [];
    var nextGrantTotals = [], nextOperatingTotals = [], nextTotals = [];
    var path;

    queries.forEach(function(value, index, array){ //first pass - collecting totals
        path = findPath(root, array[index]);

        currentGrantTotals.push(root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["current"]["grant"]);
        currentOperatingTotals.push(root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["current"]["operating"]);
        currentTotals.push(root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["current"]["total"]);

        nextGrantTotals.push(root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["next"]["grant"]);
        nextOperatingTotals.push(root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["next"]["operating"]);
        nextTotals.push(root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["next"]["total"]);
    });

    console.log("current");
    console.log("grant = " + currentGrantTotals);
    console.log("operating = " + currentOperatingTotals);
    console.log("total = " + currentTotals);

    console.log("next");
    console.log("grant = " + nextGrantTotals);
    console.log("operating = " + nextOperatingTotals);
    console.log("total = " + nextTotals);  
    
    queries.forEach(function(value, index, array){ //second pass - removing properties
        path = findPath(root, array[index]);
        delete root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]];
    });
}



/*  // seaches each level's children array for a match, and stores the match's index.
    // returns indices in an array
    // takes an object in this format.  property names(indices) correspond to depth, execpt for 4: 
    //     {   0: value to search for at depth 0
    //         1: value to search for at depth 1
    //         2: value to search for at depth 2
    //         3: value to search for at depth 3
    //         4: optional: property that contains values above (ex "code", "name")
    //     }
    // if a 4th property is not passed in object, the property to search must be passed as a third argument */
function findPath(root, query){
    if (!Array.isArray(root["children"]))
        throw new Error("root's children properties must be converted to arrays.");
    else if (!query[4])
        throw new Error("4th index in query object must contain property to search in.");

    var i0, i1, i2, i3; //indices needed to access element
    var prop = query[4]; 

    for (i0=0; i0<root["children"].length; i0++){
        if(root["children"][i0][prop] === query[0]){
            break;
        }   
    }

    for (i1=0; i1<root["children"][i0]["children"].length; i1++){
        if(root["children"][i0]["children"][i1][prop] === query[1]){
            break;
        }
    }

    for (i2=0; i2<root["children"][i0]["children"][i1]["children"].length; i2++){
        if(root["children"][i0]["children"][i1]["children"][i2][prop] === query[2]){
            break;
        }
    }

    for (i3=0; i3<root["children"][i0]["children"][i1]["children"][i2]["children"].length; i3++){
        if(root["children"][i0]["children"][i1]["children"][i2]["children"][i3][prop] === query[3]){
            break;
        }
    }

    return [i0, i1, i2, i3];
}


/************************************************/
/************ Formatter Utilities ***************/
/************************************************/


//makes a new object out of passed datum and returns it
function makeNode(level, d, keys) {
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

        if(value["children"][0] && value["children"][0]["children"]){//if this element has children
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


/************************************************/
/************ Nested CSV Formatter **************/
/************************************************/

//main function.  parses/formats csv file.  
//calls function main as a callback after data is formatted
function parseNestedCSV() {
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
    var tree = {
        "yearCurrent": 2014,
        "yearNext": 2015,
        "children": {}
    };
    var line = 0;

    d3.csv("../data/budget-information-test.csv",
        //accessor.  Controls how data is structured as it's pulled in
        function(d) {
            line++;
            if (d["FUNCTION"] === "F41073" && d["ACTIVITY_CODE"] === "2512")
                console.log("breakpoint");

            var key;
            var name00, name01, name02, name03;
            var i = 0;

            key = keys[i];
            name00 = d[key["name"]];
            //if level 0 doesn't have a child with the current name, create and add one
            if (!tree["children"][name00]){
                tree["children"][name00] = makeNode(i, d, keys); 
            }


            i++;
            key = keys[i];
            name01 = d[key["name"]];
            if (!tree["children"][name00]["children"][name01]){
                tree["children"][name00]["children"][name01] = makeNode(i, d, keys); 
            }


            i++;
            key = keys[i];
            name02 = d[key["name"]];
            if (!tree["children"][name00]["children"][name01]["children"][name02]){
                tree["children"][name00]["children"][name01]["children"][name02] = makeNode(i, d, keys);
             }


            i++;
            key = keys[i];
            name03 = d[key["name"]];
            if (!tree["children"][name00]["children"][name01]["children"][name02]["children"][name03]){
                tree["children"][name00]["children"][name01]["children"][name02]["children"][name03] = makeNode(i, d, keys); 
            }
            else{
                var l = 2; //I know the name exists 1 time, so start at 2
                while(tree["children"][name00]["children"][name01]["children"][name02]["children"][name03.concat(l)]){
                    l++;
                }
                tree["children"][name00]["children"][name01]["children"][name02]["children"][name03.concat(l)] = makeNode(i, d, keys); 
            }

        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
            convertChildren(tree, null, null);
            main(tree); //calling main here to ensure data will be assembled when it runs

            console.log("**** findPath Tests ****");
            for (var i = 0; i < miscCodes.length; i++){
                console.log(findPath(tree, miscCodes[i]));
            }

            //extractLines(tree, miscCodes);
        });

    console.log("********  NESTED TREE  *******");
    console.log(tree);
    return tree;
}

parseNestedCSV();


