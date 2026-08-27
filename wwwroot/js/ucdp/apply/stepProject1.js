$(function () {
    if (!$("#Project1DetailsForm").length) return;
    initialiseProject1DatePickers();
    bindProject1Events();
    bindProject1TableActions();
    bindTemporaryAppointeeFieldValidation();
    bindPaymentScheduleFieldValidation();
    initialiseProject1State();

    renderProject1InitialTables();
    $("#btnClearAppointee")
        .off("click.project1")
        .on("click.project1", function () {
            clearTemporaryAppointeeForm();
        });

    $("#btnClearPayment")
        .off("click.project1")
        .on("click.project1", function () {
            clearPaymentForm();
        });
});
let isVerifyingStaffStatus = false;
let currentTemporaryAppointees = [];
let currentPayments = [];

function buildSharedFormData() {
    const formData = new FormData();
    appendSharedHiddenFields(formData);
    return formData;
}

function bindProject1Events() {
    $("#FirstYearRegistration, #PlannedGraduationYear")
        .off("input.project1")
        .on("input.project1", function () {
            this.value = this.value.replace(/[^0-9]/g, "").slice(0, 4);
        });

    $("input[name='SupportRequired']")
        .off("change.project1")
        .on("change.project1", function () {
            toggleProject1Sections();
            toggleProject1DocumentTabs();
            clearProject1Validation();
        });

    $("#AppointmentOtherCheck")
        .off("change.project1")
        .on("change.project1", function () {
            toggleAppointmentOtherInput();
            clearProject1Validation();
        });

    $("input[name='AppointmentOption']")
        .not("#AppointmentOtherCheck")
        .off("change.project1")
        .on("change.project1", function () {
            $("#AppointmentOtherText").val("").addClass("d-none");
            clearProject1Validation();
        });

    $("#scheduleWeeks, #scheduleHoursPerWeek")
        .off("input.project1")
        .on("input.project1", function () {
            calculateScheduleHours();
            calculateScheduleMonthTotal();
        });

    $("#scheduleRatePerHour")
        .off("input.project1")
        .on("input.project1", function () {
            calculateScheduleMonthTotal();
        });

    $("#btnAddAppointee")
        .off("click.project1")
        .on("click.project1", function () {
            saveTemporaryAppointee();
        });

    $("#btnAddSchedule")
        .off("click.project1")
        .on("click.project1", function () {
            saveTeachingReliefSchedule();
        });

    $(".nextBtnImproveStaff")
        .off("click.project1")
        .on("click.project1", function (e) {
            e.preventDefault();

            if (isReadOnlyMode()) {
                goToNextStep("ImprovementStaffTab");
                return false;
            }

            saveProject1AndContinue();
        });

    $(".backBtnImproveStaff")
        .off("click.project1")
        .on("click.project1", function (e) {
            e.preventDefault();

            if (isReadOnlyMode()) {
                goToPreviousStep("ImprovementStaffTab");
                return false;
            }

            goToPreviousStep("ImprovementStaffTab");
        });
}

function bindProject1TableActions() {
    $("#temporaryAppointeesTable")
        .off("click.project1", ".btn-edit-appointee")
        .on("click.project1", ".btn-edit-appointee", function () {
            editTemporaryAppointee($(this).data("id"));
        });

    $("#temporaryAppointeesTable")
        .off("click.project1", ".btn-delete-appointee")
        .on("click.project1", ".btn-delete-appointee", function () {
            deleteTemporaryAppointee($(this).data("id"));
        });

    $("#teachingReliefScheduleTable")
        .off("click.project1", ".btn-delete-payment")
        .on("click.project1", ".btn-delete-payment", function () {
            deletePayment($(this).data("id"));
        });
    $("#teachingReliefScheduleTable")
        .off("click.project1", ".btn-edit-payment")
        .on("click.project1", ".btn-edit-payment", function () {
            editPayment($(this).data("id"));
        });

}

function initialiseProject1State() {
    toggleProject1Sections();
    toggleProject1DocumentTabs();
    toggleAppointmentOtherInput();
    calculateScheduleHours();
    calculateScheduleMonthTotal();

}

function saveProject1AndContinue() {
    clearProject1Validation();

    const validationResult = validateProject1Ui();

    if (!validationResult.isValid) {
        renderProject1Validation(validationResult.errors);
        focusFirstProject1Error();
        toastr.error("Please fix the highlighted Project 1 fields.", "Error Message");
        return;
    }

    if (!validateProject1Documents()) {
        return;
    }

    const payload = collectProject1UiState();
    const $nextButton = $(".nextBtnImproveStaff");
    const originalText = $nextButton.text();

    $nextButton.prop("disabled", true).text("Saving...");

    $.ajax({
        type: "POST",
        url: "Applications/ApplicationImprovementStaffQualifications",
        data: payload,
        traditional: true,
        success: function (response) {
            if (response && response.status === "Saved") {
                const savedId = response?.message?.id || response?.id || "";
                if (savedId) {
                    setSharedValue("#Id", savedId);
                }

                // const applicationId = getApplicationId();
                //if (applicationId) {
                //    loadTemporaryAppointees(applicationId);
                //    loadPayments(applicationId);
                //}

                toastr.success("Project 1 saved successfully.", "Success Message");
                goToNextStep("ImprovementStaffTab");
                return;
            }

            const message = response?.message || "Error occurred while saving.";
            toastr.error(message, "Error Message");
        },
        error: function (xhr) {
            const message =
                xhr?.responseJSON?.message ||
                xhr?.responseText ||
                "An unexpected error occurred while saving Project 1.";

            toastr.error(message, "Error Message");
        },
        complete: function () {
            $nextButton.prop("disabled", false).text(originalText);
        }
    });
}

