$(document).ready(function () {
    onDashboardLoad();

    $('#filterForm').on('submit', function (e) {
        e.preventDefault(); // prevent actual form submit reload
        onDashboardLoad();
    });

    $(function () {
        const toastContainer = document.getElementById("toastMessages");
        if (!toastContainer) return;

        const successMsg = toastContainer.dataset.success;
        const failureMsg = toastContainer.dataset.failure;

        toastr.options = {
            closeButton: true,
            positionClass: "toast-top-right",
            preventDuplicates: true,
            progressBar: true,
            tapToDismiss: false
        };

        if (successMsg) {
            toastr.success(successMsg);
        }

        if (failureMsg) {
            toastr.error(failureMsg);
        }
    });




    $(document.body).on('click', '.btnSearch', function () {

        var publicationDataObject = new Object();

        var _PublicationTitleVariable = $("#txtFindPublishTitleNewDashBoard").val();
        var _SDG = $("#txtFindSDGNewDashBoard").val();

        if ((_PublicationTitleVariable === "") && (_SDG === null)) {
            toastr.error("Please specify the Publication Title", "Error Message");
            return;
        }
        if (_SDG === "Select") { _SDG = null }

        publicationDataObject.PublicationTitle = _PublicationTitleVariable;
        publicationDataObject.SDG = _SDG;


        $("#UserDashBoardTable").dataTable().fnDestroy();
        $("#UserDashBoardTable").DataTable({
            "searching": true,
            "ordering": false,
            "processing": true,
            "serverSide": false,
            "ajax": {
                "url": "Oross/GetAdminSearch",
                "dataSrc": "",
                "type": "POST",
                "data": publicationDataObject,
                "datatype": "json"
            },
            "columns": [
                { "data": "GuidID", "className": "hidden" },
                { "data": "CreatedBy", "width": '10%' },
                { "data": "Research_Output", "width": '10%' },
                { "data": "PublicationTitle", "width": '30%' },
                { "data": "Author", "width": '30%' },
                { "data": "SDG", "width": '30%' },
                { "data": "Publish", "width": '10%' },
                { "data": "CreatedDate", "width": '10%' },
                { "data": "LastChangedDate", "width": '10%' },
                { "data": "RFAstatus", "width": '30%' },

                //My changes
                {
                    "render": function (data, type, full, meta) {
                        if (full.GuidID) {
                            var isEdited = full.RFAstatus && full.RFAstatus === "Submitted";
                            if (full.RFAstatus !== null) {
                                return '<div style="white-space: nowrap;">' +
                                    '<button value="' + full.GuidID + '" data-reaserchDoc="researchDoc" type="button" id="btnView" class="btn btn-xs btn-primary btnView"><i class="fa fa-eye"></i> View</button>' +
                                    (isEdited ? '' : '|' + '<button value="' + full.GuidID + '" data-reaserchDoc="researchDoc" type="button" id="btnUpdateRFA" class="btn btn-xs btn-primary btnUpdateRFA"><i class="fa fa-pencil"></i> Edit</button>') +
                                    '</div>';
                            } else {
                                return '<button value="' + full.GuidID + '" data-reaserchDoc="researchDoc" type="button" id="btnView" class="btn btn-xs btn-primary btnView"><i class="fa fa-eye"></i> View</button>';
                            }
                        }
                    }
                }
            ]
        });
    })

    $(document).on('change', "#lstSubmissionsType", function () {

        var val = $(this).val();

        $("#UserDashBoardTable").dataTable().fnDestroy();
        $("#UserDashBoardTable").DataTable({
            "searching": false,
            "ordering": false,
            "processing": true,
            "serverSide": false,
            "ajax": {
                "url": "Oross/GetAdmin_ResearchOutPutInfoBySubmissionsType?submissionsType=" + val,
                "dataSrc": "",
                "type": "GET",
                "datatype": "json"
            },
            "columns": [
                { "data": "GuidID", "className": "hidden" },
                { "data": "CreatedBy", "width": '10%' },
                { "data": "Research_Output", "width": '10%' },
                { "data": "PublicationTitle", "width": '30%' },
                { "data": "Author", "width": '30%' },
                { "data": "SDG", "width": '30%' },
                { "data": "Publish", "width": '10%' },
                { "data": "CreatedDate", "width": '10%' },
                { "data": "LastChangedDate", "width": '10%' },
                { "data": "RFAstatus", "width": '30%' },

                //My changes
                {
                    "render": function (data, type, full, meta) {
                        if (full.GuidID) {
                            var isEdited = full.RFAstatus && full.RFAstatus === "Submitted";
                            if (full.RFAstatus !== null) {
                                return '<div style="white-space: nowrap;">' +
                                    '<button value="' + full.GuidID + '" data-reaserchDoc="researchDoc" type="button" id="btnView" class="btn btn-xs btn-primary btnView"><i class="fa fa-eye"></i> View</button>' +
                                    (isEdited ? '' : '|' + '<button value="' + full.GuidID + '" data-reaserchDoc="researchDoc" type="button" id="btnUpdateRFA" class="btn btn-xs btn-primary btnUpdateRFA"><i class="fa fa-pencil"></i> Edit</button>') +
                                    '</div>';
                            } else {
                                return '<button value="' + full.GuidID + '" data-reaserchDoc="researchDoc" type="button" id="btnView" class="btn btn-xs btn-primary btnView"><i class="fa fa-eye"></i> View</button>';
                            }
                        }
                    }
                }
            ]
        });
    });



    $(document).on('click', '.btnAddToRepo', function () {
        const guidID = this.value;
        if (!guidID) return;
        const paperTitle = $(this).data('title');
        $('#repo-paper-title').text(paperTitle);

        const confirmModal = new bootstrap.Modal(document.getElementById('confirmAddToRepoModal'));
        confirmModal.show();

        $('#btnConfirmAddToRepo').off('click').on('click', function () {
            $(this).prop('disabled', true);

            $.ajax({
                url: `/Oross/AddToRepository`,
                type: 'POST',
                data: { guid: guidID },
                dataType: 'json', // now the controller returns proper JSON
                success: function (response) {
                    bootstrap.Modal.getInstance(document.getElementById('confirmAddToRepoModal')).hide();

                    if (response.success) {
                        toastr.success(response.message, "Success");
                        onDashboardLoad();
                    } else {
                        toastr.error(response.message, "Error");
                    }
                },
                error: function (xhr) {
                    console.error("❌ Error adding to repository:", xhr.responseText);
                    toastr.error("Failed to add to the repository.", "Error");
                },
                complete: function () {
                    $('#btnConfirmAddToRepo').prop('disabled', false);
                }
            });
        });
    });
});

