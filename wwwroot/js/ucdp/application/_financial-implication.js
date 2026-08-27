$(document).ready(function () {

    document.querySelectorAll('.tri-state-slider').forEach(slider => {
        const container = slider.closest('.uj-switch-toggle');
        const hiddenInput = container.querySelector('input[type="hidden"]');
        const handle = slider.querySelector('.slider-handle');

        // Initialize visual state
        const initialValue = hiddenInput.value;
        if (initialValue === "true") slider.classList.add("on");
        else if (initialValue === "false") slider.classList.add("off");
        else slider.classList.add("null"); // initial null

        slider.addEventListener('click', (e) => {
            if (slider.dataset.disabled === "true") return;
            slider.classList.remove("has-error");

            const rect = slider.getBoundingClientRect();
            const clickX = e.clientX - rect.left; // click relative to slider
            const sliderMid = rect.width / 2;

            let nextValue;

            if (initialValue === "") {

                nextValue = clickX < sliderMid ? "false" : "true"; // left = No, right = Yes
            } else {

                nextValue = hiddenInput.value === "true" ? "false" : "true";
            }

            hiddenInput.value = nextValue;

            // Update visual state
            slider.classList.remove("on", "off", "null");
            slider.classList.add(nextValue === "true" ? "on" : "off");

            if (hiddenInput.id === "affiliatedSwitch") {
                if (nextValue === "true") affiliationFields.classList.remove("d-none");
                else affiliationFields.classList.add("d-none");
            }

            hiddenInput.dispatchEvent(new Event('valueChanged'));
        });
    });

    document.getElementById('FlightsChooseCheapest').addEventListener('valueChanged', toggleFlightsExplanation);
    document.getElementById('AccomChooseCheapest').addEventListener('valueChanged', toggleAccomExplanation);

    toggleFlightsExplanation();
    toggleAccomExplanation();

    //=========================/Docs Management//=========================/
    $("#btnAddTravelFlights").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('travelFlightsFile');
        var listElement = $("#travelFlightsFilesList li");
        var $btn = $(this);

        saveDocuments(e, input, $btn, 9, listElement, 3);
    });

    $("#btnAddTravelAccom").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('travelAccomFile');
        var listElement = $("#travelAccomFilesList li");
        var $btn = $(this);

        saveDocuments(e, input, $btn, 10, listElement, 3);
    });

    // When a "View" button is clicked for a proof file
    $(document).on('click', '.view-file', function (e) {
        e.preventDefault();
        var baseUrl = window.config.basePath;
        var $btn = $(this);
        // Prefer explicit data-docurl (constructed via Url.Action in the view)
        var fileUrl = $btn.data('docurl');
        // Fallback to building a URL by document id
        if (!fileUrl) {
            var docId = $btn.data('document-id');
            fileUrl = baseUrl + '/Applications/ViewDocument?documentId=' + encodeURIComponent(docId);
        }

        // Set iframe src and show modal
        $('#documentViewerIframe').attr('src', fileUrl);
        $('#documentViewerModal').modal('show');
    });

    // Clear iframe src when modal hidden to stop PDF loading/playing
    $('#documentViewerModal').on('hidden.bs.modal', function () {
        $('#documentViewerIframe').attr('src', '');
    });

    var _pendingDelete = null;
    $(document).on('click', '.delete-file', function (e) {
        e.preventDefault();
        var $btn = $(this);
        var docId = $btn.data('document-id');
        var filename = $btn.data('filename') || '';

        if (!docId) {
            toastr.error("Invalid document id.", 'Error Message');
            return;
        }

        //store pending deletion info
        _pendingDelete = { docId: docId, filename: filename, $btn: $btn };

        // update modal message to include filename
        $('#deleteFileModal').find('.modal-body label').text('Are you sure you want to delete "' + filename + '"?');

        // show bootstrap modal
        var modalEl = document.getElementById('deleteFileModal');
        var bs = new bootstrap.Modal(modalEl);
        bs.show();
    });

    // Confirm delete from modal
    $('#btnSubmitDeleteFile').on('click', function (e) {
        if (!_pendingDelete) {
            return;
        }
        var docId = _pendingDelete.docId;
        var $btn = _pendingDelete.$btn;

        // hide modal
        var modalEl = document.getElementById('deleteFileModal');
        var bsInstance = bootstrap.Modal.getInstance(modalEl);
        if (bsInstance) {
            bsInstance.hide();
        }

        // call deleteDocument and pass the originating button so UI removal works correctly
        deleteDocument(docId, $btn);

        // clear pending
        _pendingDelete = null;
    });

    //=========================/Event handlers//=========================/

    $("#submitApplication").on('click', function (e) {

        e.preventDefault();

        clearValidations();

        const validationResult = validControlValues();
        var validContributions = _validContributions();

        if (!validationResult.isValid) {
            renderFinancialImplicationValidation(validationResult.errors);
            focusFirstFinancialImplicationError();
        }

        if (!validContributions.isValid) {
            renderFinancialImplicationValidation(validContributions.errors);
            focusFirstFinancialImplicationError();
        }

        if (!validationResult.isValid || !validContributions.isValid) {
            return;
        }

        var modalEl = document.getElementById('myTermsAndCondition');
        if (modalEl && window.bootstrap) {
            var bs = new bootstrap.Modal(modalEl);
            bs.show();
        } else {
            $("#acceptTerms").trigger('click');
        }
    });

    $("#acceptTerms").on('click', function (e) {

        var formData = new FormData();
        formData.append("ApplicationId", $("#Id").val());

        var flightChecked = $("#FlightsChooseCheapest").val();
        var flightExplanation = $("#FlightsCheapestExplanation").val();
        var accomChecked = $("#AccomChooseCheapest").val();
        var accomExplanation = $("#AccomCheapestExplanation").val();

        formData.append("FinancialMotivation", $("#FinancialMotivation").val());
        formData.append("ApplicantProgress", $("#ApplicantProgress").val());
        formData.append("OutputMeasure", $("#OutputMeasure").val());

        formData.append("OtherFunding", transformAmount($("#OtherFunding").val()));
        formData.append("FacultyContibution", transformAmount($("#FacultyContibution").val()));
        formData.append("DepartmentContribution", transformAmount($("#DepartmentContribution").val()));
        formData.append("ResearchFundsContribution", transformAmount($("#ResearchFundsContribution").val()));
        formData.append("DHETFundsRequested", transformAmount($("#DHETFundsRequested").val()));
        formData.append("TotalCost", transformAmount($("#TotalCost").val()));
        formData.append("ApprovedAmount", transformAmount($("#ApprovedAmount").val() || ""));

        formData.append("OtherFundingSource", $("#OtherFundingSource").val());

        formData.append("FlightsCheapestExplanation", flightExplanation);
        formData.append("FlightsChooseCheapest", flightChecked);
        formData.append("AccomChooseCheapest", accomChecked);
        formData.append("AccomCheapestExplanation", accomExplanation);

        submitApplication(e, formData);
    });

    $("#btnApprove").on('click', function (e) {

        clearValidations();

        var result = validFundAdminControls();
        var _result = validSiaDirectorControls();

        if (!result.isValid) {
            renderFinancialImplicationValidation(result.errors);
            focusFirstFinancialImplicationError();
        }

        if (!_result.isValid) {
            renderFinancialImplicationValidation(_result.errors);
            focusFirstFinancialImplicationError();
        }

        if (!result.isValid || !_result.isValid) {
            return;
        }

        var formData = new FormData();
        formData.append("ApplicationId", $("#Id").val());
        formData.append("ReferenceId", $("#ReferenceId").val());
        formData.append("CurrentApproverStaffNumber", $("#CurrentApproverStaffNumber").val());
        formData.append("ApplicationStatusId", $("#ApplicationStatusId").val());
        formData.append("FundAdminApprovedAmount", transformAmount($("#FundAdminApprovedAmount").val()));
        formData.append("FundAdminComment", $("#FundAdminComment").val());
        formData.append("FundingCallsId", $("#FundingCallsId").val());
        formData.append("ApprovedAmount", transformAmount($("#ApprovedAmount").val()));
        formData.append("SIAComment", $("#SIAComment").val());
        formData.append("IsTemporaryViceDeanApprover", $("#IsTemporaryViceDeanApprover").val());
        formData.append("IsTemporaryHODApprover", $("#IsTemporaryHODApprover").val());
        formData.append("IsTemporaryFundAdminApprover", $("#IsTemporaryFundAdminApprover").val());
        formData.append("IsTemporarySiaDirectorApprover", $("#IsTemporarySiaDirectorApprover").val());
        approveApplication(e, formData);
    });

    initialiseDeclineApplicationModal();
    initialiseRFIApplicationModal();

    preventNonNumericInput();
    $("#btnBackFinance").on('click', function (e) {

        e.preventDefault();

        if (isReadOnlyMode()) {
            goToPreviousStep("SupportingInformationTab");
            return false;
        }

        goToPreviousStep("SupportingInformationTab");
    });

    initialiseClipboard();
});

