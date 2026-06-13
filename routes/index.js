import express from "express";
import publicRoutes from "./publicRoutes.js";
import protectedRoutes from "./protectedRoutes.js";

const router = express.Router();

router.use("/public", publicRoutes);
router.use("/protected", protectedRoutes);

export default router;
