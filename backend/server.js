import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/food.route.js";

// app config
const app = express();
const PORT = 4000;

// middlewares
app.use(express.json()); // get request from frontend to backend
app.use(cors()); // access backend from frontend

// Database connection
connectDB();

// Api endpoints
app.use("/api/food", foodRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});

// mongodb+srv://manny_db_user:bZQzcMgSpzIgVfnM@foodapp.l2gl1yn.mongodb.net/?appName=FoodApp
