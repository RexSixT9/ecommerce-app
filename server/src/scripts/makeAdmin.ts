import { clerkClient } from "@clerk/express";
import User from "../models/user.model.js";

export const makeAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    if (!email) {
      throw new Error(
        "ADMIN_EMAIL is not defined in the environment variables.",
      );
    }

    const user = await User.findOneAndUpdate({ email }, { role: "admin" });
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return;
    }

    await clerkClient.users.updateUserMetadata(user.clerkId as string, {
      publicMetadata: { role: "admin" },
    });
    console.log(`User made admin: ${user.name}`);
  } catch (err: any) {
    console.error("Error making user admin:", err);
  }
};
