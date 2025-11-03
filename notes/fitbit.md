THIS IS A TUTORIAL "HOW TO GET FITBIT API":

Follow the tutorial provided by Fitbit: https://dev.fitbit.com/build/reference/web-api/developer-guide/getting-started/

1. Creating a Developer Account for Fitbit -> https://accounts.fitbit.com/signup, click "continue with Google".

2. Registering an Application -> https://dev.fitbit.com/apps, click Register a new application, fill in the fields such as application name, description, etc. After that, the clientId, client secret, and redirect URL will appear.

3. Authorization Code Grant Flow with PKCE
   a. Generate the Code Verifier and Code Challenge
   For generating it, you can create it in a JavaScript file like this:
   const code_verifier = crypto.randomBytes(64).toString("base64url");
   const code_challenge = crypto.createHash("sha256").update(code_verifier).digest("base64url");
   console.log("code_verifier:", code_verifier);
   console.log("code_challenge:", code_challenge);

   b. Request Authorization to Fitbit User Data
   click the link for the authorization page, according to clientId and code_challenge.  
   https://www.fitbit.com/oauth2/authorize?client_id=ABC123&response_type=code&code_challenge=<code_challenge>&code_challenge_method=S256&scope=activity%20heartrate%20location%20nutrition%20oxygen_saturation%20profile%20respiratory_rate%20settings%20sleep%20social%20temperature%20weight

   c. Retrieving the Authorization Code
   After clicking the in the previous step, a URL like this will appear: https://localhost:8081/?code=dc599e23d8fcf5a6900df6267e0aaf3666ea47f7#_=_
   The authorization code is located between the "code" parameter and "#_=_", so the auth code is dc599e23d8fcf5a6900df6267e0aaf3666ea47f7 and is only valid for 10 minutes.

   d. Exchange the Authorization Code for the Access and Refresh Tokens
   If the application type filled in when registering the app is "client" or "personal", then you can test it in Postman like this to get the token:
   POST https://api.fitbit.com/oauth2/token
   Content-Type: application/x-www-form-urlencoded
   client_id=ABC123&code=<authorization_code>&code_verifier=<code_verifier>&grant_type=authorization_code
   It mean in the body, select x-www-form-urlencoded, adjust the key and value accordingly. For example, key "client_id", value "23TGYC", and so on until the key "grant_type" value "authorization_code".

   e. Receive the Access and Refresh Tokens
   After making the hit request in step d, the following response will appear:
   {
   "access_token": "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyM1RHWUMiLCJzdWIiOiJDVjczMkciLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyc29jIHJzZXQgcm94eSBybnV0IHJwcm8gcnNsZSByYWN0IHJyZXMgcmxvYyByd2VpIHJociBydGVtIiwiZXhwIjoxNzYxOTU1OTQ5LCJpYXQiOjE3NjE5MjcxNDl9.vLwwAgw2qqI394_bJ22qvPr-x2Ny46FnsI49d2W3UrY",
   "expires_in": 28800,
   "refresh_token": "16f4bf7b772751b8048e03d043cdbd7679790f113fa0417bd2369da00b56c3ef",
   "scope": "respiratory_rate weight oxygen_saturation settings sleep nutrition temperature heartrate profile location activity social",
   "token_type": "Bearer",
   "user_id": "CV732G"
   }
   The access token is only valid for 28,800 seconds, which is 8 hours from the time it is obtained. After 8 hours, the token can no longer be used (it will return a 401 Unauthorized error). However, you don't need to log in again, just refresh the token to get a new access_token.

   - How to update (refresh the token)?
     Send a POST request to https://api.fitbit.com/oauth2/token
     Content-Type: application/x-www-form-urlencoded
     body:
     grant_type=refresh_token
     &refresh_token=16f4bf7b772751b8048e03d043cdbd7679790f113fa0417bd2369da00b56c3ef
     &client_id=23TGYC
