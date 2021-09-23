using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShareApi
{
    public class ProgressUpdateValidator
    {
        public static bool Validate(ProgressUpdate update)
        {
            if (update == null)
            {
                return false;
            }
            //check progress.savedata
            if(update.SaveData.Length > 4096)
            {
                return false; //not a valid cookie
            }

            //check progress.url
            if(update.Url != null)
            {
                if(update.Url.Length != 6)
                {
                    return false;
                }
            }

            //check apikey
            return update.Key.Length == 64;
        }
    }
}
