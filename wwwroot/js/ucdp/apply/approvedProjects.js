$(document).ready(function () {


    var model = (document.getElementById('SelectedProjectsDiv')).dataset.selectedprojectsData;
    var data = JSON.parse(model);

    var projectsavailable = (document.getElementById('FundingCallProjectsDiv')).dataset.fundingcalldetailsData;

    var projectdata = JSON.parse(projectsavailable);


    var improvementStaffCheckBox = document.getElementById("ImprovementStaffDiv");
    var researchCareerCheckBox = document.getElementById("ResearchCareerDiv");
    var mobilityProgrammesCheckBox = document.getElementById("MobilityProgrammesDiv");

    if (model !== 'null') {
        data.forEach((item, i) => {
            totalSteps.push(item);
        });
    }


    for (var i = 0; i < projectdata.length; i++) {

        if (model !== 'null') {
            for (var x = 0; x < data.length; x++) {
                if (data[x].projectId == projectdata[i].id) {

                    $('#project_' + data[x].projectId + '').prop('checked', true);
                    stepArray.push(parseInt(data[x].projectId));

                    //For  Project Display Purpose

                    if (data[x].projectId == '1') {
                        if (improvementStaffCheckBox.style.display === "none") {
                            improvementStaffCheckBox.style.display = "block";
                            // stepArray.push(parseInt(data[x].projectId));

                            if (showStep1 == false) {
                                //displayStep3();
                                showStep1 = true;
                            }

                        } else {
                            improvementStaffCheckBox.style.display = "none";

                            var removeItem = data[x].projectId;
                            stepArray = $.grep(stepArray, function (value) {
                                return value != removeItem;
                            });
                        }
                    }

                    if (data[x].projectId == '2') {
                        if (researchCareerCheckBox.style.display === "none") {
                            researchCareerCheckBox.style.display = "block";
                            // stepArray.push(parseInt(data[x].projectId));

                            if (showStep2 == false) {
                                // displayStep4();
                                showStep2 = true;
                            }

                        } else {
                            researchCareerCheckBox.style.display = "none";
                            var removeItem = data[x].projectId;

                            stepArray = $.grep(stepArray, function (value) {
                                return value != removeItem;
                            });
                        }
                    }

                    if (data[x].projectId == '5') {
                        if (mobilityProgrammesCheckBox.style.display === "none") {
                            mobilityProgrammesCheckBox.style.display = "block";
                            //stepArray.push(parseInt(data[x].projectId));

                            if (showStep5 == false) {
                                // displayStep7();
                                showStep5 = true;
                            }

                        } else {
                            mobilityProgrammesCheckBox.style.display = "none";
                            var removeItem = data[x].projectId;

                            stepArray = $.grep(stepArray, function (value) {
                                return value != removeItem;
                            });
                        }
                    }



                }
            }
        }

    }

   

    $('input[type="checkbox"]').click(function () {
        var inputValue = $(this).val();

        //For  Project Display Purpose
        var improvementStaffCheckBox = document.getElementById("ImprovementStaffDiv");
        var researchCareerCheckBox = document.getElementById("ResearchCareerDiv");
        var mobilityProgrammesCheckBox = document.getElementById("MobilityProgrammesDiv");

        if (inputValue == '1') {
            if (improvementStaffCheckBox.style.display === "none") {
                improvementStaffCheckBox.style.display = "block";
                stepArray.push(parseInt(inputValue));

                if (showStep1 == false) {
                    //displayStep3();               
                    showStep1 = true;
                }

            } else {
                improvementStaffCheckBox.style.display = "none";

                var removeItem = inputValue;
                stepArray = $.grep(stepArray, function (value) {
                    return value != removeItem;
                });
            }
        }

        if (inputValue == '2') {

            if (researchCareerCheckBox.style.display === "none") {
                researchCareerCheckBox.style.display = "block";
                //$($(researchCareerCheckBox).children('a').attr("href")).css("display", "block");

                stepArray.push(parseInt(inputValue));

                if (showStep2 == false) {
                    //displayStep4();
                    showStep2 = true;
                }

            } else {
                researchCareerCheckBox.style.display = "none";
              // $($(researchCareerCheckBox).children('a').attr("href")).css("display", "none");           

                var removeItem = inputValue;

                stepArray = $.grep(stepArray, function (value) {
                    return value != removeItem;
                });
            }
        }

        if (inputValue == '5') {
            if (mobilityProgrammesCheckBox.style.display === "none") {
                mobilityProgrammesCheckBox.style.display = "block";
                stepArray.push(parseInt(inputValue));

                if (showStep5 == false) {
                    // displayStep7();
                    showStep5 = true;
                }

            } else {
                mobilityProgrammesCheckBox.style.display = "none";
                var removeItem = inputValue;

                stepArray = $.grep(stepArray, function (value) {
                    return value != removeItem;
                });
            }
        }



    });

    $("#btnSaveProjects").on("click", function (e) {      

        if (isReadOnlyMode()) {
            window.goToNextStep("ApproveTab");
            return false;   
        }

        if (stepArray.length == 0) {
            toastr.error("Please select at least one project", 'Error Message');
            return;
        }
        var $saveBtn = $(this);
                
        var formData = new FormData();
        formData.append("UserId", $("#UserId").val());
        formData.append("FundingCallDetailsId", $("#FundingCallDetailsId").val());
        formData.append("Id", $("#Id").val());
        formData.append('ProjectId[]', stepArray);
        showLoading();
        $.ajax({
            url: '/Applications/ApproveProjects',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                hideLoading();
                if (data.status === "Saved") {

                    toastr.success("Project Selection Saved Successfully", 'Success Message');

                    var curStep = $saveBtn.closest(".setup-content");
                    var curStepBtnId = curStep.attr("id");
                    window.goToNextStep(curStepBtnId);
                }
                else {
                    e.preventDefault();
                    toastr.error("Error Occured while Saving Project Selection", 'Error Message');
                }
            },
        });
        
       
    });

    $("#btnBack").on("click", function () {
        var curStep = $(this).closest(".setup-content");
        var curStepBtnId = curStep.attr("id");
        window.goToPreviousStep(curStepBtnId);
    });

});
