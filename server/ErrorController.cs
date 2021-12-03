using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace ShareApi
{
    
    [ApiController]
    public class ErrorController : ControllerBase
    {
        /// <summary>
        /// Called when we throw an exception.
        /// if it's a sql exception, we throw a 503 unavailable. This was mainly from when we were using an on-demand database,
        /// so it would take time to spin up. Shouldn't be an issue now.
        /// </summary>
        /// <returns></returns>
        [Route("/error")]
        public IActionResult Error()
        {
            var context = HttpContext.Features.Get<IExceptionHandlerFeature>();
            if(context.Error is SqlException sqlex)
            {
                System.Diagnostics.Trace.TraceError("SQL ERROR GOT:"+ sqlex.ToString());
                return StatusCode(503);
            }
            if(context.Error?.InnerException is SqlException sqlex2)
            {
                if(sqlex2.Number != 0)
                {
                    System.Diagnostics.Trace.TraceError("SQL INNER ERROR GOT:" + sqlex2.ToString());
                    return StatusCode(503);
                }
            }
            System.Diagnostics.Trace.TraceError("MISC ERROR GOT:" + context.Error?.ToString());
            return StatusCode(500);
        }
    }
}