function onDashboardLoad() {
    const tableSelector = "#UserDashBoardTable";
    const params = new URLSearchParams(window.location.search);
    const pageFromQuery = parseInt(params.get("page")) || 1;
    const pageSizeFromQuery = parseInt(params.get("pageSize")) || 10;

    const type = $('#SubmissionsType').val() || "";
    const startDate = $('#StartDate').val() || "";
    const endDate = $('#EndDate').val() || "";
    const researchType = $('#ResearchType').val() || "";
    const faculty = $('#Faculty').val() || "";
    const sdg = $('#Sdg').val() || "";

    // Destroy existing table if any
    if ($.fn.dataTable.isDataTable(tableSelector)) {
        $(tableSelector).DataTable().clear().destroy();
    }

    const table = $(tableSelector).DataTable({
        dom: 'lfrtip',
        paging: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50, 100],
        searching: true,
        ordering: true,
        processing: true,
        serverSide: false,

        // **Disable all inline style injections**
        responsive: false,  // no dynamic column width adjustments
        autoWidth: false,   // no inline width on <th> / <td>
        scrollX: false,     // no horizontal scroll inline widths
        scrollCollapse: false,

        ajax: {
            url: 'Oross/GetAdmin_ResearchOutPutInfoBySubmissionsType',
            dataSrc: '',
            type: 'GET',
            data: {
                SubmissionsType: type,
                startDate: startDate,
                endDate: endDate,
                researchType: researchType,
                faculty: faculty,
                sdg: sdg
            }
        },

        columns: [
            { data: "researchId" },
            { data: "createdBy", render: data => toProperCase(data) },
            { data: "author", render: data => toProperCase(data) },
            { data: "primaryAuthor", render: data => toProperCase(data) },
            { data: "research_Output" },
            { data: "publicationTitle" },
            { data: "faculty" },
            { data: "sdg" },
            {
                data: "publish", render: data => {
                    const isPublished = (data || "").toLowerCase() === "yes";
                    return `<div class="d-flex justify-content-center align-items-center publish-cell">
                    <span class="${isPublished ? 'text-primary' : 'text-secondary'}">
                        <i class="fa ${isPublished ? 'fa-check-circle' : 'fa-minus-circle'}"></i>
                    </span>
                </div>`;
                }
            },
            {
                data: "createdDate",
                render: function (data) {
                    if (!data) return '';
                    const dateObj = new Date(data);
                    const iso = dateObj.toISOString();
                    const formatted = dateObj.toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: false
                    });
                    return `<span data-order="${iso}">${formatted}</span>`;
                }
            },
            {
                data: "lastChangedDate",
                render: function (data) {
                    if (!data) return '';
                    const dateObj = new Date(data);
                    const iso = dateObj.toISOString();
                    const formatted = dateObj.toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: false
                    });

                    return `<span data-order="${iso}">${formatted}</span>`;
                }
            },
            { data: "rfAstatus" },
            {
                orderable: false,
                searchable: false,
                render: function (data, type, full) {
                    if (!full.guidID) return '';
                    const actions = [];
                    const isPublished = (full.publish || "").toLowerCase() === "yes";
                    const currentUserRole = document.getElementById("currentUserRole")?.value?.toLowerCase();
                    const currentUserName = String(document.getElementById("currentusername")?.value ?? "").trim().toLowerCase();
                    const isRfa = String(full.rfAstatus ?? "").trim().toLowerCase() === "rfa";
                    const loggedInFirstName = String(document.getElementById("loggedInFirstName")?.value ?? "").trim().toLowerCase();
                    const loggedInLastName = String(document.getElementById("loggedInLastName")?.value ?? "").trim().toLowerCase();
                    const username = String(full.username ?? "").trim().toLowerCase();
                    const createdBy = String(full.createdBy ?? "").trim().toLowerCase();
                    const authorUsername = String(full.username ?? "").trim().toLowerCase();
                    const isCreator = currentUserName === createdBy;
                    const isAuthor = currentUserName === authorUsername;
                    const isNameMatch = createdBy.includes(loggedInFirstName) && createdBy.includes(loggedInLastName);
                    const usernameMatch = currentUserName === username
                    const canEdit = isRfa && (isCreator || isAuthor || isNameMatch);

                    actions.push(`<button value="${full.guidID}" type="button"
                        class="btn btn-xs btn-outline-primary btnView" title="View">
                        <i class="fa fa-eye"></i>
                    </button>`);

                    if (canEdit) {
                        const url = buildUrl(`Oross/EditSubmission?guid=${full.guidID}`);
                        actions.push(`<a href="${url}"
                            class="btn btn-xs btn-outline-warning" title="Edit"> 
                            <i class="fa fa-pencil"></i> </a> `);
                    }

                    // Add to repo
                    if ((currentUserRole === "admin" || currentUserRole === "faculty coordinator") && !isPublished) {
                        actions.push(`<button value="${full.guidID}" 
                            data-title="${(full.publicationTitle || '').replace(/"/g, '&quot;')}" 
                            type="button" class="btn btn-xs btn-outline-secondary btnAddToRepo"
                            title="Add to repository">
                            <i class="fa fa-cloud-upload"></i>
                        </button>`);
                    }

                    return `<div class="d-inline-flex gap-1">${actions.join('')}</div>`;
                }
            }
        ],
        order: [[9, 'desc']],
        columnDefs: [
            { targets: 9, type: 'datetime' },
            { targets: 10, type: 'datetime' }
        ],

        initComplete: function () {
            // pagination page from query (if any)
            const params = new URLSearchParams(window.location.search);
            const page = parseInt(params.get("page")) || 1;
            table.page(page - 1).draw('page');
        }
    });

    const basePath = window.config?.basePath || "/";

    $(document.body).on('click', '.btnView', function () {
        const guidID = this.value;
        if (!guidID) return toastr.error("Missing research ID");

        const tableInfo = table.page.info();
        const currentPage = tableInfo.page + 1;
        const pageSize = tableInfo.length;

        // Ensure basePath ends with "/"
        const normalizedBase = basePath.endsWith('/') ? basePath : basePath + '/';
        const url = buildUrl(`Oross/SubmittedResearchView?guid=${encodeURIComponent(guidID)}&page=${currentPage}&pageSize=${pageSize}`);
        window.location.href = url;
    });


}
function buildUrl(path) {
    const base = window.config?.basePath || "/";
    const normalizedBase = base.endsWith("/") ? base : base + "/";
    const cleanPath = path.replace(/^\/+/, ""); // remove leading slashes
    return normalizedBase + cleanPath;
}


$(document)
    .off('click', '#exportExcelBtn')
    .on('click', '#exportExcelBtn', async function (e) {
        e.preventDefault();
        showLoading();

        // Start file download (GET or POST request)
        fetch('/Oross/ExportFilteredToExcel', {
            method: 'POST',
            body: new FormData(document.getElementById('filterForm'))
        })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ResearchExport.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
                hideLoading();
            })
            .catch(err => {
                console.error("Export error", err);
                hideLoading();
                alert("Failed to export file.");
            });
    });

function showLoading() {
    $('#exportLoading').removeClass('d-none');
}

function hideLoading() {
    $('#exportLoading').addClass('d-none');
}
function toProperCase(str) {
    if (!str) return '';
    return str.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
