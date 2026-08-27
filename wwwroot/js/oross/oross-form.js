document.addEventListener('DOMContentLoaded', function () {
    const isEditMode = document.getElementById("IsEditMode")?.value === "true";
    localStorage.clear();
    var scrollPosition = sessionStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, scrollPosition);
        sessionStorage.removeItem('scrollPosition');
    }

    const typeSelect = document.getElementById("ResearchType");
    const tabNav = document.getElementById("journalTab");
    const allTabItems = document.querySelectorAll('#journalTab .nav-item');
    const allTabPanes = document.querySelectorAll(".tab-pane");

    const bookChapterModal = new bootstrap.Modal(document.getElementById('bookChapterModal'));
    const invalidChapterModal = new bootstrap.Modal(document.getElementById('invalidChapterModal'));
    const yesBtn = document.getElementById('bookChapterYesBtn');
    const noBtn = document.getElementById('bookChapterNoBtn');

    let bookChapterConfirmed = false;


    document.querySelectorAll('#journalTab .nav-link').forEach(button => {
        button.addEventListener('show.bs.tab', function (e) {
            const parentLi = this.closest('li');
            if (parentLi && parentLi.style.display === 'none') {
                e.preventDefault();
            }
        });
    });

    function hideAllSections() {
        document.querySelectorAll("[data-type-only], [data-type-exclude]").forEach(el => {
            el.style.display = "none";
        });
        tabNav.style.display = "none";
        allTabItems.forEach(li => li.style.display = "none");
        allTabPanes.forEach(pane => {
            pane.classList.remove("show", "active");
        });
    }


    let lastSelectedType = null;

    function handleTypeChange(selected) {
        if (!selected || selected.trim() === "" || selected === "Select research type") {
            hideAllSections();
            updatePublicationNameLabel("");
            lastSelectedType = null;
            return;
        }

        const normalized = selected.trim().toLowerCase();

        if (lastSelectedType === "book chapter" && normalized !== "book chapter") {
            bookChapterConfirmed = false;
        }

        if (normalized === "book chapter" && !bookChapterConfirmed && !isEditMode) {
            bookChapterModal.show();
            lastSelectedType = normalized;
            return;
        }

        updatePublicationNameLabel(normalized);

        document.querySelectorAll("[data-type-only]").forEach(el => {
            const allowed = el.getAttribute("data-type-only").toLowerCase().split(",").map(x => x.trim());
            el.style.display = allowed.includes(normalized) ? "" : "none";
        });

        document.querySelectorAll("[data-type-exclude]").forEach(el => {
            const excluded = el.getAttribute("data-type-exclude").toLowerCase().split(",").map(x => x.trim());
            el.style.display = excluded.includes(normalized) ? "none" : "";
        });

        tabNav.style.display = "flex";
        allTabItems.forEach(li => {
            const onlyFor = li.getAttribute("data-type-only")?.toLowerCase();
            li.style.display = !onlyFor || onlyFor === normalized ? "" : "none";
        });

        allTabPanes.forEach(pane => {
            pane.classList.remove("show", "active");
        });

        activateFirstVisibleTab();
        adjustToggleExpandWidths(normalized);

        lastSelectedType = normalized;
    }

    yesBtn.addEventListener('click', () => {
        bookChapterModal.hide();
        invalidChapterModal.show();
        setTimeout(() => {
            typeSelect.value = "";
            hideAllSections();
            updatePublicationNameLabel("");
        }, 200);
    });

    noBtn.addEventListener('click', () => {
        bookChapterConfirmed = true;
        bookChapterModal.hide();
        const selectedText = typeSelect.options[typeSelect.selectedIndex].text;
        handleTypeChange(selectedText);
    });
    function activateFirstVisibleTab() {
        const visibleTabs = Array.from(document.querySelectorAll("#journalTab .nav-item"))
            .filter(tab => tab.style.display !== "none");

        if (visibleTabs.length > 0) {
            const firstBtn = visibleTabs[0].querySelector("button.nav-link");
            const targetId = firstBtn?.getAttribute("data-bs-target")?.replace('#', '');
            const targetPane = document.getElementById(targetId);

            document.querySelectorAll('#journalTab .nav-link').forEach(btn => {
                btn.classList.remove("active");
            });

            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove("show", "active");
            });

            if (firstBtn && targetPane) {
                firstBtn.classList.add("active");

                const tabTrigger = new bootstrap.Tab(firstBtn);
                tabTrigger.show();

                targetPane.classList.add("show", "active");
            }
        }
    }


    function updatePublicationNameLabel(normalizedType) {
        const labelMap = {
            "journal article": "Journal Article Title",
            "book": "Book title",
            "book chapter": "Book chapter title",
            "conference paper": "Conference paper title"
        };
        const label = document.getElementById("publicationNameLabel");
        if (label) label.textContent = labelMap[normalizedType] || "Publication Name";
    }


    function isElementVisible(el) {
        return el.offsetParent !== null;
    }
    function adjustToggleExpandWidths(type) {
        setTimeout(() => {
            const journalElements = Array.from(document.querySelectorAll("[data-type-only]"))
                .filter(el => el.getAttribute("data-type-only").toLowerCase().trim() === "journal article");

            const journalVisible = journalElements.some(isElementVisible);

            const toggles = document.querySelectorAll(".toggle-expand");
            toggles.forEach(toggle => {
                toggle.classList.remove("col-md-3", "col-md-6");
                toggle.classList.add(journalVisible ? "col-md-3" : "col-md-6");
            });
        }, 0);
    }

    if (typeSelect) {
        typeSelect.addEventListener("change", function () {
            const selectedText = this.options[this.selectedIndex].text;
            const selectedType = selectedText.toLowerCase().trim();

            updateResearchTooltip(selectedType);

            document.querySelectorAll('[data-type-only]').forEach(section => {
                const type = section.getAttribute("data-type-only")?.toLowerCase().trim();
                const isCurrentType = type === selectedType;

                if (!isCurrentType) {
                    section.querySelectorAll('input, textarea, select').forEach(input => {
                        const tag = input.tagName.toLowerCase();
                        const inputType = input.type;

                        if (tag === "input") {
                            if (["text", "number", "file", "hidden"].includes(inputType)) {
                                input.value = "";
                            } else if ((inputType === "checkbox" || inputType === "radio") && !input.classList.contains("preserve-switch")) {
                                input.checked = false;
                            }
                        } else if (tag === "textarea") {
                            input.value = "";
                        } else if (tag === "select") {
                            input.selectedIndex = 0;
                        }
                    });

                    section.querySelectorAll('button[data-docid]').forEach(btn => {
                        btn.innerHTML = `<i class="bi bi-eye"></i> View and verify`;
                        btn.classList.remove("btn-success");
                        btn.classList.add("btn-outline-primary");
                        btn.style.display = "none"; // Always hide on type change
                    });
                }
            });

            document.querySelectorAll('input[type="hidden"][id^="verify"]').forEach(input => {
                input.value = "false";
            });

            const switchesToReset = ["DHETIndexed", "SpecialCategoryRequired", "PublicationFees"];
            switchesToReset.forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox && !checkbox.classList.contains("preserve-switch")) {
                    checkbox.checked = false;
                }
            });

            const feeFields = [
                "#FeeDescription",
                "#PublisherCurrency",
                "#TotalCost",
                "#ContributionPublisherCurrency",
                "#ContributionZAR"
            ];
            feeFields.forEach(sel => {
                const el = document.querySelector(sel);
                if (el?.tagName === "SELECT") el.selectedIndex = 0;
                else if (el) el.value = "";
            });

            document.getElementById("feeDetailsSection")?.classList.add("d-none");

            if (typeof clearClientErrors === "function") clearClientErrors();

            setTimeout(() => {
                handleTypeChange(selectedText);
            }, 10);
        });

        const selectedText = typeSelect.options[typeSelect.selectedIndex]?.text;
        if (typeSelect.value) {
            handleTypeChange(selectedText);
        } else {
            hideAllSections();
        }
    }

    const authorList = document.getElementById("authorList");
    const addAuthorBtn = document.getElementById("addAuthorBtn");
    const addAuthorModal = new bootstrap.Modal(document.getElementById("addAuthorModal"));
    const addAuthorForm = document.getElementById("addAuthorForm");
    const authorTypeSelect = document.getElementById("authorTypeSelect");
    const internalAuthorFields = document.getElementById("internalAuthorFields");
    const externalAuthorFields = document.getElementById("externalAuthorFields");
    const authorNumberInput = document.getElementById("authorNumberInput");
    const searchAuthorBtn = document.getElementById("searchAuthorBtn");
    const internalAuthorDetails = document.getElementById("internalAuthorDetails");
    const detailUsername = document.getElementById("detailUsername");
    const detailLastname = document.getElementById("detailLastname");
    const detailFirstname = document.getElementById("detailFirstname");
    const detailEmail = document.getElementById("detailEmail");
    const detailPosition = document.getElementById("detailPosition");
    const detailFaculty = document.getElementById("detailFaculty");
    const detailDepartment = document.getElementById("detailDepartment");
    const orchidInput = document.getElementById("orchidInput");

    const externalAuthorNameInput = document.getElementById("externalAuthorName");
    const externalAuthorNumberInput = document.getElementById("externalAuthorNumber");
    const externalInstitutionInput = document.getElementById("externalInstitution");
    const externalInstitutionTypeSelect = document.getElementById("externalInstitutionType");
    const submissionSwitch = document.getElementById("OwnWork");

    const orossForm = document.getElementById("orossForm");
    const submitBtn = document.getElementById("submitBtn");
    const orossLoading = document.getElementById("orossLoading");
    if (typeSelect.value) {
        const selectedText = typeSelect.options[typeSelect.selectedIndex].text;
        updateResearchTooltip(selectedText.toLowerCase().trim());
    }
    var input = document.getElementById('NotificationEmails');
    var emailtagify = new Tagify(input, {
        duplicates: false,
        delimiters: /[ ,;]+/,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        whitelist: [],
        dropdown: { enabled: 0 }
    });

    emailtagify.on('invalid', e => {
        const { data } = e.detail;
        //console.log("Invalid email attempted:", data.value);

        // Optional: show a message to the user
        toastr.error(`"${data.value}" is not a valid email address`);
    });


    emailtagify.on('remove', function (event) {
        var targetValue = event.detail?.data?.value;

        if (!targetValue) {
         //   console.log('No value found in remove event:', event);
            return;
        }

        const savedEmailsJSON = localStorage.getItem('savedEmails');
        let emails = [];
        try {
            emails = JSON.parse(savedEmailsJSON) || [];
        } catch (err) {
            console.error("Error parsing saved emails:", err);
        }

        const updatedEmails = emails.filter(item => item.value !== targetValue);
        localStorage.setItem('savedEmails', JSON.stringify(updatedEmails));
        updateEmailUI();
    });

    //updateCount("externalAuthorName", "authorNameCount", 25);
    //updateCount("externalAuthorNumber", "authorNumberCount", 10);
    //updateCount("externalInstitution", "institutionCount", 25);
    let authors = [];

    async function initAuthors() {
        const isEditMode = document.getElementById("IsEditMode")?.value === "true";
        const jsonField = document.getElementById('AuthorJson');
        const ownWorkChecked = submissionSwitch?.value === "true";

        authors = [];

        if (isEditMode) {
            try {
                if (jsonField?.value) {
                    const savedAuthors = JSON.parse(jsonField.value);
                    authors = Array.isArray(savedAuthors) ? savedAuthors : [];
                }
            } catch (err) {
                console.error("Failed to parse AuthorJson in edit mode:", err);
                toastr.error("Could not load authors.");
            }
        } else if (ownWorkChecked) {
            try {
                if (jsonField?.value) {
                    const savedAuthors = JSON.parse(jsonField.value);
                    authors = Array.isArray(savedAuthors) ? savedAuthors : [];
                } else {
                    const response = await fetch("/Oross/GetCurrentUserAuthorInfo");
                    if (!response.ok) {
                        let errorMessage = "Failed to load current user info.";
                        try {
                            errorMessage = await response.text(); // controller returns plain text messages
                        } catch (e) {
                            console.error("Failed to read controller error message", e);
                        }
                        throw new Error(errorMessage);
                    }
                    const user = await response.json();

                    const firstName = user.firstName?.trim() || "";
                    const lastName = user.lastName?.trim() || "";
                    const fullName = `${toProperCase(firstName)} ${toProperCase(lastName)}`.trim();
                    const isStudent = user.isUjStudent === "Yes";
                    const number = user.username || user.number || user.staffUsername || user.staffNumber || "N/A";

                    authors = [{
                        firstname: toProperCase(firstName),
                        lastname: toProperCase(lastName),
                        name: fullName || "Unknown",
                        number: user.staffNumber,
                        position: isStudent ? "Student" : (user.position && user.position !== "N/A" ? user.position : "Unknown"),
                        faculty: user.faculty || "",
                        department: user.department || "",
                        campus: user.campus || "",
                        email: user.email || "",
                        isPrimaryAuthor: true,
                        type: "internal",
                        orchid: user.orchid !== "0" ? user.orchid : "",
                        isUjStaff: user.isUjStaff,
                        isUjStudent: user.isUjStudent,
                        staffUsername: user.staffUsername,
                        staffNumber: user.staffNumber,
                        isCurrentUser: true
                    }];
                }
            } catch (err) {
                console.error("Error fetching current user info", err);
                toastr.error(err.message || "Failed to load current user info.");
            }
        }
        renderAuthorList();
    }
    function renderAuthorList() {
        const isEditMode = document.getElementById("IsEditMode")?.value === "true";
        authorList.innerHTML = "";

        authors.forEach((author, index) => {
            const firstName = getProp(author, "firstname", "FirstName");
            const lastName = getProp(author, "lastname", "LastName");
            const number = getProp(author, "number", "StaffNumber");
            const position = getProp(author, "position", "Position");

            const isPrimary = author.isPrimaryAuthor ?? author.IsPrimaryAuthor ?? false;

            const isAffiliated = author.isAffiliated ?? false;
            const affInstitution = author.InstitutionName ?? "";
            const affPosition = author.otherInstitutionType ?? "";

            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";

            // Build affiliation badge if needed
            let affiliationBadge = "";
            if (isAffiliated) {
                affiliationBadge = `
                <span class="badge bg-secondary ms-2">
                Affiliated with another institution
                </span>
            `;
            }

            const authorInfo = document.createElement("div");
            authorInfo.innerHTML = `
            <strong>${toProperCase(firstName)} ${toProperCase(lastName)}</strong> 
            (${number}) 
            - <small>${position}</small>

            ${isPrimary ? '<span class="badge bg-primary rounded-pill ms-2">Primary</span>' : ''}
            ${affiliationBadge}
        `;

            li.appendChild(authorInfo);

            if (!isEditMode) {
                const btnGroup = document.createElement("div");
                btnGroup.className = "btn-group btn-group-sm";

                if (!author.isPrimaryAuthor) {
                    const makePrimaryBtn = document.createElement("button");
                    makePrimaryBtn.type = "button";
                    makePrimaryBtn.className = "btn btn-outline-primary";
                    makePrimaryBtn.textContent = "Make primary";
                    makePrimaryBtn.onclick = () => makePrimary(index);
                    btnGroup.appendChild(makePrimaryBtn);
                }

                const isOwnWork = document.querySelector("input[name='OwnWorkModel.IsChecked']")?.value === "true";
                const currentUser = authors.find(a => a.isCurrentUser);

                if (authors.length > 1 && (!isOwnWork || number !== currentUser?.number)) {
                    const removeBtn = document.createElement("button");
                    removeBtn.type = "button";
                    removeBtn.className = "btn btn-outline-danger";
                    removeBtn.innerHTML = "&minus;";
                    removeBtn.onclick = () => removeAuthor(index);
                    btnGroup.appendChild(removeBtn);
                }
                if (isOwnWork && author.number === currentUser?.number) {
                    const note = document.createElement("small");
                    note.className = "text-muted ms-2 fst-italic";
                    note.textContent = "(You cannot remove yourself from your own work)";
                    authorInfo.appendChild(note);
                }

                const editBtn = document.createElement("button");
                editBtn.type = "button";
                editBtn.className = "btn btn-outline-secondary";
                editBtn.innerHTML = `<i class="fa-solid fa-pencil"></i>`;
                editBtn.onclick = () => openEditModal(index);
                btnGroup.appendChild(editBtn);

                li.appendChild(btnGroup);
            }

            authorList.appendChild(li);
        });
    }

    function makePrimary(index) {
        authors.forEach(a => a.isPrimaryAuthor = false);
        authors[index].isPrimaryAuthor = true;
        renderAuthorList();
        toastr.info(`"${authors[index].name}" set as primary author.`);
    }

    function removeAuthor(index) {
        const removed = authors.splice(index, 1)[0];
        if (removed.isPrimaryAuthor && authors.length > 0) {
            // if primary removed, set first internal author as primary
            setFirstInternalAsPrimary();
        }
        renderAuthorList();
        toastr.info(`Removed author "${removed.name}".`);
    }

    function hasPrimaryInternalAuthor() {
        return authors.some(a => a.isPrimaryAuthor && a.type === "internal");
    }

    function setFirstInternalAsPrimary() {
        for (let i = 0; i < authors.length; i++) {
            if (authors[i].type === "internal") {
                authors.forEach(a => a.isPrimaryAuthor = false);
                authors[i].isPrimaryAuthor = true;
                return;
            }
        }
    }

    //authorTypeSelect.addEventListener("change", () => {
    //    const val = authorTypeSelect.value;
    //    const externalOption = authorTypeSelect.querySelector('option[value="external"]');

    //    if (externalOption) {
    //        const hasInternal = authors.some(a => a.type === "internal");
    //        externalOption.disabled = !hasInternal;
    //    }

    //    if (val === "internal") {
    //        internalAuthorFields.classList.remove("d-none");
    //        externalAuthorFields.classList.add("d-none");
    //    } else if (val === "external") {
    //        externalAuthorFields.classList.remove("d-none");
    //        internalAuthorFields.classList.add("d-none");
    //        internalAuthorDetails.classList.add("d-none");
    //    } else {
    //        internalAuthorFields.classList.add("d-none");
    //        externalAuthorFields.classList.add("d-none");
    //        internalAuthorDetails.classList.add("d-none");
    //    }
    //});

    var foundAuthor = null;
    searchAuthorBtn.addEventListener("click", async function () {
        const username = authorNumberInput.value.trim();
        if (!username) {
            toastr.warning("Please enter a student or staff number to search.");
            return;
        }

        try {
            const response = await fetch(`/Oross/LookupInternalAuthor?username=${encodeURIComponent(username)}`);
            //if (!response.ok) throw new Error("Author not found");
            if (!response.ok) {
                let errorText = "Author not found"; // fallback
                try {
                    errorText = await response.text(); // controller returns text messages
                } catch (e) {
                    console.error("Failed to read error message", e);
                }
                throw new Error(errorText);
            }
            const found = await response.json();
            const isStudent = found.isUjStudent === "Yes";
        //    console.log(isStudent, found);
            detailUsername.textContent = found.staffUsername || found.staffNumber || username;
            detailFirstname.textContent = toProperCase(found.firstName || "");
            detailLastname.textContent = toProperCase(found.lastName || "");
            detailEmail.textContent = found.email || "";
            detailPosition.textContent = isStudent ? "Student" : (found.position && found.position !== "N/A" ? found.position : "Unknown");
            detailStaffNumber.textContent = maskMiddle(found.staffNumber);
            detailFaculty.textContent = found.faculty || "N/A";
            detailDepartment.textContent = found.department || "N/A";
            // detailCampus.textContent = found.campus || "N/A";
            orchidInput.value = found.orchid || "";
            foundAuthor = found;

            internalAuthorDetails.classList.remove("d-none");
            //if (!found) {
            //    toastr.error(`No author found with username "${username}".`);
            //    internalAuthorDetails.classList.add("d-none");
            //    return;
            //}
        } catch (error) {
            console.error(error);
            toastr.error(error.message || `No author found with username "${username}".`);
            internalAuthorDetails.classList.add("d-none");
        }
    });

    //addAuthorForm.addEventListener("submit", (e) => {
    //    e.preventDefault();

    //    const saveBtn = document.getElementById("saveAuthorBtn");
    //    saveBtn.disabled = true;
    //    setTimeout(() => saveBtn.disabled = false, 1000);

    //    const authorType = authorTypeSelect.value;

    //    if (!authorType) {
    //        toastr.error("Please select an author type.");
    //        return;
    //    }

    //    const submittingOwnWork = submissionSwitch.checked;
    //    let newAuthor = null;
    //    const isEditing = editingIndex !== null;
    //    const previousPrimary = isEditing ? authors[editingIndex].isPrimaryAuthor : false;

    //    if (authorType === "internal") {
    //        if (internalAuthorDetails.classList.contains("d-none")) {
    //            toastr.warning("Please search and confirm the internal author details first.");
    //            return;
    //        }

    //        const number = detailStaffNumber.textContent.trim();
    //        const firstname = detailFirstname.textContent.trim();
    //        const lastname = detailLastname.textContent.trim();
    //        const author = authors[editingIndex] || foundAuthor;

    //        if (
    //            !isEditing &&
    //            authors.some(a => a.number === number)
    //        ) {
    //            toastr.info("This author has already been added.");
    //            return;
    //        }

    //        newAuthor = {
    //            firstname,
    //            lastname,
    //            name: `${firstname} ${lastname}`,
    //            number: maskMiddle(number),
    //            position: detailPosition.textContent,
    //            faculty: detailFaculty.textContent,
    //            // campus: detailCampus.textContent,
    //            department: detailDepartment.textContent,
    //            email: detailEmail.textContent,
    //            isPrimaryAuthor: isEditing ? previousPrimary : (authors.length === 0 && submittingOwnWork),
    //            type: "internal",
    //            orchid: orchidInput.value.trim() || null,
    //            isUjStaff: author.isUjStaff,
    //            isUjStudent: author.isUjStudent,
    //            staffUsername: author.staffUsername,
    //            staffNumber: author.staffNumber,
    //        };

    //    } else if (authorType === "external") {
    //        const hasInternal = authors.some(a => a.type === "internal");
    //        if (!hasInternal) {
    //            toastr.error("At least one UJ (internal) author must be added before external authors.");
    //            return;
    //        }

    //        const fullName = externalAuthorNameInput.value.trim();
    //        const [first, ...rest] = fullName.split(" ");
    //        const firstname = toProperCase(first || "");
    //        const lastname = toProperCase(rest.join(" ") || "");
    //        const number = externalAuthorNumberInput.value.trim();
    //        const institution = externalInstitutionInput.value.trim();
    //        const institutionType = externalInstitutionTypeSelect.value;
    //        const institutionName = externalInstitutionTypeSelect.options[externalInstitutionTypeSelect.selectedIndex].text;
    //        const authorNumber = externalAuthorNumberInput.value;

    //        //if (!firstname || !lastname ||!institution || !institutionType) {
    //        //    toastr.warning("Please complete all external author fields.");
    //        //    return;
    //        //}

    //        if (
    //            !isEditing &&
    //            authors.some(a => a.number === number)
    //        ) {
    //            toastr.info(`Author "${firstname} ${lastname}" is already added.`);
    //            return;
    //        }

    //        newAuthor = {
    //            firstname,
    //            lastname,
    //            name: `${firstname} ${lastname}`,
    //            number,
    //            otherInstitutionType: institutionType,
    //            InstitutionName: institution,
    //            position: `${institutionName} - ${institution}`,
    //            isPrimaryAuthor: false,
    //            staffNumber: authorNumber,
    //            type: "external"
    //        };

    //        if (isEditing && previousPrimary) {
    //            toastr.warning("Primary designation removed since external authors can't be primary.");
    //        }
    //    }

    //    if (isEditing) {
    //        authors[editingIndex] = newAuthor;
    //    } else {
    //        authors.push(newAuthor);
    //    }

    //    if (!submittingOwnWork && !hasPrimaryInternalAuthor()) {
    //        setFirstInternalAsPrimary();
    //    }

    //    editingIndex = null;
    //    resetAuthorModal();
    //    renderAuthorList();
    //    addAuthorModal.hide();
    //});

    addAuthorForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const saveBtn = document.getElementById("saveAuthorBtn");
        saveBtn.disabled = true;
        setTimeout(() => saveBtn.disabled = false, 1000);

        const submittingOwnWork = submissionSwitch.checked;
        const isEditing = editingIndex !== null;
        const previousPrimary = isEditing ? authors[editingIndex].isPrimaryAuthor : false;

        if (internalAuthorDetails.classList.contains("d-none")) {
            toastr.warning("Please search and confirm the internal author details first.");
            return;
        }

        const number = detailStaffNumber.textContent.trim();
        const firstname = detailFirstname.textContent.trim();
        const lastname = detailLastname.textContent.trim();
        const author = isEditing ? authors[editingIndex] : foundAuthor;

        //console.log("isEditing:", isEditing)

        if (!isEditing) {
            const incomingNumber = normalizeNumber(foundAuthor);
            const duplicateAuthorFound = authors.some((a, idx) =>
                idx !== editingIndex && normalizeNumber(a) === incomingNumber
            );

            if (duplicateAuthorFound) {
                toastr.info("This author has already been added.");
                return;
            }
        }

        //if (!isEditing && authors.some(a => a.number === number)) {
        //    toastr.info("This author has already been added.");
        //    return;
        //}

        // Affiliation
        const isAffiliated = document.getElementById("affiliatedSwitch").value === "true";
        const affiliationInstitutionName = affiliationInstitution.value.trim();
        const dropdown = document.getElementById("externalInstitutionType");
        const externalInstitutionTypeValue = externalInstitutionType.value.trim();
        const externalInstitutionTypeText = dropdown.options[dropdown.selectedIndex].text;

        if (isAffiliated) {
            if (!affiliationInstitutionName) {
                toastr.error("Please enter the affiliated institution name.");
                return;
            }
            if (!externalInstitutionTypeValue) {
                toastr.error("Please select the type of affiliated institution.");
                return;
            }
        }


        const newAuthor = {
            firstname,
            lastname,
            name: `${firstname} ${lastname}`,
            number: maskMiddle(number),
            position: detailPosition.textContent,
            faculty: detailFaculty.textContent,
            department: detailDepartment.textContent,
            email: detailEmail.textContent,
            isPrimaryAuthor: isEditing ? previousPrimary : (authors.length === 0 && submittingOwnWork),
            type: isAffiliated ? "internal" : "external",
            orchid: orchidInput.value.trim() || null,
            isUjStaff: author.isUjStaff,
            isUjStudent: author.isUjStudent,
            staffUsername: author.staffUsername,
            staffNumber: author.staffNumber,
            isAffiliated,
            InstitutionName: isAffiliated ? affiliationInstitutionName : null,
            otherInstitutionType: isAffiliated ? externalInstitutionTypeText : null
        };

        if (isEditing) {
            authors[editingIndex] = newAuthor;
        } else {
            authors.push(newAuthor);
        }

        if (!submittingOwnWork && !hasPrimaryInternalAuthor()) {
            setFirstInternalAsPrimary();
        }

        editingIndex = null;
        resetAuthorModal();
        renderAuthorList();
        addAuthorModal.hide();
    });

    function maskMiddle(empNo) {
        if (!empNo || empNo.length <= 5) return empNo; // too short to mask

        return empNo.substring(0, 3) +
            '*'.repeat(empNo.length - 5) +
            empNo.substring(empNo.length - 2);
    }


    //function resetAuthorModal() {
    //    addAuthorForm.reset();
    //    internalAuthorFields.classList.add("d-none");
    //    externalAuthorFields.classList.add("d-none");
    //    internalAuthorDetails.classList.add("d-none");
    //    authorNumberInput.disabled = false;
    //    searchAuthorBtn.disabled = false;

    //    // Clear previewed internal info
    //    orchidInput.value = "";
    //    detailUsername.textContent = "";
    //    detailFirstname.textContent = "";
    //    detailLastname.textContent = "";
    //    detailEmail.textContent = "";
    //    detailPosition.textContent = "";
    //    detailFaculty.textContent = "";
    //    //  detailCampus.textContent = "";
    //    detailDepartment.textContent = "";
    //}

    function resetAuthorModal() {
        addAuthorForm.reset();

        internalAuthorDetails.classList.add("d-none");
        affiliationFields.classList.add("d-none");

        authorNumberInput.disabled = false;
        searchAuthorBtn.disabled = false;

        orchidInput.value = "";
        detailUsername.textContent = "";
        detailFirstname.textContent = "";
        detailLastname.textContent = "";
        detailEmail.textContent = "";
        detailPosition.textContent = "";
        detailFaculty.textContent = "";
        // detailCampus.textContent = "";
        detailDepartment.textContent = "";

        const affiliatedInput = document.getElementById("affiliatedSwitch");
        const slider = affiliatedInput.closest(".uj-switch-toggle").querySelector(".tri-state-slider");
        affiliatedInput.value = "false";
        slider.classList.remove("on", "off");
        slider.classList.add("off");


        // Reset affiliation fields
        affiliationInstitution.value = "";
        externalInstitutionType.value = "";
    }






    //function openEditModal(index) {
    //    editingIndex = index;
    //    document.getElementById("addAuthorModalLabel").textContent = "Edit author";
    //    document.getElementById("saveAuthorBtn").textContent = "Update author";
    //    const author = authors[index];

    //    // Select type
    //    authorTypeSelect.value = author.type;
    //    authorTypeSelect.disabled = true;

    //    authorTypeSelect.dispatchEvent(new Event('change'));

    //    if (author.type === 'internal') {
    //        // Show internal fields, hide external
    //        internalAuthorFields.classList.remove('d-none');
    //        externalAuthorFields.classList.add('d-none');

    //        // Fill search details section
    //        detailUsername.textContent = author.staffUsername;
    //        detailStaffNumber.textContent = maskMiddle(author.staffNumber);
    //        detailLastname.textContent = author.lastname;
    //        detailFirstname.textContent = author.firstname;
    //        detailEmail.textContent = author.email;
    //        detailPosition.textContent = author.position;
    //        detailFaculty.textContent = author.faculty;
    //        //  detailCampus.textContent = author.campus;
    //        detailDepartment.textContent = author.department;
    //        orchidInput.value = author.orchid || '';

    //        internalAuthorDetails.classList.remove('d-none');

    //        // Disable search button and number input
    //        authorNumberInput.value = author.number;
    //        authorNumberInput.disabled = true;
    //        searchAuthorBtn.disabled = true;
    //    } else {
    //        // External: fill all fields
    //        externalAuthorFields.classList.remove('d-none');
    //        internalAuthorFields.classList.add('d-none');
    //        internalAuthorDetails.classList.add('d-none');

    //        externalAuthorNameInput.value = author.name;
    //        externalAuthorNumberInput.value = author.number;
    //        externalInstitutionInput.value = author.position.split(' - ')[1] || '';
    //        externalInstitutionTypeSelect.value = author.otherInstitutionType.split(' - ')[0] || '';
    //    }

    //    addAuthorModal.show();
    //}
    //if (addAuthorBtn) {
    //    addAuthorBtn.addEventListener("click", () => {
    //        // Reset form fields
    //        resetAuthorModal(); // Already clears all fields and re-enables inputs
    //        editingIndex = null;
    //        authorTypeSelect.disabled = false;
    //        document.getElementById("addAuthorModalLabel").textContent = "Add author";
    //        document.getElementById("saveAuthorBtn").textContent = "Add author";
    //        // Disable external option if no internal authors yet
    //        const hasInternal = authors.some(a => a.type === "internal");
    //        const externalOption = authorTypeSelect.querySelector('option[value="external"]');
    //        if (externalOption) {
    //            externalOption.disabled = !hasInternal;
    //        }

    //        // Show the modal
    //        addAuthorModal.show();
    //    });
    //}

    function openEditModal(index) {
        editingIndex = index;

        document.getElementById("addAuthorModalLabel").textContent = "Edit Author";
        document.getElementById("saveAuthorBtn").textContent = "Update Author";

        const author = authors[index];

        // --- Fill internal details ---
        detailUsername.textContent = author.staffUsername || "";
        detailStaffNumber.textContent = maskMiddle(author.staffNumber || "");
        detailLastname.textContent = author.lastname || "";
        detailFirstname.textContent = author.firstname || "";
        detailEmail.textContent = author.email || "";
        detailPosition.textContent = author.position || "";
        detailFaculty.textContent = author.faculty || "";
        detailDepartment.textContent = author.department || "";
        orchidInput.value = author.orchid || "";

        internalAuthorDetails.classList.remove("d-none");

        // Disable searching because we're editing
        authorNumberInput.value = author.number || "";
        authorNumberInput.disabled = true;
        searchAuthorBtn.disabled = true;

        // Grab the switch container and hidden input
        const switchContainer = document.querySelector(".uj-switch-toggle[data-input-id='affiliatedSwitch']");
        const slider = switchContainer.querySelector(".tri-state-slider");
        const affiliatedSwitch = switchContainer.querySelector("input[type='hidden']");
        const affiliationFields = document.getElementById("affiliationFields");

        // Determine if the author is affiliated
        const isAffiliated = !!(author.InstitutionName || author.otherInstitutionType);

        // Update hidden input
        affiliatedSwitch.value = isAffiliated ? "true" : "false";

        // Update visual slider
        slider.classList.remove("on", "off", "mid"); // reset
        if (isAffiliated) {
            slider.classList.add("on");
            affiliationFields.classList.remove("d-none");
        } else {
            slider.classList.add("off");
            affiliationFields.classList.add("d-none");
        }


        // Fill affiliation fields if applicable
        if (isAffiliated) {
            affiliationInstitution.value = author.InstitutionName || "";

            const dropdown = document.getElementById("externalInstitutionType");
            dropdown.selectedIndex = 0;
            if (author.otherInstitutionType) {
                for (let i = 0; i < dropdown.options.length; i++) {
                    if (dropdown.options[i].text === author.otherInstitutionType) {
                        dropdown.selectedIndex = i;
                        break;
                    }
                }
            }
        }

        addAuthorModal.show();
    }




    if (addAuthorBtn) {
        addAuthorBtn.addEventListener("click", () => {
            // Reset modal fields and sections
            resetAuthorModal(); // clear all old/internal/external fields

            // Reset editing state
            editingIndex = null;

            // Reset modal labels/buttons
            document.getElementById("addAuthorModalLabel").textContent = "Add author";
            document.getElementById("saveAuthorBtn").textContent = "Add author";

            // Reset switches or additional fields in the new modal
            affiliatedSwitch.checked = false;
            affiliationFields.classList.add("d-none");
            affiliationInstitution.value = "";
            externalInstitutionType.value = "";

            // Show the modal
            addAuthorModal.show();
        });
    }



    submissionSwitch.addEventListener("change", () => {
        initAuthors();
    });
    initAuthors();



    const emailInput = document.getElementById("NotificationEmails");
    const feedback = document.getElementById("emailFeedback");
    const clearBtn = document.getElementById("clearEmailsBtn");
    const saveBtn = document.getElementById("saveEmailsBtn");

    function parseNotificationEmails(inputValue) {
        const raw = inputValue || "";
        const entries = raw.split(/[\s,]+/).map(e => e.trim()).filter(Boolean);
        const seen = new Set();
        const valid = [];
        const invalid = [];

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        entries.forEach(email => {
            if (email.toLowerCase().endsWith("@gmail")) {
                email += ".com";
            }
            if (!seen.has(email)) {
                seen.add(email);
                if (emailRegex.test(email)) valid.push(email);
                else invalid.push(email);
            }
        });
        return { valid, invalid };
    }

    function updateEmailUI() {
        const { valid, invalid } = parseNotificationEmails(emailInput.value);

        let html = `<span class="text-white">${valid.length} valid</span>`;
        if (invalid.length > 0) {
            html += ` | <span class="text-danger">${invalid.length} invalid:</span> `;
            html += invalid.map(e => `<code class="text-danger">${e}</code>`).join(", ");
        }

        feedback.innerHTML = html;
    }

    const saved = localStorage.getItem("savedEmails");
    if (saved) {
        emailInput.value = saved;
        updateEmailUI();
    }
    if (emailInput) {
        emailInput.addEventListener("input", updateEmailUI);
        emailInput.addEventListener("blur", updateEmailUI);

        clearBtn.addEventListener("click", () => {
            emailInput.value = "";
            feedback.innerHTML = "";
            localStorage.removeItem("savedEmails");
        });

        saveBtn.addEventListener("click", () => {
            const { valid } = parseNotificationEmails(emailInput.value);
            if (valid.length === 0) {
                toastr.warning("No valid emails to save.");
                return;
            }
            localStorage.setItem("savedEmails", valid.join(", "));
            //toastr.success("Email list saved.");
            updateEmailUI();
        });
    }
    $(function () {
        var tempDiv = $("#tempData");
        var titleMessage = tempDiv.data("title-exists");

        if (titleMessage) {
            toastr.error(titleMessage);
        }
    });

    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.setItem('scrollPosition', window.scrollY);
        const authorsToSubmit = authors.map(a => {
            if (a.isAffiliated && a.InstitutionName && a.otherInstitutionType) {
                const mapping = {
                    "Other SA institution": 1,
                    "Other international institution": 2,
                    "Other SA institution other than university": 3
                };
                return {
                    ...a,
                    otherInstitutionType: mapping[a.otherInstitutionType] || null
                };
            }
            return a;
        });
       
        document.getElementById('AuthorJson').value = JSON.stringify(authorsToSubmit);
        if (validateSubmissionForm()) {
            orossLoading.classList.remove("d-none");
            submitBtn.disabled = true;
            orossForm.submit();
        }
    });

    const bootstrapTabShow = (selector) => {
        const btn = document.querySelector(`[data-bs-target="${selector}"]`);
        if (btn) {
            const tabInstance = bootstrap.Tab.getInstance(btn) || new bootstrap.Tab(btn);
            tabInstance.show();
        }
    };

    // Next buttons
    document.querySelectorAll(".btn-next").forEach(btn => {
        btn.addEventListener("click", e => {
            const currentTab = e.target.closest('.tab-pane').id;
            const researchType = typeSelect.options[typeSelect.selectedIndex].text.toLowerCase();
            if (currentTab === 'general') {
                if (researchType === 'journal article') {
                    bootstrapTabShow('#fees');
                } else {
                    bootstrapTabShow('#documents');
                }
            }
            else if (currentTab === 'fees') {
                bootstrapTabShow('#documents');
            }
        });
    });
    document.querySelectorAll(".btn-back").forEach(btn => {
        btn.addEventListener("click", e => {
            const currentTab = e.target.closest('.tab-pane').id;
            const researchType = typeSelect.options[typeSelect.selectedIndex].text.toLowerCase();
            if (currentTab === 'fees') {
                bootstrapTabShow('#general');
            }
            else if (currentTab === 'documents') {
                if (researchType === 'journal article') {
                    bootstrapTabShow('#fees');
                } else {
                    bootstrapTabShow('#general');
                }
            }
        });
    });
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', onFileInputChange);

        // On initial load, also set button visibility based on whether file exists
        const btn = document.querySelector(`button[data-docid="${input.id}"]`);
        if (btn) {
            btn.style.display = input.files.length > 0 ? "" : "none";
        }
    });



    document.querySelectorAll("input[type='file']").forEach(input => {
        input.addEventListener("change", () => {
            clearError(`#${input.id}`);
        });
    });

    document.querySelectorAll("input, select, textarea").forEach(input => {
        input.addEventListener("change", () => {
            clearError(`#${input.id}`);
        });
    });

    document.querySelectorAll('.tri-state-slider').forEach(slider => {
        const container = slider.closest('.uj-switch-toggle');
        const hiddenInput = container.querySelector('input[type="hidden"]');
        const handle = slider.querySelector('.slider-handle');

        // Initialize visual state
        const initialValue = hiddenInput.value;
        if (initialValue === "true") slider.classList.add("on");
        else if (initialValue === "false") slider.classList.add("off");
        else slider.classList.add("null"); // initial null

        slider.addEventListener('click', (e) => {
            if (slider.dataset.disabled === "true") return;
            slider.classList.remove("has-error");

            const rect = slider.getBoundingClientRect();
            const clickX = e.clientX - rect.left; // click relative to slider
            const sliderMid = rect.width / 2;

            let nextValue;

            if (initialValue === "") {

                nextValue = clickX < sliderMid ? "false" : "true"; // left = No, right = Yes
            } else {

                nextValue = hiddenInput.value === "true" ? "false" : "true";
            }

            hiddenInput.value = nextValue;

            // Update visual state
            slider.classList.remove("on", "off", "null");
            slider.classList.add(nextValue === "true" ? "on" : "off");

            if (hiddenInput.id === "affiliatedSwitch") {
                if (nextValue === "true") affiliationFields.classList.remove("d-none");
                else affiliationFields.classList.add("d-none");
            }

            hiddenInput.dispatchEvent(new Event('valueChanged'));
        });
    });



    if (isEditMode) {
        const fieldsToDisable = ["ResearchType", "InstitutionalRepo", "OwnWork", "FeeDescription", "PublisherCurrency",
            "TotalCost", "ContributionPublisherCurrency", "ContributionZAR", "Volume", "Issue"];

        fieldsToDisable.forEach(name => {
            const field = document.querySelector(`[name='${name}']`);
            /*if (field) field.disabled = true;*/
            if (field) {
                field.classList.add('readonly-dropdown');
                field.setAttribute('readonly', 'readonly'); // optional, for inputs
                field.style.pointerEvents = 'none'; // prevents interaction
            }
        });

    }

    document.querySelectorAll('input[type="hidden"][name$=".IsChecked"]').forEach(hiddenInput => {
        hiddenInput.addEventListener('valueChanged', () => {
            if (hiddenInput.name === "OwnWorkModel.IsChecked") {
                initAuthors();
            }
        });
    });
    function validateSubmissionForm(options = {}) {
        const warnOnly = options.warnOnly === true;
        let hasErrors = false;
        const researchType = typeSelect.options[typeSelect.selectedIndex].text.toLowerCase();

        if (!warnOnly) {
            document.querySelectorAll(".text-danger.client").forEach(e => e.remove());
        }
        clearClientErrors();
        function showError(selector, message) {
            const field = document.querySelector(selector);
            if (!field) return;

            toastr.error(message);
            hasErrors = true; // ✅ automatically sets this

            // Highlight field
            field.classList.add("has-error");

            // Special handling for tri-state switches
            const switchWrapper = field.closest(".uj-switch-toggle");
            const triStateSlider = switchWrapper?.querySelector(".tri-state-slider");
            if (triStateSlider) {
                triStateSlider.classList.add("has-error");
                return; // Skip inline text
            }

            // Try named error span
            const errorId = selector.replace("#", "") + "Error";
            const existingSpan = document.getElementById(errorId);
            if (existingSpan) {
                existingSpan.textContent = message;
                return;
            }

            // Fallback inline error
            const wrapper = field.closest(".mb-3") ||
                field.closest(".form-group") ||
                field.closest(".col-md-6") ||
                field.closest(".col-md-12") ||
                document.querySelector(selector + "Wrapper") ||
                field.parentNode;

            if (wrapper && !wrapper.querySelector(".text-danger.client")) {
                const span = document.createElement("span");
                span.className = "text-danger client d-block mt-1";
                span.textContent = message;
                wrapper.appendChild(span);
            }
        }

        function isChecked(id) {
            return document.getElementById(id)?.checked;
        }


        function isFieldVisible(id) {
            const fileInput = document.getElementById(id);
            if (!fileInput) return false;
            const wrapper = fileInput.closest("div");
            return fileInput.offsetParent !== null && (!wrapper || wrapper.offsetParent !== null);
        }

        function validateDoc(id, label, required = true) {
            const fileInput = document.getElementById(id);
            const verifyInput = document.getElementById("verify" + id.charAt(0).toUpperCase() + id.slice(1));
            const button = document.querySelector(`button[data-docid="${id}"]`);

            if (!fileInput) return;

            const visible = isFieldVisible(id);
            if (!required && !visible) return;
            if (required && !visible) return;

            const hasFile = fileInput.files?.length > 0;
            const hasUploadedDoc = !!button?.getAttribute("data-docurl");

            if (required && !hasFile && !hasUploadedDoc) {
                showError(`#${id}`, `${label} is required.`);
                return;
            }

            if (hasFile) {
                const file = fileInput.files[0];
                const ext = file.name.split('.').pop().toLowerCase();
                const maxSizeMB = 20;
                const maxSizeBytes = maxSizeMB * 1024 * 1024;

                if (ext !== "pdf") {
                    showError(`#${id}`, `${label} must be a PDF.`);
                } else if (file.size > maxSizeBytes) {
                    showError(`#${id}`, `${label} must be less than ${maxSizeMB} MB.`);
                    fileInput.value = ""; // Clear the file
                } else if (!verifyInput || verifyInput.value !== "true") {
                    showError(`#${id}`, `${label} must be verified.`);
                } else {
                    clearError(`#${id}`);
                }
            }
        }




        function getPublicationNameLabel(type) {
            const map = {
                "journal article": "Journal Article Title",
                "book": "Book title",
                "book chapter": "Book chapter title",
                "conference paper": "Conference paper title"
            };
            return map[type] || "Publication Name";
        }

        // 📌 Validate publication name
        const publicationName = document.getElementById("PublicationName")?.value.trim();
        const publicationLabel = getPublicationNameLabel(researchType);
        if (!publicationName) {
            showError("#PublicationName", `${publicationLabel} is required.`);
        }

        // 📌 Shared required fields
        [
            ["#PublicationYear", "Publication year"],
            ["#Department", "Department"],
            ["#Faculty", "Faculty"],
            ["#SDG", "SDG"],
            ["#FunderName", "Public funder name"]
        ].forEach(([selector, label]) => {
            const el = document.querySelector(selector);
            if (el) {
                const value = el.value?.trim();
                const invalid = el.tagName === "SELECT"
                    ? (value === "0" || value === "" || el.selectedIndex === 0)
                    : !value;
                if (invalid) showError(selector, `${label} is required.`);
            }
        });

        const additionalUrlField = document.getElementById("AdditionalURL");
        const additionalUrl = additionalUrlField?.value.trim();

        if (additionalUrl) {
            try {
                const url = new URL(additionalUrl);
                // Optional: further restrict allowed protocols
                if (!["http:", "https:"].includes(url.protocol)) {
                    showError("#AdditionalURL", "URL must start with http:// or https://");
                }
            } catch (e) {
                showError("#AdditionalURL", "Please enter a valid URL.");
            }
        }


       //  📌 Internal author check
        //if (!authors.some(a => (a.type ?? a.Type ?? "").toLowerCase() === "internal")) {
        //    toastr.error("You must add at least one internal (UJ) author.");
        //    hasErrors = true;
        //}

        if (!authors || authors.length === 0) {
            toastr.error("You must add at least one author.");
            hasErrors = true;
        } else {
            const primaryAuthors = authors.filter(a => a.IsPrimaryAuthor === true || a.isPrimaryAuthor === true);

            if (primaryAuthors.length !== 1) {
                toastr.error("Please select an author as the primary author.");
                hasErrors = true;
            }
        }
        // 📌 Validate Institutional Repository switch
        const institutionalRepoValue = document.getElementById("InstitutionalRepo")?.value;
        if (institutionalRepoValue !== "true" && institutionalRepoValue !== "false") {
            showError("#InstitutionalRepo", "Please indicate whether to include your work in the Institutional Repository.");
        }
        const ownWorkValue = document.getElementById("OwnWork")?.value;
        if (ownWorkValue !== "true" && ownWorkValue !== "false") {
            showError("#OwnWork", "Please confirm if you are submitting your own work or on someone else's behalf.");
        }
        const is4IRPublicationValue = document.getElementById("Is4IRPublication")?.value;
        if (is4IRPublicationValue !== "true" && is4IRPublicationValue !== "false") {
            showError("#Is4IRPublication", "Please confirm whether this research is a 4IR publication.");
        }
        const isSoTLPublicationValue = document.getElementById("IsSoTLPublication")?.value;
        if (isSoTLPublicationValue !== "true" && isSoTLPublicationValue !== "false") {
            showError("#IsSoTLPublication", "Please confirm whether this research is a SoTL publication.");
        }

        // 📌 Journal-specific
        if (researchType === "journal article") {
            if (!document.getElementById("Volume")?.value.trim()) {
                showError("#Volume", "Volume is required.");
            }

            const hasFees = (() => {
                // Because your "PublicationFees" is a tri-state hidden input, you might need to get value differently:
                const feeInput = document.getElementById("PublicationFees");
                if (!feeInput) return false;
                return feeInput.value === "true"; // adjust if your hidden input stores "true"/"false"/""
            })();

            if (hasFees) {
                document.getElementById("feeDetailsSection")?.classList.remove("d-none");

                [
                    ["#FeeDescription", "Fee description"],
                    ["#PublisherCurrency", "Publisher currency"],
                    ["#TotalCost", "Total publishing cost"],
                    ["#ContributionPublisherCurrency", "Institution contribution (publisher currency)"],
                    ["#ContributionZAR", "Institution contribution (ZAR)"]
                ].forEach(([sel, label]) => {

                    const el = document.querySelector(sel);
                    const val = el?.value?.trim();

                    // SELECT validation
                    if (el?.tagName === "SELECT") {
                        if (val === "0" || el.selectedIndex === 0) {
                            showError(sel, `${label} is required.`);
                        } else {
                            clearError(sel);
                        }
                        return;
                    }

                    // TEXT / NUMBER validation
                    if (!val) {
                        showError(sel, `${label} is required.`);
                        return;
                    }

                    // numeric rules
                    const numVal = parseFloat(val);

                    if (sel === "#TotalCost") {
                        if (isNaN(numVal) || numVal <= 0) {
                            showError(sel, `${label} must be greater than 0.`);
                        } else {
                            clearError(sel);
                        }
                    }
                    else if (sel === "#ContributionPublisherCurrency" || sel === "#ContributionZAR") {
                        if (isNaN(numVal) || numVal < 0) {
                            showError(sel, `${label} cannot be negative.`);
                        } else {
                            clearError(sel);
                        }
                    }
                    else {
                        clearError(sel);
                    }
                });
            } else {
                if (!isChecked("NoFeeConfirmation")) {
                    showError("#NoFeeConfirmation", "Please confirm that no fees were paid.");
                } else {
                    clearError("#NoFeeConfirmation");
                }
                const noFeeReasons = document.getElementById("NoFeeReasons");
                if (!noFeeReasons || noFeeReasons.selectedOptions.length === 0) {
                    showError("#NoFeeReasons", "Reason for non-payment is required.");
                } else {
                    clearError("#NoFeeReasons");
                }
            }

            const openAccessValue = document.getElementById("OpenAccess")?.value;
            if (openAccessValue !== "true" && openAccessValue !== "false") {
                showError("#OpenAccess", "Please confirm that this research is open access.");
            }
            const dHETIndexedValue = document.getElementById("DHETIndexed")?.value;
            if (dHETIndexedValue !== "true" && dHETIndexedValue !== "false") {
                showError("#DHETIndexed", "Please confirm whether this research is DHET indexed.");
            }
            const publicationFeesValue = document.getElementById("PublicationFees")?.value;
            if (publicationFeesValue !== "true" && publicationFeesValue !== "false") {
                showError("#PublicationFees", "Please confirm whether there were publication fees paid for this article.");
            }

        }

        if (researchType !== "book") {
            const specialCategoryRequiredValue = document.getElementById("SpecialCategoryRequired")?.value;
            if (specialCategoryRequiredValue !== "true" && specialCategoryRequiredValue !== "false") {
                showError("#SpecialCategoryRequired", "Please confirm if this research falls under the following: All types of review, Data paper, Brief report, Protocol, Short communication.");
            }
        }
        if (researchType === "conference paper") {
            const isbnInput = document.getElementById("IsbnIssn");
            const conferenceName = document.getElementById("ConferenceName");
            const isbnValue = isbnInput?.value.trim();
            const conferenceNameValue = conferenceName?.value.trim();

            if (!isbnValue) {
                showError("#IsbnIssn", "ISBN/ISSN is required.");
            } else if (!/^[\d\-]+$/.test(isbnValue)) {
                showError("#IsbnIssn", "ISBN/ISSN must only contain numbers and hyphens.");
            }
            if (!conferenceNameValue) {
                showError("#ConferenceName", "Conference name is required.");
            }
        }

        const container = document.querySelector(`[data-type-only="${researchType}"]`);
        const isDhetIndexed = container?.getAttribute("data-dhet-indexed") === "true";
        const isSpecialType = container?.getAttribute("data-special-type") === "true";

        // Define document rules with dynamic required flags:
        const docRules = {
            "journal article": [
                ["PublishedPaper", "Published paper", true],
                ["Manuscript", "Manuscript", false],
                ["SupportingDoc", "Supporting document", false],
                ["TocUpload", "Table of contents", false],
                ["DhetLetter", "25/75% contribution letter", !isDhetIndexed],
                ["FqcDeclaration", "FQC-New research declaration", !isSpecialType],
            ],
            "book": [
                ["PublishedBook", "Published book", true],
                ["PeerReviewLetter", "Peer review process letter", true],
                ["PeerReviewComments", "Peer review comments", true],
                ["ScholarlyMotivation", "Scholarly motivation", true],
                ["LateMotivation", "Late motivation letter", false]
            ],
            "book chapter": [
                ["PublishedChapter", "Published chapter", true],
                ["PeerReviewLetterChapter", "Peer review process letter", true],
                ["PeerReviewCommentsChapter", "Peer review comments", true],
                ["ScholarlyMotivationChapter", "Scholarly motivation", true],
                ["LateMotivationChapter", "Late motivation letter", false],
                ["FqcDeclaration_Chapter", "FQC-New research declaration", !isSpecialType]
            ],
            "conference paper": [
                ["ConferencePublishedPaper", "Published paper", true],
                ["ConferenceManuscript", "Manuscript", false],
                ["ConferenceToc", "Full proceedings or table of contents", true],
                ["ConferencePeerReview", "Peer review process", true],
                ["ConferencePeerComments", "Peer review comments", true],
                ["CommitteeMembers", "Committee members", true],
                ["ConferenceSupportingDoc", "Supporting document", true],
                ["FqcDeclaration_Conference", "FQC-New research declaration", !isSpecialType]
            ]
        };

        if (!validateVolumeAndIssue(showError)) {
            hasErrors = true;
        }
        (docRules[researchType] || []).forEach(([id, label, required]) => {
            validateDoc(id, label, required);
        });


        if (hasErrors && !warnOnly) {
          //  toastr.error("Some details are missing or incorrect. Please check the highlighted fields.");
            return false;
        }

        return true;
    }



    document.getElementById("Volume")?.addEventListener("blur", function () {
        const value = this.value.trim();
        const regex = /^[a-zA-Z0-9\s\-\/]*$/;

        // Clear previous error
        const wrapper = this.closest(".col-md-6");
        const existingError = wrapper?.querySelector(".text-danger.client");
        if (existingError) existingError.remove();

        if (value && !regex.test(value)) {
            // Show error next to the field
            const errorSpan = document.createElement("span");
            errorSpan.className = "text-danger client d-block mt-1";
            errorSpan.textContent = "Volume cannot contain special characters.";
            wrapper.appendChild(errorSpan);
        }
    });

    document.getElementById("Issue")?.addEventListener("blur", function () {
        const value = this.value.trim();
        const regex = /^[a-zA-Z0-9\s\-\/]*$/;

        const wrapper = this.closest(".col-md-6");
        const existingError = wrapper?.querySelector(".text-danger.client");
        if (existingError) existingError.remove();

        if (value && !regex.test(value)) {
            const errorSpan = document.createElement("span");
            errorSpan.className = "text-danger client d-block mt-1";
            errorSpan.textContent = "Issue cannot contain special characters.";
            wrapper.appendChild(errorSpan);
        }
    });

});

