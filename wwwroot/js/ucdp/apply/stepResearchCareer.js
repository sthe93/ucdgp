
$(document).ready(function () {

    GetCareerDevelopmentPayments($("#Id").val());
    GetDocuments($("#Id").val());
    CareerResearchViewLoaded();

    flatpickr("#txtFromStep4, #txtToStep4", {
        dateFormat: "d/m/Y",
        allowInput: true
    });

    $("#btnClearPaymentStep4")
        .on("click", function () {
            clearPaymentFoot();
        });
    toggleTeachingReliefSections();
    bindStep4PaymentInputValidation();
});

// ===== DATE UTILITY FUNCTIONS =====
function getDateRange() {
    var today = new Date();
    var dtToday = formatDateToISO(today);

    var lastDayOfYear = new Date(today.getFullYear(), 11, 31);
    var dtLastDay = formatDateToISO(lastDayOfYear);

    return {
        today: dtToday,
        lastDay: dtLastDay
    };
}

function formatDateToISO(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function parseRandAmount(value) {
    if (value == null || value === "") return 0;

    const cleaned = value.toString()
        .replace(/[Rr$€£]/g, "")
        .replace(/\s/g, "")
        .replace(/,/g, "")
        .replace(/[^0-9.-]/g, "");

    const number = parseFloat(cleaned);

    return isNaN(number) ? 0 : number;
}


function bindStep4PaymentInputValidation() {
    $("#txtNumberOfWeeksStep4, #txtHrsPerWeekStep4, #txtNumberOfHoursStep4, #txtUJRatePerHrStep4, #txtMonthTotalStep4")
        .off("input.step4payment")
        .on("input.step4payment", function () {
            let value = $(this).val() || "";

            // remove commas, currency symbols and spaces
            value = value
                .replace(/,/g, "")
                .replace(/[Rr]/g, "")
                .replace(/\s/g, "")
                .replace(/-/g, "");

            // allow digits and dot only
            value = value.replace(/[^0-9.]/g, "");

            // allow only ONE dot
            const firstDot = value.indexOf(".");
            if (firstDot !== -1) {
                value =
                    value.substring(0, firstDot + 1) +
                    value.substring(firstDot + 1).replace(/\./g, "");
            }

            $(this).val(value);
        });
}
function formatRandDisplay(value) {
    const amount = parseRandAmount(value);

    return "R" + amount.toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
// ===== END DATE UTILITY FUNCTIONS =====

var CareerFinancialsupportArr = [];
var TeachingReliefArr = [];

var researchDocUploaded = false;
var financialsupportDocUploaded = false;
var teachingReliefDocUploaded = false;
var shopSupportingDocs = false;
var enableImprovementStaff = false;
var researchteachingReliefDocUploaded = false;
var researcAssitanceReliefDocUploaded = false;
var researchCareerReliefDocUploaded = false;
var researchLecturerReliefDocUploaded = false;
var researchdhetFinancialSupportUploaded = false;
var researchWorkshopFinancialSupportUploaded = false;
// File upload validation functions for Research Career Development (Step 4)

var arrimprovingstaffresearchtotalcostbreakdown = [];

// Counter variables for file uploads
var counterCareerDevelopmentTeachingDoc = 0;
var counterCareerDevelopmentWorkshopRegDoc = 0;
var counterCareerDevelopmentProofOfInvitationDoc = 0;
var counterCareerDevelopmentWorkshopAccommodationDoc = 0;
var counterImprovingStaffResearchFlightsDoc = 0;
var counterImprovingStaffResearchOtherCostsDoc = 0;
var counterImprovingStaffResearchTotalCostBreakdownDoc = 0;
var improveResearchWorkshopRegFilesCount = 0;
var improveResearchProofOfInvitationDocFilesCount = 0

// Array variables for file uploads - Research Career Development
var arrCareerTeachingDocuments = [];
var arrCareerWorkshopDocuments = [];
var arrCareerInvitationDocuments = [];
var arrCareerAccommodationDocuments = [];
var arrCareerFlightsDocuments = [];
var arrCareerOtherCostsDocuments = [];
var arrCareerTotalCostBreakdownDocuments = [];
var improvingstaffresearcharrflights = [];

var arrcareerworkshop = [];

var arrcareerinvite = [];
var arraccommodation = [];
var arrimprovingstaffresearchothercosts = [];
var arrImprovingStaffResearchFlights = [];
var arrImprovingStaffResearchWorkshopAccomodation = [];
var arrimproveworkshop = [];
var arrimproveresearch = [];

var arrPayment2 = 0;

var btnNextResearch = $('.nextBtnResearch');
function getRApplicationId() {
    return document.getElementById("Id").value || "";
}

var applicationId = getRApplicationId();

// Teaching Relief Checkboxes
$(document).ready(function () {
    // Initialize date inputs with current date range
    // if (!$("#project2TabPane").length) return;
    var dateRange = getDateRange();
    var dateInputs = document.querySelectorAll("input[type='date'][data-default='today']");
    dateInputs.forEach(function (input) {
        input.value = dateRange.today;
        input.min = dateRange.today;
        input.max = dateRange.lastDay;
    });

    // Teaching Relief checkbox bindings
    var teachingReplacementCheckBox = document.getElementById("TeachingReplacementCheckBox");
    if (teachingReplacementCheckBox) {
        teachingReplacementCheckBox.addEventListener('change', TeachingReplacement);
    }

    var teachingAssistanceCheckBox = document.getElementById("TeachingAssistanceCheckBox");
    if (teachingAssistanceCheckBox) {
        teachingAssistanceCheckBox.addEventListener('change', TeachingAssistance);
    }

    var teachingCareerAssistanceMarkerCheckBox = document.getElementById("TeachingCareerAssistanceMarkerCheckBox");
    if (teachingCareerAssistanceMarkerCheckBox) {
        teachingCareerAssistanceMarkerCheckBox.addEventListener('change', TeachingCareerAssistanceMarker);
    }

    var teachingLecturerCheckBox = document.getElementById("TeachingLecturerCheckBox");
    if (teachingLecturerCheckBox) {
        teachingLecturerCheckBox.addEventListener('change', TeachingLecturer);
    }

    // Financial Support checkbox bindings
    var dhetFinancialSupportCheckBox = document.getElementById("DHETFinancialSupportCheckBox");
    if (dhetFinancialSupportCheckBox) {
        dhetFinancialSupportCheckBox.addEventListener('change', Accredited);
    }

    var researchFinancialSupportCheckBox = document.getElementById("ResearchFinancialSupportCheckBox");
    if (researchFinancialSupportCheckBox) {
        researchFinancialSupportCheckBox.addEventListener('change', ResearchDevelopment);
    }

    // Document upload button bindings
    var careerDevelopmentWorkshopRegDocBtn = document.getElementById("CareerDevelopmentWorkshopRegDocBtn");
    if (careerDevelopmentWorkshopRegDocBtn) {
        careerDevelopmentWorkshopRegDocBtn.addEventListener('click', UploadCareerDevelopmentWorkshopRegDoc);
    }

    var careerDevelopmentProofOfInvitationDocBtn = document.getElementById("CareerDevelopmentProofOfInvitationDocBtn");
    if (careerDevelopmentProofOfInvitationDocBtn) {
        careerDevelopmentProofOfInvitationDocBtn.addEventListener('click', UploadCareerDevelopmentProofOfInvitationDoc);
    }

    var careerDevelopmentTeachingDocBtn = document.getElementById("CareerDevelopmentTeachingDocBtn");
    if (careerDevelopmentTeachingDocBtn) {
        careerDevelopmentTeachingDocBtn.addEventListener('click', UploadCareerDevelopmentTeachingDoc);
    }

    var careerDevelopmentWorkshopAccommodationBtn = document.getElementById("CareerDevelopmentWorkshopAccommodationBtn");
    if (careerDevelopmentWorkshopAccommodationBtn) {
        careerDevelopmentWorkshopAccommodationBtn.addEventListener('click', UploadCareerDevelopmentWorkshopAccommodationDoc);
    }

    var improvingStaffResearchFlightsDocBtn = document.getElementById("ImprovingStaffResearchFlightsDocBtn");
    if (improvingStaffResearchFlightsDocBtn) {
        improvingStaffResearchFlightsDocBtn.addEventListener('click', UploadImprovingStaffResearchFlightsDoc);
    }

    var improvingStaffResearchOtherCostsDocBtn = document.getElementById("ImprovingStaffResearchOtherCostsDocBtn");
    if (improvingStaffResearchOtherCostsDocBtn) {
        improvingStaffResearchOtherCostsDocBtn.addEventListener('click', UploadImprovingStaffResearchOtherCostsDoc);
    }

    var improvingStaffResearchTotalCostBreakdownDocBtn = document.getElementById("ImprovingStaffResearchTotalCostBreakdownDocBtn");
    if (improvingStaffResearchTotalCostBreakdownDocBtn) {
        improvingStaffResearchTotalCostBreakdownDocBtn.addEventListener('click', UploadImprovingStaffResearchTotalCostBreakdownDoc);
    }

    // Add event binding for delete button - this was missing
    var improvingStaffResearchTotalCostBreakdownDeleteBtn = document.querySelectorAll(".deleteImprovingStaffResearchTotalCostBreakdownFile");
    improvingStaffResearchTotalCostBreakdownDeleteBtn.forEach(function (element) {
        element.addEventListener('click', function (e) {
            e.preventDefault();
            DeleteImprovingStaffResearchTotalCostBreakdownFile($(this).data('file-id'));
        });
    });

    // Table calculation bindings
    var txtNumberOfWeeksCalcTriggers = document.querySelectorAll(".txtNumberOfWeeksStep4CalcTrigger");
    txtNumberOfWeeksCalcTriggers.forEach(function (element) {
        element.addEventListener('keyup', function () {
            CalTotalHoursStep4();
        });
        element.addEventListener('blur', function () {
            CalTotalHoursStep4();
        });
    });

    var txtHrsPerWeekCalcTriggers = document.querySelectorAll(".txtHrsPerWeekStep4CalcTrigger");
    txtHrsPerWeekCalcTriggers.forEach(function (element) {
        element.addEventListener('keyup', function () {
            CalTotalHoursStep4();
        });

        element.addEventListener('blur', function () {
            CalTotalHoursStep4();
        });
    });

    var txtUJRatePerHrCalcTriggers = document.querySelectorAll(".txtUJRatePerHrStep4CalcTrigger");
    txtUJRatePerHrCalcTriggers.forEach(function (element) {
        element.addEventListener('keyup', function () {
            CalTotalForMonthStep4();
        });
        element.addEventListener('blur', function () {
            CalTotalForMonthStep4();
        });
    });

    // Table row removal binding
    var btnRemovePaymentStep4Elements = document.querySelectorAll(".btnRemovePaymentStep4");
    btnRemovePaymentStep4Elements.forEach(function (element) {
        element.addEventListener('click', function (e) {
            element.preventDefault();
            RemovePaymentStep4(this);
        });
    });

    // Add row button binding
    var btnAddPaymentsStep4 = document.getElementById("btnAddPaymentsStep4");
    if (btnAddPaymentsStep4) {
        btnAddPaymentsStep4.addEventListener('click', function (e) {
            e.preventDefault();
            AddPaymentsStep4Row();
        });
    }

});
function toggleTeachingReliefSections() {
    const hasTeachingRelief =
        $("#TeachingReplacementCheckBox").is(":checked") ||
        $("#TeachingAssistanceCheckBox").is(":checked") ||
        $("#TeachingCareerAssistanceMarkerCheckBox").is(":checked") ||
        $("#TeachingLecturerCheckBox").is(":checked");

    $("#ResearchTeachingReliefDocumentsLink").toggle(hasTeachingRelief);
    $("#teachingReliefScheduleSection").toggle(hasTeachingRelief);
}
// ===== END EVENT BINDING =====

function Accredited() {
    var dhetFinancialSupportCheckBox = document.getElementById("DHETFinancialSupportCheckBox");
    var dhetFinancialSupportCheckBoxVal = document.getElementById("DHETFinancialSupportCheckBox").value;

    //Add To Array - Career Development  Financial Support Options
    if (dhetFinancialSupportCheckBox.checked == true) {

        researchdhetFinancialSupportUploaded = true;
        CareerFinancialsupportArr.push(dhetFinancialSupportCheckBoxVal);
        showHideRequired("#ProofOfInvitation", (researchWorkshopFinancialSupportUploaded || researchdhetFinancialSupportUploaded));

    } else {

        var removeItem = dhetFinancialSupportCheckBoxVal;
        researchdhetFinancialSupportUploaded = false;
        CareerFinancialsupportArr = $.grep(CareerFinancialsupportArr, function (value) {
            return value != removeItem;
        });
        showHideRequired("#ProofOfInvitation", (researchWorkshopFinancialSupportUploaded || researchdhetFinancialSupportUploaded));
    }
}

function ResearchDevelopment() {
    var researchFinancialSupportCheckBox = document.getElementById("ResearchFinancialSupportCheckBox");
    var researchFinancialSupportCheckBoxVal = document.getElementById("ResearchFinancialSupportCheckBox").value;

    //Add To Array - Career Development  Financial Support Options
    if (researchFinancialSupportCheckBox.checked == true) {

        researchWorkshopFinancialSupportUploaded = true;
        CareerFinancialsupportArr.push(researchFinancialSupportCheckBoxVal);
        showHideRequired("#WorkshopReg", researchWorkshopFinancialSupportUploaded);
        showHideRequired("#ProofOfInvitation", (researchWorkshopFinancialSupportUploaded || researchdhetFinancialSupportUploaded));
    } else {

        var removeItem = researchFinancialSupportCheckBoxVal;

        researchWorkshopFinancialSupportUploaded = false;
        CareerFinancialsupportArr = $.grep(CareerFinancialsupportArr, function (value) {
            return value != removeItem;
        });
        showHideRequired("#WorkshopReg", researchWorkshopFinancialSupportUploaded);
        showHideRequired("#ProofOfInvitation", (researchWorkshopFinancialSupportUploaded || researchdhetFinancialSupportUploaded));
    }

}

// Collect all form data from _StepResearchCareer.cshtml
function collectResearchCareerFormData() {
    var formData = {
        teachingRelief: {},
        financialSupport: {},
        documents: {},
        teachingReliefSchedule: [],
        metadata: {
            collectedAt: new Date().toISOString(),
            formId: "ResearchCareerDevForm"
        }
    };

    // 1. Collect Teaching Relief checkboxes
    formData.teachingRelief = {
        replacementByTemporaryLecturer: document.getElementById("TeachingReplacementCheckBox")?.checked || false,
        teachingAssistanceSeniorORTutor: document.getElementById("TeachingAssistanceCheckBox")?.checked || false,
        teachingAssistanceMarker: document.getElementById("TeachingCareerAssistanceMarkerCheckBox")?.checked || false,
        lecturer: document.getElementById("TeachingLecturerCheckBox")?.checked || false
    };

    // 2. Collect Financial Support checkboxes
    formData.financialSupport = {
        dhetAccredited: document.getElementById("DHETFinancialSupportCheckBox")?.checked || false,
        researchDevelopmentWorkshops: document.getElementById("ResearchFinancialSupportCheckBox")?.checked || false
    };

    // 3. Collect uploaded documents
    formData.documents = {
        careerDevelopmentWorkshopReg: {
            fileName: document.getElementById("CareerDevelopmentWorkshopRegDoc")?.files[0]?.name || "Not uploaded",
            fileSize: document.getElementById("CareerDevelopmentWorkshopRegDoc")?.files[0]?.size || 0
        },
        careerDevelopmentProofOfInvitation: {
            fileName: document.getElementById("CareerDevelopmentProofOfInvitationDoc")?.files[0]?.name || "Not uploaded",
            fileSize: document.getElementById("CareerDevelopmentProofOfInvitationDoc")?.files[0]?.size || 0
        },
        careerDevelopmentTeachingDoc: {
            fileName: document.getElementById("CareerDevelopmentTeachingDoc")?.files[0]?.name || "Not uploaded",
            fileSize: document.getElementById("CareerDevelopmentTeachingDoc")?.files[0]?.size || 0
        },
        careerDevelopmentWorkshopAccommodation: {
            fileName: document.getElementById("CareerDevelopmentWorkshopAccommodationDoc")?.files[0]?.name || "Not uploaded",
            fileSize: document.getElementById("CareerDevelopmentWorkshopAccommodationDoc")?.files[0]?.size || 0
        },
        improvingStaffResearchFlights: {
            fileName: document.getElementById("ImprovingStaffResearchFlightsDoc")?.files[0]?.name || "Not uploaded",
            fileSize: document.getElementById("ImprovingStaffResearchFlightsDoc")?.files[0]?.size || 0
        },
        improvingStaffResearchOtherCosts: {
            fileName: document.getElementById("ImprovingStaffResearchOtherCostsDoc")?.files[0]?.name || "Not uploaded",
            fileSize: document.getElementById("ImprovingStaffResearchOtherCostsDoc")?.files[0]?.size || 0
        },
        improvingStaffResearchTotalCostBreakdown: {
            fileName: document.getElementById("ImprovingStaffResearchTotalCostBreakdownDoc")?.files[0]?.name || "Not uploaded",
            fileSize: document.getElementById("ImprovingStaffResearchTotalCostBreakdownDoc")?.files[0]?.size || 0
        }
    };

    // 4. Collect Teaching Relief Schedule table data
    var scheduleRows = document.querySelectorAll("#tblPaymentsStep4.project2 tbody tr");
    scheduleRows.forEach(function (row, index) {
        var cells = row.querySelectorAll("input, select");
        if (cells.length > 0) {
            formData.teachingReliefSchedule.push({
                rowIndex: index,
                studyType: cells[0]?.value || "",
                from: cells[1]?.value || "",
                to: cells[2]?.value || "",
                numberOfWeeks: cells[3]?.value || "",
                hoursPerWeek: cells[4]?.value || "",
                totalNumberOfHours: cells[5]?.value || "",
                ujRatePerHour: cells[6]?.value || "",
                totalForMonth: cells[7]?.value || ""
            });
        }
    });

    // 5. Collect Total value
    formData.totalHours = document.getElementById("TotalStep4")?.value || "0";

    // 6. Add existing arrays
    formData.careerFinancialSupportArray = CareerFinancialsupportArr;

    return formData;
}

function TeachingReplacement() {
    var teachingReplacementCheckBox = document.getElementById("TeachingReplacementCheckBox");
    var teachingReplacementCheckBoxVal = document.getElementById("TeachingReplacementCheckBox").value;

    var teachingAssistanceCheckBox = document.getElementById("TeachingAssistanceCheckBox");
    var teachingCareerAssistanceMarkerCheckBox = document.getElementById("TeachingCareerAssistanceMarkerCheckBox");
    var teachingLecturerCheckBox = document.getElementById("TeachingLecturerCheckBox");

    if (teachingReplacementCheckBox.checked == true) {
        researchteachingReliefDocUploaded = true;
        $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
        $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
        TeachingReliefArr.push(teachingReplacementCheckBoxVal);
    } else {
        if (teachingAssistanceCheckBox.checked == false || teachingCareerAssistanceMarkerCheckBox == false || teachingLecturerCheckBox == false) {
            $("#ResearchTeachingReliefDocumentsLink").css("display", "none");
            $("#ResearchTeachingReliefDocuments").css("visibility", "hidden");
        }
        var removeItem = teachingReplacementCheckBoxVal;
        researchteachingReliefDocUploaded = false;
        TeachingReliefArr = $.grep(TeachingReliefArr, function (value) {
            return value != removeItem;
        });
    }
    toggleTeachingReliefSections();
}

function TeachingAssistance() {
    var teachingAssistanceCheckBox = document.getElementById("TeachingAssistanceCheckBox");
    var teachingAssistanceCheckBoxVal = document.getElementById("TeachingAssistanceCheckBox").value;

    var teachingCareerAssistanceMarkerCheckBox = document.getElementById("TeachingCareerAssistanceMarkerCheckBox");
    var teachingLecturerCheckBox = document.getElementById("TeachingLecturerCheckBox");
    var teachingReplacementCheckBox = document.getElementById("TeachingReplacementCheckBox");

    if (teachingAssistanceCheckBox.checked == true) {
        researcAssitanceReliefDocUploaded = true;
        $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
        $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
        TeachingReliefArr.push(teachingAssistanceCheckBoxVal);
    } else {
        if (teachingReplacementCheckBox.checked == false || teachingCareerAssistanceMarkerCheckBox == false || teachingLecturerCheckBox == false) {
            $("#ResearchTeachingReliefDocumentsLink").css("display", "none");
            $("#ResearchTeachingReliefDocuments").css("visibility", "hidden");
        }
        var removeItem = teachingAssistanceCheckBoxVal;
        researcAssitanceReliefDocUploaded = false;
        TeachingReliefArr = $.grep(TeachingReliefArr, function (value) {
            return value != removeItem;
        });
    }
    toggleTeachingReliefSections();
}

function TeachingCareerAssistanceMarker() {
    var teachingCareerAssistanceMarkerCheckBox = document.getElementById("TeachingCareerAssistanceMarkerCheckBox");
    var teachingCareerAssistanceMarkerCheckBoxVal = document.getElementById("TeachingCareerAssistanceMarkerCheckBox").value;

    var teachingLecturerCheckBox = document.getElementById("TeachingLecturerCheckBox");
    var teachingAssistanceCheckBox = document.getElementById("TeachingAssistanceCheckBox");
    var teachingReplacementCheckBox = document.getElementById("TeachingReplacementCheckBox");

    if (teachingCareerAssistanceMarkerCheckBox.checked == true) {
        researchCareerReliefDocUploaded = true;
        $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
        $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
        TeachingReliefArr.push(teachingCareerAssistanceMarkerCheckBoxVal);
    } else {
        if (teachingReplacementCheckBox.checked == false || teachingLecturerCheckBox == false || teachingAssistanceCheckBox == false) {
            $("#ResearchTeachingReliefDocumentsLink").css("display", "none");
            $("#ResearchTeachingReliefDocuments").css("visibility", "hidden");
        }
        var removeItem = teachingCareerAssistanceMarkerCheckBoxVal;
        researchCareerReliefDocUploaded = false;
        TeachingReliefArr = $.grep(TeachingReliefArr, function (value) {
            return value != removeItem;
        });
    }
    toggleTeachingReliefSections();
}

function TeachingLecturer() {
    var teachingLecturerCheckBox = document.getElementById("TeachingLecturerCheckBox");
    var teachingLecturerCheckBoxVal = document.getElementById("TeachingLecturerCheckBox").value;

    var teachingCareerAssistanceMarkerCheckBox = document.getElementById("TeachingCareerAssistanceMarkerCheckBox");
    var teachingAssistanceCheckBox = document.getElementById("TeachingAssistanceCheckBox");
    var teachingReplacementCheckBox = document.getElementById("TeachingReplacementCheckBox");

    if (teachingLecturerCheckBox.checked == true) {
        researchLecturerReliefDocUploaded = true;
        $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
        $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
        TeachingReliefArr.push(teachingLecturerCheckBoxVal);
    } else {
        if (teachingReplacementCheckBox.checked == false || teachingCareerAssistanceMarkerCheckBox == false || teachingAssistanceCheckBox == false) {
            $("#ResearchTeachingReliefDocumentsLink").css("display", "none");
            $("#ResearchTeachingReliefDocuments").css("visibility", "hidden");
        }
        var removeItem = teachingLecturerCheckBoxVal;
        researchLecturerReliefDocUploaded = false;
        TeachingReliefArr = $.grep(TeachingReliefArr, function (value) {
            return value != removeItem;
        });
    }
    toggleTeachingReliefSections();
}

// Upload Career Development Teaching Documents
function UploadCareerDevelopmentTeachingDoc() {
    var applicationId = getRApplicationId();
    var fileData = new FormData();
    var tempListTeaching = [];
    var fileUpload = $("#CareerDevelopmentTeachingDoc").get(0);

    var files = fileUpload.files;

    if (files.length === 0) {
        toastr.error("Please select file to upload.");
        $('#CareerDevelopmentTeachingDoc').val('');
        return false;
    }

    // Validate files
    for (var i = 0; i < files.length; i++) {
        var file1 = files[i].name;

        if (file1) {
            var file_size = files[i].size;

            if (file_size < (5 * 1024 * 1024)) {
                var ext = file1.split('.').pop().toLowerCase();
                if ($.inArray(ext, ['pdf']) === -1) {
                    toastr.error("Only PDF uploads are allowed");
                    $('#CareerDevelopmentTeachingDoc').val('');
                    return false;
                }
            } else {
                toastr.error("File size should be 5 MB or less.");
                $('#CareerDevelopmentTeachingDoc').val('');
                return false;
            }
        }

        // Check for duplicate files
        for (var s = 0; s < arrCareerTeachingDocuments.length; s++) {
            if (arrCareerTeachingDocuments[s].name === files[i].name) {
                toastr.error("File " + files[i].name + " already uploaded.");
                $('#CareerDevelopmentTeachingDoc').val('');
                return false;
            }
        }

        arrCareerTeachingDocuments.push({ name: files[i].name, file: files[i] });
        tempListTeaching.push({ name: files[i].name, file: files[i] });
    }

    // Append files to FormData
    var len = tempListTeaching.length - 1;
    fileData.append(tempListTeaching[len].name, tempListTeaching[len].file);
    fileData.append('Id', applicationId);


    $('#CareerDevelopmentTeachingDoc').val('');

    $.ajax({
        url: '/Applications/UploadCareerDevelopmentTeachingFiles',
        type: 'POST',
        contentType: false,
        processData: false,
        data: fileData,
        async: false,
        success: function (result) {
            $('#CareerDevelopmentTeachingDoc').val('');
            var countTeaching = 0;

            for (var s = 0; s < result.length; s++) {
                if (result[s].UploadType.trim() == "Career Development Teaching") {
                    countTeaching++;
                    if (countTeaching > 10) {
                        document.getElementById("CareerDevelopmentTeachingDocBtn").disabled = true;
                        document.getElementById("CareerDevelopmentTeachingDoc").disabled = true;
                    }
                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentTeachingFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofCareerDevelopmentTeachingFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofCareerDevelopmentTeachingFiles tbody").find('.deleteCareerDevelopmentTeachingFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteCareerDevelopmentTeachingFile($(this).data('file-id'));
                    });
                }
            }
            toastr.success("Document Uploaded Successfully", 'Success Message');
        },
        error: function () {
            toastr.error("There was an error uploading files.", 'Error Message');
        }
    });
}

