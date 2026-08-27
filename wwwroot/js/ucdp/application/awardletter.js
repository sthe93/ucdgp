$(document.body).on("click", "#ApplicantSigned", function () {
    const oWObj = $(this).data("openaward");
    const postData = { ReferenceNumber: oWObj.referenceNumber, UserId: oWObj.userId, Id: oWObj.applicationId };
    const basePath = (document.getElementById("appsDashboardRoot")?.dataset.basepath || "").trim().replace(/\/$/, "");
    
    showLoading();
    $.post(`${basePath}/Ucdp/PDF/CreateSignature`, postData)
        .done(() => location.reload())
        .always(() => hideLoading());
});

$(document.body).on("click", "#DeclineAwardletter", function () {
    const oWObj = $(this).data("openaward");
    const postData = { ReferenceNumber: oWObj.referenceNumber, UserId: oWObj.userId, Id: oWObj.applicationId };
    const basePath = (document.getElementById("appsDashboardRoot")?.dataset.basepath || "").trim().replace(/\/$/, "");
    
    showLoading();
    $.post(`${basePath}/Ucdp/PDF/DecliningAward`, postData)
        .done(() => location.reload())
        .always(() => hideLoading());
});