(function () {
    var msg = document.getElementById("title-exists-message").value;
    if (msg) toastr.error(msg);
})();

function clearClientErrors() {
    document.querySelectorAll(".text-danger.client").forEach(el => el.remove());
}
function markDocumentAsVerified(docId) {
    const verifyInput = document.getElementById("verify" + docId);
    const button = document.querySelector(`button[data-docid="${docId}"]`);

    if (verifyInput) verifyInput.value = "true";

    if (button) {
        button.innerHTML = `<i class="bi bi-eye-check text-white"></i> Verified – View again`;
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-primary");
    }
}

function unmarkDocumentAsVerified(docId) {
    const verifyInput = document.getElementById("verify" + docId);
    const button = document.querySelector(`button[data-docid="${docId}"]`);

    if (verifyInput) verifyInput.value = "false";

    if (button) {
        button.innerHTML = `<i class="bi bi-eye"></i> View & verify`;
        button.classList.remove("btn-primary");
        button.classList.add("btn-outline-primary");
    }
}
function onFileInputChange(event) {
    const input = event.target;
    const newFile = input.files?.[0];
    const btn = document.querySelector(`button[data-docid="${input.id}"]`);
    const verifyInput = document.getElementById("verify" + input.id);

    // Reset verification hidden input and button style when file changes
    if (verifyInput) verifyInput.value = "false";

    if (btn) {
        btn.innerHTML = `<i class="bi bi-eye"></i> View & Verify`;
        btn.classList.remove("btn-success");
        btn.classList.add("btn-outline-primary");
    }

    if (!newFile) {
        if (btn) btn.style.display = "none";
        return;
    }

    const maxSizeMB = 20;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Check if file is PDF
    if (newFile.type !== "application/pdf") {
        showFileErrorModal(`File "${newFile.name}" must be a PDF.`, "Invalid file type");
        input.value = ""; // Clear input
        if (btn) btn.style.display = "none";
        return;
    }

    // Check file size
    if (newFile.size > maxSizeBytes) {
        showFileErrorModal(`File "${newFile.name}" exceeds ${maxSizeMB} MB.`, "File too large");
        input.value = ""; // Clear input
        if (btn) btn.style.display = "none";
        return;
    }

    // Check for duplicate file names
    const allFileInputs = document.querySelectorAll('input[type="file"]');
    for (const fileInput of allFileInputs) {
        if (fileInput === input) continue;
        const otherFile = fileInput.files?.[0];
        if (otherFile && otherFile.name === newFile.name) {
            showFileErrorModal(`File "${newFile.name}" has already been selected in another upload field.`, "Duplicate file detected");
            input.value = ""; // Clear input
            if (btn) btn.style.display = "none";
            return;
        }
    }

    if (btn) btn.style.display = "";
}



