$(document).ready(function () {

    var enddate = new Date($('#hdEndYear').val(), 12, 0);
    var startdate = new Date($('#hdStartYear').val(), 0, 1);

    $(function () {
        $('[data-bs-toggle="tooltip"]').tooltip();
    });
    initDatePickers();  

    function initDatePickers() {

        $('#OpeningDateFilter').datepicker({
            autoclose: true
        });

        $('#ClosingDateFilter').datepicker({
            autoclose: true
        });



        $('#OpeningDate').datepicker({
            autoclose: true,
            startDate: new Date()   // Disable all past dates
        });

        $('#ClosingDate').datepicker({
            autoclose: true,
            startDate: new Date()
        });
    }

    $(document).on("click", ".edit", function () {



        const id = $(this).data("id");
        getDetails(id);
    });

    document.getElementById("btnNewFundingCall")
        .addEventListener("click", function () {

         

            $('.error').remove();
            $('#FundingCallName').val('');
           // $('#FundingBudget').val('');
            document.getElementById("FundingBudget").value = '';
            $('#OpeningDate').val('');
            $('#ClosingDate').val('');
            $('#ShortDescription').val('');
            $('#ProjectName option').prop('selected', false);

            CreateNewFundingCall();
        });


    $('#btnSearchFundingCall').click(function (e) {

        loadFundingCalls();
    });

    $("#ProjectName").select2({
        width: '100%',
        placeholder: 'Please select',
        allowClear: true
    });


    $(document).on("click", ".edit-link", function () {

        const id = $(this).data("id");
        geteditDetails(id);
    });



    let typingTimer;
    const typingDelay = 300;
 
    //$(document).on("click", ".pagination a", function (e) {
    //    e.preventDefault();

    //    var href = $(this).attr("href");
    //    var url = href.startsWith("/")
    //        ? window.location.origin + href   // convert to absolute URL
    //        : href;

    //    $.ajax({
    //        url: url,
    //        type: "GET",
    //        success: function (result) {
    //            $("#fundingCallTable").html(result);

    //            // Reinitialize modals
    //            $('[data-bs-toggle="modal"]').off('click').on('click', function () {
    //                var id = $(this).data('id');
    //            });

    //            // Reapply table styling
    //            $("#fundingCallTable table").addClass("table table-hover");
    //        },
    //        error: function (xhr) {
    //            console.log("Pagination failed:", xhr.status);
    //        }
    //    });
    //});


    function loadFundingCalls() {

        var statusVal = $('#Status').val();
        var OpeningDateFilter = $('#OpeningDateFilter').val();


        $.ajax({
            url: "/FundingCalls/FilterFundingCalls",
            data: {
                search: $('#searchcallname').val(),
                status: $('#Status').val(),
                OpeningDateFilter: $('#OpeningDateFilter').val(),
                ClosingDateFilter: $('#ClosingDateFilter').val()
            },
            success: function (html) {
                $('#fundingCallTable').html(html);
            }
        });
    }

    function geteditDetails(id) {
        $.ajax({
            type: "GET",
            url: '/FundingCalls/UpdateFundingCall',
            data: { id: id },
            success: function (html) {

                $('#ModalBody').html(html);
                $('#editModal').modal('show');

                $('#editModal')
                    .off('shown.bs.modal')
                    .on('shown.bs.modal', function () {

                        var enddate = new Date($('#hdEndYear').val(), 12, 0);
                        var startdate = new Date($('#hdStartYear').val(), 0, 1);

                        $('#OpeningDate').datepicker({
                            startDate: new Date(),   // instead of minDate
                            format: 'yyyy-mm-dd'
                        });

                        $('#ClosingDate').datepicker({
                            startDate: new Date(),
                            endDate: enddate,
                            format: 'yyyy-mm-dd'
                        });
                    });

                $('#ProjectName').select2({
                    dropdownParent: $('#editModal'),
                    width: '100%'
                });
            },
            error: function () {
                toastr.error('Cannot Display Funding Information.');
            }
        });
    }

    function getDetails(id) {

        $.ajax({
            type: "GET",
            url: "/FundingCalls/GetFundingCallDetails",
            contentType: "application/json; charset=utf-8",
            data: { "id": id },
            datatype: "json",
            success: function (data) {

                $(".modal-body #openName").text("");

                const $list = $(".modal-body #openName");
                $list.empty();



                $list.attr(
                    "style",
                    "list-style-position: inside; padding-left: 0; margin: 0;"
                );

                data.fundingCallProjects.forEach((project, index) => {
                    $list.append(`
                    <li style="background-color:#343a40; padding:8px; margin:0;">
                        ${project.projectName}
                    </li>
                    `);
                });

                var openingDate = data.openingDate.replace("T", " ");
                openingDate = openingDate.replace(" 00:00:00", "");

                var closingDate = data.closingDate.replace("T", " ");
                closingDate = closingDate.replace(" 00:00:00", "");


                var amendDate = "";
                if (data.amendedClosingDate != null) {
                    var amendedClosingDate = data.amendedClosingDate.split("T");
                    amendDate = amendedClosingDate[0];
                }


                if (data.fundingCallStatus.fundingCallStatusId == 3) {
                    $('#btnCloseFundingCall').hide();
                    $('#openClosingDate').prop('readonly', true);
                    $('#openClosingDate').datepicker("destroy");
                } else {
                    $('#btnCloseFundingCall').show();
                    $('#openClosingDate').prop('readonly', false);

                    var enddate = new Date($('#hdEndYear').val(), 12, 0);
                    var startdate = new Date($('#hdStartYear').val(), 0, 1);

                    $('#openClosingDate').datepicker({
                        startDate: new Date(),
                        endDate: enddate,
                        format: 'yyyy-mm-dd'
                    });
                }


                $('#openModal').modal("show");
                $("#hdFundingCallId").val(id);
                $(".modal-body #openFundingCallName").val(data.fundingCallName);
                $(".modal-body #openOpeningDate").val(openingDate);
                $(".modal-body #openClosingDate").val(closingDate);
                $(".modal-body #openShortDescription").val(data.shortDescription);
                $(".modal-body #openFundingBudget").val(data.fundingBudget);
                $(".modal-body #AmendedClosingDate ").val(amendDate);


            },
            error: function (xhr, status, error) {
                console.log("Status:", status);
                console.log("Error:", error);
                console.log("Response Text:", xhr.responseText);
                console.log("Status Code:", xhr.status);

                toastr.success('Cannot Display Funding Information.');
            }
        });
    }

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


    $("#FundingBudget").on({
        keyup: function () {
            formatCurrency($(this));
        },
        blur: function () {
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


        var FundingBudgetZero = $("#FundingBudget").val().replace(/^0+/, '');
        $("#FundingBudget").val(FundingBudgetZero);
    }


    $('#btnSave').click(function (e) {
        var $myForm = $('#fundingCalls');
        $(".error").text('');
        if (!$myForm[0].checkValidity()) {

            if ($("#FundingCallName").val().length < 1) {
                document.getElementById("FundingCallName").focus();
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

            var total = $('#FundingBudget').val().replace(/ /g, "");
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

            if ($("#OpeningDate").datepicker("getDate") === null) {
                document.getElementById("OpeningDate").focus();
                $('#OpeningDate').after('<span class="error">Opening Date is required</span>');
                return false;
            }
            if ($("#ClosingDate").datepicker("getDate") === null) {
                document.getElementById("OpeningDate").focus();
                $('#ClosingDate').after('<span class="error">Closing Date is required</span>');
                return false;
            }

            if ($("#ShortDescription").val().length < 1) {
                document.getElementById("ShortDescription").focus();
                $('#ShortDescription').after('<span class="error">Short Description is required</span>');
                return false;
            }

            if ($('#ProjectName').val() == null) {
                document.getElementById("ProjectName").focus();
                $('#ProjectName').after('<span class="error">Project Name is required</span>');
                return false;
            }

            toastr.error('Please Complete All Required Fields', 'Error Message');
            return false;
        }
        else {
            var _startDate = new Date($("#OpeningDate").val());
            var _endDate = new Date($("#ClosingDate").val());

            var enddate = new Date($('#hdEndYear').val(), 12, 0);
            var startdate = new Date($('#hdStartYear').val(), 0, 1);

            var total = $('#FundingBudget').val().replace(/ /g, "");
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

                if (values.length === 0) {
                    $('#ProjectName').after('<span class="error">Project Name is required</span>');
                    return false;
                }


                myListData = {};
                myListData['Programs'] = values;
                $.ajax({
                    url: "/FundingCalls/CreateFundingCall",
                    type: 'POST',
                    data: {
                        "FundingCallName": $("#FundingCallName").val(),
                        "FundingCallId": $("#hdFundingCallId").val(),
                        "ProjectId": values,
                        "Project": $('#ProjectName').val().join(", "),
                        "ShortDescription": $("#ShortDescription").val(),
                        "Status": "New",
                        "ClosingDate": $("#ClosingDate").val(),
                        "OpeningDate": $("#OpeningDate").val(),
                        "FundingBudget": $("#FundingBudget").val().replace(/\s+/g, ''),
                    },
                    success: function (data) {
                        if (data.status === "error") {
                            toastr.error(data.message);
                            e.preventDefault();
                        }
                        else {
                            toastr.success('Funding Call Submitted Successfuly.');
                            window.location.href = 'Index';
                        }
                    },
                });
            }
        }
    });

//    $('#btnCloseFundingCall').click(function (e) {

//        debugger;

////        e.preventDefault();

//        $.ajax({
//            url: "/FundingCalls/CloseFundingCall",
//            type: 'POST',
//            data: {
//                "id": $("#hdFundingCallId").val(),
//                "ClosingDate": $("#openClosingDate").val(),
//            },
//            success: function (data) {
//                if (data.status === "error") {
//                    toastr.error(data.message);

//                }
//                else {
//                    const closingDate = new Date($("#openClosingDate").val());

//                    const today = new Date();
//                    today.setHours(0, 0, 0, 0);

//                    if (closingDate > today) {
//                        toastr.success('Funding Call Extended Successfully.');
//                    } else {
//                        toastr.success('Funding Call Closed Successfully.');
//                    }

//                    window.location.href = 'FundingCalls';
//                }
//            },
//        });
        //    });


    $('#btnCloseFundingCall').on('click', function (e) {
        e.preventDefault();

        const closingDate = $("#openClosingDate").val();

        if (!closingDate) {
            toastr.error("Closing Date is required.");
            return;
        }

        $.ajax({
            url: "/FundingCalls/CloseFundingCall",
            type: "POST",
            data: {
                id: $("#hdFundingCallId").val(),
                ClosingDate: closingDate
            },
            success: function (data) {
                if (data.status === "error") {
                    toastr.error(data.message);
                    return;
                }

                toastr.success("Funding Call updated successfully.");
                window.location.href = "Index";
            },
            error: function () {
                toastr.error("An unexpected error occurred.");
            }
        });
    });

    $('#myModal').on('shown.bs.modal', function () {

        if ($('#ProjectName').hasClass("select2-hidden-accessible")) {
            $('#ProjectName').select2('destroy');
        }

        $('#ProjectName').select2({
            dropdownParent: $('#myModal')
        });
    });

    var enddate = new Date($('#hdEndYear').val(), 12, 0);
    var startdate = new Date($('#hdStartYear').val(), 0, 1);

    $('#OpeningDate').datepicker({ minDate: startdate, maxDate: enddate });
    $('#ClosingDate').datepicker({ minDate: 0, maxDate: enddate });


    $('#OpeningDateFilter').datepicker();
    $('#ClosingDateFilter').datepicker();

    var textAreaValue = $('#ShortDescription').val().length;
    var text_max = 250;
    var total = text_max - textAreaValue;
    $('#textarea_feedback').html(total + ' characters remaining');

    $('#ShortDescription').keyup(function () {
        console.log(text_max);
        var text_length = $('#ShortDescription').val().length;
        var text_remaining = text_max - text_length;

        $('#textarea_feedback').html(text_remaining + ' characters remaining');
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

    function CreateNewFundingCall() {

        if ($.fn.select2 && $("#ProjectName").hasClass("select2-hidden-accessible")) {
            $("#ProjectName").select2('destroy');
        }

        // Now safely reset
        $("#ProjectName").empty();

        $.get("/FundingCalls/GetProjects")
            .done(function (data) {

                $("#ProjectName").append(
                    $('<option>', {
                        value: "",
                        text: "---Please select---",
                        disabled: true,
                        hidden: true
                    })
                );
                $.each(data, function (i, p) {
                    $("#ProjectName").append(
                        $('<option>', {
                            value: p.id,
                            text: p.name
                        })
                    );
                });

                // ✅ Initialize Select2 instead of Multiselect
                $("#ProjectName").select2({
                    width: '100%',
                    placeholder: '---Please select---',
                    allowClear: true
                });

                $('#myModal').modal('show');
            })
            .fail(function (err) {
                console.error("Failed to load projects", err);
            });
    }
});