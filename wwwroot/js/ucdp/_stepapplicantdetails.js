var targetGroupValue = "";
var appointmentGroupValue = "";
var spinner = $('#loader');
let lastVerifiedCostCentre = "";

$(document).ready(function () {
    initialiseApplicantDetails();
});

function initialiseApplicantDetails() {
    initialiseDatePickers();
    initialiseCurrencyFormatting();
    initialiseSelections();
    initialiseCostCentreVerification();
    initialiseButtons();

    targetGroupValue = $("input[name='targetGroup']:checked").val() || "";
    appointmentGroupValue = $("input[name='appointmentGroup']:checked").val() || "";
}

function setCostCentreButtonState(state) {
    const $btn = $("#btnCostCentre");
    const $icon = $btn.find(".btn-icon");
    const $label = $btn.find(".btn-label");

    $btn.removeClass("btn-outline-primary btn-outline-danger");

    if (state === "idle") {
        $btn.prop("disabled", false).addClass("btn-outline-primary");
        $icon.addClass("d-none").html("");
        $label.text("Verify");
    }

    if (state === "loading") {
        $btn.prop("disabled", true).addClass("btn-outline-primary");
        $icon.removeClass("d-none").html('<span class="spinner-border spinner-border-sm"></span>');
        $label.text("Verifying...");
    }

    if (state === "success") {
        $btn.prop("disabled", false).addClass("btn-outline-primary");
        $icon.removeClass("d-none").html('<i class="fa fa-check"></i>');
        $label.text("Verified");
    }

    if (state === "error") {
        $btn.prop("disabled", false).addClass("btn-outline-danger");
        $icon.removeClass("d-none").html('<i class="fa fa-times"></i>');
        $label.text("Invalid");
    }
}

function initialiseDatePickers() {
    $('#FundingStartDate').datepicker({
        autoclose: true,
        format: 'dd M yyyy'
    });

    $('#FundingEndDate').datepicker({
        autoclose: true,
        format: 'dd M yyyy'
    });

    normaliseDefaultDate("#FundingStartDate");
    normaliseDefaultDate("#FundingEndDate");
}
function normaliseDefaultDate(selector) {
    const value = $(selector).val();
    if (value === "01/01/0001" || value === "01-01-0001") {
        $(selector).datepicker("setDate", new Date());
    }
}

function initialiseCurrencyFormatting() {
    $("#previousfundingamount").on({
        keyup: function () {
            formatCurrency($(this));
        },
        blur: function () {
            formatCurrency($(this), "blur");
        }
    });
}

function formatNumber(n) {
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatCurrency(input, blur) {
    var input_val = input.val();

    if (input_val === "") {
        return;
    }

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
        input_val = left_side + "." + right_side;
    } else {
        input_val = formatNumber(input_val);

        if (blur === "blur") {
            input_val += ".00";
        }
    }

    input.val(input_val);

    var updated_len = input_val.length;
    caret_pos = updated_len - original_len + caret_pos;

    if (input[0] && input[0].setSelectionRange) {
        input[0].setSelectionRange(caret_pos, caret_pos);
    }
}

function initialiseSelections() {
    targetGroupValue = $("input[name='targetGroup']:checked").val() || $("#ApplicantCategory").val() || "";
    appointmentGroupValue = $("input[name='appointmentGroup']:checked").val() || $("#AppointmentCategory").val() || "";

    $("input[name='targetGroup']").on("change", function () {
        targetGroupValue = $(this).val() || "";
        $("#ApplicantCategory").val(targetGroupValue);
    });

    $("input[name='appointmentGroup']").on("change", function () {
        appointmentGroupValue = $(this).val() || "";
        $("#AppointmentCategory").val(appointmentGroupValue);
    });
}

