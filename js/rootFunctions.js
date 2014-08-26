/**************************************************/
/*******      Functions for searching         *****/
/*******  and manipulating elements in root   *****/
/**************************************************/


//********  custom "data types" for formatting data  ********//
//********        to be passed to search funcs       ********//

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

//a proxy for 1 line of data on root which reaches the deepest level (3).  
//make one of these, adjust its properties, and call its update method to update the root
//stores path (indices 0-3) and 4-levels associated properties
function Datum(index0, index1, index2, index3, root){
    Path.call(this, index0, index1, index2, index3);

    this.propNames = ["name", "code", "current", "next"];
    this.root = root;

    for (var i = 0; i < this.propNames.length; i++){//iterate each propName in list
        this[this.propNames[i]] = {};//create a new property with that propName
        this._initializeDatumProperties(this.propNames[i], root["children"], 0); //goes down 4 levels and fetches property values at each
    }


    return this;
}

// gets a property and add it to parent object
// repeats self until level 3 has been reached.  
// at level three, it calls itself one last time to add nested elements (children of cuttent/next)
Datum.prototype._initializeDatumProperties = function(propName, array, depth){
    this[propName][depth] = array[this[depth]][propName];
    if (depth < 3) //if this is the lowest level, then these properties are  "current", and "next", and both have nested children
        this._initializeDatumProperties(propName, array[this[depth]]["children"], depth+1); //this adds those children
}

//accesses datum's parent in root and replaces all its properties with Datum's (which have presumably been changed)
Datum.prototype.update = function(){
    //for each property in datum, update the coresponding property in the tree
    for(key in this){

        if (isNaN(+key)){ //if key is not a number (numbered keys are part of the path, not updatable)
            this.root["children"][this[0]]["children"][this[1]]["children"][this[2]]["children"][this[3]][key] = this[key];
            
            if (this[key] === "current" || this[key] === "next"){//if this is one of the keys that has children...
                var midKey = this[key];
                
                for (key in this[midKey]){ //iterate them and add them
                    this.root["children"][this[0]]["children"][this[1]]["children"][this[2]]["children"][this[3]][midKey][key] = this[midKey][key];
                }
            }
        }

    }
};

//Returns description of Datum as a string
Datum.prototype.toString = function(){
    var stringified = "**** Datum Object****\n\n"
    stringified += "Path: " + this[0] + ", " + this[1] + ", " + this[2] + ", " + this[3] + "\n";

    for (key in this){

        if (!(this[key] instanceof Function || key === "root" || !isNaN(key))){ //skips functions, root, and indices

            if (this[key] instanceof Array){//if this key contains an array (notably the propNames property)
                stringified += key + ":  " + this[key].toString() + "\n";
            }
            else if (key === "current" || key === "next"){ //if this is one of the keys with nested properties that only exists on level 3
                var index = 3;
                stringified += key + " (level 3 only): \n";
                for (lowerKey in this[key][index]){
                    stringified += "\t\t" + lowerKey + ":  " + this[key][index][lowerKey] + "\n";  
                }
            }
            else {
               stringified += key + ":\t"; //adds key name plus a tab

                for (index in this[key]){//prints values for each level (4 vals for code, name, etc)
                    if (index > 0)
                        stringified += "\t\t";
                    stringified += index + ":  " + this[key][index] + "\n";
                }
            }
        }
    }
    return stringified;
};



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
    e.possibleCauses = "did you call extractLines before this?  The line you're looking for might've been removed.\n Also double-check if you entered the right search value in your search/exclude queries!";
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
// criteria is a query object which may have empty values at properties 0 - 3 and below
// if, for example, the value at index 2 is blank, all nested elements with that value will be totaled and removed
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