function toggleFlightsExplanation() {
    const flightChooseCheapestValue = document.getElementById("FlightsChooseCheapest")?.value;
    var wrap = document.getElementById('FlightsCheapestExplanationWrapper');
    if (wrap) wrap.style.display = flightChooseCheapestValue === 'false' ? 'block' : 'none';
}
function toggleAccomExplanation() {
    const accomChooseCheapestValue = document.getElementById("AccomChooseCheapest")?.value;
    var wrap = document.getElementById('AccomCheapestExplanationWrapper');
    if (wrap) wrap.style.display = accomChooseCheapestValue === 'false' ? 'block' : 'none';
}


//===============================================================/API Calls/===============================================================//
function hideModal(modalShown) {
    if (modalShown) {
        $('#loadingModal').modal('hide');
    } else {
        // Modal wasn't fully shown yet, wait and hide
        $('#loadingModal').one('shown.bs.modal', function () {
            $(this).modal('hide');
        });
    }
}

function saveDocuments(e, input, $btn, fileUploadType, listElement, documentCountLimit) {

    if (!input || input.files.length === 0) {
        toastr.error("Please select a PDF to upload.", 'Error Message');
        return;
    }
    var listFileCount = 0;
    listElement.each(function () {
        var txt = $(this).text().trim();
        if (txt && !/No documents attached/i.test(txt)) {
            listFileCount++;
        }
    });
    if (listFileCount == documentCountLimit || listFileCount > documentCountLimit) {
        toastr.error("All required documents have been uploaded. If you want to replace a document, please delete it first", 'Error Message');
        return;
    }

    for (var i = 0; i < input.files.length; i++) {
        var sizeLimitValid = validateFileSizeLimit(input.files[i]);
        var fileTypeValid = validateFileType(input.files[i]);
        var differentFile = validateFileAlreadyUploaded(input.files[i], listElement);
        if (!sizeLimitValid || !fileTypeValid || !differentFile) {
            return;
        }
    }


    var formData = new FormData();
    for (var i = 0; i < input.files.length; i++) {
        formData.append("files", input.files[i]);
    }
    formData.append("UploadType", fileUploadType);
    saveDocumentsAPICall(e, formData);
}

