using System.Text.RegularExpressions;
using System.Xml.Linq;
using ResearchSuite.Dtos.Oross;
using ResearchSuite.Models;
using ResearchSuite.Models.Oross;
using static ResearchSuite.Models.SubmittedResearchViewModel;


namespace ResearchSuite.Helpers
{
    public static class OrossControllerHelper
    {
        //public static List<FileModel> GetFileModel(NewSubmissionViewModel model)
        //{
        //    List<FileModel> formFiles = new List<FileModel>();
        //    formFiles.Add(new FileModel(DocumentType.Research, model.PublishedPaper));
        //    formFiles.Add(new FileModel(DocumentType.ManuScript, model.Manuscript));
        //    formFiles.Add(new FileModel(DocumentType.SupportingDocument, model.SupportingDoc));
        //    formFiles.Add(new FileModel(DocumentType.TableofContent, model.TocUpload));
        //    formFiles.Add(new FileModel(DocumentType.DhetLetter, model.DhetLetter));
        //    formFiles.Add(new FileModel(DocumentType.FqcDeclaration, model.FqcDeclaration));

        //    formFiles.Add(new FileModel(DocumentType.Research, model.PublishedBook));
        //    formFiles.Add(new FileModel(DocumentType.PeerReviewProcess, model.PeerReviewLetter));
        //    formFiles.Add(new FileModel(DocumentType.PeerReviewComments, model.PeerReviewComments));
        //    formFiles.Add(new FileModel(DocumentType.ScholarlyMotivation, model.ScholarlyMotivation));
        //    formFiles.Add(new FileModel(DocumentType.LateMotivationLetter, model.LateMotivation));

        //    formFiles.Add(new FileModel(DocumentType.Research, model.PublishedChapter));
        //    formFiles.Add(new FileModel(DocumentType.PeerReviewProcess, model.PeerReviewLetterChapter));
        //    formFiles.Add(new FileModel(DocumentType.PeerReviewComments, model.PeerReviewCommentsChapter));
        //    formFiles.Add(new FileModel(DocumentType.ScholarlyMotivation, model.ScholarlyMotivationChapter));
        //    formFiles.Add(new FileModel(DocumentType.LateMotivationLetter, model.LateMotivationChapter));
        //    formFiles.Add(new FileModel(DocumentType.FqcDeclaration, model.FqcDeclaration_Chapter));

        //    formFiles.Add(new FileModel(DocumentType.Research, model.ConferencePublishedPaper));
        //    formFiles.Add(new FileModel(DocumentType.ManuScript, model.ConferenceManuscript));
        //    formFiles.Add(new FileModel(DocumentType.TableofContent, model.ConferenceToc));
        //    formFiles.Add(new FileModel(DocumentType.PeerReviewProcess, model.ConferencePeerReview));
        //    formFiles.Add(new FileModel(DocumentType.PeerReviewComments, model.ConferencePeerComments));
        //    formFiles.Add(new FileModel(DocumentType.CommitteeMembers, model.CommitteeMembers));
        //    formFiles.Add(new FileModel(DocumentType.SupportingDocument, model.ConferenceSupportingDoc));
        //    formFiles.Add(new FileModel(DocumentType.FqcDeclaration, model.FqcDeclaration_Conference));


        //    return formFiles;
        //}

        public static List<FileModel> GetFileModel(NewSubmissionViewModel model, string researchType)
        {
            List<FileModel> formFiles = new List<FileModel>();

            foreach (var doc in DocumentMap)
            {
                var (inputId, docType, label, required, applicableResearchTypes) = doc.Value;

                if (!applicableResearchTypes.Contains(researchType, StringComparer.OrdinalIgnoreCase))
                    continue;

                var property = model.GetType().GetProperty(inputId);
                if (property == null)
                    continue;

                var file = property.GetValue(model) as IFormFile;
                if (file != null && file.Length > 0)
                {
                    formFiles.Add(new FileModel(docType, file,inputId));
                }
            }

            return formFiles;
        }

