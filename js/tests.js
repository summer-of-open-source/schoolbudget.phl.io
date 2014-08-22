
// // for testing findPath and extractLines
// var miscCodes = [   new PathQuery("F21003", "F31620", "F49000", "5221", "code"), 
//                     new PathQuery("F21003", "F31620", "F41071", "5221", "code"), 
//                     new PathQuery("F21005", "F31999", "F41073", "2515", "code"), 
//                     new PathQuery("F21005", "F31999", "F41073", "2520", "code"), 
//                     new PathQuery("F21005", "F31999", "F41073", "2512", "code"), 
//                     new PathQuery("F21005", "F31999", "F41073", "2519", "code") 
//                 ];

//for Testing searchTree 
// var searchCodes = [ new SearchQuery("F21001", "F49021", "F49027", "", "code"),
//                     new SearchQuery("F21001" , "F49015", "", "", "code"),
//                     new SearchQuery("F21001" , "", "", "", "code"),             
//                     new SearchQuery("" , "", "", "", "code"), //should return paths of every element in tree
//                     new SearchQuery("F21003", "F31620", "F41071", "", "code", [new Exclusion("name", "School Budgets including Non-District Operated Schools", 0)]),
//                     new SearchQuery("F21003", "F31620", "F41071", "", "code", [new Exclusion("code", "2725", 3), new Exclusion("code", "2746", 3)]), 
//                     new SearchQuery("F21003", "F31620", "" , "", "code", [new Exclusion("code", "F41071", 2), new Exclusion("code", "5221", 3)])
//                 ];

// for testing findPath and extractLines
var miscCodes = [   new Query("F21003", "F31620", "F49000", "5221", "code"), 
                    new Query("F21003", "F31620", "F41071", "5221", "code"), 
                    new Query("F21005", "F31999", "F41073", "2515", "code"), 
                    new Query("F21005", "F31999", "F41073", "2520", "code"), 
                    new Query("F21005", "F31999", "F41073", "2512", "code"), 
                    new Query("F21005", "F31999", "F41073", "2519", "code") 
                ];

// for testing searchTree and Query
var searchCodes = [ {"query": new Query("F21001", "F49021", "F49027", "", "code")},
                    {"query": new Query("F21001" , "F49015", "", "", "code")},
                    {"query": new Query("F21001" , "", "", "", "code")},
                    {"query": new Query("" , "", "", "", "code")}, //should return paths of every element in tree
                    {"query": new Query("F21003", "F31620", "F41071", "", "code"), "ex1": new Exclusion("name", "School Budgets including Non-District Operated Schools", 0)},
                    {"query": new Query("F21003", "F31620", "F41071", "", "code"), "ex1": new Exclusion("code", "2725", 3), "ex2":new Exclusion("code", "2746", 3)}, //should return empty array
                    {"query": new Query("F21003", "F31620", "" , "", "code"), "ex1": new Exclusion("code", "F41071", 2), "ex2":new Exclusion("code", "5221", 3)}
                ];


//needs to be converted to pathQuery objects
var gapClosingAmounts = [{  "FUNCTION" : "F49992", "ACTIVITY_CODE" : "114A"    }, // Budget Reductions - Instructional & Instructional Support
                         {  "FUNCTION" : "F49995", "ACTIVITY_CODE" : "114C"    }, // Budget Reductions - Operating Support
                         {  "FUNCTION" : "F49994", "ACTIVITY_CODE" : "114E"    }, // Budget Reductions - Administration
                         {  "FUNCTION" : "F49991", "ACTIVITY_CODE" : "114B"    }, // Budget Reductions - Pupil & Family Support
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5999"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5221"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "5130"    }, // Undistributed Budgetary Adjustments - Other
                         {  "FUNCTION" : "F41073", "ACTIVITY_CODE" : "2817"    }]; // Undistributed Budgetary Adjustments - Other

//for debugging adjustments
function runTests(){
     // console.log("**** findPath Tests ****");
     // for (var i = 0; i < miscCodes.length; i++){
     //  console.log(findPath(tree, miscCodes[i]));
     // }

     console.log("**** extractLines Test ****");
     console.log(extractLines(tree, miscCodes));

     // console.log("***** Datum object tests ******")
     // var datums = [  new Datum(0, 2, 3, 7, ["code", "name"], tree),
     //              new Datum(3, 0, 0, 3, ["code", "name", "depth"], tree), 
     //              new Datum(3, 0, 0, 0, ["code", "name"], tree)
     // ];
     // console.log(datums);

     //test searchTree     
     // searchCodes.forEach(function(value, index, array){
     //      if (Object.keys(value).length === 1) //no exclusions
     //           console.log(searchTree(tree, value["query"]));
     //      else if (Object.keys(value).length === 2) //1 exclusion
     //           console.log(searchTree(tree, value["query"], value["ex1"]));
     //      else if (Object.keys(value).length === 3) //2 exclusions
     //           console.log(searchTree(tree, value["query"], value["ex1"], value["ex2"]));
     // });

}



