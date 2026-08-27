using Microsoft.AspNetCore.Mvc;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;

namespace ResearchSuite.Areas.UCDP.Controllers
{
    [Area("UCDP")]
    [Route("UCDP/Applications")]
    public class ApplicationsDashboardController : Controller
    {
        private readonly IApplicationsDashboardService _svc;
        private readonly IConfiguration _configuration;
        private readonly IUcdpService _ucdpService;

        public ApplicationsDashboardController(IApplicationsDashboardService svc, IConfiguration configuration, IUcdpService ucdpService)
        {
            _svc = svc;
            _configuration = configuration;
            _ucdpService = ucdpService;
        }

        private async Task<bool> IsProgressReportClosed()
        {
            var testDateValue = _configuration["UcdpSettings:ProgressReportTestCutOffDate"];
            var cutOffValue = _configuration["UcdpSettings:ProgressReportCutOffDate"] ?? "01-15";

            var today = DateTime.Today;

            // Override cutoff date for testing if supplied
            var effectiveCutOffValue = string.IsNullOrWhiteSpace(testDateValue) ? cutOffValue : testDateValue;

            var parts = effectiveCutOffValue.Split('-');

            var cutOffDate = new DateTime(
                today.Year,
                int.Parse(parts[0]),
                int.Parse(parts[1]));

            var fundingCalls = await _ucdpService.GetFundingCalls();

            var hasActiveFundingCall = fundingCalls.Any(r =>
                r.FundingCallStatus.FundingCallStatusId == 2 &&
                r.OpeningDate.Date <= today &&
                r.ClosingDate.Date > today);

            return today > cutOffDate && !hasActiveFundingCall;
        }
        [HttpGet("bootstrap")]
        public async Task<IActionResult> Bootstrap()
        {
            var me = await _svc.Me();

            if (me == null)
                return Json(new { me = (object?)null });

            var showApproverTabs = me.ShowApproverTabs;
            var hasTeamHistory = me.HasTeamHistory;
            var canApply = me.CanApply;

            object? mine = null;
            object? inbox = null;
            object? history = null;

            if (canApply)
                mine = await _svc.My();

            if (showApproverTabs)
                inbox = await _svc.Inbox();

            if (hasTeamHistory)
            {
                history = await _svc.HistoryMyTeam();
            }
            var progressReportClosed = await IsProgressReportClosed();

            return Json(new
            {
                me,
                mine,
                inbox,
                history,
                progressReportClosed
            });
        }

        [HttpGet("")]
        public IActionResult Index() => View();

        // JSON endpoints for the JS on the page:
        [HttpGet("me")]
        public async Task<IActionResult> Me() => Json(await _svc.Me());

        [HttpGet("inbox")]
        public async Task<IActionResult> Inbox() => Json(await _svc.Inbox());

        [HttpGet("my")]
        public async Task<IActionResult> My() => Json(await _svc.My());

        [HttpGet("processed")]
        public async Task<IActionResult> Processed([FromQuery] string mode = "IProcessed")
            => Json(await _svc.Processed(mode));

        [HttpPost("admin/refresh-approvers")]
        public async Task<IActionResult> RefreshApprovers()
            => Json(await _svc.RefreshApprovers());

        [HttpGet("history/myteam")]
        public async Task<IActionResult> HistoryMyTeam()
            => Json(await _svc.HistoryMyTeam());

    }

}