function saveDocumentsAPICall(e, formData) {
    var baseUrl = window.config.basePath;
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });

    formData.append("Id", $("#Id").val());
    $.ajax({
        url: baseUrl + "/Applications/UploadQuoteDocuments",
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideModal(modalShown);
            if (data.status === "Saved") {
                toastr.success("Documents saved Successfully", 'Success Message');
                var docs = data.message || [];
                if (docs) {
                    renderUploadedDocuments(Array.isArray(docs) ? docs : [docs]);
                }
            }
            else {
                hideModal(modalShown);
                e.preventDefault();
                toastr.error("Error occured while saving documents", 'Error Message');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            hideModal(modalShown);
            toastr.error("Error occured while saving documents", 'Error Message');
        }
    });
}

function deleteDocument(docId, $btn) {
    var baseUrl = window.config.basePath;
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });
    $.ajax({
        url: baseUrl + '/Applications/DeleteDocument',
        type: 'GET',
        data: { documentId: docId },
        success: function (data) {
            hideModal(modalShown);
            // ActionResult returns Json { status = "true", message = "" } in controller.
            var ok = data === true || data.status === true || data.status === "true" || data.status === "ok" || data.length == 0;
            if (ok) {
                toastr.success("Document deleted successfully", 'Success Message');
                // remove the list item containing the button
                var $li = $btn.closest('li');
                var $list = $li.closest('ul, ol');
                $li.remove();

                // If list is empty, append the placeholder row similar to server-rendered markup
                if ($list.length && $list.find('li').length === 0) {
                    $list.append('<li class="py-2 border-bottom text-muted">No documents attached.</li>');
                }
            } else {
                toastr.error("Error occurred while deleting document", 'Error Message');
            }
        },
        error: function () {
            hideModal(modalShown);
            toastr.error("Error occurred while deleting document", 'Error Message');
        }
    });
}

function submitApplication(e, formData) {
    var baseUrl = window.config.basePath;
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });

    $.ajax({
        url: baseUrl + "/Applications/SubmitApplication",
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideModal(modalShown);
            if (data.status === "Saved") {
                toastr.success("Application submitted Successfully", 'Success Message');
                $(".btn-close").trigger('click');
                window.location.href = baseUrl + '/Ucdp/Index';
            }
            else {
                hideModal(modalShown);
                e.preventDefault();
                toastr.error("Error occured while submitting application", 'Error Message');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            hideModal(modalShown);
            toastr.error("Error occured while submitting application", 'Error Message');
        }
    });
}

