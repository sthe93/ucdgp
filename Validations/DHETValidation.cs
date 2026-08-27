using System.ComponentModel.DataAnnotations;
using ResearchSuite.Models.Oross;

namespace ResearchSuite.Validations
{
    public class DHETValidation : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var instance = validationContext.ObjectInstance;
            var model = instance as NewSubmissionViewModel;

            if (model != null)
            {
                var isDhetChecked = model.DHETIndexedModel?.IsChecked ?? false;

                if (isDhetChecked && model.DhetLetter == null)
                {
                    var verified = (bool)value;
                    if (!verified)
                    {
                        return new ValidationResult("Please upload your DHET Letter");
                    }
                }
            }

            return ValidationResult.Success;
        }

    }
}
