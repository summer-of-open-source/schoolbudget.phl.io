/***********************************************/
/************ Budgetary Adjustments ************/
/***********************************************/


/*******  Adjustment Variables  *********/

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
                    new Query("F21001", "F49021", "F49026", "", "code")];// Management & Budget Office function
//distribute to: everything with FUNCTION F49026

var miscAdjust6 = [ new Query("F21005", "F31999", "F41073", "2519", "code"), // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
                    new Query("F21001", "F49021", "F49026", "", "code")];// Management & Budget Office function
//distribute to: everything with FUNCTION F49026

var gapClosingAmounts = [   new Query("F21004", "F31362", "F49992", "114A", "code"), // Budget Reductions - Instructional & Instructional Support
                            new Query("F21004", "F31362", "F49995", "114C", "code"), // Budget Reductions - Operating Support
                            new Query("F21004", "F31362", "F49994", "114E", "code"), // Budget Reductions - Administration
                            new Query("F21004", "F31362", "F49991", "114B", "code"), // Budget Reductions - Pupil & Family Support
                            new Query("F21005", "F31999", "F41073", "5999", "code"), // Undistributed Budgetary Adjustments - Other
                            new Query("F21005", "F31999", "F41073", "5221", "code"), // Undistributed Budgetary Adjustments - Other
                            new Query("F21005", "F31999", "F41073", "5130", "code"), // Undistributed Budgetary Adjustments - Other
                            new Query("F21005", "F31999", "F41073", "2817", "code")  // Undistributed Budgetary Adjustments - Other
                        ];

var gapDistributionSchools = [  {"query": new Query("F21003", "F31330", "", "", "code")},  // District Operated Schools - Instructional
                                {"query": new Query("F21003", "F31350", "", "", "code")}, // District Operated Schools - Instructional Support
                                {"query": new Query("F21003", "F31620", "", "", "code"), "excludes": new Exclusion("code", "F41038", 2) }, // District Operated Schools - Operational Support
                                {"query": new Query("F21003", "F31360", "", "", "code")} // District Operated Schools - Pupil - Family Support
                            ];

var gapDistributionAdministrative = new Query("F21001", "", "", "", "code"); // Administrative Support Operations




// this method removes lines matching the supplied conditions and returns their totals
// query object represents lines to extract.  May have empty values at properties 0 - 3 and below
// if, for example, the value at index 2 is blank, all nested elements with that value will be totaled and removed
function extractLines(root, queries){
    var currentGrantTotals = 0, currentOperatingTotals = 0, currentTotals = 0, currentOtherTotals = 0, currentCapitalTotals = 0;
    var nextGrantTotals = 0, nextOperatingTotals = 0, nextTotals = 0, nextOtherTotals = 0, nextCapitalTotals = 0;
    var path, datum; 

    if (!Array.isArray(queries)){//makes it possible to pass queries as an array, or if there's only one, as a single arg
        queries = [queries]
    }

    queries.forEach(function(query, index, array){ //first pass - collecting totals
        datum = findDatum(root, query);

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
    
    queries.forEach(function(query, index, array){ //second pass - removing properties
        try{//because node may've been deleted already
            path = findPath(root, query);
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

// this method proportionally distributes amounts among lines matching the supplied conditions
//amounts = result of extractLines     toDistribute = Query     exclusions = [Exclusion]
function distributeAmounts(root, amounts, toDistribute, exclusions){
    // var amounts = extractLines(root, toRemove); 
    var keys = Object.keys(amounts); //contains keys (curr_total, next_grant, etc)  use key.slice(5) to access matching property in datum
    exclusions = exclusions || [];
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
            if(totals[key] !== 0){//condition from import.php (I think...)
                proportion = datum[midKey][3][key.slice(5)] / totals[key];
            }
            else
                proportion = defaultProportion;

            //assigns datum property to new value
            datum[midKey][3][key.slice(5)] = (amounts[key] * proportion).toFixed(2);//rounds to 2 decimal places
            //also adds it to newTotals(remnant from import.php) 
            newTotals[key] = datum[midKey][3][key.slice(5)];
        });

        datum.update(); //applies changes to the actual element on the tree
   });   

}


function closeGap(root, amounts, gapDistributionSchools, gapDistributionAdministrative){
    var sdpRatios = {"curr": 0.95183129854, "next": 0.95441584049}, ratio;

    var gapClosingAmountsSchools = {};
    var gapClosingAmountsAdministrative = {};

    for (key in amounts){
        ratio = sdpRatios[key.slice(4)]//copies the "curr" or "next" from the key, setting appropriate ratio
        
        gapClosingAmountsSchools[key] = (amounts[key] * ratio).toFixed(2);
        gapClosingAmountsAdministrative[key] =  amounts[key] - gapClosingAmountsSchools[key];
    }


    distributeAmounts(root, gapClosingAmountsSchools, gapDistributionSchools);
    distributeAmounts(root, gapClosingAmountsAdministrative, gapDistributionAdministrative);
}


function makeAdjustments(root){

//Gap Closing Amounts


    closeGap(root, extractLines(root, gapClosingAmounts), gapDistributionSchools, gapDistributionAdministrative);


//Miscellaneous adjustments

    distributeAmounts(root, extractLines(root, miscAdjust1[0]), miscAdjust1[1], miscAdjust1[2]);

    distributeAmounts(root, extractLines(root, miscAdjust2[0]), miscAdjust2[1], miscAdjust2[2]);

    distributeAmounts(root, extractLines(root, miscAdjust3[0]), miscAdjust3[1]);

    distributeAmounts(root, extractLines(root, miscAdjust4[0]), miscAdjust4[1]);

    distributeAmounts(root, extractLines(root, miscAdjust5[0]), miscAdjust5[1]);

    distributeAmounts(root, extractLines(root, miscAdjust6[0]), miscAdjust6[1]);
}

