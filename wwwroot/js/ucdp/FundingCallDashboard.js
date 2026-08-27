$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-bs-toggle="tooltip"]').tooltip();

    initDatePickers();
    initProjectDropdown();

    function initDatePickers() {
        if (typeof flatpickr !== "undefined") {
            flatpickr(".datepicker", {
                dateFormat: "d M Y",
                allowInput: true
            });
        }
    }

    function initProjectDropdown() {
        $("#ProjectName").select2({
            width: "100%",
            placeholder: "All projects",
            allowClear: true
        });
    }

    const target = document.getElementById("searchcallname");
    if (target && typeof target.focus === "function") {
        target.focus();
    }
    function loadFundingCallsList(url) {
        const requestUrl = url || "/UCDP/FilterFundingCalls";
        const selectedProjectValue = $("#ProjectName").val();
        const searchcallname = $.trim($("#searchcallname").val()) || null;
        const openingDateFilter = $("#OpeningDateFilter").val();
        const closingDateFilter = $("#ClosingDateFilter").val();

        const $container = $("#fundingCallDashboardTable");

        console.log("show loader");
        showLoader();

        $.ajax({
            url: requestUrl,
            type: "GET",
            cache: false,
            data: {
                search: searchcallname,
                projectname: selectedProjectValue,
                OpeningDateFilter: openingDateFilter,
                ClosingDateFilter: closingDateFilter
            },
            timeout: 30000
        }).done(function (html) {
                console.log("ajax done");
                $container.html(html);
            })
            .fail(function (xhr, status, error) {
                console.log("ajax fail", status, error, xhr?.responseText);
                console.error("Failed to load funding calls:", { status, error, xhr });
            })
            .always(function () {
                console.log("ajax always hide loader");
                setTimeout(function () {
                    hideLoader();
                }, 50);
            });
    }

    let loaderInstance = null;

    function showLoader() {
        const modalEl = document.getElementById("loadingModal");
        if (!modalEl) return;

        loaderInstance = bootstrap.Modal.getOrCreateInstance(modalEl, {
            backdrop: "static",
            keyboard: false,
            focus: false
        });

        modalEl.blur();
        document.activeElement?.blur?.();

        loaderInstance.show();
    }

    function hideLoader() {
        const modalEl = document.getElementById("loadingModal");
        if (!modalEl) return;

        // Move focus away from the modal before hiding
        if (document.activeElement && modalEl.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        // Force focus onto body/html temporarily
        if (document.body) {
            document.body.setAttribute("tabindex", "-1");
            document.body.focus();
        }

        const modal = loaderInstance || bootstrap.Modal.getInstance(modalEl);
        if (modal) {
            modal.hide();
        }

        // hard cleanup for stuck modal/backdrop state
        setTimeout(function () {
            modalEl.classList.remove("show");
            modalEl.style.display = "none";
            modalEl.setAttribute("aria-hidden", "true");
            modalEl.removeAttribute("aria-modal");
            modalEl.removeAttribute("role");

            document.body.classList.remove("modal-open");
            document.body.style.removeProperty("overflow");
            document.body.style.removeProperty("padding-right");

            document.querySelectorAll(".modal-backdrop").forEach(function (el) {
                el.remove();
            });
        }, 100);
    }

    $("#clearFilterBtn").on("click", function () {
        $("#searchcallname").val("");
        $("#OpeningDateFilter").val("");
        $("#ClosingDateFilter").val("");
        $("#ProjectName").val("").trigger("change");
        loadFundingCallsList();
    });

    $("#btnSearchFunding").on("click", function (e) {
        e.preventDefault();
        loadFundingCallsList();
    });

    $("#searchcallname").on("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            loadFundingCallsList();
        }
    });

    //$(document).on("click", ".pagination a", function (e) {
    //    e.preventDefault();

    //    const url = $(this).attr("href");
    //    if (!url) return;

    //    loadFundingCallsList(url);
    //});

    function getReturnUrl() {
        return encodeURIComponent(window.location.pathname + window.location.search);
    }

    function getBasePath() {
        return (window.config && window.config.basePath) ? window.config.basePath : "";
    }

    function buildApplyUrl(fundingCallId) {
        return getBasePath() + "/Applications/Apply?fundingCallId=" + encodeURIComponent(fundingCallId) + "&returnUrl=" + getReturnUrl();
    }

    function buildViewDetailsUrl(applicationId) {
        return getBasePath() + "/Applications/Apply?applicationId=" + encodeURIComponent(applicationId) + "&mode=view&returnUrl=" + getReturnUrl();
    }
    function openDisclaimerModal(id, actionType) {
        if (!id) return;

        $("#fundingId").val(id);
        $("#disclaimerActionType").val(actionType);

        const modalEl = document.getElementById("myDisclaimer");
        if (!modalEl) {
            console.error("Modal #myDisclaimer not found");
            return;
        }

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }

    $(document).on("click", ".apply-btn", function (e) {
        e.preventDefault();
        openDisclaimerModal($(this).data("id"), "apply");
    });

    $(document).on("click", ".btn-continue-application", function (e) {
        e.preventDefault();
        openDisclaimerModal($(this).data("id"), "continue");
    });

    $(document).on("click", ".btn-view-application-details", function (e) {
        e.preventDefault();
        const applicationId = $(this).data("application-id");
        if (!applicationId) return;

        window.location.href = buildViewDetailsUrl(applicationId);
    });

    $(document).on("click", "#btnOk", function () {
        const id = $("#fundingId").val();
        const actionType = $("#disclaimerActionType").val();

        if (!id || !actionType) return;

        if (actionType === "apply" || actionType === "continue") {
            window.location.href = buildApplyUrl(id);
            return;
        }

        if (actionType === "view") {
            window.location.href = buildViewDetailsUrl(id);
        }
    });
});