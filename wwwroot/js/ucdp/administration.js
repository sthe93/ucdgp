$(document).ready(function () {
    var baseUrl = window.config.basePath;
    // File upload handler
    $('#tariffUploadForm').on('submit', function (e) {
        e.preventDefault();
        $('#tariffUploadError').text('');

        var fileInput = $('#tariffPlanFile')[0];
        if (fileInput.files.length === 0) {
            $('#tariffUploadError').text('No file selected.');
            toastr.error("Tarrif plan file required.");
            return;
        }

        var file = fileInput.files[0];

        if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
            $('#tariffUploadError').text('Only PDF files are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            $('#tariffUploadError').text('File exceeds 5 MB.');
            return;
        }

        $('#loadingModal').modal('show');

        var formData = new FormData();
        formData.append('tariffPlanFile', file);

        $.ajax({
            url: baseUrl + '/Administration/UploadTariffPlan',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (result) {
                if (result.status === 'ok') {
                    $('#loadingModal').modal('hide');
                    toastr.success("Tariff plan successfully uploaded.");
                    setTimeOut(() => {
                        loadTariffPlan();
                        $('#tariffPlanFile').val('');
                    }, 1000);  
                } else {
                    $('#tariffUploadError').text(result.message || 'Upload failed.');
                }
            },
            error: function (xhr) {
                $('#loadingModal').modal('hide');
                $('#tariffUploadError').text('Upload failed. Please try again.');
            }
        });
    });

    // Load the current document
    function loadTariffPlan() {
        $.ajax({
            url: baseUrl + '/Administration/Tariffs',
            type: 'GET',
            success: function (result) {
                if (result) {
                    location.reload();
                }
            }
        });
    }

    // Handle View button click to show PDF in modal
    $(document).on('click', '.view-tariff-btn', function () {
        var fileUrl = $(this).data('docurl');
        $('#tariffPlanViewer').attr('src', fileUrl);
        $('#tariffPlanModal').modal('show');
    });

    function fetchPendingReports(callback) {
        $.ajax({
            url: '/Administration/GetPendingReports',
            type: 'GET',
            success: function (reports) {
                window.pendingReports = reports;
                if (typeof callback === 'function') {
                    callback(reports);
                }
            },
            error: function () {
                toastr.error("Could not fetch latest pending reports. Please try again.");
                if (typeof callback === 'function') {
                    callback([]);
                }
            }
        });
    }

    // Initialize DataTable
    const chkReq = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    $('#pendingReportTable').DataTable({
        ajax: function (data, callback, settings) {
            fetchPendingReports(function (reports) {
                callback({ data: reports });
                console.log("First row keys:", Object.keys(reports[0] || {}));
                console.log(reports);
            });
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + 1; // 0-based index → +1 for display
                }
            },
            { data: 'referenceNumber' },
            { data: 'fundingCalls.fundingCallName' },
            {
                data: null,
                render: function (data, type, row) {
                    return 'R' + chkReq.format(row.dhetFundsRequested);
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return (row.applicant?.firstName ?? '') + ' ' + (row.applicant?.surname ?? '');
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return (new Date(row.applicationEndDate)).toLocaleDateString('en-GB');
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return 'R' + chkReq.format(row.approvedAmount);
                }
            },
            { data: 'applicationStatus.status' },
        ],
        paging: true,
        searching: false,
        info: false,
        lengthChange: false
    });

    // Search input and table elements
    const searchInput = document.getElementById('pendingReportSearch');
    const tbodySelector = '#pendingReportTable tbody';

    function getTbody() {
        return document.querySelector(tbodySelector);
    }

    // Build a searchable string for a row using specific column indexes:
    // 1 = Reference Number, 2 = Funding Call Name, 4 = Submitted By, 7 = Application Status
    function rowSearchText(row) {
        if (!row) return '';
        const cells = row.querySelectorAll('td');
        const indices = [1, 2, 4, 7];
        const parts = [];
        indices.forEach(i => {
            if (cells[i]) parts.push(cells[i].textContent.trim());
        });
        return parts.join(' ').toLowerCase();
    }

    function applyFilter() {
        const q = (searchInput.value || '').trim().toLowerCase();
        const tbody = getTbody();
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach(row => {
            // skip rows that are not data rows
            const text = rowSearchText(row);
            if (!q) {
                row.style.display = '';
                return;
            }
            row.style.display = text.indexOf(q) !== -1 ? '' : 'none';
        });
    }

    // Debounce input to avoid excessive work while typing
    let debounceTimer = null;
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(applyFilter, 250);
        });
    }

    // Observe tbody mutations so filter reapplies after administration.js loads or refreshes rows
    const observer = new MutationObserver(function () {
        applyFilter();
    });
    function ensureObserver() {
        const tbody = getTbody();
        if (tbody) {
            observer.observe(tbody, { childList: true, subtree: true, characterData: true });
        }
    }

    // Try to attach observer immediately and also on DOMContentLoaded
    ensureObserver();
    document.addEventListener('DOMContentLoaded', function () {
        ensureObserver();
        applyFilter();
    });

    // Expose applyFilter in case other scripts want to trigger it after table updates
    window.__applyPendingReportFilter = applyFilter;


    function fetchReports(functionToCall, callback) {
        $.ajax({
            url: '/Administration/' + functionToCall,
            type: 'GET',
            success: function (reports) {
                window.rfiReports = reports;
                if (typeof callback === 'function') {
                    callback(reports);
                }
            },
            error: function () {
                toastr.error("Could not fetch RFI reports. Please try again.");
                if (typeof callback === 'function') {
                    callback([]);
                }
            }
        });
    }

    // Initialize DataTable for RFI reports
    $('#reportRfiTable').DataTable({
        ajax: function (data, callback, settings) {
            fetchReports('GetRFIProgressReport', function (reports) {
                console.log(reports);
                callback({ data: reports });
                console.log("RFI reports loaded:", reports);
            });
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                }
            },
            { data: 'referenceNumber' },
            {
                data: null,
                render: function (data, type, row) {
                    var parts = [];
                    if (row.title) parts.push(row.title);
                    if (row.firstName) parts.push(row.firstName);
                    if (row.surname) parts.push(row.surname);
                    return parts.join(' ');
                }
            },
            { data: 'applicantCategory' },
            {
                data: null,
                render: function (data, type, row) {
                    // ApprovedAmount may be string; try to format numeric values gracefully
                    var val = row.approvedAmount;
                    if (!val) return '';
                    var num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
                    if (isNaN(num)) return 'R' + val;
                    return 'R' + chkReq.format(num);
                }
            },
            { data: 'status' },
            {
                data: null,
                render: function (data, type, row) {
                    if (!row.createdDate) return '';
                    return (new Date(row.createdDate)).toLocaleDateString('en-GB');
                }
            },
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    // Follow Project/Index button styles: small primary buttons
                    return '<button type="button" class="btn btn-primary btn-sm me-1 view-rfi-report" data-id="' + data.applicationId + '" data-callId="' + data.fundingCallId + '"  title="View Report"><i class="bi bi-eye"></i> View</button>'
                        + '<button type="button" class="btn btn-secondary btn-sm view-rfi-comments" data-id="' + row.id + '" title="View Comments"><i class="bi bi-chat-left-text"></i> Comments</button>';
                }
            }
        ],
        paging: true,
        searching: false,
        info: false,
        lengthChange: false
    });

    // Initialize DataTable for Submitted reports
    $('#submittedReportTable').DataTable({
        ajax: function (data, callback, settings) {
            fetchReports('GetSubmittedProgressReport', function (reports) {
                console.log(reports);
                callback({ data: reports });
                console.log("Submitted reports loaded:", reports);
            });
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                }
            },
            { data: 'referenceNumber' },
            {
                data: null,
                render: function (data, type, row) {
                    var parts = [];
                    if (row.title) parts.push(row.title);
                    if (row.firstName) parts.push(row.firstName);
                    if (row.surname) parts.push(row.surname);
                    return parts.join(' ');
                }
            },
            { data: 'applicantCategory' },
            {
                data: null,
                render: function (data, type, row) {
                    // ApprovedAmount may be string; try to format numeric values gracefully
                    var val = row.approvedAmount;
                    if (!val) return '';
                    var num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
                    if (isNaN(num)) return 'R' + val;
                    return 'R' + chkReq.format(num);
                }
            },
            { data: 'status' },
            {
                data: null,
                render: function (data, type, row) {
                    if (!row.createdDate) return '';
                    return (new Date(row.createdDate)).toLocaleDateString('en-GB');
                }
            },
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    return '<button type="button" class="btn btn-primary btn-sm me-1 view-rfi-report" data-id="' + data.applicationId + '" data-callId="' + data.fundingCallId + '" title="View Report"><i class="bi bi-eye"></i> View</button>';
                }
            }
        ],
        paging: true,
        searching: false,
        info: false,
        lengthChange: false
    });

    $('#finalizedReportTable').DataTable({
        ajax: function (data, callback, settings) {
            fetchReports('GetFinalizedReport', function (reports) {
                console.log(reports);
                callback({ data: reports });
                console.log("Submitted reports loaded:", reports);
            });
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                }
            },
            { data: 'referenceNumber' },
            {
                data: null,
                render: function (data, type, row) {
                    var parts = [];
                    if (row.title) parts.push(row.title);
                    if (row.firstName) parts.push(row.firstName);
                    if (row.surname) parts.push(row.surname);
                    return parts.join(' ');
                }
            },
            { data: 'applicantCategory' },
            {
                data: null,
                render: function (data, type, row) {
                    // ApprovedAmount may be string; try to format numeric values gracefully
                    var val = row.approvedAmount;
                    if (!val) return '';
                    var num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
                    if (isNaN(num)) return 'R' + val;
                    return 'R' + chkReq.format(num);
                }
            },
            { data: 'status' },
            {
                data: null,
                render: function (data, type, row) {
                    if (!row.createdDate) return '';
                    return (new Date(row.createdDate)).toLocaleDateString('en-GB');
                }
            },
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    return '<button type="button" class="btn btn-primary btn-sm me-1 view-rfi-report" data-id="' + data.applicationId + '" data-callId="' + data.fundingCallId + '" title="View Report"><i class="bi bi-eye"></i> View</button>'
                        + '<button type="button" class="btn btn-secondary btn-sm view-rfi-download" data-id="' + data.applicationId + '" title="Download Report"><i class="bi bi-download"></i> Download</button>';

                    ;
                }
            }
        ],
        paging: true,
        searching: false,
        info: false,
        lengthChange: false
    });

    // Click handlers for action buttons
    $(document).on('click', '.view-rfi-report', function () {
        var id = $(this).data('id');
        var fundingCallId = $(this).data('callid');
        if (!id) {
            toastr.error("Invalid report id.");
            return;
        }
        else {
            var url = baseUrl + '/Administration/AdminViewReport?applicationId=' + id + '&fundingCallId=' + fundingCallId;
            window.location.href = url;
        }
    });

    $(document).on('click', '.view-rfi-download', function () {
        var id = $(this).data('id');
        if (!id) {
            toastr.error("Invalid report id.");
            return;
        }
        else {
            var url = baseUrl + '/Administration/CreatePdfDocument?applicationId=' + id;
            window.location.href = url;
        }
    });

    // When user clicks Comments, fetch comments from AdministrationController and show modal
    $(document).on('click', '.view-rfi-comments', function () {
        var id = $(this).data('id');
        if (!id) {
            toastr.error("Invalid report id.");
            return;
        }

        $.ajax({
            url: '/Administration/GetCommentsByReportId',
            type: 'GET',
            data: { reportId: id },
            success: function (comments) {
                var $tbody = $('#commentsTable tbody');
                $tbody.empty();

                if (!comments || comments.length === 0) {
                    $tbody.append('<tr><td colspan="3" class="text-center">No comments found.</td></tr>');
                } else {
                    $.each(comments, function (i, c) {
                        var addedBy = c.addedBy || c.AddedBy || '';
                        var commentText = c.comment || c.Comment || '';

                        // escape text to avoid HTML injection and preserve newlines
                        var escapedAddedBy = $('<div>').text(addedBy).html();
                        var escapedComment = $('<div>').text(commentText).html().replace(/\n/g, '<br/>');

                        $tbody.append(
                            '<tr>' +
                            '<td>' + (i + 1) + '</td>' +
                            '<td>' + escapedAddedBy + '</td>' +
                            '<td>' + escapedComment + '</td>' +
                            '</tr>'
                        );
                    });
                }

                $('#commentsModal').modal('show');
            },
            error: function () {
                toastr.error("Could not fetch comments. Please try again.");
            }
        });
    });

    // RFI search — DOM-based filter (same pattern as pendingReportSearch)
    const rfiSearchInput = document.getElementById('rfiReportSearch');
    const rfiTbodySelector = '#reportRfiTable tbody';

    function getRfiTbody() {
        return document.querySelector(rfiTbodySelector);
    }

    function rfiRowSearchText(row) {
        if (!row) return '';
        const cells = row.querySelectorAll('td');
        // columns: 1=Reference, 2=Full Name, 3=Applicant Category, 4=Approved Amount, 5=Report Status, 6=Created Date
        const indices = [1, 2, 3, 4, 5, 6];
        const parts = [];
        indices.forEach(i => {
            if (cells[i]) parts.push(cells[i].textContent.trim());
        });
        return parts.join(' ').toLowerCase();
    }

    function applyRfiFilter() {
        const q = (rfiSearchInput?.value || '').trim().toLowerCase();
        const tbody = getRfiTbody();
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach(row => {
            const text = rfiRowSearchText(row);
            row.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
        });
    }

    // Debounce input to avoid excessive work while typing
    let rfiDebounceTimer = null;
    if (rfiSearchInput) {
        rfiSearchInput.addEventListener('input', function () {
            clearTimeout(rfiDebounceTimer);
            rfiDebounceTimer = setTimeout(applyRfiFilter, 250);
        });
    }

    // Observe tbody mutations so filter reapplies after DataTable redraws
    const rfiObserver = new MutationObserver(function () {
        applyRfiFilter();
    });
    function ensureRfiObserver() {
        const tbody = getRfiTbody();
        if (tbody) {
            rfiObserver.observe(tbody, { childList: true, subtree: true, characterData: true });
        }
    }
    ensureRfiObserver();
    document.addEventListener('DOMContentLoaded', function () {
        ensureRfiObserver();
        applyRfiFilter();
    });

    // Expose for other scripts if needed
    window.__applyRfiReportFilter = applyRfiFilter;

    // Submitted reports — DOM based filter (same approach as RFI)
    const submittedSearchInput = document.getElementById('submittedReportSearch');
    const submittedTbodySelector = '#submittedReportTable tbody';

    function getSubmittedTbody() {
        return document.querySelector(submittedTbodySelector);
    }

    function submittedRowSearchText(row) {
        if (!row) return '';
        const cells = row.querySelectorAll('td');
        // columns: 1=Reference, 2=Full Name, 3=Applicant Category, 4=Approved Amount, 5=Report Status, 6=Created Date
        const indices = [1, 2, 3, 4, 5, 6];
        const parts = [];
        indices.forEach(i => {
            if (cells[i]) parts.push(cells[i].textContent.trim());
        });
        return parts.join(' ').toLowerCase();
    }

    function applySubmittedFilter() {
        const q = (submittedSearchInput?.value || '').trim().toLowerCase();
        const tbody = getSubmittedTbody();
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach(row => {
            const text = submittedRowSearchText(row);
            row.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
        });
    }

    let submittedDebounceTimer = null;
    if (submittedSearchInput) {
        submittedSearchInput.addEventListener('input', function () {
            clearTimeout(submittedDebounceTimer);
            submittedDebounceTimer = setTimeout(applySubmittedFilter, 250);
        });
    }

    const submittedObserver = new MutationObserver(function () {
        applySubmittedFilter();
    });
    function ensureSubmittedObserver() {
        const tbody = getSubmittedTbody();
        if (tbody) {
            submittedObserver.observe(tbody, { childList: true, subtree: true, characterData: true });
        }
    }
    ensureSubmittedObserver();
    document.addEventListener('DOMContentLoaded', function () {
        ensureSubmittedObserver();
        applySubmittedFilter();
    });

    window.__applySubmittedReportFilter = applySubmittedFilter;

    // Finalized reports — DOM based filter (same approach)
    const finalizedSearchInput = document.getElementById('finalizedReportSearch');
    const finalizedTbodySelector = '#finalizedReportTable tbody';

    function getFinalizedTbody() {
        return document.querySelector(finalizedTbodySelector);
    }

    function finalizedRowSearchText(row) {
        if (!row) return '';
        const cells = row.querySelectorAll('td');
        // columns: 1=Reference, 2=Full Name, 3=Applicant Category, 4=Approved Amount, 5=Report Status, 6=Created Date
        const indices = [1, 2, 3, 4, 5, 6];
        const parts = [];
        indices.forEach(i => {
            if (cells[i]) parts.push(cells[i].textContent.trim());
        });
        return parts.join(' ').toLowerCase();
    }

    function applyFinalizedFilter() {
        const q = (finalizedSearchInput?.value || '').trim().toLowerCase();
        const tbody = getFinalizedTbody();
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach(row => {
            const text = finalizedRowSearchText(row);
            row.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
        });
    }

    let finalizedDebounceTimer = null;
    if (finalizedSearchInput) {
        finalizedSearchInput.addEventListener('input', function () {
            clearTimeout(finalizedDebounceTimer);
            finalizedDebounceTimer = setTimeout(applyFinalizedFilter, 250);
        });
    }

    const finalizedObserver = new MutationObserver(function () {
        applyFinalizedFilter();
    });
    function ensureFinalizedObserver() {
        const tbody = getFinalizedTbody();
        if (tbody) {
            finalizedObserver.observe(tbody, { childList: true, subtree: true, characterData: true });
        }
    }
    ensureFinalizedObserver();
    document.addEventListener('DOMContentLoaded', function () {
        ensureFinalizedObserver();
        applyFinalizedFilter();
    });

    window.__applyFinalizedReportFilter = applyFinalizedFilter;


















    // comments filter
    const commentsFilterInput = document.getElementById('commentsFilter');
    const commentsbodySelector = '#commentsTable tbody';

    function getCommentsbody() {
        return document.querySelector(commentsbodySelector);
    }

    function commentsRowSearchText(row) {
        if (!row) return '';
        const cells = row.querySelectorAll('td');
        // columns: 1=Reference, 2=Full Name, 3=Applicant Category, 4=Approved Amount, 5=Report Status, 6=Created Date
        const indices = [1, 2, 3, 4, 5, 6];
        const parts = [];
        indices.forEach(i => {
            if (cells[i]) parts.push(cells[i].textContent.trim());
        });
        return parts.join(' ').toLowerCase();
    }

    function applyCommentsFilter() {
        const q = (commentsFilterInput?.value || '').trim().toLowerCase();
        const tbody = getCommentsbody();
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach(row => {
            const text = commentsRowSearchText(row);
            row.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
        });
    }

    let commentsDebounceTimer = null;
    if (commentsFilterInput) {
        commentsFilterInput.addEventListener('input', function () {
            clearTimeout(commentsDebounceTimer);
            commentsDebounceTimer = setTimeout(applyCommentsFilter, 250);
        });
    }

    const commentsObserver = new MutationObserver(function () {
        applyCommentsFilter();
    });
    function ensureCommentsObserver() {
        const tbody = getCommentsbody();
        if (tbody) {
            commentsObserver.observe(tbody, { childList: true, subtree: true, characterData: true });
        }
    }
    ensureCommentsObserver();
    document.addEventListener('DOMContentLoaded', function () {
        ensureCommentsObserver();
        applyCommentsFilter();
    });

    window.__applyCommentsFilter = applyCommentsFilter;













});
