import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://manny_db_user:bZQzcMgSpzIgVfnM@foodapp.l2gl1yn.mongodb.net/FoodApp",
    )
    .then(() => console.log("connected to Database"));
};
