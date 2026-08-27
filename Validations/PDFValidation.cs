using System.ComponentModel.DataAnnotations;
using Spire.Pdf;

namespace ResearchSuite.Validations
{
    public class PDFValidation : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var file = value as IFormFile;
            if (file == null) {
                return ValidationResult.Success;
            }
            byte[] fileBytes;

            using (var memoryStream = new MemoryStream())
            {
                file.CopyTo(memoryStream);
                fileBytes = memoryStream.ToArray();
            }

            bool isPdfValid;
            using (var fileStream = new MemoryStream(fileBytes))
            {
                isPdfValid = IsPdfValid(fileStream);
            }
            if (!isPdfValid) {
                return new ValidationResult($"{file.FileName} is not a valid pdf file");
            }
            return ValidationResult.Success;
        }

        public static bool IsPdfValid(Stream input)
        {
            try
            {
                // Load the PDF document
                using (PdfDocument document = new PdfDocument())
                {
                    document.LoadFromStream(input);
                }
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

    }

}
