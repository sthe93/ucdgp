$(document).ready(function () {

    if ($("#IsQualificationInPrgress").val().toLowerCase() == 'true') {
        document.getElementById("inProgressSection").style.display = "";
        document.getElementById("graduatedSection").style.display = "none";
        document.getElementById("QualificationModeInProgress").checked = true;
        document.getElementById("QualificationModeGraduated").checked = false;
    } else {
        document.getElementById("inProgressSection").style.display = "none";
        document.getElementById("graduatedSection").style.display = "";
        document.getElementById("QualificationModeInProgress").checked = false;
        document.getElementById("QualificationModeGraduated").checked = true
    }

    // -- Replace the existing radio change handler with this updated handler --
    document.querySelectorAll('input[name="IsQualificationInProgressMode"]').forEach(radio => {
        radio.addEventListener('change', function (e) {
            const newVal = this.value;

            if (newVal === "true") {
                document.getElementById("inProgressSection").style.display = "";
                document.getElementById("graduatedSection").style.display = "none";
                $("#IsQualificationInPrgress").val("true");
                $("#IsQualificationGraduated").val("false");              
            } else {
                document.getElementById("inProgressSection").style.display = "none";
                document.getElementById("graduatedSection").style.display = "";
                $("#IsQualificationInPrgress").val("false");
                $("#IsQualificationGraduated").val("true"); 
            }
        });
    });

    tabs = [
        //{ elementId: "#IsQualificationInPrgress", section: ".inProgressInnerSection" },
        //{ elementId: "#IsQualificationGraduated", section: ".graduatedSectionInnerSection" },
        { elementId: "#IsReliefAppointment", section: "#reliefAppointmentInnerSection" },
        { elementId: "#IsResearchPublication", section: "#researchPublicationInnerSection" },
        { elementId: "#IsResearchProject", section: "#researchProjectInnerSection" },
        { elementId: "#IsCollaborativeProject", section: "#collaborativeProjectInnerSection" }
    ];
    tabs.forEach(tab => {
        initialisesTabsFormDisplay(tab.elementId, tab.section);
    });

    initialiseNavButtons();
    initialiseRFIModal();

    //=======================================File Handling=====================================================

    // When a "View" button is clicked for a proof file
    $(document).on('click', '.view-file', function (e) {
        e.preventDefault();
        var $btn = $(this);
        // Prefer explicit data-docurl (constructed via Url.Action in the view)
        var fileUrl = $btn.data('docurl');
        // Fallback to building a URL by document id
        if (!fileUrl) {
            var docId = $btn.data('document-id');
            var baseUrl = window.config.basePath;
            fileUrl = baseUrl + '/Administration/ViewDocument?documentId=' + encodeURIComponent(docId);
        }

        // Set iframe src and show modal
        $('#documentViewerIframe').attr('src', fileUrl);
        $('#documentViewerModal').modal('show');
    });

    // Clear iframe src when modal hidden to stop PDF loading/playing
    $('#documentViewerModal').on('hidden.bs.modal', function () {
        $('#documentViewerIframe').attr('src', '');
    });

    $('.rfiModalCloseBtn').on('click', function (e) {
        // hide modal
        var modalEl = document.getElementById('deleteFileModal');
        var bsInstance = bootstrap.Modal.getInstance(modalEl);
        if (bsInstance) {
            bsInstance.hide();
        }
    });

    $('.deleteModalCloseBtn').on('click', function (e) {
        // hide modal
        var modalEl = document.getElementById('deleteFileModal');
        var bsInstance = bootstrap.Modal.getInstance(modalEl);
        if (bsInstance) {
            bsInstance.hide();
        }
    });

    var _pendingDelete = null;
    $(document).on('click', '.delete-file', function (e) {
        e.preventDefault();
        var $btn = $(this);
        var docId = $btn.data('document-id');
        var filename = $btn.data('filename') || '';
        var isMotivationalLetter = $btn.data('ismotivationalletter') || false;

        if (!docId) {
            toastr.error("Invalid document id.", 'Error Message');
            return;
        }

        // store pending deletion info
        _pendingDelete = { docId: docId, filename: filename, $btn: $btn, isMotivationalLetter: isMotivationalLetter };

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
        var isMotivationalLetter = _pendingDelete.isMotivationalLetter;

        // hide modal
        var modalEl = document.getElementById('deleteFileModal');
        var bsInstance = bootstrap.Modal.getInstance(modalEl);
        if (bsInstance) {
            bsInstance.hide();
        }

        // call deleteDocument and pass the originating button so UI removal works correctly
        if (!isMotivationalLetter) {
            deleteDocument(docId, $btn);
        } else {
            deleteMotivationalLetter(docId, $btn);
        }


        // clear pending
        _pendingDelete = null;
    });


    $('#btnFinalizeReport').on('click', function (e) {
        var reportId = document.getElementById('ReportId')?.value
        var formData = new FormData();
        formData.append("Id", reportId);
        finaliseProgressReport(formData);
    });
});
function initialisesTabsFormDisplay(elementId, section) {
    var $select = $(elementId);

    // Run once on page load
    if ($select.val().toLowerCase() === "true") {
        $(section).show();
    } else {
        $(section).hide();
    }

    // Bind change event
    $select.on('change', function () {
        if (this.value.toLowerCase() === "true") {
            $(section).show();
        } else {
            $(section).hide();
        }
    });
}