// Delete Career Development Teaching Documents
function DeleteCareerDevelopmentTeachingFile(Id) {
    $("#ListofCareerDevelopmentTeachingFiles tbody").empty();
    $("#ListofCareerDevelopmentTeachingFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    $.ajax({
        type: "GET",
        url: '/Applications/DeleteDocument',
        contentType: "application/json; charset=utf-8",
        data: { "documentId": Id },
        datatype: "json",
        success: function (result) {
            var countTeachingClear = 0;
            arrCareerTeachingDocuments.length = 0;
            $("#ListofCareerDevelopmentTeachingFiles tbody").empty();
            for (var s = 0; s < result.length; s++) {
                if (result[s].uploadType.trim() == "Career Development Teaching") {
                    arrCareerTeachingDocuments.push({ name: result[s].filename, file: result[s] });
                    countTeachingClear = arrCareerTeachingDocuments.length;
                    if (countTeachingClear == 0) {
                        $("#ListofCareerDevelopmentTeachingFiles tbody").empty();
                    }

                    var markup = "<tr><td>" + result[s].filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentTeachingFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofCareerDevelopmentTeachingFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofCareerDevelopmentTeachingFiles tbody").find('.deleteCareerDevelopmentTeachingFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteCareerDevelopmentTeachingFile($(this).data('file-id'));
                    });
                }
            }

            if (countTeachingClear <= 10) {
                document.getElementById("CareerDevelopmentTeachingDocBtn").disabled = false;
                $('#CareerDevelopmentTeachingDoc').val('');
                document.getElementById("CareerDevelopmentTeachingDoc").disabled = false;
            }

            toastr.success("Document Deleted Successfully", 'Success Message');
            DisableDocumentsUpload();
            EnableDocumentsUpload();
        },
        error: function () {
            toastr.error('Error trying to delete document.', 'Error Message');
        }
    });
}

