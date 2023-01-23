using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using System.Linq;
using System.Reflection.Metadata;
using System.Runtime.ConstrainedExecution;

namespace ShareApi
{
    [ApiController]
    [Route("share/{url}")]
    public class ProgressRequestHandler : ControllerBase
    {
        [HttpGet]
        public ActionResult<string> HandleProgressRequest(string url)
        {
            if(url.Length != 6)
            {
                return BadRequest();
            }
            else
            {
                using (ProgressManagerSql sql = new ProgressManagerSql())
                {
                    var result = ProgressManager.Cache.Get(url, sql.SqlSaveSelect);
                    if(result != null)
                    {
                        var headers = Request.GetTypedHeaders();
                        if (headers.IfModifiedSince.HasValue && headers.IfModifiedSince.Value > result.LastModified)
                        {
                            return StatusCode((int)System.Net.HttpStatusCode.NotModified);
                        }
                        else
                        {
                            return Ok(result.SaveData);
                        }
                    }
                    else
                    {
                        return NotFound();
                    }
                }
            }
            
        }
    }
}