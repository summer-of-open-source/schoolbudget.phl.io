/***********************************************/
/************ Budgetary Adjustments ************/
/***********************************************/


// this method proportionally distributes amounts among lines matching the supplied conditions
//toRemove = Query     toDistribute = Query     exclusions = [Exclusion]
function distributeAmounts(root, toRemove, toDistribute, exclusions){
    var amounts = extractLines(root, toRemove); 
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


/*******  Adjustment Variables  *********/

//note: 
//first element = element to be totaled & replaced
//second element = elements which will receive distributed total
//third+ element = exclusions that apply to second element

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


function makeAdjustments(root){

//Gap Closing Amounts


//Miscellaneous adjustments

    distributeAmounts(root, miscAdjust1[0], miscAdjust1[1], miscAdjust1[2]);

    distributeAmounts(root, miscAdjust2[0], miscAdjust2[1], miscAdjust2[2]);

    distributeAmounts(root, miscAdjust3[0], miscAdjust3[1]);

    distributeAmounts(root, miscAdjust4[0], miscAdjust4[1]);

    distributeAmounts(root, miscAdjust5[0], miscAdjust5[1]);

    distributeAmounts(root, miscAdjust6[0], miscAdjust6[1]);
}

