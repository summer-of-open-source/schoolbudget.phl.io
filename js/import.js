
/************************************************/
/************ Nested CSV Formatter **************/
/************************************************/

var nestedFormatter = {

    keys: {
        0: {"name": "FunctionClassName",
            "code": "FunctionClass"         },
        1: {"name": "FunctionGroupName",
            "code": "FunctionGroup"         },
        2: {"name": "FunctionName",
            "code": "Function"               },
        3: {"name": "ActivityName",
            "code": "ActivityCode"          }
    },

    tree: {
        "yearCurrent": 2014,
        "yearNext": 2015,
        "children": {}
    },

    //returns a nested tree made with the data in passed normalizedData
    convertToNested: function(normalizedData){
        //iterate NormalizedData and convert each item to a branch
         for (var i = 0; i < normalizedData.length; i++){
            this.makeNestedListItem.call(this, normalizedData[i]);
         }

         //convert "children" properties to arrays
         this.convertChildren.call(this, this.tree, null, null);

         return this.tree;
    }, 

    //note: this returns an object whose children are contained in objects
    //these must be converted to arrays via convertChildren before 
    //d3 can use it
    makeNestedListItem: function(d){

        var key;
        var name00, name01, name02, name03;
        var j = 0;

        key = this.keys[j];
        name00 = d[key["name"]];
        //if level 0 doesn't have a child with the current name, create and add one
        if (!this.tree["children"][name00]){
            this.tree["children"][name00] = this.makeNode.call(this, j, d); 
        }


        j++;
        key = this.keys[j];
        name01 = d[key["name"]];
        if (!this.tree["children"][name00]["children"][name01]){
            this.tree["children"][name00]["children"][name01] = this.makeNode.call(this, j, d); 
        }


        j++;
        key = this.keys[j];
        name02 = d[key["name"]];
        if (!this.tree["children"][name00]["children"][name01]["children"][name02]){
            this.tree["children"][name00]["children"][name01]["children"][name02] = this.makeNode.call(this, j, d);
         }


        j++;
        key = this.keys[j];
        name03 = d[key["name"]];
        if (!this.tree["children"][name00]["children"][name01]["children"][name02]["children"][name03]){
            this.tree["children"][name00]["children"][name01]["children"][name02]["children"][name03] = this.makeNode.call(this, j, d); 
        }
        else{ //there are some data items on the lowest level that share the same name as another.  On higher levels they would be nested.  here we have to just add them with slightly different keys.
            var k = 2; //we know the name exists 1 time (otherwise we'd be in if, not else), so start at 2
            while(this.tree["children"][name00]["children"][name01]["children"][name02]["children"][name03.concat(k)]){
                k++;
            }
            this.tree["children"][name00]["children"][name01]["children"][name02]["children"][name03.concat(k)] = this.makeNode.call(this, j, d); 
        }

        return this.tree;
    },

    //recursively iterates all objects in a nested tree
    //converts everything in a property named 
    //"children" from an object to an array
    convertChildren: function (value, index, array){
        //convert this element's children to an array
        value["children"] = this.convertObjectToArray(value["children"]);

            if(value["children"][0] && value["children"][0]["children"]){//if this element has children
                //iterate through this element's children array; recursively call self each time
                for (key in value["children"])
                    this.convertChildren.call(this, value["children"][key]);
            }

        return;
    },

    //converts passed object into an array
    convertObjectToArray: function (obj){
        var arr = [];

        for (property in obj){
            arr.push(obj[property]);
        }
        return arr;
    },

    //makes a new object out of passed datum and returns it
    makeNode: function (level, d) {
        var newNode;

        var name = this.keys[level]["name"];
        var code = this.keys[level]["code"];

        newNode = {
            "name": d[name],
            "code": d[code]
        }

        if (level < 3)
            newNode.children = {}; //will be converted to an array
        else{
                 newNode["current"] = {
                    "operating": +d.CurrentOperating,//OPERATING_CYEST_LUMPSUM_AMT,
                    "grant": +d.CurrentGrant,//GRANT_CYEST_LUMPSUM_AMT,
                    "capital": +d.CurrentCapital ,//CAPITAL_CYEST_LUMPSUM_AMT,
                    "other": +d.CurrentOther ,//OTHER_CYEST_LUMPSUM_AMT,
                    "total": +d.CurrentTotal //CYEST_LUMPSUM_TOT
                }

                newNode["next"] = {
                    "operating": +d.ProposedOperating ,//OPERATING_ACT_LUMPSUM_AMT,
                    "grant": +d.ProposedGrant ,//GRANT_ACT_LUMPSUM_AMT,
                    "capital": +d.ProposedCapital ,//CAPITAL_ACT_LUMPSUM_AMT,
                    "other": +d.ProposedOther ,//OTHER_ACT_LUMPSUM_AMT,
                    "total": +d.ProposedTotal //ACT_LUMPSUM_TOT
                    }
        }

        return newNode;
    }

};

/************************************************/
/********* Normalized CSV Formatter *************/
/************************************************/

var normalizedFormatter = {

    //meant to be called by d3s csv parser.  
    //convert each line of data into a normalizedListItem
    //returns current array with new item tacked on
    convertToNormalized: function (d, dataArray, index) {
        dataArray[index] = this.makeNormalizedListItem(index, d);
        return dataArray;
    },

    //creates a single normalizedList item from passed data (d) and returns it
    makeNormalizedListItem: function (index, d) {
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

};


/************************************************/
/***************** CSV Parser *******************/
/************************************************/
 
function parseCSV() {
    var normalizedData = [];
    var nestedData = {};
    var currentDatumIndex = 0;
    var tree;

    d3.csv("../data/budget-information-test.csv",
        //accessor.  Controls how data is structured as it's pulled in.  Runs once per line of data (d) in the csv.
        function(d) { 
            normalizedData = normalizedFormatter.convertToNormalized(d, normalizedData, currentDatumIndex);
            currentDatumIndex++;
        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
             console.log(normalizedData);

        //  makeAdjustments(normalizedData);   

            nestedData = nestedFormatter.convertToNested(normalizedData); 
            console.log(nestedData);

            main(nestedData);

            return nestedData;
        });

    //return tree;
    //this happens BEFORE everything in the callback!!
}

var tree = parseCSV();

