document.addEventListener('DOMContentLoaded', function () {

    evaluateDocumentVisibility();

    const selectElem = document.querySelector('#ResearchTypeSelect');
    document.getElementById('DHETIndexed').addEventListener('change', function () {
        if (this.checked) {
            toastr.info("Please note that a 25/75% letter is required for DHET-indexed submissions.");
        }
    });

    const feeSwitch = document.getElementById("PublicationFees");
    const feeDetailsSection = document.getElementById("feeDetailsSection");
    const noFeesSection = document.getElementById("noFeesSection");

    feeSwitch.addEventListener('valueChanged', function () {
        const feeValue = feeSwitch.value; // "true", "false", or ""

        if (feeValue === "true") {
            feeDetailsSection.classList.remove('d-none');
            noFeesSection.classList.add('d-none');
        } else {
            feeDetailsSection.classList.add('d-none');
            noFeesSection.classList.remove('d-none');


            toastr.info("Please confirm that no publication fees were paid and provide a reason.");
        }
    });

    (function initFeeSection() {
        const feeValue = feeSwitch.value;

        if (feeValue === "true") {
            feeDetailsSection.classList.remove('d-none');
            noFeesSection.classList.add('d-none');
        } else {
            feeDetailsSection.classList.add('d-none');
            noFeesSection.classList.remove('d-none');
        }
    })();


    document.getElementById('SpecialCategoryRequired').addEventListener('change', function () {
        if (this.checked) {
            toastr.info("Please note that a FQC-New Research Declaration is required");
        }
    });

    const specialCategorySwitch = document.getElementById('SpecialCategoryRequired');
    const dhetSwitch = document.getElementById('DHETIndexed');

    function updateVisibility() {
        toggleDocumentVisibility({
            fqc: specialCategorySwitch?.value === "true",
            dhet: dhetSwitch?.value === "true",
        });
    }

    // Attach listeners
    if (specialCategorySwitch) {
        specialCategorySwitch.addEventListener('valueChanged', updateVisibility);
    }

    if (dhetSwitch) {
        dhetSwitch.addEventListener('valueChanged', updateVisibility);
    }

    updateVisibility();
    function toggleDocumentSections(selectedType) {
        document.querySelectorAll('[data-type-only]').forEach(div => {
            if (div.getAttribute('data-type-only') === selectedType) {
                div.style.display = 'block';
            } else {
                div.style.display = 'none';
            }
        });
    }

    if (selectElem) {
        selectElem.addEventListener('change', e => {
            toggleDocumentSections(e.target.value.toLowerCase());

        });
        console.log(selectElem);

        // Initial toggle on page load
        toggleDocumentSections(selectElem.value.toLowerCase());
    }

    document.querySelectorAll('input[type="file"]').forEach(fileInput => {
        const docId = fileInput.id;
        const button = document.querySelector(`button[data-docid="${docId}"]`);
        const verifyInput = document.getElementById(`verify${docId}`);
        const viewer = document.getElementById('documentViewer');
        const modal = document.getElementById('viewVerifyModal');
        const checkbox = document.getElementById('modalVerifyCheckbox');
        const label = document.getElementById('modalVerifyLabel');

        // Show/hide the view button
        function toggleButtonVisibility() {
            if (fileInput.files && fileInput.files.length > 0) {
                button.style.display = 'inline-block';
            } else {
                button.style.display = 'none';
            }
        }

        // Initial check
        toggleButtonVisibility();

        fileInput.addEventListener('change', function () {
            toggleButtonVisibility();

            const labelText = this.closest(".mb-3")?.querySelector("label")?.textContent.trim() || docId;

            // Reset verify state
            if (verifyInput) verifyInput.value = "false";

            if (button) {
                button.innerHTML = `<i class="bi bi-eye"></i> View & Verify`;
                button.classList.remove("btn-primary");
                button.classList.add("btn-outline-primary");
            }

            // If modal is open and this is the current doc, update the iframe and checkbox
            const currentId = viewer.getAttribute('data-current-id');
            if (modal.classList.contains('show') && currentId === docId) {
                const file = this.files?.[0];
                if (file) {
                    viewer.src = URL.createObjectURL(file) + `#t=${new Date().getTime()}`;
                    checkbox.disabled = false;
                    checkbox.checked = false;
                    label.textContent = `I confirm I have viewed and verified the ${labelText}.`;
                }
            }

            validateDocField(docId, labelText);
        });

        modal.addEventListener('hidden.bs.modal', function () {
            viewer.removeAttribute('src'); // safer than setting empty string
            viewer.removeAttribute('data-current-id');
        });
    });


    const isbnInput = document.getElementById('IsbnIssn');

    if (isbnInput) {
        isbnInput.addEventListener("blur", function () {
            const val = this.value.trim();
            if (val && !/^[\d\-]+$/.test(val)) {
                showError("#IsbnIssn", "ISBN/ISSN must only contain numbers and hyphens.");
            }
        });
    }
    (function () {
        // Prevent typing invalid characters into number inputs
        $(document).on("keydown", "input[type='number']", function (e) {
            const invalidKeys = ["e", "E", "+", "-", ","];
            if (invalidKeys.includes(e.key)) {
                e.preventDefault();
            }
        });

        // Clean pasted input properly instead of just blocking it
        $(document).on("paste", "input[type='number']", function (e) {
            e.preventDefault();

            const pasted = (e.originalEvent || e).clipboardData.getData("text");

            let cleaned = pasted
                .replace(/\s/g, "")        // remove spaces
                .replace(/,/g, ".")        // convert comma to dot
                .replace(/[^\d.]/g, "");   // keep only numbers + dot

            // ensure only one decimal point
            const parts = cleaned.split(".");
            if (parts.length > 2) {
                cleaned = parts[0] + "." + parts.slice(1).join("");
            }

            // insert cleaned value
            document.execCommand("insertText", false, cleaned);
        });

    })();

    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('blur', () => {
            let val = input.value;

            if (!val) return;

            if (/^0(\.\d+)?$/.test(val)) return;

            val = val.replace(/^0+(\d)/, '$1');

            input.value = val;
        });
    });


    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('blur', () => {
            let val = input.value;
            if (!val) return;
            if (/^0(\.\d+)?$/.test(val)) return;
            input.value = val.replace(/^0+(\d)/, '$1');
        });
    });

    $(document).on('click', '.btnOpen', function () {
        const url = $(this).val();

        if (url) {
            $('#documentViewer').attr('src', url);

            $('#viewVerifyModal').data('view-only', true);

            $('#viewVerifyModal').modal('show');
        }
    });

    $('#viewVerifyModal').on('shown.bs.modal', function () {
        const isViewOnly = $(this).data('view-only') === true;

        const $checkbox = $('#modalVerifyCheckbox');
        const $label = $('#modalVerifyLabel');

        const viewer = document.getElementById('documentViewer');
        const docId = viewer?.getAttribute('data-current-id');

        if (isViewOnly) {
            $checkbox.prop('checked', true).prop('disabled', true);
            $label.text("You are viewing the uploaded document. Verification is already completed.");

            const $verifyInput = $(`#verify${docId}`);
            if ($verifyInput.length) {
                $verifyInput.val("true");
            }
        } else {
            $checkbox.prop('disabled', false).prop('checked', false);

            const labelText = document.querySelector(`[id="${docId}"]`)?.closest(".mb-3")?.querySelector("label")?.textContent.trim() || "document";
            $label.text(`I confirm I have viewed and verified the ${labelText}.`);
        }
    });


    $('#viewVerifyModal').on('hidden.bs.modal', function () {
        $(this).removeData('view-only');
    });

    const checkbox = document.getElementById('modalVerifyCheckbox');
    const hiddenInput = document.querySelector('input[type="hidden"][id^="verify"]');
    if (checkbox) {
        // Set to true if disabled, otherwise keep its current checked state
        if (checkbox.disabled) {
            checkbox.checked = true;
        }

        // Sync hidden input to match checkbox state
        if (hiddenInput) {
            hiddenInput.value = checkbox.checked ? "true" : "false";
        }
    }
});

