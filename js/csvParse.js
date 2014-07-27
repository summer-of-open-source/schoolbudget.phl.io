function parseCSV() {
    var index = -1;
    return d3.csv("../data/budget-information-test.csv",
        //accessor.  Controls how data is structured as it's pulled in
        function(d) {
            return makeTreeNormalized(d);
        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
            //dataArray contains an array of objects, 1 for each row of the csv file
            //object property names correspond to csv headings (FUNCTION, ACTIVITY_CODE, etc), 
            //unless there's an accessor function involved
            console.log(dataArray.valueOf());
        });
}

//syntax inside d3.csv call

// function(d){
//     //index++; //I'm pretty sure there's a better way to do this...
//     //return makeNormalizedList(index, d);
// }

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


//where d is one row of elements in the csv doc
function makeTreeNormalized(d) {

    var tree = {
        "name": "School District of Philadelphia Budget",
        "yearCurrent": 2014,
        "yearNext": 2015,
        "children": []
    };

    tree["children"] = makeTree(tree, 0, d);

    return tree;
}



//for each row in document, makeTree should be called 4 times, once for each key
function makeTree(parent, level, d) {
    var nameKey = keys[level]["name"];
    var name = d[nameKey];
    var childrenArray = parent["children"];

    //if there is not an element of this name in parent.children
    if (!nodeExists(childrenArray, name)) {
        childrenArray.push(makeNode(level, d)); //access that element, add new element to its children array
    }

    if (level < 3) { //if we haven't hit bottom yet
        //call makeTree for next level
        childrenArray = makeTree(getNodeFromArray(childrenArray, "name", name), level + 1, d);
    }

    return childrenArray;
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
        if (array[i][property]) {
            return true;
        }
    }

    return false;
}


function getNodeFromArray(array, property, value) {
    if (!nodeExists(array, property)) //if array is undefined or empty
        throw new Error("lookupNode: array undefined, empty, or array doesn't exist");

    for (var i = 0; i < array.length; i++) {
        if (array[i][property] == value) {
            return array[i];
        }
    }

    throw new Error("lookupNode: match not found");
    return null;
}

var testData = parseCSV();



// var testArray = [{
//     "name": "name1",
//     "s": "s",
//     "3": 0
// }, {
//     "l": "l",
//     "name": "alphabet"
// }, {
//     "q": "q",
//     "r": 10
// }];

// console.log("should be true");
// console.log(lookupNode(testArray, "name", "alphabet"));

// // console.log("should be false or undefined");
// // console.log(lookupNode(testArray, "lishio", "kjsdgfk"));

// console.log("should be true");
// console.log(lookupNode(testArray, "r", 10));

// console.log("should be true");
// console.log(lookupNode(testArray, "name", "name1"));


// console.log(nodeExists(testArray, "seven"));
// //now check it out in the console!!!