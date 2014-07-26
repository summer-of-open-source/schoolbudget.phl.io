function parseCSV() {
    var index = -1;
    return d3.csv("../data/budget-information-test.csv",
        //accessor.  Controls how data is structured as it's pulled in
        function(d) {
            index++; //I'm pretty sure there's a better way to do this...
            return makeTreeNormalized(index, d);
            //return makeNormalizedList(index, d);
        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
            //dataArray contains an array of objects, 1 for each row of the csv file
            //object property names correspond to csv headings (FUNCTION, ACTIVITY_CODE, etc), 
            //unless there's an accessor function involved
            console.log(dataArray.valueOf());
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



var keys = {
    0: {
        "name": "FUNCTION_CLASS_NAME",
        "number": "FUNCTION_CLASS"
    },
    1: {
        "name": "FUNCTION_GROUP_NAME",
        "number": "FUNCTION_GROUP"
    },
    2: {
        "name": "FUNCTION_NAME",
        "number": "FUNCTION"
    },
    3: {
        "name": "ACTIVITY",
        "number": "ACTIVITY_CODE"
    }
};



function makeTreeSimple(index, d) {



}

//where d is one row of elements in the csv doc
function makeTreeNormalized(index, d) {

    var tree = {
        "name": "School District of Philadelphia Budget",
        "yearCurrent": 2014,
        "yearNext": 2015,
        "children": []
    };

    makeTree(tree, searchKeys[1], d);

}



//for each row in document, makeTree should be called 4 times, once for each key
function makeTree(parent, level, d) {
    var nameKey = keys[level][name];
    var name = d[nameKey];

    //if there is not an element of this name in parent.children
    if (!nodeExists(parent.children, name)) {
        parent.children.push(makeNode(level, d)); //access that element, add new element to its children array
    }

    if (level < 3) { //if we haven't hit bottom yet
        //call makeTree for next level
        makeTree(parent.children, level++, d);
    }
}


function makeNode(level, d) {
    var newNode;

    newNode = {
        "name": d[keys[level][name]],
        "code": d[keys[level][code]]
    }

    if (level < 3)
        newNode.children = [];

    return newNode;
}

var testData = parseCSV();

//array is an array of objects
//name is the name of the object we're looking for
//returns true if it exists, false otherwise
function nodeExists(array, property) {
    if (!array) //if array is undefined
        return false;

    for (var i = 0; i < array.length; i++) {
        if (array[i][property]) {
            return true;
        }
    }

    return false;
}


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

// console.log(nodeExists(testArray, "seven"));
// //now check it out in the console!!!