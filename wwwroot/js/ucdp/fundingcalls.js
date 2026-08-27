$(document).ready(function () {

    $('#btnOk').click(function () {

        var Id = $(".modal-body #fundingId").val();
        document.location = '@Url.Action("Apply", "Applications")?fundingCallId=' + Id;
    });




        //function getDetails(id) {
        //    $('#myDisclaimer').modal("show");
        //    $(".modal-body #fundingId").val(id);
        //}
        //function viewDetails(id) {

        //    $(".modal-body #fundingId").val(id);
        //    var Id = $(".modal-body #fundingId").val();

        //    document.location = '@Url.Action("ViewApplicationDetails", "Applications")?fundingCallId=' + Id;
        //}


     
        $('[data-toggle="tooltip"]').tooltip();
   
        //@if (ViewBag.Message != null) {
        //    @: toastr.success("@ViewBag.Message");
        //}

        document.addEventListener("DOMContentLoaded", function () {
            var message = document.body.dataset.message;
            if (message) {
                toastr.success(message);
            }
        });

        $('#OpeningDateFilter').datepicker();
        $('#ClosingDateFilter').datepicker();
 

});