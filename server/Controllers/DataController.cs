using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.VisualBasic;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Xml;
using System.Xml.Linq;

namespace ShareApi.Controllers
{
    [ApiController]
    [Route("share/{url}/d/{**jsonPath}")]
    public class DataController : Controller
    {


        [HttpGet]
        public ActionResult<string> HandleGet(string url, string? jsonPath)
        {
            var saveEditor = new SaveDataEditor(url);
            return Ok(saveEditor.HandleData(new HttpMethod(Request.Method), jsonPath, null));
        }

        [HttpPut]
        [HttpPost]
        public ActionResult<string> Handle(ProgressUpdate update, string url, string? jsonPath)
        {
            ProgressUpdateValidator.Validate(update, out ValidationFailedReason validationFailedReason);
            if(validationFailedReason != ValidationFailedReason.NONE)
            {
                ModelState.AddModelError("error", validationFailedReason.ToString());
                return BadRequest(ModelState);
            }
            var saveEditor = new SaveDataEditor(url, update);
            if(saveEditor.ReadOnly)
            {
                return Unauthorized();
            }
            return Ok(saveEditor.HandleData(new HttpMethod(Request.Method), jsonPath, JsonNode.Parse(update.SaveData)));
        }
    }

    public class JsonProxyNode
    {
        public JsonNode? parent;
        public string Name;
        public JsonNode? contents;

        public JsonProxyNode(string name)
        {
            this.Name = name;
        }

        /// <summary>
        /// Update the json tree and return the changed tree.
        /// </summary>
        /// <returns></returns>
        public JsonNode Commit()
        {
            if (parent != null)
            {
                parent[Name] = contents;
                return parent.Root ?? parent;
            }
            else
            {
                return contents;
            }
            
        }
    }
}
