$(document).ready(function () {

    var applicationId = '@Model.Id';

    GetPayments(applicationId);
    GetAppointees(applicationId);
    GetResearchCareerPayments(applicationId);



    var previousFundingYear = '@Model.PreviousFundingYear';
    if (previousFundingYear !== "") {
        $("#previousFunding").val("Yes");
        $('#divPreviousFundInfo').show();
    } else {
        $('#divPreviousFundInfo').hide();
        $("#previousFunding").val("No");
    }

    var year = new Date().getFullYear()

    var enddate = new Date(year, 12, 0);
    var startdate = new Date(year, 0, 01);

    $('#FundingStartDate').datepicker({ minDate: startdate, maxDate: enddate });
    $('#FundingEndDate').datepicker({ minDate: 0, maxDate: enddate });
    //$('#FirstYearRegistration').datepicker();
    //$('#PlannedGraduationYear').datepicker();




    var model = '@Html.Raw(Json.Serialize(Model.SelectedProjects))';
    var data = JSON.parse(model);

    var projectsavailable = '@Html.Raw(Json.Serialize(Model.FundingCallDetails.FundingCallProjects))';
    var projectdata = JSON.parse(projectsavailable);

    var appointmentVal = '@Model.AppointmentCategory';  //Permanant
    var applicantVal = '@Model.ApplicantCategory';

    for (var i = 0; i < projectdata.length; i++) {

        if (model !== 'null') {
            for (var x = 0; x < data.length; x++) {
                if (data[x].projectId == projectdata[i].id) {

                    $('#' + data[x].projectId + '').prop('checked', true);
                    stepArray.push(parseInt(data[x].projectId));

                    //For  Project Display Purpose

                    if (data[x].projectId == '1') {
                        if (improvementStaffCheckBox.style.display === "none") {
                            improvementStaffCheckBox.style.display = "block";
                            //stepArray.push(parseInt(data[x].projectId));

                            if (showStep1 == false) {
                                displayStep3();
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
                            //stepArray.push(parseInt(data[x].projectId));

                            if (showStep2 == false) {
                                displayStep4();
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

                    if (data[x].projectId == '3') {
                        if (improvingResearchCheckBox.style.display === "none") {
                            improvingResearchCheckBox.style.display = "block";
                            //stepArray.push(parseInt(data[x].projectId));

                            if (showStep3 == false) {
                                displayStep5();
                                showStep3 = true;
                            }

                        } else {
                            improvingResearchCheckBox.style.display = "none";
                            var removeItem = data[x].projectId;
                            stepArray = $.grep(stepArray, function (value) {
                                return value != removeItem;
                            });
                        }
                    }

                    if (data[x].projectId == '4') {
                        if (supervisionDevelopmentCheckBox.style.display === "none") {
                            supervisionDevelopmentCheckBox.style.display = "block";
                            //stepArray.push(parseInt(data[x].projectId));

                            if (showStep4 == false) {
                                displayStep6();
                                showStep4 = true;
                            }

                        } else {
                            supervisionDevelopmentCheckBox.style.display = "none";
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
                                displayStep7();
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

                    if (data[x].projectId == '6') {
                        if (promotingPostGraduateCheckBox.style.display === "none") {
                            promotingPostGraduateCheckBox.style.display = "block";
                            //stepArray.push(parseInt(data[x].projectId));

                            if (showStep6 == false) {
                                displayStep8();
                                showStep6 = true;
                            }

                        } else {
                            promotingPostGraduateCheckBox.style.display = "none";
                            var removeItem = data[x].projectId;

                            stepArray = $.grep(stepArray, function (value) {
                                return value != removeItem;
                            });
                        }
                    }

                    if (data[x].projectId == '7' || data[x].projectId == '9' || data[x].projectId == '11') {
                        if (supportingDocsCheckBox.style.display === "none") {
                            supportingDocsCheckBox.style.display = "block";
                            //stepArray.push(parseInt(inputValue));

                            if (showStep7 == false) {
                                displayStep9();
                                showStep7 = true;
                            }

                        } else {
                            supportingDocsCheckBox.style.display = "none";

                            var removeItem = inputValue;
                            stepArray = $.grep(stepArray, function (value) {
                                return value != removeItem;
                            });
                        }
                    }
                }
            }
        }

    }


    if (applicantVal.trim() == 'Registered For Doctoral') {

        $('input:radio[name="targetGroup"][value="Registered For Doctoral"]').prop('checked', true);
    }

    if (applicantVal.trim() == 'Registered For Master') {

        $('input:radio[name="targetGroup"][value="Registered For Master"]').prop('checked', true);
    }

    if (applicantVal.trim() == 'Emerging Researcher') {

        $('input:radio[name="targetGroup"][value="Emerging Researcher"]').prop('checked', true);
    }

    if (applicantVal.trim() == 'Emerging Supervisor') {

        $('input:radio[name="targetGroup"][value="Emerging Supervisor"]').prop('checked', true);
    }

    if (applicantVal.trim() == 'Active Researchers') {

        $('input:radio[name="targetGroup"][value="Active Researchers"]').prop('checked', true);
    }

    if (appointmentVal.trim() == 'Permanent') {

        $('input:radio[name="appointmentGroup"][value="Permanent"]').prop('checked', true);
    }

    if (appointmentVal.trim() == 'Fixed Term Contract') {

        $('input:radio[name="appointmentGroup"][value="Fixed Term Contract"]').prop('checked', true);
    }




    var supportReq = '@Html.Raw(Json.Serialize(Model.SupportRequired))';
    var dataSupportReq = JSON.parse(supportReq);

    var supportReqResearchTeaching = '@Html.Raw(Json.Serialize(Model.CareerTeachingRelief))';
    var dataSupportReqResearchTeaching = JSON.parse(supportReqResearchTeaching);

    var supportReqResearchFinancial = '@Html.Raw(Json.Serialize(Model.CareerFinancialSupport))';
    var dataSupportReqResearchFinancial = JSON.parse(supportReqResearchFinancial);


    describevalue = '@Model.Describe';
    supportRequired = '@Model.supportRequiredItem';
    appointOption = '@Model.appointmentItem';
    financialsupportvalue = '@Model.financialSupportItem';
    careerfinancialsupport = '@Model.careerFinancialSupportItem';
    careerteachingrelief = '@Model.careerTeachingReliefItem';
    targetGroupValue = '@Model.AppointmentCategory';
    appointmentGroupValue = '@Model.ApplicantCategory';
    studying = '@Model.StudyingTowards';
    financialmotivation = '@Model.FinancialMotivation';
    applicantprogress = '@Model.ApplicantProgress';
    outputmeasure = '@Model.OutputMeasure';
    var costcentre = '@Model.CostCentreName';
    var costcentrenumber = '@Model.CostCentreNumber';

    //Describe TextBox
    $("#Describe").val(describevalue.replace('&#x27;', "'")
        .replace('&lt;', "<")
        .replace('&gt;', ">")
        .replace('&quot;', '"')
        .replace('&#39;', "'")
        .replace('&#x2F;', "/"));

    $("#costcentrename").val(costcentre.replace(/amp;/g, ''));
    $("#costcentrenumber").val(costcentrenumber);

    //Financial Motivation
    $('#Motivation').val(financialmotivation.replace('&#x27;', "'")
        .replace('&lt;', "<")
        .replace('&gt;', ">")
        .replace('&quot;', '"')
        .replace('&#39;', "'")
        .replace('&#x2F;', "/"));


    //Progress Of Application TextBox
    $('#ProgressOfApplication').val(applicantprogress.replace('&#x27;', "'")
        .replace('&lt;', "<")
        .replace('&gt;', ">")
        .replace('&quot;', '"')
        .replace('&#39;', "'")
        .replace('&#x2F;', "/"));


    //State The Measurable TextBox
    $('#StateTheMeasurable').val(outputmeasure.replace('&#x27;', "'")
        .replace('&lt;', "<")
        .replace('&gt;', ">")
        .replace('&quot;', '"')
        .replace('&#39;', "'")
        .replace('&#x2F;', "/"));



    if (studying.trim() == 'Doctoral degree') {
        $("#StudyingTowards").val('Doctoral degree');
    }
    if (studying.trim() == 'Master degree') {

        $("#StudyingTowards").val('Master degree');
    }

    if (supportReqResearchTeaching.length > 6) {

        var supportReqList = [];

        supportReqList = dataSupportReqResearchTeaching[0].split(',');

        for (var i = 0; i < supportReqList.length; i++) {
            if (supportReqList[i] == '@SupportRequiredEnum.ReplacementByTemporaryLecturer.GetDescription()') {

                $('#TeachingReplacementCheckBox').prop('checked', true);
                $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
                $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
                //teachingReliefDocUploaded = true;
                researchteachingReliefDocUploaded = true;
                TeachingReliefArr.push(supportReqList[i]);
            }

            if (supportReqList[i] == '@SupportRequiredEnum.TeachingAssistance.GetDescription()') {

                $('#TeachingAssistanceCheckBox').prop('checked', true);
                $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
                $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
                //teachingReliefDocUploaded = true;

                researcAssitanceReliefDocUploaded = true;

                TeachingReliefArr.push(supportReqList[i]);
            }

            if (supportReqList[i] == '@SupportRequiredEnum.TeachingTutor.GetDescription()') {

                $('#TeachingCareerAssistanceMarkerCheckBox').prop('checked', true);
                $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
                $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
                //teachingReliefDocUploaded = true;

                researchCareerReliefDocUploaded = true;

                TeachingReliefArr.push(supportReqList[i]);
            }

            if (supportReqList[i] == '@SupportRequiredEnum.Lecturer.GetDescription()') {

                $('#TeachingLecturerCheckBox').prop('checked', true);
                $("#ResearchTeachingReliefDocumentsLink").css("display", "block");
                $("#ResearchTeachingReliefDocuments").css("visibility", "visible");
                //teachingReliefDocUploaded = true;

                researchLecturerReliefDocUploaded = true;

                TeachingReliefArr.push(supportReqList[i]);
            }
        }

    }

    if (supportReqResearchFinancial.length > 6) {
        console.log(supportReqResearchFinancial.split(','));
        var supportReqListFinancial = [];
        supportReqListFinancial = dataSupportReqResearchFinancial[0].split(',');

        for (var i = 0; i < supportReqListFinancial.length; i++) {
            if (supportReqListFinancial[i] == '@SupportRequiredEnum.DHETAccredited.GetDescription()') {
                $('#DHETFinancialSupportCheckBox').prop('checked', true);
                researchdhetFinancialSupportUploaded = true;
                CareerFinancialsupportArr.push(supportReqListFinancial[i]);
            }

            if (supportReqListFinancial[i] == '@SupportRequiredEnum.ResearchDevelopmentWorkshops.GetDescription()') {

                $('#ResearchFinancialSupportCheckBox').prop('checked', true);
                researchWorkshopFinancialSupportUploaded = true;
                //CareerFinancialsupportArr.length = 0;
                CareerFinancialsupportArr.push(supportReqListFinancial[i]);
            }


        }

    }

    if (supportReq.length > 6) {
        var supportist = [];
        supportist = dataSupportReq[0].split(',');

        for (var i = 0; i < supportist.length; i++) {

            if (supportist[i] == '@SupportRequiredEnum.TeachingRelief.GetDescription()') {

                $('#TeachingReliefCheckBox').prop('checked', true);
                $("#ReliefDocumentsLink").css("display", "block");
                $("#ReliefDocuments").css("visibility", "visible");
                teachingReliefDocUploaded = true;
                SupportRequired.push(supportist[i]);
                console.log(SupportRequired);
            }

            if (supportist[i] == '@SupportRequiredEnum.ResearchAssistance.GetDescription()') {

                $('#ResearchAssistanceCheckBox').prop('checked', true);

                $("#ResearchAssistanceLink").css("display", "block");
                $("#ResearchAssistance").css("visibility", "visible");
                researchDocUploaded = true;
                SupportRequired.push(supportist[i]);
                console.log(SupportRequired);
            }

            if (supportist[i] == '@SupportRequiredEnum.FinancialSupport.GetDescription()') {


                $('#FinancialSupportCheckBox').prop('checked', true);

                $("#FinancialSupportLink").css("display", "block");
                $("#FinancialSupportDoc").css("visibility", "visible");
                financialsupportDocUploaded = true;
                SupportRequired.push(supportist[i]);

            }
        }
    }

    if (financialsupportvalue.trim() == 'Writing for publication retreat') {
        $('#publicationWritingCheckBox').prop('checked', true);
        Financialsupport.length = 0;
        Financialsupport.push(financialsupportvalue.trim());
    }

    if (financialsupportvalue.trim() == 'Individual writing consultations with research specialists') {
        $('#individualWritingCheckBox').prop('checked', true);
        Financialsupport.length = 0;
        Financialsupport.push(financialsupportvalue.trim());
    }


    //Support Required
    if (appointOption.trim() == 'Master and doctoral studies') {

        $('#StaffAppointmentStudiesCheckBox').prop('checked', true);
        AppointmentOption.length = 0;
        AppointmentOption.push(appointOption.trim());
        document.getElementById("AppointmentDescriptionDiv").style.display = "none";
    }
    if (appointOption.trim() == 'Research associates collaboration') {
        $('#StaffAppointmentCollaborationCheckBox').prop('checked', true);
        AppointmentOption.length = 0;
        AppointmentOption.push(appointOption.trim());
        document.getElementById("AppointmentDescriptionDiv").style.display = "none";
    }
    if (appointOption.trim() == 'Emerging researchers') {
        $('#StaffAppointmentEmergingCheckBox').prop('checked', true);
        AppointmentOption.length = 0;
        AppointmentOption.push(appointOption.trim());
        document.getElementById("AppointmentDescriptionDiv").style.display = "none";
    }
    if (appointOption.trim() == 'Active researchers') {
        $('#StaffAppointmentActiveCheckBox').prop('checked', true);
        AppointmentOption.length = 0;
        AppointmentOption.push(appointOption.trim());
        document.getElementById("AppointmentDescriptionDiv").style.display = "none";
    }
    if (appointOption.trim() == 'Supervision, mentoring and coaching') {
        $('#StaffAppointmentSupervisionCheckBox').prop('checked', true);
        AppointmentOption.length = 0;
        AppointmentOption.push(appointOption.trim());
        document.getElementById("AppointmentDescriptionDiv").style.display = "none";
    }
    if (appointOption.trim() == 'Research development workshops – consultants/facilitators') {
        $('#StaffAppointmentResearchCheckBox').prop('checked', true);
        AppointmentOption.length = 0;
        AppointmentOption.push(appointOption.trim());
        document.getElementById("AppointmentDescriptionDiv").style.display = "none";
    }

    if (stepArray.includes(1)) {

        if (appointOption.trim() == 'Staff Appointment Other') {

            console.log(stepArray);
            $('#StaffAppointmentOtherCheckBox').prop('checked', true);
            AppointmentOption.length = 0;
            AppointmentOption.push(appointOption.trim());  //AppointmentDescribe

            document.getElementById("AppointmentDescriptionDiv").style.display = "block";
            $("#AppointmentDescriptionDiv").css("visibility", "visible");
            otherDescribe = '@Model.AppointmentDescribe';

            $('#AppointmentDescribe').val(otherDescribe);

        }
    }


    $("input:radio[type=radio][name='targetGroup']").click(function () {
        targetGroupValue = $(this).val();
    });

    $(document).ready(function () {
        $("input:radio[type=radio][name='appointmentGroup']").click(function () {
            appointmentGroupValue = $(this).val();

        });
    });


    function GetResearchCareerPayments(applicationId) {
        $.ajax({
            type: "GET",
            url: '@Url.Action("GetCareerPayments", "Applications")',
            data: { applicationId: applicationId },
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {

                for (var s = 0; s < result.length; s++) {

                    var txtStudyType = $("#txtStudyTypeStep4");
                    var txtStudyTypeVal = result[s].Type;


                    var txtHrsPerWeek = $("#txtHrsPerWeekStep4");
                    var txtHrsPerWeekVal = result[s].HoursPerWeek;

                    var txtNumberOfWeeks = $("#txtNumberOfWeeksStep4");
                    var txtNumberOfWeeksVal = result[s].NumberOfWeeks;

                    var txtNumberOfHours = $("#txtNumberOfHoursStep4");
                    var txtNumberOfHoursVal = result[s].TotalNumberOfHours;

                    var txtUJRatePerHr = $("#txtUJRatePerHrStep4");
                    var txtUJRatePerHrVal = result[s].RatePerHour;



                    var tBody = $("#tblPaymentsStep4 > TBODY")[0];

                    var row = tBody.insertRow(0);



                    //Add txtStudyType cell.
                    var cell = $(row.insertCell(-1));
                    cell.html(txtStudyTypeVal);


                    //Add txtNumberOfWeeks cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtNumberOfWeeksVal);

                    //Add txtHrsPerWeek cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtHrsPerWeekVal);

                    //Add txtNumberOfHours cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtNumberOfHoursVal);

                    //Add txtUJRatePerHr cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtUJRatePerHrVal);



                }

            },
            error: function (response) {
                toastr.error(response, 'Error Message');
            }
        });
    }

    function GetAppointees(applicationId) {
        $.ajax({
            type: "GET",
            url: '@Url.Action("GetAppointees", "Applications")',
            data: { applicationId: applicationId },
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {

                for (var s = 0; s < result.length; s++) {

                    var txtName = $("#txtName");
                    var txtNameVal = result[s].Name;
                    var txtSurname = $("#txtSurname");
                    var txtSurnameVal = result[s].Surname;
                    var txtEmailAddress = $("#txtEmailAddress");
                    var txtEmailAddressVal = result[s].EmailAddress;
                    var txtNumber = $("#txtNumber");
                    var txtNumberVal = result[s].ContactNumber;
                    var txtEndDateVal = new Date(result[s].EndDate);
                    var txtIDNumber = $("#txtValidateIDNumber");


                    var idNumber = result[s].IdNumber ?? "";

                    const maskedIdNumber =
                        idNumber && idNumber.trim() !== "" && idNumber.length > 4
                            ? "*******"
                            : idNumber;

                    var txtIDNumberVal = result[s].IdNumber;


                    var txtStatus = $("#txtValidateStatus");
                    var txtStatusVal = result[s].StaffStatus;


                    var tBody = $("#tblAppointees > TBODY")[0];

                    var row = tBody.insertRow(-1);

                    //Add Surname cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtSurnameVal);

                    //Add Name cell.
                    var cell = $(row.insertCell(-1));
                    cell.html(txtNameVal);

                    //Add txtEmailAddress cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtEmailAddressVal);

                    //Add txtNumber cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtNumberVal);

                    //Add txtStatus cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtStatusVal);

                }

            },
            error: function (response) {
                toastr.error(response, 'Error Message');
            }
        });
    }

    function GetPayments(applicationId) {
        $.ajax({
            type: "GET",
            url: '@Url.Action("GetPayments", "Applications")',
            data: { applicationId: applicationId },
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {

                for (var s = 0; s < result.length; s++) {

                    var txtStudyType = $("#txtStudyType");
                    var txtStudyTypeVal = result[s].Type;

                    var txtNumberOfWeeks = $("#txtNumberOfWeeks");
                    var txtNumberOfWeeksVal = result[s].NumberOfWeeks;

                    var txtNumberOfHours = $("#txtNumberOfHours");
                    var txtNumberOfHoursVal = result[s].TotalNumberOfHours;

                    var txtUJRatePerHr = $("#txtUJRatePerHr");
                    var txtUJRatePerHrVal = result[s].RatePerHour;



                    var tBody = $("#tblPayments > TBODY")[0];

                    var row = tBody.insertRow(0);

                    //Add txtStudyType cell.
                    var cell = $(row.insertCell(-1));
                    cell.html(txtStudyTypeVal);

                    //Add txtNumberOfWeeks cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtNumberOfWeeksVal);

                    //Add txtNumberOfHours cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtNumberOfHoursVal);

                    //Add txtUJRatePerHr cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtUJRatePerHrVal);

                    //Add txtMonthTotal cell.
                    cell = $(row.insertCell(-1));
                    cell.html(txtMonthTotalVal);

                }

            },
            error: function (response) {
                toastr.error(response, 'Error Message');
            }
        });
    }

});