import express from "express";
import learnerRoutes from "./routes/learner";
import expertRoutes from "./routes/expert";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(cors());
app.use("/v1/api/learner", learnerRoutes);
app.use("/v1/api/expert", expertRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

