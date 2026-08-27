using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;
using Syncfusion.HtmlConverter;
using Syncfusion.Pdf;
using IHostingEnvironment = Microsoft.AspNetCore.Hosting.IHostingEnvironment;

namespace ResearchSuite.Controllers.UCDPControllers
{
    [Route("Ucdp/[controller]")]
    public class PDFController : Controller
    {
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IMyApplicationsService _myApplicationsService;
        private readonly ICompositeViewEngine _viewEngine;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public PDFController(IOptions<AppSettings> appSettings,
            IHostingEnvironment hostingEnvironment,
            IMyApplicationsService myApplicationsService,
             ICompositeViewEngine viewEngine,
             IHttpContextAccessor httpContextAccessor
            )
        {
            _appSettings = appSettings.Value;
            _hostingEnvironment = hostingEnvironment;
            _myApplicationsService = myApplicationsService;
            _viewEngine = viewEngine;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost("GetPDFDocument")]
        public async Task<IActionResult> GetPDFDocument(string referenceNumber)
        {
            ApplicationDetailsViewModel application = new ApplicationDetailsViewModel();

            application = await _myApplicationsService.GetAwardLetter(referenceNumber);

            ViewData["Title"] = "Award Letter";
            ViewData.Model = application;

            var viewName = "~/Views/UCDP/MyApplications/AwardLetter.cshtml";
            string htmlContent;

            using (var writer = new StringWriter())
            {
                var viewResult = _viewEngine.GetView(null, viewName, false);

                if (!viewResult.Success)
                {
                    return NotFound($"The view {viewName} was not found.");
                }

                var viewContext = new ViewContext(
                    ControllerContext,
                    viewResult.View,
                    ViewData,
                    TempData,
                    writer,
                    new HtmlHelperOptions()
                );

                await viewResult.View.RenderAsync(viewContext);
                htmlContent = writer.ToString();
            }

            HtmlToPdfConverter htmlConverter = new HtmlToPdfConverter(HtmlRenderingEngine.Blink);

            BlinkConverterSettings settings = new BlinkConverterSettings();

            settings.BlinkPath = Path.Combine(_hostingEnvironment.ContentRootPath, "BlinkBinariesWindows");

            htmlConverter.ConverterSettings = settings;
            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            PdfDocument document = htmlConverter.ConvertPartialHtml(htmlContent, baseUrl, "dashboardTableWrapper");

            var res = document.Pages[0];

            PdfDocument document1 = new PdfDocument();

            document1.Pages.Insert(0, res);

            MemoryStream stream = new MemoryStream();

            document1.Save(stream);

            return Ok(stream.ToArray());
        }

        [HttpPost("CreateSignature")]
        public async Task<IActionResult> CreateSignatureAsync(string ReferenceNumber, int UserId, int Id)
        {
            string firstName = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "FirstName")?.Value;
            string surname = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "LastName")?.Value;
            string logginRole = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "role_ucdg")?.Value;

            ReadDocumentSignOffViewModel readDocumentSignOffViewModel = null;

            readDocumentSignOffViewModel = new ReadDocumentSignOffViewModel()
            {
                DocumentType = "pdf",
                ReferenceNumber = ReferenceNumber,
                SignedDate = DateTime.Now,
                UserFullName = String.Concat(firstName, surname),
                UserId = UserId,
                UserRoleName = logginRole,
                ApplicationId = Id,
            };

            string contentString = JsonConvert.SerializeObject(readDocumentSignOffViewModel);

            var response = await APICaller.AuthenticatedApiCallAsync<ReadDocumentSignOffViewModel, ReadDocumentSignOffViewModel>($"{_appSettings.ResearchGateway}DocumentSignOff/AddDocuymentSignOff", "POST", readDocumentSignOffViewModel);

            readDocumentSignOffViewModel = response;


            await AcceptingAward(ReferenceNumber, UserId, Id);

            await SendAcceptingAward(ReferenceNumber, UserId, Id);


            return Ok(readDocumentSignOffViewModel);
        }

        [HttpPost("DecliningAward")]
        public async Task<IActionResult> DecliningAward(string ReferenceNumber, int UserId, int Id)
        {
            string username = UserHelper.GetUsername(User);
            string logginRole = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "role_ucdg")?.Value;

            var updateApplicationStatusResource = new UpdateApplicationStatusResource()
            {
                CurrentUsername = username,
                RoleName = logginRole,
                StatusName = "Award Letter Declined",
                ApplicationId = Id,
            };

            var results = await APICaller.AuthenticatedApiCallAsync<UpdateApplicationStatusResource, string>($"{_appSettings.ResearchGateway}Applications/UpdateApplicantDecline", "POST", updateApplicationStatusResource);

            if (results == "Successfully updated")
                return Ok(new { message = results, Role = logginRole });

            return BadRequest(new { message = results });
        }

        [HttpPost("AcceptingAward")]
        public async Task<IActionResult> AcceptingAward(string ReferenceId, int UserId, int Id)
        {
            string username = UserHelper.GetUsername(User);
            string logginRole = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "role_ucdg")?.Value;
            //get application using applicationId
            var application = await APICaller.AuthenticatedApiCallAsync<string, ApplicationDetailsViewModel>($"{_appSettings.ResearchGateway}DocumentSignOff/GetMyApplicationsByReff/" + ReferenceId, "GET", "");

            var updateApplicationStatusResource = new UpdateApplicationStatusResource()
            {
                CurrentUsername = username,
                RoleName = logginRole,
                StatusName = "Award Letter Accepted",
                ApplicationId = Id,
                ReferenceId = application.ReferenceId
            };

            var results = await APICaller.AuthenticatedApiCallAsync<UpdateApplicationStatusResource, string>($"{_appSettings.ResearchGateway}Applications/UpdateAwardAcceptingByApplicant", "POST", updateApplicationStatusResource);

            return Ok(new { message = results, Role = logginRole });
        }

        [HttpPost("SendAcceptingAward")]
        public async Task<IActionResult> SendAcceptingAward(string ReferenceId, int UserId, int Id)
        {
            string username = UserHelper.GetUsername(User);
            string logginRole = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "role_ucdg")?.Value;

            var updateApplicationStatusResource = new UpdateApplicationStatusResource()
            {
                CurrentUsername = username,
                RoleName = logginRole,
                StatusName = "Award Letter Accepted",
                ApplicationId = Id,
            };

            var results = await APICaller.AuthenticatedApiCallAsync<UpdateApplicationStatusResource, string>($"{_appSettings.ResearchGateway}Applications/SendAwardLetterAcceptingByApplicant", "POST", updateApplicationStatusResource);

            if (results == "Successfully updated")
                return Ok(new { message = results, Role = logginRole });

            return BadRequest(new { message = results });
        }

    }
}
