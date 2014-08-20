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



var miscCodes = [   { 0: "F21003", 1: "F31620", 2: "F49000", 3: "5221", 4: "code" }, 
                    { 0: "F21003", 1: "F31620", 2: "F41071", 3: "5221", 4: "code" }, 
                    { 0: "F21005", 1: "F31999", 2: "F41073", 3: "2515", 4: "code" }, 
                    { 0: "F21005", 1: "F31999", 2: "F41073", 3: "2520", 4: "code" }, 
                    { 0: "F21005", 1: "F31999", 2: "F41073", 3: "2512", 4: "code" }, 
                    { 0: "F21005", 1: "F31999", 2: "F41073", 3: "2519", 4: "code" } 
                ];


// this method proportionally distributes amounts among lines matching the supplied conditions
function distributeAmounts(root, queries, amounts){

    // first pass through target lines -- sum existing amounts

    // second pass -- distribute amounts proportionally
    
}

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
    
    queries.forEach(function(value, index, array){ //second pass - removing properties
        try{//because node may've been deleted already
            path = findPath(root, array[index]);
            root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"].splice(path[3], 1);
        }
        catch(e){}
    });

    return [currentGrantTotals, currentOperatingTotals, currentTotals, nextGrantTotals, nextOperatingTotals, nextTotals];
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

