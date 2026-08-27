$(document).ready(function () {
    initFundingCallsPage();

    function initFundingCallsPage() {
        initTooltips();
        initDatePickers();
        initProjectSelect();
        initFundingCallsTable();
        initSystemClosure();
    }

    function initTooltips() {
        $('[data-bs-toggle="tooltip"]').tooltip();
    }

    function initDatePickers() {
        flatpickr(".filter-datepicker", {
            dateFormat: "d M Y",
            allowInput: true
        });

        flatpickr(".datepicker", {
            dateFormat: "d M Y",
            allowInput: true,
            minDate: "today"
        });
    }

    function initProjectSelect() {
        $('.select2').select2({
            width: '100%',
            placeholder: "Select one or more options",
            allowClear: true
        });
    }

    function initFundingCallsTable() {
        const tableId = '#fundingCallsTable';

        if (!$(tableId).length) return;

        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
        }

        $(tableId).DataTable({
            paging: true,
            searching: true,
            ordering: true,
            info: true,
            pageLength: 10,
            autoWidth: false,
            lengthMenu: [10, 25, 50, 100],
            order: [[2, 'desc']],
            columnDefs: [
                { targets: 0, width: '40px', orderable: false },
                { targets: 1, width: '24%' },
                { targets: [2, 3, 4], width: '120px' },
                { targets: 5, width: '120px' },
                { targets: 6, width: '170px', orderable: false, searchable: false }
            ],
            language: {
                search: 'Filter table:',
                emptyTable: 'No funding calls found.',
                zeroRecords: 'No matching funding calls found.'
            }
        });
    }

    $('#btnSearchFundingCall').on('click', function (e) {
        e.preventDefault();
        loadFundingCalls();
    });

    $('#btnClearFundingCallFilters').on('click', function (e) {
        e.preventDefault();

        $('#searchcallname').val('');
        $('#Status').val('');

        $('#OpeningDateFilter').val('');
        $('#ClosingDateFilter').val('');

        // If using Select2 in future
        $('#Status').trigger('change');

        loadFundingCalls();
    });

    function loadFundingCalls() {
        $.ajax({
            url: '/FundingCalls/FilterFundingCalls',
            type: 'GET',
            data: {
                search: $('#searchcallname').val(),
                status: $('#Status').val(),
                openingDateFilter: $('#OpeningDateFilter').val(),
                closingDateFilter: $('#ClosingDateFilter').val()
            },
            success: function (html) {
                $('#fundingCallTable').html(html);
                initFundingCallsTable();
            },
            error: function () {
                toastr.error('Could not load funding calls.');
            },
            complete: hideLoading
        });
    }

    $(document).on("click", ".edit", function () {
        showFundingCall($(this).data("id"));
    });

    $(document).on("click", ".edit-link", function () {
        editFundingCall($(this).data("id"));
    });

    $('#btnNewFundingCall').on('click', function () {
        resetFundingCallForm();

        $('#myModal')
            .find('input, textarea, select')
            .prop('disabled', false);

        // Cycle is always read-only
        $('#cycle').prop('disabled', true);

        // Re-enable Select2
        $('#ProjectName')
            .prop('disabled', false)
            .trigger('change');

        $('#hdFundingCallId').val('');

        $('#btnSave')
            .data('mode', 'create')
            .html('<i class="fa fa-save"></i> Save')
            .show();

        $('#fundingCallModalTitle').text('New funding call');
        $('#fundingCallModalSubtitle').text('Create a new funding call.');

        loadProjectsForCreate();
    });
    function resetFundingCallForm() {
        $('.error').remove();

        $('#FundingCallName').val('');
        $('#FundingBudget').val('');
        $('#OpeningDate').val('');
        $('#ClosingDate').val('');
        $('#ShortDescription').val('');

        if ($('#ProjectName').hasClass('select2-hidden-accessible')) {
            $('#ProjectName').select2('destroy');
        }

        $('#ProjectName').empty();
    }

    function loadProjectsForCreate() {
        $.get('/FundingCalls/GetProjects')
            .done(function (projects) {
                $('#ProjectName').empty();

                $.each(projects, function (_, project) {
                    $('#ProjectName').append(
                        $('<option>', {
                            value: project.id,
                            text: project.name
                        })
                    );
                });

                $('#ProjectName').select2({
                    width: '100%',
                    placeholder: 'Select one or more projects',
                    allowClear: true,
                    dropdownParent: $('#myModal')
                });
            })
            .fail(function () {
                toastr.error('Could not load projects.');
            });
    }
    $('#FundingBudget').on('keypress', function (e) {

        const char = String.fromCharCode(e.which);

        // digits
        if (/[0-9]/.test(char)) {
            return;
        }

        // allow one decimal point
        if (char === '.' && $(this).val().indexOf('.') === -1) {
            return;
        }

        e.preventDefault();
    });
    $('#FundingBudget').on({
        keyup: function () {
            formatCurrency($(this));
        },
        blur: function () {
            formatCurrency($(this), 'blur');
        }
    });

    $('#btnSave').on('click', function (e) {
        e.preventDefault();

        const mode = $(this).data('mode');

        if (mode === 'create') {
            createFundingCall();
            return;
        }

        if (mode === 'edit-all') {
            updateFundingCall();
            return;
        }

        if (mode === 'update-closing-date') {
            updateFundingCallClosingDate();
            return;
        }

        if (mode === 'update-open-call') {
            updateOpenFundingCall();
            return;
        }
    });
    function createFundingCall() {
        $('.error').remove();

        if (!validateFundingCallForm()) return;

        const projectIds = $('#ProjectName').val() || [];

        $.ajax({
            url: '/FundingCalls/CreateFundingCall',
            type: 'POST',
            data: {
                FundingCallName: $('#FundingCallName').val(),
                ProjectId: projectIds,
                Project: projectIds.join(','),
                ShortDescription: $('#ShortDescription').val(),
                Status: 'New',
                OpeningDate: $('#OpeningDate').val(),
                ClosingDate: $('#ClosingDate').val(),
                FundingBudget: $('#FundingBudget').val().replace(/\s+/g, '')
            },
            beforeSend: showLoading,
            success: function (data) {
                if (data.status === 'error') {
                    toastr.error(data.message);
                    return;
                }

                toastr.success('Funding Call submitted successfully.');
                toastr.info('System closure mode has been disabled because a new funding call was created.');
                $('#myModal').modal('hide');
                resetFundingCallForm();
                loadFundingCalls();
            },
            error: function () {
                toastr.error('Could not save funding call.');
            },
            complete: hideLoading
        });
    }
    function updateFundingCall() {
        $('.error').remove();

        if (!validateFundingCallForm()) return;

        const projectIds = $('#ProjectName').val() || [];

        const model = {
            Id: $('#hdFundingCallId').val(),
            FundingCallName: $('#FundingCallName').val(),
            ProjectId: projectIds,
            ShortDescription: $('#ShortDescription').val(),
            ClosingDate: $('#ClosingDate').val(),
            OpeningDate: $('#OpeningDate').val(),
            FundingBudget: $('#FundingBudget').val().replace(/\s+/g, '')
        };

        $.ajax({
            url: '/FundingCalls/UpdateFundingCall',
            type: 'POST',
            data: model,
            beforeSend: showLoading,
            success: function (data) {
                if (data.status === 'error') {
                    toastr.error(data.message);
                    hideLoading();
                    return;
                }

                toastr.success('Funding Call updated successfully.');
                $('#myModal').modal('hide');
                resetFundingCallForm();
                loadFundingCalls();
            },
            error: function () {
                toastr.error('Could not update funding call.');
                hideLoading();
            }
        });
    }
    function updateFundingCallClosingDate() {
        const closingDate = $('#ClosingDate').val();

        if (!closingDate) {
            showFieldError('#ClosingDate', 'Closing date is required');
            return;
        }

        $.ajax({
            url: '/FundingCalls/CloseFundingCall',
            type: 'POST',
            data: {
                id: $('#hdFundingCallId').val(),
                ClosingDate: closingDate
            },
            beforeSend: showLoading,
            success: function (data) {
                if (data.status === 'error') {
                    toastr.error(data.message);
                    return;
                }

                toastr.success('Closing date updated successfully.');
                $('#myModal').modal('hide');
                resetFundingCallForm();
                loadFundingCalls();
            },
            error: function () {
                toastr.error('Could not update closing date.');
            },
            complete: hideLoading
        });
    }

    // Open (in progress) funding calls allow both the closing date and the budget to change.
    function updateOpenFundingCall() {
        $('.error').remove();

        const closingDate = $('#ClosingDate').val();
        const fundingBudget = ($('#FundingBudget').val() || '').replace(/\s+/g, '');

        if (!closingDate) {
            showFieldError('#ClosingDate', 'Closing date is required');
            return;
        }

        if (!fundingBudget) {
            showFieldError('#FundingBudget', 'Funding budget is required');
            return;
        }

        if (isNaN(Number(fundingBudget)) || Number(fundingBudget) <= 0) {
            showFieldError('#FundingBudget', 'Funding budget must be a valid amount greater than zero');
            return;
        }

        showLoading();

        $.ajax({
            url: '/FundingCalls/CloseFundingCall',
            type: 'POST',
            data: {
                id: $('#hdFundingCallId').val(),
                ClosingDate: closingDate
            }
        })
            .then(function () {
                return $.ajax({
                    url: '/FundingCalls/UpdateFundingBudget',
                    type: 'POST',
                    data: {
                        id: $('#hdFundingCallId').val(),
                        FundingBudget: fundingBudget
                    }
                });
            })
            .done(function (data) {
                if (data && data.status === 'error') {
                    toastr.error(data.message);
                    return;
                }

                toastr.success('Funding call updated successfully.');
                $('#myModal').modal('hide');
                resetFundingCallForm();
                loadFundingCalls();
            })
            .fail(function (xhr) {
                const message = xhr && xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : 'Could not update the funding call.';

                toastr.error(message);
            })
            .always(hideLoading);
    }

    function validateFundingCallForm() {

        $('.error').remove();

        let isValid = true;

        if (!$('#FundingCallName').val().trim()) {
            showFieldError('#FundingCallName', 'Funding call name is required');
            isValid = false;
        }

        if (!$('#FundingBudget').val()) {
            showFieldError('#FundingBudget', 'Funding budget is required');
            isValid = false;
        }

        if (!$('#OpeningDate').val()) {
            showFieldError('#OpeningDate', 'Opening date is required');
            isValid = false;
        }

        if (!$('#ClosingDate').val()) {
            showFieldError('#ClosingDate', 'Closing date is required');
            isValid = false;
        }

        if (!$('#ProjectName').val()?.length) {
            showFieldError('#ProjectName', 'Please select at least one project');
            isValid = false;
        }

        if (!$('#ShortDescription').val().trim()) {
            showFieldError('#ShortDescription', 'Short description is required');
            isValid = false;
        }

        if (!isValid) {
            toastr.error('Please complete all required fields.');
        }

        return isValid;
    }
    function showFieldError(selector, message) {
        $(selector).focus();
        $(selector).after(`<span class="error">${message}</span>`);
        toastr.error(message);
    }

    function formatNumber(value) {
        return value
            .replace(/\D/g, '')
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    function formatCurrency(input, blur) {
        let inputValue = input.val();

        if (inputValue === '') return;

        const originalLength = inputValue.length;
        let caretPosition = input.prop('selectionStart');

        if (inputValue.indexOf('.') >= 0) {
            const decimalPosition = inputValue.indexOf('.');

            let leftSide = inputValue.substring(0, decimalPosition);
            let rightSide = inputValue.substring(decimalPosition);

            leftSide = formatNumber(leftSide);
            rightSide = formatNumber(rightSide);

            if (blur === 'blur') {
                rightSide += '00';
            }

            rightSide = rightSide.substring(0, 2);
            inputValue = `${leftSide}.${rightSide}`;
        } else {
            inputValue = formatNumber(inputValue);

            if (blur === 'blur') {
                inputValue += '.00';
            }
        }

        input.val(inputValue);

        const updatedLength = inputValue.length;
        caretPosition = updatedLength - originalLength + caretPosition;

        input[0].setSelectionRange(caretPosition, caretPosition);

        input.val(input.val().replace(/^0+/, ''));
    }

    function showLoading() {
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('loadingModal')
        ).show();
    }

    function hideLoading() {
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('loadingModal')
        ).hide();
    }

    $(document).on('click', '.open-funding-call', function () {
        openFundingCall($(this).data('id'));
    });

    function openFundingCall(id) {
        $.ajax({
            url: '/FundingCalls/GetFundingCallDetails',
            type: 'GET',
            data: { id: id },
            success: function (data) {
                populateFundingCallModal(data);
                applyFundingCallMode(data.fundingCallStatus?.status);
                $('#myModal').modal('show');
            },
            error: function () {
                toastr.error('Could not load funding call details.');
            }
        });
    }

    function populateFundingCallModal(data) {
        $('#hdFundingCallId').val(data.id);

        $('#FundingCallName').val(data.fundingCallName);
        $('#FundingBudget').val(data.fundingBudget);
        $('#OpeningDate').val(formatDateForInput(data.openingDate));
        $('#ClosingDate').val(formatDateForInput(data.closingDate));
        $('#ShortDescription').val(data.shortDescription);

        loadProjectsForOpen(data.fundingCallProjects || []);
    }
    function loadProjectsForOpen(selectedProjects) {
        const selectedIds = selectedProjects.map(x => String(x.id));

        if ($('#ProjectName').hasClass('select2-hidden-accessible')) {
            $('#ProjectName').select2('destroy');
        }

        $('#ProjectName').empty();

        $.get('/FundingCalls/GetProjects')
            .done(function (projects) {
                $.each(projects, function (_, project) {
                    $('#ProjectName').append(
                        $('<option>', {
                            value: project.id,
                            text: project.name,
                            selected: selectedIds.includes(String(project.id))
                        })
                    );
                });

                $('#ProjectName').select2({
                    width: '100%',
                    placeholder: 'Select one or more projects',
                    allowClear: true,
                    dropdownParent: $('#myModal')
                });

                $('#ProjectName').trigger('change');
            })
            .fail(function () {
                toastr.error('Could not load projects.');
            });
    }
    function formatDateForInput(value) {
        if (!value) return '';

        const date = new Date(value);

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
    function applyFundingCallMode(status) {
        const normalizedStatus = (status || '').trim().toLowerCase();

        $('#myModal input, #myModal textarea, #myModal select').prop('disabled', true);
        $('#btnSave').hide();

        if (normalizedStatus === 'new') {
            $('#fundingCallModalTitle').text('Edit funding call');
            $('#fundingCallModalSubtitle').text('You can edit all details.');
            $('#myModal input, #myModal textarea, #myModal select').prop('disabled', false);
            $('#cycle').prop('disabled', true);

            $('#btnSave')
                .data('mode', 'edit-all')
                .html('<i class="fa fa-save"></i> Save changes')
                .show();
        }

        if (normalizedStatus === 'in progress') {
            $('#fundingCallModalTitle').text('Update open funding call');
            $('#fundingCallModalSubtitle').text('Only the closing date and funding budget can be updated.');
            $('#ClosingDate').prop('disabled', false);
            $('#FundingBudget').prop('disabled', false);

            $('#btnSave')
                .data('mode', 'update-open-call')
                .html('<i class="fa fa-save"></i> Save changes')
                .show();
        }

        if (normalizedStatus === 'expired') {
            $('#fundingCallModalTitle').text('View funding call');
            $('#fundingCallModalSubtitle').text('This funding call is read-only.');
        }
    }

    function initSystemClosure() {
        if ($('#systemClosureModal').length === 0) return;

        flatpickr('#ClosureDate', {
            dateFormat: 'd M Y',
            allowInput: true,
            minDate: 'today'
        });

        $('#systemClosureModal').on('show.bs.modal', loadSystemClosure);
        $('#btnSaveSystemClosure').on('click', saveSystemClosure);
    }

    function loadSystemClosure() {
        $.ajax({
            url: '/FundingCalls/GetSystemClosure',
            type: 'GET',
            beforeSend: showLoading,
            success: function (data) {
                if (!data || !data.closureDateTime) {
                    $('#hdSystemClosureId').val('');
                    $('#ClosureDate').val('');
                    $('#ClosureTime').val('00:00');
                    $('#systemClosureActiveAlert').addClass('d-none');
                    return;
                }

                const closure = new Date(data.closureDateTime);

                $('#hdSystemClosureId').val(data.id || '');
                $('#ClosureDate').val(formatDate(closure));
                $('#ClosureTime').val(
                    ('0' + closure.getHours()).slice(-2) + ':' + ('0' + closure.getMinutes()).slice(-2)
                );

                $('#systemClosureActiveAlert').toggleClass('d-none', !data.isClosureActive);
            },
            error: function () {
                toastr.error('Could not load the system closure settings.');
            },
            complete: hideLoading
        });
    }

    function saveSystemClosure() {
        $('.error').remove();

        const closureDate = $('#ClosureDate').val();
        const closureTime = $('#ClosureTime').val() || '00:00';

        if (!closureDate) {
            showFieldError('#ClosureDate', 'Closure date is required');
            return;
        }

        const parsedDate = new Date(closureDate);

        if (isNaN(parsedDate.getTime())) {
            showFieldError('#ClosureDate', 'Closure date is not valid');
            return;
        }

        const timeParts = closureTime.split(':');
        parsedDate.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);

        $.ajax({
            url: '/FundingCalls/SetSystemClosure',
            type: 'POST',
            data: {
                Id: $('#hdSystemClosureId').val() || null,
                ClosureDateTime: parsedDate.toISOString()
            },
            beforeSend: showLoading,
            success: function (data) {
                if (data && data.status === 'error') {
                    toastr.error(data.message);
                    return;
                }

                toastr.success('System closure date and time saved successfully.');
                $('#systemClosureModal').modal('hide');
            },
            error: function (xhr) {
                const message = xhr && xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : 'Could not save the system closure date.';

                toastr.error(message);
            },
            complete: hideLoading
        });
    }
});