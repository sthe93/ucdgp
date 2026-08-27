// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

window.config = window.config || {};
window.config.basePath = '/researchsuite';

(function () {
    const rawBase = window.config?.basePath || "/";
    const basePath = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

    let csrfToken = document.querySelector("input[name='__RequestVerificationToken']")?.value;

    //error page copy button

    const btn = document.getElementById('copyRequestId');

    if (btn) {
        btn.addEventListener('click', async function () {
            const code = document.getElementById('requestId');
            if (!code) return;

            const text = code.textContent.trim();

            if (!navigator.clipboard) {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();

                try {
                    document.execCommand('copy');
                } catch {
                    // Ignore copy failure
                }

                document.body.removeChild(ta);
            } else {
                try {
                    await navigator.clipboard.writeText(text);
                } catch {
                    // Ignore copy failure
                }
            }

            const original = btn.innerText;
            btn.innerText = 'Copied';
            btn.disabled = true;

            setTimeout(function () {
                btn.innerText = original;
                btn.disabled = false;
            }, 1500);
        });
    }

    function isAbsoluteUrl(url) {
        return /^https?:\/\//i.test(url) || /^\/\//.test(url);
    }

    function toAppUrl(url) {
        if (!url || typeof url !== "string") return url;

        if (isAbsoluteUrl(url)) return url;

        if (url.startsWith("#")) return url;
        if (url.startsWith("mailto:")) return url;
        if (url.startsWith("tel:")) return url;
        if (url.startsWith("javascript:")) return url;
        if (url.startsWith("data:")) return url;
        if (url.startsWith("blob:")) return url;

        if (basePath && url.startsWith(basePath + "/")) return url;
        if (url === basePath) return url;

        return `${basePath}/${url.replace(/^\/+/, "")}`;
    }

    const originalFetch = window.fetch;
    window.fetch = function (resource, config = {}) {
        if (typeof resource === "string") {
            resource = toAppUrl(resource);
        }

        config.headers = config.headers || {};
        if (csrfToken && !config.headers["X-CSRF-TOKEN-HEADERNAME"]) {
            config.headers["X-CSRF-TOKEN-HEADERNAME"] = csrfToken;
        }

        return originalFetch(resource, config);
    };

    if (typeof $ !== "undefined" && $.ajaxPrefilter) {
        $.ajaxPrefilter(function (options) {
            if (typeof options.url === "string") {
                options.url = toAppUrl(options.url);
            }

            if (csrfToken && (!options.headers || !options.headers["X-CSRF-TOKEN-HEADERNAME"])) {
                options.headers = options.headers || {};
                options.headers["X-CSRF-TOKEN-HEADERNAME"] = csrfToken;
            }
        });
    }

    document.addEventListener("click", function (e) {
        const link = e.target.closest("a[href]");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href) return;

        const newHref = toAppUrl(href);
        if (newHref !== href) {
            link.setAttribute("href", newHref);
        }
    }, true);
})();


document.querySelectorAll('.bubble-tile').forEach(bubble => {
    bubble.addEventListener('mousedown', () => {
        bubble.classList.add('pressed');
    });
    bubble.addEventListener('mouseup', () => {
        bubble.classList.remove('pressed');
    });
    bubble.addEventListener('mouseleave', () => {
        bubble.classList.remove('pressed');
    });
    bubble.addEventListener('touchstart', () => {
        bubble.classList.add('pressed');
    });
    bubble.addEventListener('touchend', () => {
        bubble.classList.remove('pressed');
    });

});


document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById('themeToggle');

    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'dark';

        // Apply saved theme
        document.body.setAttribute('data-bs-theme', savedTheme);
        document.body.classList.toggle('light-mode', savedTheme === 'light');
        themeToggle.textContent = savedTheme === 'light' ? '🌞' : '🌙';

        themeToggle.addEventListener('click', function () {
            const currentTheme = document.body.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.body.setAttribute('data-bs-theme', newTheme);
            document.body.classList.toggle('light-mode', newTheme === 'light');
            localStorage.setItem('theme', newTheme);
            themeToggle.textContent = newTheme === 'light' ? '🌞' : '🌙';
        });
    }



    // ==== Cookie Notice ====
    const cookieNotice = document.getElementById("cookieNotice");
    const acceptBtn = document.getElementById("acceptCookies");
    if (cookieNotice && acceptBtn && !localStorage.getItem("cookiesAccepted")) {
        cookieNotice.style.display = "block";
        acceptBtn.addEventListener("click", function () {
            localStorage.setItem("cookiesAccepted", "true");
            cookieNotice.style.display = "none";
        });
    }

    // ==== Password Toggle ====
    const toggleBtn = document.getElementById("togglePasswordBtn");
    const pwdInput = document.getElementById("passwordInput");
    const icon = document.getElementById("eyeIcon");
    if (toggleBtn && pwdInput && icon) {
        toggleBtn.addEventListener("click", function () {
            const type = pwdInput.type === "password" ? "text" : "password";
            pwdInput.type = type;
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");
        });
    }

    // ==== Select2 Init ====
    $('select[multiple]').select2({
        width: '100%',
        placeholder: "Select one or more options",
        allowClear: true
    });

    // ==== Bubbly Button Animation ====
    document.querySelectorAll('.bubble-tile').forEach(bubble => {
        bubble.addEventListener('mousedown', () => bubble.classList.add('pressed'));
        bubble.addEventListener('mouseup', () => bubble.classList.remove('pressed'));
        bubble.addEventListener('mouseleave', () => bubble.classList.remove('pressed'));
        bubble.addEventListener('touchstart', () => bubble.classList.add('pressed'));
        bubble.addEventListener('touchend', () => bubble.classList.remove('pressed'));
    });

    flatpickr(".datepicker", {
        dateFormat: "d M Y",
        allowInput: true
    });

    (function () {
        function isVisible(el) {
            return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        }

        function initTooltips(container) {
            container.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
                if (isVisible(el) && !bootstrap.Tooltip.getInstance(el)) {
                    new bootstrap.Tooltip(el, {
                        container: el.closest('.form-section') || el.closest('label') || document.body,
                        placement: el.getAttribute('data-bs-placement') || 'top',
                        boundary: 'clippingParents'
                    });

                    el.addEventListener('show.bs.tooltip', function () {
                        bootstrap.Tooltip.getInstance(el)?.update();
                    });
                }
            });
        }

        function disposeTooltips(container) {
            container.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
                bootstrap.Tooltip.getInstance(el)?.dispose();
            });
        }

        initTooltips(document);

        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) initTooltips(node);
                });
                mutation.removedNodes.forEach(function (node) {
                    if (node.nodeType === 1) disposeTooltips(node);
                });
                initTooltips(document);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('shown.bs.tab', function () {
            initTooltips(document);
        });

        //if (document.getElementById('sidebarToggle') != null) {
        //    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
        //}
    })();

    var tempDiv = $("#tempData");
    var loginError = tempDiv.data("login-error");

    if (loginError) {
        toastr.error(loginError);
    }

    var _loginError = tempDiv.data("oracle-profile");

    if (_loginError) {
        toastr.error(_loginError);
    }

    const toggleSideBtn = document.getElementById("sidebarToggle");
    if (toggleSideBtn) {
        toggleSideBtn.addEventListener("click", toggleSidebar);
    }
});

function toggleSidebar() {
    const layout = document.getElementById("moduleLayout");
    if (!layout) {
        console.warn("Layout container not found.");
        return;
    }
    layout.classList.toggle("sidebar-hidden");
}

// Toggle button




window.toProperCase = function (str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};









