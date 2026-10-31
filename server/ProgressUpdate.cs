using System;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Nodes;

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

        /// <summary>
        /// Validate an incoming progress update struct.
        /// </summary>
        /// <param name="update"></param>
        /// <param name="validationFailedReason"></param>
        /// <returns>false if validation failed. True if success.</returns>
        [MemberNotNullWhen(true, nameof(SaveData), nameof(Key))]
        public bool Validate(out ValidationFailedReason validationFailedReason)
        {
            if (this == null)
            {
                validationFailedReason = ValidationFailedReason.UPDATE_IS_NULL;
                return false;
            }
            //check progress.savedata
            if (this.SaveData == null || this.SaveData.Length == 0)
            {
                validationFailedReason = ValidationFailedReason.SAVE_DATA_EMPTY;
                return false;
            }
            if (this.SaveData.Length > 40960)
            {
                validationFailedReason = ValidationFailedReason.DATA_TOO_LONG;
                return false;
            }

            //check progress.url
            if (this.Url != null)
            {
                if (this.Url.Length != 6)
                {
                    validationFailedReason = ValidationFailedReason.URL_BAD_LENGTH;
                    return false;
                }
            }

            //check apikey
            if (this.Key == null || this.Key.Length != 64)
            {
                validationFailedReason = ValidationFailedReason.BAD_KEY_LENGTH;
                return false;
            }

            validationFailedReason = ValidationFailedReason.NONE;
            return true;
        }
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

        public ReadProgress(JsonNode saveData, DateTime lastModified)
        {
            SaveData = saveData.ToJsonString();
            LastModified = lastModified;
        }
    }
}
