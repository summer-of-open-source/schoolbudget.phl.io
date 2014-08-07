var normal, nested;

/**************   Normalized CSV Format   ***************/


function parseNormalizedCSV() {
    var index = -1;

    return d3.csv("../data/budget-information-test.csv",
        function(d) {
            index++; //I'm pretty sure there's a better way to do this...
            return makeNormalizedList(index, d);
        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
            //dataArray contains an array of objects, 1 for each row of the csv file
            //object property names correspond to csv headings (FUNCTION, ACTIVITY_CODE, etc), 
            //unless there's an accessor function involved
            console.log("********   NORMALIZED   ********");
            console.log(dataArray);
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

normal = parseNormalizedCSV();

/**************   Nested CSV Format   ***************/


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
                tree["children"][name00]["children"][name01]["children"][name02] = makeNode(i, d);             }


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
            console.log("********  NESTED TREE  *******");
            console.log(tree);

        });

}

nested = parseNestedCSV();

/**** RECURSIVE NOT-SO-FUNCTIONAL SOLUTION  ****/


function parseNestedCSVrecursive() {
    var debugIndex = 0;
    tree = {
        "name": "School District of Philadelphia Budget",
        "yearCurrent": 2014,
        "yearNext": 2015,
        "children": []
    };

    return d3.csv("../data/test-budget-small.csv",
        //accessor.  Controls how data is structured as it's pulled in
        function(d) {

            console.log("tree at row " + debugIndex);
            debugIndex++;


            var newNode = growBranch(tree, 0, d); 

            //loops through all children of tree 
            for(var i = 0; i < tree["children"].length; i++){
                if(tree["children"][i]["name"] === d.FUNCTION_CLASS_NAME){ //finds child with current FUNCTION_CLASS_NAME
                    tree["children"][i] = newNode;//replaces it with the new node which has the current row of data's changes added
                    break; //ends the loop
                }
            }
        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
            console.log(tree);
        });

}


//for each row in document, makeTree should be called 4 times, once for each key
//returns the same parent node with any necessary changes made
function growBranch(parent, level, d) {
    var nameKey = keys[level]["name"];
    var name = d[nameKey];
    var siblingArray = parent["children"];
    var nextLevelParent;

    //if there is not an element of this name in parent.children
    if (!nodeExists(siblingArray, "name", name)) {
        siblingArray.push(makeNode(level, d)); //access that element, add new element to its children array
    }


    if (level < 3) { //if we haven't hit bottom yet
        //call makeTree for next level
        //printNamesInArray(siblingArray);

        nextLevelParent = getNodeFromArray(siblingArray, "name", name); // gets parent for next level
        //siblingArray = siblingArray.children.push(growBranch(nextLevelParent, (level+1), d));
        //parent["children"].push(growBranch(nextLevelParent, (level+1), d));

        /***** have to replace node in siblingArray, not append to it *****/
        //iterates through, finds right sibling, replaces
        for (var i = 0; i < siblingArray.length; i++)
            if (siblingArray[i]["name"] === name)
                siblingArray[i] = growBranch(nextLevelParent, (level+1), d);
    }
    return parent;
    //return siblingArray;

}

function printNamesInArray(theArray){
    theArray.forEach(function(element, index, array) {
        console.log(element.name);
    });
}


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

//array is an array of objects
//name is the name of the object we're looking for
//returns true if it exists, false otherwise
function nodeExists(array, property, value) {
    if (typeof array == undefined || array.length < 1) //if array is undefined or empty
        return false;

    for (var i = 0; i < array.length; i++) {
        if (array[i][property] === value ) {//if the element at array[i] contains a property that matches
            return true;
        }
    }

    return false;  //array exists but node not found
}

//returns node that contains the passed property
function getNodeFromArray(array, property, value) {
    if (!nodeExists(array, property, value)) //if array is undefined or empty, or doesn't contain property 
        throw new Error("lookupNode: array undefined, empty, or property does not exist");

    for (var i = 0; i < array.length; i++) {
        if (array[i][property] == value) {
            return array[i];
        }
    }

    throw new Error("getNodeFromArray: match not found");
    return null;
}


var testArray = [{
    "name": "name1",
    "s": "s",
    "3": 0
}, {
    "l": "l",
    "name": "alphabet"
}, {
    "q": "q",
    "r": 10
}];

