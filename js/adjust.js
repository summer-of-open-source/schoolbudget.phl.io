/******** adjust.js *********/


var adjuster = {

    //datums whose values will be removed and distributed to gapDistribution datums

    gapClosingAmountFuncs:[  
                        function(d){ // Budget Reductions - Instructional & Instructional Support
                            return (d["Function"] === "F49992" && d["ActivityCode"] === "114A");
                        },  
                         function(d){ // Budget Reductions - Operating Support
                            return (d["Function"] === "F49995" && d["ActivityCode"] === "114C");
                        }, 
                         function(d){ // Budget Reductions - Administration
                            return (d["Function"] === "F49994" && d["ActivityCode"] === "114E");
                        },
                         function(d){ // Budget Reductions - Pupil & Family Support
                            return (d["Function"] === "F49991" && d["ActivityCode"] === "114B");
                        }, 
                         function(d){ // Undistributed Budgetary Adjustments - Other
                            return (d["Function"] === "F41073" && d["ActivityCode"] === "5999");
                         },
                         function(d){ // Undistributed Budgetary Adjustments - Other
                            return (d["Function"] === "F41073" && d["ActivityCode"] === "5221");
                         },
                         function(d){ // Undistributed Budgetary Adjustments - Other
                            return (d["Function"] === "F41073" && d["ActivityCode"] === "5130");
                         },
                         function(d){ // Undistributed Budgetary Adjustments - Other
                            return (d["Function"] === "F41073" && d["ActivityCode"] === "2817");
                         }
   ],


    //the datums that will receive the distributed data from gapCosingAmounts 
    gapDistributionSchools:[
                         function(d){ // District Operated Schools - Instructional
                                return (d["FunctionGroup"] === "F31330");
                         },   
                         function(d){// District Operated Schools - Instructional Support
                                return (d["FunctionGroup"] === "F31350");
                         },
                         function(d){ // District Operated Schools - Operational Support
                                return (d["FunctionGroup"] === "F31620" && d["Function"] !== "F41038");
                         },
                         function(d){ // District Operated Schools - Pupil - Family Support
                                return (d["FunctionGroup"] === "F31360");
                         }],

    gapDistributionAdministrative:[
                         function(d){ //distribute to all datums with a FunctionClass of F21001
                                return (d["FunctionClass"] === "F21001");
                         }],


    // misc distributions

    miscDistribution1: {
        extract: function(d){ // Food Service > Allocated Costs
            return (d["Function"] === "F49000" && d["ActivityCode"] === "5221");
        },
        distribute: function(d){ // Operating Support group, except Transportation -- Regular Services > Allocated Costs and Debt Service
            return (d["FunctionGroup"] != "F31620"  &&  (d["Function"] != "F41071" || d["ActivityCode"] != "5221") && d["Function"] != "F41038");
        }
    },
               

    miscDistribution2: {
        extract: function(d){ // Transportation -- Regular Services > Allocated Costs
            return (d["Function"] === "F41071" && d["ActivityCode"] === "5221");
        },
        distribute: function(d){ // Transportation -- Regular Services, except Allocated Costs
            return (d["Function"] === "F49027");
        }
    },


    miscDistribution3: {
        extract: function(d){ // Undistributed Budgetary Adjustments - Other > ACCOUNTING SERVICES
            return (d["Function"] === "F41073" && d["ActivityCode"] === "2515");
        },
        distribute: function(d){ // Accounting & Audit Coordination
            return (d["Function"] === "F49027");
        }
    },

    miscDistribution4: {
        extract: function(d){ // Undistributed Budgetary Adjustments - Other > CITY CONTROLLER
            return (d["Function"] === "F41073" && d["ActivityCode"] === "2520");
        },
        distribute: function(d){ // Financial Services Function
            return (d["Function"] === "F41099");
        }
    },

    miscDistribution5: {
        extract: function(d){ // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
            return (d["Function"] === "F41073" && d["ActivityCode"] === "2512");
        },
        distribute: function(d){ // Management & Budget Office function
            return (d["Function"] === "F49026");
        }
    },

    miscDistribution6: {
        extract: function(d){ // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
            return (d["Function"] === "F41073" && d["ActivityCode"] === "2519");
        },
        distribute: function(d){ // Management & Budget Office function
            return (d["Function"] === "F49026");
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
        
        if (!Array.isArray(queries)){ //makes it possible to pass queries as an array, or if there's only one, as a single argument
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

                    //remove data item
                    normalizedData.splice(index, 1);
                    index--;
                }
            });
        });

        //note to self: the original php code had a 2-pass system going on... why is that?

        return totals;
    },


    //returns a function that uses a custom anonymous func 
    //allows for handling of more complex 
    getCompareFunc: function(comparator){
        return function(d){
            return comparator(d);
        }
    },

    // proportionally distributes amounts among lines matching the supplied conditions
    // passes through totals array twice, once to sum totals, a second time to create the adjusted amount
    distributeAmounts: function(extractedAmounts, distributionAmounts){
        var proportion, defaultProportion = 1 / distributionAmounts.length;
        var totals = {}, adjustedTotals = {};

        //first pass through distributionAmounts.  sum existing totals.
        extractedAmounts.forEach(function(amount, index, amounts){
            amount.forEach(function(value, key){
                if (totals[key])
                    totals[key] += value;
                else
                    totals[key] = value;
            });
        });

        //second pass.  Apply adjustments.  
        distributionAmounts.forEach(function(distAmount, index, array){
            totals.forEach(function(total, key){
                //sets appropriate proportion
                if(totals[key] !== 0){//condition from import.php (I think...)
                    proportion = distAmount[key] / total;
                }
                else{
                    proportion = defaultProportion;
                }

                distAmount[key] += (extractedAmounts[key] * proportion).toFixed(2);//rounds to 2 decimal places
                adjustedTotals[key] += distAmount[key];
            });
        });

        console.log(adjustedTotals.toString());

    },

    //totals is from extractLines
    closeGap: function(totals){
        var sdpRatios = {"Curr": 0.95183129854, "Prop": 0.95441584049}, ratio;

        var gapClosingAmountsSchools = {};
        var gapClosingAmountsAdministrative = {};

        for (key in totals){
            ratio = sdpRatios[key.slice(4)]//copies the "curr" or "next" from the key, setting appropriate ratio
        
            gapClosingAmountsSchools[key] = (amounts[key] * ratio).toFixed(2);
            gapClosingAmountsAdministrative[key] =  amounts[key] - gapClosingAmountsSchools[key];
        }

        distributeAmounts(root, gapClosingAmountsSchools, gapDistributionSchools);
        distributeAmounts(root, gapClosingAmountsAdministrative, gapDistributionAdministrative);

    },

    makeAdjustments: function(root){
        // gapClosingAmounts
        //this.distributeAmounts(this.extractLines(root, this.gapClosingAmountFuncs), gapDistributionAdministrative);

        //misc adjustments
        // this.distributeAmounts(this.extractLines(root, this.miscDistribution1.extract), this.miscDistribution1.distribute); //not gonna work.  distribute prop is a func, not an array
        this.extractLines(root, this.miscDistribution1.extract);
        this.extractLines(root, this.miscDistribution2.extract);
        this.extractLines(root, this.miscDistribution3.extract);
        this.extractLines(root, this.miscDistribution4.extract);
        this.extractLines(root, this.miscDistribution5.extract);
        this.extractLines(root, this.miscDistribution6.extract);
    }

};




