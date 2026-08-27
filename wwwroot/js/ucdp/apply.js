
$(document).ready(function () {



    //initDatePickers();

    //function initDatePickers() {
    //    $('#FundingStartDate').datepicker({
    //        autoclose: true
    //    });

    //    $('#FundingEndDate').datepicker({
    //        autoclose: true
    //    });
    //}
    applyReadOnlyMode();

    setTimeout(applyReadOnlyMode, 100);
    setTimeout(applyReadOnlyMode, 500);

    $("#previousfundingamount").on({
        keyup: function () {
            formatCurrency($(this));
        },
        blur: function () {
            formatCurrency($(this), "blur");
        }
    });

    //$(document).on("click", "#MotivationLetterBtn", function () {
    //    UploadMobilityMotivationLetter();
    //});

    function formatNumber(n) {
        // format number 1000000 to 1,234,567
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    }


    function formatCurrency(input, blur) {
        // appends $ to value, validates decimal side
        // and puts cursor back in right position.

        // get input value
        var input_val = input.val();

        // don't validate empty input
        if (input_val === "") { return; }

        // original length
        var original_len = input_val.length;

        // initial caret position
        var caret_pos = input.prop("selectionStart");

        // check for decimal
        if (input_val.indexOf(".") >= 0) {

            // get position of first decimal
            // this prevents multiple decimals from
            // being entered
            var decimal_pos = input_val.indexOf(".");

            // split number by decimal point
            var left_side = input_val.substring(0, decimal_pos);
            var right_side = input_val.substring(decimal_pos);

            // add commas to left side of number
            left_side = formatNumber(left_side);

            // validate right side
            right_side = formatNumber(right_side);

            // On blur make sure 2 numbers after decimal
            if (blur === "blur") {
                right_side += "00";
            }

            // Limit decimal to only 2 digits
            right_side = right_side.substring(0, 2);

            // join number by .
            //input_val = "R " + left_side + "." + right_side;

        } else {
            // no decimal entered
            // add commas to number
            // remove all non-digits
            input_val = formatNumber(input_val);
            //input_val = "R " + input_val;

            // final formatting
            if (blur === "blur") {
                input_val += ".00";
            }
        }

        // send updated string to input
        input.val(input_val);

        // put caret back in the right position
        var updated_len = input_val.length;
        caret_pos = updated_len - original_len + caret_pos;
        input[0].setSelectionRange(caret_pos, caret_pos);
    }


    var year = new Date().getFullYear();


    var enddate = new Date(year, 12, 0);
    var startdate = new Date(year, 0, 01);


    //$("#FundingEndDate").datepicker({
    //    dateFormat: 'dd/mm/yy',
    //    minDate: startdate,
    //    maxDate: enddate
    //});


    //$('#FundingStartDate').datepicker({
    //    dateFormat: 'dd/mm/yy',
    //    minDate: startdate,
    //    maxDate: enddate
    //});



    if ($("#FundingEndDate").val() == "01/01/0001") {

        $("#FundingEndDate").datepicker("setDate", new Date());

    }

    if ($("#FundingEndDate").val() == "01-01-0001") {

        $("#FundingEndDate").datepicker("setDate", new Date());

    }

    if ($("#FundingStartDate").val() == "01/01/0001") {

        $("#FundingStartDate").datepicker("setDate", new Date());

    }

    if ($("#FundingStartDate").val() == "01-01-0001") {

        $("#FundingStartDate").datepicker("setDate", new Date());

    }

    //$('#FirstYearRegistration').datepicker();
    //$('#PlannedGraduationYear').datepicker();



    $("#btnCostCentre").click(function (e) {

        if ($("#CostCentre").val() == "") {
            toastr.error('Cost Centre Number is required', 'Error Message');
            document.getElementById("CostCentre").focus();
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }

        var formData = new FormData();
        formData.append("CostCentre", $("#CostCentre").val());
        // spinner.show();
        $.ajax({
            url: "Applications/GetCostCentreDetails",
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                //  spinner.hide();
                console.log(data);
                if (data.CostCentreNumber !== null) {
                    toastr.success("Research Cost Center verified. Please ensure that you have entered the correct research cost center number. If you are unsure, contact your financial business partner.", 'Success Message');

                    debugger;
                    $("#costcentrename").val(data.CostCentreDescription);
                    $("#costcentrenumber").val(data.CostCentreNumber);
                }
                else {
                    $("#costcentrenumber").val('');

                    $("#costcentrename").val('');
                    toastr.error("Please enter correct research cost centre number. If you are unsure please contact your Finance Business Partner (FBP).", 'Error Message');
                }
            },
        });

    });



    var arrmotivationalLetterdoc = [];

    //New Mobility Programes Total Cost Breakdown.
    function UploadMobilityMotivationLetter() {

        debugger;

        var applicationId = '@Model.Id';
        var fileData = new FormData();

        let FundingCallDetailsId = $("#FundingCallDetailsId").val();
        let UserId = $("#UserId").val();
        let Id = $("#Id").val();

        var FundingCallId = '@Model.FundingCallDetails.Id';
        var fileUpload = $("#MotivationLetterDoc").get(0);
        var files = fileUpload.files;

        if (files.length === 0) {
            toastr.error("Please select file to upload.");
            $('#MotivationLetterDoc').val('');
            return false;
        }


        // Looping over all files and add it to FormData object
        for (var i = 0; i < files.length; i++) {

            var file1 = files[i].name;

            if (file1) {
                var file_size = files[i].size;

                if (file_size < (5 * 1024 * 1024)) {

                    var ext = file1.split('.').pop().toLowerCase();
                    if ($.inArray(ext, ['pdf']) === -1) {
                        toastr.error("Only PDF uploads is allowed");
                        $('#MotivationLetterDoc').val('');
                        return false;
                    }

                } else {
                    toastr.error("File size should be 5 MB or less.");
                    $('#MotivationLetterDoc').val('');
                    return false;
                }
            }
            for (var s = 0; s < arrmotivationalLetterdoc.length; s++) {

                if (arrmotivationalLetterdoc[s].name === files[i].name) {

                    toastr.error("File " + files[i].name + " already uploaded.");
                    $('#MotivationLetterDoc').val('');
                    return false;
                }

            }

            arrmotivationalLetterdoc.push({ name: files[i].name, file: files[i], Id: applicationId });

        }

        for (var p = 0, len = arrmotivationalLetterdoc.length; p < len; p++) {
            fileData.append(arrmotivationalLetterdoc[p].name, arrmotivationalLetterdoc[p].file);
            fileData.append('Id', arrmotivationalLetterdoc[p].Id);
        }


        fileData.append("FundingCallId", FundingCallDetailsId);

        $('#MotivationLetterDoc').val('');
        $("#ListofMotivationLetterDocumentsFiles tbody").empty();
        $("#ListofMotivationLetterDocumentsFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

        $.ajax({
            url: "Applications/UploadMotivationLetter",
            type: 'POST',
            contentType: false,
            processData: false,
            data: fileData,
            async: false,
            success: function (result) {



                const doc = result; // already a single object
                console.log(doc.Filename);
                // process doc...


                for (var s = 0; s < result.length; s++) {

                    debugger;
                    if (result[s].UploadType.trim() == '@UploadTypeEnum.MotivationLetter.GetDescription()') {

                        $('#MobilityProgrammesTotalBreakdownDoc').val('');
                        document.getElementById("MotivationLetterBtn").disabled = true;
                        document.getElementById("MotivationLetterDoc").disabled = true;
                        $("#ListofMotivationLetterDocumentsFiles tbody").empty();
                        var markup = "<tr><td>" + result[s].Filename + "</td><td><a type='button' title='Delete' onclick='DeleteMotivationLetter(\"" + result[s].Id + "\")'><span class='glyphicon glyphicon-trash'> Delete</span></a></td><td><a href='#' class='btnViewOpenDoc action - buttons' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='glyphicon glyphicon-eye-open' aria-hidden='true'></i> View</a></td></tr>"; // Binding the file name
                        $("#ListofMotivationLetterDocumentsFiles tbody").append(markup);

                    }
                }


                $("#ListofMotivationLetterDocumentsFiles").load(
                    window.location.href + " #ListofMotivationLetterDocumentsFiles > *"
                );

            },
            error: function () {
                toastr.error("There was error uploading files.", 'Error Message');
            }

        });
    }



    //Delete Mobility Total cist breakdown Doc
    function DeleteMotivationLetter(Id) {

        $("#ListofMotivationLetterDocumentsFiles tbody").empty();
        $("#ListofMotivationLetterDocumentsFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

        $.ajax({
            type: "GET",
            url: "Applications/DeleteDocument",
            contentType: "application/json; charset=utf-8",
            data: { "documentId": Id },
            datatype: "json",
            success: function (result) {
                $("#ListofMotivationLetterDocumentsFiles tbody").empty();
                var count = 0;
                for (var s = 0; s < result.length; s++) {

                    if (result[s].UploadType.trim() == '@UploadTypeEnum.MotivationLetter.GetDescription()') {

                        var markup = "<tr><td>" + result[s].Filename + "</td><td><a type='button' title='Delete' onclick='DeleteMotivationLettern(\"" + result[s].Id + "\")'><span class='glyphicon glyphicon-trash'> Delete</span></a></td><td><a href='#' class='btnViewOpenDoc action - buttons' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='glyphicon glyphicon-eye-open' aria-hidden='true'></i> View</a></td></tr>";
                        $("#ListofMotivationLetterDocumentsFiles tbody").append(markup);
                        count++;
                    }
                }

                arrmobilityTotalCostBreakdowndoc.length = 0;
                $("#ListofMotivationLetterDocumentsFiles tbody").empty();
                toastr.success("Document Deleted Successfully", 'Success Message');
                document.getElementById("MotivationLetterBtn").disabled = false;
                $('#MotivationLetterDoc').val('');
                document.getElementById("MotivationLetterDoc").disabled = false;

            },
            error: function () {
                toastr.error('Error Trying to delete document.', 'Error Message');
            }
        });
    }

    function GetMotivationLetter() {
        var motivationDocCount = 0;

        $.ajax({
            type: "GET",
            url: "Applications/GetMotivationLetter",
            data: { applicationId: applicationId },
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {

                for (var s = 0; s < result.length; s++) {

                    //Improvement of staff qualifications
                    //Proof of Registration
                    if (result[s].UploadType.trim() == '@UploadTypeEnum.MotivationLetter.GetDescription()') {

                        if (motivationDocCount == 0) {
                            $("#ListofMotivationLetterDocumentsFiles tbody").empty();
                        }
                        motivationDocCount++;
                        var markup = "<tr><td>" + result[s].Filename + "</td><td><a type='button' title='Delete' onclick='DeleteMotivationLetter(\"" + result[s].Id + "\")'><span class='glyphicon glyphicon-trash'> Delete</span></a></td><td><a href='#' class='btnViewOpenDoc action - buttons' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='glyphicon glyphicon-eye-open' aria-hidden='true'></i> View</a></td></tr>"; // Binding the file name
                        $("#ListofMotivationLetterDocumentsFiles tbody").append(markup);

                        arr.push({ name: result[s].Filename, file: result[s] });
                    }
                }

            },
            error: function (response) {

                toastr.error(response, 'Error Message');
            }
        });

    }
});
$(document).on("click", ".step-bubble, .nextBtn, .prevBtn, .nextBtnImproveStaff, .backBtnImproveStaff, .nextBtnMobility, .backBtnMobility, #nextBtnResearch, #backBtnResearch", function () {
    setTimeout(applyReadOnlyMode, 100);
});

function isReadOnlyMode() {
    const root = document.getElementById("ucdpApplyRoot");
    return String(root?.getAttribute("data-is-readonly") || "").toLowerCase() === "true";
}

function applyReadOnlyMode() {
    if (!isReadOnlyMode()) return;

    const applicantTabSelectors = [
        "#ApplicantDetailsTab",
        "#ApproveTab",
        "#ImprovementStaffTab",
        "#ResearchCareerTab",
        "#MobilityProgrammesTab"
        // leave SupportingInformationTab alone for now
    ];

    applicantTabSelectors.forEach(function (selector) {
        const $tab = $(selector);
        if (!$tab.length) return;

        // inputs / selects / textareas
        $tab.find("input, select, textarea").each(function () {
            const $el = $(this);

            if ($el.is("input[type='hidden']")) return;

            if ($el.is("input[type='checkbox'], input[type='radio'], input[type='file'], select")) {
                $el.prop("disabled", true).attr("disabled", "disabled");
                return;
            }

            if ($el.is("input[type='text'], input[type='number'], input[type='email'], input[type='date'], input[type='tel'], input[type='url'], textarea")) {
                $el.prop("readonly", true).attr("readonly", "readonly");

                // datepickers and click-open controls often still respond unless disabled
                if ($el.hasClass("datepicker") || $el.hasClass("date-picker") || $el.attr("id") === "FundingStartDate" || $el.attr("id") === "FundingEndDate") {
                    $el.prop("disabled", true).attr("disabled", "disabled");
                }
            }
        });

        // disable action buttons, but keep navigation / close / viewers
        $tab.find("button, input[type='button'], input[type='submit'], a.btn").each(function () {
            const $el = $(this);
            const id = ($el.attr("id") || "").toLowerCase();
            const cls = ($el.attr("class") || "").toLowerCase();
            const text = (($el.text() || $el.val() || "").trim()).toLowerCase();

            const allowNavigation =
                cls.includes("nextbtn") ||
                cls.includes("backbtn") ||
                id.includes("next") ||
                id.includes("back") ||
                id.includes("close") ||
                $el.hasClass("btn-close") ||
                $el.is("[data-bs-dismiss='modal']");

            const allowViewer =
                $el.hasClass("btnViewDocument") ||
                $el.hasClass("btnViewOpenDoc");

            if (allowNavigation || allowViewer) {
                return;
            }

            const shouldDisable =
                text.includes("save") ||
                text.includes("submit") ||
                text.includes("upload") ||
                text.includes("delete") ||
                text.includes("remove") ||
                text.includes("add") ||
                text.includes("verify") ||
                id.includes("save") ||
                id.includes("submit") ||
                id.includes("upload") ||
                id.includes("delete") ||
                id.includes("remove") ||
                id.includes("add") ||
                id.includes("verify") ||
                cls.includes("save") ||
                cls.includes("submit") ||
                cls.includes("upload") ||
                cls.includes("delete") ||
                cls.includes("remove") ||
                cls.includes("add") ||
                cls.includes("verify");

            if (!shouldDisable) return;

            if ($el.is("a")) {
                $el.addClass("disabled")
                    .attr("aria-disabled", "true")
                    .attr("tabindex", "-1")
                    .off("click.readonly")
                    .on("click.readonly", function (e) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return false;
                    });
            } else {
                $el.prop("disabled", true)
                    .attr("disabled", "disabled")
                    .addClass("disabled");
            }
        });

        // disable clickable date/calendar triggers
        $tab.find(".ui-datepicker-trigger, .calendar-icon, .input-group-text").css("pointer-events", "none").css("opacity", "0.65");

        // disable labels for disabled radios/checkboxes
        $tab.find("label").each(function () {
            const $label = $(this);
            const targetId = $label.attr("for");
            if (!targetId) return;

            const $target = $("#" + targetId);
            if ($target.is(":disabled")) {
                $label.css("pointer-events", "none");
            }
        });
    });
}
function closeApplicationForm() {
    const returnUrl = ($("#ReturnUrl").val() || "").trim();
    const basePath = window.config?.basePath || "";

    if (returnUrl) {
        window.location.href = returnUrl;
        return;
    }

    if (document.referrer) {
        try {
            const refUrl = new URL(document.referrer);

            if (refUrl.origin === window.location.origin) {
                window.location.href = document.referrer;
                return;
            }
        } catch (e) {
            console.warn("Invalid referrer", e);
        }
    }

    window.location.href = `${basePath}/Ucdp/Index`;
}

$(document)
    .off("click.closeApp", "#btnClose, #btnCloseResearch, #btnCloseImproveStaff, #btnCloseMobility, #btnCloseApprove")
    .on("click.closeApp", "#btnClose, #btnCloseResearch, #btnCloseImproveStaff, #btnCloseMobility, #btnCloseApprove", function (e) {
        e.preventDefault();
        closeApplicationForm();
    });

var stepArray = [];
var totalSteps = [];

var showStep1 = false;
var showStep2 = false;
var showStep3 = false;
var showStep4 = false;
var showStep5 = false;
var showStep6 = false;
var showStep7 = false;


var showLoading = function () {
    $('#dashLoading').removeClass('d-none');
}

var hideLoading = function () {
    $('#dashLoading').addClass('d-none');
}