//===============================================================/Tabs/===============================================================//
function initialiseNavButtons() {
    var baseUrl = window.config.basePath;
    $(".closeBtn").on('click', function () {
        var viewReportSource = $("#ViewReportSource").val();

        if (viewReportSource === 'ProgressReports') {
            window.location.href = baseUrl + '/Administration/Reports';
        }
        else {
            window.location.href = baseUrl + '/UCDP/Applications';
        }
    });

    //=====================/Recipient tab/=====================//

    $("#btnNextToQualification").on('click', function () {
        updateProgressReport();
    });

    //=====================/Qualification in progress tab/=====================//

    $("#btnBackToRecipient").on('click', function () {
        var $btn = $("#recipient-tab");
        if ($btn.length) {
            $btn.trigger('click');
        }
    });

    $("#btnNextToGraduated").on('click', function (e) {
        var result = validateQualificationInProgress(e);
        if (result) {
            var formData = new FormData();
            formData.append("Username", $("#Username").val());
            formData.append("ApplicationId", $("#ApplicationId").val());
            formData.append("Id", $("#ReportId").val());
            formData.append("IsQualificationInPrgress", true);
            formData.append("IsQualificationGraduated", false);
            formData.append("QualificationName", $("#QualificationName").val());
            formData.append("QualificationInPrgressFieldOfStudy", $("#QualificationInPrgressFieldOfStudy").val());
            formData.append("QualificationInPrgressTitleofThesis", $("#QualificationInPrgressTitleofThesis").val());
            formData.append("QualificationInPrgressInstitution", $("#QualificationInPrgressInstitution").val());
            formData.append("QualificationInPrgressGraduationYear", $("#QualificationInPrgressGraduationYear").val());
            formData.append("StepId", "2");
            saveReportProgress(e, formData, "#teaching-tab");
        }
    });

    $("#btnAddProof").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('proofFile');
        var listElement = $("#proofFilesList li");
        var $btn = $(this);

        saveDocuments(e, input, $btn, 1, listElement, 1);
    });

    $("#btnAddSupervisor").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('supervisorFile');
        var listElement = $("#supervisorFilesList li");
        var $btn = $(this);

        saveDocuments(e, input, $btn, 2, listElement, 1);
    });

    //=====================/Qualification graduated tab/=====================//

    $("#btnBackToInProgress").on('click', function () {
        var $btn = $("#recipient-tab");
        if ($btn.length) {
            $btn.trigger('click');
        }
    });

    $("#btnNextToTeaching").on('click', function (e) {
        var result = true; //validatQualificationGraduated(e);
        if (result) {
            var formData = new FormData();
            formData.append("Username", $("#Username").val());
            formData.append("ApplicationId", $("#ApplicationId").val());
            formData.append("Id", $("#ReportId").val());
            formData.append("IsQualificationGraduated", true);
            formData.append("IsQualificationInPrgress", false);
            formData.append("QualificationGraduatedName", $("#QualificationGraduatedName").val());
            formData.append("QualificationGraduatedFieldOfStudy", $("#QualificationGraduatedFieldOfStudy").val());
            formData.append("QualificationGraduatedTitleofThesis", $("#QualificationGraduatedTitleofThesis").val());
            formData.append("QualificationGraduatedInstitution", $("#QualificationGraduatedInstitution").val());
            formData.append("QualificationGraduatedYear", $("#QualificationGraduatedYear").val());
            formData.append("StepId", "3");
            saveReportProgress(e, formData, "#teaching-tab");
        }
    });

    $("#btnAddGradProof").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('proofGradFile');
        var listElement = $("#proofGradFilesList li");
        var $btn = $(this);

        saveDocuments(e, input, $btn, 3, listElement, 1);
    });

    $("#btnAddSupervisorGrad").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('supervisorGradFile');
        var listElement = $("#supervisorGradFilesList li");
        var $btn = $(this);

        saveDocuments(e, input, $btn, 4, listElement, 1);
    });

    //=====================/Teaching tab/=====================//

    $("#btnBackToQualification").on('click', function () {
        var $btn = $("#qualification-tab");
        if ($btn.length) {
            $btn.trigger('click');
        }
    });

    $("#btnNextToPublications").on('click', function (e) {
        var result = validateTeachRelief(e);
        if (result) {
            var formData = new FormData();
            formData.append("Username", $("#Username").val());
            formData.append("ApplicationId", $("#ApplicationId").val());
            formData.append("Id", $("#ReportId").val());
            formData.append("IsReliefAppointment", $("#IsReliefAppointment").val());
            formData.append("StepId", "4");
            saveReportProgress(e, formData, "#publications-tab");
        }
    });


    $("#btnAddTeachingReliefProof").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('teachingReliefProofFile');
        var listElement = $("#teachingReliefProofFilesList li");
        var $btn = $(this);

        saveDocuments(e, input, $btn, 5, listElement, 3);
    });

    //=====================/Publications tab/=====================//

    $("#btnBackToTeaching").on('click', function () {
        var $btn = $("#teaching-tab");
        if ($btn.length) {
            $btn.trigger('click');
        }
    });

    $("#btnNextToProjects").on('click', function (e) {
        var result = validateResearchPublication(e);
        if (result) {
            var formData = new FormData();
            formData.append("Username", $("#Username").val());
            formData.append("ApplicationId", $("#ApplicationId").val());
            formData.append("Id", $("#ReportId").val());
            formData.append("IsResearchPublication", $("#IsResearchPublication").val());
            formData.append("ResearchAccreditedJournal", $("#ResearchAccreditedJournal").val());
            formData.append("ResearchAccreditedChapter", $("#ResearchAccreditedChapter").val());
            formData.append("ResearchAccreditedBook", $("#ResearchAccreditedBook").val());
            formData.append("ResearchAccreditedConference", $("#ResearchAccreditedConference").val());
            formData.append("StepId", "5");
            saveReportProgress(e, formData, "#projects-tab");
        }
    });

    //=====================/Projects tab/=====================//

    $("#btnBackToPublications").on('click', function () {
        var $btn = $("#publications-tab");
        if ($btn.length) {
            $btn.trigger('click');
        }
    });

    $("#btnNextToCollabProjects").on('click', function (e) {
        var result = validateResearchProjects(e);
        if (result) {
            var formData = new FormData();
            formData.append("Username", $("#Username").val());
            formData.append("ApplicationId", $("#ApplicationId").val());
            formData.append("Id", $("#ReportId").val());
            formData.append("IsResearchProject", $("#IsResearchProject").val());
            formData.append("ResearchProjectSupport", $("#ResearchProjectSupport").val());
            formData.append("Activities", $("#Activities").val());
            formData.append("Outputs", $("#Outputs").val());
            formData.append("Outcome", $("#Outcome").val());
            formData.append("StepId", "6");
            saveReportProgress(e, formData, "#collab-tab");
        }
    });

    $("#btnAddResearchProject").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('researchProjectProofFile');
        var listElement = $("#researchProjectFilesList li");
        var $btn = $(this);

        saveDocuments(e, input, $btn, 6, listElement, 7);
    });

    //=====================/Collab tab/=====================//

    $("#btnBackToProjects").on('click', function () {
        var $btn = $("#projects-tab");
        if ($btn.length) {
            $btn.trigger('click');
        }
    });

    $("#btnNextToMotivationalLetter").on('click', function (e) {
        var result = validateCollaborativeProjects(e);
        if (result) {
            var formData = new FormData();
            formData.append("Username", $("#Username").val());
            formData.append("ApplicationId", $("#ApplicationId").val());
            formData.append("Id", $("#ReportId").val());
            formData.append("IsCollaborativeProject", $("#IsCollaborativeProject").val());
            formData.append("CollaborativeProjectSupported", $("#CollaborativeProjectSupported").val());
            formData.append("CollaborativeActivities", $("#CollaborativeActivities").val());
            formData.append("CollaborativeOutputs", $("#CollaborativeOutputs").val());
            formData.append("CollaborativeOutcome", $("#CollaborativeOutcome").val());
            formData.append("StepId", "7");
            saveReportProgress(e, formData, "#motivational-tab");
        }
    });

    $("#btnAddCollaborativeProject").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('collaborativeProjectProofFile');
        var listElement = $("#collaborativeProjectFilesList li");
        var $btn = $(this);

        saveDocuments(e, input, $btn, 7, listElement, 7);
    });

    //=====================/Motivational Letter/=====================//

    $("#btnBackToCollab").on('click', function () {
        var $btn = $("#collab-tab");
        if ($btn.length) {
            $btn.trigger('click');
        }
    });

    $("#btnMotivationalLetter").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('motivationalLetterProofFile');
        var listElement = $("#motivationalLetterFilesList li");
        var $btn = $(this);
        saveDocuments(e, input, $btn, 11, listElement, 1, true);
    });

    $("#btnNextToFinancialReport").on('click', function (e) {
        var isMandatory = $("#IsMoviationalLetterMandatory").val();
        var isValidated = true;
        if (isMandatory) {
            var isValidated = validateMotivationalLetter(e);
        }
        if (isValidated) {
            var $btn = $("#financial-tab");
            $btn.prop("disabled", false);
            if ($btn.length) {
                $btn.trigger('click');
            }
        }
    });

    //=====================/Financial tab/=====================//

    $("#btnBackToMotivationalLetter").on('click', function () {
        var $btn = $("#motivational-tab");
        if ($btn.length) {
            $btn.trigger('click');
        }
    });

    $("#btnDone").on('click', function (e) {
        if ($("#IsViewOnly").val()) {
            var baseUrl = window.config.basePath;
            window.location.href = baseUrl + '/UCDP/Applications';
            return;
        }
        var result = validateFinancialReport(e);
        if (result) {
            var termsModalEl = document.getElementById('termsModal');
            var termsModal = new bootstrap.Modal(termsModalEl);
            e.preventDefault();
            termsModal.show();
        }
    });

    $("#btnDoneFA").on('click', function (e) {
        var baseUrl = window.config.basePath;
        window.location.href = baseUrl + '/Administration/Reports';
    });

    $("#termsProceed").on('click', function (e) {
        var formData = new FormData();
        formData.append("Username", $("#Username").val());
        formData.append("ApplicationId", $("#ApplicationId").val());
        formData.append("Id", $("#ReportId").val());
        formData.append("StepId", "8");
        var termsModalEl = document.getElementById('termsModal');
        var termsModal = new bootstrap.Modal(termsModalEl);
        termsModal.hide();
        saveReportProgress(e, formData, "");
    });

    $("#btnAddfinancialReport").on('click', function (e) {
        e.preventDefault();
        var input = document.getElementById('financialReportFile');
        var listElement = $("#financialReportFilesList li");
        var $btn = $(this);

        saveDocuments(e, input, $btn, 8, listElement, 7);
    });
}

