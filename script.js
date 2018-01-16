"use strict";

$(document).ready(function() {

    var calculation = "";
    var hasComputedAValue = false; // We use this because you can reset the values by pushing a number button after an equal operation
    var isCurNumberFloatingPoint = false; // So that we can't have something like "22.34.5555" which would break the calculator 
    var isComputingSqrt = false;
    /* ---- Custom functons ---- */

    function addToHistory(entry) {
        $("#history").append("<div class=\"h-entry\">" + entry + "</div>");
    }
      
    // Transform the string into a line of code that the JS engine can compute
    function translateCalcToJS() {

        isCurNumberFloatingPoint = false;

        // Translating π into numerical form
        calculation = calculation.replace("π", Math.PI);

        /* Putting factorial in readable form (integers only)
        Not computing factorials here because the only
        intent of this function is to make the input
        readable for the JS engine */
        for (var f = 0; f < calculation.length; f++) {
            if (calculation[f] == "!") {
                let n = f - 1;
                while (!isNaN(calculation[n]) && n >= 0) {
                    n--;
                }

                let factoNum = calculation.substring(n + 1, f);
                let curNum = Number(factoNum) - 1;

                if (factoNum == "0") {
                    factoNum = "1";                    
                } else {
                    while (curNum > 1) {
                        factoNum += "*" + curNum;
                        curNum--;
                    }
                }

                calculation = calculation.substring(0, n + 1)
                + factoNum + calculation.substring(f + 1, calculation.length);
            }
        }

        if (isNaN(calculation[calculation.length - 1]) && calculation[calculation.length - 1] != "!") { // Calculation can't end with an operator
            calculation = calculation.substring(0, calculation.length - 1);
            if (calculation[calculation.length - 1] == "√") {
                calculation = calculation.substring(0, calculation.length - 1);
            }
        }

        calculation = calculation.replace(".(", "(");
        for (var c = 0; c < calculation.length; c++) { // "5√(2) becomes 5*√(2) for ex"
            if ((calculation[c] == "√" || calculation[c] == "(") && !isNaN(calculation[c - 1])) {
                calculation = calculation.substring(0, c)
                + "*" + calculation.substring(c, calculation.length);
            }
        }

        calculation = calculation.replace("√", "Math.sqrt");
        if (isNaN(calculation[calculation.length - 1])) {
            calculation = calculation.substring(0, calculation.length - 1);
        }

        /* Making sure that the number of left and right
        parentheses is the same, to avoid the missing parenthesis error.
        It may not be the ouput that the user originally wanted,
        but if the user forgot to complete the parentheses, 
        then at least something comes out. This allows the use of things like
        "1+√(16 = 5 for example*/
        let leftPar = 0;
        let rightPar = 0;
        for (var l = 0; l < calculation.length; l++) {
            if (calculation[l] == "(") {
                leftPar++;
            } else if (calculation[l] == ")") {
                rightPar++;
            }
        }
        if (leftPar > rightPar) {
            for (var p = 0; p < leftPar - rightPar; p++) {
                calculation += ")";
            }
        } else if (rightPar > leftPar) {
            for (var p = 0; p < leftPar - rightPar; p++) {
                calculation = "(" + calculation;
            }
        }
        
        calculation = calculation.replace("^", "**");

        for (var i = 0; i < calculation.length; i++) { 
            calculation = calculation.replace("()", "");

        }

        if (isNaN(calculation[calculation.length - 1]) 
        && calculation[calculation.length - 1 != ")"]) { // Calculation can't end with an operator
            calculation = calculation.substring(0, calculation.length - 1);
            if (calculation[calculation.length - 1] == "√") {
                calculation = calculation.substring(0, calculation.length - 1);
            }
        }
    
        if (!calculation) {
            calculation = "0";
        }
    }

    function computeResult() {
        /* Even if a lot of work was done on translateCalcToJS,
        the user may STILL make invalid inputs. In that case, 
        the calculator will simply show an error to the user */
        try {
            var result = "" + eval(calculation);
            
            if (isNaN(result) || result == Infinity || result == -Infinity) {
                calculation = "";
                $("#calc-screen").html("Error");
            } else {
                calculation = result;
                $("#calc-screen").html(result);
            }
            
        } catch (error) {
            calculation = "";
            $("#calc-screen").html("Error");
        } 
    }


    /* ---- JQuery Events ---- */


    $(".btn-num").click(function() {
        var btnValue = $(this).html();

        /* We don't want multiple 0s like "00000001 + 1". 
        Multiple zeros break the calculator as the JS engine seems to think 
        it is an octal value.
        */

        if (calculation[calculation.length - 1] == "π") {
            calculation = calculation.substring(0, calculation.length - 1);
        }

        if (calculation[0] == "0") {
            calculation = calculation.substring(1, calculation.length);
            console.log("hey");
            // TOFIX The "0." becomes ".[some number]" while doing the following:
            // 1. Input "." while screen shows 0
            // 2. Input a number

        }
        if ((!calculation || calculation == "0") && btnValue == 0) {
            return;
        }

        if (hasComputedAValue) {
            calculation = btnValue;
            hasComputedAValue = false;
        } else {
            calculation += btnValue;
        }

        $("#calc-screen").html(calculation);
    });


    $("#btn-PI").click(function() {
        if (calculation[calculation.length - 1] == "π") {
            return;
        }

        if (calculation == "" || calculation == "0") {
            calculation = "π";
        } else {
            
            for (var n = calculation.length - 1; n > - 1; n--) {
                if (isNaN(calculation[n])) {
                    if (calculation[n] == ".") {
                        isCurNumberFloatingPoint = false;
                        continue;
                    } else {
                        console.log("donkey");
                        calculation = calculation.substring(0, n + 1)
                        + "π"
                        break;
                    }
                } else if (n == 0) {
                    calculation = "π";
                }
            }
        }
        $("#calc-screen").html(calculation);
    });


    $("#btn-point").click(function() {
        if (!calculation) {
            isCurNumberFloatingPoint = true;
            calculation = "0.";
            $("#calc-screen").html(calculation);
        } else if (!isNaN(calculation[calculation.length - 1]) && !isCurNumberFloatingPoint) {
            isCurNumberFloatingPoint = true;
            calculation += ".";
            $("#calc-screen").html(calculation);
        }
    });


    $(".btn-operator").click(function() { 
        var btnValue = $(this).html();
        var lastChar = calculation[calculation.length -1];

        hasComputedAValue = false;
        isCurNumberFloatingPoint = false;

        // We don't allow operators following other operators
        if (isNaN(lastChar) && lastChar != "." && lastChar != "!" && lastChar != "π") {
            calculation = calculation.slice(0, -1);
        }

        if (isComputingSqrt) {
            calculation += ")";
            isComputingSqrt = false;
        }
        calculation += btnValue;
        calculation = calculation.replace("X^y", "^");
        $("#calc-screen").html(calculation);
    });


    $(".btn-parenthesis").click(function() {
        calculation += $(this).html();
        $("#calc-screen").html(calculation);
    });



    $("#btn-root").click(function() {
        if (calculation[calculation.length - 2] == "√") { return; }

        calculation += "√(";
        isComputingSqrt = true;
        $("#calc-screen").html(calculation);
    });


    $("#btn-facto").click(function() {

        if (!calculation || calculation == "0") {
            calculation = "0!";
            $("#calc-screen").html(calculation);
            return;
        }
        if (isNaN(calculation[calculation.length - 1])) {
            return;
        }

        for (var n = calculation.length - 1; n > 0; n--) {

            if (isNaN(calculation[n]) && calculation[n] != ".") {
                break;
            }

            if (calculation[n] == ".") {
                return;
            }
        }

        calculation += "!";
        $("#calc-screen").html(calculation);
    });


    $("#btn-equals").click(function() {
        if (calculation) {
            isComputingSqrt = false;
            hasComputedAValue = true;
            let calc = calculation;
            addToHistory(calc);
            translateCalcToJS();
            computeResult();
            if (calc != $("#calc-screen").html()) {
                addToHistory($("#calc-screen").html());
            }
            
        }
    });


    $("#btn-AC").click(function() {
        calculation = "";
        hasComputedAValue = false;
        $("#calc-screen").html("0");
    });


    $(document).on("click", ".h-entry", function() {
        let content = $(this).html();
        calculation = content;
        $("#calc-screen").html(content);
    });

    
    $("#h-clear").click(function() {
        $("#history").html(" ");
    });


    // Deletes the last character of an entry
    $("#btn-DEL").click(function() {
        if (isNaN(calculation[calculation - 1])) {
            calculation = calculation.substring(0, calculation.length - 1);
            if (calculation[calculation.length - 1] == "√") {
                calculation = calculation.substring(0, calculation.length - 1);
            }
        } 

        if (!calculation) {
            calculation = "0";
        }

        $("#calc-screen").html(calculation);
    });

    
    $("#btn-positive-negative").click(function() {
        if (calculation.length > 0) {
            if (calculation.length === 1) {
                if (!isNaN(Number(calculation))) {
                    if (Number(calculation) > 0) {
                        calculation = "-" + calculation;
                    } else if (Number(calculation) < 0) {
                        calculation = "+" + calculation;
                    } 
                } else {
                    if (calculation != "+" && calculation != "-" && calculation != "π") {
                        calculation = "-";
                    } else if (calculation[calculation.length - 1] == "π") {
                        if (calculation[calculation.length - 2] == "-") {
                            calculation = calculation.substring(0, calculation.length - 2)
                            + "π";
                        } else if (calculation[calculation.length - 2 == "+"] || calculation == "π") {
                            calculation = calculation.substring(0, calculation.length - 2)
                            + "-π";
                        }
                    }
                }
            } else {
                let partToChange = "";
                for (var c = calculation.length - 1; c > - 1; c--) { 
                    if (calculation[c] == "+") {
                        partToChange = "-" + calculation.substring(c + 1, calculation.length);
                        calculation = calculation.substring(0, c) + partToChange;
                        break;
                    } else if (calculation[c] == "-") {
                        partToChange = "+" + calculation.substring(c + 1, calculation.length);
                        calculation = calculation.substring(0, c) + partToChange;
                        break;
                    } else if (calculation[c] == ".") {
                        continue;
                    } else if (isNaN(calculation[c])) {
                        if (calculation[c] == "π") {
                            continue;
                        }
                        partToChange = "-" + calculation.substring(c + 1, calculation.length);
                        calculation = calculation.substring(0, c + 1) + partToChange;
                        break;
                    } else if (c == 0 && !isNaN(calculation[c])) {
                        calculation = "-" + calculation;
                    } 
                }
                
            }
            $("#calc-screen").html(calculation);
        }
    });

});