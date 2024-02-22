import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";


type OAuthGoogleTokensType = {
    access_token: string,
    expires_id: number,
    scope: string,
    token_type: string,
    id_token: string
};

type JwtGoogleUserPayloadType = {
    iss: string,
    azp: string,
    aud: string,
    sub: string,
    email: string
    email_verified: boolean,
    at_hash: string,
    name: string,
    picture: string,
    given_name: string,
    family_name: string,
    locale: string,
    iat: number,
    exp: number
}

class GoogleOAuthService {
    getGoogleOAuthUrl = () => {
        const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

        const options = {
            redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI as string,
            client_id: process.env.CLIENT_ID as string,
            // access_type: "offline",
            access_type: "online",
            response_type: "code",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email"
            ].join(" ")
        }

        // console.log(options);

        const queryStr = new URLSearchParams(options);

        // console.log(queryStr.toString());

        return `${rootUrl}?${queryStr.toString()}`;

    }

    getGoogleOAuthTokens = async (code: string) => {
        const url = "https://oauth2.googleapis.com/token";

        const values = {
            code,
            client_id: process.env.CLIENT_ID as string,
            client_secret: process.env.CLIENT_SECRET as string,
            redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI as string,
            grant_type: "authorization_code"
        }

        const urlData = (new URLSearchParams(values)).toString();
        const result = await axios.post<OAuthGoogleTokensType>(url, urlData,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            })
        return result.data;
    }

    getUserFromIdToken = (idToken: string) => {
        const { email, name } = jwt.decode(idToken) as JwtGoogleUserPayloadType;
        const password = crypto.randomBytes(12).toString("hex");
        return { email, name, password };
    }
}

export default new GoogleOAuthService();
