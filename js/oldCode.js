
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
