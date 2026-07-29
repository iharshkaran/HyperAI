import mongoose from "mongoose";


function connectDB(){

    mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("Connected to DB");
    })
    .catch( (err)=>{
        console.log("Error connecting to MongoDB: ", err);
    });

}

export default connectDB;