function ClosePopupModel(model) {
    $('#' + model).modal('hide');
    $('#' + model).removeData('bs.modal');
    $('body').removeClass('modal-open');
    $('body').css('padding-right', '0px');
    $('.modal-backdrop').remove();
    $('#' + model + ' form')[0].reset();
}