function clearProject1Validation() {
    $("#Project1DetailsForm .is-invalid").removeClass("is-invalid");
    $("#Project1DetailsForm .field-validation-error").remove();

    $("#supportRequiredGroup").removeClass("is-invalid");
    $("#appointmentOptionGroup").removeClass("is-invalid");
    $("#temporaryAppointeesValidation").remove();
    $("#teachingReliefScheduleValidation").remove();
}

function validateProject1Ui() {
    const errors = {};

    const studyingTowards = $("#StudyingTowards").val()?.trim();
    const firstYear = $("#FirstYearRegistration").val()?.trim();
    const graduationYear = $("#PlannedGraduationYear").val()?.trim();
    const fieldOfStudy = $("#FieldOfStudy").val()?.trim();
    const describe = $("#Describe").val()?.trim();

    const supportRequired = $("input[name='SupportRequired']:checked")
        .map(function () {
            return $(this).val();
        })
        .get();

    const teachingReliefSelected = $("#SupportRequired_TeachingRelief").is(":checked");
    const researchAssistanceSelected = $("#SupportRequired_ResearchAssistance").is(":checked");
    const requiresAppointmentDetails = teachingReliefSelected || researchAssistanceSelected;

    const appointmentOption = $("input[name='AppointmentOption']:checked").val() || "";
    const otherSelected = $("#AppointmentOtherCheck").is(":checked");
    const otherText = $("#AppointmentOtherText").val()?.trim();

    if (!studyingTowards) {
        errors["#StudyingTowards"] = "Studying towards is required.";
    }

    if (!firstYear) {
        errors["#FirstYearRegistration"] = "Year of 1st registration is required.";
    } else if (!/^\d{4}$/.test(firstYear)) {
        errors["#FirstYearRegistration"] = "Enter a valid 4-digit year.";
    }

    if (!graduationYear) {
        errors["#PlannedGraduationYear"] = "Planned graduation year is required.";
    } else if (!/^\d{4}$/.test(graduationYear)) {
        errors["#PlannedGraduationYear"] = "Enter a valid 4-digit year.";
    }

    if (firstYear && graduationYear && parseInt(firstYear, 10) > parseInt(graduationYear, 10)) {
        errors["#FirstYearRegistration"] = "First registration year cannot be later than graduation year.";
        errors["#PlannedGraduationYear"] = "Graduation year must be later than or equal to first registration year.";
    }

    if (!fieldOfStudy) {
        errors["#FieldOfStudy"] = "Field of study is required.";
    }

    if (!describe) {
        errors["#Describe"] = "Description of your research or qualification is required.";
    }

    if (supportRequired.length === 0) {
        errors["#supportRequiredGroup"] = "Select at least one support requirement.";
    }

    if (requiresAppointmentDetails) {
        if (!appointmentOption) {
            errors["#appointmentOptionGroup"] = "Select an appointment option.";
        }

        if (otherSelected && !otherText) {
            errors["#AppointmentOtherText"] = "Please specify the other appointment option.";
        }

        const appointeeRows = $("#temporaryAppointeesTable tbody tr[data-id]").length;
        if (appointeeRows === 0) {
            errors["#temporaryAppointeesTable"] = "Add at least one temporary appointee.";
        }

        const scheduleRows = $("#teachingReliefScheduleTable tbody tr[data-id]").length;
        if (scheduleRows === 0) {
            errors["#teachingReliefScheduleTable"] = "Add at least one teaching relief schedule entry.";
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

function renderProject1Validation(errors) {
    Object.keys(errors).forEach(function (selector) {
        const message = errors[selector];
        const $element = $(selector);

        if (!$element.length) return;

        if (selector === "#supportRequiredGroup" || selector === "#appointmentOptionGroup") {
            $element.addClass("is-invalid");

            if ($element.find(".field-validation-error").length === 0) {
                $element.append(`<div class="text-danger field-validation-error mt-1">${message}</div>`);
            }

            return;
        }

        if (selector === "#temporaryAppointeesTable") {
            if (!$("#temporaryAppointeesValidation").length) {
                $element.after(`<div id="temporaryAppointeesValidation" class="text-danger field-validation-error mt-1">${message}</div>`);
            }
            return;
        }

        if (selector === "#teachingReliefScheduleTable") {
            if (!$("#teachingReliefScheduleValidation").length) {
                $element.after(`<div id="teachingReliefScheduleValidation" class="text-danger field-validation-error mt-1">${message}</div>`);
            }
            return;
        }

        $element.addClass("is-invalid");

        if ($element.next(".field-validation-error").length === 0) {
            $element.after(`<div class="text-danger field-validation-error">${message}</div>`);
        }
    });
}

function focusFirstProject1Error() {
    const $firstInvalid = $("#Project1DetailsForm")
        .find(".is-invalid, .field-validation-error")
        .filter(":visible")
        .first();

    if ($firstInvalid.length) {
        $("html, body").animate(
            { scrollTop: $firstInvalid.offset().top - 120 },
            300
        );
    }
}

function toggleProject1Sections() {
    const teachingReliefSelected = $("#SupportRequired_TeachingRelief").is(":checked");
    const researchAssistanceSelected = $("#SupportRequired_ResearchAssistance").is(":checked");
    const showAppointmentDetails = teachingReliefSelected || researchAssistanceSelected;

    if (showAppointmentDetails) {
        $("#teachingReliefSection").removeClass("d-none");
    } else {
        $("#teachingReliefSection").addClass("d-none");
        $("input[name='AppointmentOption']").prop("checked", false);
        $("#AppointmentOtherText").val("").addClass("d-none");
        $("#appointeeIdHidden").val("");
        $("#paymentIdHidden").val("");
        $("#btnAddAppointee").text("Add appointee");
        $("#btnAddSchedule").text("Add");
    }
}

function toggleProject1DocumentTabs() {
    const teachingReliefSelected = $("#SupportRequired_TeachingRelief").is(":checked");
    const researchSelected = $("#SupportRequired_ResearchAssistance").is(":checked");
    const financialSelected = $("#SupportRequired_FinancialSupport").is(":checked");

    $("#teachingReliefDocsTabItem").toggleClass("d-none", !teachingReliefSelected);
    $("#researchAssistanceDocsTabItem").toggleClass("d-none", !researchSelected);
    $("#financialSupportDocsTabItem").toggleClass("d-none", !financialSelected);
}

function toggleAppointmentOtherInput() {
    const otherSelected = $("#AppointmentOtherCheck").is(":checked");
    const teachingReliefSelected = $("#SupportRequired_TeachingRelief").is(":checked");
    const researchAssistanceSelected = $("#SupportRequired_ResearchAssistance").is(":checked");

    const showOther = (teachingReliefSelected || researchAssistanceSelected) && otherSelected;

    if (showOther) {
        $("#AppointmentOtherText").removeClass("d-none");
    } else {
        $("#AppointmentOtherText").val("").addClass("d-none");
    }
}

function calculateScheduleHours() {
    const weeks = parseFloat($("#scheduleWeeks").val()) || 0;
    const hoursPerWeek = parseFloat($("#scheduleHoursPerWeek").val()) || 0;
    const totalHours = weeks * hoursPerWeek;

    $("#scheduleTotalHours").val(totalHours > 0 ? toTwoDecimals(totalHours) : "");
}

function calculateScheduleMonthTotal() {
    const totalHours = parseFloat($("#scheduleTotalHours").val()) || 0;
    const ratePerHour = parseCurrency($("#scheduleRatePerHour").val()) || 0;
    const monthTotal = totalHours * ratePerHour;

    $("#scheduleMonthTotal").val(monthTotal > 0 ? toTwoDecimals(monthTotal) : "");
}

function updateTeachingReliefGrandTotal(items) {
    let grandTotal = 0;

    (items || []).forEach(function (item) {

        const amount = parseFloat(
            parseCurrency(item.monthTotal || item.MonthTotal || 0)
        ) || 0;

        grandTotal += amount;
    });

    $("#teachingReliefGrandTotal").val(
        grandTotal > 0
            ? formatRandDisplay(grandTotal)
            : ""
    );
}
function verifyTemporaryAppointeeStaffStatus() {
    const idNumber = $("#appointeeIdNumber").val().trim();

    $("#appointeeStaffStatus").removeClass("is-invalid");

    if (!idNumber) {
        $("#appointeeStaffStatus").val("");
        return;
    }

    isVerifyingStaffStatus = true;

    const $btn = $("#btnAddAppointee");
    const originalText = $("#appointeeIdHidden").val() && $("#appointeeIdHidden").val() !== "0"
        ? "Update appointee"
        : "Add appointee";

    $btn.prop("disabled", true).html(`
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Verifying...
    `);

    $.ajax({
        url: "Applications/GetStaffByIdNumber",
        type: "GET",
        data: { idNumber: idNumber },
        success: function (response) {
            if (response && response.staffStatus) {
                $("#appointeeStaffStatus").val(response.staffStatus);
            } else {
                $("#appointeeStaffStatus").val("");
                toastr.error(response?.message || "Could not verify staff status.", "Error Message");
            }
        },
        error: function () {
            $("#appointeeStaffStatus").val("");
            toastr.error("An unexpected error occurred while verifying staff status.", "Error Message");
        },
        complete: function () {
            isVerifyingStaffStatus = false;
            $btn.prop("disabled", false).text(originalText);
        }
    });
}
function saveTemporaryAppointee() {

    const idNumber = $("#appointeeIdNumber").val().trim();
    const staffStatus = $("#appointeeStaffStatus").val().trim();
    if (isVerifyingStaffStatus) {
        toastr.info("Please wait, staff status is still being verified.", "Please Wait");
        return;
    }
    if (idNumber && !staffStatus) {
        toastr.error("Please verify the ID or passport number first so staff status can be populated.", "Error Message");
        markInvalid("#appointeeIdNumber");
        markInvalid("#appointeeStaffStatus");
        return;
    }
    if (!validateTemporaryAppointeeForm()) {
        return;
    }

    const applicationId = getApplicationId();

    if (!applicationId || parseInt(applicationId, 10) <= 0) {
        toastr.error("Please save applicant details first before adding a temporary appointee.", "Error Message");
        return;
    }

    const formData = buildSharedFormData();
    const editId = $("#appointeeIdHidden").val() || "0";

    formData.set("ApplicationsId", applicationId);
    formData.set("Id", editId);
    formData.set("Surname", $("#appointeeSurname").val().trim());
    formData.set("Name", $("#appointeeName").val().trim());
    formData.set("EmailAddress", $("#appointeeEmail").val().trim());
    formData.set("ContactNumber", $("#appointeeContact").val().trim());
    formData.set("StartDate", formatDateForSave($("#appointeeStartDate").val()));
    formData.set("EndDate", formatDateForSave($("#appointeeEndDate").val()));
    formData.set("IDNumber", $("#appointeeIdNumber").val().trim());
    formData.set("StaffStatus", $("#appointeeStaffStatus").val().trim());

    $.ajax({
        url: "Applications/UpdateTemporaryAppointee",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status === "Success") {
                clearTemporaryAppointeeForm();
                renderTemporaryAppointees(response.data || []);
                clearProject1Validation();
                toastr.success(
                    response.message || (editId !== "0" ? "Temporary appointee updated successfully." : "Temporary appointee added successfully."),
                    "Success Message"
                );
            } else {
                toastr.error(response.message || "Could not save temporary appointee.", "Error Message");
            }
        },
        error: function () {
            toastr.error("An unexpected error occurred while saving the temporary appointee.", "Error");
        }
    });
}

function clearPaymentValidation() {
    $("#scheduleType, #scheduleFrom, #scheduleTo, #scheduleWeeks, #scheduleHoursPerWeek, #scheduleTotalHours, #scheduleRatePerHour, #scheduleMonthTotal")
        .removeClass("is-invalid");
}

function markPaymentInvalid(selector) {
    $(selector).addClass("is-invalid");
}

function validatePaymentForm() {
    clearPaymentValidation();

    const type = $("#scheduleType").val()?.trim();
    const from = $("#scheduleFrom").val()?.trim();
    const to = $("#scheduleTo").val()?.trim();
    const weeks = parseFloat($("#scheduleWeeks").val());
    const hoursPerWeek = parseFloat($("#scheduleHoursPerWeek").val());
    const totalHours = parseFloat($("#scheduleTotalHours").val());
    const ratePerHour = parseFloat($("#scheduleRatePerHour").val());
    const monthTotal = parseFloat($("#scheduleMonthTotal").val());

    if (!type) {
        markPaymentInvalid("#scheduleType");
        toastr.error("Type is required.", "Error Message");
        return false;
    }

    if (!from) {
        markPaymentInvalid("#scheduleFrom");
        toastr.error("From date is required.", "Error Message");
        return false;
    }

    if (!to) {
        markPaymentInvalid("#scheduleTo");
        toastr.error("To date is required.", "Error Message");
        return false;
    }

    const parsedFrom = parseDdMmYyyy(from);
    const parsedTo = parseDdMmYyyy(to);

    if (!parsedFrom) {
        markPaymentInvalid("#scheduleFrom");
        toastr.error("Enter a valid From date in dd/MM/yyyy format.", "Error Message");
        return false;
    }

    if (!parsedTo) {
        markPaymentInvalid("#scheduleTo");
        toastr.error("Enter a valid To date in dd/MM/yyyy format.", "Error Message");
        return false;
    }

    if (parsedTo < parsedFrom) {
        markPaymentInvalid("#scheduleFrom");
        markPaymentInvalid("#scheduleTo");
        toastr.error("To date cannot be earlier than From date.", "Error Message");
        return false;
    }

    if (isNaN(weeks) || weeks <= 0) {
        markPaymentInvalid("#scheduleWeeks");
        toastr.error("Number of weeks must be greater than 0.", "Error Message");
        return false;
    }

    if (isNaN(hoursPerWeek) || hoursPerWeek <= 0) {
        markPaymentInvalid("#scheduleHoursPerWeek");
        toastr.error("Hours per week must be greater than 0.", "Error Message");
        return false;
    }

    if (isNaN(totalHours) || totalHours <= 0) {
        markPaymentInvalid("#scheduleTotalHours");
        toastr.error("Total hours must be greater than 0.", "Error Message");
        return false;
    }

    if (isNaN(ratePerHour) || ratePerHour <= 0) {
        markPaymentInvalid("#scheduleRatePerHour");
        toastr.error("Rate per hour must be greater than 0.", "Error Message");
        return false;
    }

    if (isNaN(monthTotal) || monthTotal <= 0) {
        markPaymentInvalid("#scheduleMonthTotal");
        toastr.error("Month total must be greater than 0.", "Error Message");
        return false;
    }

    return true;
}

function toTwoDecimals(value) {
    return (Math.round((parseFloat(value) || 0) * 100) / 100).toFixed(2);
}
function saveTeachingReliefSchedule() {
    const applicationId = getApplicationId();

    if (!applicationId || parseInt(applicationId, 10) <= 0) {
        toastr.error("Please save applicant details first before adding a payment row.", "Error Message");
        return;
    }

    if (!validatePaymentForm()) {
        return;
    }

    const type = $("#scheduleType").val();
    const from = $("#scheduleFrom").val();
    const to = $("#scheduleTo").val();

    const weeks = parseCurrency($("#scheduleWeeks").val());
    const hoursPerWeek = parseCurrency($("#scheduleHoursPerWeek").val());
    const totalHours = parseCurrency($("#scheduleTotalHours").val());
    const ratePerHour = parseCurrency($("#scheduleRatePerHour").val());
    const monthTotal = parseCurrency($("#scheduleMonthTotal").val());

    if (!type || !from || !to || !weeks || !hoursPerWeek || !totalHours || !ratePerHour || !monthTotal) {
        toastr.error("Complete all teaching relief schedule fields.", "Error Message");
        return;
    }

    if (
        parseFloat(weeks) < 0 ||
        parseFloat(hoursPerWeek) < 0 ||
        parseFloat(totalHours) < 0 ||
        parseFloat(ratePerHour) < 0 ||
        parseFloat(monthTotal) < 0
    ) {
        toastr.error("Negative values are not allowed.", "Error Message");
        return;
    }

    const paymentId = $("#paymentIdHidden").val() || "0";

    const paymentPayload = {
        ApplicationsId: parseInt(applicationId),
        Id: parseInt(paymentId),
        Type: type,
        StartDate: formatDateForSave(from),
        EndDate: formatDateForSave(to),
        NumberOfWeeks: parseFloat(weeks),
        HoursPerWeek: parseFloat(hoursPerWeek),
        TotalNumberOfHours: parseFloat(totalHours),
        RatePerHour: parseFloat(ratePerHour),
        MonthTotal: parseFloat(monthTotal),
        Step: "Improvement of staff qualifications"
    };

    $.ajax({
        url: "Applications/UpdateImprovementOfStaffQualificationsPayments",
        type: "POST",
        data: JSON.stringify(paymentPayload),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            if (response.status === "Success") {
                clearPaymentForm();
                renderPayments(response.data || []);
                clearProject1Validation();

                toastr.success(
                    response.message || (paymentId !== "0"
                        ? "Payment updated successfully."
                        : "Payment added successfully."),
                    "Success Message"
                );
            } else {
                toastr.error(response.message || "Could not save payment.", "Error Message");
            }
        },
        error: function (xhr) {
            console.error("Project 1 payment save error:", xhr.responseText);
            toastr.error("An unexpected error occurred while saving the payment.", "Error");
        }
    });
}
function validateProject1Documents() {
    let isValid = true;

    const requiredTables = [
        { tableId: "ListofProject1ProofOfRegistrationFiles", label: "Proof of Registration" },
        { tableId: "ListofProject1SupervisorLetterFiles", label: "Supervisor Letter" },
        { tableId: "ListofProject1CostBreakdownFiles", label: "Cost Breakdown" }
    ];

    const teachingReliefSelected = $("#SupportRequired_TeachingRelief").is(":checked");
    const researchAssistanceSelected = $("#SupportRequired_ResearchAssistance").is(":checked");
    const financialSupportSelected = $("#SupportRequired_FinancialSupport").is(":checked");

    if (teachingReliefSelected) {
        requiredTables.push({ tableId: "ListofProject1TeachingReliefFiles", label: "Teaching Relief" });
    }

    if (researchAssistanceSelected) {
        requiredTables.push({ tableId: "ListofProject1ResearchAssistanceFiles", label: "Research Assistance" });
    }

    if (financialSupportSelected) {
        requiredTables.push({ tableId: "ListofProject1FinancialSupportFiles", label: "Financial Support" });
    }

    requiredTables.forEach(function (doc) {
        const existingCount = $("#" + doc.tableId + " tbody tr[data-existing='true']").length;

        if (existingCount === 0) {
            toastr.error(`${doc.label} document is required.`, "Error Message");
            isValid = false;
        }
    });

    return isValid;
}