// Upload Career Development Workshop Registration Documents
function UploadCareerDevelopmentWorkshopRegDoc() {
    var applicationId = getRApplicationId();
    var fileData = new FormData();
    var fileUpload = $("#CareerDevelopmentWorkshopRegDoc").get(0);
    $("#ListofCareerDevelopmentWorkshopRegFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    var files = fileUpload.files;

    if (files.length === 0) {
        toastr.error("Please select file to upload.");
        $('#CareerDevelopmentWorkshopRegDoc').val('');
        return false;
    }

    // Validate files
    for (var i = 0; i < files.length; i++) {
        var file1 = files[i].name;

        if (file1) {
            var file_size = files[i].size;

            if (file_size < (5 * 1024 * 1024)) {
                var ext = file1.split('.').pop().toLowerCase();
                if ($.inArray(ext, ['pdf']) === -1) {
                    toastr.error("Only PDF uploads are allowed");
                    $('#CareerDevelopmentWorkshopRegDoc').val('');
                    return false;
                }
            } else {
                toastr.error("File size should be 5 MB or less.");
                $('#CareerDevelopmentWorkshopRegDoc').val('');
                return false;
            }
        }

        // Check for duplicate files
        for (var s = 0; s < arrCareerWorkshopDocuments.length; s++) {
            if (arrCareerWorkshopDocuments[s].name === files[i].name) {
                toastr.error("File " + files[i].name + " already uploaded.");
                $('#CareerDevelopmentWorkshopRegDoc').val('');
                return false;
            }
        }

        arrCareerWorkshopDocuments.push({ name: files[i].name, file: files[i], Id: applicationId });
    }

    // Append files to FormData
    for (var p = 0, len = arrCareerWorkshopDocuments.length; p < len; p++) {
        fileData.append(arrCareerWorkshopDocuments[p].name, arrCareerWorkshopDocuments[p].file);
        fileData.append('Id', arrCareerWorkshopDocuments[p].Id);
    }

    $('#CareerDevelopmentWorkshopRegDoc').val('');

    $.ajax({
        url: '/Applications/UploadCareerDevelopmentWorkshopFiles',
        type: 'POST',
        contentType: false,
        processData: false,
        data: fileData,
        async: false,
        success: function (result) {
            $("#ListofCareerDevelopmentWorkshopRegFiles tbody").empty();

            for (var s = 0; s < result.length; s++) {
                if (result[s].UploadType.trim() == "Career Development Workshop") {
                    $('#CareerDevelopmentWorkshopRegDoc').val('');
                    document.getElementById("CareerDevelopmentWorkshopRegDocBtn").disabled = true;
                    document.getElementById("CareerDevelopmentWorkshopRegDoc").disabled = true;

                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentWorkshopFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofCareerDevelopmentWorkshopRegFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofCareerDevelopmentWorkshopRegFiles tbody").find('.deleteCareerDevelopmentWorkshopFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteCareerDevelopmentWorkshopFile($(this).data('file-id'));
                    });
                }
            }
            toastr.success("Document Uploaded Successfully", 'Success Message');
        },
        error: function () {
            toastr.error("There was an error uploading files.", 'Error Message');
        }
    });
}

// Delete Career Development Workshop Registration Documents
function DeleteCareerDevelopmentWorkshopFile(Id) {
    $("#ListofCareerDevelopmentWorkshopRegFiles tbody").empty();
    $("#ListofCareerDevelopmentWorkshopRegFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    $.ajax({
        type: "GET",
        url: '/Applications/DeleteDocument',
        contentType: "application/json; charset=utf-8",
        data: { "documentId": Id },
        datatype: "json",
        success: function (result) {
            $("#ListofCareerDevelopmentWorkshopRegFiles tbody").empty();

            for (var s = 0; s < result.length; s++) {
                if (result[s].uploadType.trim() == "Career Development Workshop") {
                    var markup = "<tr><td>" + result[s].filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentWorkshopFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofCareerDevelopmentWorkshopRegFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofCareerDevelopmentWorkshopRegFiles tbody").find('.deleteCareerDevelopmentWorkshopFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteCareerDevelopmentWorkshopFile($(this).data('file-id'));
                    });
                }
            }

            arrCareerWorkshopDocuments.length = 0;
            toastr.success("Document Deleted Successfully", 'Success Message');
            document.getElementById("CareerDevelopmentWorkshopRegDocBtn").disabled = false;
            $('#CareerDevelopmentWorkshopRegDoc').val('');
            document.getElementById("CareerDevelopmentWorkshopRegDoc").disabled = false;
            DisableDocumentsUpload();
            EnableDocumentsUpload();
        },
        error: function () {
            toastr.error('Error trying to delete document.', 'Error Message');
        }
    });
}

// Upload Career Development Proof Of Invitation Documents
function UploadCareerDevelopmentProofOfInvitationDoc() {
    var applicationId = getRApplicationId();
    var fileData = new FormData();
    arrCareerInvitationDocuments = [];
    var fileUpload = $("#CareerDevelopmentProofOfInvitationDoc").get(0);

    var files = fileUpload.files;

    if (files.length === 0) {
        toastr.error("Please select file to upload.");
        $('#CareerDevelopmentProofOfInvitationDoc').val('');
        return false;
    }

    // Validate files
    for (var i = 0; i < files.length; i++) {
        var file1 = files[i].name;

        if (file1) {
            var file_size = files[i].size;

            if (file_size < (5 * 1024 * 1024)) {
                var ext = file1.split('.').pop().toLowerCase();
                if ($.inArray(ext, ['pdf']) === -1) {
                    toastr.error("Only PDF uploads are allowed");
                    $('#CareerDevelopmentProofOfInvitationDoc').val('');
                    return false;
                }
            } else {
                toastr.error("File size should be 5 MB or less.");
                $('#CareerDevelopmentProofOfInvitationDoc').val('');
                return false;
            }
        }

        // Check for duplicate files
        for (var s = 0; s < arrCareerInvitationDocuments.length; s++) {
            if (arrCareerInvitationDocuments[s].name === files[i].name) {
                toastr.error("File " + files[i].name + " already uploaded.");
                $('#CareerDevelopmentProofOfInvitationDoc').val('');
                return false;
            }
        }

        arrCareerInvitationDocuments.push({ name: files[i].name, file: files[i], Id: applicationId });
    }

    // Append files to FormData
    for (var p = 0, len = arrCareerInvitationDocuments.length; p < len; p++) {
        fileData.append(arrCareerInvitationDocuments[p].name, arrCareerInvitationDocuments[p].file);
        fileData.append('Id', arrCareerInvitationDocuments[p].Id);
    }

    $('#CareerDevelopmentProofOfInvitationDoc').val('');

    $.ajax({
        url: '/Applications/UploadCareerDevelopmentInviteFiles',
        type: 'POST',
        contentType: false,
        processData: false,
        data: fileData,
        async: false,
        success: function (result) {
            $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").empty();

            for (var s = 0; s < result.length; s++) {
                if (result[s].UploadType.trim() == "Career Development Invite") {
                    $('#CareerDevelopmentProofOfInvitationDoc').val('');
                    document.getElementById("CareerDevelopmentProofOfInvitationDocBtn").disabled = true;
                    document.getElementById("CareerDevelopmentProofOfInvitationDoc").disabled = true;
                    arrcareerinvite.push({ name: result[s].Filename, file: result[s] });
                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentInvitationFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").append(markup);

                    var deleteLink = $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").find('.deleteCareerDevelopmentInvitationFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteCareerDevelopmentInviteFile($(this).data('file-id'));
                    });
                }
            }
            toastr.success("Document Uploaded Successfully", 'Success Message');
        },
        error: function () {
            toastr.error("There was an error uploading files.", 'Error Message');
        }
    });
}