function showFileErrorModal(message, title = "File Error") {
    const modalBody = document.getElementById("fileErrorModalBody");
    const modalTitle = document.getElementById("fileErrorModalLabel");

    modalTitle.textContent = title;
    modalBody.textContent = message;

    const modal = new bootstrap.Modal(document.getElementById("fileErrorModal"));
    modal.show();
}
function clearError(selector) {
    const field = document.querySelector(selector);
    if (!field) return;

    // Remove field highlight
    field.classList.remove("has-error");

    // If it's a tri-state switch, also clear the visual error class
    const triSwitch = field.closest(".uj-switch-toggle")?.querySelector(".tri-state-slider");
    if (triSwitch) {
        triSwitch.classList.remove("has-error");
    }

    // Remove error text from a known error span (e.g., id="InstitutionalRepoError")
    const errorSpan = document.getElementById(selector.replace("#", "") + "Error");
    if (errorSpan) {
        errorSpan.textContent = "";
        return;
    }

    // Remove dynamically inserted error message span
    const wrapper = document.querySelector(selector + "Wrapper")
        || field.closest(".form-group")
        || field.closest(".mb-3")
        || field.closest(".col-md-6")
        || field.closest(".col-md-12")
        || field.parentNode;

    const inlineError = wrapper?.querySelector(".text-danger.client");
    if (inlineError) {
        inlineError.remove();
    }
}