//===============================================================/Modal Setup/===============================================================//
function initialiseRFIModal() {

    var btnReturn = document.getElementById('btnReturnForInformation');
    var modalEl = document.getElementById('addRetunForInfoCommentsModal');

    if (btnReturn && modalEl && window.bootstrap) {
        btnReturn.addEventListener('click', function (e) {
            // prevent default behaviour if button is inside a form/modal context
            e.preventDefault?.();
            var bs = new bootstrap.Modal(modalEl);
            bs.show();
        });
    }

    var submitBtn = document.getElementById('btnSubmitRetunForInfo');
    if (submitBtn && modalEl) {
        submitBtn.addEventListener('click', function () {
            var commentEl = document.getElementById('retunForInfoComments');
            var comment = commentEl ? commentEl.value.trim() : '';

            if (!comment) {
                if (window.toastr) {
                    toastr.warning('Please enter a reason for returning the report.');
                } else {
                    alert('Please enter a reason for returning the report.');
                }
                return;
            }

            // Dispatch event for existing JS to handle (keeps separation of concerns)
            var evt = new CustomEvent('ucdp:returnForInfo', { detail: { comment: comment, reportId: document.getElementById('ReportId')?.value } });
            window.dispatchEvent(evt);
        });
    }

    //event listener
    window.addEventListener('ucdp:returnForInfo', function (e) {
        var detail = e.detail || {};
        var comment = detail.comment || '';
        var reportId = detail.reportId || $('#ReportId').val();

        var formData = new FormData();
        formData.append("Comment", comment);
        formData.append("ProgressReportId", reportId);

        if (!comment) {
            if (window.toastr) {
                toastr.warning('Please enter a reason for returning the report.');
            } else {
                alert('Please enter a reason for returning the report.');
            }
            return;
        }

        var modalEl = document.getElementById('addRetunForInfoCommentsModal');
        var loadingShown = false;
        $('#loadingModal').modal('show').on('shown.bs.modal', function () { loadingShown = true; });

        returnReportForInformation(formData, modalEl, loadingShown);
    });
}

