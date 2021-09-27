using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShareApi
{
    public enum ValidationFailedReason
    {
        NONE,
        UPDATE_IS_NULL,
        DATA_TOO_LONG,
        URL_BAD_LENGTH,
        BAD_KEY_LENGTH
    }

    public class ProgressUpdateValidator
    {
        public static ValidationFailedReason Validate(ProgressUpdate update)
        {
            if (update == null)
            {
                return ValidationFailedReason.UPDATE_IS_NULL;
            }
            //check progress.savedata
            if(update.SaveData.Length > 4096)
            {
                return ValidationFailedReason.DATA_TOO_LONG; //not a valid cookie
            }

            //check progress.url
            if(update.Url != null)
            {
                if(update.Url.Length != 6)
                {
                    return ValidationFailedReason.URL_BAD_LENGTH;
                }
            }

            //check apikey
            if(update.Key.Length != 64)
            {
                return ValidationFailedReason.BAD_KEY_LENGTH;
            }
            return ValidationFailedReason.NONE;
        }
    }
}