function approveApplication(e, formData) {
    var baseUrl = window.config.basePath;
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });

    $.ajax({
        url: baseUrl + "/Applications/ApproveApplication",
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideModal(modalShown);
            if (data.status === "Saved") {
                toastr.success("Application approved Successfully", 'Success Message');
                setTimeout(function () { window.location.href = baseUrl + '/Ucdp/Applications'; }, 1000);
            }
            else {
                hideModal(modalShown);
                e.preventDefault();
                toastr.error("Error occured while approving application", 'Error Message');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            hideModal(modalShown);
            toastr.error("Error occured while approving application", 'Error Message');
        }
    });
}

function updateApplicationStatus(e,formData, modalEl, url, commentId, successMessage) {

    formData.append("IsTemporaryViceDeanApprover", $("#IsTemporaryViceDeanApprover").val());
    formData.append("IsTemporaryHODApprover", $("#IsTemporaryHODApprover").val());
    formData.append("IsTemporaryFundAdminApprover", $("#IsTemporaryFundAdminApprover").val());
    formData.append("IsTemporarySiaDirectorApprover", $("#IsTemporarySiaDirectorApprover").val());

    var baseUrl = window.config.basePath;
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });

    $.ajax({
        url: baseUrl + url,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideModal(modalShown);
            if (data.status === "Saved") {
                toastr.success(successMessage, 'Success Message');

                $(commentId).val('');
                var bsInstance = bootstrap.Modal.getInstance(modalEl);
                if (bsInstance) { bsInstance.hide(); }
                setTimeout(function () { window.location.href = baseUrl + '/Ucdp/Applications'; }, 1000);
            }
            else {
                hideModal(modalShown);
                e.preventDefault();
                toastr.error("Error occured while updating the application", 'Error Message');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            hideModal(modalShown);
            toastr.error("Error occured while updating the application", 'Error Message');
        }
    });
}
//===============================================================/Helper functions/===============================================================//

function preventNonNumericInput() {
    var restrictIds = [
        'OtherFunding',
        'FacultyContibution',
        'DepartmentContribution',
        'ResearchFundsContribution',
        'DHETFundsRequested',
        'FundAdminApprovedAmount',
        'ApprovedAmount'
    ];

    restrictIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;

        // Prevent non-numeric key presses (allow control keys, arrows, digits, dot and comma)
        el.addEventListener('keydown', function (e) {
            // allow shortcuts (ctrl/cmd + C/V/X/A), allow meta keys
            if (e.ctrlKey || e.metaKey) return;

            var allowedKeyCodes = [
                8, 9, 13, 27, 46,    // backspace, tab, enter, esc, delete
                35, 36,               // end, home
                37, 38, 39, 40,       // arrows
                110, 190,             // numpad dot, dot
                188                   // comma
            ];

            var kc = e.keyCode;
            // digits (top row) 48-57, numpad 96-105
            var isDigit = (kc >= 48 && kc <= 57) || (kc >= 96 && kc <= 105);

            if (isDigit || allowedKeyCodes.indexOf(kc) !== -1) {
                return;
            }
            // prevent everything else
            e.preventDefault();
        });

        // On paste, sanitize after paste
        el.addEventListener('paste', function (e) {
            setTimeout(function () { formatAmount(el); }, 0);
        });

        // On input (covers mobile, IME, drag/drop) sanitize & format
        el.addEventListener('blur', function () {
            // Avoid running on every tiny change twice; formatAmount will call calculateTotalCost
            formatAmount(el);
        });

        // If the markup uses inline onkeyup/onkeydown="formatAmount()", the above will also keep values correct.
    });
}

// Helper: parse a formatted string (e.g. "5,000,000.00") to a Number
function parseToNumber(str) {
    if (str === undefined || str === null) return 0;
    var s = String(str).trim();
    if (s === "") return 0;
    // remove everything except digits, dot and minus
    s = s.replace(/[^0-9.\-]/g, "");
    // if more than one dot, keep first and join the rest
    var parts = s.split('.');
    if (parts.length > 2) {
        s = parts.shift() + '.' + parts.join('');
    }
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
}

// Helper: format a Number to the requested format "5,000,000.00"
function formatNumberForDisplay(num) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

