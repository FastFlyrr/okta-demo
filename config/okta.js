import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.OKTA_CLIENT_ID;

if (!clientId) {
  throw new Error("OKTA_CLIENT_ID is required");
}

const domain = process.env.OKTA_DOMAIN;

if (!domain) {
  throw new Error("OKTA_DOMAIN is required (e.g. dev-123456.okta.com)");
}

const issuer =
  process.env.OKTA_ISSUER || `https://${domain}/oauth2/default`;

const audience = process.env.OKTA_AUDIENCE || clientId;

export default {
  clientId,
  domain,
  issuer,
  audience,
  jwksUri: `${issuer}/v1/keys`
};