// Upload Career Development Workshop Accommodation Documents
function UploadCareerDevelopmentWorkshopAccommodationDoc() {
    var applicationId = getRApplicationId();
    var fileData = new FormData();
    var fileUpload = $("#CareerDevelopmentWorkshopAccommodationDoc").get(0);

    var files = fileUpload.files;

    if (files.length === 0) {
        toastr.error("Please select file to upload.");
        $('#CareerDevelopmentWorkshopAccommodationDoc').val('');
        return false;
    }

    // Validate files
    for (var i = 0; i < files.length; i++) {
        var file1 = files[i].name;

        if (file1) {
            var file_size = files[i].size;

            if (file_size < (5 * 1024 * 1024)) {
                var ext = file1.split('.').pop().toLowerCase();
                if ($.inArray(ext, ['pdf']) === -1) {
                    toastr.error("Only PDF uploads are allowed");
                    $('#CareerDevelopmentWorkshopAccommodationDoc').val('');
                    return false;
                }
            } else {
                toastr.error("File size should be 5 MB or less.");
                $('#CareerDevelopmentWorkshopAccommodationDoc').val('');
                return false;
            }
        }

        // Check for duplicate files
        for (var s = 0; s < arrCareerAccommodationDocuments.length; s++) {
            if (arrCareerAccommodationDocuments[s].name === files[i].name) {
                toastr.error("File " + files[i].name + " already uploaded.");
                $('#CareerDevelopmentWorkshopAccommodationDoc').val('');
                return false;
            }
        }

        arrCareerAccommodationDocuments.push({ name: files[i].name, file: files[i], Id: applicationId });
    }

    // Append files to FormData

    var len = arrCareerAccommodationDocuments.length - 1;
    fileData.append(arrCareerAccommodationDocuments[len].name, arrCareerAccommodationDocuments[len].file);
    fileData.append('Id', arrCareerAccommodationDocuments[len].Id);


    $('#CareerDevelopmentWorkshopAccommodationDoc').val('');

    $.ajax({
        url: '/Applications/UploadCareerDevelopmentAccommodationFiles',
        type: 'POST',
        contentType: false,
        processData: false,
        data: fileData,
        async: false,
        success: function (result) {
            var countAccommodationDoc = 0;
            for (var s = 0; s < result.length; s++) {
                if (result[s].UploadType.trim() == "Research Career Accommodation") {
                    countAccommodationDoc++
                    $('#CareerDevelopmentWorkshopAccommodationDoc').val('');
                    if (countAccommodationDoc >= 3) {
                        document.getElementById("CareerDevelopmentWorkshopAccommodationBtn").disabled = true;
                        document.getElementById("CareerDevelopmentWorkshopAccommodationDoc").disabled = true;
                    }

                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentAccommodationFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofWorkshopAccommodationDocumentsFiles tbody").append(markup);

                    var deleteLink = $("#ListofWorkshopAccommodationDocumentsFiles tbody").find('.deleteCareerDevelopmentAccommodationFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteAccommodationFile($(this).data('file-id'));
                    });
                }
            }
            toastr.success("Document Uploaded Successfully", 'Success Message');
        },
        error: function () {
            toastr.error("There was an error uploading files.", 'Error Message');
        }
    });
}

function DeleteAccommodationFile(Id) {

    $("#ListofWorkshopAccommodationDocumentsFiles tbody").empty();
    $("#ListofWorkshopAccommodationDocumentsFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    $.ajax({
        type: "GET",
        url: '/Applications/DeleteDocument',
        contentType: "application/json; charset=utf-8",
        data: { "documentId": Id },
        datatype: "json",
        success: function (result) {
            var countanaylsisclear = 0;

            $("#ListofWorkshopAccommodationDocumentsFiles tbody").empty();
            if (result.length == 0) {
                arrCareerAccommodationDocuments = [];
            } else {
                arrCareerAccommodationDocuments = $.map(arrCareerAccommodationDocuments, function (file) {
                    var found = $.grep(result, function (currFile) {
                        return currFile.filename === file.name;
                    });
                    return found.length > 0 ? file : null;
                });
            }

            for (var s = 0; s < result.length; s++) {

                if (result[s].uploadType.trim() == 'Research Career Accommodation') {
                    var markup = "<tr><td>" + result[s].filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentAccommodationFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofWorkshopAccommodationDocumentsFiles tbody").append(markup);

                    var deleteLink = $("#ListofWorkshopAccommodationDocumentsFiles tbody").find('.deleteCareerDevelopmentAccommodationFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteAccommodationFile($(this).data('file-id'));
                    });
                }
            }

            //if (countanaylsisclear == 0) {
            //    $("#ListofUploadAccommodationDocFiles tbody").empty();
            //}
            //if (countanaylsisclear != 3) {
            //    document.getElementById("AccommodationDocBtn").disabled = false;
            //    $('#AccommodationDoc').val('');
            //    document.getElementById("AccommodationDoc").disabled = false;
            //}


            toastr.success("Document Deleted Successfully", 'Success Message');
            DisableDocumentsUpload();
            EnableDocumentsUpload();
        },
        error: function () {
            toastr.error('Error Trying to delete document.', 'Error Message');
        }
    });
}

// Upload Improving Staff Research Flights Documents
function UploadImprovingStaffResearchFlightsDoc() {
    var applicationId = getRApplicationId();
    var fileData = new FormData();
    var fileUpload = $("#ImprovingStaffResearchFlightsDoc").get(0);

    var files = fileUpload.files;

    if (files.length === 0) {
        toastr.error("Please select file to upload.");
        $('#ImprovingStaffResearchFlightsDoc').val('');
        return false;
    }

    // Validate files
    for (var i = 0; i < files.length; i++) {
        var file1 = files[i].name;

        if (file1) {
            var file_size = files[i].size;

            if (file_size < (5 * 1024 * 1024)) {
                var ext = file1.split('.').pop().toLowerCase();
                if ($.inArray(ext, ['pdf']) === -1) {
                    toastr.error("Only PDF uploads are allowed");
                    $('#ImprovingStaffResearchFlightsDoc').val('');
                    return false;
                }
            } else {
                toastr.error("File size should be 5 MB or less.");
                $('#ImprovingStaffResearchFlightsDoc').val('');
                return false;
            }
        }

        // Check for duplicate files
        for (var s = 0; s < arrCareerFlightsDocuments.length; s++) {
            if (arrCareerFlightsDocuments[s].name === files[i].name) {
                toastr.error("File " + files[i].name + " already uploaded.");
                $('#ImprovingStaffResearchFlightsDoc').val('');
                return false;
            }
        }

        arrCareerFlightsDocuments.push({ name: files[i].name, file: files[i], Id: applicationId });
    }

    // Append files to FormData
    var len = arrCareerFlightsDocuments.length - 1;

    fileData.append(arrCareerFlightsDocuments[len].name, arrCareerFlightsDocuments[len].file);
    fileData.append('Id', arrCareerFlightsDocuments[len].Id);


    $('#ImprovingStaffResearchFlightsDoc').val('');

    $.ajax({
        url: '/Applications/UploadImprovingStaffResearchFlights',
        type: 'POST',
        contentType: false,
        processData: false,
        data: fileData,
        async: false,
        success: function (result) {
            var countResearchFlightsDoc = 0
            for (var s = 0; s < result.length; s++) {
                if (result[s].UploadType.trim() == "Research Career Flights") {
                    $('#ImprovingStaffResearchFlightsDoc').val('');
                    countResearchFlightsDoc++
                    if (countResearchFlightsDoc >= 3) {
                        document.getElementById("ImprovingStaffResearchFlightsDocBtn").disabled = true;
                        document.getElementById("ImprovingStaffResearchFlightsDoc").disabled = true;
                    }

                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteImprovingStaffResearchFlightsFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").append(markup);

                    var deleteLink = $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").find('.deleteImprovingStaffResearchFlightsFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteImprovingStaffResearchFlightsFile($(this).data('file-id'));
                    });
                }
            }
            toastr.success("Document Uploaded Successfully", 'Success Message');
        },
        error: function () {
            toastr.error("There was an error uploading files.", 'Error Message');
        }
    });
}

function DeleteImprovingStaffResearchFlightsFile(Id) {


    $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").empty();
    $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    $.ajax({
        type: "GET",
        url: '/Applications/DeleteDocument',
        contentType: "application/json; charset=utf-8",
        data: { "documentId": Id },
        datatype: "json",
        success: function (result) {
            var countanaylsisclear = 0;

            if (result.length == 0) {
                improvingstaffresearcharrflights = [];
            } else {
                improvingstaffresearcharrflights = $.map(improvingstaffresearcharrflights, function (file) {
                    var found = $.grep(result, function (currFile) {
                        return currFile.filename === file.name;
                    });
                    return found.length > 0 ? file : null;
                });
            }

            $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").empty();

            for (var s = 0; s < result.length; s++) {

                if (result[s].uploadType.trim() == 'Research Career Flights') {

                    countanaylsisclear++;

                    var markup = "<tr><td>" + result[s].filename + "</td><td><button type='button' title='Delete' class='deleteImprovingStaffResearchFlightsFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").append(markup);


                    var deleteLink = $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").find('.deleteImprovingStaffResearchFlightsFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteImprovingStaffResearchFlightsFile($(this).data('file-id'));
                    });
                }
            }

            //if (countanaylsisclear == 0) {
            //    $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").empty();
            //}
            //if (countanaylsisclear != 3) {
            //    document.getElementById("ImprovingStaffResearchFlightsDocBtn").disabled = false;
            //    $('#ImprovingStaffResearchFlightsDoc').val('');
            //    document.getElementById("FlightsDoc").disabled = false;
            //}


            toastr.success("Document Deleted Successfully", 'Success Message');
            DisableDocumentsUpload();
            EnableDocumentsUpload();
        },
        error: function () {
            toastr.error('Error Trying to delete document.', 'Error Message');
        }
    });
}

