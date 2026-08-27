using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace ResearchSuite.Helpers.Ucdp
{
    public enum FundingCallStatusEnum
    {
        [Description("New")]
        New = 1,

        [Description("In Progress")]
        InProgress = 2,

        [Description("Expired")]
        Expired = 3
    }
}
