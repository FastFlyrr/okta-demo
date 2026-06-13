import oktaConfig from "../config/okta.js";
import {
  createPost,
  deletePost,
  findPost,
  listPosts
} from "../data/postsStore.js";

export const health = (req, res) => {
  res.json({
    status: "ok",
    service: "okta-auth-demo",
    okta: {
      domain: oktaConfig.domain,
      clientId: oktaConfig.clientId,
      issuer: oktaConfig.issuer,
      audience: oktaConfig.audience
    }
  });
};

export const getProfile = (req, res) => {
  res.json({
    message: "Authenticated request succeeded",
    subject: req.auth?.sub,
    scopes: req.auth?.scp,
    groups: req.auth?.groups,
    claims: req.auth
  });
};

export const getPosts = (req, res) => {
  res.json({
    message: "Posts retrieved with read:posts scope",
    posts: listPosts()
  });
};

export const addPost = (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({
      message: "title and body are required"
    });
  }

  const post = createPost({
    title,
    body,
    ownerId: req.auth.sub
  });

  res.status(201).json({
    message: "Post created with write:posts scope",
    post
  });
};

export const removePost = (req, res) => {
  const post = findPost(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  deletePost(req.params.id);

  res.json({
    message: "Post deleted by owner or admin",
    post
  });
};

export const getAdminDashboard = (req, res) => {
  res.json({
    message: "Admin-only endpoint",
    totalPosts: listPosts().length,
    requester: req.auth?.sub,
    groups: req.auth?.groups
  });
};
