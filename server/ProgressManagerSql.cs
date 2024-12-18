using System;
using System.Data;
using System.Data.SqlClient;
using System.Text.Json.Nodes;

namespace ShareApi
{
    /// <summary>
    /// Serves as a wrapper around the SQL methods that store the actual progress.
    /// </summary>
    /// <remarks>
    /// We use a single sql connection for all sql statements in the client request.
    /// </remarks>
    public class ProgressManagerSql: IDisposable {
        private const string urlInsertString = "INSERT INTO urls VALUES(@col1, @col2)";
        private const string urlSelectString = "SELECT url FROM urls WHERE userkey = @col1";
        private const string saveInsertString = "INSERT INTO saves VALUES(@col1, @col2, @accesstime)";
        private const string saveUpdateString = "UPDATE saves SET saveData = @col2, accessed = @accesstime WHERE url = @col1";
        private const string saveSelectString = "SELECT saveData, accessed FROM saves WHERE url = @col1";
        private const string saveMergeString = "MERGE INTO saves with(HOLDLOCK) USING (VALUES(@col1, @col2, @accesstime)) AS source(url, savedata, accessed) ON saves.url = @col1 " +
            "WHEN MATCHED THEN UPDATE SET saveData = source.saveData, accessed = source.accessTime" +
            "WHEN NOT MATCHED THEN INSERT (url, savedata, accessed) VALUES (@col1, @col2, @accesstime)";


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
        public bool SqlSaveMerge(string url, ReadProgress data){
            var cmd = new SqlCommand(saveMergeString, conn);
            cmd.Parameters.Add("@col1",SqlDbType.Char);
            cmd.Parameters["@col1"].Value = url;
            cmd.Parameters.Add("@col2",SqlDbType.VarChar);
            cmd.Parameters["@col2"].Value = data.SaveData;
            cmd.Parameters.Add("@accesstime",SqlDbType.DateTime2);
            cmd.Parameters["@accesstime"].Value = data.LastModified;
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
        public ReadProgress? SqlSaveSelect(string url)
        {
            var cmd = new SqlCommand(saveSelectString, conn);
            cmd.Parameters.Add("@col1", SqlDbType.Char);
            cmd.Parameters["@col1"].Value = url;
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                reader.Read();
                if (reader.HasRows)
                {
                    string progressString = (string)reader[0];
                    object dateModified = reader[1];
                    if(DBNull.Value == dateModified)
                    {
                        dateModified = new DateTime(2022, 01, 01, 00,00,00, DateTimeKind.Utc);
                    }
                    return new ReadProgress(progressString,(DateTime)dateModified);
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