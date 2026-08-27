$(document).ready(function () {
    function base64ToBlob(base64, mime) {
        var byteCharacters = atob(base64);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mime });
    }

    function displayPDF(base64PDF) {
        var blob = base64ToBlob(base64PDF, 'application/pdf');
        var blobUrl = URL.createObjectURL(blob);
        $('#viewDocumentModal').data('view-only', true);
        $('#viewDocumentModal').modal('show');
        $('#documentViewer').attr('src', blobUrl +"#toolbar=0&navpanes=0&scrollbar=0");       
    }

    //$(document.body).on('click', '.btnViewOpenDoc', function () {
    //    var documentId = $(this).attr("documentId");

    //    $.ajax({
    //        type: "GET",
    //        url: "Applications/ViewDocument",
    //        contentType: "application/json; charset=utf-8",
    //        data: { "documentId": documentId },
    //        datatype: "json",
    //        success: function (document) {
    //            setTimeout(function () {
    //                displayPDF(document);
    //            }, 1000);
    //        },
    //        error: function () {
    //            toastr.error('Cannot display document.', 'Error Message');
    //        }
    //    });
    //});
    $(document.body).on('click', '.btnViewOpenDoc', function () {
        var documentId = $(this).attr("documentId");

        if (!documentId) {
            toastr.error('Cannot display document.', 'Error Message');
            return;
        }

        const rawBase = window.config?.basePath || "";
        const basePath = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

        const pdfUrl = `${basePath}/Applications/ViewDocument?documentId=${encodeURIComponent(documentId)}#toolbar=0&navpanes=0&scrollbar=0`;

        $('#documentViewer').attr('src', pdfUrl);
        $('#viewDocumentModal').modal('show');
    });

    $(document.body).on('click', '.btnViewOpenDocR', function () {
        var documentId = $(this).attr("documentId");

        $.ajax({
            type: "GET",
            url: "/Ucdp/MyApplications/ViewDocument",
            contentType: "application/json; charset=utf-8",
            data: { "documentId": documentId },
            datatype: "json",
            success: function (document) {
                setTimeout(function () {
                    displayPDF(document);
                }, 1000);
            },
            error: function () {
                toastr.error('Cannot display document.', 'Error Message');
            }
        });
    });

});