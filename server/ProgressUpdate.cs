using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShareApi
{
    /// <summary>
    /// User sends JSON matching this format to input data.
    /// </summary>
    public class ProgressUpdate
    {
        public string? SaveData { get; set; }
        /// <summary>
        /// url to publish to. Leave blank if you do not have a url yet.
        /// </summary>
        public string? Url { get; set; }
        /// <summary>
        /// 64-byte key used for url validation
        /// </summary>
        public byte[]? Key { get; set; }
    }

    /// <summary>
    /// data returned for a GET query
    /// </summary>
    public class ReadProgress
    {
        public string SaveData;
        public DateTime LastModified;

        public ReadProgress(string saveData, DateTime lastModified)
        {
            SaveData = saveData;
            LastModified = lastModified;
        }
    }
}
