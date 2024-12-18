using Microsoft.AspNetCore.DataProtection.KeyManagement;
using System;
using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Nodes;

namespace ShareApi
{
    /// <summary>
    /// Handles the creation, update, and reads of saved progress items.
    /// </summary>
    public class ProgressManager{
        public static ProgressManager Instance = new ProgressManager();
        private ReadCache<ReadProgress> Cache = new ReadCache<ReadProgress>();
        private Random randomGen = new Random();

        private ProgressManager(){
        }

        /// <summary>
        /// Generate a new unique URL, and update the URL table with it.
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="key"></param>
        /// <returns>the new url</returns>
        public string GenerateNewUrlAndInsert(ProgressManagerSql sql, byte[] key){
            //6-character base64 = 6*6 = 36 bits, pad to 40 = 5 bytes
            byte[] bytes = new byte[5];
            string newUrl;
            bool ok;
            int tries = 0;
            do{
                randomGen.NextBytes(bytes);
                newUrl = Convert.ToBase64String(bytes).Substring(0,6).ToUpperInvariant();
                newUrl = newUrl.Replace('+', '~').Replace('/', '_');
                ok = sql.SqlUrlInsert(key,newUrl);
                if(tries++ > 10)
                {
                    throw new Exception("Could not place new url after 10 tries");
                }
            }
            while(ok == false);
            //we have the new URL! and it is unique.
            return newUrl;
        }

        public bool TryGetValue(string shareKey, [NotNullWhen(true)] out ReadProgress? result)
        {
            if (!Cache.TryGetCacheOnly(shareKey, out result))
            {
                //not found in cache. Find in backing store.
                using (ProgressManagerSql sql = new ProgressManagerSql())
                {
                    if (!Cache.TryGet(shareKey, sql.SqlSaveSelect, out result))
                    {
                        result = default;
                        return false;
                    }
                }
            }
            return true;
        }

        /// <summary>
        /// Update or insert save data.
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="url"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        public bool UpdateSaveData(ProgressManagerSql sql, string url, ReadProgress data){
            return sql.SqlSaveMerge(url,data);
        }

        public bool VerifyKey(ProgressManagerSql sql, string saveId, byte[] saveKey)
        {
            return sql.SqlUrlSelect(saveKey) == saveId;
        }

        /// <summary>
        /// Do progress update stuff. Called if update passes validation.
        /// </summary>
        /// <param name="update"></param>
        /// <returns></returns>
        public string? HandleUpdate(ProgressUpdate update){
            string? url = update.Url;
            using(ProgressManagerSql sql = new ProgressManagerSql()) { 

                //we have a valid URL.
                Cache.Set(url, new ReadProgress(update.SaveData, DateTime.UtcNow),
                    (url, data) => { UpdateSaveData(sql, url, data); });

                //return OK
                return url;
            }
        }

    }
}