//===============================================================/Form validations/===============================================================//

function validateQualificationInProgress(e) {
    var validationResult = true;
    validationResult = validateControl($("#IsQualificationInPrgress"), $("#IsQualificationInPrgress").val(), "Qualification in progress is required", e) && validationResult;
    if (!validationResult) { return false; }
    else if (validationResult && ($("#IsQualificationInPrgress").val() && $("#IsQualificationInPrgress").val().toLocaleLowerCase() == "true")) {
        validationResult = validateControl($("#QualificationName"), $("#QualificationName").val(), "Qualification name is required", e) && validationResult;
        validationResult = validateControl($("#QualificationInPrgressFieldOfStudy"), $("#QualificationInPrgressFieldOfStudy").val(), "Field of study is required", e) && validationResult;
        validationResult = validateControl($("#QualificationInPrgressTitleofThesis"), $("#QualificationInPrgressTitleofThesis").val(), "Title of thesis is required", e) && validationResult;
        validationResult = validateControl($("#QualificationInPrgressInstitution"), $("#QualificationInPrgressInstitution").val(), "Institution is required", e) && validationResult;
        validationResult = validateControl($("#QualificationInPrgressGraduationYear"), $("#QualificationInPrgressGraduationYear").val(), "Graduation year is required", e) && validationResult;
        validationResult = validateFiles($("#proofFilesList li"), 1, "Please attach at least one Proof of Registration document before proceeding.", e) && validationResult;
        if (!validationResult) { return false; }
    }
    return true;
}

