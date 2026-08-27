$(function () {
    initialiseDocumentUploads();
    initialiseDocumentActions();
});

function appUrl(path) {
    const basePath = (window.config && window.config.basePath) ? window.config.basePath : "";
    const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
    const cleanPath = String(path || "").replace(/^\/+/, "");
    return cleanBase + "/" + cleanPath;
}
function initialiseDocumentUploads() {
    $(document)
        .off("click.uploadDocs", ".ucdp-upload-btn")
        .on("click.uploadDocs", ".ucdp-upload-btn", function () {
            const $btn = $(this);
            const uploadUrl = $btn.data("upload-url");
            const inputId = $btn.data("input-id");
            const tableId = $btn.data("table-id");
            const maxFiles = parseInt($btn.data("max-files")) || 1;
            const uploadType = $btn.data("upload-type");
            const maxFileSizeBytes = 5 * 1024 * 1024; // 5MB

            const input = document.getElementById(inputId);
            if (!input) {
                toastr.error("Document input not found.", "Error Message");
                return;
            }

            if (!input.files || input.files.length === 0) {
                toastr.error("Please choose a PDF file first.", "Error Message");
                return;
            }

            if (uploadType === "Motivation Letter") {
                uploadMotivationLetter($(this));
                return;
            }
            const $tbody = $("#" + tableId + " tbody");
            const existingCount = $tbody.find("tr[data-existing='true']").length;
            const selectedFiles = Array.from(input.files);

            if (existingCount + selectedFiles.length > maxFiles) {
                toastr.error(`You can upload a maximum of ${maxFiles} file(s).`, "Error Message");
                return;
            }

            const formData = new FormData();
            let validFileCount = 0;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const lowerName = (file.name || "").toLowerCase();

                if (!lowerName.endsWith(".pdf")) {
                    toastr.error(`${file.name} is not a PDF file.`, "Error Message");
                    continue;
                }

                if (file.size > maxFileSizeBytes) {
                    toastr.error(`${file.name} exceeds the 5MB file size limit.`, "Error Message");
                    continue;
                }

                const alreadyExistsOnTable = $tbody
                    .find("tr[data-existing='true'] td:first-child")
                    .toArray()
                    .some(td => $(td).text().trim() === file.name);

                if (alreadyExistsOnTable) {
                    toastr.error(`${file.name} is already added.`, "Warning");
                    continue;
                }

                formData.append(input.name, file);
                validFileCount++;
            }

            appendSharedHiddenFields(formData);
            for (const pair of formData.entries()) {
                
            }

            if (validFileCount === 0) {
                input.value = "";
                return;
            }

            if (validFileCount === 0) {
                input.value = "";
                return;
            }

            $tbody.append(`
                <tr class="uploading-row">
                    <td colspan="2" class="text-center">
                        <i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>
                    </td>
                </tr>
            `);

            $btn.prop("disabled", true);

            $.ajax({
                url: uploadUrl,
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (result) {
                    $tbody.find(".uploading-row").remove();
                    $btn.prop("disabled", false);
                    input.value = "";

                    renderDocumentsForTable(tableId, result, uploadType);
                    toastr.success("Document uploaded successfully.", "Success Message");
                },
                error: function (xhr) {
                    $tbody.find(".uploading-row").remove();
                    $btn.prop("disabled", false);
                    input.value = "";

                    toastr.error(xhr?.responseText || "There was an error uploading the document.", "Error Message");
                }
            });
        });
}

function initialiseDocumentActions() {
    $(document).on("click", ".btnOpen", function () {
        const url = $(this).val();
        const fileName = $(this).closest("tr").find("td:first").text();

        openPdfInModal(url, fileName);
    });

    $(document)
        .off("click.deleteDoc", ".btnDeleteDocument")
        .on("click.deleteDoc", ".btnDeleteDocument", function () {
            const $btn = $(this);
            const documentId = $btn.data("document-id");
            const tableId = $btn.data("table-id");
            const uploadType = $btn.data("upload-type");

            if (!documentId) {
                toastr.error("Document id not found.", "Error Message");
                return;
            }

            $.ajax({
                url: "/Applications/DeleteDocument",
                type: "GET",
                data: { documentId: documentId },
                success: function () {
                    $btn.closest("tr").remove();
                    toastr.success("Document deleted successfully.", "Success Message");
                },
                error: function (xhr) {
                    toastr.error(xhr?.responseText || "There was an error deleting the document.", "Error Message");
                }
            });
        });

    $(document).on("click", ".btnDeleteMotivationLetter", function () {
        const id = $(this).data("id");
        const tableId = $(this).data("table-id");

        $.post("/Applications/DeleteMotivationLetter", { documentId: id }, function () {
            $("#" + tableId + " tbody").empty();
            toastr.success("Deleted successfully");
        });
    });

    $(document).on("click", ".btnViewDocument", function () {
        const documentId = $(this).data("id");
        const fileName = $(this).closest("tr").find("td:first").text().trim();
        const url = appUrl("Applications/ViewDocument?documentId=" + documentId);
        openPdfInModal(url, fileName);
    });
}

