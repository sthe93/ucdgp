
function sortProjectsByActiveStatus(projects) {
    if (!projects || !Array.isArray(projects)) return [];

    return [...projects].sort((a, b) => {
        // Active projects first
        if (a.isActive === b.isActive) {
            const nameA = (a.projectName || '').toLowerCase();
            const nameB = (b.projectName || '').toLowerCase();
            return nameA.localeCompare(nameB);
        }
       
        return a.isActive ? -1 : 1;
    });
}

$(document).ready(function () {
    let currentPage = 1;
    const pageSize = 10;
    let allProjects = [];
    let filteredProjects = [];
    let allProjectCycles = [];
    let isSubmitting = false;

    $('#projectCyclesTable').DataTable({
        ajax: {
            url: '/Project/GetAllProjectCycles',
            type: 'GET',
            dataSrc: function (json) {

                if (json && Array.isArray(json)) {
                    return json;
                }
                console.error('Invalid response format:', json);
                toastr.error('Failed to load project cycles. Please refresh the page.');
                return [];
            },
            error: function (xhr, error, thrown) {
                console.error('DataTables error:', error);
                toastr.error('Could not load project cycles. Server returned invalid data.');
            }
        },
        columns: [
            { data: 'period' },
            {
                data: 'isActive',
                render: function (data, type, row) {
                    return data
                        ? '<span class="badge bg-success">True</span>'
                        : '<span class="badge bg-danger">False</span>';
                }
            },
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    return `<button type="button" class="btn btn-outline-primary btn-sm edit-cycle-btn" data-id="${row.id}">
                                <i class="bi bi-pencil-square"></i> Edit
                            </button>`;
                }
            }
        ],
        paging: true,
        searching: false,
        info: false,
        lengthChange: false
    });

    function fetchAllProjectCycles(callback) {
        $.ajax({
            url: '/Project/GetAllProjectCycles',
            type: 'GET',
            success: function (cycles) {
                allProjectCycles = cycles || [];
                populateCycleFilter(allProjectCycles);

                if (typeof callback === 'function') {
                    callback(allProjectCycles);
                }
            },
            error: function (xhr) {
                console.error('Error fetching project cycles:', xhr);
                allProjectCycles = [];
                toastr.error("Could not fetch project cycles");
            }
        });
    }

    function populateCycleFilter(cycles) {
        const filterSelect = $('#projectCycleFilter');
        filterSelect.empty().append('<option value="">All Project Cycles</option>');

        if (cycles && cycles.length > 0) {
            cycles.sort((a, b) => b.period.localeCompare(a.period));

            cycles.forEach(cycle => {
                const statusText = cycle.isActive ? 'Active' : 'Inactive';
                const optionClass = cycle.isActive ? 'text-success' : 'text-muted';
                filterSelect.append(`<option value="${cycle.id}" class="${optionClass}">${cycle.period} (${statusText})</option>`);
            });
        }
    }


    function populateProjectModalDropdown(cycles, selectedCycleId) {
        const select = $('#projectCycleSelect');
        select.empty().append('<option value="">Select Project Cycle</option>');

        if (!cycles || cycles.length === 0) {
            select.append('<option value="" disabled>No project cycles available</option>');
            return;
        }


        const activeCycles = cycles.filter(c => c.isActive);

        if (activeCycles.length > 0) {
            activeCycles.sort((a, b) => b.period.localeCompare(a.period));
            activeCycles.forEach(cycle => {
                select.append(`<option value="${cycle.id}">${cycle.period}</option>`);
            });
        }


        if (selectedCycleId) {
            const selectedCycle = cycles.find(c => c.id == selectedCycleId);
            if (selectedCycle && !selectedCycle.isActive) {
                select.append(`<option value="${selectedCycle.id}" selected class="text-warning">${selectedCycle.period} (Inactive - Current)</option>`);
                toastr.warning('This project is linked to an inactive cycle. Consider updating the cycle.');
            } else if (selectedCycle && selectedCycle.isActive) {
                select.val(selectedCycleId);
            }
        }


        if (activeCycles.length === 0 && !selectedCycleId) {
            select.append('<option value="" disabled>No active project cycles available</option>');
        }
    }

    function fetchProjects() {
        console.log('🔍 fetchProjects called');
        $('#loadingModal').modal('show');

        $.ajax({
            url: '/Project/GetProjects',
            type: 'GET',
            success: function (projects) {
                allProjects = sortProjectsByActiveStatus(projects || []);
                filteredProjects = [...allProjects];
                renderProjectsTable();
                hideLoadingModal();
            },
            error: function (xhr, status, error) {
                console.error('❌ AJAX Error:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
                toastr.error("Could not fetch projects: " + (xhr.responseJSON?.error || 'Unknown error'));
                hideLoadingModal();
            },
            complete: function () {

                setTimeout(hideLoadingModal, 500);
            }
        });
    }

    function hideLoadingModal() {
        try {

            $('#loadingModal').modal('hide');


            $('.modal-backdrop').remove();


            $('body').removeClass('modal-open');
        } catch (e) {
            console.error('Error hiding modal:', e);
        }
    }

    function renderProjectsTable() {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const pageData = filteredProjects.slice(start, end);

        const tbody = $('#projectsTable tbody');
        tbody.empty();

        if (pageData.length === 0) {
            tbody.append(`
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        <p>No projects found</p>
                        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#projectModal">
                            <i class="bi bi-plus-lg"></i> Create your first project
                        </button>
                    </div>
                </td>
            </tr>
        `);
        } else {
            pageData.forEach((project, index) => {
                const rowNumber = start + index + 1;
                const projectCycleInfo = project.projectCycles || {};
                const cyclePeriod = projectCycleInfo.period || '-';
                const cycleActive = projectCycleInfo.isActive || false;

                const projectActiveBadge = project.isActive ?
                    '<span class="badge bg-success">True</span>' :
                    '<span class="badge bg-danger">False</span>';

                const cycleActiveBadge = cycleActive ?
                    '<span class="badge bg-success">True</span>' :
                    '<span class="badge bg-danger">False</span>';

                const row = `
                <tr>
                    <td>${rowNumber}</td>
                    <td>
                        <strong>${escapeHtml(project.projectName || 'Unnamed Project')}</strong>
                        ${project.description ? `<br><small class="text-muted">${escapeHtml(project.description)}</small>` : ''}
                    </td>
                    <td>${projectActiveBadge}</td>
                    <td>${cyclePeriod}</td>
                    <td>${cycleActiveBadge}</td>
                    <td>
                        <button type="button" class="btn btn-outline-primary btn-sm edit-project-btn" 
                            data-project-id="${project.id}">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>
                    </td>
                </tr>
            `;
                tbody.append(row);
            });
        }

        const totalPages = Math.ceil(filteredProjects.length / pageSize);
        $('#tableInfo').text(`Page ${currentPage} of ${totalPages || 1}`);
        $('#prevPage').prop('disabled', currentPage === 1 || filteredProjects.length === 0);
        $('#nextPage').prop('disabled', currentPage === totalPages || totalPages === 0 || filteredProjects.length === 0);
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    $('#projectSearch').on('keyup', function () {
        const searchTerm = $(this).val().toLowerCase();
        if (searchTerm.trim() === '') {
            filteredProjects = [...allProjects];
        } else {
            filteredProjects = allProjects.filter(p =>
                (p.projectName && p.projectName.toLowerCase().includes(searchTerm)) ||
                (p.description && p.description.toLowerCase().includes(searchTerm))
            );
        }
        currentPage = 1;
        renderProjectsTable();
    });

    $('#searchButton').on('click', function () {
        $('#projectSearch').trigger('keyup');
    });

    $('#projectCycleFilter').on('change', function () {
        const cycleId = $(this).val();
        if (!cycleId) {
            filteredProjects = [...allProjects];
        } else {
            filteredProjects = allProjects.filter(p =>
                p.projectCycles && p.projectCycles.id == cycleId
            );
        }
        currentPage = 1;
        renderProjectsTable();
    });

    $('#prevPage').click(function () {
        if (currentPage > 1) {
            currentPage--;
            renderProjectsTable();
        }
    });

    $('#nextPage').click(function () {
        const totalPages = Math.ceil(filteredProjects.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderProjectsTable();
        }
    });

    $('.btn[data-bs-target="#projectModal"]').on('click', function () {
        $('#projectModalLabel').text('New Project');
        $('#projectSaveBtnText').text('Save');
        $('#projectId').val('');
        $('#projectNameInput').val('');
        $('#enableProject').prop('checked', true);


        populateProjectModalDropdown(allProjectCycles, null);

        $('#projectModal').modal('show');
    });

    $('#projectsTable').on('click', '.edit-project-btn', function () {
        const projectId = $(this).data('project-id');
        const project = allProjects.find(p => p.id === projectId);

        if (project) {
            $('#projectModalLabel').text('Edit Project');
            $('#projectSaveBtnText').text('Update');
            $('#projectId').val(project.id);
            $('#projectNameInput').val(project.projectName || '');
            $('#enableProject').prop('checked', project.isActive);

            const selectedCycleId = project.projectCycles ? project.projectCycles.id : null;

            populateProjectModalDropdown(allProjectCycles, selectedCycleId);

            $('#projectModal').modal('show');
        }
    });

    $('#projectsTable').on('change', '.project-status-toggle', function () {
        const projectId = $(this).data('project-id');
        const isChecked = $(this).is(':checked');
        const $toggle = $(this);

        $('#loadingModal').modal('show');

        $.ajax({
            url: '/Project/ToggleProjectStatus',
            type: 'POST',
            data: JSON.stringify(projectId),
            contentType: 'application/json',
            success: function (projects) {
                allProjects = sortProjectsByActiveStatus(projects || []);
                filteredProjects = [...allProjects];
                renderProjectsTable();
                $('#loadingModal').modal('hide');
                toastr.success(`Project ${isChecked ? 'activated' : 'deactivated'} successfully.`);
            },
            error: function (xhr) {
                $('#loadingModal').modal('hide');
                console.error('Error response:', xhr.responseText);
                toastr.error('Failed to update project status.');
                $toggle.prop('checked', !isChecked);
            }
        });
    });


    $('#projectForm').on('submit', function (e) {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        const id = $('#projectId').val();
        const projectName = $('#projectNameInput').val().trim();
        const projectCycleId = $('#projectCycleSelect').val();
        const isActive = $('#enableProject').is(':checked');

        if (!projectName) {
            toastr.error('Project name is required.');
            return;
        }

        if (!projectCycleId) {
            toastr.error('Please select a project cycle.');
            return;
        }

        isSubmitting = true;
        const $submitBtn = $('#projectSaveBtn');
        $submitBtn.prop('disabled', true);

        const projectData = {
            id: id ? parseInt(id) : 0,
            projectName: projectName,
            projectCycleId: projectCycleId,
            isActive: isActive
        };

        console.log('Sending project data:', projectData);

        $('#loadingModal').modal('show');

        const url = id ? '/Project/UpdateProject' : '/Project/CreateProject';

        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(projectData),
            contentType: 'application/json',
            success: function (projects) {
                allProjects = sortProjectsByActiveStatus(projects || []);
                filteredProjects = [...allProjects];
                renderProjectsTable();
                $('#projectModal').modal('hide');
                hideLoadingModal();
                toastr.success(id ? 'Project updated successfully.' : 'Project created successfully.');

                isSubmitting = false;
                $submitBtn.prop('disabled', false);
            },
            error: function (xhr) {
                hideLoadingModal();
                console.error('Error response:', xhr.responseText);
                let errorMsg = 'Operation failed. Please try again.';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMsg = response.error || response.message || errorMsg;
                } catch (e) {

                }
                toastr.error(errorMsg);

                isSubmitting = false;
                $submitBtn.prop('disabled', false);
            },
            complete: function () {
                setTimeout(hideLoadingModal, 500);
            }
        });
    });

    $('.btn[data-bs-target="#projectCycleModal"]').on('click', function () {
        $('#projectCycleModalLabel').text('New Project Cycle');
        $('#projectCycleSaveBtnText').text('Save');
        $('#projectCycleId').val('');
        $('#projectPeriodInput').val('');
        $('#enableProjectCycle').prop('checked', false);
    });

    $('#projectCyclesTable').on('click', '.edit-cycle-btn', function () {
        const id = $(this).data('id');
        const cycle = allProjectCycles.find(c => c.id === id);

        if (cycle) {
            $('#projectCycleModalLabel').text('Update Project Cycle Details');
            $('#projectCycleSaveBtnText').text('Update');
            $('#projectCycleId').val(cycle.id);
            $('#projectPeriodInput').val(cycle.period);
            $('#enableProjectCycle').prop('checked', cycle.isActive);
            $('#projectCycleModal').modal('show');
        }
    });

    $('#projectCycleForm').on('submit', function (e) {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        const id = $('#projectCycleId').val();
        const period = $('#projectPeriodInput').val().trim();
        const isActive = $('#enableProjectCycle').is(':checked');

        const result = id == "" ?
            validateProjectCycleInput(period, isActive, allProjectCycles) :
            validateProjectCycleInputUpdate(period, isActive, id, allProjectCycles);

        if (result.status === "error") {
            toastr.error(result.message);
            return;
        }

        isSubmitting = true;
        const $submitBtn = $('#projectCycleSaveBtn');
        $submitBtn.prop('disabled', true);

        const data = { period: period, isActive: isActive };
        if (id) data.id = parseInt(id);

        $('#loadingModal').modal('show');

        $.ajax({
            url: '/Project/CreateProjectCycle',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (cycles) {
                hideLoadingModal();
                allProjectCycles = cycles;

                var table = $('#projectCyclesTable').DataTable();
                table.clear();
                table.rows.add(cycles);
                table.draw();

                toastr.success(id ? "Project cycle updated successfully." : "Project cycle added successfully.");

                populateCycleFilter(allProjectCycles);
                fetchProjects();

                isSubmitting = false;
                $submitBtn.prop('disabled', false);
            },
            error: function (xhr) {
                hideLoadingModal();
                toastr.error('Update failed. Please try again.');

                isSubmitting = false;
                $submitBtn.prop('disabled', false);
            },
            complete: function () {
                setTimeout(hideLoadingModal, 500);
            }
        });
    });

    fetchAllProjectCycles(function () {
        fetchProjects();
    });

    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        if ($(e.target).attr('id') === 'projects-tab') {
            fetchAllProjectCycles();
            fetchProjects();
        } else if ($(e.target).attr('id') === 'cycles-tab') {
            $('#projectCyclesTable').DataTable().ajax.reload();
        }
    });


    $('#projectModal').on('hidden.bs.modal', function () {
        isSubmitting = false;
        $('#projectSaveBtn').prop('disabled', false);
    });

    $('#projectCycleModal').on('hidden.bs.modal', function () {
        isSubmitting = false;
        $('#projectCycleSaveBtn').prop('disabled', false);
    });
});


