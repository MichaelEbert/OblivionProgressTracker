using System;

namespace ShareApi
{
    public class ProgressManager{
        Random randomGen;

        public ProgressManager(){
            randomGen = new Random();
        }

        private string GenerateNewUrlAndInsert(Lazy<ProgressManagerSql> sql, byte[] key){
            //6-character base64 = 6*6 = 36 bits, pad to 40 = 5 bytes
            byte[] bytes = new byte[5];
            string newUrl;
            bool ok;
            int tries = 0;
            do{
                randomGen.NextBytes(bytes);
                newUrl = Convert.ToBase64String(bytes).Substring(0,6).ToUpperInvariant();
                newUrl = newUrl.Replace('+', '~').Replace('/', '_');
                ok = sql.Value.SqlUrlInsert(key,newUrl);
                if(tries++ > 10)
                {
                    throw new Exception("Could not place new url after 10 tries");
                }
            }
            while(ok == false);
            //we have the new URL! and it is unique.
            return newUrl;
        }

        private bool UpdateSaveData(Lazy<ProgressManagerSql> sql, string url, string data){
            var updated = sql.Value.SqlSaveUpdate(url,data);
            if(!updated){
                //need to insert
                return sql.Value.SqlSaveInsert(url, data);
            }
            else{
                return updated;
            }
        }

        public string HandleUpdate(ProgressUpdate update){
            Lazy<ProgressManagerSql> sql = new Lazy<ProgressManagerSql>();
            string url = update.Url;
            try{
                var storedUrl = sql.Value.SqlUrlSelect(update.Key);
                if (storedUrl == null && update.Url == null){
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
                UpdateSaveData(sql, url,update.SaveData);

                //return OK
                return url;
            }
            finally{
                if(sql.IsValueCreated){
                    sql.Value.Dispose();
                }
            }
        }

    }
}