        public static List<PreviewDocumentViewModel> GetFileInformationToSubmit(List<FileModel> formFile, string username)
        {

            List<PreviewDocumentViewModel> viewDocPutList = [];

            byte[] fileBytes;

            foreach (var fileModel in formFile)
            {
                if (fileModel.File == null) continue;
                using (var memoryStream = new MemoryStream())
                {
                    fileModel.File.CopyTo(memoryStream);
                    fileBytes = memoryStream.ToArray();
                }

                PreviewDocumentViewModel viewDocPut = new PreviewDocumentViewModel();

                // Use the buffered content to create a new stream for reading
                using (var fileStream = new MemoryStream(fileBytes))
                {
                    using (BinaryReader researchBinaryReader = new BinaryReader(fileStream))
                    {
                        viewDocPut.Document = researchBinaryReader.ReadBytes(fileBytes.Length);
                        viewDocPut.DocumentExtension = Path.GetExtension(fileModel.File.FileName).ToLower();
                        viewDocPut.DocumentName = Path.GetFileName(fileModel.File.FileName);
                        viewDocPut.CreatedBy = username;
                        viewDocPut.DocumentTypeId = fileModel.DocumentType;
                    }
                }
                viewDocPutList.Add(viewDocPut);
            }
            return viewDocPutList;
        }

        public static string ResearchAuthorsXml(List<AuthorModel> authors)
        {
            XDocument AuthorDetailsXML = new XDocument(new XDeclaration("1.0", "UTF - 8", "yes"),
                new XElement("root", from OrderDet in authors
                                     select new XElement("ResearchAuthor",
                                     new XElement("StaffUsername", OrderDet.Email.Split('@')[0]),
                                     new XElement("LastName", OrderDet.LastName),
                                     new XElement("FirstName", OrderDet.FirstName),
                                     new XElement("Position", OrderDet.Position),
                                     new XElement("Campus", OrderDet.Campus),
                                     new XElement("Faculty", OrderDet.Faculty),
                                     new XElement("Department", OrderDet.Department),
                                     new XElement("ORCHID", OrderDet.ORCHID),
                                     new XElement("IsUjStaff", OrderDet.IsUjStaff),
                                     new XElement("IsUjStudent", OrderDet.IsUjStudent),
                                     new XElement("StaffNumber", OrderDet.StaffNumber),
                                     new XElement("IsPrimaryAuthor", OrderDet.IsPrimaryAuthor ? 1 : 0))));
            return AuthorDetailsXML.ToString();
        }

        public static SendEmailReqeustDto GetEmailSubmissionModel(SubmitResearchResponseDto result, NewSubmissionViewModel model, string username)
        {
            var emailModel = new SendEmailReqeustDto
            {
                ResearchId = !model.IsEditMode ? result.ReserachId : model.ResearchId,
                OwnWork = model.OwnWorkModel.IsChecked.Value,
                FacultyLookupCode = model.Faculty,
                Authors = model.Authors,
                EmailList = String.IsNullOrEmpty(model.NotificationEmails) ? [] : [.. new EmailItem().ConvertToList(model.NotificationEmails).Split(";")],
                SubmitterUsername = username,
                NewDocuments = result.NewDocuments,
                DisclaimerOption = model.InstitutionalRepoModel.IsChecked.Value ? "Yes" : "No",
                IsResubmissionEmail = model.IsEditMode
            };
            return emailModel;
        }



