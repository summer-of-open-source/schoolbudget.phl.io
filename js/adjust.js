/**************  php  **************/

        // extract gap closing cuts and undistributed budgetary adjustments
    $gapClosingAmounts = $extractLines([
        ['Function' => 'F49992', 'ActivityCode' => '114A']  // Budget Reductions - Instructional & Instructional Support
        ,['Function' => 'F49995', 'ActivityCode' => '114C'] // Budget Reductions - Operating Support
        ,['Function' => 'F49994', 'ActivityCode' => '114E'] // Budget Reductions - Administration
        ,['Function' => 'F49991', 'ActivityCode' => '114B'] // Budget Reductions - Pupil & Family Support
        ,['Function' => 'F41073', 'ActivityCode' => '5999'] // Undistributed Budgetary Adjustments - Other
        ,['Function' => 'F41073', 'ActivityCode' => '5221'] // Undistributed Budgetary Adjustments - Other
        ,['Function' => 'F41073', 'ActivityCode' => '5130'] // Undistributed Budgetary Adjustments - Other
        ,['Function' => 'F41073', 'ActivityCode' => '2817'] // Undistributed Budgetary Adjustments - Other
    ]);


        // distribute split amounts
    $distributeAmounts($gapClosingAmountsSchools, [
        ['FunctionGroup' => 'F31330']   // District Operated Schools - Instructional
        ,['FunctionGroup' => 'F31350']  // District Operated Schools - Instructional Support
        ,['FunctionGroup' => 'F31620', 'Function != "F41038"']  // District Operated Schools - Operational Support
        ,['FunctionGroup' => 'F31360']  // District Operated Schools - Pupil - Family Support
    ]);

    $distributeAmounts($gapClosingAmountsAdministrative, [
        ['FunctionClass' => 'F21001'] // Administrative Support Operations
    ]);




    // misc distributions
    $distributeAmounts(
        $extractLines(['Function' => 'F49000', 'ActivityCode' => '5221']) // Food Service > Allocated Costs
        ,['FunctionGroup' => 'F31620', '(Function != "F41071" OR ActivityCode != "5221")', 'Function != "F41038"'] // Operating Support group, except Transportation -- Regular Services > Allocated Costs and Debt Service
    );

    $distributeAmounts(
        $extractLines(['Function' => 'F41071', 'ActivityCode' => '5221']) // Transportation -- Regular Services > Allocated Costs
        ,['Function' => 'F41071', 'ActivityCode != "5221"'] // Transportation -- Regular Services, except Allocated Costs
    );

    $distributeAmounts(
        $extractLines(['Function' => 'F41073', 'ActivityCode' => '2515']) // Undistributed Budgetary Adjustments - Other > ACCOUNTING SERVICES
        ,['Function' => 'F49027'] // Accounting & Audit Coordination
    );

    $distributeAmounts(
        $extractLines(['Function' => 'F41073', 'ActivityCode' => '2520']) // Undistributed Budgetary Adjustments - Other > CITY CONTROLLER
        ,['Function' => 'F41099'] // Financial Services Function
    );

    $distributeAmounts(
        $extractLines(['Function' => 'F41073', 'ActivityCode' => '2512']) // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
        ,['Function' => 'F49026'] // Management & Budget Office function
    );

    $distributeAmounts(
        $extractLines(['Function' => 'F41073', 'ActivityCode' => '2519']) // Undistributed Budgetary Adjustments - Other > OFFICE OF MANAGEMENT & BUDGET
        ,['Function' => 'F49026'] // Management & Budget Office function
    );

/******** adjust.js *********/


var adjuster = {

    makeAdjustments = function(root){

        //Gap Closing Amounts

        var testAmounts = extractLines(root, gapQueries);
        closeGap(root, testAmounts, gapDistributionSchools, gapDistributionAdministrative);

        //Miscellaneous adjustments

        distributeAmounts(root, extractLines(root, miscAdjust1[0]), miscAdjust1[1], miscAdjust1[2]);

        distributeAmounts(root, extractLines(root, miscAdjust2[0]), miscAdjust2[1], miscAdjust2[2]);

        distributeAmounts(root, extractLines(root, miscAdjust3[0]), miscAdjust3[1]);

        distributeAmounts(root, extractLines(root, miscAdjust4[0]), miscAdjust4[1]);

        distributeAmounts(root, extractLines(root, miscAdjust5[0]), miscAdjust5[1]);

        distributeAmounts(root, extractLines(root, miscAdjust6[0]), miscAdjust6[1]);

    },

    // this method removes lines matching the supplied conditions and returns their totals
    // query object represents lines to extract.  May have empty values at properties 0 - 3 and below
    // if, for example, the value at index 2 is blank, all nested elements with that value will be totaled and removed
    extractLines = function(){

    },

    // proportionally distributes amounts among lines matching the supplied conditions
    distributeAmounts = function(){

    }

};