function validatQualificationGraduated(e) {
    var validationResult = true;
    validationResult = validateControl($("#IsQualificationGraduated"), $("#IsQualificationGraduated").val(), "Qualification graduated is required", e) && validationResult;
    if (!validationResult) { return false; }
    else if (validationResult && $("#IsQualificationGraduated").val().toLocaleLowerCase() == "true") {
        validationResult = validateControl($("#QualificationGraduatedName"), $("#QualificationGraduatedName").val(), "Qualification graduation name is required", e) && validationResult;
        validationResult = validateControl($("#QualificationGraduatedFieldOfStudy"), $("#QualificationGraduatedFieldOfStudy").val(), "Field of study is required", e) && validationResult;
        validationResult = validateControl($("#QualificationGraduatedTitleofThesis"), $("#QualificationGraduatedTitleofThesis").val(), "Title of thesis is required", e) && validationResult;
        validationResult = validateControl($("#QualificationGraduatedInstitution"), $("#QualificationGraduatedInstitution").val(), "Institution is required", e) && validationResult;
        validationResult = validateControl($("#QualificationGraduatedYear"), $("#QualificationGraduatedYear").val(), "Graduated year is required", e) && validationResult;
        validationResult = validateFiles($("#proofGradFilesList li"), 0, "Please attach at least one Proof of Graduation document before proceeding.", e) && validationResult;
        validationResult = validateFiles($("#supervisorGradFilesList li"), 0, "Please attach at least one Supervisor Progress Report document before proceeding.", e) && validationResult;
        if (!validationResult) { return false; }
    }
    return true;
}

function validateTeachRelief(e) {
    var validationResult = true;
    validationResult = validateControl($("#IsReliefAppointment"), $("#IsReliefAppointment").val(), "Teacher Relief Appointment is required", e) && validationResult;
    if (!validationResult) { return false; }
    else if (validationResult && $("#IsReliefAppointment").val().toLocaleLowerCase() == "true") {
        validationResult = validateFiles($("#teachingReliefProofFilesList li"), 3, "Please upload all three documents", e) && validationResult;
        if (!validationResult) { return false; }
    }
    return true;
}

function validateResearchPublication(e) {
    var validationResult = true;
    validationResult = validateControl($("#IsResearchPublication"), $("#IsResearchPublication").val(), "Research Publication is required", e) && validationResult;
    if (!validationResult) { return false; }
    else if (validationResult && $("#IsResearchPublication").val().toLocaleLowerCase() == "true") {
        validationResult = validateControl($("#ResearchAccreditedJournal"), $("#ResearchAccreditedJournal").val(), "Research accredited journal is required", e) && validationResult;
        validationResult = validateControl($("#ResearchAccreditedChapter"), $("#ResearchAccreditedChapter").val(), "Research accredited chapter is required", e) && validationResult;
        validationResult = validateControl($("#ResearchAccreditedBook"), $("#ResearchAccreditedBook").val(), "Research accredited book is required", e) && validationResult;
        validationResult = validateControl($("#ResearchAccreditedConference"), $("#ResearchAccreditedConference").val(), "Research accredited conference is required", e) && validationResult;
        if (!validationResult) { return false; }
    }
    return true;
}

function validateResearchProjects(e) {
    var validationResult = true;
    validationResult = validateControl($("#IsResearchProject"), $("#IsResearchProject").val(), "Research project is required", e) && validationResult;
    if (!validationResult) { return false; }
    else if (validationResult && $("#IsResearchProject").val().toLocaleLowerCase() == "true") {
        validationResult = validateControl($("#ResearchProjectSupport"), $("#ResearchProjectSupport").val(), "Research project support is required", e) && validationResult;
        validationResult = validateControl($("#Activities"), $("#Activities").val(), "Research project activities are required", e) && validationResult;
        validationResult = validateControl($("#Outputs"), $("#Outputs").val(), "Research project outputs are required", e) && validationResult;
        validationResult = validateControl($("#Outcome"), $("#Outcome").val(), "Research project outcome is required", e) && validationResult;
        validationResult = validateFiles($("#researchProjectFilesList li"), 1, "Please attach at least one Source of Evidence document before proceeding.", e) && validationResult;
        if (!validationResult) { return false; }
    }
    return true;
}

