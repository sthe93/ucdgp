document.addEventListener('DOMContentLoaded', function () {
    const modalEl = document.getElementById('viewVerifyModal');
    const viewModal = new bootstrap.Modal(modalEl);
    const iframe = document.getElementById('documentViewer');
    const modalTitle = document.getElementById('viewVerifyModalLabel');
    const spinner = document.getElementById('iframeSpinner');
    const fallback = document.getElementById('iframeFallback');

    // Reset iframe state
    function resetIframe() {
        iframe.onload = null;
        iframe.onerror = null;
        iframe.src = 'about:blank';
        iframe.style.display = 'none';
        iframe.style.opacity = 0;
        spinner.style.display = 'none';
        fallback.style.display = 'none';
    }

    function loadDocument(docUrl, docName) {
        resetIframe();

        spinner.style.display = 'block';
        fallback.style.display = 'none';
        iframe.style.display = 'none';
        modalTitle.textContent = "Viewing: " + docName;

        const requestId = crypto.randomUUID();

        iframe.onload = () => {
            console.log("PDF iframe onload fired");

            let attempts = 0;
            const maxAttempts = 40; // ~4s if interval = 100ms

            const pollInterval = setInterval(() => {
                attempts++;

                try {
                    // Check if iframe has any visible content drawn
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc && iframeDoc.body /*&& iframeDoc.body.innerHTML.trim().length > 0*/) {
                        console.log("PDF content detected, showing iframe");

                        clearInterval(pollInterval);
                        spinner.style.display = 'none';
                        iframe.style.display = 'block';
                        iframe.style.opacity = 0;

                        let opacity = 0;
                        const fade = setInterval(() => {
                            opacity += 0.05;
                            iframe.style.opacity = opacity;
                            if (opacity >= 1) clearInterval(fade);
                        }, 20);
                    }
                } catch (err) {
                    // Cross-origin PDFs won’t allow DOM inspection
                    // fallback: just show after a safe delay
                    console.warn("Cross-origin PDF, falling back to delay");
                    clearInterval(pollInterval);
                    setTimeout(() => {
                        spinner.style.display = 'none';
                        iframe.style.display = 'block';
                    }, 800);
                }

                if (attempts >= maxAttempts) {
                    console.warn("PDF content not detected, forcing show");
                    clearInterval(pollInterval);
                    spinner.style.display = 'none';
                    iframe.style.display = 'block';
                }
            }, 100);
        };

        iframe.onerror = () => {
            spinner.style.display = 'none';
            iframe.style.display = 'none';
            fallback.style.display = 'block';
            console.error("PDF failed to load");
        };

        const onShown = () => {
            modalEl.removeEventListener('shown.bs.modal', onShown);
            setTimeout(() => {
                iframe.src = docUrl + (docUrl.includes('?') ? '&' : '?') + 'v=' + requestId;
            }, 50);
        };

        modalEl.addEventListener('shown.bs.modal', onShown);
        viewModal.show();
    }

    document.querySelectorAll('.btnViewDocument').forEach(btn => {
        btn.addEventListener('click', function () {
            const docName = this.dataset.docname;
            const docUrl = this.dataset.docurl;
            loadDocument(docUrl, docName);
        });
    });

    modalEl.addEventListener('hidden.bs.modal', resetIframe);

});

