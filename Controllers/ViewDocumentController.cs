using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using ResearchSuite.Services.Interfaces;

namespace ResearchSuite.Controllers
{
    public class ViewDocumentController : Controller
    {

        private readonly IResearchService _researchService;

        public ViewDocumentController(IResearchService researchService)
        {

            _researchService = researchService;
        }
        // GET: ViewDocument

        public async Task<IActionResult> Index(Guid? xctd)
        {
            if (!xctd.HasValue)
                return BadRequest("A document ID is required.");

            var document = await _researchService.GetDocumentByGuid(xctd.Value.ToString());

            if (document == null)
                return NotFound("The document could not be found.");

            var fileName = $"{document.DocumentName}_{document.DocumentGuid}";

            return ReturnDocument(document.Document, document.DocumentExtention, fileName);
        }

        //kjslkjdlksjdlsjdskldjs

        [HttpPost]
        public async Task<IActionResult> ViewResearchDocument()
        {
            var docId = Request.Form["DocGuid"].ToString();

            if (string.IsNullOrWhiteSpace(docId))
            {
                return BadRequest(new
                {
                    status = "Error",
                    message = "A document ID is required."
                });
            }

            var result = await _researchService.GetDocumentById(docId);

            if (result.Document == null || result.Document.Length == 0)
            {
                return NotFound(new
                {
                    status = "Error",
                    message = "The document could not be found."
                });
            }

            HttpContext.Session.SetString("Doc", JsonSerializer.Serialize(result));

            return Json(new
            {
                status = "Success",
                message = "Document found."
            });
        }

        [HttpGet]
        public async Task<IActionResult> ViewResearchDoc(string documentGuid)
        {
            if (string.IsNullOrWhiteSpace(documentGuid))
                return BadRequest("A document GUID is required.");

            var doc = await _researchService.GetDocumentByGuid(documentGuid);

            if (doc == null || doc.Document == null || doc.Document.Length == 0)
            {
                return NotFound("The document could not be found.");
            }

            var fileName = $"{doc.DocumentName}_{doc.DocumentGuid}";

            return ReturnDocument(doc.Document, doc.DocumentExtention, fileName);
        }
        public IActionResult PdfDownload(byte[]? researchDoc, string? extension)
        {
            return ReturnDocument(researchDoc, extension, "ResearchDocument");
        }

        [HttpGet]
        [HttpGet]
        public virtual async Task<IActionResult> DownloadWord(string GuidID, string ViewId)
        {
            if (string.IsNullOrWhiteSpace(HttpContext.Session.GetString("Username")))
            {
                return RedirectToAction("Login", "Account");
            }

            if (string.IsNullOrWhiteSpace(GuidID))
                return BadRequest("A document GUID is required.");

            var document =
                await _researchService.GetDocumentByGuid(GuidID);

            if (document == null)
                return NotFound("The document could not be found.");

            var fileName = $"{document.DocumentName}_{document.PublicationTitle}";

            return ReturnDocument(document.Document, document.DocumentExtention, fileName);
        }

        private IActionResult ReturnDocument(byte[]? fileContents, string? extension, string fileName)
        {
            if (fileContents == null || fileContents.Length == 0)
                return NotFound("The document is empty or could not be found.");

            if (string.IsNullOrWhiteSpace(extension))
                return BadRequest("The document extension is missing.");

            extension = extension.Trim().ToLowerInvariant();

            if (!extension.StartsWith("."))
                extension = "." + extension;

            if (!fileName.EndsWith(extension, StringComparison.OrdinalIgnoreCase))
                fileName += extension;

            var contentTypeProvider = new FileExtensionContentTypeProvider();

            if (!contentTypeProvider.TryGetContentType(fileName, out var contentType))
                contentType = "application/octet-stream";

            return File(fileContents, contentType, fileName);
        }
    }

}