    public static readonly Dictionary<string, (string inputId, DocumentType docType, string label, bool required, string[] applicableResearchTypes)> DocumentMap = new()
    {
        // Journal Article documents
        { "PublishedPaperUpload", ("PublishedPaper", DocumentType.Research, "Published Paper", true, new[] { "journal article" }) },
        { "ManuscriptUpload", ("Manuscript", DocumentType.ManuScript, "Manuscript", false, new[] { "journal article" }) },
        { "SupportingDocUpload", ("SupportingDoc", DocumentType.SupportingDocument, "Supporting Document", false, new[] { "journal article" }) },
        { "TocToUpload", ("TocUpload", DocumentType.TableofContent, "Table of Contents", false, new[] { "journal article" }) },
        { "DhetLetterUpload", ("DhetLetter", DocumentType.DhetLetter, "25/75% Contribution Letter", true, new[] { "journal article" }) },
        { "FqcDeclarationUpload", ("FqcDeclaration", DocumentType.FqcDeclaration, "FQC Declaration", true, new[] { "journal article" }) },

        // Book documents
        { "PublishedBookUpload", ("PublishedBook", DocumentType.Research, "Published Book", true, new[] { "book" }) },
        { "PeerReviewLetterUpload", ("PeerReviewLetter", DocumentType.PeerReviewProcess, "Peer Review Letter", true, new[] { "book" }) },
        { "PeerReviewCommentsUpload", ("PeerReviewComments", DocumentType.PeerReviewComments, "Peer Review Comments", true, new[] { "book" }) },
        { "ScholarlyMotivationUpload", ("ScholarlyMotivation", DocumentType.ScholarlyMotivation, "Scholarly Motivation", true, new[] { "book" }) },
        { "LateMotivationUpload", ("LateMotivation", DocumentType.LateMotivationLetter, "Late Submission Motivation", false, new[] { "book" }) },

        // Book Chapter documents
        { "PublishedChapterUpload", ("PublishedChapter", DocumentType.Research, "Published Chapter", true, new[] { "book chapter" }) },
        { "PeerReviewLetterChapterUpload", ("PeerReviewLetterChapter", DocumentType.PeerReviewProcess, "Peer Review Letter (Chapter)", true, new[] { "book chapter" }) },
        { "PeerReviewCommentsChapterUpload", ("PeerReviewCommentsChapter", DocumentType.PeerReviewComments, "Peer Review Comments (Chapter)", true, new[] { "book chapter" }) },
        { "ScholarlyMotivationChapterUpload", ("ScholarlyMotivationChapter", DocumentType.ScholarlyMotivation, "Scholarly Motivation (Chapter)", true, new[] { "book chapter" }) },
        { "LateMotivationChapterUpload", ("LateMotivationChapter", DocumentType.LateMotivationLetter, "Late Submission Motivation (Chapter)", false, new[] { "book chapter" }) },
        { "FqcDeclarationUploadChapter", ("FqcDeclaration_Chapter", DocumentType.FqcDeclaration, "FQC Declaration (Chapter)", true, new[] { "book chapter" }) },

        // Conference Paper documents
        { "ConferencePublishedPaperUpload", ("ConferencePublishedPaper", DocumentType.Research, "Published Conference Paper", true, new[] { "conference paper" }) },
        { "ConferenceManuscriptUpload", ("ConferenceManuscript", DocumentType.ManuScript, "Conference Manuscript", false, new[] { "conference paper" }) },
        { "ConferenceTocUpload", ("ConferenceToc", DocumentType.TableofContent, "Conference Table of Contents", false, new[] { "conference paper" }) },
        { "ConferencePeerReviewUpload", ("ConferencePeerReview", DocumentType.PeerReviewProcess, "Conference Peer Review Letter", true, new[] { "conference paper" }) },
        { "ConferencePeerCommentsUpload", ("ConferencePeerComments", DocumentType.PeerReviewComments, "Conference Peer Review Comments", true, new[] { "conference paper" }) },
        { "CommitteeMembersUpload", ("CommitteeMembers", DocumentType.CommitteeMembers, "Committee Members List", true, new[] { "conference paper" }) },
        { "ConferenceSupportingDocUpload", ("ConferenceSupportingDoc", DocumentType.SupportingDocument, "Conference Supporting Document", false, new[] { "conference paper" }) },
        { "FqcDeclarationUploadConference", ("FqcDeclaration_Conference", DocumentType.FqcDeclaration, "FQC Declaration (Conference)", true, new[] { "conference paper" }) }
    };



        public static bool TryGetDocumentType(string docName, out DocumentType docType)
        {
            docType = default;

            if (string.IsNullOrWhiteSpace(docName))
                return false;

            // Normalize the name: remove spaces, trim, etc.
            var normalized = docName
                .Trim()
                .Replace(" ", "")        // Remove spaces
                .Replace("-", "")        // Remove hyphens if needed
                .Replace("_", "");       // Remove underscores if needed

            return Enum.TryParse(normalized, ignoreCase: true, out docType);
        }

    }
}