function validateCollaborativeProjects(e) {
    var validationResult = true;
    validationResult = validateControl($("#IsCollaborativeProject"), $("#IsCollaborativeProject").val(), "Collaborative project is required", e) && validationResult;
    if (!validationResult) { return false; }
    else if (validationResult && $("#IsCollaborativeProject").val().toLocaleLowerCase() == "true") {
        validationResult = validateControl($("#CollaborativeProjectSupported"), $("#CollaborativeProjectSupported").val(), "Research project support is required", e) && validationResult;
        validationResult = validateControl($("#CollaborativeActivities"), $("#CollaborativeActivities").val(), "Collaborative project activities are required", e) && validationResult;
        validationResult = validateControl($("#CollaborativeOutputs"), $("#CollaborativeOutputs").val(), "Collaborative project outputs are required", e) && validationResult;
        validationResult = validateControl($("#CollaborativeOutcome"), $("#CollaborativeOutcome").val(), "Collaborative project outcome is required", e) && validationResult;
        validationResult = validateFiles($("#collaborativeProjectFilesList li"), 1, "Please attach at least one Source of Evidence document before proceeding.", e) && validationResult;
        if (!validationResult) { return false; }
    }
    return true;
}

function validateFinancialReport(e) {
    var validationResult = true;
    validationResult = validateFiles($("#financialReportFilesList li"), 1, "Please upload at least 1 financial document", e) && validationResult;
    if (!validationResult) { return false; }
    return true;
}


function validateMotivationalLetter(e) {
    var validationResult = true;
    validationResult = validateFiles($("#motivationalLetterFilesList li"), 1, "Please upload a motivational letter document", e) && validationResult;
    if (!validationResult) { return false; }
    return true;
}



//===============================================================/API Calls/===============================================================//
function updateProgressReport() {
    if ($("#IsViewOnly").val()) {
        var $btn = $("#qualification-tab");
        $btn.prop("disabled", false);
        if ($btn.length) {
            $btn.trigger('click');
        }
        return;
    };
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });
    var formData = new FormData();
    formData.append("Username", $("#Username").val());
    formData.append("ApplicationId", $("#ApplicationId").val());
    $.ajax({
        url: "/Administration/ProgressReportDetails",
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideModal(modalShown);
            if (data.status === "Saved") {
                var applicationId = data.message.id;
                $("#Id").val(applicationId);
                toastr.success("Progress Report Details Saved Successfully", 'Success Message');
                var $btn = $("#qualification-tab");
                $btn.prop("disabled", false);
                if ($btn.length) {
                    $btn.trigger('click');
                }
            }
            else {
                e.preventDefault();
                toastr.error("Error Occured while Saving Progress Report Details", 'Error Message');
            }
        },
    });
}

function saveReportProgress(e, formData, nextTab, isQualificationInProgress = false) {
    if ($("#IsViewOnly").val()) {
        navigate(isQualificationInProgress, nextTab);
        return;
    };
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });
    $.ajax({
        url: "/Administration/UpdateProgressDetails",
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideModal(modalShown);
            if (data.status === "Saved") {
                var applicationId = data.message.id;
                $("#ReportId").val(applicationId);
                toastr.success("Progress Report Details Saved Successfully", 'Success Message');
                navigate(isQualificationInProgress, nextTab);
            }
            else {
                hideModal(modalShown);
                e.preventDefault();
                toastr.error("Error Occured while Saving Progress Report Details", 'Error Message');
                if (isQualificationInProgress) {
                    document.getElementById("inProgressSection").style.display = "";
                    document.getElementById("graduatedSection").style.display = "none";
                    const prevRadio = document.querySelector('input[name="IsQualificationInProgressMode"][value="' + "true" + '"]');
                    prevRadio.checked = true;
                }
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            hideModal(modalShown);
            toastr.error("Error Occured while Saving Progress Report Details", 'Error Message');
            if (isQualificationInProgress) {
                document.getElementById("inProgressSection").style.display = "";
                document.getElementById("graduatedSection").style.display = "none";
                const prevRadio = document.querySelector('input[name="IsQualificationInProgressMode"][value="' + "true" + '"]');
                prevRadio.checked = true;
            }
        }
    });
}

