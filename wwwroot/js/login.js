
$(document).ready(function (e) {

	const ua = navigator.userAgent.toLowerCase();
	const $unsupported = $("#chromeNotification");

	// Ensure notification is hidden by default
	$unsupported.css("display", "none");

	// Browser checks (basic, userAgent-based)
	const isChromiumEdge = ua.indexOf("edg/") > -1 || ua.indexOf("edge/") > -1;
	const isOpera = ua.indexOf("opr/") > -1 || ua.indexOf("opera") > -1;
	const isFirefox = ua.indexOf("firefox") > -1;
	const isSafari = ua.indexOf("safari") > -1 && ua.indexOf("chrome") === -1 && ua.indexOf("crios") === -1 && !isOpera;
	const isChrome = ua.indexOf("chrome") > -1 && !isChromiumEdge && !isOpera && ua.indexOf("crios") === -1;

	// Show a single, shared message for all non-Chrome browsers
	if (!isChrome) {
		$unsupported.css("display", "block");
	}
});

