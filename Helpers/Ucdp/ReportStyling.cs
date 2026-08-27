namespace ResearchSuite.Helpers.Ucdp
{
    public static class ReportStyling
    {
        public static string ApplyEmbeddedStyles(string htmlContent) 
        { 
            return $@"
                <!DOCTYPE html>
                <html lang='en'>
                <head>
                    <meta charset='UTF-8'>
                    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Report</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                       /* ===== BASE STYLING FOR PDF GENERATION ===== */
                        * {{
                            box-sizing: border-box;
                        }}

                        body {{
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f8f9fa;
                            margin: 0;
                            padding: 20px;
                            font-size: 14px;
                        }}

                        /* ===== REPORT HEADER ===== */
                        .report-header {{
                            border-bottom: 3px solid #e74c3c;
                            padding-bottom: 15px;
                            margin-bottom: 25px;
                        }}

                        .report-title {{
                            color: #2c3e50;
                            font-size: 28px;
                            font-weight: 700;
                            margin: 0 0 5px 0;
                        }}

                        .report-subtitle {{
                            color: #7f8c8d;
                            font-size: 16px;
                            font-weight: 400;
                            margin: 0;
                        }}

                        /* ===== CRITICAL: SHOW ALL TAB CONTENT ===== */
                        /* Override all hidden tab content for PDF */
                        .tab-content > .tab-pane {{
                            display: block !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                            position: static !important;
                        }}

                        .tab-pane {{
                            margin-bottom: 40px;
                            page-break-before: auto;
                            page-break-inside: avoid;
                            background: white;
                            border-radius: 8px;
                            padding: 25px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                        }}

                        /* Hide the actual tab navigation for PDF */
                        .nav-tabs {{
                            display: none !important;
                        }}

                        /* Create section headers for each tab */
                        .tab-pane:before {{
                            content: attr(id);
                            display: block;
                            font-weight: 700;
                            font-size: 20px;
                            color: white;
                            background: linear-gradient(to right, #3498db, #2980b9);
                            padding: 15px 20px;
                            margin: -25px -25px 25px -25px;
                            border-radius: 8px 8px 0 0;
                            text-transform: capitalize;
                            text-align: left;
                            position: relative;
                        }}

                        /* Custom titles for each tab */
                        #recipient:before {{ content: ""Grant Recipient Details""; }}
                        #qualification:before {{ content: ""Qualifications""; }}
                        #teaching:before {{ content: ""Teaching Relief Appointment""; }}
                        #publications:before {{ content: ""Publications""; }}
                        #projects:before {{ content: ""Research Projects""; }}
                        #collab:before {{ content: ""Collaborative Projects""; }}
                        #financial:before {{ content: ""Financial Report""; }}

                        /* ===== SECTION STYLING ===== */
                        .form-section {{
                            background: transparent;
                            border-radius: 0;
                            box-shadow: none;
                            padding: 0;
                            margin-bottom: 0;
                        }}

                        .section-title {{
                            background: linear-gradient(to right, #3498db, #2980b9);
                            color: white;
                            padding: 12px 20px;
                            border-radius: 6px 6px 0 0;
                            font-size: 18px;
                            font-weight: 600;
                            margin: 0 0 25px 0;
                            position: relative;
                        }}

                        /* ===== FORM CONTROLS ===== */
                        .form-label {{
                            font-weight: 600;
                            color: #2c3e50;
                            margin-bottom: 8px;
                            display: block;
                            font-size: 14px;
                        }}

                        .form-control, .form-select, textarea.form-control {{
                            width: 100%;
                            padding: 10px 12px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            background-color: #f9f9f9;
                            font-size: 14px;
                            color: #333;
                            margin-bottom: 15px;
                            page-break-inside: avoid;
                        }}

                        textarea.form-control {{
                            min-height: 120px;
                            resize: vertical;
                        }}

                        /* ===== GRID LAYOUT ===== */
                        .row {{
                            display: flex;
                            flex-wrap: wrap;
                            margin: 0 -10px;
                            page-break-inside: avoid;
                        }}

                        .col-md-6, .col-md-4, .col-12 {{
                            padding: 0 10px;
                            margin-bottom: 15px;
                        }}

                        .col-md-6 {{
                            flex: 0 0 50%;
                            max-width: 50%;
                        }}

                        .col-md-4 {{
                            flex: 0 0 33.333%;
                            max-width: 33.333%;
                        }}

                        .col-12 {{
                            flex: 0 0 100%;
                            max-width: 100%;
                        }}

                        /* ===== PAGE BREAK CONTROL ===== */
                        .page-break-before {{
                            page-break-before: always;
                        }}

                        .page-break-after {{
                            page-break-after: always;
                        }}

                        .avoid-break {{
                            page-break-inside: avoid;
                        }}

                        /* Force page break after key sections if needed */
                        /* #qualification, #teaching, #publications, #projects {{
                            page-break-after: always;
                        }} */

                        /* Or let it flow naturally */
                        .tab-pane {{
                            page-break-before: auto;
                            page-break-after: auto;
                        }}

                        /* ===== DOCUMENT LISTS ===== */
                        .document-list {{
                            list-style: none;
                            padding: 0;
                            margin: 15px 0;
                            border: 1px solid #eee;
                            border-radius: 4px;
                            overflow: hidden;
                            page-break-inside: avoid;
                        }}

                        .document-item {{
                            padding: 12px 15px;
                            border-bottom: 1px solid #eee;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            background: #fafafa;
                        }}

                        .document-item:last-child {{
                            border-bottom: none;
                        }}

                        .document-name {{
                            font-weight: 500;
                            color: #2c3e50;
                        }}

                        /* ===== BUTTON STYLING (for visual reference only) ===== */
                        .btn {{
                            display: none; /* Hide buttons in PDF */
                        }}

                        /* But show view buttons */
                        .btn.view-file {{
                            display: inline-block;
                            padding: 4px 12px;
                            border: 1px solid #3498db;
                            border-radius: 3px;
                            color: #3498db;
                            text-decoration: none;
                            font-size: 12px;
                            background: white;
                            margin: 2px;
                        }}

                        /* ===== ALERTS AND NOTICES ===== */
                        .alert {{
                            padding: 12px 15px;
                            border-radius: 4px;
                            margin-bottom: 15px;
                            page-break-inside: avoid;
                        }}

                        .alert-warning {{
                            background-color: #fff3cd;
                            border: 1px solid #ffeaa7;
                            color: #856404;
                        }}

                        /* ===== TABLES (if needed) ===== */
                        .table {{
                            width: 100%;
                            border-collapse: collapse;
                            margin: 15px 0;
                            page-break-inside: avoid;
                        }}

                        .table th, .table td {{
                            padding: 10px 15px;
                            border: 1px solid #ddd;
                            text-align: left;
                        }}

                        .table th {{
                            background-color: #f2f2f2;
                            font-weight: 600;
                            color: #2c3e50;
                        }}

                        /* ===== UTILITY CLASSES ===== */
                        .text-muted {{
                            color: #7f8c8d !important;
                        }}

                        .text-danger {{
                            color: #e74c3c !important;
                        }}

                        .small {{
                            font-size: 12px;
                        }}

                        .mb-0 {{ margin-bottom: 0 !important; }}
                        .mb-2 {{ margin-bottom: 10px !important; }}
                        .mb-3 {{ margin-bottom: 15px !important; }}
                        .mb-4 {{ margin-bottom: 20px !important; }}
                        .mt-3 {{ margin-top: 15px !important; }}
                        .mt-4 {{ margin-top: 20px !important; }}
                        .ms-2 {{ margin-left: 10px !important; }}

                        .d-flex {{ display: flex !important; }}
                        .justify-content-between {{ justify-content: space-between !important; }}
                        .align-items-center {{ align-items: center !important; }}

                        .border-bottom {{ border-bottom: 1px solid #eee !important; }}

                        /* ===== HIDE UNNECESSARY ELEMENTS FOR PDF ===== */
                        /* Hide modal */
                        .modal {{
                            display: none !important;
                        }}

                        /* Hide file inputs and non-view buttons */
                        input[type=""file""],
                        button:not(.view-file),
                        .btn-group,
                        .btn-check {{
                            display: none !important;
                        }}

                        /* Hide back/next/close buttons */
                        #btnNextToQualification,
                        #btnQualificationBack,
                        #btnNextToGraduated,
                        #btnPublicationsBack,
                        #btnNextToProjects,
                        #btnResearchProjectsBack,
                        #btnNextToCollabProjects,
                        #btncollaborativeProjectBack,
                        #btnNextToFinancialReport,
                        .btn-secondary {{
                            display: none !important;
                        }}

                        /* ===== PRINT/PDF SPECIFIC ===== */
                        @media print {{
                            body {{
                                padding: 10px !important;
                                background: white !important;
                                font-size: 12px !important;
                                margin: 0 !important;
                            }}
    
                            .tab-pane {{
                                margin-bottom: 30px !important;
                                padding: 20px !important;
                                box-shadow: none !important;
                                border: 1px solid #eee !important;
                                break-inside: avoid;
                            }}
    
                            .tab-pane:before {{
                                font-size: 16px !important;
                                padding: 12px 15px !important;
                                margin: -20px -20px 20px -20px !important;
                            }}
    
                            /* Ensure proper spacing */
                            .tab-pane + .tab-pane {{
                                margin-top: 40px;
                            }}
    
                            /* Control page breaks */
                            .tab-pane {{
                                page-break-inside: avoid;
                                page-break-after: auto;
                            }}
    
                            /* Optional: Force page break after major sections */
                            /*
                            #teaching,
                            #publications,
                            #projects {{
                                page-break-after: always;
                            }}
                            */
    
                            /* Hide everything that shouldn't print */
                            .nav-tabs,
                            .btn:not(.view-file),
                            input[type=""file""],
                            .modal {{
                                display: none !important;
                            }}
    
                            /* Show all content */
                            .tab-content > .tab-pane {{
                                display: block !important;
                                visibility: visible !important;
                                height: auto !important;
                                opacity: 1 !important;
                            }}
                        }}

                        /* ===== COLOR SCHEME ===== */
                        :root {{
                            --primary-color: #3498db;
                            --secondary-color: #2c3e50;
                            --accent-color: #e74c3c;
                            --success-color: #27ae60;
                            --light-gray: #f8f9fa;
                            --border-color: #ddd;
                        }}

                        /* ===== FIX FOR SPECIFIC ELEMENTS ===== */
                        .border-orange-line {{
                            border-bottom: 3px solid #ff6a00;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                        }}

                        .text-orange {{
                            color: #ff6a00;
                        }}

                        /* Hide Bootstrap icons and show text equivalents */
                        .bi {{
                            font-style: normal;
                            display: inline-block;
                            margin-right: 5px;
                        }}

                        /* Replace with text labels */
                        .bi-person-fill:before {{ content: ""👤 Person""; }}
                        .bi-mortarboard-fill:before {{ content: ""🎓 Qualifications""; }}
                        .bi-pencil-square:before {{ content: ""📝 Teaching""; }}
                        .bi-journal-text:before {{ content: ""📄 Publications""; }}
                        .bi-search:before {{ content: ""🔍 Research""; }}
                        .bi-people-fill:before {{ content: ""👥 Collaboration""; }}
                        .bi-cash-stack:before {{ content: ""💰 Finance""; }}
                        .bi-eye:before {{ content: ""View""; }}
                        .bi-trash:before {{ content: """"; display: none; }}
                        .bi-x-circle:before {{ content: """"; display: none; }}
                        .bi-box-arrow-right:before {{ content: """"; display: none; }}
                        .bi-chevron-left:before {{ content: """"; display: none; }}

                        /* ===== CARD STYLING (if your card class is used) ===== */
                        .card {{
                            background: transparent;
                            border: none;
                            box-shadow: none;
                        }}

                        .card-body {{
                            padding: 0;
                        }}
                    </style>
                </head>
                <body>
                    {htmlContent.Replace("style=\"display:none\"", "")}
                </body>
                </html>";
        }
    }
}
