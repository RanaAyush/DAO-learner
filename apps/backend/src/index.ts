import express from "express";
import learnerRoutes from "./routes/learner";
import expertRoutes from "./routes/expert";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(cors());
app.use("/v1/learner", learnerRoutes);
app.use("/v1/expert", expertRoutes);

app.listen(3000)