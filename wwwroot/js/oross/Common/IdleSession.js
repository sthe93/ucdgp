document.addEventListener('DOMContentLoaded', function () {

    // ===== CONFIG =====
    const isTesting = false; // true = seconds, false = production (minutes)
    const idleThreshold = isTesting ? 10 : 5 * 60; // 5s for testing, 5 min production
    const countdownSeconds = isTesting ? 10 : 60;   // countdown time

    let idleTime = 0;
    let idleInterval;
    let countdownTimer;
    let countdownValue = countdownSeconds;
    let isModalVisible = false;
    let lastActivityTime = Date.now();

    function deleteAllCookies() {
        document.cookie.split(";").forEach(function (cookie) {
            const name = cookie.split("=")[0].trim();
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        });
    }

    function logout() {
        localStorage.clear();
        deleteAllCookies();
        window.location.replace("/researchsuite/Account/Logout");
    }

    function showWarningPopup() {
        if (isModalVisible) return;
        isModalVisible = true;
      //  console.log("Showing session timeout popup...");

        $("#sessionTimeoutModal").addClass("show");

        countdownValue = countdownSeconds;
        const countdownEl = $("#countdown");
        countdownEl.text(countdownValue);

        countdownTimer = setInterval(function () {
            countdownValue--;
            countdownEl.text(countdownValue);

            countdownEl.addClass("animate");
            setTimeout(() => countdownEl.removeClass("animate"), 300);

            if (countdownValue <= 0) {
                clearInterval(countdownTimer);
                logout();
            }
        }, 1000);
    }

    async function stayLoggedIn() {
        try {
            const response = await fetch("/Account/KeepAlive", {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store"
            });

            if (!response.ok) {
                showExpiredSessionModal();
                return;
            }

            idleTime = 0;
            lastActivityTime = Date.now();
            isModalVisible = false;
            clearInterval(countdownTimer);
            $("#sessionTimeoutModal").removeClass("show");

        } catch {
            showExpiredSessionModal();
        }
    }

    function showExpiredSessionModal() {
        isModalVisible = true;
        clearInterval(countdownTimer);

        $("#sessionTimeoutModal").addClass("show");
        $("#countdown").text("0");

        $("#stayLoggedInBtn")
            .text("Login again")
            .off("click")
            .on("click", function () {
                logout();
            });

        $("#logoutNowBtn").hide();
    }
    document.addEventListener("visibilitychange", async function () {
        if (document.visibilityState !== "visible") return;

        const awaySeconds = Math.floor((Date.now() - lastActivityTime) / 1000);

        if (awaySeconds >= idleThreshold) {
            try {
                const response = await fetch("/Account/CheckSession", {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store"
                });

                if (!response.ok) {
                    showExpiredSessionModal();
                    return;
                }

                showWarningPopup();

            } catch {
                showExpiredSessionModal();
            }
        }
    });

    function resetIdleTime() {
        if (isModalVisible) return;
        idleTime = 0;
        lastActivityTime = Date.now();
    }

    function checkUserIdleTime() {
        idleInterval = setInterval(function () {
            idleTime++;
            //console.log("Idle time:", idleTime, "seconds");
            //console.log("isModalVisible:", isModalVisible);

            if (idleTime >= idleThreshold && !isModalVisible) {
                showWarningPopup();
            }
        }, 1000); // 1s for testing, 1min production
    }

    $(document).on('mousemove keypress click scroll', resetIdleTime);

    checkUserIdleTime();

    $("#stayLoggedInBtn").click(stayLoggedIn);
    $("#logoutNowBtn").click(logout);

});
