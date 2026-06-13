import express from "express";
import { health } from "../controllers/demoController.js";

const router = express.Router();

router.get("/health", health);

export default router;
