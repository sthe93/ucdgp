$(document).ready(function () {

    // var tt = isProgressReportReminderExpired();

    var chk = Intl.NumberFormat('en-US');


    function loadApplictionsDashboard() {
        $("#tblApplicationsBody").empty();
        $("#tblApplicationsBody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-2x fa-circle-o-notch fa-spin fa-fw"></i></td></tr>');
        $.ajax({
            type: "GET",
            url: '@Url.Action("GetMyApplications", "Applications")',
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            success: function (data) {
                $("#tblApplicationsBody").empty();


                console.log(data);

                if (data.length === 0) {
                    $("#tblApplicationsBody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>No record found.</strong></td></tr>");
                }

                var counter = 0;
                var link = "";
                $.each(data, function (index, item) {
                    console.log(item);
                    counter++;
                    var submitteddt = new Date(item.applicationEndDate);

                    if (item.applicationStatus.status == 'Incomplete') {
                        actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#"  onclick="finishApplication(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-pencil" aria-hidden="true"></i> Edit</a>&nbsp;&nbsp;';

                    } else {
                        actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View </a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                            '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>'
                    }

                    if (item.applicationStatus.status == 'Returned for Info') {

                        actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="rfiApplication(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> Edit</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +

                            '<a style="color: #FF6400" id="' + item.id + '" href="#" class="btnViewComments action-buttons" applicationId="' + item.id + '" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Comments"><i class="fa fa-commenting-o" aria-hidden="true"></i> Comments</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                            '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>'
                    }

                    if (item.applicationStatus.status == 'Declined') {

                        actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +

                            '<a style="color: #FF6400" id="' + item.id + '" href="#" class="btnViewComments action-buttons" applicationId="' + item.id + '" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Decline Reason"><i class="fa fa-commenting-o" aria-hidden="true"></i> Decline Reason</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                            '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>'
                    }




                    if (item.applicationStatus.status == 'Approved by UCDG_SIA_Director') {


                        if (item.progressReportComplete == false && isProgressReportReminderExpired(item.fundingEndDate)) {

                            actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +

                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> Open Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="progressReport(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Create Report"><i class="fa fa-eye" aria-hidden="true"></i> Create Report</a>' +
                                '&nbsp;&nbsp;|&nbsp;&nbsp;<a style="color: #FF6400" id="' + item.id + '" href="#" class="btnViewReportComments action-buttons" applicationId="' + item.id + '" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Comments"><i class="fa fa-commenting-o" aria-hidden="true"></i> View Comments</a>'

                        } else {
                            actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +

                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> Open Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewReport(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Report Details"><i class="fa fa-eye" aria-hidden="true"></i> View Report</a>  &nbsp;|&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.reportId + '" href="#" onclick="viewReportPDF(' + item.reportId + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Report Details"><i class="fa fa-download" aria-hidden="true"></i> Download Report </a>'
                        }

                    }

                    else if (item.applicationStatus.status == 'Award Letter Accepted') {

                        if (item.progressReportComplete == false && isProgressReportReminderExpired(item.fundingEndDate)) {


                            actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> View Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="progressReport(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Create Report"><i class="fa fa-eye" aria-hidden="true"></i> Create Report</a>'

                        } else {
                            actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> View Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewReport(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View Report</a> &nbsp;|&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.reportId + '" href="#" onclick="viewReportPDF(' + item.reportId + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Report Details"><i class="fa fa-download" aria-hidden="true"></i> Download Report </a>'

                        }

                    }
                    else if (item.applicationStatus.status == 'Award Letter Declined') {

                        if (item.progressReportComplete == false) {
                            actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                /* '<a style="color: #FF6400" id="' + item.referenceNumber + '" href="#"  onclick="awardLetter(' + item.referenceNumber + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> AwardLetter</a>&nbsp;&nbsp;' +*/
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> View Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>'
                        }
                        else {
                            actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                /* '<a style="color: #FF6400" id="' + item.referenceNumber + '" href="#"  onclick="awardLetter(' + item.referenceNumber + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> AwardLetter</a>&nbsp;&nbsp;' +*/
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> View Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>&nbsp;|&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.reportId + '" href="#" onclick="viewReportPDF(' + item.reportId + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Report Details"><i class="fa fa-download" aria-hidden="true"></i> Download Report </a>'

                        }
                    }

                    else if (item.applicationStatus.status == 'Approved by UCDG_Fin_Bus_Partner') {

                        if (item.progressReportComplete == false) {
                            actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> Open Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>'

                        } else {
                            actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                /* '<a style="color: #FF6400" id="' + item.referenceNumber + '" href="#"  onclick="awardLetter(' + item.referenceNumber + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> AwardLetter</a>&nbsp;&nbsp;' +*/
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} ` + ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> Open Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewPDF(' + item.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a> &nbsp;|&nbsp;' +
                                '<a style="color: #FF6400" id="' + item.reportId + '" href="#" onclick="viewReportPDF(' + item.reportId + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Report Details"><i class="fa fa-download" aria-hidden="true"></i> Download Report </a>'

                        }

                    }
                    documentLink = '';


                    debugger;


                    var totalFormat = item.dhetFundsRequested.replace(/\s/g, '');
                    let totalFormatApprovedAmount = item.approvedAmount?.trim();

                    if (totalFormatApprovedAmount) {
                        totalFormatApprovedAmount = totalFormatApprovedAmount.replace(/\s/g, '');
                        totalFormatApprovedAmount = chk.format(totalFormatApprovedAmount).replace(/,/g, ' ');
                        totalFormatApprovedAmount = totalFormatApprovedAmount === '0' ? 'N/A' : 'R' + totalFormatApprovedAmount;
                    } else {
                        totalFormatApprovedAmount = 'N/A';
                    }


                    let selectedProject = "";

                    if (item?.fundingCalls?.fundingCallProjects?.length) {
                        selectedProject = item.fundingCalls.fundingCallProjects
                            .map(p => p.projectName.split(":")[0]) // Extract text before ":"
                            .join(" <br/>");
                    }


                    documentLink = '<a href="#" class="btnViewAttachedDocs action-buttons" applicationId="' + item.id + '" numberOfDocuments="' + item.numberOfDocuments + '" data-toggle="modal" data-target="" title="View attached documents list"><i class="fa fa-file" aria-hidden="true"></i> ' + item.numberOfDocuments + '</a>&nbsp;&nbsp'
                    $("#tblApplicationsBody").append("<tr><td>" + counter + "</td>" +
                        '<td>' + item.referenceNumber + '</td>' +
                        '<td>' + item.fundingCalls.fundingCallName + '</td>' +
                        '<td>' + selectedProject + '</td>' +
                        '<td> R' + chk.format(totalFormat).replace(',', ' ').replace(',', ' ') + '</td>' +
                        '<td>' + totalFormatApprovedAmount + '</td>' +
                        '<td>' + submitteddt.toLocaleDateString('en-GB') + '</td>' +
                        '<td>' + documentLink + '</td>' +
                        '<td>' + item.applicationStatus.status + '</td>' +
                        '<td>' + actionIconLinks + '</td>' +
                        "</tr > ");
                });

            },
            error: function () {
                toastr.error('Cannot Display Funding Information.', 'Error');
            }
        });
    }

    function isProgressReportReminderExpired(fundingEndDate) {

        // Get the current date
        const currentDate = new Date();
        const currentFundingDate = new Date(fundingEndDate);
        // Get the current year
        const currentYear = currentDate.getFullYear();
        const _fundingEndDate = currentFundingDate.getFullYear();
        // Create a date object for January 15th of the current year
        const january15 = new Date(currentYear, 0, 16); // Month is 0-indexed (0 for January)
        // Compare the current date with January 15th
        if (_fundingEndDate < currentYear) {
            return currentDate < january15;
        }
        else {
            return true
        }
    }

    $(document.body).on('click', '#btnSearch', function () {

        var filterObject = new FormData();
        filterObject.append("FundingCallName", $("#fundingCallName").val());
        filterObject.append("RefferenceNumber", $("#referenceNumber").val());
        filterObject.append("StatusId", $("#ddlApplicationStatuses").val());

        $("#tblApplicationsBody").empty();
        $("#tblApplicationsBody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-2x fa-circle-o-notch fa-spin fa-fw"></i></td></tr>');
        $.ajax({
            type: "POST",
            url: '@Url.Action("FilterApplications", "Applications")',
            contentType: false,
            processData: false,
            datatype: "json",
            data: filterObject,
            success: function (data) {
                $("#tblApplicationsBody").empty();
                //if (textStatus === "success" && xhr.status === 200) {
                if (data.length === 0) {
                    $("#tblApplicationsBody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>No record found.</strong></td></tr>");
                }

                var counter = 0;
                var link = "";
                $.each(data, function (index, item) {

                    counter++;
                    var submitteddt = new Date(item.applicationEndDate);

                    if (item.applicationStatus.status == 'Incomplete') {
                        actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#"  onclick="finishApplication(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-pencil" aria-hidden="true"></i> Edit </a>&nbsp;&nbsp;';


                    } else {
                        actionIconLinks = '<a style="color: #FF6400" id="' + item.id + '" href="#" onclick="viewDetails(' + item.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View </a>&nbsp;&nbsp;'
                        //'<a style="color: #FF6400" id="' + item.id + '" href="#" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope-o" aria-hidden="true"></i> Award Letter</a>&nbsp;&nbsp;';
                    }
                    documentLink = '';
                    documentLink = '<a href="#" class="btnViewAttachedDocs action-buttons" applicationId="' + item.id + '" numberOfDocuments="' + item.numberOfDocuments + '" data-toggle="modal" data-target="" title="View attached documents list"><i class="fa fa-file" aria-hidden="true"></i> ' + item.numberOfDocuments + '</a>&nbsp;&nbsp'
                    $("#tblApplicationsBody").append("<tr><td>" + counter + "</td>" +
                        '<td>' + item.referenceNumber + '</td>' +
                        '<td>' + item.fundingCalls.fundingCallName + '</td>' +
                        '<td>' + submitteddt.toLocaleDateString('en-GB') + '</td>' +
                        '<td>' + documentLink + '</td>' +
                        '<td>' + item.applicationStatus.status + '</td>' +
                        //'<td>' + item.applicationStatus.status + '</td>' +
                        '<td>' + actionIconLinks + '</td>' +
                        "</tr > ");
                });
            },
            error: function () {
                toastr.error('Cannot Display Funding Information.', 'Error');
            }
        });

    });



    $(document.body).on('click', '.btnViewReportComments', function () {
        var applicationId = $(this).attr("applicationId");

        $('#openReportCommentListModal').modal("show");
        loadReportComments(applicationId);

    });

    $(document).on("click", "a[id^='report-']", function (e) {
        e.preventDefault(); // stop href="#" navigation
        var fundingId = $(this).data("funding-id");
        progressReport(fundingId);
    });

    function loadReportComments(applicationId) {

        $("#tblReportCommentsBody").empty();
        $("#tblReportCommentsBody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-2x fa-circle-o-notch fa-spin fa-fw"></i></td></tr>');
        $.ajax({
            type: "GET",
            url: '@Url.Action("GetCommentsListByApplicationsId", "ProgressReport")',
            contentType: "application/json; charset=utf-8",
            data: { "applicationsId": applicationId },
            datatype: "json",
            success: function (data) {
                $("#tblReportCommentsBody").empty();
                console.log(data);
                if (data.length === 0) {
                    $("#tblReportCommentsBody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>No record found.</strong></td></tr>");
                }

                var counter = 0;
                var link = ''

                $.each(data, function (index, item) {
                    counter++;
                    console.log(item);
                    $("#tblReportCommentsBody").append("<tr>" +
                        '<td>' + item.AddedBy + '</td>' +
                        '<td>' + item.Comment + '</td>' +
                        "</tr > ");
                });

            },
            error: function () {
                toastr.error('Cannot Display Funding Information.', 'Error');
            }
        });
    }
        
    function loadApplicationStatuses() {
        $("#ddlApplicationStatuses").empty();
        $("#ddlApplicationStatuses").append($('<option></option>').val('0').html('All'));
        $.ajax({
            type: "POST",
            url: '@Url.Action("GetAllApplicationStatus", "Applications")',
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            success: function (data) {
                $.each(data, function (index, item) {
                    $("#ddlApplicationStatuses").append($('<option></option>').val(item.applicationStatusId).html(item.status));
                });
            },
            error: function () {
                toastr.error('Cannot Display Funding Information.', 'Error');
            }
        });
    }

    /*loadApplicationStatuses();*/

    setTimeout(function () {
        //loadApplictionsDashboard();
    }, 2000);

});

var spinner = $('#loader');

function viewDetails(id) {
    spinner.show();
    document.location = '@Url.Action("ViewApplicationDetails", "Applications")?fundingCallId=' + id;
}

function progressReport(id) {
    //spinner.show();
    var baseUrl = window.config.basePath;
    document.location = baseUrl + '/Administration/CreateReport?fundingCallId=' + id;
}

function viewReport(id) {
    spinner.show();
    document.location = '@Url.Action("ViewReport", "ProgressReport")?applicationId=' + id;
}

function viewPDF(id) {
    spinner.show();
    document.location = '@Url.Action("CreatePdfDocument", "Applications")?applicationId=' + id;
    spinner.hide();
}


function viewReportPDF(id) {
    spinner.show();
    document.location = '@Url.Action("CreatePdfDocument", "ProgressReport")?reportId=' + id;
    spinner.hide();
}

function finishApplication(id) {
    spinner.show();
    document.location = '@Url.Action("Apply", "Applications")?fundingCallId=' + id;
}

function rfiApplication(id) {
    spinner.show();
    document.location = '@Url.Action("ReturnForInfo", "Applications")?applicationId=' + id;
}


function awardLetter(referenceNumber) {
    spinner.show();
    document.location = '@Url.Action("AwardLetter", "Applications")?referenceNumber=' + JSON.stringify(referenceNumber);

}

function appSign(applicationId, referenceNumber) {
    var postData = new FormData();
    postData.append("ReferenceNumber", referenceNumber);
    postData.append("Id", applicationId);

    spinner.show();
    $.ajax({
        url: '@Url.Action("CreateSignature", "PDF")',
        type: "POST",
        contentType: false,
        processData: false,
        datatype: "json",
        data: postData,
        success: function (data) {
            //console.log(data);

            var url = "";
            toastr.success("Award Letter Accepted", 'Success Message');
            url = '@Url.Action("Index", "Applications")';
            document.location.href = url;

        },
        error: function () {
            spinner.hide();
            toastr.error('Cannot display document.', 'Error Message');
        }
    });
}

function appDeclineSign(applicationId, referenceNumber) {
    var postData = new FormData();
    postData.append("ReferenceNumber", referenceNumber);
    postData.append("Id", applicationId);

    spinner.show();
    $.ajax({
        url: '@Url.Action("CreateSignatureDecline", "PDF")',
        type: "POST",
        contentType: false,
        processData: false,
        datatype: "json",
        data: postData,
        success: function (data) {

            var url = "";
            toastr.success("Award Letter Declined", 'Success Message');
            url = '@Url.Action("Index", "Applications")';
            document.location.href = url;


        },
        error: function () {
            spinner.hide();
            toastr.error('Cannot display document.', 'Error Message');
        }
    });
}
function DeclineAwardletter(applicationId, referenceNumber) {

    var postData = { ReferenceNumber: referenceNumber, Id: applicationId };

    $.post("/PDF/DecliningAward", postData, function (data) {
        toastr.success('Saved suvvessfully', 'Success Message');
        location.reload();
    });

}


$(document).ready(function () {
    $("#myNewSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#tblApplicationsBody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $("#myDocSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#tblApplicationsDocumentsGrid tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $("#myCommentsSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#tblCommentsGrid tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

});

//Awad letter

$(document.body).on('click', '#btnViewPDF', function () {
    //var documentId = $(this).attr("documentId");

    $.ajax({
        type: "GET",
        url: '@Url.Action("AwardLetter", "Applications")',
        contentType: "application/json; charset=utf-8",
        data: { "documentId": documentId },
        datatype: "json",
        success: function (document) {

            $('#DocumentViewer').html('');
            $('#footerDiv').html('');
            $('#DocumentViewer').html('<i class="fa fa-2x fa-circle-o-notch fa-spin fa-fw col-md-12" style="aalign-content:center;"></i>');
            $("#viewDocumentModal").modal("show");


            setTimeout(function () {
                $('#DocumentViewer').html('<embed id="pdfViewerDoc" src="data:application/pdf;base64,' + document + '#toolbar=0&navpanes=0&scrollbar=0" type="application/pdf"  style="width:100%; height:600px" />');
                $("#DocumentViewer").css({
                    "height": "100%",
                });
            }, 1000);


            return;
        },
        error: function () {
            toastr.error('Cannot display document.', 'Error Message');
        }
    });
});

//------------------------------------New version js starts here------------------------------------------

$(document).ready(function () {

    onLoadApplictionsDashboard();
});

$(document.body).on('click', '.linkViewPDF', function () {
    var applicationId = $(this).attr("id");
    onViewPDF(applicationId);
});

$(document.body).on('click', '.btnViewAttachedDocs', function () {
    var applicationId = $(this).attr("applicationId");
    var numberOfDocuments = $(this).attr("numberOfDocuments");

    if (numberOfDocuments == '0') {
        toastr.error('No documnets.', 'Error Message');
        return
    }
    $('#openAttachedDocumentListModal').modal("show");

    loadApplicationDocuments(applicationId);

});

$(document.body).on('click', '#openAwardPopUpl', function () {
    var oWObj = $(this).data("openaward");
    openAwardPopUp(oWObj.referenceNumber, oWObj.id, oWObj.isAcknowledge, oWObj.userId);
});

$(document.body).on('click', '.btnViewComments', function () {
    var applicationId = $(this).attr("applicationId");

    $('#openCommentListModal').modal("show");
    loadComments(applicationId);

});
function onViewPDF(id) {
    spinner.show();
    const baseUrl = document.getElementById("createPdfUrl").dataset.url;
    document.location = baseUrl + '&applicationId=' + id;

    spinner.hide();
}

function onLoadApplictionsDashboard() {
    var chk = Intl.NumberFormat('en-US');
    const tblApplicationsGrid = "#tblApplicationsGrid";
      
    if ($.fn.dataTable.isDataTable(tblApplicationsGrid)) {
        $(tblApplicationsGrid).DataTable().clear().destroy();
    }

    const table = $(tblApplicationsGrid).DataTable({
        dom: 'lfrtip',
        paging: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50, 100],
        searching: true,
        ordering: false,
        processing: true,
        serverSide: false,

        // **Disable all inline style injections**
        responsive: false,  // no dynamic column width adjustments
        autoWidth: false,   // no inline width on <th> / <td>
        scrollX: false,     // no horizontal scroll inline widths
        scrollCollapse: false,

        ajax: {
            url: '/Ucdp/MyApplications/MyApplications',
            dataSrc: '',
            type: 'GET',
            data: {
                userid : 0
            }
        },

        columns: [
            { data: "id", render: (data, type, row, meta) => meta.row + 1 },
            { data: "referenceNumber", render: data => toProperCase(data) },
            { data: "fundingCalls", render: data => data.fundingCallName },
            {
                data: "fundingCalls",

                render: (data, type, row) => {
                    const projects = data?.fundingCallProjects;
                    if (!Array.isArray(projects) || projects.length === 0) return "";

                    return projects
                        .map(p => {
                            const name = (p?.projectName || "").split(":")[0].trim();
                            return name ? `<span>${name}</span><br />` : "";
                        })
                        .join("");
                }
            },
            {
                data: "dhetFundsRequested",
                render: data => `R${chk.format(data.replace(/\s/g, '')).replace(',', ' ').replace(',', ' ')}`
            }, 
            {
                data: "approvedAmount",
                render: (data) => {
                    if (data) {
                        return `R${chk.format(data.replace(/\s/g, '')).replace(',', ' ').replace(',', ' ')}`;
                    } else {
                        return "N/A";
                    }                   
                }
            },
            {
                data: "applicationEndDate",
                render: (data) => {
                    var applicationEndDate = new Date(data);
                    return applicationEndDate.toLocaleDateString('en-GB');
                }
            },
            {
                data: "numberOfDocuments",
                render: (data,type,full) => {
                    documentLink = `<a href="#" 
                    class="btnViewAttachedDocs action-buttons"
                    applicationId="${full.id}"
                    numberOfDocuments="${data}" 
                    data-toggle="modal" 
                    data-target="" 
                    title="View attached documents list">
                    <i class="fa fa-file" aria-hidden="true"></i> ${data}</a>`
                  
                    return documentLink;
                }
            },
            {
                data: "applicationStatus", render: data => data.status
            },
            {
                orderable: false,
                searchable: false,
                render: function (data, type, full) {                  
                   
                    if (full.applicationStatus.status == 'Incomplete') {
                        actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#"  onclick="finishApplication(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-pencil" aria-hidden="true"></i> Edit</a>&nbsp;&nbsp;';

                    } else {
                        actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewDetails(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View </a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                            '<a style="color: #FF6400" id="' + full.id + '" href="#" class="linkViewPDF"  data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>'
                    }

                    if (full.applicationStatus.status == 'Returned for Info') {

                        actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="rfiApplication(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> Edit</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +

                            '<a style="color: #FF6400" id="' + full.id + '" href="#" class="btnViewComments action-buttons" applicationId="' + full.id + '" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Comments"><i class="fa fa-commenting" aria-hidden="true"></i> Comments</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                            '<a style="color: #FF6400" id="' + full.id + '" href="#" class="linkViewPDF" onclick="viewPDF(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>'
                    }

                    if (full.applicationStatus.status == 'Declined') {

                        actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewDetails(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +

                            '<a style="color: #FF6400" id="' + full.id + '" href="#" class="btnViewComments action-buttons" applicationId="' + full.id + '" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Decline Reason"><i class="fa fa-commenting" aria-hidden="true"></i> Decline Reason</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                            '<a style="color: #FF6400" id="' + full.id + '" href="#" class="linkViewPDF" onclick="viewPDF(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>'
                    }
                     
                    if (full.applicationStatus.status == 'Approved by UCDG_SIA_Director') {


                        if (full.progressReportComplete == false && isProgressReportReminderExpired(full.fundingEndDate)) {

                            actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewDetails(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +

                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> Open Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" class="linkViewPDF" onclick="viewPDF(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" ' + 'id="report-' + full.id + '" ' + 'href="#" ' + 'data-funding-id="' + full.fundingCalls.id + '" ' + 'data-toggle="modal" ' + 'data-target="#postUdergraduateModal" ' + 'title="Create Report">' + '<i class="fa fa-eye" aria-hidden="true"></i> Create Report</a>' +
                                '&nbsp;&nbsp;|&nbsp;&nbsp;<a style="color: #FF6400" id="' + full.id + '" href="#" class="btnViewReportComments action-buttons" applicationId="' + full.id + '" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Comments"><i class="fa fa-commenting" aria-hidden="true"></i> View Comments</a>'

                        } else {
                            actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewDetails(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +

                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> Open Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" class="linkViewPDF" onclick="viewPDF(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewReport(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Report Details"><i class="fa fa-eye" aria-hidden="true"></i> View Report</a>  &nbsp;|&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.reportId + '" href="#" onclick="viewReportPDF(' + full.reportId + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Report Details"><i class="fa fa-download" aria-hidden="true"></i> Download Report </a>'
                        }

                    }

                    else if (full.applicationStatus.status == 'Award Letter Accepted') {

                        if (full.progressReportComplete == false && isProgressReportReminderExpired(full.fundingEndDate)) {


                            actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewDetails(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> View Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" class="linkViewPDF" onclick="viewPDF(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="progressReport(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Create Report"><i class="fa fa-eye" aria-hidden="true"></i> Create Report</a>'

                        } else {
                            actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewDetails(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> View Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" class="linkViewPDF" onclick="viewPDF(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewReport(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View Report</a> &nbsp;|&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.reportId + '" href="#" onclick="viewReportPDF(' + full.reportId + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Report Details"><i class="fa fa-download" aria-hidden="true"></i> Download Report </a>'

                        }

                    }

                    else if (full.applicationStatus.status == 'Award Letter Declined') {

                        if (full.progressReportComplete == false) {
                            actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewDetails(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                /* '<a style="color: #FF6400" id="' + full.referenceNumber + '" href="#"  onclick="awardLetter(' + full.referenceNumber + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> AwardLetter</a>&nbsp;&nbsp;' +*/
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> View Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" class="linkViewPDF" onclick="viewPDF(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>'
                        }
                        else {
                            actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewDetails(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                /* '<a style="color: #FF6400" id="' + full.referenceNumber + '" href="#"  onclick="awardLetter(' + full.referenceNumber + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> AwardLetter</a>&nbsp;&nbsp;' +*/
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> View Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" class="linkViewPDF" onclick="viewPDF(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>&nbsp;|&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.reportId + '" href="#" onclick="viewReportPDF(' + full.reportId + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Report Details"><i class="fa fa-download" aria-hidden="true"></i> Download Report </a>'

                        }
                    }

                    else if (full.applicationStatus.status == 'Approved by UCDG_Fin_Bus_Partner') {

                        if (full.progressReportComplete == false) {
                            actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewDetails(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> Open Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" class="linkViewPDF" onclick="viewPDF(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a>'

                        } else {
                            actionIconLinks = '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewDetails(' + full.fundingCalls.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Open Application Details"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                /* '<a style="color: #FF6400" id="' + full.referenceNumber + '" href="#"  onclick="awardLetter(' + full.referenceNumber + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> AwardLetter</a>&nbsp;&nbsp;' +*/
                                '<a style="color: #FF6400" id="openAwardPopUpl" href="#"  data-openAward = ' + `${JSON.stringify({ referenceNumber: full.referenceNumber, id: full.id, isAcknowledge: full.isAcknowledge, userId: full.user.userId })} `+ ' data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="View Award Letter"><i class="fa fa-envelope" aria-hidden="true"></i> Open Letter</a>&nbsp;&nbsp;|&nbsp;&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.id + '" href="#" onclick="viewPDF(' + full.id + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Application Details"><i class="fa fa-download" aria-hidden="true"></i> Download </a> &nbsp;|&nbsp;' +
                                '<a style="color: #FF6400" id="' + full.reportId + '" href="#" onclick="viewReportPDF(' + full.reportId + ')" data-toggle="modal" data-target="#postUdergraduateModal" id="true" title="Download Report Details"><i class="fa fa-download" aria-hidden="true"></i> Download Report </a>'

                        }

                    }

                    return actionIconLinks;
                }
            }
            
     
        ],
        //order: [[9, 'desc']],
        //columnDefs: [
        //    { targets: 9, type: 'datetime' },
        //    { targets: 10, type: 'datetime' }
        //],

        initComplete: function () {
            // pagination page from query (if any)
            const params = new URLSearchParams(window.location.search);
            const page = parseInt(params.get("page")) || 1;
            table.page(page - 1).draw('page');
        }
    });

}

function isProgressReportReminderExpired(fundingEndDate) {

    // Get the current date
    const currentDate = new Date();
    const currentFundingDate = new Date(fundingEndDate);
    // Get the current year
    const currentYear = currentDate.getFullYear();
    const _fundingEndDate = currentFundingDate.getFullYear();
    // Create a date object for January 15th of the current year
    const january15 = new Date(currentYear, 0, 16); // Month is 0-indexed (0 for January)
    // Compare the current date with January 15th
    if (_fundingEndDate < currentYear) {
        return currentDate < january15;
    }
    else {
        return true
    }
}

function loadApplicationDocuments(applicationId) {
    console.log("loadApplicationDocuments-applicationId: ", applicationId);
    $("#tblApplicationsDocumentsBody").empty();

    $("#tblApplicationsDocumentsBody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-2x fa-circle-o-notch fa-spin fa-fw"></i></td></tr>');
    $.ajax({
        type: "GET",
        url: '/Ucdp/MyApplications/GetDocsListByApplicationsId',
        contentType: "application/json; charset=utf-8",
        data: { "applicationsId": applicationId },
        datatype: "json",
        success: function (data) {
            $("#tblApplicationsDocumentsBody").empty();
            $("#tblApplicationsDocumentsBody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-2x fa-circle-o-notch fa-spin fa-fw"></i></td></tr>');
            console.log("GetApplications: ", data);
            //if (textStatus === "success" && xhr.status === 200) {
            if (data.length === 0) {
                $("#tblApplicationsDocumentsBody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>No record found.</strong></td></tr>");
            }

            var counter = 0;
            var link = ''

            $.each(data, function (index, item) {
                counter++;
                link = '<a href="#" class="btnViewOpenDoc action-buttons" documentId="' + item.id + '" data-toggle="modal" data-target="" title="View documents"><i class="fa fa-eye" aria-hidden="true"></i> View</a>&nbsp;&nbsp'
                $("#tblApplicationsDocumentsBody").append("<tr>" +
                    "<td>" + counter + "</td>" +
                    '<td>' + item.filename + '</td>' +
                    '<td>' + item.uploadType + '</td>' +
                    '<td>' + link + '</td>' +
                    "</tr > ");
            });

        },
        error: function () {
            toastr.error('Cannot Display Funding Information.', 'Error');
        }
    });
}

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
    $('#documentViewer').attr('src', blobUrl + "#toolbar=0&navpanes=0&scrollbar=0");
}

function openAwardPopUp(referenceNumber, applicationId, isAcknowledge, userId) {
    var formData = new FormData();
    formData.append("referenceNumber", referenceNumber);

    spinner.show();

    $.ajax({
        url: '/Ucdp/PDF/GetPDFDocument',
        type: "POST",
        contentType: false,
        processData: false,
        datatype: "json",
        data: formData,
        success: function (document) {

            spinner.hide();
          
            displayPDF(document);

            $('#footerDiv').html('');
            $("#DocumentViewer").css({
                "height": "100%",
            });

            if (!isAcknowledge) {
                $('#footerDiv').html('<p>I understand and accept the responsibilities as the grant holder as stipulated in this letter</p>' +
                    '<input id="ApplicantSigned" type="button" data-applicationId="' + applicationId + '"  data-openAward = ' + `${JSON.stringify({ applicationId: applicationId, referenceNumber: referenceNumber, userId: userId })} ` + '" class="btn btn-primary" value="Accept AwardLetter " style="width:250px; background-color:green; margin : 0 5px 0 5px;" /> ' +
                    '<input id="DeclineAwardletter" type="button"  data-openAward = ' + `${JSON.stringify({ applicationId: applicationId, referenceNumber: referenceNumber, userId: userId })} ` + ' class="btn btn-primary" value="Decline Awardletter" style="width:250px; background-color:red;margin : 0 5px 0 5px;" />'
                );
            }

            return;
        },
        error: function () {
            toastr.error('Cannot display document.', 'Error Message');
        }
    });
};

function loadComments(applicationId) {

    $("#tblCommentsBody").empty();
    $("#tblCommentsBody").append('<tr><td style="text-align:center" colspan="12"><i class="fa fa-2x fa-circle-o-notch fa-spin fa-fw"></i></td></tr>');
    $.ajax({
        type: "GET",
        url: 'Ucdp/MyApplications/GetCommentsListByApplicationsId',
        contentType: "application/json; charset=utf-8",
        data: { "applicationsId": applicationId },
        datatype: "json",
        success: function (data) {
            $("#tblCommentsBody").empty();

            if (data.length === 0) {
                $("#tblCommentsBody").append("<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>No record found.</strong></td></tr>");
            }

            var counter = 0;
            var link = ''
            data = JSON.parse(data);

            $.each(data, function (index, item) {
                counter++;
                console.log(item);
                $("#tblCommentsBody").append("<tr>" +
                    '<td>' + item.applications.referenceNumber + '</td>' +
                    "<td>" + item.applications.fundingCalls.fundingCallName + "</td>" +
                    '<td>' + item.user.username + '</td>' +
                    '<td>' + item.comment + '</td>' +
                    "</tr > ");
            });

        },
        error: function () {
            toastr.error('Cannot Display Funding Information.', 'Error');
        }
    });
}