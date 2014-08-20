/***********************************************/
/************ Budgetary Adjustments ************/
/***********************************************/

//custom "data types" for formatting data to be passed to search functions

function Path(index0, index1, index2, index3){
    this[0] = index0,
    this[1] = index1,
    this[2] = index2,
    this[3] = index3
}

function PathQuery(prop0, prop1, prop2, prop3, propName){
    this[0] = prop0; //values to search for in prop
    this[1] = prop1;
    this[2] = prop2;
    this[3] = prop3;
    this.prop = propName; //property that will contain values in 0-3

    return this;
}

function Exclusion(prop, val, depth){
    this.prop = prop;
    this.val = val;
    this.depth = depth;

    return this;
}

//exclusions is an array of Exclusion objects
function SearchQuery(prop0, prop1, prop2, prop3, propName, exclusions){
    PathQuery.call(this, prop0, prop1, prop2, prop3, propName)
    this.exclusions = exclusions || [];

    return this;
}

/*******  Variables  *********/

// for testing findPath and extractLines
var miscCodes = [   new PathQuery("F21003", "F31620", "F49000", "5221", "code"), 
                    new PathQuery("F21003", "F31620", "F41071", "5221", "code"), 
                    new PathQuery("F21005", "F31999", "F41073", "2515", "code"), 
                    new PathQuery("F21005", "F31999", "F41073", "2520", "code"), 
                    new PathQuery("F21005", "F31999", "F41073", "2512", "code"), 
                    new PathQuery("F21005", "F31999", "F41073", "2519", "code") 
                ];

//for Testing searchTree 
var searchCodes = [ new SearchQuery("F21001", "F49021", "F49027", "", "code"),
                    new SearchQuery("F21001" , "F49015", "", "", "code"),
                    new SearchQuery("F21001" , "", "", "", "code"),
                    new SearchQuery("" , "", "", "", "code"), //should return paths of every element in tree
                    new SearchQuery("F21003", "F31620", "F41071", "", "code", [new Exclusion("code", "5221", 3)]), 
                    new SearchQuery("F21003", "F31620", "" , "", "code", [new Exclusion("code", "F41071", 2), new Exclusion("code", "5221", 3), new Exclusion("code", "F41038", 2)])
                ];

