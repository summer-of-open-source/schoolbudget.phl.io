/******** adjust.js *********/


var adjuster = {

    //datums whose values will be removed and distributed to gapDistribution datums

    gapClosingAmounts:[  this.getCompareFunc(function(d){ // Budget Reductions - Instructional & Instructional Support
                            return (d["Function"] === "F49992" && d["ActivityCode"] === "114A");
                        }),  
                         this.getCompareFunc(function(d){ // Budget Reductions - Operating Support
                            return (d["Function"] === "F49995" && d["ActivityCode"] === "114C");
                        }), 
                         this.getCompareFunc(function(d){ // Budget Reductions - Administration
                            return (d["Function"] === "F49994" && d["ActivityCode"] === "114E");
                        }),
                         this.getCompareFunc(function(d){ // Budget Reductions - Pupil & Family Support
                            return (d["Function"] === "F49991" && d["ActivityCode"] === "114B");
                        }), 
                         this.getCompareFunc(function(d){ // Undistributed Budgetary Adjustments - Other
                            return (d["Function"] === "F41073" && d["ActivityCode"] === "5999");
                         }),
                         this.getCompareFunc(function(d){ // Undistributed Budgetary Adjustments - Other
                            return (d["Function"] === "F41073" && d["ActivityCode"] === "5221");
                         }),
                         this.getCompareFunc(function(d){ // Undistributed Budgetary Adjustments - Other
                            return (d["Function"] === "F41073" && d["ActivityCode"] === "5130");
                         }),
                         this.getCompareFunc(function(d){ // Undistributed Budgetary Adjustments - Other
                            return (d["Function"] === "F41073" && d["ActivityCode"] === "2817");
                         })
   ],


    //the datums that will receive the distributed data from gapCosingAmounts 
    gapDistributionSchools:[
                         this.getCompareFunc(function(d){ // District Operated Schools - Instructional
                                return (d["FunctionGroup"] === "F31330");
                         }),   
                         this.getCompareFunc(function(d){// District Operated Schools - Instructional Support
                                return (d["FunctionGroup"] === "F31350");
                         }),
                         this.getCompareFunc(function(d){ // District Operated Schools - Operational Support
                                return (d["FunctionGroup"] === "F31620" && d["Function"] !== "F41038");
                         }),
                         this.getCompareFunc(function(d){ // District Operated Schools - Pupil - Family Support
                                return (d["FunctionGroup"] === "F31360");
                         })],

    gapDistributionAdministrative:[
                         this.getCompareFunc(function(d){ //distribute to all datums with a FunctionClass of F21001
                                return (d["FunctionClass"] === "F21001");
                         })], 


    // misc distributions

    miscDistribution1: {
        extract: this.getCompareFunc(function(d){ // Food Service > Allocated Costs
            return (d["Function"] === "F49000" && d["ActivityCode"] === "5221");
        }),
        distribute: this.getCompareFunc(function(d){ // Operating Support group, except Transportation -- Regular Services > Allocated Costs and Debt Service
            return (d["FunctionGroup"] != "F31620"  &&  (d["Function"] != "F41071" || d["ActivityCode"] != "5221") && d["Function"] != "F41038");
        })
    },
               

    miscDistribution2: {
        extract: this.getCompareFunc(function(d){ // Transportation -- Regular Services > Allocated Costs
            return (d["Function"] === "F41071" && d["ActivityCode"] === "5221");
        }),
        distribute: this.getCompareFunc(function(d){ // Transportation -- Regular Services, except Allocated Costs
            return (d["Function"] === "F49027");
        })
    },


    miscDistribution3: {
        extract: this.getCompareFunc(function(d){ // Undistributed Budgetary Adjustments - Other > ACCOUNTING SERVICES
            return (d["Function"] === "F41073" && d["ActivityCode"] === "2515");
        }),
        distribute: this.getCompareFunc(function(d){ // Accounting & Audit Coordination
            return (d["Function"] === "F49027");
        })
    },

    miscDistribution4: {
        extract: this.getCompareFunc(function(d){ // Undistributed Budgetary Adjustments - Other > CITY CONTROLLER
            return (d["Function"] === "F41073" && d["ActivityCode"] === "2520");
        }),
        distribute: this.getCompareFunc(function(d){ // Financial Services Function
            return (d["Function"] === "F41099");
        })
    },

    miscDistribution5: {
        extract: this.getCompareFunc(function(d){ // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
            return (d["Function"] === "F41073" && d["ActivityCode"] === "2512");
        }),
        distribute: this.getCompareFunc(function(d){ // Management & Budget Office function
            return (d["Function"] === "F49026");
        })
    },

    miscDistribution6: {
        extract: this.getCompareFunc(function(d){ // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
            return (d["Function"] === "F41073" && d["ActivityCode"] === "2519");
        }),
        distribute: this.getCompareFunc(function(d){ // Management & Budget Office function
            return (d["Function"] === "F49026");
        })
    },

    //returns a function that uses a custom anonymous func 
    //allows for handling of more complex 
    getCompareFunc: function(comparator){
        return function(d){
            return comparator(d);
        }
    },

    extractLines: function(normalizedData, queries){
        var totals = {  "CurrentCapital": 0, 
                        "CurrentOperating": 0, 
                        "CurrentGrant": 0, 
                        "CurrentOther": 0,
                        "CurrentTotal": 0,
                        "ProposedCapital": 0,
                        "ProposedOperating": 0,
                        "ProposedGrant": 0,
                        "ProposedOther": 0,
                        "ProposedTotal": 0
            };
        
        if (!Array.isArray(queries)){ //makes it possible to pass queries as an array, or if there's only one, as a single arg
            queries = [queries];
        }

        //first pass - collecting totals
        queries.forEach(function(query, index, array){     //iterate each query in the list
            normalizedData.forEach(function(d, index, array){   //iterate each element in the normalizedData and compare using the query func.  
                //if Query func returns true, add datum's totals to running totals
                if (query(d)){
                    totals.CurrentCapital += d["CurrentCapital"];
                    totals.CurrentOther += d["CurrentOther"];
                    totals.CurrentGrant += d["CurrentGrant"];
                    totals.CurrentOperating += d["CurrentOperating"];
                    totals.CurrentTotal += d["CurrentTotal"];

                    totals.ProposedCapital += d["ProposedCapital"];
                    totals.ProposedOther += d["ProposedOther"];
                    totals.ProposedGrant += d["ProposedGrant"];
                    totals.ProposedOperating += d["ProposedOperating"];
                    totals.ProposedTotal += d["ProposedTotal"];

                    normalizedData.splice(index, 1);
                    index--;
                }
            });
        });

        // queries.forEach(function(query, index, array){ //second pass - removing properties
        //     normalizedData.forEach(function(d, index, array){ 
        //         try{//because node may've been deleted already
        //             if()
        //             //have to use long path because we're actually editing the tree here
        //             root["children"][path[0]]["children"][path[1]]["children"][path[2]]["children"].splice(path[3], 1);
        //         }
        //         catch(e){
        //             console.log("caught");
        //         }
        //     });
        // });

        return totals;
    },

    // proportionally distributes amounts among lines matching the supplied conditions
    distributeAmounts: function(){

    },

    makeAdjustments: function(root){
    }

};




