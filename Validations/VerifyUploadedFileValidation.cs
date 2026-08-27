using System.ComponentModel.DataAnnotations;
using ResearchSuite.Models.Oross;

namespace ResearchSuite.Validations
{
    public class VerifyUploadedFileValidation : ValidationAttribute
    {
        private readonly string _fileName;

        public VerifyUploadedFileValidation(string fileName)
        {
            _fileName = fileName;
        }
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var instance = validationContext.ObjectInstance;
            var model = instance as NewSubmissionViewModel;

            if (model != null)
            {
                if ((_fileName.Equals("PublishedPaper") && model.PublishedPaper != null) ||
                        (_fileName.Equals("Manuscript") && model.Manuscript != null) ||
                        (_fileName.Equals("SupportingDoc") && model.SupportingDoc != null) ||
                        (_fileName.Equals("TocUpload") && model.TocUpload != null) ||
                        (_fileName.Equals("DhetLetter") && model.DhetLetter != null) ||
                        (_fileName.Equals("FqcDeclaration") && model.FqcDeclaration != null))
                {
                    var verified = (bool)value;
                    if (!verified)
                    {
                        return new ValidationResult($"File has not been verified.");
                    }
                }
                return ValidationResult.Success;
            }
            else
            {
                return ValidationResult.Success;
            }
        }
    }
}