//needs to be converted to pathQuery objects
var gapClosingAmounts = [{  "FUNCTION" : "F49992", "ACTIVITY_CODE" : "114A"    }, // Budget Reductions - Instructional & Instructional Support
                         {  "FUNCTION" : "F49995", "ACTIVITY_CODE" : "114C"    }, // Budget Reductions - Operating Support
                         {  "FUNCTION" : "F49994", "ACTIVITY_CODE" : "114E"    }, // Budget Reductions - Administration
                         {  "FUNCTION" : "F49991", "ACTIVITY_CODE" : "114B"    }, // Budget Reductions - Pupil & Family Support
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5999"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5221"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5130"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "2817"    }]; // Undistributed Budgetary Adjustments - Other

//note: 
//first element = element to be totaled & replaced
//second element = elements which will receive distributed total
//third+ element = exclusions that apply to 

var miscAdjust1 = [ new PathQuery("F21003", "F31620", "F49000", "5221", "code"), // Food Service > Allocated Costs
                    new SearchQuery("F21003", "F31620", "" , "", "code", 
                        [new Exclusion("code", "F41071", 2), new Exclusion("code", "5221", 3)], new Exclusion("code", "F41038", 2) 
                    )];// Operating Support group, except Transportation -- Regular Services > Allocated Costs and Debt Service
// distribute to: everything w/ function group F31620 but NOT if it has FUNCTION F41071 or ACTIVITY_CODE 5221 or FUNCTION F41038

var miscAdjust2 = [ new PathQuery("F21003", "F31620", "F41071", "5221", "code"), // Transportation -- Regular Services > Allocated Costs
                    new SearchQuery("F21003", "F31620", "F41071", "", "code", 
                        [new Exclusion("code", "5221", 3)]  
                    )];// Transportation -- Regular Services, except Allocated Costs
//distribute to: everything with FUNCTION F41071, unless it has ACTIVITY_CODE 5221

var miscAdjust3 = [ new PathQuery("F21005", "F31999", "F41073", "2515", "code"), // Undistributed Budgetary Adjustments - Other > ACCOUNTING SERVICES
                    new SearchQuery("F21001", "F49021", "F49027", "", "code")]; // Accounting & Audit Coordination
//distribute to: everything with FUNCTION F49027

var miscAdjust4 =[  new PathQuery("F21005", "F31999", "F41073", "2520", "code"), // Undistributed Budgetary Adjustments - Other > CITY CONTROLLER
                    new SearchQuery("F21001" , "F49015", "F41009", "", "code")]; // Financial Services Function
//distribute to everything with FUNCTION F41009

var miscAdjust5 =[  new PathQuery("F21005", "F31999", "F41073", "2512", "code"), // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
                    new SearchQuery("F21001", "F9021", "F49026", "", "code")];// Management & Budget Office function
//distribute to: everything with FUNCTION F49026

var miscAdjust6 = [ new PathQuery("F21005", "F31999", "F41073", "2519", "code"), // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
                    new SearchQuery("F21001", "F9021", "F49026", "", "code")];// Management & Budget Office function
//distribute to: everything with FUNCTION F49026



/******  Util functions  *******/

function getIndex(prop, val, array){
    for (var i=0; i<array.length; i++){
        if(array[i][prop] === val){
            return i;
        }
    }
    throw new Error("value not found  -from getIndex with love")
}

// seaches each level's children array for a match, and stores the match's index.
// accepts a PathQuery object.  returns 4 indices in an array
function findPath(root, query){
    if (!Array.isArray(root["children"]))
        throw new Error("root's children properties must be converted to arrays before findPath can be called.");

    var i0, i1, i2, i3; //indices needed to access element
    var prop = query["prop"]; 

    i0 = getIndex(prop, query[0], root["children"]);
    i1 = getIndex(prop, query[1], root["children"][i0]["children"]);
    i2 = getIndex(prop, query[2], root["children"][i0]["children"][i1]["children"]);
    i3 = getIndex(prop, query[3], root["children"][i0]["children"][i1]["children"][i2]["children"]);

    //return [i0, i1, i2, i3];
    return new Path(i0, i1, i2, i3);
}

//searches tree for all nodes matching passed critera
//returns array of paths(4-element arrays of indices) that fit the criteria
function searchTree(root, searchQuery){
// new SearchQuery("F21003", "F31620", "" , "", "code", 
//     [new Exclusion("code", "F41071", 2), new Exclusion("code", "5221", 3)], new Exclusion("code", "F41038", 2)]);

    var paths = [];
    var values = [];
    var indices = new Path("", "", "", "", searchQuery["prop"]);

    //needs access to searchQuery, indices, and paths
    //recursively collects paths of all nodes that fit search criteria
    function collectNestedPaths(value, index, array){
        var depth = array[0].depth - 1; //-1 because the depth property starts at 1 not 0.
        searchQuery[depth] = value[searchQuery["prop"]];

        if (depth < 3){ //if this is not the lowest level
            indices[depth] = getIndex(searchQuery["prop"], searchQuery[depth], array);
            array[indices[depth]]["children"].forEach(collectNestedPaths);
        }
        else{ 
            indices[depth] = getIndex(searchQuery["prop"], searchQuery[depth], array);
            paths.push(new Path(indices[0], indices[1], indices[2], indices[3], searchQuery["prop"]));
        }
    }


    //tests each index in searchQuery.  
        //if there is a value, and this is the LAST ONE, create a path for that value and add it to paths
        //If there is a value, and this ISN'T the LAST ONE, test the next value.
        //else, if there is NO VALUE, add paths of all nested data items from that point down via collectNestedPaths
    if (searchQuery[0].length > 0){ //get index for specific value
        indices[0] = getIndex(searchQuery["prop"], searchQuery[0], root["children"]);

        if(searchQuery[1].length > 0){ 
            indices[1] = getIndex(searchQuery["prop"], searchQuery[1], root["children"][indices[0]]["children"]);     

            if(searchQuery[2].length > 0){ 
                indices[2] = getIndex(searchQuery["prop"], searchQuery[2], root["children"][indices[0]]["children"][indices[1]]["children"]);
                
                    if(searchQuery[3].length > 0){ 
                        indices[3] = getIndex(searchQuery["prop"], searchQuery[3], root["children"][indices[0]]["children"][indices[1]]["children"][indices[2]]["children"]);
                    }
                    else{ 
                        root["children"][indices[0]]["children"][indices[1]]["children"][indices[2]]["children"].forEach(collectNestedPaths);
                    }
            }
            else{ 
                root["children"][indices[0]]["children"][indices[1]]["children"].forEach(collectNestedPaths);
            }
       
        }
        else{ 
            root["children"][indices[0]]["children"].forEach(collectNestedPaths);
        }

    }
    else{ 
        root["children"].forEach(collectNestedPaths);
    }

    //second passes - one per exclusion

    return paths;
}


// this method proportionally distributes amounts among lines matching the supplied conditions
function distributeAmounts(root, criteria, amounts){

    // first pass through target lines -- sum existing amounts

    // second pass -- distribute amounts proportionally
    
}

// this method removes lines matching one of the supplied conditions and returns their totals
function extractLines(root, criteria){
    var currentGrantTotals = 0, currentOperatingTotals = 0, currentTotals = 0;
    var nextGrantTotals = 0, nextOperatingTotals = 0, nextTotals = 0;
    var path;

    criteria.forEach(function(value, index, array){ //first pass - collecting totals
        path = findPath(root, array[index]);

        currentGrantTotals += root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["current"]["grant"];
        currentOperatingTotals += root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["current"]["operating"];
        currentTotals += root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["current"]["total"];

        nextGrantTotals += root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["next"]["grant"];
        nextOperatingTotals += root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["next"]["operating"];
        nextTotals += root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"][path[3]]["next"]["total"];
    });
    
    criteria.forEach(function(value, index, array){ //second pass - removing properties
        try{//because node may've been deleted already
            path = findPath(root, array[index]);
            root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"].splice(path[3], 1);
        }
        catch(e){}
    });

    return {    "currentGrantTotals": currentGrantTotals,
                "currentOperatingTotals": currentOperatingTotals,
                "currentTotals": currentTotals,
                "nextGrantTotals": nextGrantTotals,
                "nextOperatingTotals": nextOperatingTotals,
                "nextTotals": nextTotals
            };
}




