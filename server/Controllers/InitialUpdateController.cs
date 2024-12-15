using Microsoft.AspNetCore.Mvc;

namespace ShareApi
{
    public class Error
    {
        public string ErrorMessage { get; set; } = "";
    }

    /// <summary>
    /// Handle a request to /share. This usually happens on the initial request.
    /// </summary>
    [ApiController]
    [Route("share")]
    public class InitialUpdateController : ControllerBase
    {
        [HttpPost]
        public ActionResult<ProgressUpdate> HandleProgressUpdate(ProgressUpdate update){

            bool passed = ProgressUpdateValidator.Validate(update, out var reason);
            if (passed)
            {
                
                if(update.Url != null)
                {
                    //existing url. Should go to /share/{url}/d
                    return RedirectToActionPermanent("HandleProgressRequest","ProgressRequestHandler", new object[] { update.Url});
                }

                //new url:
                using (ProgressManagerSql sql = new ProgressManagerSql())
                {
                    var storedUrl = sql.SqlUrlSelect(update.Key);
                }
                string? newurl = ProgressManager.HandleUpdate(update);
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
                ModelState.AddModelError("error", reason.ToString());
                return BadRequest(ModelState);
            }
        }
    }
}