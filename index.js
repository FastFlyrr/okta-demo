import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import router from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Okta authentication and authorization demo API",
    docs: {
      public: "GET /api/public/health",
      profile: "GET /api/protected/profile (Bearer token required)",
      posts: "GET /api/protected/posts (scope: read:posts)",
      createPost: "POST /api/protected/posts (scope: write:posts)",
      admin: "GET /api/protected/admin (group: admin)"
    }
  });
});

app.use("/api", router);
app.use(errorHandler);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