function toggleDocumentVisibility({ fqc = false, dhet = false, classification = false }) {
    document.querySelectorAll('[id^="fqcDeclarationUpload"]').forEach(el => {
        el.classList.toggle("d-none", !fqc);
    });
    const dhetUploadDiv = document.getElementById("dhetLetterUpload");
    if (dhetUploadDiv) {
        dhetUploadDiv.classList.toggle("d-none", !dhet);
    }

}
function evaluateDocumentVisibility() {
    const modal = document.getElementById('viewVerifyModal');

    modal.addEventListener('show.bs.modal', function (event) {
        const trigger = event.relatedTarget;
        if (!trigger) return;

        const docName = trigger.getAttribute('data-docname');
        const docUrl = trigger.getAttribute('data-docurl');
        const docId = trigger.getAttribute('data-docid');
        const hiddenInputId = `verify${docId}`;

        const viewer = document.getElementById('documentViewer');
        const fileInput = document.getElementById(docId);
        const file = fileInput?.files?.[0];
        const hiddenInput = document.getElementById(hiddenInputId);
        const checkbox = document.getElementById('modalVerifyCheckbox');
        const label = document.getElementById('modalVerifyLabel');

        // Set modal title and document
        document.getElementById('viewVerifyModalLabel').textContent = `View & Verify: ${docName}`;
        viewer.setAttribute('data-current-id', docId);
        viewer.src = file ? URL.createObjectURL(file) : docUrl || "";

        // Label setup
        label.setAttribute('for', checkbox.id);
        label.textContent = `I confirm I have viewed and verified the ${docName}.`;

        // Always reset checkbox change handler
        checkbox.onchange = null;

        const isViewOnly = trigger.dataset.viewOnly === "true";
        console.log("isViewOnly:", isViewOnly)
        if (isViewOnly) {
            checkbox.checked = true;
            checkbox.disabled = true;
            if (hiddenInput) hiddenInput.value = "true";
        } else {
            checkbox.disabled = false;
            checkbox.checked = hiddenInput?.value === "true";

            checkbox.onchange = () => {
                const isChecked = checkbox.checked;

                if (hiddenInput) {
                    hiddenInput.value = isChecked ? "true" : "false";
                }

                if (isChecked) {
                    markDocumentAsVerified(docId);
                    trigger.innerHTML = `<i class="bi bi-check-circle-fill text-white"></i> Verified`;
                    trigger.classList.remove("btn-outline-primary");
                    trigger.classList.add("btn-primary");
                } else {
                    unmarkDocumentAsVerified(docId);
                    trigger.innerHTML = `<i class="bi bi-eye"></i> View & Verify`;
                    trigger.classList.remove("btn-primary");
                    trigger.classList.add("btn-outline-primary");
                }

                const labelText = trigger.closest(".mb-3")?.querySelector("label")?.textContent.trim() || docId;
                validateDocField(docId, labelText);
            };
        }
    });

}


