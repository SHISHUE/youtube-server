import  mongoose  from "mongoose"
import { DB_Name } from "../constants.js"


export const dbConnect = async() => {
   try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)


   
    console.log("DB CONNECTED")

   } catch (error) {
    console.error("ERROR: ", error)
    throw error
    process.exit(1)
   }
}