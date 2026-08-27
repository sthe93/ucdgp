using Microsoft.AspNetCore.Mvc;

namespace ResearchSuite.Controllers
{
    public class URCController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
