import express from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  requireGroups,
  requireOwnerOrAdmin,
  requireScopes
} from "../middlewares/authorize.js";
import {
  addPost,
  getAdminDashboard,
  getPosts,
  getProfile,
  removePost
} from "../controllers/demoController.js";
import { findPost } from "../data/postsStore.js";

const router = express.Router();

router.use(authenticate);

router.get("/profile", getProfile);

router.get("/posts", requireScopes("read:posts"), getPosts);
router.post("/posts", requireScopes("write:posts"), addPost);
router.delete(
  "/posts/:id",
  requireScopes("write:posts"),
  requireOwnerOrAdmin((req) => findPost(req.params.id)?.ownerId),
  removePost
);

router.get("/admin", requireGroups("admin"), getAdminDashboard);

export default router;
