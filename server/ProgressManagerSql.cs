using System;
using System.Data;
using System.Data.SqlClient;
namespace ShareApi
{
    public class ProgressManagerSql: IDisposable{
        private const string urlInsertString = "INSERT INTO urls VALUES(@col1, @col2)";
        private const string urlSelectString = "SELECT url FROM urls WHERE userkey = @col1";
        private const string saveInsertString = "INSERT INTO saves VALUES(@col1, @col2)";
        private const string saveUpdateString = "UPDATE saves SET saveData = @col2 WHERE url = @col1";
        private const string saveSelectString = "SELECT saveData FROM saves WHERE url = @col1";

        SqlConnection conn;

        public ProgressManagerSql(){
            conn = new SqlConnection(Secrets.ConnectionString);
            conn.Open();
        }

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

        public bool SqlSaveInsert(string url, string data){
            var cmd = new SqlCommand(saveInsertString, conn);
            cmd.Parameters.Add("@col1",SqlDbType.Char);
            cmd.Parameters["@col1"].Value = url;
            cmd.Parameters.Add("@col2",SqlDbType.VarChar);
            cmd.Parameters["@col2"].Value = data;
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

        public bool SqlSaveUpdate(string url, string data) {
            var cmd = new SqlCommand(saveUpdateString, conn);
            cmd.Parameters.Add("@col1", SqlDbType.Char);
            cmd.Parameters["@col1"].Value = url;
            cmd.Parameters.Add("@col2", SqlDbType.VarChar);
            cmd.Parameters["@col2"].Value = data;
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

        public string SqlUrlSelect(byte[] key){
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

        public string SqlSaveSelect(string url)
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