function initialiseCostCentreVerification() {
    setCostCentreButtonState("idle");

    $("#CostCentre").on("input", function () {
        const currentValue = ($(this).val() || "").trim();

        if (currentValue !== lastVerifiedCostCentre) {
            setCostCentreButtonState("idle");
            $("#costcentrename").val("");
            $("#costcentrenumber").val("");
        }
    });

    $("#btnCostCentre").off("click").on("click", function (e) {
        e.preventDefault();

        const costCentre = ($("#CostCentre").val() || "").trim();

        if (costCentre === "") {
            toastr.error('Cost Centre Number is required', 'Error Message');
            $("#CostCentre").focus();
            return false;
        }

        setCostCentreButtonState("loading");

        var formData = new FormData();
        formData.append("CostCentre", costCentre);

        spinner.show();

        $.ajax({
            url: "Applications/GetCostCentreDetails",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                spinner.hide();

                if (data && data.CostCentreNumber !== null) {
                    toastr.success(
                        "Research Cost Center verified. Please ensure that you have entered the correct research cost center number. If you are unsure, contact your financial business partner.",
                        'Success Message'
                    );

                    lastVerifiedCostCentre = costCentre;
                    $("#costcentrename").val(data.CostCentreDescription || "");
                    $("#costcentrenumber").val(data.CostCentreNumber || "");
                    setCostCentreButtonState("success");
                } else {
                    $("#costcentrenumber").val("");
                    $("#costcentrename").val("");
                    toastr.error(
                        "Please enter correct research cost centre number. If you are unsure please contact your Finance Business Partner (FBP).",
                        'Error Message'
                    );
                    setCostCentreButtonState("error");
                }
            },
            error: function () {
                spinner.hide();
                $("#costcentrenumber").val("");
                $("#costcentrename").val("");
                toastr.error("Unable to verify cost centre.", "Error Message");
                setCostCentreButtonState("error");
            }
        });
    });
}

function initialiseButtons() {
    //$("#btnClose").off("click").on("click", function () {
    //    window.location.href = "/researchsuiteUCDP/Ucdp/Index";
    //});

    $("#btnApplicationDetails").off("click").on("click", function (e) {
        e.preventDefault();

        if (isReadOnlyMode()) {
            goToNextStep("ApplicantDetailsTab");
            return false;
        }


        if (!validateApplicantDetails()) {
            return false;
        }

        saveApplicantDetails();
    });
}
function clearPreviousFundingDocumentValidation() {
    $("#ListofMotivationLetterDocumentsFiles").removeClass("is-invalid");
    $("#MotivationLetterDoc").removeClass("is-invalid");
    toastr.clear();
}
function validateApplicantDetails() {
    clearPreviousFundingDocumentValidation();
    toastr.clear();
    if ($("#FundingStartDate").val() === "") {
        toastr.error('Funding Start Date is required', 'Error Message');
        return false;
    }

    if ($("#FundingStartDate").val() === "01/01/0001") {
        toastr.error('Provide a valid Funding Start Date', 'Error Message');
        return false;
    }

    if ($("#FundingEndDate").val() === "") {
        toastr.error('Funding End Date is required', 'Error Message');
        return false;
    }

    if ($("#FundingEndDate").val() === "01/01/0001") {
        toastr.error('Provide a valid Funding End Date', 'Error Message');
        return false;
    }

    if ($("#costcentrename").val() === "") {
        toastr.error('Cost Centre is required', 'Error Message');
        $("#costcentrename").focus();
        return false;
    }

    var previousFundingValue = ($("#PreviousFunding").val() || "").trim().toLowerCase();

    if (previousFundingValue === "") {
        toastr.error('Please select if you have received funding previously', 'Error Message');
        $("#PreviousFunding").focus();
        return false;
    }

    if (previousFundingValue === "yes") {
        //var previousFundingYear = ($("#previousfundingyear").val() || "").trim();
        //var previousFundingAmount = ($("#previousfundingamount").val() || "").trim();
        var previousFundingOutcome = ($("#previousfundingoutcome").val() || "").trim();

        // Removed previous funding amount validation because the field is system-generated and disabled
        //if (previousFundingYear === "") {
        //    toastr.error('Year For Previous Funding is required', 'Error Message');
        //    $("#previousfundingyear").focus();
        //    return false;
        //}

        //if (previousFundingAmount === "") {
        //    toastr.error('The amount is required', 'Error Message');
        //    $("#previousfundingamount").focus();
        //    return false;
        //}

        //var previousTotal = previousFundingAmount.replace(/ /g, "");

        //if (previousTotal === "0" || previousTotal === "0.00") {
        //    toastr.error('The previous funding amount cannot be zero', 'Error Message');
        //    $("#previousfundingamount").focus();
        //    return false;
        //}

        //if (isNaN(parseCurrency(previousTotal)) || parseCurrency(previousTotal) < 1) {
        //    toastr.error('The previous funding amount must be greater than zero', 'Error Message');
        //    $("#previousfundingamount").focus();
        //    return false;
        //}

        //if (parseCurrency(previousTotal) > 1000000.00) {
        //    toastr.error('The previous funding amount cannot be more than 1000000', 'Error Message');
        //    $("#previousfundingamount").focus();
        //    return false;
        //}

        if (previousFundingOutcome.replace(/\s/g, "") === "") {
            toastr.error('The measurable output impact achieved is required', 'Error Message');
            $("#previousfundingoutcome").focus();
            return false;
        }

        //const hasMotivationLetter = $("#ListofMotivationLetterDocumentsFiles tbody tr[data-existing='true']").length > 0;

        //if (!hasMotivationLetter) {
        //    toastr.error("Please upload the motivational letter before continuing", "Error Message");
        //    $("#MotivationLetterDoc").addClass("is-invalid");
        //    return false;
        //}
    }

    if (targetGroupValue === "") {
        toastr.error('Please select one Target Group', 'Error Message');
        return false;
    }

    if (appointmentGroupValue === "") {
        toastr.error('Please select one Appointment category', 'Error Message');
        return false;
    }

    return true;
}