function collectProject1UiState() {
    const supportRequired = $("input[name='SupportRequired']:checked")
        .map(function () {
            return $(this).val();
        })
        .get();

    const appointmentOption = $("input[name='AppointmentOption']:checked").val() || "";

    const temporaryAppointees = [];
    $("#temporaryAppointeesTable tbody tr[data-id]").each(function () {
        const cells = $(this).find("td");
        temporaryAppointees.push({
            surname: $(cells[0]).text().trim(),
            name: $(cells[1]).text().trim(),
            email: $(cells[2]).text().trim(),
            contactNumber: $(cells[3]).text().trim(),
            startDate: $(cells[4]).text().trim(),
            endDate: $(cells[5]).text().trim(),
            idOrPassport: $(cells[6]).text().trim(),
            staffStatus: $(cells[7]).text().trim()
        });
    });

    const teachingReliefSchedule = [];
    $("#teachingReliefScheduleTable tbody tr[data-id]").each(function () {
        const cells = $(this).find("td");
        teachingReliefSchedule.push({
            type: $(cells[0]).text().trim(),
            from: $(cells[1]).text().trim(),
            to: $(cells[2]).text().trim(),
            numberOfWeeks: $(cells[3]).text().trim(),
            hoursPerWeek: $(cells[4]).text().trim(),
            totalHours: $(cells[5]).text().trim(),
            ratePerHour: $(cells[6]).text().trim(),
            monthTotal: $(cells[7]).text().trim()
        });
    });

    return {
        Id: getSharedValue("#Id"),
        FundingCallDetailsId: getSharedValue("#FundingCallDetailsId"),
        UserId: getSharedValue("#UserId"),
        ApplicantCategory: getSharedValue("#ApplicantCategory"),
        AppointmentCategory: getSharedValue("#AppointmentCategory"),
        StudyingTowards: $("#StudyingTowards").val(),
        FirstYearRegistration: $("#FirstYearRegistration").val(),
        PlannedGraduationYear: $("#PlannedGraduationYear").val(),
        FieldOfStudy: $("#FieldOfStudy").val(),
        TitleOfThesis: $("#TitleOfThesis").val(),
        Describe: $("#Describe").val(),
        SupportRequired: supportRequired,
        AppointmentOption: appointmentOption ? [appointmentOption] : [],
        AppointmentDescribe: $("#AppointmentOtherText").val(),
        teachingReliefGrandTotal: parseCurrency($("#teachingReliefGrandTotal").val()),
        temporaryAppointees: temporaryAppointees,
        teachingReliefSchedule: teachingReliefSchedule
    };
}

