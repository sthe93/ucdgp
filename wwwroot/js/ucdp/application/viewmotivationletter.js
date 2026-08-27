$(document).ready(function () {
    function base64ToBlob(base64, mime) {
        var byteCharacters = atob(base64);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mime });
    }

    function displayPDF(base64PDF) {
        var blob = base64ToBlob(base64PDF, 'application/pdf');
        var blobUrl = URL.createObjectURL(blob);

        var embedHTML = '<object data="' + blobUrl + '#toolbar=0&navpanes=0&scrollbar=0" type="application/pdf" style="width:100%; height:600px;">' +
            '<embed src="' + blobUrl + '#toolbar=0&navpanes=0&scrollbar=0" type="application/pdf" style="width:100%; height:600px;" />' +
            '</object>';
        document.getElementById('DocumentViewer').innerHTML = embedHTML;
    }



    function displayPDFv2(base64PDF) {
        // Convert Base64 → Blob
        var byteCharacters = atob(base64PDF);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        var blob = new Blob([byteArray], { type: "application/pdf" });

        // Create Blob URL
        var blobUrl = URL.createObjectURL(blob);

        // Build PDF embed HTML
        var embedHTML =
            '<object data="' + blobUrl + '#toolbar=0&navpanes=0&scrollbar=0" ' +
            'type="application/pdf" style="width:100%; height:750px;">' +
            '<embed src="' + blobUrl + '#toolbar=0&navpanes=0&scrollbar=0" ' +
            'type="application/pdf" style="width:100%; height:750px;" />' +
            '</object>';

        document.getElementById('DocumentViewer').innerHTML = embedHTML;
    }





    // Helper: robust Base64 → Uint8Array (handles url-safe base64, whitespace)
    function base64ToUint8Array(base64) {
        // Remove data URL prefix if present
        base64 = (base64 || '').trim()
            .replace(/^data:application\/pdf;base64,/i, '')
            .replace(/\s/g, '')
            .replace(/_/g, '/').replace(/-/g, '+'); // url-safe -> standard

        // Add padding if missing
        const pad = base64.length % 4;
        if (pad === 2) base64 += '==';
        else if (pad === 3) base64 += '=';
        else if (pad !== 0) {
            console.warn('Base64 length invalid, attempting decode anyway');
        }

        const raw = atob(base64);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        return arr;
    }

    function displayPDFInContainer(base64PDF, containerId) {
        // 1) Convert
        let bytes;
        try {
            bytes = base64ToUint8Array(base64PDF);
        } catch (e) {
            console.error('Base64 decode failed:', e);
            document.getElementById(containerId).innerHTML =
                '<div class="text-danger">Failed to decode PDF.</div>';
            return;
        }

        // 2) Quick sanity check: PDF usually starts with %PDF-
        const header = String.fromCharCode.apply(null, bytes.subarray(0, 5));
        if (!header.startsWith('%PDF-')) {
            console.warn('Byte header is not %PDF-. Header:', header);
            // not strictly required, but a strong indicator something is off
        }

        // 3) Build Blob and object URL
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        console.log('Blob URL:', blobUrl);

        // 4) Prefer <iframe> (more consistent than <object>/<embed> in modals)
        //    We keep both options; start with iframe.
        const html =
            '<iframe src="' + blobUrl + '#toolbar=0&navpanes=0&scrollbar=0" ' +
            'style="width:100%; height:100%; border:0;" ' +
            'title="PDF preview"></iframe>';

        const el = document.getElementById(containerId);
        el.innerHTML = html;

        // 5) Cleanup when modal closes to avoid memory leaks
        $('#viewDocumentModal').one('hidden.bs.modal', function () {
            try { URL.revokeObjectURL(blobUrl); } catch (e) { }
            el.innerHTML = '';
        });

        // 6) Fallback: if iframe fails to load (very rare), offer open in new tab
        setTimeout(() => {
            // If container looks empty or zero height, provide a fallback button
            const hasContent = el.querySelector('iframe');
            const visibleHeight = el.getBoundingClientRect().height;
            if (!hasContent || visibleHeight < 10) {
                console.warn('Iframe might not be rendering; providing fallback link.');
                el.innerHTML =
                    '<div class="alert alert-warning">Inline PDF preview may be blocked. ' +
                    '<a class="btn btn-sm btn-primary" href="' + blobUrl + '" target="_blank" rel="noopener">Open PDF in new tab</a></div>';
            }
        }, 600);
    }



});