function validateVolumeAndIssue(showError) {
    const volume = document.getElementById("Volume")?.value.trim();
    const issue = document.getElementById("Issue")?.value.trim();
    const regex = /^[a-zA-Z0-9\s\-\/]*$/;

    let valid = true;

    if (volume && !regex.test(volume)) {
        showError("#Volume", "Volume cannot contain special characters.");
        valid = false;
    }

    if (issue && !regex.test(issue)) {
        showError("#Issue", "Issue cannot contain special characters.");
        valid = false;
    }

    return valid;
}
function getProp(author, propCamel, propPascal) {
    return author[propCamel] ?? author[propPascal] ?? "";
}

const researchTypesDiv = document.getElementById("researchTypesData");
const researchOutputTypes = JSON.parse(researchTypesDiv.dataset.types);

function updateResearchTooltip(selectedType) {
    const researchBtn = document.getElementById("researchTooltipBtn");
    const supportingBtn = document.getElementById("SupportingDocTooltipBtn");



    const selectedObj = researchOutputTypes.find(
        t => t.description.toLowerCase().trim() === selectedType
    );

    const buttons = [researchBtn, supportingBtn];

    buttons.forEach(btn => {
        if (!btn) return;

        // Dispose existing tooltip
        const existingTooltip = bootstrap.Tooltip.getInstance(btn);
        if (existingTooltip) existingTooltip.dispose();

        if (selectedObj && selectedObj.outputTypeId === 4) {
            btn.style.display = "none";
            return;
        } else {
            btn.style.display = "inline-block";
        }


        let tooltipContent = "No details available"; // fallback

        if (selectedObj && selectedObj.checkList) {
            const checklistHtml = selectedObj.checkList
                .split("•")
                .filter(item => item.trim() !== "")
                .map(item => `<li>${item.trim()}</li>`)
                .join("");

            tooltipContent = `<ul style="margin:0; padding-left:1rem; text-align:left;">${checklistHtml}</ul>`;
        }

        btn.setAttribute("title", tooltipContent);

        const tooltip = new bootstrap.Tooltip(btn, {
            html: true,
            sanitize: false,
            placement: "top",
            customClass: "tooltip-left",
            container: btn.closest(".tab-pane, .form-section, .col-md-12, label") || document.body,
            trigger: "hover focus"
        });

        // Ensure correct position if inside a hidden tab
        const tabPane = btn.closest(".tab-pane");
        if (tabPane) {
            tabPane.addEventListener("shown.bs.tab", () => {
                tooltip.update();
            });
        }
    });
}
function updateCount(inputId, counterId, maxLength) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);

    input.addEventListener("input", function () {
        const length = input.value.length;
        counter.textContent = length;
        // Highlight if close to max
        if (length >= maxLength) {
            counter.style.color = "red";
        } else {
            counter.style.color = "inherit";
        }
    });
}
function normalizeNumber(a) {
    return a.staffNumber || a.number || "";
}





