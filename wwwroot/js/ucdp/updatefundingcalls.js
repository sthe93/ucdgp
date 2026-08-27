
$(document).ready(function () {

    function CallTotalCost() {

        var FundingBudgetZero = $("#FundingBudget").val().replace(/^0+/, '');
        $("#FundingBudget").val(FundingBudgetZero);
    }

    function keyDown(e) {
        var e = window.event || e;
        var key = e.keyCode;
        //space pressed
        if (key == 32) { //space
            e.preventDefault();
        }
        if (key >= 65 && key <= 90) { // Letters
            e.preventDefault();
        }
    }

    function isnumber(e) {
        var keyCode = (event.which) ? event.which : (window.event.keyCode) ? window.event.keyCode : -1;
        var str = e.value;

        if ((str.length == 0) && (event.keyCode == 46)) return false; // checking that length ==0 than not allow to enter '.'
        if ((str.indexOf('.') >= 0) && (event.keyCode == 46)) return false; // checking that if user already entered '.' than not allow to enter '.'

        if (keyCode != 46 && keyCode > 31
            && (keyCode < 48 || keyCode > 57))
            return false;

        return true;
    }


         var budget = '@Model.FundingBudget';
         console.log(budget);
        $("#FundingBudget").val(budget.replace('&#xA0;', " ").replace('&#xA0;', " ")); 
        console.log($("#FundingBudget").val());
          

        $("#FundingBudget").on({
                keyup: function() {
                formatCurrency($(this)); 
                },
                blur: function() { 
                formatCurrency($(this), "blur");
                }
        });

            

            function formatNumber(n) { 
                return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ")
            }

            function formatCurrency(input, blur) {

                var input_val = input.val();

                if (input_val === "") { return; }
  

                var original_len = input_val.length;

                var caret_pos = input.prop("selectionStart");

                if (input_val.indexOf(".") >= 0) {


                  var decimal_pos = input_val.indexOf(".");


                  var left_side = input_val.substring(0, decimal_pos);
                  var right_side = input_val.substring(decimal_pos);

                  left_side = formatNumber(left_side);

                  right_side = formatNumber(right_side);

                  if (blur === "blur") {
                    right_side += "00";
                  }

                  right_side = right_side.substring(0, 2);


                } else {

                  input_val = formatNumber(input_val);
                  
                  if (blur === "blur") {
                    input_val += ".00";
                  }
                }
  

                input.val(input_val);


                var updated_len = input_val.length;
                caret_pos = updated_len - original_len + caret_pos;
                input[0].setSelectionRange(caret_pos, caret_pos); 

            }

    $(".error").text('');


 /*   $('#btnUpdate').click(function (e) {*/
    $(document).on('click', '#btnUpdate', function (e) {
        e.preventDefault();

                var $myForm = $('#editfundingCalls');
                $(".error").text('');
                if (!$myForm[0].checkValidity()) {
                    
                    if ($("#FundingCallName").val().length < 1) {
                        $('#FundingCallName').after('<span class="error">FundingCall Name is required</span>');
                    }

                    if ($('#FundingBudget').val() == "") {
                          document.getElementById("FundingBudget").focus();
                         toastr.error('Funding Budget is required', 'Error Message');
                          $('#FundingBudget').after('<span class="error">Funding Budget is required</span>');
                         return false;
                     }

                     if ($('#FundingBudget').val() == "0.00") {
                          document.getElementById("FundingBudget").focus();
                         toastr.error('Funding Budget Cannot be zero', 'Error Message');
                          $('#FundingBudget').after('<span class="error">Funding Budget Cannot be less than zero</span>');
                         return false;
                     }

                     if ($('#FundingBudget').val() == "0,00") {
                          document.getElementById("FundingBudget").focus();
                         toastr.error('Funding Budget Cannot be zero', 'Error Message');
                          $('#FundingBudget').after('<span class="error">Funding Budget Cannot be less than zero</span>');
                         return false;
                     }

                     if ($('#FundingBudget').val() == "0") {
                          document.getElementById("FundingBudget").focus();
                         toastr.error('Funding Budget Cannot be zero', 'Error Message');
                          $('#FundingBudget').after('<span class="error">Funding Budget Cannot be less than zero</span>');
                         return false;
                     } 

                    var total = $('#FundingBudget').val().replace(/\s+/g, '');
                    if (parseFloat(total) < 1) {
                         document.getElementById("FundingBudget").focus();
                         $('#FundingBudget').after('<span class="error">Funding Budget Cannot be less than zero</span>');
                         toastr.error('Funding Budget Cannot be less than zero', 'Error Message');
                         return false;
                    }
 

                    if (total > 5000000.00) {
                      
                         toastr.error('Funding Budget cannot be more than 5 Million', 'Error Message');  
                         document.getElementById("FundingBudget").focus();
                          
                    }
                      

                    if ($("#OpeningDate").datepicker("getDate") === null) {
                        $('#OpeningDate').after('<span class="error">Opening Date is required</span>');
                    }
                    if ($("#ClosingDate").datepicker("getDate") === null) {
                        $('#ClosingDate').after('<span class="error">Closing Date is required</span>');
                    }
                    if ($("#ShortDescription").val().length < 1) {
                        $('#ShortDescription').after('<span class="error">Short Description is required</span>');
                    }

                    if ($('#ProjectName').val() == null) {
                        $('#ProjectName').after('<span class="error">Project Name is required</span>');
                    }
                    toastr.error('Please Complete All Fields', 'Error Message');
                }
                else {
                    var _startDate = new Date($("#OpeningDate").val());
                    var _endDate = new Date($("#ClosingDate").val());

                    var enddate = new Date($('#hdEndYear').val(), 12, 0);
                    var startdate = new Date($('#hdStartYear').val(), 0, 1);

                    var total = $('#FundingBudget').val().replace(/\s+/g, '');
                    if (parseFloat(total) < 1) {
                         document.getElementById("FundingBudget").focus();
                         $('#FundingBudget').after('<span class="error">Funding Budget Cannot be less than zero</span>');
                         toastr.error('Funding Budget Cannot be less than zero', 'Error Message');
                         return false;
                    }

                     

                    if (total > 5000000.00) {
                      
                         toastr.error('Funding Budget cannot be more than 5 Million', 'Error Message');  
                         document.getElementById("FundingBudget").focus();
                          return false;
                    }

                    if (_startDate > enddate) {
                        $('#OpeningDate').after('<span class="error">Invalid Opening Date</span>');
                        toastr.error("Cannot future date Opening Date to next year", 'Error Message');
                        e.preventDefault();
                        return false;
                    }

                    if (_startDate < startdate) {
                        $('#OpeningDate').after('<span class="error">Invalid Opening Date to previous year</span>');
                        toastr.error("Cannot back date Opening Date to previous years", 'Error Message');
                        e.preventDefault();
                        return false;
                    }

                    if (_endDate > enddate) {
                        $('#ClosingDate').after('<span class="error">Invalid Closing Date</span>');
                        toastr.error("Cannot future date Closing Date to next year", 'Error Message');
                        e.preventDefault();
                        return false;
                    }

                    if (_endDate < startdate) {
                        $('#ClosingDate').after('<span class="error">Invalid Closing Date</span>');
                        toastr.error("Cannot back date Closing Date to previous years", 'Error Message');
                        e.preventDefault();
                        return false;

                    }


                    if (_startDate.getTime() === _endDate.getTime() || _startDate.getTime() > _endDate.getTime()) {
                        toastr.error("Closing date should be greater than Opening Date", 'Error Message');
                        e.preventDefault();
                        return false;
                    } else {
                        const selected = document.querySelectorAll('#ProjectName option:checked');

                        const values = Array.from(selected).map(el => el.value);
                        var model = {
                            "Id": $("#Id").val(),
                            "FundingCallName": $("#FundingCallName").val(),
                            "ProjectId": values,
                            "ShortDescription": $("#ShortDescription").val(),
                            "Status": $("#FundingCallStatusId").val(),
                            "ClosingDate": $("#ClosingDate").val(),
                            "OpeningDate": $("#OpeningDate").val(),
                            "FundingCallStatus": $("#FundingCallStatus").val(),
                            "CreatedDate": $("#CreatedDate").val(),
                            "FundingBudget": $("#FundingBudget").val().replace(/\s+/g, '')
                        };


                        $.ajax({
                            url: "FundingCalls/UpdateFundingCall",
                            type: 'POST',
                            data: model,
                            success: function (data) {

                                debugger;
                                if (data.status === "error") {
                                    toastr.error(data.message);
                                    e.preventDefault();
                                }
                                else {
                                    toastr.success('Updated Funding Call Submitted Successfuly.');
                                    window.location.href = "/researchsuite/FundingCalls/Index";
                                }
                            },
                        });
                    }
                }
            });
        });


                                    
 
    //$(function () {
    //    $('[id*=ProjectName]').multiselect({
    //        includeSelectAllOption: true
    //    });
