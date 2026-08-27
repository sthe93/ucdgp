$(document).ready(function () {
    var researchOutPut = new Object();
    $(document.body).on('click', '.btnOpen', function () {
       
        $("#btnVarifyDocuments").hide();

        var aa = document.getElementById("btnOpen").value;
        if ($('#GetViewId').val() === "")
            $('#GetViewId').val(this.value);

        var myString = this.value;
        var firstString = myString.substr(0, 1);
        var secondString = myString.substr(2, 50);

        researchOutPut.GuidID = secondString;
        researchOutPut.ViewId = firstString;

        $.ajax({
            url: "Oross/ViewResearchDoc",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(researchOutPut),
            success: function (response, textStatus, xhr) {

                if (textStatus === "success" && xhr.status === 200) {

                    if (response.status !== "Failed") {

                        $("#pdfViewerPrintDoc").replaceWith($("#pdfViewerPrintDoc").clone().attr("src", config.serverPath + 'Oross/GetDocument#toolbar=0&navpanes=0&scrollbar=0'));

                        $("#viewDocModal").modal("show");

                        return;
                    }
                    toastr.error(response.status, 'Error Message');

                } else {

                    toastr.error(response, 'Error Message');
                }
            }
        });
    });

    const btnClose = document.getElementById("btnClose_View");
    if (btnClose) {
        btnClose.addEventListener("click", function () {
            const basePath = window.config?.basePath || "/";
            const safeBase = basePath.endsWith("/") ? basePath : basePath + "/";

            const params = new URLSearchParams(window.location.search);
            const page = params.get("page") || 1;
            const pageSize = params.get("pageSize") || 10;

            window.location.href = `${safeBase}Oross/Index?page=${page}&pageSize=${pageSize}`;
        });
    }


    /////////// Group For Journal Article For On Click Event ////////////////
    $(document.body).on('click', '.btnOpen2', function () {
        $("#hdfileReuploadResearch").val("ReUploadDocViewCliked");
    });

    $('input[name^="fileReUpload"]').on('change', function () {
        debugger;
        var file1 = this.files[0];

        var docSize = this.files[0].size / 1024 / 1024; // in MB

        var docType = this.files[0].type;
        if (docSize > 20) {
            toastr.error("ERROR: Maximum file size 20MB", 'Error Message');
            $('input[name^="fileReUpload"]').val("");
            return;
        }

        if (docType != "application/pdf") {
            toastr.error("Only PDF documents allowed.", 'Error Message');
            $('input[name^="fileReUpload"]').val("");
            return;
        }

        $('.btnOpen2').attr("disabled", false);

        $('.btnOpen2').show();

        ////////// check if it has been clicked //////////
        $("#hdfileReuploadResearch").val("ReUploadDocViewCliked");

        toastr.error("Please click View to verify document to be re-uploaded.", "Alert Message");
        return;
    });

    $(document.body).on('click', '.btnReUpload_View', function () {
        debugger;

        if ($('#hdfileReuploadResearch').val() != "") {
            if ($('#hdfileReuploadResearch').val() != "ReUploadeDocHasBeenVerified") {
                toastr.error("Please verify your document.", 'Error Message');
                return;
            }
        }

        var rDocViewSubmit = new FormData();

        var documentId = $(this).val();
        if (documentId) {
            documentId = documentId.split(";")[0];
        } else {
            console.error("Value is null or empty");
            return;
        }

        var myString = this.value;
        var firstString = myString.substr(0, 1);
        var secondString = myString.substr(2, 50);

        rDocViewSubmit.append("GuidID", secondString);
        // Find the associated input element based on the documentId
        var inputElement = $("#fileReUpload_" + documentId)[0];

        if (inputElement) {
            // File Upload
            var totalFilesReupload = inputElement.files.length;
            console.log(totalFilesReupload);

            var doctpy = "";

            for (var i = 0; i < totalFilesReupload; i++) {
                var file = inputElement.files[i];
                if (file) {
                    doctpy = file.type;
                    rDocViewSubmit.append("ReuploadFile", file);
                } else {
                    console.error("File is null or undefined");
                    return;
                }
            }
        } else {
            console.error("Executed" + documentId);
            return;
        }

        $.ajax({
            url: "Oross/ReUploadDocument",
            type: "POST",
            data: rDocViewSubmit,
            contentType: false,
            processData: false,
            success: function (response, textStatus, xhr) {

                if (textStatus === "success" && xhr.status === 200) {
                    if (response !== "Failed to Save") {
                        toastr.success('Document Reuploaded', 'Success Message');
                        return;
                    }
                    toastr.error(response, 'Error Message');
                } else {
                    toastr.error(response, 'Error Message');
                }
            }
        });
        $('.btnOpen2').hide();
        $('.btnReUpload_View').hide();
    })

    ////////////////////////// TextArea View Function  /////////////////////////////
    $(document.body).on('click', '#btnRFA', function () {
        $('#viewDocModal_Comment').modal("show");

       // $(this).hide();
    })

    $("#btnConfirmRFA").on("click", function () {
        const $button = $(this);
        const comment = $("#comment").val().trim();

        if (!comment) {
            toastr.error(
                "You can't submit an empty comment. Please populate the field.",
                "Error Message"
            );
            return;
        }

        // Prevent double-click submissions
        if ($button.prop("disabled")) {
            return;
        }

        const formData = new FormData();

        formData.append("Comment", comment);
        formData.append("ResearchIdComment", $("#hdResearchId").val());
        formData.append("PublicationTitle", $("#hdPublicationTitle").val());
        formData.append("LastName", $("#hdLastName").val());
        formData.append("FirstName", $("#hdFirstName").val());

        $button
            .prop("disabled", true)
            .html('<i class="fa fa-spinner fa-spin"></i> Submitting...');

        $.ajax({
            url: "Oross/SaveRFAComment",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,

            success: function (response) {
                if (response === "Success") {
                    toastr.success("Comment submitted", "Success Message");

                    $("#comment").val("");
                    $("#viewDocModal_Comment").modal("hide");

                    // Reload the submitted research data
                    setTimeout(function () {
                        window.location.reload();
                    }, 500);

                    return;
                }

                toastr.error(
                    response || "Failed to save comment.",
                    "Error Message"
                );

                resetCommentButton();
            },

            error: function (xhr) {
                const message =
                    xhr.responseText ||
                    "Failed to save comment.";

                toastr.error(message, "Error Message");
                resetCommentButton();
            }
        });

        function resetCommentButton() {
            $button
                .prop("disabled", false)
                .html("Submit");
        }
    });

    $(document.body).on('click', '#btnCloseViewRFA', function () {
        $('#viewDocModal_Comment').modal("hide");
    })

    function StylingAlert() {
        toastr.success("MESSAGE: You have verified your document.", 'Verification Alert').css("background-color", "green").css("color", "white");
    }

    $(document.body).on('click', '#btnVarifyDocument', function () {
        debugger;
        if ($('#hdfileReuploadResearch').val() != "") {
            if ($('#hdfileReuploadResearch').val() == "ReUploadDocSetForVerification") {
                $('#hdfileReuploadResearch').val("ReUploadeDocHasBeenVerified");

                StylingAlert()
            }
        }

        $(".btnReUpload_View").show();

        StylingAlert();

        var researchOutPut = new Object();

        var documentId = $(this).val().split(";")[0];

        // Find the associated input element based on the documentId
        var inputElement = $("#fileReUpload_" + documentId)[0];

        if (inputElement) {
            // File Upload
            var totalFilesReupload = inputElement.files.length;
            console.log(totalFilesReupload);

            var doctpy = "";

            for (var i = 0; i < totalFilesReupload; i++) {
                var file = inputElement.files[i];
                doctpy = file.type;
                researchOutPut.append("ViewFile", file);
            }
        } else {
            console.error("Input element not found for document ID: " + documentId);
            return;
        }

        $.ajax({
            url: "Oross/ReUploadDocument",
            type: "POST",
            data: researchOutPut,
            success: function (response, textStatus, xhr) {

                if (textStatus === "success" && xhr.status === 200) {
                    if (response !== "Failed to Save") {

                        toastr.success('Document Reuploaded', 'Success Message');

                        return;
                    }
                    toastr.error(response, 'Error Message');

                } else {

                    toastr.error(response, 'Error Message');
                }
            }
        });
    })

    $(document.body).on('click', '.btnOpen2', function () {

        debugger;
        var rDocView = new FormData();

        // Extract the document ID from the clicked button's 'value' attribute
        var documentId = $(this).val().split(";")[0];

        // Find the associated input element based on the documentId
        var inputElement = $("#fileReUpload_" + documentId)[0];

        if (inputElement) {
            // File Upload
            var totalFilesReupload = inputElement.files.length;
            console.log(totalFilesReupload);

            var doctpy = "";

            for (var i = 0; i < totalFilesReupload; i++) {
                var file = inputElement.files[i];
                doctpy = file.type;
                rDocView.append("ViewFile", file);
            }
        } else {
            console.error("Input element not found for document ID: " + documentId);
            return;
        }

        $.ajax({
            type: "POST",
            url: "Oross/UploadResearchDocView",
            data: rDocView,
            contentType: false,
            processData: false,
            success: function (response, textStatus, xhr) {
                if (textStatus === "success" && xhr.status === 200) {
                    ////// Set For Verifying Doc //////
                    $("#hdfileReuploadResearch").val("ReUploadDocSetForVerification");
                    if (response.status !== "Failed") {
                        if (doctpy == "application/pdf") {
                            $("#pdfViewerPrintDoc_UploadResearch").replaceWith($("#pdfViewerPrintDoc_UploadResearch").clone().attr('src', config.serverPath + 'Oross/GetDocView#toolbar=0&navpanes=0&scrollbar=0'));
                            $("#viewDocModal_UploadResearch").modal("show");
                        }
                        else {
                            window.location.href = config.serverPath + "Oross/GetDocView";
                        }
                        return true;
                    }
                    toastr.error(response.status, 'Error Message');
                } else {
                    toastr.error(response, 'Error Message');
                }
            }
        });
    });

    $(document.body).on('click', '#btnCloseViewDocument', function () {
        $("#viewDocModal_UploadResearch").modal("hide");
    });

    ////// Submission of the amendment form ///////////
    $(document.body).on('click', '#btnSubmitRFA', function () {

      

        var EditResearchDoc = new FormData;

        if ($('#txtEditDepartmentName').val() === "") { toastr.error("Department name is required.", 'Error Message'); return false; }
        if ($('#txtEditPublicationTitle').val() === "") { toastr.error("Publication title is required.", 'Error Message'); return false; }
        if ($('#txtEditNameOfPublicationFunder').val() === "") { toastr.error("Name of public funder is required.", 'Error Message'); return false; }
        if ($('#txtEditConferenceName').val() === "") { toastr.error("Conference Name is required.", 'Error Message'); return false; }

        var _PublicationYear = $('#txtEditPublicationYear').val();
        if (_PublicationYear === "Select")
        {
            toastr.error("Publication year invalid selection.", "Error Message")
            return;
        }

        var _SoLTPublication = $('#txtEditSoTLPublication').val();
        if (_SoLTPublication === "Select")
        {
            toastr.error("SoTL Publication invalid selection.", "Error Message");
            return;
        }

        var _Faculty = $('#txtEditFaculty').val();
        if (_Faculty === "Select")
        {
            toastr.error("Faculty invalid selection.", "Error Message");
            return;
        }

        var _a4IRPublication = $("#txtEdita4IRPublication").val();
        if (_a4IRPublication === "Select")
        {
            toastr.error("4IR Publication invalid selection.", "Error Message");
            return;
        }

        var _SDG = $("#txtEditSDG").val();
        if (_SDG === "Select")
        {
            toastr.error("SDG invalid selection.", "Error Message");
            return;
        }

        EditResearchDoc.append('PublicationYear', $('#txtEditPublicationYear').val())
        EditResearchDoc.append('PublicationTitle', $('#txtEditPublicationTitle').val())
        EditResearchDoc.append('Faculty', $('#txtEditFaculty').val())
        EditResearchDoc.append('SDG', $('#txtEditSDG').val())
        EditResearchDoc.append('DepartmentName', $('#txtEditDepartmentName').val())
        EditResearchDoc.append('ISSN', $('#txtEditISSN').val())
        EditResearchDoc.append('AnyAdditionalURL', $('#txtEditAnyAdditionalURL').val())
        EditResearchDoc.append('NameOfPublicFunder', $('#txtEditNameOfPublicationFunder').val())
        EditResearchDoc.append('a4IRPublication', $('#txtEdita4IRPublication').val())
        EditResearchDoc.append('SoTLPublication', $('#txtEditSoTLPublication').val())
        EditResearchDoc.append('ResearchId', $('#hdResearchId').val())
        EditResearchDoc.append('ConferenceName', $('#txtEditConferenceName').val())


        $.ajax({
        type: "POST",
            url:"Oross/UpdateAmendedmentResearch",
        data: EditResearchDoc,
        contentType: false,
        processData: false,
        success: function (response, textStatus, xhr) {
            if (textStatus === "success" && xhr.status === 200) {
                if (response !== "Failed to Save") {
                    toastr.success("Publication submitted successfully.", 'Success Message');
                    return;
                }
                toastr.error(response, 'Error Message');
            } else {
                toastr.error(response, 'Error Message');
            }
        }
        });
    })
});

