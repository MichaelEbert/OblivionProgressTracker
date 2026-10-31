using System.Diagnostics.CodeAnalysis;

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

    /// <summary>
    /// Validate an incoming progress update struct
    /// </summary>
    public class ProgressUpdateValidator
    {
        
    }
}
