export default {
  dbURL: process.env.MONGO_URL || "mongodb+srv://roman:roman1983@cluster0.efy2u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  dbName : process.env.DB_NAME || 'bugsapp'
 // const uri = "mongodb+srv://roman:<db_password>@cluster0.efy2u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

}