function navigate(isQualificationInProgress, nextTab) {
    if (isQualificationInProgress) {
        document.getElementById("inProgressSection").style.display = "none";
        document.getElementById("graduatedSection").style.display = "";
    }
    else if (!isQualificationInProgress && $(nextTab).length > 0) {
        var $btn = $(nextTab);
        $btn.prop("disabled", false);
        if ($btn.length) {
            $btn.trigger('click');
        }
    } else {
        var baseUrl = window.config.basePath;
        var viewReportSource = $("#ViewReportSource").val();

        if (viewReportSource === 'ProgressReports') {
            window.location.href = baseUrl + '/Administration/Reports';
        }
        else {
            window.location.href = baseUrl + '/UCDP/Applications';
        }
    }
}

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

function saveDocuments(e, input, $btn, fileUploadType, listElement, documentCountLimit, isMotivationalLetter = false) {
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

    var formData = new FormData();
    for (var i = 0; i < input.files.length; i++) {
        var sizeLimitValid = validateFileSizeLimit(input.files[i]);
        var fileTypeValid = validateFileType(input.files[i]);
        var differentFile = validateFileAlreadyUploaded(input.files[i], listElement);
        if (!sizeLimitValid || !fileTypeValid || !differentFile) {
            return;
        }
        formData.append("files", input.files[i]);
    }
    if (!isMotivationalLetter) {
        formData.append("FileUploadType", fileUploadType);
        saveDocumentsAPICall(e, formData);
    } else {
        var applicationId = $("#ApplicationId").val();
        uploadMotivationalLetter(e, formData, applicationId);
    }
}

function saveDocumentsAPICall(e, formData) {
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });

    formData.append("Username", $("#Username").val());
    formData.append("ApplicationId", $("#ApplicationId").val());
    formData.append("Id", $("#ReportId").val());
    $.ajax({
        url: "/Administration/UploadProgressReportDocuments",
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideModal(modalShown);
            if (data.status === "Saved") {
                var applicationId = data.message.id;
                $("#ReportId").val(applicationId);
                toastr.success("Documents saved Successfully", 'Success Message');
                var docs = data.message && (data.message.applicationDocuments || data.message.ApplicationDocuments) || [];
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
function uploadMotivationalLetter(e, formData, applicationId) {

    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });

    $.ajax({
        url: "/Applications/UploadMotivationLetterByApplicationId?applicationId=" + applicationId,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideModal(modalShown);
            if (data.Id > 0) {
                toastr.success("Progress Report Details Saved Successfully", 'Success Message');
                renderUploadedMotivationalDocument(data);
            }
            else {
                e.preventDefault();
                toastr.error("Error Occured while Saving Progress Report Details", 'Error Message');
            }
        },
    });
}

