using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Xml;
using System.Xml.Linq;

namespace ShareApi.Controllers
{
    [ApiController]
    [Route("share/{url}/d/{*tail}")]
    public class DataController : Controller
    {
        public IActionResult Get(string? tail)
        {
            DataHandler.Instance.Route(HttpMethod.Get, tail);
        }
    }

    public class DataHandler
    {
        private JsonDocument? data;
        private string shareCode;
        ProgressManagerSql sql = new ProgressManagerSql();

        public DataHandler(string shareCode)
        {
            this.shareCode = shareCode;
            ReadProgress progress;
            if (!ProgressManager.Cache.TryGet(shareCode, sql.SqlSaveSelect, out progress))
            {
                data = null;
            }
            data = JsonDocument.Parse(progress.SaveData);
        }
        public void UpdateData(HttpMethod method, string route, JsonDocument newData)
        {
            var node = GetNode(route.Split('\\'));
            if(node != null)
            {
                if(method == HttpMethod.Get)
                {
                    return node.contents;
                }
                else if (method == HttpMethod.Put)
                {
                    node.contents = newData.RootElement;
                    ReadProgress prog;
                    //ProgressManager.HandleUpdate()
                    return node.contents;
                }
            }
        }

        /// <summary>
        /// Get node contents. returns null if **parent** isnt defined.
        /// </summary>
        /// <returns></returns>
        private JsonDocument? GetNode(string[] path)
        {
            if(path.Length == 0)
            {
                //we have 
            }
            //data.RootElement();
            return null;
        }
    }
}
