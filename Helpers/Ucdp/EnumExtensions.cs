using System.ComponentModel;
using System.Reflection;

namespace ResearchSuite.Helpers.Ucdp
{
    public static class EnumExtensions
    {
        public static string GetDescription<T>(this T enumValue) where T : struct, IConvertible
        {
            if (!typeof(T).IsEnum)
                return null;

            var description = enumValue.ToString();
            var fieldInfo = enumValue.GetType().GetField(enumValue.ToString());

            if (fieldInfo != null)
            {
                var attrs = fieldInfo.GetCustomAttributes(typeof(DescriptionAttribute), true);
                if (attrs != null && attrs.Length > 0)
                {
                    description = ((DescriptionAttribute)attrs[0]).Description;
                }
            }

            return description;
        }

        public static string GetEnumDescription<T>(int value)
        {
            var enumValue = (T)Enum.ToObject(typeof(T), value);
            var fieldInfo = enumValue.GetType().GetField(enumValue.ToString());

            var attribute = fieldInfo.GetCustomAttribute<DescriptionAttribute>();
            return attribute != null ? attribute.Description : enumValue.ToString();
        }

    }
}
