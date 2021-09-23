using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShareApi
{
    public class ProgressUpdate
    {
        public string SaveData { get; set; }
        /// <summary>
        /// url to publish to. Leave blank if you do not have a url yet.
        /// </summary>
        public string Url { get; set; }
        /// <summary>
        /// 64-byte key used for url validation
        /// </summary>
        public byte[] Key { get; set; }
    }
}
