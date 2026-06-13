const getScopes = (auth) => {
  if (!auth?.scp) {
    return [];
  }

  if (Array.isArray(auth.scp)) {
    return auth.scp;
  }

  return String(auth.scp).split(" ").filter(Boolean);
};

const getGroups = (auth) => {
  if (!auth?.groups) {
    return [];
  }

  return Array.isArray(auth.groups) ? auth.groups : [auth.groups];
};

export const requireScopes = (...requiredScopes) => (req, res, next) => {
  const tokenScopes = getScopes(req.auth);
  const missing = requiredScopes.filter((scope) => !tokenScopes.includes(scope));

  if (missing.length > 0) {
    return res.status(403).json({
      message: "Forbidden: missing required scopes",
      required: requiredScopes,
      granted: tokenScopes
    });
  }

  next();
};

export const requireGroups = (...requiredGroups) => (req, res, next) => {
  const tokenGroups = getGroups(req.auth);
  const allowed = requiredGroups.some((group) => tokenGroups.includes(group));

  if (!allowed) {
    return res.status(403).json({
      message: "Forbidden: missing required group membership",
      requiredAnyOf: requiredGroups,
      granted: tokenGroups
    });
  }

  next();
};

export const requireOwnerOrAdmin = (getOwnerId) => (req, res, next) => {
  const ownerId = getOwnerId(req);
  const requesterId = req.auth?.sub;
  const tokenGroups = getGroups(req.auth);
  const isAdmin = tokenGroups.includes("admin");

  if (isAdmin || (ownerId && ownerId === requesterId)) {
    return next();
  }

  return res.status(403).json({
    message: "Forbidden: you can only modify your own resources"
  });
};
