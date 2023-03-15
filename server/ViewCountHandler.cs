using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ShareApi
{
    [Route("url/{url}/views")]
    [ApiController]
    public class ViewCountHandler : ControllerBase
    {
        public static ViewCount ViewCounter = new ViewCount();

        [HttpGet]
        public ActionResult<int> HandleViewCount(string url)
        {
            return Ok(ViewCounter.GetViewCount(url));
        }
    }
}
