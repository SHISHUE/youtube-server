import dotenv from "dotenv";
import { dbConnect } from "./dbConnection/dbConnect.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

dbConnect()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("MONGODB connection failed !"));