function renderDocumentsForTable(tableId, documents, uploadType) {
    const $table = $("#" + tableId);
    const $tbody = $table.find("tbody");

    if (!$tbody.length) {
        console.warn("Table body not found for tableId:", tableId);
        return;
    }

    const docsArray = Array.isArray(documents)
        ? documents
        : Array.isArray(documents?.documents)
            ? documents.documents
            : Array.isArray(documents?.Documents)
                ? documents.Documents
                : [];

    const filteredDocs = docsArray.filter(doc => {
        const docUploadType = (doc?.uploadType || doc?.UploadType || "").trim();
        return docUploadType.toLowerCase() === String(uploadType || "").trim().toLowerCase();
    });

    if (!filteredDocs.length) {
        return;
    }

    filteredDocs.forEach(doc => {
        const fileName = escapeHtml(doc?.filename || doc?.Filename || "");
        const docId = doc?.documentId || doc?.DocumentId || doc?.id || doc?.Id || "";

        if (!docId) return;

        const alreadyExists = $tbody.find("tr[data-existing='true']").toArray().some(row => {
            const existingId = $(row).find(".btnDeleteDocument").data("document-id");
            return String(existingId) === String(docId);
        });

        if (alreadyExists) return;

        $tbody.append(`
            <tr data-existing="true">
                <td>${fileName}</td>
                <td>
                    <button type="button"
                            class="btn btn-outline-primary btn-sm btnViewDocument"
                            data-id="${docId}">
                        <i class="bi bi-eye"></i> View
                    </button>

                    <button type="button"
                            class="btn btn-outline-danger btn-sm btnDeleteDocument"
                            data-document-id="${docId}"
                            data-table-id="${tableId}"
                            data-upload-type="${uploadType}">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `);
    });
}

function getTableBody(tableRef) {
    if (!tableRef) return $();

    if (typeof tableRef === "string") {
        return $("#" + tableRef + " tbody");
    }

    const $table = $(tableRef);
    return $table.is("table") ? $table.find("tbody") : $table.closest("table").find("tbody");
}
function loadMotivationLetter(tableRef) {
    const userId = $("#UserId").val();

    $.get("/Applications/GetMotivationLetterByUserId", { userId }, function (doc) {
        const $tbody = getTableBody(tableRef);
        $tbody.empty();

        if (!doc || !doc.Id) return;

        const tableId = typeof tableRef === "string" ? tableRef : $(tableRef).attr("id");

        const row = `
            <tr data-existing="true">
                <td>${doc.Filename}</td>
                <td>
                    <button type="button"
                            class="btn btn-outline-primary btn-sm btnViewMotivationLetter"
                            data-id="${doc.Id}">
                        <i class="bi bi-eye"></i> View
                    </button>
                    <button type="button"
                            class="btn btn-outline-danger btn-sm btnDeleteMotivationLetter"
                            data-id="${doc.Id}"
                            data-table-id="${tableId}">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;

        $tbody.append(row);
    });
}
function renderMotivationLetterRow(tableRef, doc) {
    const $tbody = getTableBody(tableRef);
    $tbody.empty();

    if (!doc || !doc.Id) return;

    const row = `
        <tr data-existing="true">
            <td>${doc.Filename}</td>
            <td>
                <button type="button"
                        class="btn btn-outline-primary btn-sm btnViewMotivationLetter"
                        data-id="${doc.Id}">
                    <i class="bi bi-eye"></i> View
                </button>
                <button type="button"
                        class="btn btn-outline-danger btn-sm btnDeleteMotivationLetter"
                        data-id="${doc.Id}"
                        data-table-id="${typeof tableRef === "string" ? tableRef : $(tableRef).attr("id")}">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        </tr>
    `;

    $tbody.append(row);
}
function uploadMotivationLetter($button) {
    const inputId = $button.data("input-id");
    const tableId = $button.data("table-id");
    const maxFileSizeBytes = 5 * 1024 * 1024;
    const input = document.getElementById(inputId);
    const fundingCallId = $("#FundingCallDetailsId").val();

    const $tbody = $("#" + tableId + " tbody");
    const existingCount = $tbody.find("tr[data-existing='true']").length;

    if (existingCount >= 1) {
        toastr.error("Only one motivation letter is allowed. Please delete the existing one first.", "Error Message");
        return;
    }

    if (!input || !input.files.length) {
        toastr.error("Please choose a PDF file first.", "Error Message");
        return;
    }

    const file = input.files[0];

    if (!file.name.toLowerCase().endsWith(".pdf")) {
        toastr.error(file.name + " is not a PDF file.", "Error Message");
        return;
    }

    if (file.size > maxFileSizeBytes) {
        toastr.error(file.name + " exceeds the 5MB file size limit.", "Error Message");
        return;
    }

    const formData = new FormData();
    formData.append(input.name, file);
    formData.append("fundingCallId", fundingCallId);

    $.ajax({
        url: "/Applications/UploadMotivationLetter",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (doc) {
            input.value = "";
            renderMotivationLetterRow(tableId, doc);
            toastr.success("Motivation letter uploaded.", "Success");
        },
        error: function (xhr) {
            toastr.error(xhr?.responseText || "There was an error uploading the motivation letter.", "Error Message");
        }
    });
}
$(document).on("click", ".btnViewDocument", function () {
    const documentId = $(this).data("id");
    const fileName = $(this).closest("tr").find("td:first").text().trim();
    const url = appUrl("Applications/ViewDocument?documentId=" + encodeURIComponent(documentId));

    openPdfInModal(url, fileName);
});

$(document).on("click", ".btnViewMotivationLetter", function () {
    const documentId = $(this).data("id");
    const fileName = $(this).closest("tr").find("td:first").text().trim();
    const url = appUrl("Applications/ViewMotivationLetterById?documentId=" + encodeURIComponent(documentId));

    openPdfInModal(url, fileName);
});
function escapeHtml(value) {
    return $("<div>").text(value ?? "").html();
}
function openPdfInModal(url, title = "Document Viewer") {
    if (!url) {
        toastr.error("Document not found.", "Error Message");
        return;
    }

    $("#pdfViewer").attr("src", url);
    $("#pdfModal .modal-title").text(title);
    $("#pdfModal").modal("show");
}