function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

function isValidPhoneNumber(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/\s+/g, "");
    return /^[0-9]{10,15}$/.test(cleaned);
}
function emailExistsInAppointeeList(email, currentId) {
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedCurrentId = String(currentId || "0").trim();

    let exists = false;

    $("#temporaryAppointeesTable tbody tr[data-id]").each(function (index) {
        const rowId = String($(this).attr("data-id") || "0").trim();
        const rowEmail = ($(this).find("td").eq(2).text() || "").trim().toLowerCase();

        if (rowId !== normalizedCurrentId && rowEmail === normalizedEmail) {
            exists = true;
            return false;
        }
    });

    return exists;
}

function clearAppointeeValidation() {
    $("#appointeeSurname, #appointeeName, #appointeeEmail, #appointeeContact, #appointeeStartDate, #appointeeEndDate, #appointeeIdNumber, #appointeeStaffStatus")
        .removeClass("is-invalid");
}

function markInvalid(selector) {
    $(selector).addClass("is-invalid");
}
function validateTemporaryAppointeeForm() {
    clearAppointeeValidation();

    const surname = $("#appointeeSurname").val().trim();
    const name = $("#appointeeName").val().trim();
    const email = $("#appointeeEmail").val().trim();
    const contact = $("#appointeeContact").val().trim();
    const startDate = $("#appointeeStartDate").val();
    const endDate = $("#appointeeEndDate").val();
    const idNumber = $("#appointeeIdNumber").val().trim();
    const staffStatus = $("#appointeeStaffStatus").val().trim();
    const currentId = $("#appointeeIdHidden").val() || "0";

    if (!surname) {
        markInvalid("#appointeeSurname");
        toastr.error("Surname is required.", "Error Message");
        return false;
    }

    if (!name) {
        markInvalid("#appointeeName");
        toastr.error("Name is required.", "Error Message");
        return false;
    }

    if (!email) {
        markInvalid("#appointeeEmail");
        toastr.error("Email address is required.", "Error Message");
        return false;
    }

    if (!isValidEmail(email)) {
        markInvalid("#appointeeEmail");
        toastr.error("Please enter a valid email address.", "Error Message");
        return false;
    }

    if (emailExistsInAppointeeList(email, currentId)) {
        markInvalid("#appointeeEmail");
        toastr.error("This email address has already been added.", "Error Message");
        return false;
    }

    if (!contact) {
        markInvalid("#appointeeContact");
        toastr.error("Contact number is required.", "Error Message");
        return false;
    }

    if (!isValidPhoneNumber(contact)) {
        markInvalid("#appointeeContact");
        toastr.error("Please enter a valid contact number.", "Error Message");
        return false;
    }

    if (!startDate) {
        markInvalid("#appointeeStartDate");
        toastr.error("Start date is required.", "Error Message");
        return false;
    }

    if (!endDate) {
        markInvalid("#appointeeEndDate");
        toastr.error("End date is required.", "Error Message");
        return false;
    }

    const parsedStart = parseDdMmYyyy(startDate);
    const parsedEnd = parseDdMmYyyy(endDate);

    if (parsedStart && parsedEnd && parsedEnd < parsedStart) {
        markInvalid("#appointeeStartDate");
        markInvalid("#appointeeEndDate");
        toastr.error("End date cannot be earlier than start date.", "Error Message");
        return false;
    }

    if (!idNumber) {
        markInvalid("#appointeeIdNumber");
        toastr.error("ID or passport number is required.", "Error Message");
        return false;
    }

    if (!staffStatus) {
        markInvalid("#appointeeStaffStatus");
        toastr.error("Staff status is required.", "Error Message");
        return false;
    }

    return true;
}

