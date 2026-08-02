import mongoose from "mongoose";


function connectDB() {

    try {
        mongoose.connect(process.env.MONGO_URL)
            .then(() => {
                console.log("Connected to DB");
            })
            .catch((err) => {
                console.log("Error connecting to MongoDB: ", err);
            });
    } catch (err) {
        console.log("Failed to Login");
    }

}

export default connectDB;