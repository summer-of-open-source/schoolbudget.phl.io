/***********************************************/
/************ Budgetary Adjustments ************/
/***********************************************/

function Path(index0, index1, index2, index3){
    this[0] = index0,
    this[1] = index1,
    this[2] = index2,
    this[3] = index3
}

// //exclusions is an array of Exclusion objects
// function SearchQuery(prop0, prop1, prop2, prop3, propName, exclusions){
//     PathQuery.call(this, prop0, prop1, prop2, prop3, propName)
//     this.exclusions = exclusions || [];

//     return this;
// }

// function PathQuery(prop0, prop1, prop2, prop3, propName){
//     this[0] = prop0; //values to search for in prop
//     this[1] = prop1;
//     this[2] = prop2;
//     this[3] = prop3;
//     this.prop = propName; //property that will contain values in 0-3

//     return this;
// }

//custom "data types" for formatting data that will be passed to search functions
//in future: SIMPLIFY!!  how about just a datum object and a query object?

//contains a property name and its values over 4 levels
function Query(val1, val2, val3, val4, prop){
    this[0] = val1;
    this[1] = val2;
    this[2] = val3;
    this[3] = val4;

    if (Array.isArray(prop))
        this[prop] = prop;
    else
        this[prop] = [prop];

    return this;
}

//contains information about an exclusion
function Exclusion(prop, val, depth){
    this.prop = prop;
    this.val = val;
    this.depth = depth;

    return this;
}

//stores path (indices 0-3) and 4-levels associated properties (specified by propNames array)
function Datum(index0, index1, index2, index3, propNames, root){
    //Path.call(this, index0, index1, index2, index3);
    this[0] = index0,
    this[1] = index1,
    this[2] = index2,
    this[3] = index3

    if (Array.isArray(propNames) && root){
        this.root = root;
        for (var i = 0; i < propNames.length; i++){
            this[propNames[i]] = {};
            this.getDatumProperties(propNames[i], root["children"], 0); //goes down 4 levels and fetches property values at each
        }
    }

    return this;
}

Datum.prototype.getDatumProperties = function(propName, array, depth){
    this[propName][depth] = array[this[depth]][propName];
    if (depth < 3)
        this.getDatumProperties(propName, array[this[depth]]["children"], depth+1);
}



/*******  Variables  *********/

//note: 
//first element = element to be totaled & replaced
//second element = elements which will receive distributed total
//third+ element = exclusions that apply to 

var miscAdjust1 = [ new Query("F21003", "F31620", "F49000", "5221", "code"), // Food Service > Allocated Costs
                    new Query("F21003", "F31620", "" , "", "code"), 
                    new Exclusion("code", "F41071", 2), 
                    new Exclusion("code", "5221", 3), 
                    new Exclusion("code", "F41038", 2) 
                ];// Operating Support group, except Transportation -- Regular Services > Allocated Costs and Debt Service
// distribute to: everything w/ function group F31620 but NOT if it has FUNCTION F41071 or ACTIVITY_CODE 5221 or FUNCTION F41038

var miscAdjust2 = [ new Query("F21003", "F31620", "F41071", "5221", "code"), // Transportation -- Regular Services > Allocated Costs
                    new Query("F21003", "F31620", "F41071", "", "code"), 
                    new Exclusion("code", "5221", 3)
                ];// Transportation -- Regular Services, except Allocated Costs
//distribute to: everything with FUNCTION F41071, unless it has ACTIVITY_CODE 5221

var miscAdjust3 = [ new Query("F21005", "F31999", "F41073", "2515", "code"), // Undistributed Budgetary Adjustments - Other > ACCOUNTING SERVICES
                    new Query("F21001", "F49021", "F49027", "", "code")]; // Accounting & Audit Coordination
//distribute to: everything with FUNCTION F49027

var miscAdjust4 =[  new Query("F21005", "F31999", "F41073", "2520", "code"), // Undistributed Budgetary Adjustments - Other > CITY CONTROLLER
                    new Query("F21001" , "F49015", "F41009", "", "code")]; // Financial Services Function
//distribute to everything with FUNCTION F41009

var miscAdjust5 =[  new Query("F21005", "F31999", "F41073", "2512", "code"), // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
                    new Query("F21001", "F9021", "F49026", "", "code")];// Management & Budget Office function
//distribute to: everything with FUNCTION F49026

var miscAdjust6 = [ new Query("F21005", "F31999", "F41073", "2519", "code"), // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
                    new Query("F21001", "F9021", "F49026", "", "code")];// Management & Budget Office function
//distribute to: everything with FUNCTION F49026



/******  Util functions  *******/


//finds element in array with passed property:value pair 
//returns index
function getIndex(prop, val, array){
    for (var i=0; i<array.length; i++){
        if(array[i][prop] === val){
            return i;
        }
    }
    console.log(new Error("value pair \""+prop+": "+val+"\" not found  -from getIndex with love"));
    return -1;
}

