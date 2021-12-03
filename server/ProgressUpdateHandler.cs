using Microsoft.AspNetCore.Mvc;

namespace ShareApi
{
    [ApiController]
    [Route("share")]
    public class ProgressUpdateHandler : ControllerBase
    {
        private static ProgressManager mgr = new ProgressManager();
        [HttpPost]
        public ActionResult<ProgressUpdate> HandleProgressUpdate(ProgressUpdate update){
            bool passed = ProgressUpdateValidator.Validate(update, out var reason);
            if (passed)
            {
                string? newurl = mgr.HandleUpdate(update);
                if (newurl != null)
                {
                    return Ok(newurl);
                }
                else
                {
                    return Unauthorized();
                }
            }
            else
            {
                return BadRequest(reason.ToString());
            }
        }
    }
}