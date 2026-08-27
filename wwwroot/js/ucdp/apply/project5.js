$(function () {
    if (!$("#MobilityProgrammesTab").length) return;
    bindProject5Events();
});

function bindProject5Events() {
    $(".nextBtnMobility")
        .off("click.project5")
        .on("click.project5", function (e) {
            e.preventDefault();

            if (isReadOnlyMode()) {
                goToNextStep("MobilityProgrammesTab");
                return false;
            }
            if (!validateProject5Documents()) {
                return;
            }

            goToNextStep("MobilityProgrammesTab");
        });

    $(".backBtnMobility")
        .off("click.project5")
        .on("click.project5", function (e) {
            e.preventDefault();

            if (isReadOnlyMode()) {
                goToPreviousStep("MobilityProgrammesTab");
                return false;
            }

            goToPreviousStep("MobilityProgrammesTab");
        });
}

function validateProject5Documents() {
    const requiredTables = [
        {
            tableId: "ListofProject5ProofOfInvitationFiles",
            label: "Proof of invitation"
        },
        {
            tableId: "ListofProject5TotalCostBreakdownFiles",
            label: "Total cost breakdown"
        }
    ];

    for (const doc of requiredTables) {
        const existingCount = $("#" + doc.tableId + " tbody tr[data-existing='true']").length;
       // const stagedCount = getStagedUploadsForTable(doc.tableId).length;

        if (existingCount === 0) {
            toastr.error(`${doc.label} document is required.`, "Error Message");
            return false;
        }
    }

    return true;
}