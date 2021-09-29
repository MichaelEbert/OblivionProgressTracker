using Microsoft.AspNetCore.Mvc;

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
                    var result = sql.SqlSaveSelect(url);
                    if(result != null)
                    {
                        return Ok(result);
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