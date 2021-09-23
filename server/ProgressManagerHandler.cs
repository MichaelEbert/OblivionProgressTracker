using Microsoft.AspNetCore.Mvc;

namespace ShareApi
{
    [ApiController]
    [Route("share")]
    public class ProgressManagerHandler : ControllerBase
    {
        [HttpPost]
        public ActionResult<ProgressUpdate> HandleProgressUpdate(ProgressUpdate update){
            var good = ProgressUpdateValidator.Validate(update);
            if (good)
            {
                ProgressManager mgr = new ProgressManager();
                string newurl = mgr.HandleUpdate(update);
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
                return BadRequest();
            }
        }
    }
}