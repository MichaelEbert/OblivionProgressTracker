using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
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
        BAD_KEY_LENGTH,
        SAVE_DATA_EMPTY
    }

    public class ProgressUpdateValidator
    {
        /// <summary>
        /// Validate an incoming progress update struct.
        /// </summary>
        /// <param name="update"></param>
        /// <param name="validationFailedReason"></param>
        /// <returns>false if validation failed. True if sucess.</returns>
        public static bool Validate([NotNullWhen(true)] ProgressUpdate? update, out ValidationFailedReason validationFailedReason)
        {
            if (update == null)
            {
                validationFailedReason = ValidationFailedReason.UPDATE_IS_NULL;
                return false;
            }
            //check progress.savedata
            if(update.SaveData == null || update.SaveData.Length == 0)
            {
                validationFailedReason = ValidationFailedReason.SAVE_DATA_EMPTY;
                return false;
            }
            if(update.SaveData.Length > 40960)
            {
                validationFailedReason = ValidationFailedReason.DATA_TOO_LONG; //not a valid cookie
                return false;
            }

            //check progress.url
            if(update.Url != null)
            {
                if(update.Url.Length != 6)
                {
                    validationFailedReason = ValidationFailedReason.URL_BAD_LENGTH;
                    return false;
                }
            }

            //check apikey
            if(update.Key == null || update.Key.Length != 64)
            {
                validationFailedReason = ValidationFailedReason.BAD_KEY_LENGTH;
                return false;
            }

            validationFailedReason = ValidationFailedReason.NONE;
            return true;
        }
    }
}