function bindTemporaryAppointeeFieldValidation() {
    $("#appointeeEmail")
        .off("blur.appointee")
        .on("blur.appointee", function () {
            const email = $(this).val().trim();

            if (!email) {
                $(this).removeClass("is-invalid");
                return;
            }

            $(this).toggleClass("is-invalid", !isValidEmail(email));
        });

    $("#appointeeContact")
        .off("blur.appointee")
        .on("blur.appointee", function () {
            const phone = $(this).val().trim();

            if (!phone) {
                $(this).removeClass("is-invalid");
                return;
            }

            $(this).toggleClass("is-invalid", !isValidPhoneNumber(phone));
        });

    $("#appointeeEndDate, #appointeeStartDate")
        .off("change.appointee")
        .on("change.appointee", function () {
            const startDate = $("#appointeeStartDate").val();
            const endDate = $("#appointeeEndDate").val();

            $("#appointeeStartDate, #appointeeEndDate").removeClass("is-invalid");

            const parsedStart = parseDdMmYyyy(startDate);
            const parsedEnd = parseDdMmYyyy(endDate);

            if (parsedStart && parsedEnd && parsedEnd < parsedStart) {
                $("#appointeeStartDate, #appointeeEndDate").addClass("is-invalid");
            }
        });
    $("#appointeeIdNumber")
        .off("input.appointee")
        .on("input.appointee", function () {
            $("#appointeeStaffStatus").val("").removeClass("is-invalid");
        })
        .off("blur.appointee")
        .on("blur.appointee", function () {
            verifyTemporaryAppointeeStaffStatus();
        });
}
function bindPaymentScheduleFieldValidation() {
    $("#scheduleFrom, #scheduleTo")
        .off("change.payment")
        .on("change.payment", function () {
            const from = $("#scheduleFrom").val()?.trim();
            const to = $("#scheduleTo").val()?.trim();

            $("#scheduleFrom, #scheduleTo").removeClass("is-invalid");

            const parsedFrom = parseDdMmYyyy(from);
            const parsedTo = parseDdMmYyyy(to);

            if (from && !parsedFrom) {
                $("#scheduleFrom").addClass("is-invalid");
            }

            if (to && !parsedTo) {
                $("#scheduleTo").addClass("is-invalid");
            }

            if (parsedFrom && parsedTo && parsedTo < parsedFrom) {
                $("#scheduleFrom, #scheduleTo").addClass("is-invalid");
            }
        });

    $("#scheduleWeeks, #scheduleHoursPerWeek, #scheduleTotalHours, #scheduleRatePerHour, #scheduleMonthTotal")
        .off("input.payment")
        .on("input.payment", function () {
            let value = $(this).val();

            // remove negative sign
            value = value.replace(/-/g, "");

            // allow only numbers + decimal
            value = value.replace(/[^0-9.]/g, "");

            // prevent multiple decimals
            const parts = value.split(".");
            if (parts.length > 2) {
                value = parts[0] + "." + parts.slice(1).join("");
            }

            $(this).val(value);
        });

    $("#scheduleWeeks, #scheduleHoursPerWeek, #scheduleRatePerHour")
        .off("paste.payment")
        .on("paste.payment", function (e) {
            const pasted = (e.originalEvent || e).clipboardData.getData("text");

            if (pasted.includes("-")) {
                e.preventDefault();
                toastr.error("Negative values are not allowed.", "Error Message");
            }
        });
}
function clearTemporaryAppointeeForm() {
    $("#appointeeSurname, #appointeeName, #appointeeEmail, #appointeeContact, #appointeeStartDate, #appointeeEndDate, #appointeeIdNumber, #appointeeStaffStatus")
        .val("")
        .removeClass("is-invalid");

    $("#appointeeIdHidden").val("0");
    $("#btnAddAppointee").text("Add appointee");
    $("#btnClearAppointee").addClass("d-none");
}