// seaches each children array in every level of root.  
// matches query's prop:val pairs for each level, and stores the match's index.
function find(root, query){
    if (!Array.isArray(root["children"]))
        throw new Error("root's children properties must be converted to arrays before findPath can be called. -from findPath with love");

    var i0, i1, i2, i3; //indices needed to access element
    var prop = query["prop"]; 

    i0 = getIndex(prop, query[0], root["children"]);
    i1 = getIndex(prop, query[1], root["children"][i0]["children"]);
    i2 = getIndex(prop, query[2], root["children"][i0]["children"][i1]["children"]);
    i3 = getIndex(prop, query[3], root["children"][i0]["children"][i1]["children"][i2]["children"]);

    return new Path(i0, i1, i2, i3);
}

// seaches each children array in every level of root.  
// matches query's prop:val pairs for each level, and stores the match's index.
// props contains properties that will be stored in the datum. Must be an array with at least 1 element
function findDatum(root, query, props){
    if (!Array.isArray(root["children"]))
        throw new Error("root's children properties must be converted to arrays before findPath can be called. -from findPath with love");

    var i0, i1, i2, i3; //indices needed to access element

    i0 = getIndex(prop, query[0], root["children"]);
    i1 = getIndex(prop, query[1], root["children"][i0]["children"]);
    i2 = getIndex(prop, query[2], root["children"][i0]["children"][i1]["children"]);
    i3 = getIndex(prop, query[3], root["children"][i0]["children"][i1]["children"][i2]["children"]);

    return new Datum(i0, i1, i2, i3, props, root);
}

//searches tree for all nodes matching passed critera
//returns array of paths(4-element arrays of indices) that fit the criteria
function searchTree(root, searchQuery /*exclusions*/){

    var paths = [];
    var indices = new Path("", "", "", "", searchQuery["prop"]);
    var exclusions = Array.prototype.slice.call(arguments, 2) || [];
    var typesExcluded = [];

    //ensures that whatever types are going to be excluded will be included in datum objects for testing
    exclusions.forEach(function(value, index, array){
        typesExcluded.push(value.prop);
    });


    //***  first pass: makes a Datum object for each match in root, and adds it to paths  ***//

    //needs access to searchQuery, indices, and paths
    //recursively collects paths of all children/grandchildren/etc of passed value
    function collectNestedPaths(value, index, array){
        var depth = array[0].depth - 1; //-1 because the depth property starts at 1 not 0.
        searchQuery[depth] = value[searchQuery["prop"]];

        if (depth < 3){ //if this is not the lowest level
            indices[depth] = getIndex(searchQuery["prop"], searchQuery[depth], array);
            array[indices[depth]]["children"].forEach(collectNestedPaths);
        }
        else{ 
            indices[depth] = getIndex(searchQuery["prop"], searchQuery[depth], array);
            paths.push(new Datum(indices[0], indices[1], indices[2], indices[3], typesExcluded, root));
        }
    }

    //tests each index in searchQuery.  
        //if there is a value, and this is the LAST ONE, create a path for that value and add it to paths
        //If there is a value, and this ISN'T the LAST ONE, test the next value.
        //else, if there is NO VALUE, add paths of all nested data items from that point down via collectNestedPaths
    if (searchQuery[0].length > 0){ 
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
    else{ //gets paths of all nested children
        root["children"].forEach(collectNestedPaths);
    }

    //****  Second pass:  iterates all exclusions and removes matches from paths  ****//

    exclusions.forEach(function(value, index, element){//for each exclusion in list...
        var exclusion = value;  //Exclusion object: prop, val, depth  

        paths.forEach(function(value, index, array){//for each path, find ones that match exclusion and remove them
            var datum = value;

            if (datum[exclusion.prop][exclusion.depth] === exclusion.val)
                paths.splice(index, 1);
        });

    });

    return paths;
}

// this method removes lines matching one of the supplied conditions and returns their totals
function extractLines(root, criteria){
    var currentGrantTotals = 0, currentOperatingTotals = 0, currentTotals = 0;
    var nextGrantTotals = 0, nextOperatingTotals = 0, nextTotals = 0;
    var path, datum; 

    criteria.forEach(function(value, index, array){ //first pass - collecting totals
        path = findPath(root, array[index]);
        datum = new Datum(path[0], path[1], path[2], path[3], ["current", "next"], root);

        currentGrantTotals += datum["current"][3]["grant"];
        currentOperatingTotals += datum["current"][3]["operating"];
        currentTotals += datum["current"][3]["total"];

        nextGrantTotals += datum["next"][3]["grant"];
        nextOperatingTotals += datum["next"][3]["operating"];
        nextTotals += datum["next"][3]["total"];
    });
    
    criteria.forEach(function(value, index, array){ //second pass - removing properties
        try{//because node may've been deleted already
            path = findPath(root, array[index]);
            //have to use long path because we're actually editing the tree here
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



// this method proportionally distributes amounts among lines matching the supplied conditions
//toRemove = pathQuery     toDistribute = searchQuery
function distributeAmounts(root, toRemove, toDistribute){
    var distributionDatums = searchTree(root, toDistribute); 
    var defaultProportion = 1 / distributionDatums.length;

    // first pass through target lines -- sum existing amounts
    var amounts = extractLines(root, toRemove); 

    // second pass -- distribute amounts proportionally


    var distributionAmount = 0;

    for(property in amounts){
        distributionAmount = amounts[property] / distributionDatums.length
    }
}



