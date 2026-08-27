using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using ClosedXML.Excel;
using ResearchSuite.Helpers;

public static class ExcelHelper
{
    public static byte[] ExportToExcel<T>(List<T> data, string worksheetName = "Sheet1")
    {
        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add(worksheetName);

            // Define the columns you want to export and in which order
            var exportColumns = new List<(string PropertyName, string Header)>
        {
            ("ResearchId", "Reference Number"),
            ("CreatedBy", "Created By"),
            ("Author", "Author"),
            ("PrimaryAuthor", "Primary Author"),
            ("Research_Output", "Research Type"),
            ("PublicationTitle", "Publication Title"),
            ("Faculty", "Faculty"),
            ("SDG", "SDG"),
            ("Publish", "Included to Repository"),
            ("CreatedDate", "Created Date"),
            ("LastChangedDate", "RFA Date"),
            ("RFAstatus", "RFA Status"),
        };

            // Add header row
            for (int i = 0; i < exportColumns.Count; i++)
            {
                var cell = worksheet.Cell(1, i + 1);
                cell.Value = exportColumns[i].Header;
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#f26522");
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            }

            // Add data rows
            for (int row = 0; row < data.Count; row++)
            {
                var item = data[row];
                for (int col = 0; col < exportColumns.Count; col++)
                {
                    var propName = exportColumns[col].PropertyName;
                    var prop = typeof(T).GetProperty(propName);
                    var cell = worksheet.Cell(row + 2, col + 1);

                    if (prop != null)
                    {
                        var rawValue = prop.GetValue(item);
                        string displayValue;

                        if (propName == "publish")
                        {
                            displayValue = ((rawValue?.ToString()?.ToLowerInvariant()) == "yes") ? "Yes" : "No";
                        }
                        else if (propName == "createdDate" || propName == "lastChangedDate")
                        {
                            if (rawValue is DateTime dt)
                                displayValue = dt.ToString("yyyy-MM-dd HH:mm");
                            else
                                displayValue = rawValue?.ToString() ?? "";
                        }
                        else
                        {
                            displayValue = rawValue?.ToString() ?? "";

                            if (propName.Equals("CreatedBy", StringComparison.OrdinalIgnoreCase) ||
                                propName.Equals("Author", StringComparison.OrdinalIgnoreCase) ||
                                propName.Equals("PrimaryAuthor", StringComparison.OrdinalIgnoreCase))
                            {
                                displayValue = UserHelper.ToProperCase(displayValue);
                            }
                        }


                        cell.Value = displayValue;

                        var bgColor = (row % 2 == 0) ? XLColor.White : XLColor.LightGray;
                        cell.Style.Fill.BackgroundColor = bgColor;
                        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    }
                }
            }

            worksheet.Columns().AdjustToContents();
            worksheet.RangeUsed().SetAutoFilter();

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
        }
    }

}