function getSharedValue(id) {
    return $("#sharedHiddenFields").find(id).val() || "";
}

function setSharedValue(id, value) {
    $("#sharedHiddenFields").find(id).val(value || "");
}

function getApplicationId() {
    return getSharedValue("#Id");
}


function saveApplicantDetails() {
    var formData = new FormData();

    appendSharedHiddenFields(formData);

    var fundingStartDateValue = $("#FundingStartDate").val();
    var fundingEndDateValue = $("#FundingEndDate").val();
    var previousFundingValue = ($("#PreviousFunding").val() || "").trim().toLowerCase();

    var applicantCategory = targetGroupValue || $("#ApplicantCategory").val() || "";
    var appointmentCategory = appointmentGroupValue || $("#AppointmentCategory").val() || "";

    formData.set("FundingStartDateValue", fundingStartDateValue);
    formData.set("FundingEndDateValue", fundingEndDateValue);
    formData.set("ApplicantCategory", applicantCategory);
    formData.set("AppointmentCategory", appointmentCategory);
    formData.set("CostCentreName", $("#costcentrename").val() || "");
    formData.set("CostCentreNumber", $("#costcentrenumber").val() || "");

    if (previousFundingValue === "yes") {
        formData.set("PreviousFundingYear", $("#previousfundingyear").val() || "");
        formData.set("PreviousFundingAmount", $("#previousfundingamount").val() || "");
        formData.set("PreviousFundingOutcome", $("#previousfundingoutcome").val() || "");
    } else {
        formData.set("PreviousFundingYear", "");
        formData.set("PreviousFundingAmount", "");
        formData.set("PreviousFundingOutcome", "");
    }



    $.ajax({
        url: "Applications/ApplicationDetails",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function () {
            spinner.show();
        },
        success: function (data) {
            if (data.status === "Saved") {
                var applicationId = data.applicationId || data.message?.applicationId || data.message?.id;

                // $("#Id").val(applicationId);
                $('input[type="hidden"][id="Id"]').val(applicationId);
                setSharedValue("#Id", applicationId);
                console.log("Application ID set to:", applicationId);
                toastr.success("Applicant Details Saved Successfully", "Success Message");
                moveToNextStep();
            } else {
                toastr.error(data.message || "Error Occurred while Saving Details", "Error Message");
            }
        },
        error: function () {
            toastr.error("An unexpected error occurred", "Error");
        },
        complete: function () {
            spinner.hide();
        }
    });
}
function moveToNextStep() {
    var navListItems = $('div.setup-panel div a');
    var nextStepWizard = $('div.setup-panel div a[href="#ApplicantDetailsTab"]')
        .parent()
        .next()
        .children("a");

    navListItems.removeClass('btn-success').addClass('btn-default');
    nextStepWizard.addClass('btn-success');
    nextStepWizard.removeAttr('disabled').trigger('click');
}

