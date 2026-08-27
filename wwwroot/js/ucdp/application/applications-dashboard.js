(function () {
    const basePath = (document.getElementById("appsDashboardRoot")?.dataset.basepath || "").trim().replace(/\/$/, "");
    const endpoints = {
        bootstrap: `UCDP/Applications/bootstrap`,
        refresh: `UCDP/Applications/admin/refresh-approvers`,
    };
    function getReturnUrlParam() {
        return encodeURIComponent(window.location.pathname + window.location.search);
    }
    const urls = {
        view: (id) => `Applications/Apply?applicationId=${id}&mode=view&returnUrl=${getReturnUrlParam()}`,
        edit: (id) => `Applications/Apply?applicationId=${id}&mode=edit&returnUrl=${getReturnUrlParam()}`,

        // “old world” routes you’re still using:
        downloadAppPdf: (id) => `Ucdp/MyApplications/CreatePdfDocument?applicationId=${id}`,
        returnForInfo: (id) => `Ucdp/Applications/ReturnForInfo?applicationId=${id}`,

        // reports
        createReport: (fundingCallId) => `Administration/CreateReport?fundingCallId=${fundingCallId}`,
        viewReport: (applicationId, fundingCallId) => `Administration/AdminViewReport?applicationId=${applicationId}&fundingCallId=${fundingCallId}`,
        downloadReportPdf: (applicationId) => `Administration/CreatePdfDocument?applicationId=${applicationId}`,
        docsList: (applicationId) => `MyApplications/GetDocsListByApplicationsId?applicationsId=${applicationId}`,
        viewApplicantReport: (applicationId, fundingCallId) => `Administration/ApplicantViewReport?applicationId=${applicationId}&fundingCallId=${fundingCallId}`,
    };

    function statusKey(r) {
        return (r.statusText || "").trim().toLowerCase();
    }

    function isReturnedForInfo(r) {
        return statusKey(r).includes("returned for info");
    }

    function isIncomplete(r) {
        return statusKey(r).includes("incomplete");
    }

    function isDeclined(r) {
        return statusKey(r) === "declined";
    }

    function isAwardAccepted(r) {
        return statusKey(r) === "award letter accepted";
    }

    function isAwardDeclined(r) {
        return statusKey(r) === "award letter declined";
    }

    function isApprovedFinal(r) {
        return statusKey(r) === "approved by ucdg_sia_director"
            || statusKey(r) === "approved by ucdg_fin_bus_partner";
    }

    // ✅ flip this to false when you're done testing
    const __forceProgressReportDueNow = true;

    function isProgressReportReminderExpired(fundingEndDate) {
        if (__forceProgressReportDueNow) return true; // always “expired/due now” for testing

        const currentDate = new Date();
        const currentFundingDate = new Date(fundingEndDate);
        const currentYear = currentDate.getFullYear();
        const fundingEndYear = currentFundingDate.getFullYear();

        const january16 = new Date(currentYear, 0, 16);

        if (fundingEndYear < currentYear) {
            return currentDate < january16;
        }
        return true;
    }
    function needsProgressReport(r) {
        return r.progressReportComplete === false && isProgressReportReminderExpired(r.fundingEndDate);
    }
    function escapeHtml(str) {
        return (str || "").replace(/[&<>"']/g, (s) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;",
        }[s]));
    }

    function fmtSortableDate(d) {
        if (!d) return "—";
        const dateObj = new Date(d);
        if (isNaN(dateObj)) return "—";

        const iso = dateObj.toISOString(); // keeps correct sorting
        const formatted = dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        return `<span data-order="${iso}">${formatted}</span>`;
    }

    const chkReq = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    function fmtRand(raw) {
        if (!raw) return "N/A";
        let s = String(raw).trim().replace(/\s/g, "");
        if (!s || s === "0") return "N/A";
        const num = Number(s.replace(/,/g, ""));
        if (isNaN(num)) return "N/A";
        return 'R' + chkReq.format(num);
    }

    function moneyOrderValue(raw) {
        if (raw === null || raw === undefined) return -1;
        let s = String(raw).trim();
        if (!s) return -1;
        s = s.replace(/\s/g, "").replace(/^R/i, "").replace(/,/g, "");
        const num = Number(s);
        if (!isFinite(num) || num === 0) return -1;
        return num;
    }

    function fmtSortableRand(raw) {
        const order = moneyOrderValue(raw);
        const display = fmtRand(raw);
        return `<span data-order="${order}">${display}</span>`;
    }
    function asBool(v) {
        if (v === true) return true;
        if (v === false) return false;
        if (v === 1 || v === "1") return true;
        if (typeof v === "string") return v.toLowerCase() === "true";
        return false;
    }

    let __historyRaw = [];
    let __historyMe = null;

    function applyHistoryFilterAndRender() {
        if ($.fn.DataTable.isDataTable("#tblHistory")) {
            $("#tblHistory").DataTable().clear().destroy();
        }

        const filtered = __historyRaw || [];

        $("#countHistory").text(filtered.length);
        renderDashboardRows($("#tbodyHistory"), filtered, __historyMe, "history");

        initOrReinitTable("#tblHistory", 7);
    }

    // Build action buttons per tab + role
    function renderActionsCompact(tab, me, r) {
        const actions = actionsForRow(tab, me, r);
        if (!actions.length) return "";


        const html = actions.map(a => {
            if (a.kind === "link") {
                const isDisabled = a.disabled === true;
                const href = isDisabled ? "#" : a.href(r);
                const shouldShowLoading =
                    a.id === "downloadApp" ||
                    a.id === "downloadReport" 

                return `
              <a class="btn btn-sm btn-outline-primary ${isDisabled ? "disabled" : ""}"
                 href="${href}"
                 data-show-loading="${shouldShowLoading}"
                 title="${escapeHtml(a.label)}">
                 <i class="${a.icon}"></i>
              </a>`;
            }

            const extra =
                a.id === "awardLetter"
                    ? `data-ref="${escapeHtml(r.referenceNumber || "")}"
                   data-appid="${r.id}"
                   data-ack="${r.isAcknowledge ? "1" : "0"}"
                   data-userid="${escapeHtml(String(r.userId || ""))}"`
                    : a.id === "reportComments"
                        ? `data-reportid="${escapeHtml(String(r.reportId || ""))}"`
                        : "";

            const rowJson = escapeHtml(JSON.stringify(r));

            return `
                      <button class="btn btn-sm btn-outline-primary"
                              type="button"
                              data-action="${a.id}"
                              data-id="${r.id}"
                              data-row='${rowJson}'
                              ${extra}
                              title="${escapeHtml(a.label)}">
                          <i class="${a.icon}"></i>
                      </button>`;
        }).join("");

        return `<div class="d-inline-flex gap-1 justify-content-end">${html}</div>`;
    }



    function splitProjects(project) {
        if (!project) return [];
        return String(project)
            .replace(/<br\s*\/?>/gi, "\n")
            .split(/\r?\n|,\s*/)
            .map((p) => p.trim())
            .filter(Boolean);
    }

    function pick(obj, ...keys) {
        for (const k of keys) {
            if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
        }
        return null;
    }

    const actionDefs = {
        view: {
            id: "view",
            label: "Open Application Details",
            icon: "bi bi-eye",
            kind: "link",
            href: (r) => urls.view(r.id),
        },
        edit: {
            id: "edit",
            label: "Edit",
            icon: "bi bi-pencil",
            kind: "link",
            href: (r) => urls.edit(r.id),
        },
        downloadApp: {
            id: "downloadApp",
            label: "Download Application Details",
            icon: "bi bi-download",
            kind: "link",
            href: (r) => urls.downloadAppPdf(r.id),
        },

        comments: {
            id: "comments",
            label: "View Comments",
            icon: "bi bi-chat-dots",
            kind: "button",
        },

        reportComments: {
            id: "reportComments",
            label: "Progress Report Comments",
            icon: "bi bi-chat-dots",
            kind: "button",
        },

        declineReason: {
            id: "declineReason",
            label: "Decline reason",
            icon: "bi bi-chat-left-quote",
            kind: "button",
        },

        awardLetter: {
            id: "awardLetter",
            label: "View Award Letter",
            icon: "bi bi-envelope",
            kind: "button",
        },

        createReport: {
            id: "createReport",
            label: "Create Report",
            icon: "bi bi-file-earmark-plus",
            kind: "link",
            href: (r) => urls.createReport(r.fundingCallId),
        },
        viewReport: {
            id: "viewReport",
            label: "View Report",
            icon: "bi bi-file-earmark-text",
            kind: "link",
            href: (r) => urls.viewReport(r.id, r.fundingCallId),
        },
        downloadReport: {
            id: "downloadReport",
            label: "Download Report",
            icon: "bi bi-download",
            kind: "link",
            href: (r) => urls.downloadReportPdf(r.id),
        },
        viewApplicantReport: {
            id: "viewApplicantReport",
            label: "View Progress Report",
            icon: "bi bi-file-earmark-text",
            kind: "link",
            href: (r) => urls.viewApplicantReport(r.id, r.fundingCallId),
        },
        documents: {
            id: "documents",
            label: "View documents",
            icon: "bi bi-file-earmark",
            kind: "button",
        },
        openOutstandingReport: {
            id: "openOutstandingReport",
            label: "Open Outstanding Report",
            icon: "bi bi-file-earmark-text",
            kind: "link",
            href: (r) => urls.createReport(r.outstandingPreviousReportFundingCallId),
        },
    };
    function actionsForRow(tab, me, r) {
        // ATTENTION TAB
        if (tab === "attention") {
            const list = [actionDefs.view];

            const waitingForMe = (r.awaitingStaffNumber && me?.staffNumber)
                ? String(r.awaitingStaffNumber).trim() === String(me.staffNumber).trim()
                : true;

            return list;
        }

        // HISTORY TAB
        if (tab === "history") return [actionDefs.view];

        // MINE TAB
        if (tab === "mine") {

            const blockedByOutstandingPreviousReport =
                r.hasOutstandingPreviousReport && r.outstandingPreviousReportApplicationId;

            // 1) INCOMPLETE
            if (isIncomplete(r)) {
                if (blockedByOutstandingPreviousReport) {
                    return [actionDefs.openOutstandingReport];
                }

                return [actionDefs.edit];
            }

            // 2) RETURNED FOR INFO
            if (isReturnedForInfo(r)) {
                if (blockedByOutstandingPreviousReport) {
                    return [actionDefs.openOutstandingReport, actionDefs.comments, actionDefs.downloadApp];
                }

                return [actionDefs.edit, actionDefs.comments, actionDefs.downloadApp];
            }

            // 3) DECLINED
            if (isDeclined(r)) {
                return [actionDefs.view, actionDefs.declineReason, actionDefs.downloadApp];
            }

            // 4) APPROVED FINAL / AWARD STATES
            if (isApprovedFinal(r) || isAwardAccepted(r) || isAwardDeclined(r)) {
                const list = [actionDefs.view, actionDefs.awardLetter, actionDefs.downloadApp];
                if (window.progressReportClosed) {
                    return list;
                }
                if (isAwardAccepted(r)) {
                    if (r.reportId && isFinalizedReport(r)) {
                        list.push(actionDefs.viewApplicantReport);
                    } else {
                        list.push(actionDefs.createReport);
                    }
                }

                if (r.reportId) {
                    list.push(actionDefs.downloadReport);
                    list.push(actionDefs.reportComments);
                }

                return list;
            }

            // DEFAULT
            return [actionDefs.view, actionDefs.downloadApp];
        }

        return [actionDefs.view];
    }
    function normalizeRow(r) {
        const row = {
            id: r.id,
            referenceNumber: r.referenceNumber,
            fundingCallName: pick(r, "fundingCallName", "FundingCallName"),
            project: pick(r, "project", "Project"),
            dhetRequestedAmount: pick(r, "dhetRequestedAmount", "dHETRequestedAmount", "DHETRequestedAmount"),
            dhetApprovedAmount: pick(r, "dhetApprovedAmount", "dHETApprovedAmount", "DHETApprovedAmount"),
            submittedBy: pick(r, "submittedBy", "SubmittedBy"),
            submittedDate: pick(r, "submittedDate", "SubmittedDate"),
            endDate: pick(r, "endDate", "EndDate"),
            statusId: r.statusId,
            statusText: pick(r, "statusText", "StatusText"),
            currentApproverStaffNumber: pick(r, "currentApproverStaffNumber", "CurrentApproverStaffNumber"),
            applicantStaffNumber: pick(r, "applicantStaffNumber", "ApplicantStaffNumber"),

            awaitingStaffNumber: pick(r, "awaitingStaffNumber", "AwaitingStaffNumber"),
            awaitingName: pick(r, "awaitingName", "AwaitingName"),
            awaitingStage: pick(r, "awaitingStage", "AwaitingStage"),
            awaitingDisplay: pick(r, "awaitingDisplay", "AwaitingDisplay"),

            hasTemporaryApprover: pick(r, "hasTemporaryApprover", "HasTemporaryApprover") === true,
            isTemporaryApproverForThis: pick(r, "isTemporaryApproverForThis", "IsTemporaryApproverForThis") === true,
            temporaryApproverStaffNumber: pick(r, "temporaryApproverStaffNumber", "TemporaryApproverStaffNumber"),
            temporaryApproverName: pick(r, "temporaryApproverName", "TemporaryApproverName"),
            temporaryApproverDisplay: pick(r, "temporaryApproverDisplay", "TemporaryApproverDisplay"),

            isInMyCurrentTeam: asBool(pick(r, "isInMyCurrentTeam", "IsInMyCurrentTeam")),
            isActionedByMe: asBool(pick(r, "isActionedByMe", "IsActionedByMe")),
            isInSiaLaneHistory: asBool(pick(r, "isInSiaLaneHistory", "IsInSiaLaneHistory")),

            lastActionDisplay: pick(r, "lastActionDisplay", "LastActionDisplay"),

            progressReportComplete: asBool(pick(r, "progressReportComplete", "ProgressReportComplete")),
            fundingEndDate: pick(r, "fundingEndDate", "FundingEndDate"),
            reportId: pick(r, "reportId", "ReportId"),
            isAcknowledge: asBool(pick(r, "isAcknowledge", "IsAcknowledge")),
            userId: pick(r, "userId", "UserId", "ApplicantUserStoreUserId"),
            fundingCallId: pick(r, "fundingCallId", "FundingCallsId", "fundingCallsId"),
            numberOfDocuments: Number(pick(r, "numberOfDocuments", "NumberOfDocuments") ?? 0),
            filterBucket: null,
            progressReportStatusId: pick(r, "progressReportStatusId", "ProgressReportStatusId"),
            progressReportStatus: pick(r, "progressReportStatus", "ProgressReportStatus"),
            hasOutstandingPreviousReport: asBool(pick(r, "hasOutstandingPreviousReport", "HasOutstandingPreviousReport")),
            outstandingPreviousReportApplicationId: pick(r, "outstandingPreviousReportApplicationId", "OutstandingPreviousReportApplicationId"),
            outstandingPreviousReportFundingCallId: pick(r, "outstandingPreviousReportFundingCallId", "OutstandingPreviousReportFundingCallId")
        };
        row.filterBucket = getFilterBucket(row);
        return row;
    }

    function initOrReinitTable(tableSelector, defaultSortColIndex) {
        const $t = $(tableSelector);

        if ($.fn.DataTable.isDataTable($t)) {
            $t.DataTable().destroy();
        }

        return $t.DataTable({
            paging: true,
            pageLength: 10,
            lengthChange: false,
            info: true,
            searching: true,
            dom: "rt<'d-flex justify-content-between align-items-center mt-2'ip>",
            order: [[defaultSortColIndex, "desc"]],
            autoWidth: false,
            columnDefs: [
                { targets: defaultSortColIndex, type: "date" }
            ],
            language: { emptyTable: "No records found" }
        });
    }
    function displayStatus(tab, r) {
        let baseText = "";

        if (r.awaitingDisplay) baseText = r.awaitingDisplay;
        else if (tab === "attention" && (r.awaitingName || r.awaitingStaffNumber)) {
            const who = r.awaitingName || r.awaitingStaffNumber;
            const stage = r.awaitingStage ? ` (${r.awaitingStage})` : "";
            baseText = `Awaiting ${who}${stage}`;
        } else {
            baseText = r.statusText || ("Status " + r.statusId);
        }

        const last = r.lastActionDisplay
            ? `<div class="text-muted small mt-1">${escapeHtml(r.lastActionDisplay)}</div>`
            : "";

        return `
        <div>
            <div>${escapeHtml(baseText)}</div>
            ${renderProgressReportBadge(r)}
            ${renderTempBadge(r)}
            ${last}
        </div>
    `;
    }

    function renderDashboardRows($tbody, rows, me, tab) {
        $tbody.empty();
        if (!rows || rows.length === 0) return;

        const includeDocs = (tab === "mine"); // ✅ only Mine table has Documents column

        rows.forEach((raw, i) => {
            const r = normalizeRow(raw);

            const projects = splitProjects(r.project);
            const projectHtml = projects.length
                ? `<ul class="mb-0 ps-3">${projects.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>`
                : "—";

            const dateHtml = fmtSortableDate(r.submittedDate || r.endDate);
            const requested = fmtSortableRand(r.dhetRequestedAmount);
            const approved = fmtSortableRand(r.dhetApprovedAmount);

            const status = displayStatus(tab, r);
            const actions = renderActionsCompact(tab, me, r);

            const docsCount = Number(r.numberOfDocuments || 0);
            const docsHtml = `
              <button type="button"
                      class="btn btn-sm btn-outline-primary"
                      data-action="documents"
                      data-id="${r.id}"
                      data-doccount="${docsCount}"
                      title="View attached documents">
                  <i class="bi bi-file-earmark"></i> ${docsCount}
              </button>`;

            window.__rowById = window.__rowById || {};
            window.__rowById[r.id] = r;
            const searchMeta = `
                    <span class="d-none">
                        ${escapeHtml(r.filterBucket || "")}
                        ${escapeHtml(r.statusText || "")}
                        ${escapeHtml(r.awaitingDisplay || "")}
                        ${escapeHtml(r.awaitingStage || "")}
                        ${escapeHtml(r.awaitingName || "")}
                    </span>`;

            $tbody.append(`
                <tr data-rowid="${r.id}">
                    <td>${i + 1}</td>
                    <td class="fw-semibold">${escapeHtml(r.referenceNumber || "")}</td>
                    <td>${escapeHtml(r.fundingCallName || "—")}</td>
                    <td>${projectHtml}</td>
                    <td>${requested}</td>
                    <td>${approved}</td>
                    <td>${escapeHtml(r.submittedBy || "—")}</td>
                    <td>${dateHtml}</td>
                    ${includeDocs ? `<td>${docsHtml}</td>` : ``}
                    <td>${searchMeta}${status}</td>
                    <td class="text-end">${actions}</td>
                </tr>
            `);
        });
    }

    function hideAttentionTab() {
        $("#tab-attention").closest("li").remove();
        $("#pane-attention").remove();
    }

    function hideHistoryTab() {
        $("#tab-history").closest("li").remove();
        $("#pane-history").remove();
    }

    function hideMineTab() {
        $("#tab-mine").closest("li").remove();
        $("#pane-mine").remove();
    }

    function activateFirstVisibleTab() {
        const $firstTab = $("#appsTabs .nav-link").first();
        if (!$firstTab.length) return;

        const target = $firstTab.attr("data-bs-target") || $firstTab.attr("href");
        if (!target) return;

        $("#appsTabs .nav-link")
            .removeClass("active")
            .attr("aria-selected", "false");

        $(".tab-pane").removeClass("show active");

        const tab = bootstrap.Tab.getOrCreateInstance($firstTab[0]);
        tab.show();
    }

    function showRefreshResultModal(res) {
        $("#rr_considered").text(res?.considered ?? 0);
        $("#rr_updated").text(res?.updated ?? 0);
        $("#rr_stillStuck").text(res?.stillStuck ?? 0);

        const failureCounts = res?.failureCounts || {};
        const failures = Array.isArray(res?.failures) ? res.failures : [];

        const hasFailureCounts = Object.keys(failureCounts).length > 0;
        const hasFailures = failures.length > 0;

        $("#rr_failureCounts").empty();
        $("#rr_failuresTable").empty();
        $("#rr_failuresSection").hide();
        $("#rr_noFailures").hide();

        if (!hasFailureCounts && !hasFailures) {
            $("#rr_noFailures").show();
        } else {
            $("#rr_failuresSection").show();

            if (hasFailureCounts) {
                const sorted = Object.entries(failureCounts)
                    .sort((a, b) => (b[1] || 0) - (a[1] || 0));

                for (const [reason, count] of sorted) {
                    $("#rr_failureCounts").append(
                        `<li><strong>${escapeHtml(reason)}</strong>: ${count}</li>`
                    );
                }
            } else {
                $("#rr_failureCounts").append(`<li class="text-muted">No counts provided.</li>`);
            }

            if (hasFailures) {
                for (const f of failures) {
                    const ref = f?.referenceNumber ?? "";
                    const status = f?.statusText ?? "";
                    const reason = f?.reason ?? "";
                    const ownerNo = f?.desiredOwnerStaffNumber ?? "";
                    const ownerName = f?.desiredOwnerName ?? "";
                    const detail = f?.detail ?? "";

                    const ownerDisplay = ownerName
                        ? `${ownerNo ? escapeHtml(ownerNo) + " - " : ""}${escapeHtml(ownerName)}`
                        : escapeHtml(ownerNo);

                    $("#rr_failuresTable").append(`
          <tr>
            <td>${escapeHtml(ref || "—")}</td>
            <td>${escapeHtml(status || "—")}</td>
            <td>${escapeHtml(reason || "—")}</td>
            <td>${ownerDisplay || "—"}</td>
            <td>${escapeHtml(detail || "—")}</td>
          </tr>
        `);
                }
            } else {
                $("#rr_failuresTable").append(`
        <tr><td colspan="5" class="text-muted">No failure examples provided.</td></tr>
      `);
            }
        }

        const modalEl = document.getElementById("refreshApproversModal");
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
    function renderTempBadge(r) {
        if (!r || !r.hasTemporaryApprover) return "";

        const text = r.temporaryApproverDisplay
            ? r.temporaryApproverDisplay
            : (r.isTemporaryApproverForThis
                ? "You are the temporary approver"
                : ("Temporary approver assigned"
                    + (r.temporaryApproverName || r.temporaryApproverStaffNumber
                        ? `: ${r.temporaryApproverName || r.temporaryApproverStaffNumber}`
                        : "")));

        const cls = r.isTemporaryApproverForThis ? "bg-info text-dark" : "bg-warning text-dark";

        return `
    <div class="mt-1">
      <span class="badge ${cls}">${escapeHtml(text)}</span>
    </div>
  `;
    }

    window.showLoading = function () {
        $('#dashLoadingModal').removeClass('d-none');
    };

    window.hideLoading = function () {
        $('#dashLoadingModal').addClass('d-none');
    };
    async function getJson(url, method) {
        showLoading();

        try {
            return await $.ajax({ url, method: method || "GET" });
        } finally {
            hideLoading();
        }
    }
    function registerDashboardFilters() {
        $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter(function (fn) {
            return !fn.__dashboardFilter;
        });

        const dashboardFilter = function (settings, data, dataIndex) {
            const tableId = settings.nTable.getAttribute("id");
            if (!tableId) return true;

            const prefix = tableId.replace("tbl", "");
            const searchValue = ($(`#q${prefix}`).val() || "").trim().toLowerCase();
            const statusValue = ($(`#status${prefix}`).val() || "all").trim();

            const api = new $.fn.dataTable.Api(settings);
            const rowNode = api.row(dataIndex).node();
            if (!rowNode) return true;

            const rowId = $(rowNode).data("rowid");

            const raw = window.__rowById?.[rowId];
            const r = raw ? normalizeRow(raw) : null;

            if (!r) return true;

            const searchableText = [
                r.referenceNumber,
                r.fundingCallName,
                r.project,
                r.submittedBy,
                r.statusText,
                r.awaitingDisplay,
                r.awaitingStage,
                r.awaitingName,
                r.filterBucket
            ].filter(Boolean).join(" ").toLowerCase();

            if (searchValue && !searchableText.includes(searchValue)) {
                return false;
            }

            if (statusValue !== "all" && r.filterBucket !== statusValue) {
                return false;
            }

            return true;
        };

        dashboardFilter.__dashboardFilter = true;
        $.fn.dataTable.ext.search.push(dashboardFilter);
    }
    function bindDashboardFilterEvents(prefix) {
        $(document)
            .off(`click.apply${prefix}`, `#btnApply${prefix}`)
            .on(`click.apply${prefix}`, `#btnApply${prefix}`, function () {
                if ($.fn.DataTable.isDataTable(`#tbl${prefix}`)) {
                    $(`#tbl${prefix}`).DataTable().draw();
                }
            });

        $(document)
            .off(`click.clear${prefix}`, `#btnClear${prefix}`)
            .on(`click.clear${prefix}`, `#btnClear${prefix}`, function () {
                $(`#q${prefix}`).val("");
                $(`#status${prefix}`).val("all");

                if ($.fn.DataTable.isDataTable(`#tbl${prefix}`)) {
                    $(`#tbl${prefix}`).DataTable().search("").draw();
                }
            });

        $(document)
            .off(`keydown.search${prefix}`, `#q${prefix}`)
            .on(`keydown.search${prefix}`, `#q${prefix}`, function (e) {
                if (e.key === "Enter" && $.fn.DataTable.isDataTable(`#tbl${prefix}`)) {
                    e.preventDefault();
                    $(`#tbl${prefix}`).DataTable().draw();
                }
            });

        $(document)
            .off(`change.status${prefix}`, `#status${prefix}`)
            .on(`change.status${prefix}`, `#status${prefix}`, function () {
                if ($.fn.DataTable.isDataTable(`#tbl${prefix}`)) {
                    $(`#tbl${prefix}`).DataTable().draw();
                }
            });
        $(document)
            .off(`input.searchLive${prefix}`, `#q${prefix}`)
            .on(`input.searchLive${prefix}`, `#q${prefix}`, function () {
                clearTimeout(this._dashboardSearchTimer);

                this._dashboardSearchTimer = setTimeout(() => {
                    if ($.fn.DataTable.isDataTable(`#tbl${prefix}`)) {
                        $(`#tbl${prefix}`).DataTable().draw();
                    }
                }, 250);
            });
    }

    function renderProgressReportBadge(r) {
        if (!isAwardAccepted(r)) return "";

        const statusId = Number(r.progressReportStatusId || 0);

        if (!r.reportId) {
            return `<div class="report-chip report-required">
                <i class="bi bi-exclamation-circle"></i>
                Report required
            </div>`;
        }

        if (statusId === 2) {
            return `<div class="report-chip report-done">
                <i class="bi bi-check-circle"></i>
                Report finalised
            </div>`;
        }

        if (r.progressReportComplete === true && statusId !== 2) {
            return `<div class="report-chip report-done">
                <i class="bi bi-check-circle"></i>
                Report submitted
            </div>`;
        }

        if (statusId === 3) {
            return `<div class="report-chip report-rfi">
                <i class="bi bi-arrow-repeat"></i>
                Report returned for info
            </div>`;
        }

        return `<div class="report-chip report-progress">
            <i class="bi bi-pencil"></i>
            Report incomplete
        </div>`;
    }
    function isFinalizedReport(r) {
        return Number(r.progressReportStatusId || 0) === 2 || r.progressReportComplete === true;
    }

    async function loadAll() {
        const data = await getJson(endpoints.bootstrap);

        const me = data?.me;
        if (!me || !me.staffNumber) return;

        const showApproverTabs = me.showApproverTabs ?? me.ShowApproverTabs ?? false;
        const hasTeamHistory = me.hasTeamHistory ?? me.HasTeamHistory ?? false;
        const canApply = me.canApply ?? me.CanApply ?? true;
        window.progressReportClosed = data.progressReportClosed;

        if (window.progressReportClosed) {

            const message = `
                            <div class="alert alert-warning mb-3" id="progressReportClosedMessage">
                                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                Progress report submissions are currently closed.
                            </div>`;

            if (!$("#progressReportClosedMessage").length) {
                $("#appsDashboardRoot").prepend(message);
            }
        }
        if (!showApproverTabs) {
            hideAttentionTab();
            $("#countAttention").text("0");
        }

        if (!hasTeamHistory) {
            hideHistoryTab();
            $("#countHistory").text("0");
            __historyRaw = [];
        }

        if (!canApply) {
            hideMineTab();
        }

        if (canApply && $("#tblMine").length) {
            const mine = data?.mine || [];
            $("#countMine").text(mine.length);
            renderDashboardRows($("#tbodyMine"), mine, me, "mine");
            initOrReinitTable("#tblMine", 7);
        } else {
            $("#countMine").text("0");
        }

        if (showApproverTabs && $("#tblAttention").length) {
            const inbox = data?.inbox || [];
            $("#countAttention").text(inbox.length);
            renderDashboardRows($("#tbodyAttention"), inbox, me, "attention");
            initOrReinitTable("#tblAttention", 7);
        } else {
            $("#countAttention").text("0");
        }

        if (hasTeamHistory && $("#tblHistory").length) {
            const history = data?.history || [];
            __historyMe = me;
            __historyRaw = history;
            applyHistoryFilterAndRender();
        } else {
            $("#countHistory").text("0");
            __historyRaw = [];
        }

        setTimeout(function () {
            activateFirstVisibleTab();
            $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
        }, 0);
    }
    function base64ToBlob(base64, mime) {
        const byteChars = atob(base64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        return new Blob([new Uint8Array(byteNumbers)], { type: mime });
    }

    function displayAwardPDF(base64PDF) {
        const blob = base64ToBlob(base64PDF, "application/pdf");
        const blobUrl = URL.createObjectURL(blob);
        $("#awardLetterViewer").attr("src", blobUrl + "#toolbar=0&navpanes=0&scrollbar=0");
    }

    async function openAwardPopUp(referenceNumber, applicationId, isAcknowledge, userId) {
        try {
            showLoading();

            // clear old state
            $("#awardLetterFooter").empty();
            $("#awardLetterViewer").attr("src", "about:blank");

            // fetch PDF (base64) - match your legacy endpoint
            const formData = new FormData();
            formData.append("referenceNumber", referenceNumber);

            const pdfBase64 = await $.ajax({
                url: `Ucdp/PDF/GetPDFDocument`,
                type: "POST",
                contentType: false,
                processData: false,
                data: formData
            });

            displayAwardPDF(pdfBase64);

            // inject accept/decline buttons only if not acknowledged yet
            if (!isAcknowledge) {
                const payload = { applicationId, referenceNumber, userId };

                $("#awardLetterFooter").html(`
        <div class="alert alert-info mb-0">
          I understand and accept the responsibilities as the grant holder as stipulated in this letter.
        </div>

        <div class="d-flex flex-wrap gap-2">
          <button id="ApplicantSigned"
                  type="button"
                  class="btn btn-primary"
                  data-openaward='${JSON.stringify(payload).replace(/'/g, "&#39;")}'>
            Accept Award Letter
          </button>

          <button id="DeclineAwardletter"
                  type="button"
                  class="btn btn-secondary"
                  data-openaward='${JSON.stringify(payload).replace(/'/g, "&#39;")}'>
            Decline Award Letter
          </button>
        </div>
      `);
            }

            // show modal
            bootstrap.Modal.getOrCreateInstance(document.getElementById("awardLetterModal")).show();
        } catch (e) {
            console.error("Award popup failed", e);
            toastr.error("Cannot display award letter.");
        } finally {
            hideLoading();
        }
    }

    function fillAppDetailsHeader(r) {
        const ref = r.referenceNumber || "";
        $("#appDetailsRef").text(`Ref: ${ref}`);

        $("#appDetailsApplicant").text(r.submittedBy || "—");

        $("#appDetailsStage").text(r.awaitingDisplay || r.awaitingStage || "—");

        const dt = r.submittedDate || r.endDate;
        $("#appDetailsSubmitted").text(dt ? new Date(dt).toLocaleDateString("en-GB") : "—");

        $("#appDetailsStatus").text(r.statusText || "—");
    }

    function showAppDetailsOffcanvas(r) {
        fillAppDetailsHeader(r);

        // reset comments section UI
        $("#appDetailsCommentsTitle").text("Comments");
        $("#appDetailsCommentsMeta").text("—");
        $("#appDetailsCommentsList").empty();
        $("#appDetailsCommentsEmpty").addClass("d-none").text("No comments found.");
        $("#appDetailsCommentsLoading").addClass("d-none");

        bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("appDetails")).show();
    }

    function getFilterBucket(r) {
        const status = (r.statusText || "").trim().toLowerCase();
        const awaitingDisplay = (r.awaitingDisplay || "").trim().toLowerCase();
        const awaitingStage = (r.awaitingStage || "").trim().toLowerCase();

        if (status.includes("incomplete")) return "incomplete";
        if (status.includes("returned for info")) return "returned-for-info";
        if (status === "declined") return "declined";
        if (status === "award letter accepted") return "award-accepted";
        if (status === "award letter declined") return "award-declined";
        if (status === "expired offer") return "expired-offer";
        if (status === "approved by ucdg_sia_director" || status === "approved by ucdg_fin_bus_partner") {
            return "approved-final";
        }

        if (awaitingDisplay.includes("award letter decision")) return "awaiting-award-letter";
        if (awaitingStage === "firstlinemanager" || awaitingDisplay.includes("first line manager")) return "awaiting-first-line";
        if (awaitingStage === "secondlinemanager" || awaitingDisplay.includes("second line manager")) return "awaiting-second-line";
        if (awaitingStage === "fundadmin" || awaitingDisplay.includes("fund administrator")) return "awaiting-fund-admin";
        if (awaitingStage === "siadirector" || awaitingDisplay.includes("sia director")) return "awaiting-sia";

        return "other";
    }

    async function openApplicationComments(r) {
        showAppDetailsOffcanvas(r);

        $("#appDetailsCommentsTitle").text("Application Comments");
        $("#appDetailsCommentsMeta").text(`Reference no.: ${r.referenceNumber}`);

        $("#appDetailsCommentsLoading").removeClass("d-none");

        try {
            const data = await $.ajax({
                type: "GET",
                url: `Ucdp/MyApplications/GetCommentsListByApplicationsId`,
                data: { applicationsId: r.id }
            });

            const list = (typeof data === "string") ? JSON.parse(data) : data;

            $("#appDetailsCommentsLoading").addClass("d-none");

            if (!list || list.length === 0) {
                $("#appDetailsCommentsEmpty").removeClass("d-none");
                return;
            }
            list.forEach(item => {
                const who = item?.displayName || item?.username || item?.user?.username || "—";
                const text = item?.comment || "";

                $("#appDetailsCommentsList").append(`
                    <div class="fb-comment">
                        <div class="fb-comment-body">
                            <div class="fb-comment-author">${escapeHtml(who)}</div>
                            <div class="fb-comment-text">${escapeHtml(text)}</div>
                        </div>
                    </div>
                `);
            });
        } catch (e) {
            console.error(e);
            $("#appDetailsCommentsLoading").addClass("d-none");
            $("#appDetailsCommentsEmpty").removeClass("d-none").text("Failed to load comments.");
        }
    }

    async function openProgressReportComments(r, reportId) {
        showAppDetailsOffcanvas(r);

        const rid = reportId || r.reportId;

        $("#appDetailsCommentsTitle").text("Progress Report Comments");
        $("#appDetailsCommentsMeta").text(`Reference no: ${r.referenceNumber}`);

        if (!rid) {
            $("#appDetailsCommentsEmpty").removeClass("d-none").text("No report exists for this application yet.");
            return;
        }

        $("#appDetailsCommentsLoading").removeClass("d-none");

        try {
            const data = await $.ajax({
                type: "GET",
                url: `Administration/GetCommentsByReportId/`,
                data: { reportId: rid }
            });

            const list = (typeof data === "string") ? JSON.parse(data) : data;

            $("#appDetailsCommentsLoading").addClass("d-none");

            if (!list || list.length === 0) {
                $("#appDetailsCommentsEmpty").removeClass("d-none");
                return;
            }
            list.forEach(item => {
                const who = item?.displayName || item?.addedBy || "—";
                const text = item?.comment ?? item?.Comment ?? "";

                $("#appDetailsCommentsList").append(`
                    <div class="fb-comment">
                        <div class="fb-comment-body">
                            <div class="fb-comment-author">${escapeHtml(who)}</div>
                            <div class="fb-comment-text">${escapeHtml(text)}</div>
                        </div>
                    </div>
                `);
            });
        } catch (e) {
            console.error(e);
            $("#appDetailsCommentsLoading").addClass("d-none");
            $("#appDetailsCommentsEmpty").removeClass("d-none").text("Failed to load report comments.");
        }
    }

    async function openDeclineReason(r) {
        showAppDetailsOffcanvas(r);
        $("#appDetailsCommentsTitle").text("Decline Reason");
        $("#appDetailsCommentsMeta").text(`Application ID: ${r.id}`);
        return openApplicationComments(r);
    }

    async function openApplicationDocuments(r) {
        $("#openAttachedDocumentListModal").modal("show");
        $("#tblApplicationsDocumentsBody").empty().append(`
    <tr><td style="text-align:center" colspan="12">
      <i class="fa fa-2x fa-circle-o-notch fa-spin fa-fw"></i>
    </td></tr>`);

        try {
            const data = await $.ajax({
                type: "GET",
                url: `Ucdp/MyApplications/GetDocsListByApplicationsId`,
                data: { applicationsId: r.id }
            });

            const list = (typeof data === "string") ? JSON.parse(data) : data;

            $("#tblApplicationsDocumentsBody").empty();

            if (!list || list.length === 0) {
                $("#tblApplicationsDocumentsBody").append(
                    "<tr><td style='text-align:center;vertical-align:middle' colspan='5'><strong>No record found.</strong></td></tr>"
                );
                return;
            }

            let counter = 0;
            list.forEach(item => {
                counter++;
                const filename = item?.filename ?? item?.Filename ?? "";
                const uploadType = item?.uploadType ?? item?.UploadType ?? "";
                const docId = item?.id ?? item?.Id;
                const link = `
        <a href="#"
           class="btnViewOpenDoc action-buttons btn btn-outline-primary"
           documentId="${escapeHtml(String(docId || ""))}"
           title="View document">
           <i class="bi bi-eye" aria-hidden="true"></i>
        </a>`;

                $("#tblApplicationsDocumentsBody").append(`
        <tr>
          <td>${counter}</td>
          <td>${escapeHtml(filename)}</td>
          <td>${escapeHtml(uploadType)}</td>
          <td>${link}</td>
        </tr>
      `);
            });

        } catch (e) {
            console.error(e);
            toastr.error("Cannot display documents.", "Error");
        }
    }

    $(document).on("click", "#btnRefreshApprovers", async function () {
        const $btn = $(this).prop("disabled", true).text("Refreshing...");
        try {
            const res = await getJson(endpoints.refresh, "POST");
            showRefreshResultModal(res);
            await loadAll();
        } catch (e) {
            console.error(e);
            alert("Refresh failed (check API logs).");
        } finally {
            $btn.prop("disabled", false).text("Refresh Active Approver Assignments");
        }
    });


    $(document).on("click", "[data-action]", function () {
        const actionId = $(this).data("action");
        const id = $(this).data("id");

        const r = normalizeRow(window.__rowById?.[id] || { id }); // fallback

        switch (actionId) {
            case "comments":
                return openApplicationComments(r);

            case "declineReason":
                return openDeclineReason(r);

            case "reportComments": {
                const reportId = $(this).data("reportid"); // ✅ from renderActionsCompact
                return openProgressReportComments(r, reportId);
            }

            case "awardLetter": {
                const ref = $(this).data("ref");
                const appId = $(this).data("appid");
                const ack = $(this).data("ack") === 1 || $(this).data("ack") === "1";
                const userId = $(this).data("userid");
                return openAwardPopUp(ref, appId, ack, userId);
            }

            case "documents": {
                const count = Number($(this).data("doccount") || 0);
                if (count === 0) {
                    toastr.error("No documents.", "Error");
                    return;
                }
                return openApplicationDocuments(r);
            }
        }
    });

    $(document).on("click", "a[data-show-loading='true']", function () {
        showLoading();

        setTimeout(function () {
            hideLoading();
        }, 3000);
    });

    $(document).ready(function () {
        registerDashboardFilters();
        bindDashboardFilterEvents("Attention");
        bindDashboardFilterEvents("Mine");
        bindDashboardFilterEvents("History");
        loadAll();
    });
})();
