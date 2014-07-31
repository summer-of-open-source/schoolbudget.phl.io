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

//var normal = parseNormalizedCSV();


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
    var debugIndex = 0;
    tree = {
        "name": "School District of Philadelphia Budget",
        "yearCurrent": 2014,
        "yearNext": 2015,
        "children": []
    };

    return d3.csv("../data/budget-information-test.csv",
        //accessor.  Controls how data is structured as it's pulled in
        function(d) {

            if (debugIndex < 30) {
                console.log("tree at row " + debugIndex);
                debugIndex++
            }

            var newNode = growBranch(tree, 0, d);

            for(var i = 0; i < tree["children"].length; i++){
                if(tree["children"][i]["name"] === d.FUNCTION_CLASS_NAME){
                    tree["children"][i] = newNode;
                    break;
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
    if (!nodeExists(siblingArray, name)) {
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
        newNode.children = [];

    return newNode;
}

//array is an array of objects
//name is the name of the object we're looking for
//returns true if it exists, false otherwise
function nodeExists(array, property) {
    if (typeof array == undefined || array.length < 1) //if array is undefined or empty
        return false;

    for (var i = 0; i < array.length; i++) {
        if (array[i][property]) {//if the element at array[i] contains a property that matches
            return true;
        }
    }

    return false;
}

//returns node that contains the passed property
function getNodeFromArray(array, property, value) {
    if (!nodeExists(array, property)) //if array is undefined or empty, or doesn't contain property 
        throw new Error("lookupNode: array undefined, empty, or property does not exist");

    for (var i = 0; i < array.length; i++) {
        if (array[i][property] == value) {
            return array[i];
        }
    }

    throw new Error("getNodeFromArray: match not found");
    return null;
}

var nested = parseNestedCSV();




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