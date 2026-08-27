using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ResearchSuite.Dtos.Suite;
using ResearchSuite.Helpers;
using ResearchSuite.Helpers.common;
using ResearchSuite.Helpers.Ucdp;
using ResearchSuite.Models;
using ResearchSuite.Models.Suite;
using ResearchSuite.Models.Ucdp;
using ResearchSuite.Models.UCDP;
using ResearchSuite.Services;
using ResearchSuite.Services.Interfaces;
using Serilog;
using System.Diagnostics;
using System.Security.Claims;


namespace ResearchSuite.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IProfileService _profile;

        public HomeController(ILogger<HomeController> logger, IProfileService profile)
        {
            _logger = logger;
            _profile = profile;
        }

        [Authorize]
        public IActionResult Index()
        {
            Log.Information("Home/Index");
            Log.Information("Attempting to retrieve username from claims for user: {User}", User?.Identity?.Name ?? "Unknown");
            Log.Information("Attempting to retrieve username from claims for user: {User}", User?.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown");
            Log.Information("Attempting to retrieve username from claims for user: {User}", User?.FindFirst("Username")?.Value ?? "Unknown");

            var appsClaim = HttpContext.User.FindFirst("app")?.Value;
            var applicationList = new List<string>();

            if (!string.IsNullOrWhiteSpace(appsClaim))
            {
                applicationList = appsClaim.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(a => a.Trim().ToLowerInvariant()).ToList();
            }
            ViewData["ApplicationList"] = applicationList;
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            var traceId = HttpContext.Items["TraceId"] as string ?? HttpContext.TraceIdentifier;
            return View(new ErrorViewModel { RequestId = traceId ?? Activity.Current?.Id });
        }
        public async Task<IActionResult> SetCurrentApp(string appName)
        {
            if (string.IsNullOrWhiteSpace(appName))
            {
                return RedirectToAction("Index", "Home");
            }

            appName = appName.Trim().ToLowerInvariant();

            var validApps = new[] { "oross", "ucdg", "urc" };

            if (!validApps.Contains(appName))
            {
                TempData["ErrorMessage"] = "Invalid application selected.";
                return RedirectToAction("Index", "Home");
            }

            var username = UserHelper.GetUsername(User);
            var userId = UserHelper.GetUserId(User);

            if (string.IsNullOrWhiteSpace(username))
            {
                TempData["ErrorMessage"] = "User not identified.";
                return RedirectToAction("Index", "Home");
            }

            HttpContext.Session.SetString(SessionKeys.CurrentApp, appName);

            // Oracle profile synchronisation is only required for UCDG/UCDP.
            if (appName == "ucdg")
            {
                var alreadySynced = HttpContext.Session.GetString(SessionKeys.UcdpProfileSynced) == "1";

                var currentUser = HttpContext.Session.GetObjectFromJson<ReadUserViewModelResource>(SessionKeys.CurrentUser);

                if (!alreadySynced || currentUser == null)
                {
                    var employee = await _profile.SyncAndGetProfileAsync(username);

                    if (employee == null)
                    {
                        ClearUcdpProfileSession();

                        TempData["ErrorMessage"] = "Your profile could not be found in Oracle. Please contact HR Admin at hradmin@uj.ac.za to confirm that your details are correctly captured.";

                        return RedirectToAction("Index", "Home");
                    }

                    if (string.IsNullOrWhiteSpace(employee.LINE_MANAGER_FIRST_NAME))
                    {
                        ClearUcdpProfileSession();

                        TempData["ErrorMessage"] = "No line manager is linked to your Oracle profile. Please contact HR Admin at hradmin@uj.ac.za to update your reporting line.";

                        return RedirectToAction("Index", "Home");
                    }

                    var userViewModel =
                        await BuildCurrentUserFromOracleAsync(employee, username, userId);

                    if (userViewModel == null)
                    {
                        ClearUcdpProfileSession();

                        TempData["ErrorMessage"] = "Unable to construct user data from Oracle.";

                        return RedirectToAction("Index", "Home");
                    }

                    HttpContext.Session.SetObjectAsJson(SessionKeys.CurrentUser, userViewModel);
                    HttpContext.Session.SetObjectAsJson(SessionKeys.EmployeeProfile, employee);
                    HttpContext.Session.SetString(SessionKeys.UcdpProfileSynced, "1");
                }
            }

            return appName switch
            {
                "oross" => RedirectToAction("Index", "Oross"),
                "ucdg" => RedirectToAction("Index", "Ucdp"),
                "urc" => RedirectToAction("Index", "Urc"),
                _ => RedirectToAction("Index", "Home")
            };
        }

        private void ClearUcdpProfileSession()
        {
            HttpContext.Session.Remove(SessionKeys.UcdpProfileSynced);
            HttpContext.Session.Remove(SessionKeys.CurrentUser);
            HttpContext.Session.Remove(SessionKeys.EmployeeProfile);
        }
        private async Task<ReadUserViewModelResource?> BuildCurrentUserFromOracleAsync(EmployeeBioDto resultsBio, string username, int userId)
        {
            if (resultsBio == null) return null;
            var fullName = $"{resultsBio.FIRST_NAME} {resultsBio.LAST_NAME}".Trim();
            var hodFullName = $"{resultsBio.LINE_MANAGER_FIRST_NAME} {resultsBio.LINE_MANAGER_SURNAME}".Trim();
            var viceDeanFullName = string.IsNullOrWhiteSpace(resultsBio.VICE_DEAN) ? "Not Supplied by Oracle" : resultsBio.VICE_DEAN.Trim();

            var isAcademic = !string.Equals(resultsBio.IS_ACADEMIC, "false", StringComparison.OrdinalIgnoreCase);


            //debug
            //int userIdVal = int.Parse(userId);

            var vm = new ReadUserViewModelResource
            {
                UserId = userId,
                Username = username,
                FirstName = resultsBio.FIRST_NAME,
                Surname = resultsBio.LAST_NAME,
                Nationality = resultsBio.CITIZENSHIP,
                IdPassportNumber = resultsBio.NI_PI,
                DateOfBirth = resultsBio.DATE_OF_BIRTH, // safe default if null
                EmailAddress = $"{username}@uj.ac.za",
                AlternativeEmailAddress = resultsBio.EMAIL_ADDRESS,
                CellPhoneNumber = resultsBio.CELL_PHONE,
                TelephoneNumber = resultsBio.WORK_TELEPHONE_NUMBER,
                IsProfileCompleted = false,
                Campus = resultsBio.CAMPUS,
                Title = resultsBio.TITLE,
                StaffNumber = resultsBio.EMPLOYEE_NUMBER,
                Position = resultsBio.POSITION_NAME,
                IsAcademic = isAcademic,
                Gender = resultsBio.GENDER,
                Department = resultsBio.DEPARTMENT_NAME,
                Race = resultsBio.RACE,
                Disability = "Not Supplied by Oracle",
                Faculty = string.IsNullOrWhiteSpace(resultsBio.FACULTY_DIVISION) ? "Not Supplied by Oracle" : resultsBio.FACULTY_DIVISION,
                HOD = hodFullName,
                ViceDean = viceDeanFullName
            };


            var userQualifications = new List<UserQualificationViewModel>();
            foreach (var qual in resultsBio.Qualifications)
            {
                var uq = new UserQualificationViewModel()
                {
                    Name = string.IsNullOrEmpty(qual.Name) ? "Not Supplied by Oracle" : qual.Name,
                    QualificationType = string.IsNullOrEmpty(qual.QualificationType) ? "Not Supplied by Oracle" : qual.QualificationType,
                    InstitutionName = string.IsNullOrEmpty(qual.InstitutionName) ? "Not Supplied by Oracle" : qual.InstitutionName
                };

                userQualifications.Add(uq);
            }
            vm.Qualifications = userQualifications;

            return vm;
        }

        public FileResult GetManual()
        {
            try
            {

                string filePath = string.Format("{0}\\wwwroot\\uploads\\ucdg.pdf", Environment.CurrentDirectory);

                byte[] FileBytes = System.IO.File.ReadAllBytes(filePath);

                return File(FileBytes, "application/pdf");
            }
            catch (Exception msg)
            {
                _logger.Log(LogLevel.Error, msg.Message.ToString());
                return null;
            }
        }
        public FileResult GetTCManual()
        {
            try
            {

                string filePath = string.Format("{0}\\wwwroot\\uploads\\UCDGConditions.pdf", Environment.CurrentDirectory);

                byte[] FileBytes = System.IO.File.ReadAllBytes(filePath);

                return File(FileBytes, "application/pdf");
            }
            catch (Exception msg)
            {
                _logger.Log(LogLevel.Error, msg.Message.ToString());
                return null;
            }
        }
        public FileResult GetTCManualFirst()
        {
            try
            {

                string filePath = string.Format("{0}\\wwwroot\\uploads\\UCDGConditionsFirst.pdf", Environment.CurrentDirectory);

                byte[] FileBytes = System.IO.File.ReadAllBytes(filePath);

                return File(FileBytes, "application/pdf");
            }
            catch (Exception msg)
            {
                _logger.Log(LogLevel.Error, msg.Message.ToString());
                return null;
            }
        }

    }
}