function showError(selector, message) {
    const field = document.querySelector(selector);
    if (!field) return;

    const wrapper = field.closest(".mb-3") || field.closest(".form-group") || field.parentNode;
    let error = wrapper.querySelector(".text-danger.client");

    if (!error) {
        error = document.createElement("span");
        error.className = "text-danger client d-block mt-1";
        wrapper.appendChild(error);
    }

    error.textContent = message;
}

//function clearError(selector) {
//    const field = document.querySelector(selector);
//    if (!field) return;

//    const wrapper = field.closest(".mb-3") || field.closest(".form-group") || field.parentNode;
//    const error = wrapper.querySelector(".text-danger.client");
//    if (error) error.remove();
//}

function validateDocField(id, label, required = true) {
    const input = document.getElementById(id);
    const verify = document.getElementById("verify" + id);

    if (!input || input.offsetParent === null) {
        clearError(`#${id}`);
        return;
    }

    const hasFile = input.files?.length > 0;
    if (required && !hasFile) {
        showError(`#${id}`, `${label} is required.`);
        return;
    }

    if (hasFile) {
        const ext = input.files[0].name.split(".").pop().toLowerCase();
        if (ext !== "pdf") {
            showError(`#${id}`, `${label} must be a PDF.`);
            return;
        }

        if (!verify || verify.value !== "true") {
            showError(`#${id}`, `${label} must be verified.`);
            return;
        }

        clearError(`#${id}`);
    }
}
function removeClientError(inputId) {
    const validationMsg = document.querySelector(`span[data-valmsg-for="${inputId}"]`);
    if (validationMsg) {
        validationMsg.textContent = "";
        validationMsg.classList.remove("field-validation-error");
        validationMsg.classList.add("field-validation-valid");
    }

    const input = document.getElementById(inputId);
    if (input) {
        input.classList.remove("input-validation-error");
    }
}




