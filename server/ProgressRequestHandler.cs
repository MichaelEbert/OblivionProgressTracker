using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

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
                    if(ProgressManager.Cache.TryGet(url, sql.SqlSaveSelect, out ReadProgress result))
                    {
                        var reqIp = Request.HttpContext.Connection.RemoteIpAddress?.MapToIPv6() ?? IPAddress.IPv6None;
                        ViewCountHandler.ViewCounter.Add(reqIp, url);

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