function validateProjectCycleInput(period, isActive, cycles) {
    if (!/^\d{4}-\d{4}$/.test(period) || period == "") {
        return { status: "error", message: "Please complete all required fields, in the correct format (2018-2020)." };
    }

    const startYear = parseInt(period.substring(0, 4), 10);
    const endYear = parseInt(period.substring(5, 9), 10);
    const currentYear = new Date().getFullYear();

    if ((endYear - startYear) !== 2) {
        return { status: "error", message: "Invalid Period Cycle. Please make the period cycle to be two years apart." };
    }

    if (currentYear > startYear) {
        return { status: "error", message: "Project Cycle Cannot be Back Dated" };
    }

    if (isActive) {
        const activeExists = cycles.some(c => c.isActive);
        if (activeExists) {
            return { status: "error", message: "Cannot have 2 active Project Cycles. Deactivate active one first" };
        }
    }

    const periodExists = cycles.some(c => c.period === period);
    if (periodExists) {
        return { status: "error", message: "Project Cycle period already exists" };
    }

    return { status: "ok" };
}

function validateProjectCycleInputUpdate(period, isActive, id, cycles) {
    var cycle = cycles.find(c => c.id == id);

    if (isActive) {
        const activeExists = cycles.some(c => c.isActive && c.id != id);
        if (activeExists) {
            return { status: "error", message: "Cannot have 2 active Project Cycles. Deactivate active one first" };
        }
    }

    const startYear = parseInt(period.substring(0, 4), 10);
    const endYear = parseInt(period.substring(5, 9), 10);
    const currentYear = new Date().getFullYear();

    if (currentYear > startYear) {
        return { status: "error", message: "Project Cycle Cannot be Back Dated" };
    }

    if (period == cycle.period) {
        return { status: "ok" };
    }

    if (!/^\d{4}-\d{4}$/.test(period) || period == "") {
        return { status: "error", message: "Please complete all required fields, in the correct format (2018-2020)." };
    }

    if ((endYear - startYear) !== 2) {
        return { status: "error", message: "Invalid Period Cycle. Please make the period cycle to be two years apart." };
    }

    const periodExists = cycles.some(c => c.period === period);
    if (periodExists) {
        return { status: "error", message: "Project Cycle period already exists" };
    }

    return { status: "ok" };
}