// Upload Improving Staff Research Other Costs Documents
function UploadImprovingStaffResearchOtherCostsDoc() {
    var applicationId = getRApplicationId();
    var fileData = new FormData();
    arrCareerOtherCostsDocuments = [];
    var fileUpload = $("#ImprovingStaffResearchOtherCostsDoc").get(0);

    var files = fileUpload.files;

    if (files.length === 0) {
        toastr.error("Please select file to upload.");
        $('#ImprovingStaffResearchOtherCostsDoc').val('');
        return false;
    }

    // Validate files
    for (var i = 0; i < files.length; i++) {
        var file1 = files[i].name;

        if (file1) {
            var file_size = files[i].size;

            if (file_size < (5 * 1024 * 1024)) {
                var ext = file1.split('.').pop().toLowerCase();
                if ($.inArray(ext, ['pdf']) === -1) {
                    toastr.error("Only PDF uploads are allowed");
                    $('#ImprovingStaffResearchOtherCostsDoc').val('');
                    return false;
                }
            } else {
                toastr.error("File size should be 5 MB or less.");
                $('#ImprovingStaffResearchOtherCostsDoc').val('');
                return false;
            }
        }

        // Check for duplicate files
        for (var s = 0; s < arrCareerOtherCostsDocuments.length; s++) {
            if (arrCareerOtherCostsDocuments[s].name === files[i].name) {
                toastr.error("File " + files[i].name + " already uploaded.");
                $('#ImprovingStaffResearchOtherCostsDoc').val('');
                return false;
            }
        }

        arrCareerOtherCostsDocuments.push({ name: files[i].name, file: files[i], Id: applicationId });
    }

    // Append files to FormData
    for (var p = 0, len = arrCareerOtherCostsDocuments.length; p < len; p++) {
        fileData.append(arrCareerOtherCostsDocuments[p].name, arrCareerOtherCostsDocuments[p].file);
        fileData.append('Id', arrCareerOtherCostsDocuments[p].Id);
    }

    $('#ImprovingStaffResearchOtherCostsDoc').val('');

    $.ajax({
        url: '/Applications/UploadImprovingStaffResearchOtherCostsDoc',
        type: 'POST',
        contentType: false,
        processData: false,
        data: fileData,
        async: false,
        success: function (result) {
            $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").empty();
            arrimprovingstaffresearchothercosts.length = 0;

            for (var s = 0; s < result.length; s++) {
                if (result[s].UploadType.trim() == "Research Career Other Costs") {

                    $('#ImprovingStaffResearchOtherCostsDoc').val('');

                    arrimprovingstaffresearchothercosts.push({ name: result[s].filename, file: result[s] });

                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteImprovingStaffResearchOtherCostsFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";

                    $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").append(markup);

                    var deleteLink = $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").find('.deleteImprovingStaffResearchOtherCostsFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteImprovingStaffResearchOtherCostsFile($(this).data('file-id'));
                    });
                }
                DisableDocumentsUpload();
                EnableDocumentsUpload();
            }
            toastr.success("Document Uploaded Successfully", 'Success Message');
        },
        error: function () {
            toastr.error("There was an error uploading files.", 'Error Message');
        }
    });
}

function DeleteImprovingStaffResearchOtherCostsFile(Id) {


    $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").empty();
    $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    $.ajax({
        type: "GET",
        url: '/Applications/DeleteDocument',
        contentType: "application/json; charset=utf-8",
        data: { "documentId": Id },
        datatype: "json",
        success: function (result) {
            var countanaylsisclear = 0;
            arrimprovingstaffresearchothercosts.length = 0;
            $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").empty();

            if (result.length == 0) {
                EnableDocumentsUpload();
            }

            for (var s = 0; s < result.length; s++) {

                if (result[s].uploadType.trim() == 'Research Career Other Costs') {
                    if (countanaylsisclear == 0) {
                        $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").empty();
                    }
                    countanaylsisclear++;
                    arrimprovingstaffresearchothercosts.push({ name: result[s].filename, file: result[s] });
                    var markup = "<tr><td>" + result[s].filename + "</td><td><button type='button' title='Delete' class='deleteImprovingStaffResearchOtherCostsFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").append(markup);

                    var deleteLink = $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").find('.deleteImprovingStaffResearchOtherCostsFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteImprovingStaffResearchOtherCostsFile($(this).data('file-id'));
                    });
                    DisableDocumentsUpload();
                    EnableDocumentsUpload();
                }
            }

            toastr.success("Document Deleted Successfully", 'Success Message');
        },
        error: function () {
            toastr.error('Error Trying to delete document.', 'Error Message');
        }
    });
}

// Upload Improving Staff Research Total Cost Breakdown Documents
function UploadImprovingStaffResearchTotalCostBreakdownDoc() {
    arrCareerTotalCostBreakdownDocuments = [];
    var applicationId = getRApplicationId();
    var fileData = new FormData();
    var fileUpload = $("#ImprovingStaffResearchTotalCostBreakdownDoc").get(0);

    var files = fileUpload.files;

    if (files.length === 0) {
        toastr.error("Please select file to upload.");
        $('#ImprovingStaffResearchTotalCostBreakdownDoc').val('');
        return false;
    }

    // Validate files
    for (var i = 0; i < files.length; i++) {
        var file1 = files[i].name;

        if (file1) {
            var file_size = files[i].size;

            if (file_size < (5 * 1024 * 1024)) {
                var ext = file1.split('.').pop().toLowerCase();
                if ($.inArray(ext, ['pdf']) === -1) {
                    toastr.error("Only PDF uploads are allowed");
                    $('#ImprovingStaffResearchTotalCostBreakdownDoc').val('');
                    return false;
                }
            } else {
                toastr.error("File size should be 5 MB or less.");
                $('#ImprovingStaffResearchTotalCostBreakdownDoc').val('');
                return false;
            }
        }

        // Check for duplicate files
        for (var s = 0; s < arrCareerTotalCostBreakdownDocuments.length; s++) {
            if (arrCareerTotalCostBreakdownDocuments[s].name === files[i].name) {
                toastr.error("File " + files[i].name + " already uploaded.");
                $('#ImprovingStaffResearchTotalCostBreakdownDoc').val('');
                return false;
            }
        }

        arrCareerTotalCostBreakdownDocuments.push({ name: files[i].name, file: files[i], Id: applicationId });
    }

    // Append files to FormData
    for (var p = 0, len = arrCareerTotalCostBreakdownDocuments.length; p < len; p++) {
        fileData.append(arrCareerTotalCostBreakdownDocuments[p].name, arrCareerTotalCostBreakdownDocuments[p].file);
        fileData.append('Id', arrCareerTotalCostBreakdownDocuments[p].Id);
    }

    $('#ImprovingStaffResearchTotalCostBreakdownDoc').val('');

    $.ajax({
        url: '/Applications/UploadImprovingStaffResearchTotalCostBreakdownDoc',
        type: 'POST',
        contentType: false,
        processData: false,
        data: fileData,
        async: false,
        success: function (result) {
            $('#ImprovingStaffResearchTotalCostBreakdownDoc').val('');
            $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").empty();

            for (var s = 0; s < result.length; s++) {
                if (result[s].UploadType.trim() == "Research Career Total Cost Breakdown") {
                    arrimprovingstaffresearchtotalcostbreakdown.push({ name: result[s].Filename, file: result[s] });
                    $('#ImprovingStaffResearchTotalCostBreakdownDoc').val('');
                    document.getElementById("ImprovingStaffResearchTotalCostBreakdownDocBtn").disabled = true;
                    document.getElementById("ImprovingStaffResearchTotalCostBreakdownDoc").disabled = true;

                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteImprovingStaffResearchTotalCostBreakdownFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").append(markup);

                    var deleteLink = $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").find('.deleteImprovingStaffResearchTotalCostBreakdownFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteImprovingStaffResearchTotalCostBreakdownFile($(this).data('file-id'));
                    });

                }
            }
            toastr.success("Document Uploaded Successfully", 'Success Message');
        },
        error: function () {
            toastr.error("There was an error uploading files.", 'Error Message');
        }
    });
}
function isTeachingReliefSelected() {
    return $("#TeachingReplacementCheckBox").is(":checked")
        || $("#TeachingAssistanceCheckBox").is(":checked")
        || $("#TeachingCareerAssistanceMarkerCheckBox").is(":checked")
        || $("#TeachingLecturerCheckBox").is(":checked");
}


// Teaching Relief Schedule Table Validation - Step 4
function ValidateStep4TeachingReliefSchedule() {

    if (!isTeachingReliefSelected()) {
        return true;
    }

    if (getStep4PaymentCount() === 0) {
        toastr.error("Please add at least one teaching relief schedule entry", "Error Message");
        return false;
    }

    return true;
}
// Validate all file uploads for Step 4
function ValidateStep4FileUploads() {
    var hasValidDocuments = false;

    var teachingSelected = isTeachingReliefSelected();

    if (teachingSelected && arrCareerTeachingDocuments.length === 0) {
        toastr.error("Please upload Teaching Relief Documents", "Error Message");
        return false;
    }
    // Check for workshop documents if required
    if (arrCareerWorkshopDocuments.length === 0 && researchWorkshopFinancialSupportUploaded) {
        toastr.error("Please upload Workshop Registration Documents", 'Error Message');
        return false;
    }

    // Check for invitation documents if required
    if (arrcareerinvite.length === 0 && (researchWorkshopFinancialSupportUploaded || researchdhetFinancialSupportUploaded)) {
        toastr.error("Please upload Proof of Invitation Documents", 'Error Message');
        return false;
    }

    return true;
}

// Calculate total hours for Step 4
function CalTotalHoursStep4() {

    var weeks = parseFloat($("tfoot").find("#txtNumberOfWeeksStep4").val()) || 0;

    var hrsPerWeek = parseFloat($("tfoot").find("#txtHrsPerWeekStep4").val()) || 0;

    var total = weeks * hrsPerWeek;

    $("tfoot")
        .find('#txtNumberOfHoursStep4')
        .val(total.toFixed(2));

    if ($("#btnAddPaymentsStep4").text() == "Update") {
        CalTotalForMonthStep4();
    }
}

// Calculate total for month in Step 4
function CalTotalForMonthStep4() {
    var rate = parseRandAmount($("tfoot").find("#txtUJRatePerHrStep4").val());
    var totalHours = parseFloat($("tfoot").find("#txtNumberOfHoursStep4").val()) || 0;

    var total = rate * totalHours;

    $("tfoot").find("#txtMonthTotalStep4").val(total > 0 ? total.toFixed(2) : "");
}

// Remove row from teaching relief schedule
function RemovePaymentStep4(button) {
    var row = $(button).closest("TR");

    var id = $("TD", row).eq(0).html();
    var table = $("#tblPaymentsStep4.project2")[0];


    $.ajax({
        type: "GET",
        url: '/Applications/RemovePayment',
        data: { "id": id },
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        success: function (document) {
            table.deleteRow(row[0].rowIndex);
            arrPayment2--;
            UpdateStep4GrandTotal();
            toastr.success("Record removed Successfully", 'Success Message');
        },
        error: function () {
            toastr.error('Record cannot be removed.', 'Error Message');
        }
    });

    clearPaymentFoot();

}


function AddPaymentsStep4Row() {

    var txtStudyTypeStep4Val = $("tfoot #txtStudyTypeStep4").val();
    var txtFromStep4Val = $("tfoot #txtFromStep4").val();
    var txtToStep4Val = $("tfoot #txtToStep4").val();

    var txtHrsPerWeekStep4Val = parseRandAmount($("tfoot #txtHrsPerWeekStep4").val());

    var txtNumberOfWeeksStep4Val = parseRandAmount($("tfoot #txtNumberOfWeeksStep4").val());

    var txtNumberOfHoursStep4Val = parseRandAmount($("tfoot #txtNumberOfHoursStep4").val());

    var txtUJRatePerHrStep4Val = parseRandAmount($("tfoot #txtUJRatePerHrStep4").val());

    var txtMonthTotalStep4Val = parseFloat(
        $("tfoot #txtMonthTotalStep4").val()
            .replace(/[Rr$€£]/g, '')
            .replace(/,/g, '')
            .replace(/\s/g, '')
            .trim()
    );

    var paymentId = $("#btnAddPaymentsStep4").data("editingPaymentId");

    if (
        txtStudyTypeStep4Val &&
        txtFromStep4Val &&
        txtToStep4Val &&
        txtHrsPerWeekStep4Val > 0 &&
        txtNumberOfWeeksStep4Val > 0 &&
        txtNumberOfHoursStep4Val > 0 &&
        txtUJRatePerHrStep4Val > 0 &&
        txtMonthTotalStep4Val > 0
    ) {

        const paymentPayload = {
            Id: paymentId ? parseInt(paymentId) : 0,
            Type: txtStudyTypeStep4Val,
            StartDate: formatDateForSave(txtFromStep4Val),
            ApplicationsId: parseInt($("#Id").val()),
            EndDate: formatDateForSave(txtToStep4Val),
            HoursPerWeek: txtHrsPerWeekStep4Val,
            NumberOfWeeks: txtNumberOfWeeksStep4Val,
            TotalNumberOfHours: txtNumberOfHoursStep4Val,
            RatePerHour: txtUJRatePerHrStep4Val,
            MonthTotal: txtMonthTotalStep4Val,
            Step: "Research career development of emerging and mid-career researchers"
        };

        $.ajax({
            url: '/Applications/AddPayment',
            type: 'POST',
            data: JSON.stringify(paymentPayload),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',

            success: function (data) {

                if (data.status === "error" || data.status === "Error") {
                    toastr.error(data.message);
                    return;
                }

                GetCareerDevelopmentPayments($("#Id").val());

                clearPaymentFoot();

                $("#btnAddPaymentsStep4")
                    .removeData("editingPaymentId")
                    .text("Add");

                toastr.success(
                    data.message || "Payment saved successfully.",
                    "Success Message"
                );
            },

            error: function (xhr) {
                console.error("AddPayment error:", xhr.responseText);

                toastr.error(
                    "Error saving payment.",
                    "Error Message"
                );
            }
        });

    } else {

        toastr.error(
            "Please fill in all Required Fields",
            "Error Message"
        );
    }
}

