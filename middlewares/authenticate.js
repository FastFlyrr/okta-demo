import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import oktaConfig from "../config/okta.js";

const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: oktaConfig.jwksUri
  }),
  audience: oktaConfig.audience,
  issuer: oktaConfig.issuer,
  algorithms: ["RS256"]
});

export default checkJwt;