function clearPaymentForm() {
    $("#scheduleType").val("");
    $("#scheduleFrom").val("");
    $("#scheduleTo").val("");
    $("#scheduleWeeks").val("");
    $("#scheduleHoursPerWeek").val("");
    $("#scheduleTotalHours").val("");
    $("#scheduleRatePerHour").val("");
    $("#scheduleMonthTotal").val("");
    $("#paymentIdHidden").val("");
    $("#btnClearPayment").addClass("d-none");
    $("#btnAddSchedule").text("Add");
}

function deleteTemporaryAppointee(temporaryAppointeeId) {
    const applicationId = getApplicationId();

    $.ajax({
        url: "Applications/DeleteTemporaryAppointee",
        type: "GET",
        data: {
            temporaryAppointeeId: temporaryAppointeeId,
            applicationsId: applicationId
        },
        success: function (response) {
            if (response.status === "Success") {
                renderTemporaryAppointees(response.data || []);
                clearTemporaryAppointeeForm();
                clearProject1Validation();
                toastr.success(response.message || "Temporary appointee deleted successfully", "Success");
            } else {
                toastr.error(response.message || "Could not delete temporary appointee", "Error");
            }
        },
        error: function () {
            toastr.error("An unexpected error occurred while deleting temporary appointee", "Error");
        }
    });
}