//});

$("#ProjectName").select2({
    width: '100%',
    placeholder: 'Please select',
    allowClear: true
});


 

    $(document).ready(function () {

        var enddate = new Date($('#hdEndYear').val(), 12, 0);
        var startdate = new Date($('#hdStartYear').val(), 0, 1);

        $('#OpeningDate').datepicker({ minDate: 0, maxDate: enddate });
        $('#ClosingDate').datepicker({ minDate: 0, maxDate: enddate  });
    });

    $(document).ready(function () {

        //Description
        var textAreaValue = $('#ShortDescription').val().length;

        var text_max = 250;
        var total = text_max - textAreaValue;
        $('#textarea_count').html(total + ' characters remaining');

        $('#ShortDescription').keyup(function () {
            console.log(text_max);
            var text_length = $('#ShortDescription').val().length;

            var text_remaining = text_max - text_length;

            $('#textarea_count').html(text_remaining + ' characters remaining');
        });

        var textAreaValueCallName = $('#FundingCallName').val().length;

        var text_maxCallName = 50;
        var totalCallName = text_maxCallName - textAreaValueCallName;
        $('#callname_count').html(totalCallName + ' characters remaining');

        $('#FundingCallName').keyup(function () {
    
            var text_lengthCallName = $('#FundingCallName').val().length;

            var text_remainingCallName = text_maxCallName - text_lengthCallName;

            $('#callname_count').html(text_remainingCallName + ' characters remaining');
        });
    });
 

