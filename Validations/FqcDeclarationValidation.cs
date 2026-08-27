using ResearchSuite.Models.Oross;
using System.ComponentModel.DataAnnotations;

namespace ResearchSuite.Validations
{
    public class FqcDeclarationValidation: ValidationAttribute
    {
        private readonly string _fileName;

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var model = validationContext.ObjectInstance as NewSubmissionViewModel;

            if (model == null)
                return ValidationResult.Success;

            if (model.SpecialCategoryRequiredModel?.IsChecked == true)
            {
                var hasAnyFqc =
                    model.FqcDeclaration != null && model.FqcDeclaration.Length > 0 ||
                    model.FqcDeclaration_Conference != null && model.FqcDeclaration_Conference.Length > 0 ||
                    model.FqcDeclaration_Chapter != null && model.FqcDeclaration_Chapter.Length > 0;

                if (!hasAnyFqc)
                {
                    return new ValidationResult("Please upload your FQC declaration (required for special category).");
                }
            }

            return ValidationResult.Success;
        }

    }
}