function formatAmount(inputEl) {
    // Determine element: either passed explicitly or the currently focused element
    var el = inputEl || document.activeElement;
    if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;

    // Only apply formatting to known monetary inputs
    var monetaryIds = [
        'OtherFunding',
        'FacultyContibution',
        'DepartmentContribution',
        'ResearchFundsContribution',
        'DHETFundsRequested',
        'FundAdminApprovedAmount',
        'ApprovedAmount'
    ];
    if (monetaryIds.indexOf(el.id) === -1) return;

    var oldVal = el.value || "";

    // Preserve caret position relative to the numeric characters (digits + dot)
    var selStart = (typeof el.selectionStart === 'number') ? el.selectionStart : null;
    var leftPart = selStart !== null ? oldVal.substring(0, selStart) : "";
    var numericCharsLeft = leftPart.replace(/[^0-9.]/g, '').length;

    // If empty, leave empty
    if (!oldVal || oldVal.toString().trim() === "") {
        el.value = "";
        el.setAttribute('data-raw', '0');
        calculateTotalCost();
        if (selStart !== null && el.setSelectionRange) el.setSelectionRange(0, 0);
        return;
    }

    // Parse and format
    var num = parseToNumber(oldVal);
    var newVal = formatNumberForDisplay(num);
    if (newVal === "0.00") {
        newVal = "0";
    }

    // Apply new value and store raw
    el.value = newVal;
    el.setAttribute('data-raw', String(num));

    // Restore caret: map numericCharsLeft to position in newVal
    if (selStart !== null && typeof el.setSelectionRange === 'function') {
        var cnt = 0;
        var newPos = 0;
        for (var i = 0; i < newVal.length; i++) {
            if (/[0-9.]/.test(newVal[i])) cnt++;
            if (cnt >= numericCharsLeft) { newPos = i + 1; break; }
        }
        if (cnt < numericCharsLeft) newPos = newVal.length;
        // Ensure position is within bounds
        newPos = Math.max(0, Math.min(newVal.length, newPos));
        el.setSelectionRange(newPos, newPos);
    }

    // Recalculate total
    calculateTotalCost();
}

function calculateTotalCost() {
    var sourceIds = [
        'OtherFunding',
        'FacultyContibution',
        'DepartmentContribution',
        'ResearchFundsContribution',
        'DHETFundsRequested'
    ];

    var total = 0;
    sourceIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        // prefer stored raw value, fallback to parsing the displayed value
        var raw = el.getAttribute('data-raw');
        var num = raw !== null ? parseFloat(raw) : parseToNumber(el.value);
        if (isNaN(num)) num = 0;
        total += num;
    });

    var formatted = formatNumberForDisplay(total);
    var totalEl = document.getElementById('TotalCost');
    if (totalEl) {
        // Set formatted display. (Note: the view currently uses type="number" for TotalCost;
        // browsers may not show commas for number inputs. If you need commas reliably,
        // change the input in the .cshtml to type="text".)
        totalEl.value = formatted;
        totalEl.setAttribute('data-raw', String(total));
    }
}

function transformAmount(value) {
    if (value === null || value === undefined || value === "") {
        return "0";
    }

    return value.toString()
        .replace(/R/g, "")
        .replace(/,/g, "")
        .replace(/ /g, "")
        .trim();
}

function validControlValues() {

    const errors = {};
    var isValid = true;

    var flightChecked = $("#FlightsChooseCheapest").val();
    var flightExplanation = $("#FlightsCheapestExplanation").val();
    var accomChecked = $("#AccomChooseCheapest").val();
    var accomExplanation = $("#AccomCheapestExplanation").val();

    const travelFlightFilesList = $("#travelFlightsFilesList");
    var flightFilesCount = 0;

    travelFlightFilesList.find("li").each(function () {
        var txt = $(this).text().trim();
        if (txt && !/No documents attached/i.test(txt)) {
            flightFilesCount++;
        }
    });


    if (flightChecked != '') {
        if (flightFilesCount == 0) {
            toastr.error("Please upload flight quotation", 'Error Message');
            errors["#travelFlightsFile"] = "";
        }
    }
    if (flightFilesCount > 0 && flightChecked == '') {
        toastr.error("Please confirm whether you will proceed with the lowest flight quotation.", 'Error Message');
        isValid = false;
    } else if (flightFilesCount > 0 && (flightChecked == 'false' && flightExplanation == '')) {
        toastr.error("Please explain why you are not selecting the lowest flight quotation.", 'Error Message');
        errors["#FlightsCheapestExplanation"] = "Explanation is required.";
    }


    const travelAccomFilesList = $("#travelAccomFilesList");
    var accomFilesCount = 0;

    travelAccomFilesList.find("li").each(function () {
        var txt = $(this).text().trim();
        if (txt && !/No documents attached/i.test(txt)) {
            accomFilesCount++;
        }
    });

    if (accomChecked != '') {
        if (accomFilesCount == 0) {
            toastr.error("Please upload accomodation quotation", 'Error Message');
            errors["#travelAccomFile"] = "";
        }
    }
    if (accomFilesCount > 0 && accomChecked == '') {
        toastr.error("Please confirm whether you will proceed with the lowest accomodation quotation.", 'Error Message');
        isValid = false;
    } else if (accomFilesCount > 0 && (accomChecked == 'false' && accomExplanation == '')) {
        toastr.error("Please explain why you are not selecting the lowest accomodation quotation.", 'Error Message');
        errors["#AccomCheapestExplanation"] = "Explanation is required.";
    }

    if ($("#FinancialMotivation").val() === '') {
        toastr.error('Motivation for financial support is required', 'Error Message');
        errors["#FinancialMotivation"] = "Financial Motivation is required.";
        isValid = false;
    }
    if ($("#ApplicantProgress").val() === '') {
        toastr.error('Progress Of Application is required', 'Error Message');
        errors["#ApplicantProgress"] = "Application Progress is required.";
        isValid = false;
    }
    if ($("#OutputMeasure").val() === '') {
        toastr.error('State The Measurable Output is required', 'Error Message');
        errors["#OutputMeasure"] = "Output Measure is required.";
        isValid = false;
    }

    if ($("#OtherFundingSource").val() == '' && transformAmount($("#OtherFunding").val()) != 0) {
        toastr.error('Please provide source of other funding', 'Error Message');
        errors["#OtherFundingSource"] = "Funding source is required.";
        isValid = false;
    }
    return {
        isValid: Object.keys(errors).length === 0 && isValid,
        errors: errors
    };
}

