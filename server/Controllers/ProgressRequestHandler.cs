using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
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
                ReadProgress result;
                if(!ProgressManager.Cache.TryGetCacheOnly(url, out result))
                {
                    //not found in cache. Find in backing store.
                    using (ProgressManagerSql sql = new ProgressManagerSql())
                    {
                        if (!ProgressManager.Cache.TryGet(url, sql.SqlSaveSelect, out result))
                        {
                            return NotFound();
                        }
                    }
                }

                Debug.Assert(result != null, "result returned for url is null.");

                //if we get here, then url maps to a valid progress
                var requestIp = Request.HttpContext.Connection.RemoteIpAddress?.MapToIPv6() ?? IPAddress.IPv6None;
                ViewCountHandler.ViewCounter.Add(requestIp, url);

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
            
        }
    }
}