// Update grand total for Step 4
function UpdateStep4GrandTotal() {
    let grandTotal = 0;

    $("#tblPaymentsStep4.project2 tbody tr")
        .filter(function () {
            return !$(this).is("[hidden]") && $(this).find("td").length > 1;
        })
        .each(function () {
            const amount = $(this).children().eq(8).text();

            grandTotal += parseRandAmount(amount);
        });


    $("#TotalStep4").val(formatRandDisplay(grandTotal));
}

// Delete TotalCostBreakdown Doc
function DeleteImprovingStaffResearchTotalCostBreakdownFile(Id) {
    $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").empty();
    $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    $.ajax({
        type: "GET",
        url: '/Applications/DeleteDocument',
        contentType: "application/json; charset=utf-8",
        data: { "documentId": Id },
        datatype: "json",
        success: function (result) {
            var fileupload = $("#ImprovingStaffResearchTotalCostBreakdownDoc").val("");
            fileupload.get(0).value = "";

            var countanaylsisclear = 0;
            arrimprovingstaffresearchtotalcostbreakdown.length = 0;
            $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").empty();
            if (result.length == 0) {
                EnableDocumentsUpload();
            } else {

                for (var s = 0; s < result.length; s++) {

                    if (result[s].uploadType.trim() == "Research Career Total Cost Breakdown") {
                        if (countanaylsisclear == 0) {

                        }
                        countanaylsisclear++;
                        arrimprovingstaffresearchtotalcostbreakdown.push({ name: result[s].filename, file: result[s] });
                        var markup = "<tr><td>" + result[s].filename + "</td><td><button type='button' title='Delete' class='deleteImprovingStaffResearchTotalCostBreakdownFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                        $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").append(markup);

                        // Bind delete event for newly added row
                        var deleteLink = $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").find('.deleteImprovingStaffResearchTotalCostBreakdownFile').last();
                        deleteLink.on('click', function (e) {
                            e.preventDefault();
                            DeleteImprovingStaffResearchTotalCostBreakdownFile($(this).data('file-id'));
                        });
                    }
                    DisableDocumentsUpload();
                    EnableDocumentsUpload();
                }
            }
            toastr.success("Document Deleted Successfully", 'Success Message');

        },
        error: function () {
            toastr.error('Error Trying to delete document.', 'Error Message');
        }
    });
}

function DeleteCareerDevelopmentInviteFile(Id) {

    $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").empty();
    $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    $.ajax({
        type: "GET",
        url: '/Applications/DeleteDocument',
        contentType: "application/json; charset=utf-8",
        data: { "documentId": Id },
        datatype: "json",
        success: function (result) {
            $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").empty();
            arrcareerinvite.length = 0;
            for (var s = 0; s < result.length; s++) {

                if (result[s].uploadType.trim() == 'Career Development Invite') {

                    var markup = "<tr><td>" + result[s].filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentInvitationFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").append(markup);

                    var deleteLink = $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").find('.deleteCareerDevelopmentInvitationFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteCareerDevelopmentInviteFile($(this).data('file-id'));
                    });

                }
            }

            // $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").empty();
            toastr.success("Document Deleted Successfully", 'Success Message');
            document.getElementById("CareerDevelopmentProofOfInvitationDocBtn").disabled = false;
            $('#CareerDevelopmentProofOfInvitationDoc').val('');
            document.getElementById("CareerDevelopmentProofOfInvitationDoc").disabled = false;
            DisableDocumentsUpload();
            EnableDocumentsUpload();
        },
        error: function () {
            toastr.error('Error Trying to delete document.', 'Error Message');
        }
    });
}

// Next button click handler
function HandleNextButtonClick(e) {
    e.preventDefault();

    if (isReadOnlyMode()) {
        window.goToNextStep("ResearchCareerTab");
        return false;
    }

    if (researchWorkshopFinancialSupportUploaded == false &&
        researchdhetFinancialSupportUploaded == false &&
        researchLecturerReliefDocUploaded == false &&
        researchteachingReliefDocUploaded == false &&
        researcAssitanceReliefDocUploaded == false &&
        researchCareerReliefDocUploaded == false) {
        toastr.error("Please select atleast one Financial Support or Teaching Relief", 'Error Message');
        return false;
    }
    var fileUploadsValid = ValidateStep4FileUploads();
    var teachingReliefValid = ValidateStep4TeachingReliefSchedule();

    if (!(fileUploadsValid && teachingReliefValid)) { return false };

    if (researchLecturerReliefDocUploaded == true ||
        researchteachingReliefDocUploaded == true ||
        researcAssitanceReliefDocUploaded == true ||
        researchCareerReliefDocUploaded == true) {

        if (arrCareerTeachingDocuments.length == 0) {
            toastr.error("Please upload Teaching Relief Documents", 'Error Message');
            return false;
        }

        if (getStep4PaymentCount() === 0) {
            toastr.error("Please add at least one teaching relief schedule", 'Error Message');
            return false;
        }

        if (arrimprovingstaffresearchtotalcostbreakdown.length == 0) {
            toastr.error("Please upload Total Cost Breakdown", 'Error Message');
            return false;
        }
    }

    var formData = new FormData();
    formData.append("UserId", $("#UserId").val());
    formData.append("Id", $("#Id").val());
    formData.append("FundingCallDetailsId", $("#FundingCallDetailsId").val());
    formData.append('CareerFinancialSupport[]', CareerFinancialsupportArr);
    formData.append('CareerTeachingRelief[]', TeachingReliefArr);
    showLoading();
    var $saveBtn = $(e.currentTarget);
    $.ajax({
        url: '/Applications/ApplicationCareerDevelopment',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideLoading();
            if (data.status === "Saved") {
                toastr.success("Application Information Saved Successfully", 'Success Message');
                var curStep = $saveBtn.closest(".setup-content");
                var curStepBtnId = curStep.attr("id");
                window.goToNextStep(curStepBtnId);
            }
            else {
                toastr.error("Error Occured while Saving Application Information", 'Error Message');
            }
        },
    });

}

