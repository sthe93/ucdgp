using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime;
using System.Text.Json;
using DocumentFormat.OpenXml.Office2010.Word;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using ResearchSuite.Dtos;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Models.Oross;
using ResearchSuite.Services.Interfaces;
using static ResearchSuite.Models.SubmittedResearchViewModel;

namespace ResearchSuite.Services
{
    public class ResearchService : IResearchService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly AppSettings _appSettings;
        private readonly IMemoryCache _memoryCache;
        public ResearchService(IHttpContextAccessor httpContextAccessor, IOptions<AppSettings> appSettings, IMemoryCache memoryCache)
        {
            _httpContextAccessor = httpContextAccessor;
            _appSettings = appSettings.Value;
            _memoryCache = memoryCache;
        }
        public async Task<List<ResearchOutputTypeDto>> GetResearchOutputTypesAsync()
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}ResearchOutputType/GetResearchOutputType";
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<ResearchOutputTypeDto>>(url, "GET", "");
                return response ?? new List<ResearchOutputTypeDto>();
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        public async Task<List<GetAdmin_ResearchOutPutInfoDto>> GetAdminResearchOutPutInfoByUsername(string username, string submissionsType)
        {
            try
            {
                string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                var url = $"{_appSettings.ResearchGateway}Submit/GetAdmin_ResearchOutPutInfoByUserna?userName=" + username + "&submissionsType=" + submissionsType;
                //   string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<GetAdmin_ResearchOutPutInfoDto>>(url, "GET", "");
                return response ?? new List<GetAdmin_ResearchOutPutInfoDto>();
            }
            catch (Exception ex)
            {
                throw;
            }
        }


        public async Task<List<TempGetResearchOutPutInfo>> getResearchOutPutInfos(string guidId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Submit/GetViewInfo?guidId={Uri.EscapeDataString(guidId)}";
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<TempGetResearchOutPutInfo>>(url, "GET", "");
                return response ?? new List<TempGetResearchOutPutInfo>();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<List<TempGetResearchOutPutAuthor>> getResearchOutPutAuthors(string guidID)
        {

            try
            {
                string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                var url = $"{_appSettings.ResearchGateway}Submit/GetViewAuthor?guidID=" + guidID;
                var response = await APICaller.HttpCallJsonAsync<string, List<TempGetResearchOutPutAuthor>>(url, "GET", "", token);
                return response ?? new List<TempGetResearchOutPutAuthor>();
            }
            catch (Exception ex)
            {

                throw;
            }
        }


        public async Task<List<TempGetResearchOutPutDocument>> GetViewDocument(string guidID)
        {

            try
            {
                string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                var url = $"{_appSettings.ResearchGateway}Submit/GetViewDocument?guidID=" + guidID;
                var response = await APICaller.HttpCallJsonAsync<string, List<TempGetResearchOutPutDocument>>(url, "GET", "", token);
                return response ?? new List<TempGetResearchOutPutDocument>();
            }
            catch (Exception ex)
            {

                throw;
            }
        }
        public async Task<List<TempGetResearchOutPutAffiliatedToOtherSAInstitution>> getResearchOutPutAffiliatedToOtherSAInstitutions(int researchId)
        {

            try
            {
                string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                var url = $"{_appSettings.ResearchGateway}Submit/GetViewOtherSAInstitution?researchId=" + researchId;
                var response = await APICaller.HttpCallJsonAsync<string, List<TempGetResearchOutPutAffiliatedToOtherSAInstitution>>(url, "GET", "", token);
                return response ?? new List<TempGetResearchOutPutAffiliatedToOtherSAInstitution>();
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        public async Task<List<TempGetResearchOutPutAffiliatedToOtherInternationalInstitution>> getResearchOutPutAffiliatedToOtherInternationalInstitutions(int researchId)
        {

            try
            {
                string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                var url = $"{_appSettings.ResearchGateway}Submit/GetViewOtherInternationalInstitution?researchId=" + researchId;
                //   string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                var response = await APICaller.HttpCallJsonAsync<string, List<TempGetResearchOutPutAffiliatedToOtherInternationalInstitution>>(url, "GET", "", token);
                return response ?? new List<TempGetResearchOutPutAffiliatedToOtherInternationalInstitution>();
            }
            catch (Exception ex)
            {

                throw;
            }
            //string url = orossAPI + "Submit/GetViewInfo?guidID=" + guidID;
            //return BusinessRules.HttpHelper.HttpCallJson<List<TempGetResearchOutPutInfo>>(url, WebRequestMethods.Http.Get).ToList();
        }
        public async Task<List<TempGetResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversity>> getResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversities(int researchId)
        {
            try
            {
                string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                var url = $"{_appSettings.ResearchGateway}Submit/GetViewOtherSAInstitutionOtherThanUniversity?researchId=" + researchId;
                //   string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                var response = await APICaller.HttpCallJsonAsync<string, List<TempGetResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversity>>(url, "GET", "", token);
                return response ?? new List<TempGetResearchOutPutAffiliatedToOtherSAInstitutionOtherThanUniversity>();
            }
            catch (Exception ex)
            {
                throw;
            }
            //string url = orossAPI + "Submit/GetViewInfo?guidID=" + guidID;
            //return BusinessRules.HttpHelper.HttpCallJson<List<TempGetResearchOutPutInfo>>(url, WebRequestMethods.Http.Get).ToList();
        }
        public async Task<List<TempGetResearchOutPutDocument>> GetAPIDocuments(string docId)
        {
            try
            {
                string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
                var url = $"{_appSettings.ResearchGateway}Submit/GetViewDocument?guidID=" + docId;
                var response = await APICaller.AuthenticatedApiCallAsync<string, List<TempGetResearchOutPutDocument>>(url, "GET", "");
                return response ?? new List<TempGetResearchOutPutDocument>();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<ViewResearchOutPutDocument> GetDocumentByGuid(string documentGuid)
        {
            var url = $"{_appSettings.ResearchGateway}" + $"ViewDocument/GetDocumentByGuid?guidID={Uri.EscapeDataString(documentGuid)}";
            //this call allows empty token. Do not change
            return await APICaller.HttpCallJsonAsync<string, ViewResearchOutPutDocument>(url, HttpMethod.Get.Method, string.Empty);
        }

        public async Task<GetResearchOutPut_DocumentDto> GetDocumentById(string docId)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(docId);

            var url = $"{_appSettings.ResearchGateway}" + $"Submit/GetDocumentByById?documentId={Uri.EscapeDataString(docId)}";

            var response = await APICaller.HttpCallJsonAsync<string, GetResearchOutPut_DocumentDto>(url, HttpMethod.Get.Method, string.Empty);

            return response ?? new GetResearchOutPut_DocumentDto();
        }

        public async Task<GetResearchOutPut_DocumentDto> GetDocumentByViewId(string guidId)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(guidId);

            var url = $"{_appSettings.ResearchGateway}" + $"Submit/GetDocumentByViewId?guidId={Uri.EscapeDataString(guidId)}";

            var response = await APICaller.AuthenticatedApiCallAsync<string, GetResearchOutPut_DocumentDto>(url, HttpMethod.Get.Method, string.Empty);

            return response ?? new GetResearchOutPut_DocumentDto();
        }
        public async Task<GetResearchOutPut_DocumentDto> GetDocumentByViewId(string guidId, int viewId)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Submit/GetDocumentByViewId?guidId=" + guidId + "&viewId=" + viewId;
                var response = await APICaller.AuthenticatedApiCallAsync<string, GetResearchOutPut_DocumentDto>(url, "GET", "");
                return response ?? new GetResearchOutPut_DocumentDto();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<HttpResponseMessage> SubmitCommentFRA([FromBody] AddCommentFor_RFAViewModel model)
        {
            var url = $"{_appSettings.ResearchGateway}Submit/SubmitCommentFRA";
            var response = await APICaller.AuthenticatedApiCallAsync<AddCommentFor_RFAViewModel, HttpResponseMessage>(url, "POST", model);
            return response;
        }


        public async Task<List<PublicationFeesReasonDto>> GetPublicationFeesReason()
        {
            var url = $"{_appSettings.ResearchGateway}ResearchOutputType/GetPublicationFeesReason";
            var response = await APICaller.AuthenticatedApiCallAsync<string, List<PublicationFeesReasonDto>>(url, "GET", "");
            return response ?? new List<PublicationFeesReasonDto>();
        }


        public async Task<SubmitResearchResponseDto> UpdateAmendementResearch(Amendment_PublicationViewModel model)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Submit/UpdateAmendmentResearch";
                var response = await APICaller.AuthenticatedApiCallAsync<Amendment_PublicationViewModel, SubmitResearchResponseDto>(url, "POST", model);
                return response ?? new SubmitResearchResponseDto { Successful = false, Message = "No response from API" };
            }
            catch (Exception ex)
            {
                return new SubmitResearchResponseDto { Successful = false, Message = ex.Message };
            }
        }

        public async Task<SubmitResearchResponseDto> ReuploadSubmitedResearchDocument(ReUploadResearchOutPut_UpdateDocumentViewModel model)
        {
            try
            {
                var url = $"{_appSettings.ResearchGateway}Submit/ReuploadSubmitedResearchDocument";
                var response = await APICaller.AuthenticatedApiCallAsync<ReUploadResearchOutPut_UpdateDocumentViewModel, SubmitResearchResponseDto>(url, "POST", model);
                return response ?? new SubmitResearchResponseDto { Successful = false, Message = "No response from API" };
            }
            catch (Exception ex)
            {
                return new SubmitResearchResponseDto { Successful = false, Message = ex.Message };
            }
        }

        public async Task<List<PublicationYearDto>> GetPublicationYear()
        {
            var url = $"{_appSettings.ResearchGateway}ResearchOutputType/GetPublicationYear";
            var response = await APICaller.AuthenticatedApiCallAsync<string, List<PublicationYearDto>>(url, "GET", "");
            return response ?? new List<PublicationYearDto>();
        }

        public async Task<SubmitResearchResponseDto> SubmitResearch(SubmitResearchRequestDto submitResearchRequestDto)
        {
            var url = $"{_appSettings.ResearchGateway}Submit/SubmitResearchV2";
            string token = _httpContextAccessor.HttpContext?.Session.GetString("token") ?? "";
            //  var response = await APICaller.HttpCallJsonAsync<SubmitResearchRequestDto, SubmitResearchResponseDto>(url, "POST", submitResearchRequestDto, token);
            var response = await APICaller.AuthenticatedApiCallAsync<SubmitResearchRequestDto, SubmitResearchResponseDto>(url, "POST", submitResearchRequestDto);
            return response;
        }

        public async Task<AuthorModel?> GetAuthorByUsername(string usernameOrNumber)
        {
            if (string.IsNullOrWhiteSpace(usernameOrNumber))
                return null;
            usernameOrNumber = usernameOrNumber.Trim().ToLowerInvariant();
            AuthorModel? author;
            string endpoint;

            if (long.TryParse(usernameOrNumber, out _))
            {
                endpoint = usernameOrNumber.StartsWith("7")
                    ? "Author/GetStaffInformationWithStaffNum?staffNum=" + usernameOrNumber
                    : "Author/GetStudentInformation?studNumber=" + usernameOrNumber;
            }
            else
            {
                endpoint = "Author/GetStaffInformationWithUserName?userName=" + usernameOrNumber;
            }

            string baseUrl = _appSettings.ResearchGateway.TrimEnd('/');
            string url = $"{baseUrl}/{endpoint}";

            author = await APICaller.AuthenticatedApiCallAsync<string, AuthorModel>(url, "GET", "");

            if (author?.StaffNumber == null)
                return author;

            if (author.StaffNumber.StartsWith("7"))
            {
                string empEndpoint = $"Author/GetStaffInformationWithStaffNum?staffNum={author.StaffNumber}";
                string empUrl = $"{baseUrl}/{empEndpoint}";

                var employee = await APICaller.AuthenticatedApiCallAsync<string, AuthorModel>(empUrl, "GET", "");

                if (employee != null)
                {
                    author.Department = employee.Department ?? author.Department;
                    author.Faculty = employee.Faculty ?? author.Faculty;
                }
            }
            else
            {
                author.IsUjStudent = "Yes";
            }

            return author;
        }

        public async Task<List<CurrencyDto>> GetCurrencies()
        {
            var url = $"{_appSettings.ResearchGateway}ResearchOutputType/GetPublisherCurrency";
            var response = await APICaller.AuthenticatedApiCallAsync<string, List<CurrencyDto>>(url, "GET", "");
            return response ?? new List<CurrencyDto>();
        }

        private async Task<List<GetAdmin_ResearchOutPutInfoDto>> GetViewAdminAllSubmission(string username)
        {
            string faculty = "";
            string submissionType = "";
            string date = "";
            try
            {
                var url = $"{_appSettings.ResearchGateway}Submit/GetViewAdminAllSubmission?" +
                          $"facultyUser={faculty}&" +
                          $"researchOutput={submissionType}&" +
                          $"startDate={date}&endDate={date}&" +
                          $"username={username}";

                var response = await APICaller.AuthenticatedApiCallAsync<string, List<GetAdmin_ResearchOutPutInfoDto>>(url, "GET", "");

                return response ?? new List<GetAdmin_ResearchOutPutInfoDto>();
            }
            catch (Exception)
            {
                throw;
            }
        }
        private static bool IsIdentifier(string? value)
        {
            return !string.IsNullOrWhiteSpace(value) && !value.Any(char.IsWhiteSpace);
        }

        private bool IsCreatedByCurrentUser(GetAdmin_ResearchOutPutInfoDto submission, string userNameLower, string fullNameLower)
        {
            var createdBy = submission.CreatedBy?.Trim();

            if (string.IsNullOrWhiteSpace(createdBy))
                return false;

            // Newer records: CreatedBy contains username/student number
            if (IsIdentifier(createdBy))
            {
                return createdBy.Equals(userNameLower, StringComparison.OrdinalIgnoreCase);
            }

            // Legacy records: CreatedBy contains full name
            return NormalizeName(createdBy) == fullNameLower;
        }

        private bool IsOwnWork(GetAdmin_ResearchOutPutInfoDto submission, string userNameLower, string fullNameLower)
        {
            var authorUsername = submission.Username?.Trim();

            // Username is the most reliable author identifier
            if (!string.IsNullOrWhiteSpace(authorUsername))
            {
                return authorUsername.Equals(userNameLower, StringComparison.OrdinalIgnoreCase);
            }

            // Legacy fallback if Username is missing
            return !string.IsNullOrWhiteSpace(submission.Author) && NormalizeName(submission.Author) == fullNameLower;
        }
        public async Task<List<GetAdmin_ResearchOutPutInfoDto>> GetFilteredSubmissionsAsync(SubmissionFilter filter)
        {
            var role = filter.Role?.ToLowerInvariant() ?? "user";
            var userNameLower = filter.Username?.Trim().ToLowerInvariant() ?? "";
            var fullNameLower = NormalizeName(filter.FullName?.Trim().ToLowerInvariant() ?? "");
            var normalizedFilterFaculty = UserHelper.NormalizeFacultyName(filter.Faculty);
            List<GetAdmin_ResearchOutPutInfoDto> allData = new List<GetAdmin_ResearchOutPutInfoDto>();
            if (role.Equals("user"))
            {
                allData = await GetViewAdminAllSubmission(userNameLower);
            }
            else
            {
                allData = await GetViewAdminAllSubmission("");
            }

            var query = allData.AsQueryable();


            if (role == "admin")
            {
                if (!string.IsNullOrWhiteSpace(filter.Faculty) && filter.Faculty != "0")
                {
                    var facultyOption = filter.submissionViewModel.FacultyOptions.FirstOrDefault(o => o.Value == filter.Faculty);
                    if (facultyOption != null)
                    {
                        var selectedFacultyText = UserHelper.NormalizeFacultyName(facultyOption.Text);
                        query = query.Where(x => x.Faculty != null &&
                                                 UserHelper.NormalizeFacultyName(x.Faculty)
                                                 .Equals(selectedFacultyText, StringComparison.OrdinalIgnoreCase));
                    }
                }
            }
            else if (role == "faculty coordinator")
            {
                query = query.Where(x => (!string.IsNullOrWhiteSpace(x.Faculty) && UserHelper.NormalizeFacultyName(x.Faculty)
                .Equals(normalizedFilterFaculty, StringComparison.OrdinalIgnoreCase))
                || IsCreatedByCurrentUser(x, userNameLower, fullNameLower)
                || IsOwnWork(x, userNameLower, fullNameLower));

            }
            else
            {
                query = query.Where(x => IsCreatedByCurrentUser(x, userNameLower, fullNameLower)
                || IsOwnWork(x, userNameLower, fullNameLower));
            }

            if (!string.IsNullOrWhiteSpace(filter.SubmissionsType))
            {
                switch (filter.SubmissionsType.Trim())
                {
                    case "1":
                        // My own research: logged-in user is the author
                        query = query.Where(x =>
                            IsOwnWork(x, userNameLower, fullNameLower));
                        break;

                    case "2":
                        // Created for others: logged-in user created it,
                        // but is not the author
                        query = query.Where(x =>
                            IsCreatedByCurrentUser(x, userNameLower, fullNameLower)
                            &&
                            !IsOwnWork(x, userNameLower, fullNameLower));
                        break;
                    case "3":
                        query = query.Where(x => x.Faculty != null &&
                                             UserHelper.NormalizeFacultyName(x.Faculty).Equals(normalizedFilterFaculty, StringComparison.OrdinalIgnoreCase));
                        break;
                    case "0":
                    default:
                        break;
                }
            }
            if (!string.IsNullOrWhiteSpace(filter.Sdg) && filter.Sdg != "0")
            {
                var sdgOption = filter.submissionViewModel.SDGOptions
                                .FirstOrDefault(o => o.Value == filter.Sdg);

                if (sdgOption != null)
                {
                    // Remove prefixes like "SDG ", "SDG", or "X." from both sides
                    string normalizedSelected = UserHelper.NormalizeSdgText(sdgOption.Text);

                    query = query.Where(x => x.SDG != null &&
                        UserHelper.NormalizeSdgText(x.SDG).Contains(normalizedSelected, StringComparison.OrdinalIgnoreCase));
                }
            }

            if ((role == "faculty coordinator" || role == "admin") && filter.ResearchType != 0)
            {
                query = query.Where(x => x.OutPutType != 0 && x.OutPutType.Equals(filter.ResearchType));
            }


            var format = "dd MMM yyyy HH:mm";
            var culture = CultureInfo.InvariantCulture;

            var resultList = query.ToList();

            if ((role == "faculty coordinator" || role == "admin") && DateTime.TryParse(filter.StartDate, out var sDate))
            {
                resultList = resultList.Where(x => DateTime.TryParseExact(x.CreatedDate.Trim('"'), format, culture, DateTimeStyles.None, out var created)
                                                 && created >= sDate).ToList();
            }

            if ((role == "faculty coordinator" || role == "admin") && DateTime.TryParse(filter.EndDate, out var eDate))
            {
                resultList = resultList.Where(x => DateTime.TryParseExact(x.CreatedDate.Trim('"'), format, culture, DateTimeStyles.None, out var created)
                                                 && created <= eDate).ToList();
            }

            return resultList;

        }


        private string NormalizeName(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return string.Empty;

            return string.Join("|", name.Trim().ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries).OrderBy(part => part));
        }

        public async Task<string> UpdatePublishRepository(Publish publish)
        {
            var url = $"{_appSettings.ResearchGateway}Submit/UpdatePublishRepository";
            var response = await APICaller.AuthenticatedApiCallAsync<Publish, string>(url, "POST", publish);
            return response;
        }

        public async Task<bool> TitleExists(string title)
        {
            var url = $"{_appSettings.ResearchGateway}Submit/TitleExists?title=" + title;
            var response = await APICaller.AuthenticatedApiCallAsync<string, bool>(url, "GET", "");
            return response;
        }
    }
}
