require("dotenv").config();
const mongooseSeed = require("mongoose");
const bcryptSeed = require("bcryptjs");
const UserSeed = require("./models/User");
const CourseSeed = require("./models/Course");

const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/elearndb";

async function run() {
  await mongooseSeed.connect(MONGO);
  console.log("connected");

  const adminEmail = "admin@example.com";
  const existingAdmin = await UserSeed.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcryptSeed.hash("admin123", 10);
    await UserSeed.create({
      name: "Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
    });
    console.log("admin created");
  } else console.log("admin exists");

  const sample = [
    {
      title: "MERN Crash Course",
      description: "Learn MERN basics",
      price: 199,
      duration: "3h",
      tech: "MERN",
      videoUrl: "https://www.youtube.com/watch?v=1",
    },
    {
      title: "React for Beginners",
      description: "React basics",
      price: 99,
      duration: "2h",
      tech: "React",
      videoUrl: "https://www.youtube.com/watch?v=2",
    },
    {
      title: "Node & Express",
      description: "Backend with Node",
      price: 149,
      duration: "2.5h",
      tech: "Node",
      videoUrl: "https://www.youtube.com/watch?v=3",
    },
  ];
  for (const s of sample) {
    const exists = await CourseSeed.findOne({ title: s.title });
    if (!exists) await CourseSeed.create(s);
  }
  console.log("seed done");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