const UploadTypeDescriptions = {
    ProofOfReg: "Proof Of Registration",
    SupervisorLetter: "Supervisor Letter",
    ReliefDocuments: "Relief Documents",
    Invoice: "Invoice",
    LanguageBinding: "Language Binding",
    StatisticalAnalysis: "Statistical Analysis",
    FocusGroups: "Focus Groups",
    Accommodation: "Accommodation",
    Flights: "Flights",
    CarRental: "Car Rental",
    OtherCost: "Other Cost",
    MobilityProgrammes: "Mobility Programmes",
    ImprovingStaffResearch: "Improving Staff Research Productivity Conference",
    CareerDevelopmentInvite: "Career Development Invite",
    CareerDevelopmentTeaching: "Career Development Teaching",
    CareerDevelopmentWorkshop: "Career Development Workshop",
    ImproveResearchInvite: "Improving Staff Research Productivity Invite",
    ResearchAssistance: "Research Assistance",
    FinancialSupport: "Financial Support",
    MobilityProgrammesAccommodation: "Mobility Programmes Accommodation",
    MobilityProgrammesFlight: "Mobility Programmes Flight",
    MobilityProgrammesOtherCosts: "Mobility Programmes Other Costs",
    ResearchCareerAccommodation: "Research Career Accommodation",
    WorkshopAccommodation: "Workshop Accommodation",
    TotalCostBreakdown: "Total Cost Breakdown",
    MobilityProgrammesTotalCostBrakedown: "Mobility Programmes TotalCost Brakedown",
    ResearchCareerFlights: "Research Career Flights",
    ResearchCareerOtherCosts: "Research Career Other Costs",
    ResearchCareerTotalCostBreakdown: "Research Career Total Cost Breakdown",
    MotivationLetter: "Motivation Letter"
};
function GetDocuments(applicationId) {

    var proofOfRegCount = 0;
    //===========================================================
    var researchCareerCheckBox = document.getElementById("ResearchCareerDiv");
    var careerDevelopmentProofOfInvitationDocFilesCount = 0;
    $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").empty();
    $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    var careerDevelopmentWorkshopRegFilesCount = 0;
    $("#ListofCareerDevelopmentWorkshopRegFiles tbody").empty();
    $("#ListofCareerDevelopmentWorkshopRegFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    var careerDevelopmentTeachingFilesCount = 0;
    $("#ListofCareerDevelopmentTeachingFiles tbody").empty();
    $("#ListofCareerDevelopmentTeachingFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');

    var careerDevelopmentWorkshopAccommodationFilesCount = 0;
    $("#ListofCareerDevelopmentWorkshopAccommodationFiles tbody").empty();
    $("#ListofCareerDevelopmentWorkshopAccommodationFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');


    var counterimproveresearchtotalcostbreakdown = 0;
    $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").empty();
    $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');




    var careerDevelopmentFlightsFilesCount = 0;
    $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").empty();
    $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');





    var counterimprovingstaffresearchothercostsdoc = 0;
    $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").empty();
    $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></td></tr>');


    //====================================================================


    $.ajax({
        type: "GET",
        url: '/Applications/GetDocs',
        data: { applicationId: applicationId },
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {

            for (var s = 0; s < result.length; s++) {

                if (result[s].UploadType.trim() == UploadTypeDescriptions.ImprovingStaffResearch) {

                    if (improveResearchWorkshopRegFilesCount == 0) {
                        $("#ListofImproveResearchWorkshopRegFiles tbody").empty();
                    }
                    improveResearchWorkshopRegFilesCount++;
                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteImproveResearchWorkshopFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofImproveResearchWorkshopRegFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofImproveResearchWorkshopRegFiles tbody").find('.deleteImproveResearchWorkshopFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteImproveResearchWorkShopFile($(this).data('file-id'));
                    });

                    arrimproveworkshop.push({ name: result[s].Filename, file: result[s] });
                }

                //Proof of Invitation
                if (result[s].UploadType.trim() == UploadTypeDescriptions.ImproveResearchInvite) {

                    if (improveResearchProofOfInvitationDocFilesCount == 0) {
                        $("#ListofImproveResearchProofOfInvitationDocFiles tbody").empty();
                    }
                    improveResearchProofOfInvitationDocFilesCount++;
                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteImproveResearchInviteFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofImproveResearchProofOfInvitationDocFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofImproveResearchProofOfInvitationDocFiles tbody").find('.deleteImproveResearchInviteFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteImproveResearchInviteFile($(this).data('file-id'));
                    });

                    arrimproveresearch.push({ name: result[s].Filename, file: result[s] });
                }

                //4.1
                //Research career development of emerging and mid-career researchers
                //Proof of Invitation
                if (result[s].UploadType.trim() == UploadTypeDescriptions.CareerDevelopmentInvite) {

                    if (careerDevelopmentProofOfInvitationDocFilesCount == 0) {
                        $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").empty();
                    }
                    careerDevelopmentProofOfInvitationDocFilesCount++;
                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentInvitationFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button  type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").find('.deleteCareerDevelopmentInvitationFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteCareerDevelopmentInviteFile($(this).data('file-id'));
                    });

                    arrcareerinvite.push({ name: result[s].Filename, file: result[s] });
                }

                //4.1
                //WorkShop/Conference Registration
                if (result[s].UploadType.trim() == UploadTypeDescriptions.CareerDevelopmentWorkshop) {

                    if (careerDevelopmentWorkshopRegFilesCount == 0) {
                        $("#ListofCareerDevelopmentWorkshopRegFiles tbody").empty();
                    }
                    careerDevelopmentWorkshopRegFilesCount++;
                    var markup = "<tr><td>" + result[s].Filename +
                        "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentWorkshopFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button>" +
                        "<button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId = " + result[s].Id + " data-toggle='modal' data-target='' title = 'View documents' > <i class='bi bi-eye'></i> View</button></td ></tr > ";
                    $("#ListofCareerDevelopmentWorkshopRegFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofCareerDevelopmentWorkshopRegFiles tbody").find('.deleteCareerDevelopmentWorkshopFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteCareerDevelopmentWorkshopFile($(this).data('file-id'));
                    });

                    arrCareerWorkshopDocuments.push({ name: result[s].Filename, file: result[s] });
                }

                //4.1
                //Teaching Relief Documents
                if (result[s].UploadType.trim() == UploadTypeDescriptions.CareerDevelopmentTeaching) {

                    if (careerDevelopmentTeachingFilesCount == 0) {
                        $("#ListofCareerDevelopmentTeachingFiles tbody").empty();
                    }
                    careerDevelopmentTeachingFilesCount++;
                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentTeachingFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofCareerDevelopmentTeachingFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofCareerDevelopmentTeachingFiles tbody").find('.deleteCareerDevelopmentTeachingFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteCareerDevelopmentTeachingFile($(this).data('file-id'));
                    });

                    arrCareerTeachingDocuments.push({ name: result[s].Filename, file: result[s] });
                }

                if (result[s].UploadType.trim() == UploadTypeDescriptions.ResearchCareerAccommodation) {

                    if (careerDevelopmentWorkshopAccommodationFilesCount == 0) {
                        $("#ListofWorkshopAccommodationDocumentsFiles tbody").empty();
                    }
                    careerDevelopmentWorkshopAccommodationFilesCount++;

                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteCareerDevelopmentAccommodationFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofWorkshopAccommodationDocumentsFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofWorkshopAccommodationDocumentsFiles tbody").find('.deleteCareerDevelopmentAccommodationFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteAccommodationFile($(this).data('file-id'));
                    });

                    arrCareerAccommodationDocuments.push({ name: result[s].Filename, file: result[s] });
                }

                //ImprovingStaffResearchFlights
                if (result[s].UploadType.trim() == UploadTypeDescriptions.ResearchCareerFlights) {

                    //console.log("ImprovingStaffResearchFlights = " + result[s].UploadType.trim());

                    if (careerDevelopmentFlightsFilesCount == 0) {
                        $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").empty();
                    }
                    careerDevelopmentFlightsFilesCount++;
                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteImprovingStaffResearchFlightsFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").find('.deleteImprovingStaffResearchFlightsFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteImprovingStaffResearchFlightsFile($(this).data('file-id'));
                    });

                    arrImprovingStaffResearchFlights.push({ name: result[s].Filename, file: result[s] });

                }

                //ImprovingStaffResearch Other Costs
                if (result[s].UploadType.trim() == UploadTypeDescriptions.ResearchCareerOtherCosts) {

                    if (counterimprovingstaffresearchothercostsdoc == 0) {
                        $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").empty();
                    }

                    counterimprovingstaffresearchothercostsdoc++;

                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteImprovingStaffResearchOtherCostsFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").find('.deleteImprovingStaffResearchOtherCostsFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteImprovingStaffResearchOtherCostsFile($(this).data('file-id'));
                    });

                    arrimprovingstaffresearchothercosts.push({ name: result[s].Filename, file: result[s] });
                }

                //ImprovingStaffResearch Total Cost Breakdown
                if (result[s].UploadType.trim() == UploadTypeDescriptions.ResearchCareerTotalCostBreakdown) {

                    if (counterimproveresearchtotalcostbreakdown == 0) {
                        $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").empty();
                    }

                    counterimproveresearchtotalcostbreakdown++;

                    var markup = "<tr><td>" + result[s].Filename + "</td><td><button type='button' title='Delete' class='deleteImprovingStaffResearchTotalCostBreakdownFile btn btn-sm btn-outline-danger me-1' data-file-id='" + result[s].Id + "'><i class='bi bi-trash'></i> Delete</button><button type='button' class='btnViewOpenDocR action-buttons btn btn-sm btn-outline-primary me-1' documentId=" + result[s].Id + " data-toggle='modal' data-target='' title='View documents'><i class='bi bi-eye'></i> View</button></td></tr>";
                    $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").append(markup);

                    // Bind delete event for newly added row
                    var deleteLink = $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").find('.deleteImprovingStaffResearchTotalCostBreakdownFile').last();
                    deleteLink.on('click', function (e) {
                        e.preventDefault();
                        DeleteImprovingStaffResearchTotalCostBreakdownFile($(this).data('file-id'));
                    });

                    arrimprovingstaffresearchtotalcostbreakdown.push({ name: result[s].Filename, file: result[s] });
                }
                DisableDocumentsUpload();
                EnableDocumentsUpload();

                if (isReadOnlyMode()) {
                    $.each($("#project2TabContent").find(".btn-outline-danger"), function (i, e) {
                        $(e).addClass("disabled");
                    });
                }
            }


            if (true) {//researchCareerCheckBox.style.display == "block"
                if (careerDevelopmentProofOfInvitationDocFilesCount == 0) {

                    document.getElementById("CareerDevelopmentProofOfInvitationDocBtn").disabled = false;
                    document.getElementById("CareerDevelopmentProofOfInvitationDoc").disabled = false;

                    $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").empty();
                    $("#ListofCareerDevelopmentProofOfInvitationDocFiles tbody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>Proof Of Invitation Document Not Available.</strong></td></tr>");

                }

                if (careerDevelopmentWorkshopRegFilesCount == 0) {
                    document.getElementById("CareerDevelopmentWorkshopRegDocBtn").disabled = false;
                    document.getElementById("CareerDevelopmentWorkshopRegDoc").disabled = false;

                    $("#ListofCareerDevelopmentWorkshopRegFiles tbody").empty();
                    $("#ListofCareerDevelopmentWorkshopRegFiles tbody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>WorkShop Documents Not Available.</strong></td></tr>");

                }

                if (careerDevelopmentTeachingFilesCount <= 10) {

                    document.getElementById("CareerDevelopmentTeachingDocBtn").disabled = false;
                    document.getElementById("CareerDevelopmentTeachingDoc").disabled = false;

                    if (careerDevelopmentTeachingFilesCount == 0) {
                        $("#ListofCareerDevelopmentTeachingFiles tbody").empty();
                        $("#ListofCareerDevelopmentTeachingFiles tbody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>Teaching Relief Documents Not Available.</strong></td></tr>");
                    }

                }


                if (careerDevelopmentWorkshopAccommodationFilesCount == 0) {

                    document.getElementById("CareerDevelopmentWorkshopAccommodationBtn").disabled = false;
                    document.getElementById("CareerDevelopmentWorkshopAccommodationDoc").disabled = false;

                    if (careerDevelopmentWorkshopAccommodationFilesCount == 0) {
                        $("#ListofWorkshopAccommodationDocumentsFiles tbody").empty();
                        $("#ListofWorkshopAccommodationDocumentsFiles tbody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>Accommodation Documents Not Available.</strong></td></tr>");
                    }
                }

                if (careerDevelopmentFlightsFilesCount == 0) {
                    document.getElementById("ImprovingStaffResearchFlightsDocBtn").disabled = false;
                    document.getElementById("ImprovingStaffResearchFlightsDoc").disabled = false;

                    $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").empty();
                    $("#ListofImprovingStaffResearchFlightsDocumentsFiles tbody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>Flights Documents Not Available.</strong></td></tr>");

                }

                if (counterimprovingstaffresearchothercostsdoc == 0) {
                    document.getElementById("ImprovingStaffResearchOtherCostsDocBtn").disabled = false;
                    document.getElementById("ImprovingStaffResearchOtherCostsDoc").disabled = false;

                    $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").empty();
                    $("#ListofImprovingStaffResearchOtherCostsDocumentsFiles tbody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>Other Costs Documents Not Available.</strong></td></tr>");

                }

                if (counterimproveresearchtotalcostbreakdown == 0) {
                    document.getElementById("ImprovingStaffResearchTotalCostBreakdownDocBtn").disabled = false;
                    document.getElementById("ImprovingStaffResearchTotalCostBreakdownDoc").disabled = false;

                    $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").empty();
                    $("#ListofImprovingStaffResearchTotalCostBreakdownDocumentsFiles tbody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>Total Cost Breakdown Documents Not Available.</strong></td></tr>");

                }
            }

            showHideRequired("#ProofOfInvitation", (researchWorkshopFinancialSupportUploaded || researchdhetFinancialSupportUploaded));
        },
        error: function (response) {

            toastr.error(response, 'Error Message');
        }
    });
}

function GetCareerDevelopmentPayments(applicationId) {
    $.ajax({
        type: "GET",
        url: "/Applications/GetCareerDevelopmentPayments",
        data: { applicationId: applicationId },
        dataType: "json",
        success: function (result) {
            RenderStep4Payments(result);
        },
        error: function () {
            toastr.error("Could not load payments.", "Error Message");
        }
    });
}


function CareerResearchViewLoaded() {

    var containerCareerTeaching = (document.getElementById('careerTeachingReliefData')).dataset.careerteachingreliefData;

    var dataSupportReqResearchTeaching = JSON.parse(containerCareerTeaching);

    var containerFinancialSupport = (document.getElementById('careerFinancialSupportData')).dataset.careerfinancialsupportData;

    var dataSupportReqResearchFinancial = JSON.parse(containerFinancialSupport);

    if (containerCareerTeaching.length > 6) {

        var supportReqList = [];

        supportReqList = dataSupportReqResearchTeaching[0].split(',');

        for (var i = 0; i < supportReqList.length; i++) {
            if (supportReqList[i] == "Replacement by temporary lecturer") {

                $('#TeachingReplacementCheckBox').prop('checked', true);
                $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
                $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
                teachingReliefDocUploaded = true;
                researchteachingReliefDocUploaded = true;
                TeachingReliefArr.push(supportReqList[i]);
            }

            if (supportReqList[i] == 'Teaching assistance from senior tutor OR tutor') {

                $('#TeachingAssistanceCheckBox').prop('checked', true);
                $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
                $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
                teachingReliefDocUploaded = true;

                researcAssitanceReliefDocUploaded = true;

                TeachingReliefArr.push(supportReqList[i]);
            }

            if (supportReqList[i] == 'Teaching assistance from tutor') {

                $('#TeachingCareerAssistanceMarkerCheckBox').prop('checked', true);
                $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
                $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
                teachingReliefDocUploaded = true;

                researchCareerReliefDocUploaded = true;

                TeachingReliefArr.push(supportReqList[i]);
            }

            if (supportReqList[i] == 'Lecturer') {

                $('#TeachingLecturerCheckBox').prop('checked', true);
                $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
                $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
                teachingReliefDocUploaded = true;

                researchLecturerReliefDocUploaded = true;

                TeachingReliefArr.push(supportReqList[i]);
            }
        }

    }

    if (containerFinancialSupport.length > 6) {

        var supportReqListFinancial = [];
        supportReqListFinancial = dataSupportReqResearchFinancial[0].split(',');

        for (var i = 0; i < supportReqListFinancial.length; i++) {
            if (supportReqListFinancial[i] == 'DHET accredited') {
                $('#DHETFinancialSupportCheckBox').prop('checked', true);
                researchdhetFinancialSupportUploaded = true;
                CareerFinancialsupportArr.push(supportReqListFinancial[i]);
            }

            if (supportReqListFinancial[i] == 'Research development workshops') {

                $('#ResearchFinancialSupportCheckBox').prop('checked', true);
                researchWorkshopFinancialSupportUploaded = true;
                CareerFinancialsupportArr.push(supportReqListFinancial[i]);
            }


        }

    }


}