function _validContributions() {
    const errors = {};
    var isValid = true;

    var total = transformAmount($("#TotalCost").val());
    if (Number(total) > 1000000.00) {
        toastr.error('The total cost cannot be more than R1,000,000.00', 'Error Message');
        errors["#TotalCost"] = "Total cost is invalid";
    }

    var dhetContribution = transformAmount($("#DHETFundsRequested").val());
    if (dhetContribution == 0) {
        toastr.error('DHET funds requested is required', 'Error Message');
        errors["#DHETFundsRequested"] = "DHET funds requested is required";
    }

    return {
        isValid: Object.keys(errors).length === 0 && isValid,
        errors: errors
    };
}

function validFundAdminControls() {
    const errors = {};
    var isFundAdmin = $("#IsFundAdministrator").val();
    if (!isFundAdmin) {
        return {
            isValid: true,
            errors: errors
        };
    } else {
        var approvedAmount = transformAmount($("#FundAdminApprovedAmount").val());
        var budget = transformAmount($("#FundingBudgetAvailable").val());
        if (Number(approvedAmount) > Number(budget)) {
            toastr.error('Approved amount cannot be more than the available budget', 'Error Message');
            errors["#FundAdminApprovedAmount"] = "Approved amount is invalid";

        }
        var dhetFunds = transformAmount($("#DHETFundsRequested").val());
        if (Number(approvedAmount) > Number(dhetFunds)) {
            toastr.error('Approved amount cannot be more than the DHET requested amount', 'Error Message');
            errors["#FundAdminApprovedAmount"] = "Approved amount is invalid";

        }
        if (Number(approvedAmount) == 0) {
            toastr.error('Approved amount has to be greater than 0', 'Error Message');
            errors["#FundAdminApprovedAmount"] = "Approved amount is invalid";
        }
        var fundAdminComment = $("#FundAdminComment").val();
        if (fundAdminComment == '') {
            toastr.error('Please enter a value for Fund Admin Comment', 'Error Message');
            errors["#FundAdminComment"] = "Fund Admin comment is required.";
        }
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

function validSiaDirectorControls() {
    const errors = {};
    var isSiaDirector = $("#IsSIADirector").val();
    if (!isSiaDirector) {
        return {
            isValid: true,
            errors: errors
        };
    } else {
        var approvedAmount = transformAmount($("#ApprovedAmount").val());
        if (Number(approvedAmount) == 0) {
            toastr.error('Approved amount has to be greater than 0', 'Error Message');
            errors["#ApprovedAmount"] = "Approved amount is invalid";
        }
        var fundAdminComment = $("#SIAComment").val();
        if (fundAdminComment == '') {
            toastr.error('Please enter a value for SIA Director Comment', 'Error Message');
            errors["#SIAComment"] = "SIA Director comment is required.";
        }
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

const MAX_SIZE = 5 * 1024 * 1024;
function validateFileSizeLimit(file) {
    if (file.size > MAX_SIZE) {
        toastr.error("File too large. Must be under 5MB.");
        return false;
    }
    return true;
}

function validateFileType(file) {
    if (file.type !== "application/pdf") {
        toastr.error("Invalid file type. Only PDF files are allowed.");
        return false;
    }
    return true;
}

function validateFileAlreadyUploaded(file, $list) {
    // Return true = OK to upload (no duplicate). Return false = duplicate found (stop upload).
    if (!file || !file.name) return true;
    var filename = file.name.trim().toLowerCase();

    // Normalize $list input: accept a jQuery collection, selector string, DOM element(s) or undefined.
    var $items;
    if (!$list) {
        $items = $(
            '#travelFlightsFilesList li, #travelAccomFilesList li,'
        );
    } else if (typeof $list === 'string') {
        $items = $($list);
    } else {
        // If passed a jQuery collection of <li> elements (e.g. $("#proofFilesList li")), use it directly.
        // If a container was passed (e.g. $("#proofFilesList")), select its children <li>.
        try {
            if ($list.jquery) {
                $items = $list;
                // if the collection looks like a container (no LI children), try to select its li children
                if ($items.length && $items[0].tagName && $items[0].tagName.toLowerCase() !== 'li') {
                    $items = $items.find('li');
                }
            } else {
                $items = $($list);
            }
        } catch (ex) {
            $items = $($list);
        }
    }

    var duplicate = false;
    $items.each(function () {
        var $span = $(this).find('span').first();
        var txt = ($span && $span.length) ? $span.text().trim() : $(this).text().trim();
        if (!txt || /No documents attached/i.test(txt)) return; // skip placeholders
        if (txt.toLowerCase() === filename) {
            duplicate = true;
            return false; // break out of .each
        }
    });

    if (duplicate) {
        if (window.toastr) {
            toastr.error("A file with the same name has already been uploaded.", 'Error Message');
        }
        return false;
    }

    return true;
}

function clearValidations() {
    $("#FinancialImplicationsForm .is-invalid").removeClass("is-invalid");
    $("#FinancialImplicationsForm .field-validation-error").remove();
}
function renderFinancialImplicationValidation(errors) {
    Object.keys(errors).forEach(function (selector) {
        const message = errors[selector];
        const $element = $(selector);

        if (!$element.length) return;

        $element.addClass("is-invalid");

        if ($element.next(".field-validation-error").length === 0) {
            $element.after(`<div class="text-danger field-validation-error">${message}</div>`);
        }
    });
}

function focusFirstFinancialImplicationError() {
    const $firstInvalid = $("#FinancialImplicationsForm")
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


function renderUploadedDocuments(docs) {
    if (!docs || docs.length === 0) return;
    docs.forEach(function (doc) {
        try {
            var uploadType = (doc.uploadType || "").toString().trim().toLowerCase();
            var filename = doc.filename || doc.fileName || "Document.pdf";
            var documentId = doc.documentId || doc.documentId || doc.DocumentId || doc.id;
            var baseUrl = window.config.basePath;
            var docUrl = baseUrl + '/Applications/ViewDocument?documentId=' + encodeURIComponent(documentId);

            // Build list item
            var $li = $('<li class="py-2 border-bottom d-flex justify-content-between align-items-center"></li>');
            $li.append($('<span></span>').text(filename));

            var $actions = $('<span></span>');
            var $viewBtn = $('<button type="button" class="btn btn-outline-primary btn-sm view-file"></button>')
                .attr('data-document-id', documentId)
                .attr('data-filename', filename)
                .attr('data-docurl', docUrl)
                .html('<i class="bi bi-eye"></i> View');

            var $deleteBtn = $('<button type="button" class="btn btn-link p-0 text-danger delete-file"></button>')
                .attr('data-document-id', documentId)
                .attr('data-filename', filename)
                .html('<i class="bi bi-trash"></i> Delete');

            $actions.append($viewBtn).append(' ').append($deleteBtn);
            $li.append($actions);

            // Remove placeholder "No documents attached." if present and append to correct list
            function appendToList(selector) {
                var $list = $(selector);
                $list.find('li').filter(function () {
                    return $(this).text().trim().match(/No documents attached/i);
                }).remove();
                $list.append($li);
            }

            if (uploadType.indexOf('flight quote') !== -1) {
                appendToList('#travelFlightsFilesList');
            } else if (uploadType.indexOf('accomodation quote') !== -1) {
                appendToList('#travelAccomFilesList');
            }
        } catch (ex) {
            console.error('renderUploadedDocuments error', ex, doc);
        }
    });
}

function initialiseDeclineApplicationModal() {

    var btnDecline = document.getElementById('btnDecline');
    var modalEl = document.getElementById('addDeclineApplicationModal');

    if (btnDecline && modalEl && window.bootstrap) {
        btnDecline.addEventListener('click', function (e) {
            // prevent default behaviour if button is inside a form/modal context
            e.preventDefault?.();
            var bs = new bootstrap.Modal(modalEl);
            bs.show();
        });
    }

    var submitBtn = document.getElementById('btnSubmitDeclineApplication');
    if (submitBtn && modalEl) {
        submitBtn.addEventListener('click', function () {
            var commentEl = document.getElementById('declineApplicationComments');
            var comment = commentEl ? commentEl.value.trim() : '';

            if (!comment) {
                if (window.toastr) {
                    toastr.warning('Please enter a reason for declining the application.');
                } else {
                    alert('Please enter a reason for declining the application.');
                }
                return;
            }

            // Dispatch event for existing JS to handle (keeps separation of concerns)
            var evt = new CustomEvent('ucdp:declineApplicaiton', { detail: { comment: comment, applicationId: document.getElementById('ApplicationId')?.value } });
            window.dispatchEvent(evt);
        });
    }

    //event listener
    window.addEventListener('ucdp:declineApplicaiton', function (e) {
        submitWithComment(e, modalEl, "/Applications/DeclineApplication", "#declineApplicationComments", "Application declined successfully");
    });
}

function initialiseRFIApplicationModal() {

    var btnRFI = document.getElementById('btnReturnForInformation');
    var modalEl = document.getElementById('addRFIApplicationModal');

    if (btnRFI && modalEl && window.bootstrap) {
        btnRFI.addEventListener('click', function (e) {
            // prevent default behaviour if button is inside a form/modal context
            e.preventDefault?.();
            var bs = new bootstrap.Modal(modalEl);
            bs.show();
        });
    }

    var submitBtn = document.getElementById('btnSubmitRFIApplication');
    if (submitBtn && modalEl) {
        submitBtn.addEventListener('click', function () {
            var commentEl = document.getElementById('rfiApplicationComments');
            var comment = commentEl ? commentEl.value.trim() : '';

            if (!comment) {
                if (window.toastr) {
                    toastr.warning('Please enter a reason for return the application for ammendment.');
                } else {
                    alert('Please enter a reason for return the application for ammendment.');
                }
                return;
            }

            // Dispatch event for existing JS to handle (keeps separation of concerns)
            var evt = new CustomEvent('ucdp:rfiApplicaiton', { detail: { comment: comment, applicationId: document.getElementById('ApplicationId')?.value } });
            window.dispatchEvent(evt);
        });
    }

    //event listener
    window.addEventListener('ucdp:rfiApplicaiton', function (e) {
        submitWithComment(e, modalEl, "/Applications/ReturnApplicationForInformation", "#rfiApplicationComments", "Application returned successfully");
    });
}

function submitWithComment(e, modalEl, url, commentId, successMessage) {
    var detail = e.detail || {};
    var comment = detail.comment || '';
    var applicationId = detail.applicationId || $('#Id').val();

    var formData = new FormData();
    formData.append("DeclineComment", comment);
    formData.append("ApplicationId", applicationId);
    formData.append("ReferenceId", $("#ReferenceId").val());
    formData.append("CurrentApproverStaffNumber", $("#CurrentApproverStaffNumber").val());
    formData.append("ApplicationStatusId", $("#ApplicationStatusId").val());

    if (!comment) {
        if (window.toastr) {
            toastr.warning('Please enter a reason for returning the report.');
        } else {
            alert('Please enter a reason for returning the report.');
        }
        return;
    }
    updateApplicationStatus(e,formData, modalEl, url, commentId, successMessage);
}

function initialiseClipboard() {
    var btn = document.getElementById('copyFundAdminToApproved');
    if (!btn) return;

    btn.addEventListener('click', function () {
        var src = document.getElementById('FundAdminApprovedAmount');
        var dest = document.getElementById('ApprovedAmount');

        if (!src || !dest) return;

        dest.value = src.value;

        // IMPORTANT: also copy raw value
        var raw = src.getAttribute('data-raw');
        if (raw !== null) {
            dest.setAttribute('data-raw', raw);
        }

        // reformat to ensure consistency
        formatAmount(dest);

        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(src.value).catch(function () { });
        }

        btn.classList.add('active');
        setTimeout(function () {
            btn.classList.remove('active');
        }, 220);

        if (window.toastr) {
            toastr.success('Approved amount copied', null, {
                timeOut: 1400,
                closeButton: false
            });
        }
    });
}
