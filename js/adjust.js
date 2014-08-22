/***********************************************/
/************ Budgetary Adjustments ************/
/***********************************************/


//********  custom "data types" for formatting data  ********//
//********  that needs to be passed to search funcs  ********//

function Path(index0, index1, index2, index3){
    this[0] = index0,
    this[1] = index1,
    this[2] = index2,
    this[3] = index3
}

//contains a property name and its values over 4 levels 
//aka "Inclusion"
function Query(val1, val2, val3, val4, prop){
    this[0] = val1;
    this[1] = val2;
    this[2] = val3;
    this[3] = val4;
    this.prop = prop;

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
function Datum(index0, index1, index2, index3, root){
    Path.call(this, index0, index1, index2, index3);

    this.propNames = ["name", "code", "current", "next"];
    this.root = root;

    for (var i = 0; i < this.propNames.length; i++){//iterate each propName in list
        this[this.propNames[i]] = {};//create a new property with that propName
        this.getDatumProperties(this.propNames[i], root["children"], 0); //goes down 4 levels and fetches property values at each
    }


    return this;
}

// gets a property and add it to parent object
// repeats self until level 3 has been reached.  
// at level three, it calls itself one last time to add nested elements (children of cuttent/next)
Datum.prototype.getDatumProperties = function(propName, array, depth){
    this[propName][depth] = array[this[depth]][propName];
    if (depth < 3) //if this is the lowest level, then these properties are  "current", and "next", and both have nested children
        this.getDatumProperties(propName, array[this[depth]]["children"], depth+1); //this adds those children
}

Datum.prototype.updateParent = function(){
    //update Tree will be moved here after it's been tested
};



/*******  Variables  *********/

//note: 
//first element = element to be totaled & replaced
//second element = elements which will receive distributed total
//third+ element = exclusions that apply to second element

var miscAdjust1 = [ new Query("F21003", "F31620", "F49000", "5221", "code"), // Food Service > Allocated Costs
                    new Query("F21003", "F31620", "" , "", "code"), //Operating support group...
                    [   new Exclusion("code", "F41071", 2), 
                        new Exclusion("code", "5221", 3), 
                        new Exclusion("code", "F41038", 2)  ]
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
    var e = new Error("value pair \""+prop+": "+val+"\" not found! -from getIndex with love");
    e.array = array;
    e.possibleCauses = "did you call extractLines before this?  The line you're looking for might've been removed.";
    console.log(e);
}

// seaches each children array in every level of root.  
// matches query's prop:val pairs for each level, and stores the match's index.
// returns an array with the indices of queried object.  must be a COMPLETE query
function findPath(root, query){
    if (!Array.isArray(root["children"]))
        throw new Error("root's children properties must be converted to arrays before findPath can be called. -from findPath with love");

    var i0, i1, i2, i3; //indices needed to access element

    i0 = getIndex(query["prop"], query[0], root["children"]);
    i1 = getIndex(query["prop"], query[1], root["children"][i0]["children"]);
    i2 = getIndex(query["prop"], query[2], root["children"][i0]["children"][i1]["children"]);
    i3 = getIndex(query["prop"], query[3], root["children"][i0]["children"][i1]["children"][i2]["children"]);

    return [i0, i1, i2, i3];
}

// seaches each children array in every level of root.  
// matches query's prop:val pairs for each level, and stores the match's index.
// props contains properties that will be stored in the datum. Must be an array with at least 1 element
function findDatum(root, query){
    if (!Array.isArray(root["children"]))
        throw new Error("root's children properties must be converted to arrays before findDatum can be called. -from findDatum with love");

    var i0, i1, i2, i3; //indices needed to access element

    i0 = getIndex(query["prop"], query[0], root["children"]);
    i1 = getIndex(query["prop"], query[1], root["children"][i0]["children"]);
    i2 = getIndex(query["prop"], query[2], root["children"][i0]["children"][i1]["children"]);
    i3 = getIndex(query["prop"], query[3], root["children"][i0]["children"][i1]["children"][i2]["children"]);

    return new Datum(i0, i1, i2, i3, root);
}

//searches tree for all nodes matching passed critera
//returns array of paths(4-element arrays of datum objects) that fit the criteria
//can only accept 1 inclusion, but can accept multiple exclusions, either as an array or individually
function searchTree(root, searchQuery /*exclusions*/){
    var paths = [];
    var indices = new Path("", "", "", "", searchQuery["prop"]);

    var exclusions = Array.prototype.slice.call(arguments, 2) || [];

    //handles if the exclusions were passed as an ARRAY of exclusions
    if(Array.isArray(exclusions[0])) 
        exclusions = exclusions[0];

    //***  first pass: makes a Datum object for each match in root, and adds it to paths  ***//
    paths = include(paths, searchQuery, root); //for later: make SearchQuery an array and iterate it.  Multiple inclusions!!!

    //****  Second pass:  iterates all exclusions and removes matches from paths  ****//
    exclusions.forEach(function(value, index, element){//for each exclusion in list...
        paths = exclude(paths, value);
    });

    return paths;
}

//returns an array of (datum objects that reference) data that meets the criteteria passed in inclusion
//doesn't currently check for duplicate data items as they're being added. 
//(so, you could potentially add the same data item multiple times)
//multiple inclusions currently not supported. 
function include(paths, inclusion, root){
    var indices = new Path("", "", "", "", inclusion["prop"]);

    //recursively collects paths of all children/grandchildren/etc of passed value
    function collectNestedPaths(value, index, array){
        var depth = array[0].depth - 1; //-1 because the depth property starts at 1 not 0.
        inclusion[depth] = value[inclusion["prop"]];

        if (depth < 3){ //if this is not the lowest level
            indices[depth] = getIndex(inclusion["prop"], inclusion[depth], array);
            array[indices[depth]]["children"].forEach(collectNestedPaths);
        }
        else{ //if this IS the lowest level
            indices[depth] = getIndex(inclusion["prop"], inclusion[depth], array);
            paths.push(new Datum(indices[0], indices[1], indices[2], indices[3], root));
        }
    }

    //tests each index in inclusion.  
        //(1)if there is a value, and this is the LAST ONE, create a path for that value and add it to paths
        //(2) If there is a value, and this ISN'T the LAST ONE, test the next value.
        //(3) else, if there is NO VALUE, add paths of all nested data items from that point down via collectNestedPaths
    if (inclusion[0].length > 0){ 
        indices[0] = getIndex(inclusion["prop"], inclusion[0], root["children"]); //(2)

        if(inclusion[1].length > 0){ //(2)
            indices[1] = getIndex(inclusion["prop"], inclusion[1], root["children"][indices[0]]["children"]);     

            if(inclusion[2].length > 0){ //(2)
                indices[2] = getIndex(inclusion["prop"], inclusion[2], root["children"][indices[0]]["children"][indices[1]]["children"]);
                
                    if(inclusion[3].length > 0){ //(1) path is complete (has 4 indices) and is added to paths
                        indices[3] = getIndex(inclusion["prop"], inclusion[3], root["children"][indices[0]]["children"][indices[1]]["children"][indices[2]]["children"]);
                        paths.push(new Datum(indices[0], indices[1], indices[2], indices[3], root));
                    }
                    else{ //(3)
                        root["children"][indices[0]]["children"][indices[1]]["children"][indices[2]]["children"].forEach(collectNestedPaths);
                    }
            }
            else{ //(3)
                root["children"][indices[0]]["children"][indices[1]]["children"].forEach(collectNestedPaths);
            }
       
        }
        else{ //(3)
            root["children"][indices[0]]["children"].forEach(collectNestedPaths);
        }

    }
    else{ //(3) adds paths of all nested children to array
        root["children"].forEach(collectNestedPaths);
    }

    return paths;
}

//takes datumList and exclusion object.  removes elements that match the exclusion.
function exclude(paths, exclusion){
    var currentPath;

    //condenses a sparse array
    function condenseArray(sparseArray){
        var condensedArray = [];
        sparseArray.forEach(function(value, index, element){
            if (value) //if value is not undefined, null, or NAN
                condensedArray.push(value); //push it to the condensed array
        });
        return condensedArray;
    }

    paths.forEach(function(value, index, array){//for each path, find ones that match exclusion and remove them
        currentPath = value;

        if (currentPath[exclusion.prop][exclusion.depth] === exclusion.val) //if it matches...
            paths[index] = undefined;//creating a sparse array to keep the index accurate. 
    });
    paths = condenseArray(paths); //condensing sparse array
    return paths;
}

// this method removes lines matching the supplied conditions and returns their totals
function extractLines(root, criteria){
    var currentGrantTotals = 0, currentOperatingTotals = 0, currentTotals = 0, currentOtherTotals = 0, currentCapitalTotals = 0;
    var nextGrantTotals = 0, nextOperatingTotals = 0, nextTotals = 0, nextOtherTotals = 0, nextCapitalTotals = 0;
    var path, datum; 

    if (!Array.isArray(criteria)){//makes it possible to pass criteria as an array, or if there's only one, as a single arg
        criteria = [criteria]
    }

    criteria.forEach(function(value, index, array){ //first pass - collecting totals
        //path = findDatum(root, array[index]);
        datum = findDatum(root, array[index]);

        currentCapitalTotals += datum["current"][3]["capital"];
        currentOtherTotals += datum["current"][3]["other"];
        currentGrantTotals += datum["current"][3]["grant"];
        currentOperatingTotals += datum["current"][3]["operating"];
        currentTotals += datum["current"][3]["total"];

        nextCapitalTotals += datum["current"][3]["capital"];
        nextOtherTotals += datum["current"][3]["other"];
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

    return {    "curr_other": currentOtherTotals,
                "curr_capital": currentCapitalTotals,
                "curr_grant": currentGrantTotals,
                "curr_operating": currentOperatingTotals,
                "curr_total": currentTotals,
                "next_other": nextOtherTotals,
                "next_capital": nextCapitalTotals,
                "next_grant": nextGrantTotals,
                "next_operating": nextOperatingTotals,
                "next_total": nextTotals
            };
}

//updates node on tree with properties on a matching datum object
function updateTree(root, datum){

    //for each property in datum, update the coresponding property in the tree
    for(key in datum){

        if (isNaN(+key)){ //if key is not a number (numbered keys are part of the path, not updatable)
            root["children"][datum[0]]["children"][datum[1]]["children"][datum[2]]["children"][datum[3]][key] = datum[key];
            
            if (datum[key] === "current" || datum[key] === "next"){//if this is one of the keys that has children...
                var midKey = datum[key];
                
                for (key in datum[midKey]){ //iterate them and add them
                    root["children"][datum[0]]["children"][datum[1]]["children"][datum[2]]["children"][datum[3]][midKey][key] = datum[midKey][key];
                }
            }
        }

    }


}


// this method proportionally distributes amounts among lines matching the supplied conditions
//toRemove = Query     toDistribute = Query     exclusions = [Exclusion]
function distributeAmounts(root, toRemove, toDistribute, exclusions){
    var amounts = extractLines(root, toRemove); 
    var keys = Object.keys(amounts); //contains keys (curr_total, next_grant, etc)  use key.slice(5) to access matching property in datum
    var distributionDatums = searchTree(root, toDistribute, exclusions); 

    var proportion, defaultProportion = 1 / distributionDatums.length;


    //initialize totals & newTotals
    var totals = {}, newTotals = {};
    keys.forEach(function(key, index, array){
        totals[key] = 0;
        newTotals[key] = 0;
    });

    // first pass through target lines -- sum existing amounts
   distributionDatums.forEach(function(datum, index, array){//for each distribution datum
        keys.forEach(function(key, index, array){//for each key
            if (key.indexOf("next") > 0)
                totals[key] += datum["next"][3][key.slice(5)]; //note the three.  Look at a datum object's current/next in the console to see why.
            else
                totals[key] += datum["current"][3][key.slice(5)];
        });
   });

    // second pass -- distribute amounts proportionally
    distributionDatums.forEach(function(datum, index, array){//for each distribution datum

        keys.forEach(function(key, index, array){//for each key

            var midKey;//"current" or "next"
            if (key.indexOf("next") >= 0)
                midKey = "next";
            else
                midKey = "current";

            //gets appropriate proportion
            if(totals[key] !== 0){//condition from import.php
                proportion = datum[midKey][3][key.slice(5)] / totals[key];
            }
            else
                proportion = defaultProportion;

            //assigns datum property to new value
            datum[midKey][3][key.slice(5)] = (amounts[key] * proportion).toFixed(2);//rounds to 2 decimal places
            //also adds it to newTotals(remnant from import.php) 
            newTotals[key] = datum[midKey][3][key.slice(5)];
        });

        updateTree(root, datum); //applies changes to the actual element on the tree
   });   

}

// // first pass through target lines -- sum existing amounts
// $totals = array();
// foreach ($lines AS $Line) {
//     foreach ($columns AS $column) {
//         $totals[$column] += $Line->$column; 
//     }
// }
// //result: $totals contains 10 properties named after values in columnsCurrent/columnsProposed(i think)
// //each contains the sum of all data items that meet conditions


// // second pass -- distribute amounts proportionally
// $newTotals = array(); //stores new totals
// $defaultProportion = 1 / count($lines); //what to multiply each selected element by.  1 / #lines distributing to
// foreach ($lines AS $Line) { //for each line in distribution lines
//     foreach ($totals AS $column => $total) {  //for each total(contains summed totals with a matching key)
//         if ($total) { //if a total evaluates to true...  meaning it is not zero, i think...  and why would the proportion change b/c of that?
//             $proportion = $Line->$column / $total;// proportion = line[column] / total
//         } else {//if total = 0?
//             $proportion = $defaultProportion;//proportion = default
//         }

//         $Line->$column += round($amounts[$column] * $proportion, 2); //line[column] += (amounts[column] *proportion) rounded to 2nd place.  This is actually editing the value in the tree
//         $newTotals[$column] += $Line->$column; //newTotals[column] += line[column]
//         //summing new totals in newTotals object.  why? what are we doing with it after this?
//     }
//     $Line->save();//and what's this doing?  saving modifications to the line is my guess...
// }

