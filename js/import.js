
/***********************************************/
/************ Budgetary Adjustments ************/
/***********************************************/

// extract gap closing cuts and undistributed budgetary adjustments
// extractLines returns array of their totals
// $gapClosingAmounts = $extractLines([
//     ['Function' => 'F49992', 'ActivityCode' => '114A']  // Budget Reductions - Instructional & Instructional Support
//     ,['Function' => 'F49995', 'ActivityCode' => '114C'] // Budget Reductions - Operating Support
//     ,['Function' => 'F49994', 'ActivityCode' => '114E'] // Budget Reductions - Administration
//     ,['Function' => 'F49991', 'ActivityCode' => '114B'] // Budget Reductions - Pupil & Family Support
//     ,['Function' => 'F41073', 'ActivityCode' => '5999'] // Undistributed Budgetary Adjustments - Other
//     ,['Function' => 'F41073', 'ActivityCode' => '5221'] // Undistributed Budgetary Adjustments - Other
//     ,['Function' => 'F41073', 'ActivityCode' => '5130'] // Undistributed Budgetary Adjustments - Other
//     ,['Function' => 'F41073', 'ActivityCode' => '2817'] // Undistributed Budgetary Adjustments - Other
// ]);

//note: activity code only actually shows in the document once...  do I even need the Function?
var gapClosingAmounts = [{  "FUNCTION" : "F49992", "ACTIVITY_CODE" : "114A"    }, // Budget Reductions - Instructional & Instructional Support
                         {  "FUNCTION" : "F49995", "ACTIVITY_CODE" : "114C"    }, // Budget Reductions - Operating Support
                         {  "FUNCTION" : "F49994", "ACTIVITY_CODE" : "114E"    }, // Budget Reductions - Administration
                         {  "FUNCTION" : "F49991", "ACTIVITY_CODE" : "114B"    }, // Budget Reductions - Pupil & Family Support
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5999"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5221"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5130"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "2817"    }]; // Undistributed Budgetary Adjustments - Other


// split up gap closing / undistributed budgetary adjustments for 
// District Operated Schools and Administrative budget lines by SDP-estimated ratios


// split up gap closing / undistributed budgetary adjustments for District Operated Schools and Administrative budget lines by SDP-estimated ratios
// $gapClosingAmountsSchools = array();
// $gapClosingAmountsAdministrative = array();

// foreach ($gapClosingAmounts AS $column => $amount) {
//     if (in_array($column, $valueColumnsCurrent)) {
//         $gapClosingAmountsSchools[$column] = round($amount * 0.95183129854, 2); // 95.18% distribution of FY14 funds to schools
//         $gapClosingAmountsAdministrative[$column] = $amount - $gapClosingAmountsSchools[$column];
//     } elseif (in_array($column, $valueColumnsProposed)) {
//         $gapClosingAmountsSchools[$column] = round($amount * 0.95441584049, 2); // 95.18% distribution of FY15 funds to schools
//         $gapClosingAmountsAdministrative[$column] = $amount - $gapClosingAmountsSchools[$column];
//     } else {
//         throw new Exception('Unexpected column');
//     }
// }

// // distribute split amounts
// $distributeAmounts($gapClosingAmountsSchools, [
//     ['FunctionGroup' => 'F31330']   // District Operated Schools - Instructional
//     ,['FunctionGroup' => 'F31350']  // District Operated Schools - Instructional Support
//     ,['FunctionGroup' => 'F31620', 'Function != "F41038"']  // District Operated Schools - Operational Support
//     ,['FunctionGroup' => 'F31360']  // District Operated Schools - Pupil - Family Support
// ]);

// $distributeAmounts($gapClosingAmountsAdministrative, [
//     ['FunctionClass' => 'F21001'] // Administrative Support Operations
// ]);










//*********** Misc adjustments *****************/


// $distributeAmounts(
//     $extractLines(['Function' => 'F49000', 'ActivityCode' => '5221']) // Food Service > Allocated Costs
//     ,['FunctionGroup' => 'F31620', '(Function != "F41071" OR ActivityCode != "5221")', 'Function != "F41038"'] // Operating Support group, except Transportation -- Regular Services > Allocated Costs and Debt Service
// );

//line 211 import.php
    //remove and total  
        // Food Service > Allocated Costs
        // key3 ACTIVITY_CODE 5221
        // key2 FUNCTION F49000 Food Service
    //distribute total to 
        // Operating Support group, except Transportation -- Regular Services > Allocated Costs and Debt Service
        // key1 FUNCTION_GROUP F31620
        // NOT key2 FUNCTION F41071 
        // NOT key3 ACTIVITY_CODE 5221
        // NOT key2 FUNCTION F41038
//remove
// [{ "FUNCTION" : "F49000", "ACTIVITY_CODE" : "5221"}]

//distribute



/**************************************************************************/


// $distributeAmounts(
//     $extractLines(['Function' => 'F41071', 'ActivityCode' => '5221']) // Transportation -- Regular Services > Allocated Costs
//     ,['Function' => 'F41071', 'ActivityCode != "5221"'] // Transportation -- Regular Services, except Allocated Costs
// );

//line 216 import.php
    //remove and total 
        // Transportation -- Regular Services > Allocated Costs
        // key2 FUNCTION F41071
        // key3 ACTIVITY_CODE 5221
    //distribute total to  
        // Transportation -- Regular Services, except Allocated Costs
        // key2 FUNCTION F41071
        // key3 ACTIVITY_CODE 5221

/**************************************************************************/

// $distributeAmounts(
//     $extractLines(['Function' => 'F41073', 'ActivityCode' => '2515']) // Undistributed Budgetary Adjustments - Other > ACCOUNTING SERVICES
//     ,['Function' => 'F49027'] // Accounting & Audit Coordination
// );

//line 221 import.php
    //remove and total 
        // Undistributed Budgetary Adjustments - Other > ACCOUNTING SERVICES
        // key2 FUNCTION F41073
        // key3 ACTIVITY_CODE 2515
    //distribute total to  
        // Accounting & Audit Coordination
        // key2 FUNCTION F49027

/**************************************************************************/


// $distributeAmounts(
//     $extractLines(['Function' => 'F41073', 'ActivityCode' => '2520']) // Undistributed Budgetary Adjustments - Other > CITY CONTROLLER
//     ,['Function' => 'F41099'] // Financial Services Function
// );

//line 226 import.php
    //remove and total 
        // Undistributed Budgetary Adjustments - Other > CITY CONTROLLER
        // key2 FUNCTION F41073
        // key3 ACTIVITY_CODE 2520
    //distribute total to  
        // Financial Services Function
        // key2 FUNCTION F41099


/**************************************************************************/

// $distributeAmounts(
//     $extractLines(['Function' => 'F41073', 'ActivityCode' => '2512']) // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
//     ,['Function' => 'F49026'] // Management & Budget Office function
// );

//line 231 import.php
    //remove and total 
        // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
        // key2 FUNCTION F41073
        // key3 ACTIVITY_CODE 2512
    //distribute total to  
        // Management & Budget Office function
        // key2 FUNCTION F49026


/**************************************************************************/

// $distributeAmounts(
//     $extractLines(['Function' => 'F41073', 'ActivityCode' => '2519']) // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
//     ,['Function' => 'F49026'] // Management & Budget Office function
// );

//line 236 import.php
    //remove and total 
        // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
        // key2 FUNCTION F41073
        // key3 ACTIVITY_CODE 2519
    //distribute total to  
        // Management & Budget Office function
        // key2 FUNCTION F49026


/**************************************************************************/
/**************************************************************************/


/************ Nested CSV Formatter ************/

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

//main function.  parses/formats csv file.  
//calls function main as a callback after data is formatted
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
        //accessor.  Controls how data is structured as it's pulled in
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

        },
        //callback.  Actions to take after csv file has been fully parsed
        function(dataArray) {
            convertChildren(tree, null, null);
            main(tree); //calling main here to ensure data will be assembled when it runs
        });

    console.log("********  NESTED TREE  *******");
    console.log(tree);
    return tree;
}

parseNestedCSV();


