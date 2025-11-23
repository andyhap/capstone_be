import "dotenv/config";
import prisma from "../src/utils/prisma.js";
import bcrypt from "bcrypt";

async function createAdmin() {
  const username = "superadmin";     
  const plainPassword = "Admin@2005"; 

  const hashed = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.admin.create({
    data: {
      username,
      password: hashed,
    },
  });

  console.log("Admin created:", {
    id: admin.id,
    username: admin.username,
  });
}

createAdmin()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error creating admin:", err);
    process.exit(1);
  });
