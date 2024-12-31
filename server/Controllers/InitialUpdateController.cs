using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Http;
using System.Text.Json.Nodes;

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
                    return RedirectPermanentPreserveMethod($"share/{update.Url}/d");
                }

                //new url:
                using (ProgressManagerSql sql = new ProgressManagerSql())
                {
                    string? shareCode = sql.SqlUrlSelect(update.Key);
                    if (shareCode == null)
                    {
                        //this is a new request. 
                        shareCode = ProgressManager.Instance.GenerateNewUrlAndInsert(sql, update.Key);
                        var saveEditor = new SaveDataEditor(shareCode, update);
                        if (saveEditor.ReadOnly)
                        {
                            return Unauthorized();
                        }
                        saveEditor.HandleData(new HttpMethod(Request.Method), null, JsonNode.Parse(update.SaveData));
                    }
                    return Ok(shareCode);
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