function deletePayment(paymentId) {
    const applicationId = getApplicationId();

    $.ajax({
        url: "Applications/DeletePayment",
        type: "GET",
        data: {
            paymentId: paymentId,
            applicationsId: applicationId
        },
        success: function (response) {
            if (response.status === "Success") {
                renderPayments(response.data || []);
                clearPaymentForm();
                clearProject1Validation();
                toastr.success(response.message || "Payment deleted successfully", "Success");
            } else {
                toastr.error(response.message || "Could not delete payment", "Error");
            }
        },
        error: function () {
            toastr.error("An unexpected error occurred while deleting payment", "Error");
        }
    });
}

function renderTemporaryAppointees(items) {
    currentTemporaryAppointees = items || [];

    const $tbody = $("#temporaryAppointeesTable tbody");
    $tbody.empty();

    if (!currentTemporaryAppointees.length) {
        $tbody.append(`<tr class="empty-row"><td colspan="9">No temporary appointees added.</td></tr>`);
        return;
    }

    currentTemporaryAppointees.forEach(function (item) {
        const rowId = item.id || item.Id || 0;
        const surname = item.surname || item.Surname || "";
        const name = item.name || item.Name || "";
        const email = item.emailAddress || item.EmailAddress || "";
        const contact = item.contactNumber || item.ContactNumber || "";
        const startDate = item.startDate || item.StartDate || "";
        const endDate = item.endDate || item.EndDate || "";
        const idNumber = item.idNumber || item.IDNumber || "";
        const maskedIdNumber =
            idNumber && idNumber.trim() !== "" && idNumber.length > 4
                ? "*******"
                : idNumber;


        const staffStatus = item.staffStatus || item.StaffStatus || "";

        $tbody.append(`
            <tr data-id="${rowId}">
                <td>${escapeHtml(surname)}</td>
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(email)}</td>
                <td>${escapeHtml(contact)}</td>
                <td>${escapeHtml(formatDateForDisplay(startDate))}</td>
                <td>${escapeHtml(formatDateForDisplay(endDate))}</td>
                <td>${escapeHtml(maskedIdNumber)}</td>
                <td>${escapeHtml(staffStatus)}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-warning btn-edit-appointee" data-id="${rowId}">
                        Edit
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-delete-appointee" data-id="${rowId}">
                        Delete
                    </button>
                </td>
            </tr>
        `);
    });
}

