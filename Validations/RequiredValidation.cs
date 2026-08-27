using System.ComponentModel.DataAnnotations;
using ResearchSuite.Models.Oross;

namespace ResearchSuite.Validations
{
    public class RequiredValidation : ValidationAttribute
    {
        private readonly int _researchType;
        public RequiredValidation(int researchType)
        {
            _researchType = researchType;
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var instance = validationContext.ObjectInstance;
            var model = instance as NewSubmissionViewModel;

            if (model != null)
            {
                if (_researchType.Equals(1))
                {
                    var verified = (bool)value;
                    if (!verified)
                    {
                        return new ValidationResult("Please upload your DHET Letter");
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
