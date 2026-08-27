$(function () {
    loadProjectsForTesting();
});

async function loadProjectsForTesting() {
    try {
        const response = await fetch("Project/GetProjects", {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to load projects.");
        }

        const projects = await response.json();
        renderProjectCheckboxes(projects || []);
        rebuildSelectedProjectTabs();
    } catch (error) {
        console.error("Error loading projects:", error);

        $("#projectsCheckboxList").html(`
            <div class="col-12">
                <div class="alert alert-danger mb-0">
                    Unable to load projects.
                </div>
            </div>
        `);
    }
}

function renderProjectCheckboxes(projects) {
    const container = $("#projectsCheckboxList");
    container.empty();

    const filteredProjects = projects.filter(project => {
        const isProjectActive = project.isActive ?? project.IsActive;
        const cycle = project.projectCycles ?? project.ProjectCycles;
        const isCycleActive = cycle?.isActive ?? cycle?.IsActive;
        const projectName = project.projectName ?? project.ProjectName;

        return isProjectActive && isCycleActive && getProjectKey(projectName);
    });

    if (!filteredProjects.length) {
        container.html(`
            <div class="col-12">
                <div class="alert alert-info mb-0">
                    No active Project 1, Project 2, or Project 5 records were found.
                </div>
            </div>
        `);
        return;
    }

    filteredProjects.forEach(project => {
        const projectName = project.projectName ?? project.ProjectName;
        const projectKey = getProjectKey(projectName);

        container.append(`
            <div class="col-md-4">
                <div class="form-check">
                    <input class="form-check-input project-selector"
                           type="checkbox"
                           value="${projectKey}"
                           id="chk_${projectKey}" />
                    <label class="form-check-label" for="chk_${projectKey}">
                        ${escapeHtml(projectName)}
                    </label>
                </div>
            </div>
        `);
    });

    $(".project-selector")
        .off("change.projectTabs")
        .on("change.projectTabs", function () {
            rebuildSelectedProjectTabs();
        });
}

function rebuildSelectedProjectTabs() {
    const selected = $(".project-selector:checked")
        .map(function () { return $(this).val(); })
        .get();

    const tabsContainer = $("#selectedProjectsTabs");
    tabsContainer.empty();

    $("#project1TabPane, #project2TabPane, #project5TabPane")
        .removeClass("show active")
        .addClass("d-none");

    if (!selected.length) {
        return;
    }

    selected.forEach((projectKey, index) => {
        const isActive = index === 0 ? "active" : "";
        const selectedAttr = index === 0 ? "true" : "false";

        tabsContainer.append(`
            <li class="nav-item" role="presentation">
                <button class="nav-link ${isActive}"
                        id="${projectKey}-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#${getTabPaneId(projectKey)}"
                        type="button"
                        role="tab"
                        aria-controls="${getTabPaneId(projectKey)}"
                        aria-selected="${selectedAttr}">
                    ${getTabLabel(projectKey)}
                </button>
            </li>
        `);

        const pane = $("#" + getTabPaneId(projectKey));
        pane.removeClass("d-none");

        if (index === 0) {
            pane.addClass("show active");
        }
    });
}

function getProjectKey(projectName) {
    const name = (projectName || "").trim().toLowerCase();

    if (name.startsWith("project 1")) return "Project1";
    if (name.startsWith("project 2")) return "Project2";
    if (name.startsWith("project 5")) return "Project5";

    return null;
}

function getTabPaneId(projectKey) {
    if (projectKey === "Project1") return "project1TabPane";
    if (projectKey === "Project2") return "project2TabPane";
    if (projectKey === "Project5") return "project5TabPane";
    return "";
}

function getTabLabel(projectKey) {
    if (projectKey === "Project1") return "Project 1";
    if (projectKey === "Project2") return "Project 2";
    if (projectKey === "Project5") return "Project 5";
    return projectKey;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}