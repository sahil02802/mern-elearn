require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/elearndb";

mongoose.connect(MONGO_URI)
    .then(async () => {
        //   console.log("Connected to MongoDB at", MONGO_URI);

        const users = await User.find({});
        let count = 0;

        for (const user of users) {
            // Check if password looks like a bcrypt hash (starts with $2 and is long)
            if (user.password && user.password.startsWith("$2") && user.password.length > 50) {
                console.log(`Resetting password for ${user.email} (was hashed)`);
                user.password = "123456"; // Default visible password
                await user.save();
                count++;
            }
        }

        console.log(`\nSuccess! Converted ${count} users to plain text password '123456'.`);
        console.log("Existing plain text passwords were left unchanged.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error:", err);
        process.exit(1);
    });
