using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Options;
using ResearchSuite.Models;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services.Interfaces;
using Syncfusion.HtmlConverter;
using Syncfusion.Pdf;
using Syncfusion.Pdf.Graphics;
using IHostingEnvironment = Microsoft.AspNetCore.Hosting.IHostingEnvironment;

namespace ResearchSuite.Controllers.UCDPControllers
{
    [Route("Ucdp/[controller]")]
    public class MyApplicationsController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMyApplicationsService _myApplicationsService;
        private readonly AppSettings _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly ICompositeViewEngine _viewEngine;
        public MyApplicationsController(IHttpContextAccessor httpContextAccessor,
            IMyApplicationsService myApplicationsService,
            IOptions<AppSettings> appSettings,
            IHostingEnvironment hostingEnvironment,
            ICompositeViewEngine viewEngine)
        {
            _myApplicationsService = myApplicationsService;
            _appSettings = appSettings.Value;
            _hostingEnvironment = hostingEnvironment;
            _httpContextAccessor = httpContextAccessor;
            _viewEngine = viewEngine;
        }

        // GET /Ucdp/MyApplications
        [HttpGet("")]
        public async Task<IActionResult> Index()
        {
            List<ReadApplicationResource> readApplicationResource = null;
            int? userid = int.Parse(HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value);

            if (userid != null && userid != 0)
            {
                readApplicationResource = await _myApplicationsService.GetMyApplications(userid);
            }

            ReadApplicationResourceViewModel readApplicationResourceViewModel = new ReadApplicationResourceViewModel();
            readApplicationResourceViewModel.readApplicationResources = readApplicationResource;

            return View("~/Views/UCDP/MyApplications/MyApplications.cshtml", readApplicationResourceViewModel);
        }

        // GET /Ucdp/MyApplications/MyApplications
        [HttpGet("MyApplications")]
        public async Task<IActionResult> MyApplications(int? userid)
        {
            List<ReadApplicationResource> readApplicationResource = null;
            userid = int.Parse(HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value);

            if (userid != null && userid != 0)
            {
                readApplicationResource = await _myApplicationsService.GetMyApplications(userid);
            }

            ReadApplicationResourceViewModel readApplicationResourceViewModel = new ReadApplicationResourceViewModel();
            readApplicationResourceViewModel.readApplicationResources = readApplicationResource;

            return Ok(readApplicationResource);
        }

        [HttpGet("CreatePdfDocument")]
        public async Task<IActionResult> CreatePdfDocument(int applicationId)
        {
          var applicationDetails = await _myApplicationsService.ApplicationPDF(applicationId);

            if (applicationDetails == null)
                return NotFound();

            ViewData["Title"] = "Download Application";
            ViewData.Model = applicationDetails;

            var viewName = "~/Views/UCDP/MyApplications/ApplicationPDF.cshtml";
            string htmlContent;

            using (var writer = new StringWriter())
            {
                var viewResult = _viewEngine.GetView(null, viewName, false);

                if (!viewResult.Success)
                    return NotFound($"The view {viewName} was not found.");

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

            BlinkConverterSettings settings = new BlinkConverterSettings
            {
                BlinkPath = Path.Combine(_hostingEnvironment.ContentRootPath, "BlinkBinariesWindows"),
                ViewPortSize = new Syncfusion.Drawing.Size(1200, 0),
                Margin = new PdfMargins { All = 20 },
                Orientation = PdfPageOrientation.Portrait,
                PdfPageSize = PdfPageSize.A4,
                EnableJavaScript = false
            };

            htmlConverter.ConverterSettings = settings;

            byte[] pdfBytes;

            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/";

            using (PdfDocument document = htmlConverter.Convert(htmlContent, baseUrl))
            using (MemoryStream stream = new MemoryStream())
            {
                document.Save(stream);
                pdfBytes = stream.ToArray();
            }
            var fileName = $"Overview_{applicationId}.pdf";
            return File(pdfBytes, System.Net.Mime.MediaTypeNames.Application.Pdf, fileName);
        }


        [HttpGet("ApplicationPDF")]
        public async Task<ActionResult> ApplicationPDF(int applicationId)
        {
            ApplicationDetailsViewModel applicationDetails = new ApplicationDetailsViewModel();

            applicationDetails = await _myApplicationsService.ApplicationPDF(applicationId);

            return await Task.FromResult<ActionResult>(PartialView("~/Views/UCDP/MyApplications/ApplicationPDF.cshtml", applicationDetails));

        }

        [HttpGet("GetDocsListByApplicationsId")]
        public async Task<IActionResult> GetDocsListByApplicationsId(int applicationsId)
        {
            var documentList = await _myApplicationsService.GetDocsListByApplicationsId(applicationsId);
            var jsonResult = Newtonsoft.Json.JsonConvert.SerializeObject(documentList.Value);
            return Content(jsonResult, "application/json");
        }

        [HttpGet("ViewDocument")]
        public async Task<ActionResult> ViewDocument(int documentId)
        {
            var documentList = await _myApplicationsService.GetDocument(documentId);
            var jsonResult = Newtonsoft.Json.JsonConvert.SerializeObject(documentList.Value);
            return Content(jsonResult, "application/json");
        }

        [HttpGet("GetCommentsListByApplicationsId")]
        public async Task<IActionResult> GetCommentsListByApplicationsId(int applicationsId)
        {
            var results = await _myApplicationsService.GetCommentsByApplicationId(applicationsId);
            return Content(results ?? "[]", "application/json");
        }
    }
}