function renderPayments(items) {
    const $tbody = $("#teachingReliefScheduleTable tbody");
    currentPayments = items || [];
    $tbody.empty();

    if (!items || !items.length) {
        $tbody.append(`<tr class="empty-row"><td colspan="9">No payments added.</td></tr>`);
        $("#teachingReliefGrandTotal").val("");
        return;
    }

    items.forEach(function (item) {
        const rowId = item.id || item.Id || 0;
        const type = item.type || item.Type || "";
        const startDate = item.startDate || item.StartDate || "";
        const endDate = item.endDate || item.EndDate || "";
        const numberOfWeeks = item.numberOfWeeks || item.NumberOfWeeks || "";
        const hoursPerWeek = item.hoursPerWeek || item.HoursPerWeek || "";
        const totalNumberOfHours = item.totalNumberOfHours || item.TotalNumberOfHours || "";
        const ratePerHour = item.ratePerHour || item.RatePerHour || "";
        const monthTotal = item.monthTotal || item.MonthTotal || "";

        $tbody.append(`
            <tr data-id="${rowId}">
                <td>${escapeHtml(type)}</td>
                <td>${escapeHtml(formatDateForDisplay(startDate))}</td>
                <td>${escapeHtml(formatDateForDisplay(endDate))}</td>
                <td>${escapeHtml(numberOfWeeks)}</td>
                <td>${escapeHtml(hoursPerWeek)}</td>
                <td>${escapeHtml(totalNumberOfHours)}</td>
                <td>${escapeHtml(formatRandDisplay(ratePerHour))}</td>
                <td>${escapeHtml(formatRandDisplay(monthTotal))}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-warning btn-edit-payment" data-id="${rowId}">Edit</button>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-delete-payment" data-id="${rowId}">Delete</button>
                </td>
            </tr>
        `);
    });

    updateTeachingReliefGrandTotal(items);
}
function editTemporaryAppointee(id) {
    const $row = $(`#temporaryAppointeesTable tbody tr[data-id='${id}']`);
    if (!$row.length) return;

    const cells = $row.find("td");

    clearAppointeeValidation();

    $("#appointeeSurname").val($(cells[0]).text().trim());
    $("#appointeeName").val($(cells[1]).text().trim());
    $("#appointeeEmail").val($(cells[2]).text().trim());
    $("#appointeeContact").val($(cells[3]).text().trim());
    $("#appointeeStartDate").val(formatDateForInput($(cells[4]).text().trim()));
    $("#appointeeEndDate").val(formatDateForInput($(cells[5]).text().trim()));
    $("#appointeeIdNumber").val($(cells[6]).text().trim());
    $("#appointeeStaffStatus").val($(cells[7]).text().trim());
    $("#appointeeIdHidden").val(id);

    $("#btnAddAppointee").text("Update appointee");
    $("#btnClearAppointee").removeClass("d-none");

    $("html, body").animate(
        { scrollTop: $("#appointeeSurname").offset().top - 120 },
        300
    );
}
function initialiseProject1DatePickers() {
    flatpickr("#appointeeStartDate, #appointeeEndDate, #scheduleFrom, #scheduleTo", {
        dateFormat: "d/m/Y",
        allowInput: true
    });
}
function formatRandDisplay(value) {
    if (value === null || value === undefined || value === "") return "";

    const number = parseFloat(
        value.toString()
            .replace(/R/g, "")
            .replace(/,/g, "")
            .replace(/\s/g, "")
            .trim()
    );

    if (isNaN(number)) return "";

    const parts = number.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return "R" + parts.join(".");
}
function formatDateForDisplay(value) {
    if (!value) return "";

    const trimmed = value.toString().trim();

    // already dd/MM/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
        return trimmed;
    }

    // yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [year, month, day] = trimmed.split("-");
        return `${day}/${month}/${year}`;
    }

    // ISO date like 2026-04-21T00:00:00
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (isoMatch) {
        return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }

    return trimmed;
}

function formatDateForInput(value) {
    if (!value) return "";

    const trimmed = value.toString().trim();

    // already dd/MM/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
        return trimmed;
    }

    // yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [year, month, day] = trimmed.split("-");
        return `${day}/${month}/${year}`;
    }

    // ISO date like 2026-04-21T00:00:00
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (isoMatch) {
        return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }

    return trimmed;
}
function formatDateForSave(value) {
    if (!value) return "";

    const trimmed = value.trim();

    // dd/MM/yyyy -> yyyy-MM-dd
    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return trimmed;
}
function parseDdMmYyyy(value) {
    if (!value) return null;

    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);

    return new Date(year, month, day);
}
function renderProject1InitialTables() {
    const container = document.getElementById("project1Data");
    if (!container) return;

    const tempAppointees = JSON.parse(container.getAttribute("data-temp-appointees") || "[]");
    const payments = JSON.parse(container.getAttribute("data-payments") || "[]");

    renderTemporaryAppointees(tempAppointees);
    renderPayments(payments);
}
function editPayment(id) {
    const $row = $(`#teachingReliefScheduleTable tbody tr[data-id='${id}']`);
    if (!$row.length) return;

    const cells = $row.find("td");

    $("#scheduleType").val($(cells[0]).text().trim());
    $("#scheduleFrom").val(formatDateForInput($(cells[1]).text().trim()));
    $("#scheduleTo").val(formatDateForInput($(cells[2]).text().trim()));
    $("#scheduleWeeks").val($(cells[3]).text().trim());
    $("#scheduleHoursPerWeek").val($(cells[4]).text().trim());
    $("#scheduleTotalHours").val($(cells[5]).text().trim());
    $("#scheduleRatePerHour").val(parseCurrency($(cells[6]).text().trim()));
    $("#scheduleMonthTotal").val(parseCurrency($(cells[7]).text().trim()));
    $("#paymentIdHidden").val(id);

    $("#btnClearPayment").removeClass("d-none");

    $("#btnAddSchedule").text("Update");

    $("html, body").animate({
        scrollTop: $("#scheduleType").offset().top - 120
    }, 300);
}

function parseCurrency(value) {
    if (!value) return "0.00";

    const number = parseFloat(
        value.toString()
            .replace(/[Rr$€£]/g, "")
            .replace(/\s/g, "")
            .replace(/,/g, ".")
            .replace(/[^0-9.]/g, "")
            .trim()
    );

    if (isNaN(number)) return "0.00";

    return number.toFixed(2);
}
function escapeHtml(value) {
    return $("<div>").text(value ?? "").html();
}