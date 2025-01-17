const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const httpStatusText = require("./utils/httpStatus");
const url = process.env.MONGO_URI;  
const cookieParser = require('cookie-parser')
const userRout = require("./router/userRouter"); 

app.use(express.json()); 
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
  origin: "http://localhost:5173",
   credentials:true,
   
}
));
app.set("view engine", "ejs");
mongoose.connect(url).then(() => {
  console.log("connected");
});  

const port = process.env.PORT || 5000;
     
app.use("/api/users", userRout);

app.all("*", (req, res) => {
  res.status(404).json({
    status: httpStatusText.ERROR,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    Status: err.statusCode || httpStatusText.ERROR,
    data: null,
    Code: err.statusCode || 500,
    message: err.message,
  });
  console.log(err);
}); 
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
