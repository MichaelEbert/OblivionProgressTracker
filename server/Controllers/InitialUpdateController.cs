using Microsoft.AspNetCore.Mvc;
using System;

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
                    return RedirectToActionPermanent("Handle", "DataController", new object[] { update.Url});
                }

                //new url:
                using (ProgressManagerSql sql = new ProgressManagerSql())
                {
                    string? shareCode = null ;
                    var storedShareCode = sql.SqlUrlSelect(update.Key);
                    if (storedShareCode == null)
                    {
                        //this is a new request. 
                        shareCode = ProgressManager.Instance.GenerateNewUrlAndInsert(sql, update.Key);
                        return RedirectToActionPermanent("HandleProgressRequest","ProgressRequestHandler", new object[] { shareCode });
                    }
                    else
                    {
                        return Ok(storedShareCode);
                    }
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