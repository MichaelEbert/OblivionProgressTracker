using System;
using System.Data;
using System.Data.SqlClient;
namespace ShareApi
{
    /// <summary>
    /// Class that servers as a wrapper around the SQL methods that store the actual progress.
    /// </summary>
    /// <remarks>
    /// We use a single sql connection for all sql statements in the client request.
    /// </remarks>
    public class ProgressManagerSql: IDisposable {
        private const string urlInsertString = "INSERT INTO urls VALUES(@col1, @col2)";
        private const string urlSelectString = "SELECT url FROM urls WHERE userkey = @col1";
        private const string saveInsertString = "INSERT INTO saves VALUES(@col1, @col2, @accesstime)";
        private const string saveUpdateString = "UPDATE saves SET saveData = @col2, accessed = @accesstime WHERE url = @col1";
        private const string saveSelectString = "SELECT saveData FROM saves WHERE url = @col1";

        private SqlConnection conn;

        /// <summary>
        /// Create a new SQL connection to the server.
        /// </summary>
        public ProgressManagerSql(){
            string? dbString = System.Environment.GetEnvironmentVariable("SQLCONNSTR_horsevectors");
            conn = new SqlConnection(dbString);
            conn.Open();
        }

        /// <summary>
        /// Insert into the URL table
        /// </summary>
        /// <param name="key"></param>
        /// <param name="url"></param>
        /// <returns>if insert succeeded</returns>
        public bool SqlUrlInsert(byte[] key, string url){
            var cmd = new SqlCommand(urlInsertString, conn);
            cmd.Parameters.Add("@col1",SqlDbType.Binary);
            cmd.Parameters["@col1"].Value = key;
            cmd.Parameters.Add("@col2",SqlDbType.Char);
            cmd.Parameters["@col2"].Value = url;
            try
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    reader.Close();
                    return reader.RecordsAffected != 0;
                }
            }
            catch (SqlException)
            {
                return false;
            }
        }

        /// <summary>
        /// Insert into the save table
        /// </summary>
        /// <param name="url"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        public bool SqlSaveInsert(string url, string data){
            var cmd = new SqlCommand(saveInsertString, conn);
            cmd.Parameters.Add("@col1",SqlDbType.Char);
            cmd.Parameters["@col1"].Value = url;
            cmd.Parameters.Add("@col2",SqlDbType.VarChar);
            cmd.Parameters["@col2"].Value = data;
            cmd.Parameters.Add("@accesstime",SqlDbType.DateTime2);
            cmd.Parameters["@accesstime"].Value = DateTime.UtcNow;
            try
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    reader.Close();
                    return reader.RecordsAffected != 0;
                }
            }
            catch (SqlException)
            {
                return false;
            }
        }

        /// <summary>
        /// update the save table
        /// </summary>
        /// <param name="url"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        public bool SqlSaveUpdate(string url, string data) {
            var cmd = new SqlCommand(saveUpdateString, conn);
            cmd.Parameters.Add("@col1", SqlDbType.Char);
            cmd.Parameters["@col1"].Value = url;
            cmd.Parameters.Add("@col2", SqlDbType.VarChar);
            cmd.Parameters["@col2"].Value = data;
            cmd.Parameters.Add("@accesstime",SqlDbType.DateTime2);
            cmd.Parameters["@accesstime"].Value = DateTime.UtcNow;
            try
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    reader.Close();
                    return reader.RecordsAffected != 0;
                }
            }
            catch (SqlException) { return false; }
        }

        public string? SqlUrlSelect(byte[] key){
            var cmd = new SqlCommand(urlSelectString, conn);
            cmd.Parameters.Add("@col1",SqlDbType.Binary);
            cmd.Parameters["@col1"].Value = key;
            using(SqlDataReader reader = cmd.ExecuteReader()){
                reader.Read();
                if(reader.HasRows)
                {
                    return (string)reader[0];
                }
                else
                {
                    return null;
                }
                
            }
        }

        /// <summary>
        /// Read data from the Save table
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        public string? SqlSaveSelect(string url)
        {
            var cmd = new SqlCommand(saveSelectString, conn);
            cmd.Parameters.Add("@col1", SqlDbType.Char);
            cmd.Parameters["@col1"].Value = url;
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                reader.Read();
                if (reader.HasRows)
                {
                    return (string)reader[0];
                }
                else
                {
                    return null;
                }
            }
        }

        protected virtual void Dispose(bool disposing)
        {
            if(disposing){
                conn.Dispose();
            }
        }
        public void Dispose()
        {
            // Dispose of unmanaged resources.
            Dispose(true);
            // Suppress finalization.
            GC.SuppressFinalize(this);
        }
    }
}