﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
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
        [HttpPut]
        public IActionResult Handle(ProgressUpdate update, string url, string? jsonPath)
        {
            //Request.HttpContext.Connection.RemoteIpAddress
            ProgressUpdateValidator.Validate(update, out ValidationFailedReason validationFailedReason);
            if(validationFailedReason != ValidationFailedReason.NONE)
            {
                ModelState.AddModelError("error", validationFailedReason.ToString());
                return BadRequest(ModelState);
            }
            var saveEditor = new SaveDataEditor(update.Url);
            return Ok(saveEditor.HandleData(new HttpMethod(Request.Method), jsonPath, update.SaveData));
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

    public class SaveDataEditor
    {
        private JsonNode? oldData;
        private string shareCode;
        private DateTime updateTime;
        ProgressManagerSql sql = new ProgressManagerSql();

        /// <summary>
        /// Initialize the editor and get the json data.
        /// </summary>
        /// <param name="shareCode"></param>
        /// <param name="updateTime"></param>
        public SaveDataEditor(string shareCode)
        {
            this.shareCode = shareCode;
            if (ProgressManager.Instance.TryGetValue(shareCode, out ReadProgress? progress))
            {
                oldData = JsonNode.Parse(progress.SaveData);
                updateTime = progress.LastModified;
            }
            else
            {
                oldData = null;
                updateTime = DateTime.UtcNow;
            }
        }

        /// <summary>
        /// Handle data get/set.
        /// </summary>
        /// <param name="method"></param>
        /// <param name="route"></param>
        /// <param name="newData"></param>
        /// <returns>Updated contents of entire tree.</returns>
        public JsonNode? HandleData(HttpMethod method, string? route, JsonNode? newData)
        {
            var node = GetNode(route?.Split('/') ?? new Span<string>(), oldData);

            if(node != null)
            {
                if(method == HttpMethod.Get)
                {
                    return node.contents;
                }
                else if (method == HttpMethod.Put)
                {
                    node.contents = newData;
                    var newNode = node.Commit();
                    ProgressManager.Instance.UpdateSaveData(sql, shareCode, new ReadProgress(newNode, updateTime));
                    return newNode;
                }
            }
            return null;
        }

        /// <summary>
        /// Get node proxy. returns null if **parent** isnt defined.
        /// </summary>
        /// <returns></returns>
        private JsonProxyNode? GetNode(Span<string> path, JsonNode? root)
        {
            if(path.Length == 0)
            {
                return new JsonProxyNode("");
            }
            if(path.Length == 1)
            {
                JsonProxyNode result = new JsonProxyNode(path[0]);
                result.contents = root?[result.Name];
                result.parent = root;
            }
            else
            {
                return GetNode(path.Slice(1), root?[path[0]]);
            }
            return null;
        }
    }
}