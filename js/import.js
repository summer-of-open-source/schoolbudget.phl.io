/************************************************/
/************ Formatter Utilities ***************/
/************************************************/

var tree;

//makes a new object out of passed datum and returns it
function makeNode(level, d, keys) {
    var newNode;

    var name = keys[level]["name"];
    var code = keys[level]["code"];

    newNode = {
        "name": d[name],
        "code": d[code]
    }

    if (level < 3)
        newNode.children = {}; //will be converted to an array
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

//iterates all objects in a nested tree
//converts everything in a property named 
//"children" from an object to an array
function convertChildren(value, index, array){
    //convert this element's children to an array
    value["children"] = convertObjectToArray(value["children"]);

        if(value["children"][0] && value["children"][0]["children"]){//if this element has children
            //iterate through this element's children array; recursively call self each time
            value["children"].forEach(convertChildren);
        }

    return;
}

//converts passed object into an array
function convertObjectToArray(obj){
    var arr = [];

    for (property in obj){
        arr.push(obj[property]);
    }
    return arr;
}


/************************************************/
/************ Nested CSV Formatter **************/
/************************************************/
 
function parseNestedCSV() {
    var keys = {
        0: {"name": "FUNCTION_CLASS_NAME",
            "code": "FUNCTION_CLASS"         },
        1: {"name": "FUNCTION_GROUP_NAME",
            "code": "FUNCTION_GROUP"         },
        2: {"name": "FUNCTION_NAME",
            "code": "FUNCTION"               },
        3: {"name": "ACTIVITY_NAME",
            "code": "ACTIVITY_CODE"          }
    };
    var tree = {
        "yearCurrent": 2014,
        "yearNext": 2015,
        "children": {}
    };

    d3.csv("../data/budget-information-test.csv",
        //accessor.  Controls how data is structured as it's pulled in.  Runs once per line of data (d) in the csv.
        function(d) { 

            var key;
            var name00, name01, name02, name03;
            var i = 0;

            key = keys[i];
            name00 = d[key["name"]];
            //if level 0 doesn't have a child with the current name, create and add one
            if (!tree["children"][name00]){
                tree["children"][name00] = makeNode(i, d, keys); 
            }


            i++;
            key = keys[i];
            name01 = d[key["name"]];
            if (!tree["children"][name00]["children"][name01]){
                tree["children"][name00]["children"][name01] = makeNode(i, d, keys); 
            }


            i++;
            key = keys[i];
            name02 = d[key["name"]];
            if (!tree["children"][name00]["children"][name01]["children"][name02]){
                tree["children"][name00]["children"][name01]["children"][name02] = makeNode(i, d, keys);
             }


            i++;
            key = keys[i];
            name03 = d[key["name"]];
            if (!tree["children"][name00]["children"][name01]["children"][name02]["children"][name03]){
                tree["children"][name00]["children"][name01]["children"][name02]["children"][name03] = makeNode(i, d, keys); 
            }
            else{ //there are some data items on the lowest level that share the same name as another.  On higher levels they would be nested.  here we have to just add them.
                var l = 2; //I know the name exists 1 time, so start at 2
                while(tree["children"][name00]["children"][name01]["children"][name02]["children"][name03.concat(l)]){
                    l++;
                }
                tree["children"][name00]["children"][name01]["children"][name02]["children"][name03.concat(l)] = makeNode(i, d, keys); 
            }

        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
            convertChildren(tree, null, null);
            main(tree); //calling main here to ensure data will be assembled when it runs

            //code for debugging adjustments

            console.log("**** findPath Tests ****");
            for (var i = 0; i < miscCodes.length; i++){
                console.log(findPath(tree, miscCodes[i]));
            }

            console.log("**** extractLines Test ****");
            console.log(extractLines(tree, miscCodes));

            console.log("***** Datum object tests ******")
            var datums = [  new Datum(0, 2, 3, 7, ["code", "name"], tree),
                            new Datum(3, 0, 0, 3, ["code", "name", "depth"], tree), 
                            new Datum(3, 0, 0, 0, ["code", "name"], tree)
            ];
            console.log(datums);

            console.log("**** searchTree Test ****");
            for (var i = 0; i < searchCodes.length; i++){
                console.log(searchTree(tree, searchCodes[i]));
            }

        });

    console.log("********  NESTED TREE  *******");
    console.log(tree); 
    return tree;
}

tree = parseNestedCSV();


