import mongoose from 'mongoose';

const connectDB = async () => {
    try {

        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URL is missing in your .env file!');
        }

        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected Successfully`);

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;