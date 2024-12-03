using System;

namespace ShareApi
{
    /// <summary>
    /// Handles the creation, update, and reads of saved progress items.
    /// </summary>
    public class ProgressManager{
        //TODO: move this to a better place
        public static ReadCache<ReadProgress> Cache = new ReadCache<ReadProgress>();

        Random randomGen;

        public ProgressManager(){
            randomGen = new Random();
        }

        /// <summary>
        /// Generate a new unique URL, and update the URL table with it.
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="key"></param>
        /// <returns>the new url</returns>
        private string GenerateNewUrlAndInsert(ProgressManagerSql sql, byte[] key){
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

        /// <summary>
        /// Update or insert save data.
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="url"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        private bool UpdateSaveData(ProgressManagerSql sql, string url, ReadProgress data){
            var updated = sql.SqlSaveUpdate(url,data);
            if(!updated){
                //need to insert
                return sql.SqlSaveInsert(url, data);
            }
            else{
                return updated;
            }
        }

        /// <summary>
        /// Do progress update stuff. Called if update passes validation.
        /// </summary>
        /// <param name="update"></param>
        /// <returns></returns>
        public string? HandleUpdate(ProgressUpdate update){
            string? url = update.Url;
            using(ProgressManagerSql sql = new ProgressManagerSql()) { 
                var storedUrl = sql.SqlUrlSelect(update.Key);
                if (storedUrl == null && url == null){
                    //this is a new request. 
                    url = GenerateNewUrlAndInsert(sql, update.Key);
                }
                else{
                    if(url != storedUrl){
                        //return 401
                        return null;
                    }
                }

                //we have a valid URL.
                Cache.Set(url, new ReadProgress(update.SaveData, DateTime.UtcNow),
                    (url, data) => { UpdateSaveData(sql, url, data); });

                //return OK
                return url;
            }
        }

    }
}