function DisableDocumentsUpload() {
    if (arrCareerTeachingDocuments.length >= 10) {
        document.getElementById("CareerDevelopmentTeachingDocBtn").disabled = true;
        document.getElementById("CareerDevelopmentTeachingDoc").disabled = true;
    }
    if (arrCareerAccommodationDocuments.length >= 3) {
        document.getElementById("CareerDevelopmentWorkshopAccommodationBtn").disabled = true;
        document.getElementById("CareerDevelopmentWorkshopAccommodationDoc").disabled = true;
    }
    if (arrcareerinvite.length >= 1) {
        document.getElementById("CareerDevelopmentProofOfInvitationDocBtn").disabled = true;
        document.getElementById("CareerDevelopmentProofOfInvitationDoc").disabled = true;
    }
    if (arrCareerWorkshopDocuments.length >= 0) {
        document.getElementById("CareerDevelopmentWorkshopRegDocBtn").disabled = true;
        document.getElementById("CareerDevelopmentWorkshopRegDoc").disabled = true;
    }
    if (arrCareerFlightsDocuments.length >= 3) {
        document.getElementById("ImprovingStaffResearchFlightsDocBtn").disabled = true;
        document.getElementById("ImprovingStaffResearchFlightsDoc").disabled = true;
    }

    if (arrimprovingstaffresearchothercosts.length >= 1) {
        document.getElementById("ImprovingStaffResearchOtherCostsDocBtn").disabled = true;
        document.getElementById("ImprovingStaffResearchOtherCostsDoc").disabled = true;
    }

    if (arrimprovingstaffresearchtotalcostbreakdown.length >= 1) {
        document.getElementById("ImprovingStaffResearchTotalCostBreakdownDocBtn").disabled = true;
        document.getElementById("ImprovingStaffResearchTotalCostBreakdownDoc").disabled = true;
    }

}

function EnableDocumentsUpload() {
    if (arrCareerTeachingDocuments.length < 10) {
        document.getElementById("CareerDevelopmentTeachingDocBtn").disabled = false;
        document.getElementById("CareerDevelopmentTeachingDoc").disabled = false;
    }
    if (arrCareerAccommodationDocuments.length < 3) {
        document.getElementById("CareerDevelopmentWorkshopAccommodationBtn").disabled = false;
        document.getElementById("CareerDevelopmentWorkshopAccommodationDoc").disabled = false;
    }
    if (arrcareerinvite.length < 1) {
        document.getElementById("CareerDevelopmentProofOfInvitationDocBtn").disabled = false;
        document.getElementById("CareerDevelopmentProofOfInvitationDoc").disabled = false;
    }
    if (arrCareerWorkshopDocuments.length == 0) {
        document.getElementById("CareerDevelopmentWorkshopRegDocBtn").disabled = false;
        document.getElementById("CareerDevelopmentWorkshopRegDoc").disabled = false;
    }
    if (arrCareerFlightsDocuments.length < 3) {
        document.getElementById("ImprovingStaffResearchFlightsDocBtn").disabled = false;
        document.getElementById("ImprovingStaffResearchFlightsDoc").disabled = false;
    }
    if (arrimprovingstaffresearchothercosts.length < 1) {
        document.getElementById("ImprovingStaffResearchOtherCostsDocBtn").disabled = false;
        document.getElementById("ImprovingStaffResearchOtherCostsDoc").disabled = false;
    }
    if (arrimprovingstaffresearchtotalcostbreakdown.length < 1) {
        document.getElementById("ImprovingStaffResearchTotalCostBreakdownDocBtn").disabled = false;
        document.getElementById("ImprovingStaffResearchTotalCostBreakdownDoc").disabled = false;
    }
}

$(".nextBtnResearch").on("click", function (e) {
    HandleNextButtonClick(e);
});

$(".backBtnResearch").on("click", function () {
    var curStep = $(this).closest(".setup-content");
    var curStepBtnId = curStep.attr("id");
    window.goToPreviousStep(curStepBtnId);
});

//$("#btnCloseResearch").off("click").on("click", function () {
//    window.location.href = "/researchsuiteUCDP/Ucdp/Index";
//});

function EditPaymentStep4(button) {

    var row = $(button).closest("TR");
    var paymentId = $("TD", row).eq(0).html();

    // Find the row with the matching ID
    var rows = document.querySelectorAll("#tblPaymentsStep4.project2 tbody tr");
    var targetRow = null;
    var rowIndex = -1;

    for (var i = 0; i < rows.length; i++) {
        var firstCell = rows[i].querySelector("td:first-child");
        if (firstCell && firstCell.textContent.trim() === paymentId.toString()) {
            targetRow = rows[i];
            rowIndex = i;
            break;
        }
    }

    if (!targetRow) {
        toastr.error("Payment record not found", 'Error Message');
        return;
    }

    // Extract data from the row
    var cells = targetRow.querySelectorAll("td");
    var paymentData = {
        id: cells[0].textContent.trim(),
        type: cells[1].textContent.trim(),
        from: cells[2].textContent.trim(),
        to: cells[3].textContent.trim(),
        numberOfWeeks: cells[4].textContent.trim(),
        hoursPerWeek: cells[5].textContent.trim(),
        totalHours: cells[6].textContent.trim(),
        rate: cells[7].textContent.trim(),
        total: cells[8].textContent.trim()
    };

    // Populate the form fields with the payment data
    $("tfoot").find("#txtStudyTypeStep4").val(paymentData.type);
    $("tfoot").find("#txtFromStep4").val(paymentData.from);
    $("tfoot").find("#txtToStep4").val(paymentData.to);
    $("tfoot").find("#txtNumberOfWeeksStep4").val(paymentData.numberOfWeeks);
    $("tfoot").find("#txtHrsPerWeekStep4").val(paymentData.hoursPerWeek);
    $("tfoot").find("#txtNumberOfHoursStep4").val(paymentData.totalHours);
    $("tfoot").find("#txtUJRatePerHrStep4").val(paymentData.rate.replace(/[^\d.-]/g, ''));
    $("tfoot").find("#txtMonthTotalStep4").val(paymentData.total.replace(/[^\d.-]/g, ''));

    // Store the payment ID for update
    $("#btnAddPaymentsStep4").data("editingPaymentId", paymentId);
    $("#btnAddPaymentsStep4").text("Update");
    $("#btnAddPaymentsStep4").removeClass("btn-outline-primary").addClass("btn-outline-warning");
    $("#btnClearPaymentStep4").removeClass("d-none");

    // Remove the row temporarily for editing
    /*targetRow.remove();*/

    //// Update the total by removing this payment's amount
    //var totalAmount = paymentData.total.replace(/[^\d.-]/g, '');
    //var currentTotal = $("#TotalStep4").val();
    //var newTotal = (currentTotal * 1) - (totalAmount * 1);
    //$('#TotalStep4').val(newTotal);


}

function clearPaymentFoot() {
    $("tfoot").find("#txtStudyTypeStep4").val("");
    $("tfoot").find("#txtFromStep4").val("");
    $("tfoot").find("#txtToStep4").val("");
    $("tfoot").find("#txtNumberOfWeeksStep4").val("");
    $("tfoot").find("#txtHrsPerWeekStep4").val("");
    $("tfoot").find("#txtNumberOfHoursStep4").val("");
    $("tfoot").find("#txtUJRatePerHrStep4").val("");
    $("tfoot").find("#txtMonthTotalStep4").val("");

    $("#btnAddPaymentsStep4").data("editingPaymentId", "");
    $("#btnAddPaymentsStep4").text("Add");
    $("#btnAddPaymentsStep4").addClass("btn-outline-primary").removeClass("btn-outline-warning");
    $("#btnClearPaymentStep4").addClass("d-none");
}


function getStep4PaymentCount() {
    return $("#tblPaymentsStep4.project2 tbody tr").filter(function () {
        var cells = $(this).find("td");

        var id = cells.eq(0).text().trim();
        var type = cells.eq(1).text().trim();
        var totalAmount = parseRandAmount(cells.eq(8).text().trim());

        return cells.length >= 9 && id && type && totalAmount > 0;
    }).length;
}
var hasStep4Payments = false;
function RenderStep4Payments(data) {
    arrPayment2 = 0;
    hasStep4Payments = false;
    clearPaymentFoot();

    $("#tblPaymentsStep4.project2 tbody").empty();

    var result = data?.results || data?.data || data || [];

    if (!Array.isArray(result) || result.length === 0) {
        $("#TotalStep4").val("");
        return;
    }


    for (var s = 0; s < result.length; s++) {

        var item = result[s];

        var id = item.id || item.Id;
        var type = item.type || item.Type;
        var startDate = item.startDate || item.StartDate;
        var endDate = item.endDate || item.EndDate;
        var numberOfWeeks = item.numberOfWeeks ?? item.NumberOfWeeks ?? 0;
        var hoursPerWeek = item.hoursPerWeek ?? item.HoursPerWeek ?? 0;
        var totalHours = item.totalNumberOfHours ?? item.TotalNumberOfHours ?? 0;
        var ratePerHour = item.ratePerHour ?? item.RatePerHour ?? 0;
        var monthTotal = item.monthTotal ?? item.MonthTotal ?? 0;

        //total += parseRandAmount(monthTotal);
        //$("#TotalStep4").val(formatRandDisplay(total));

        var tBody = $("#tblPaymentsStep4.project2 > tbody")[0];
        var row = tBody.insertRow(-1);

        $(row.insertCell(-1)).html(id).hide();
        $(row.insertCell(-1)).html(type);
        $(row.insertCell(-1)).html(new Date(startDate).toLocaleDateString("en-GB"));
        $(row.insertCell(-1)).html(new Date(endDate).toLocaleDateString("en-GB"));
        $(row.insertCell(-1)).html(numberOfWeeks);
        $(row.insertCell(-1)).html(hoursPerWeek);
        $(row.insertCell(-1)).html(totalHours);
        $(row.insertCell(-1)).html(formatRandDisplay(ratePerHour));
        $(row.insertCell(-1)).html(formatRandDisplay(monthTotal));

        var actionCell = $(row.insertCell(-1));

        var btnEdit = $("<button/>")
            .attr("type", "button")
            .addClass("btn btn-sm btn-outline-warning me-1 btnEditPaymentStep4")
            .text("Edit")
            .on("click", function () {
                EditPaymentStep4(this);
            });

        var btnRemove = $("<button/>")
            .attr("type", "button")
            .addClass("btn btn-sm btn-outline-danger btnRemovePaymentStep4")
            .text("Delete")
            .on("click", function () {
                RemovePaymentStep4(this);
            });

        actionCell.append(btnEdit).append(btnRemove);
    }
    hasStep4Payments = getStep4PaymentCount() > 0;
    UpdateStep4GrandTotal();
}
function showHideRequired(elem, checked) {
    if (checked) {
        $($(elem).find(".alert-info").find(".text-danger")).removeClass("d-none")
    } else {
        $($(elem).find(".alert-info").find(".text-danger")).addClass("d-none")
    }
}