function deleteDocument(docId, $btn) {
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });
    $.ajax({
        url: '/Administration/DeleteDocument',
        type: 'GET',
        data: { documentId: docId },
        success: function (data) {
            hideModal(modalShown);
            // ActionResult returns Json { status = "true", message = "" } in controller.
            var ok = data === true || data.status === true || data.status === "true" || data.status === "ok";
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

function deleteMotivationalLetter(docId, $btn) {
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });
    $.ajax({
        url: '/Applications/DeleteMotivationLetter',
        type: 'POST',
        data: { documentId: docId },
        success: function (data) {
            hideModal(modalShown);
            var ok = data === true || data === "true" || data.status === true || data.status === "true" || data.status === "ok";
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

function returnReportForInformation(formData, modalEl) {
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });
    $.ajax({
        url: '/Administration/ReturnReportForInformation',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideModal(modalShown);

            // Accept multiple possible success shapes
            var ok = data.message === true
                || data === "true";

            if (ok) {
                // clear comment and close modal
                $('#retunForInfoComments').val('');
                var bsInstance = bootstrap.Modal.getInstance(modalEl);
                if (bsInstance) { bsInstance.hide(); }

                if (window.toastr) toastr.success('Report returned for information', 'Success Message');
                else alert('Report returned for information');

                var baseUrl = window.config.basePath;
                window.location.href = baseUrl + '/Administration/Reports';

            } else {
                var msg = (data && data.message) ? data.message : 'Error returning report';
                if (window.toastr) toastr.error(msg, 'Error Message');
                else alert(msg);
            }
        },
        error: function () {
            hideModal(modalShown);

            if (window.toastr) toastr.error('Error returning report', 'Error Message');
            else alert('Error returning report');
        }
    });
}

function finaliseProgressReport(formData) {
    var modalShown = false;
    $('#loadingModal').modal('show').on('shown.bs.modal', function () {
        modalShown = true;
    });
    $.ajax({
        url: '/Administration/FinalizeProgressReport',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            hideModal(modalShown);

            // Accept multiple possible success shapes
            var ok = data.message === true
                || data === "true";

            if (ok) {

                if (window.toastr) toastr.success('Report finalised successfully', 'Success Message');
                else alert('Report finalised successfully');

                var baseUrl = window.config.basePath;
                window.location.href = baseUrl + '/Administration/Reports';

            } else {
                var msg = (data && data.message) ? data.message : 'Error finalising report';
                if (window.toastr) toastr.error(msg, 'Error Message');
                else alert(msg);
            }
        },
        error: function () {
            hideModal(modalShown);

            if (window.toastr) toastr.error('Error finalising report', 'Error Message');
            else alert('Error finalising report');
        }
    });
}

//===============================================================/Helper functions/===============================================================//
function validateControl(control, value, errorMessage, e) {
    if (value === "") {
        toastr.error(errorMessage, 'Error Message');
        control.focus();
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    } else {
        return true;
    }
}

function validateFiles(listElement, length, errorMessage, e) {
    //return true; //to be removed when file functionality is impemented. 
    // Check existing uploaded documents list (server-rendered)
    var listFileCount = 0;
    listElement.each(function () {
        var txt = $(this).text().trim();
        if (txt && !/No documents attached/i.test(txt)) {
            listFileCount++;
        }
    });
    if (listFileCount < length) {
        toastr.error(errorMessage, 'Error Message');
        e.preventDefault();
        return false;
    }
    return true;
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
            '#proofFilesList li, #supervisorFilesList li, #proofGradFilesList li, #supervisorGradFilesList li, ' +
            '#teachingReliefProofFilesList li, #researchProjectFilesList li, #collaborativeProjectFilesList li, #financialReportFilesList li'
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

// Helper: append uploaded documents to appropriate list(s) without refresh
function renderUploadedDocuments(docs) {
    if (!docs || docs.length === 0) return;
    docs.forEach(function (doc) {
        try {
            var uploadType = (doc.uploadType || "").toString().trim().toLowerCase();
            var filename = doc.filename || doc.fileName || "Document.pdf";
            var documentId = doc.documentId || doc.documentId || doc.DocumentId;

            var baseUrl = window.config.basePath;
            var docUrl = baseUrl + '/Administration/ViewDocument?documentId=' + encodeURIComponent(documentId);

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

            if (uploadType.indexOf('proof of reg') !== -1 || uploadType.indexOf('proof of registration') !== -1) {
                appendToList('#proofFilesList');
            } else if (uploadType.indexOf('supervisor progress report') !== -1) {
                appendToList('#supervisorFilesList');
            } else if (uploadType.indexOf('proof of graduation') !== -1) {
                appendToList('#proofGradFilesList');
            } else if (uploadType.indexOf('supervisor graduation') !== -1 || uploadType.indexOf('supervisor graduation letter') !== -1) {
                appendToList('#supervisorGradFilesList');
            } else if (uploadType.indexOf('proof of appointment') !== -1) {
                appendToList('#teachingReliefProofFilesList');
            } else if (uploadType === 'source of evidence') {
                appendToList('#researchProjectFilesList');
            } else if (uploadType === 'collaborative source of evidence') {
                appendToList('#collaborativeProjectFilesList');
            } else if (uploadType.indexOf('financial report') !== -1) {
                appendToList('#financialReportFilesList');
            } else {
                // fallback
                appendToList('#proofFilesList');
            }
        } catch (ex) {
            console.error('renderUploadedDocuments error', ex, doc);
        }
    });
}
function renderUploadedMotivationalDocument(doc) {
    if (!doc || doc === undefined || doc === null) return;
    try {
        var filename = doc.Filename || doc.FileName;
        var documentId = doc.documentId || doc.documentId || doc.Id;

        var baseUrl = window.config.basePath;
        var docUrl = baseUrl + '/Applications/ViewMotivationLetterById?documentId=' + encodeURIComponent(documentId);

        // Build list item
        var $li = $('<li class="py-2 border-bottom d-flex justify-content-between align-items-center"></li>');
        $li.append($('<span></span>').text(filename));

        var $actions = $('<span></span>');
        var $viewBtn = $('<button type="button" class="btn btn-outline-primary btn-sm view-file"></button>')
            .attr('data-document-id', doc.UserId)
            .attr('data-filename', filename)
            .attr('data-docurl', docUrl)
            .html('<i class="bi bi-eye"></i> View');

        var $deleteBtn = $('<button type="button" class="btn btn-link p-0 text-danger delete-file"></button>')
            .attr('data-document-id', documentId)
            .attr('data-filename', filename)
            .attr('data-ismotivationalletter', true)
            .html('<i class="bi bi-trash"></i> Delete');

        $actions.append($viewBtn).append(' ').append($deleteBtn);
        $li.append($actions);

        // Remove placeholder "No documents attached." if present and append to correct list
        var $list = $("#motivationalLetterFilesList");
        $list.find('li').filter(function () {
            return $(this).text().trim().match(/No documents attached/i);
        }).remove();
        $list.append($li);


    } catch (ex) {
        console.error('renderUploadedDocuments error', ex, doc);
    }
}
