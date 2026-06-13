import crypto from "crypto";
import http from "http";
import { URL } from "url";
import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.OKTA_CLIENT_ID;
const domain = process.env.OKTA_DOMAIN;
const redirectUri = process.env.OKTA_REDIRECT_URI || "http://localhost:8888/callback";
const apiPort = process.env.PORT || 8080;

if (!clientId || !domain) {
  console.error("Set OKTA_CLIENT_ID and OKTA_DOMAIN in .env before running this script.");
  process.exit(1);
}

const issuer = process.env.OKTA_ISSUER || `https://${domain}/oauth2/default`;
const scopes = process.env.OKTA_SCOPES || "openid profile email read:posts write:posts";

const createCodeVerifier = () =>
  crypto.randomBytes(32).toString("base64url");

const createCodeChallenge = (verifier) =>
  crypto.createHash("sha256").update(verifier).digest("base64url");

const buildAuthorizeUrl = ({ codeChallenge, state }) => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: scopes,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state
  });

  return `${issuer}/v1/authorize?${params.toString()}`;
};

const exchangeCodeForToken = async ({ code, codeVerifier }) => {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier
  });

  const response = await fetch(`${issuer}/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Token exchange failed");
  }

  return data.access_token;
};

const waitForAuthCode = (expectedState) =>
  new Promise((resolve, reject) => {
    const redirect = new URL(redirectUri);

    const server = http.createServer((req, res) => {
      const requestUrl = new URL(req.url, redirectUri);

      if (requestUrl.pathname !== redirect.pathname) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
        return;
      }

      const error = requestUrl.searchParams.get("error");
      if (error) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end(`Authorization failed: ${error}`);
        server.close();
        reject(new Error(error));
        return;
      }

      const state = requestUrl.searchParams.get("state");
      const code = requestUrl.searchParams.get("code");

      if (state !== expectedState) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid state");
        server.close();
        reject(new Error("Invalid state"));
        return;
      }

      if (!code) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing authorization code");
        return;
      }

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Authentication successful. Return to the terminal.");

      server.close();
      resolve(code);
    });

    server.listen(Number(redirect.port), redirect.hostname);
  });

const run = async () => {
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString("hex");
  const authorizeUrl = buildAuthorizeUrl({ codeChallenge, state });

  const codePromise = waitForAuthCode(state);

  console.log("\n1. Open this URL in your browser and sign in:\n");
  console.log(authorizeUrl);
  console.log("\n2. Waiting for callback on", redirectUri, "...\n");

  const code = await codePromise;
  const token = await exchangeCodeForToken({ code, codeVerifier });

  console.log("Access token:\n");
  console.log(token);
  console.log("\n3. Test the API:\n");
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:${apiPort}/api/protected/profile`);
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
