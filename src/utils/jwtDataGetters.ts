import jwt from "jsonwebtoken";


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

class jwtDataGetters {
    getUserId = (jwtToken: string): number => {
        const { userId } = jwt.decode(jwtToken.replace(/Bearer */, "")) as { userId: number };
        return userId;
    }

    getEmail = (jwtToken: string): string => {
        const { email } = jwt.decode(jwtToken.replace(/Bearer */, "")) as { email: string };
        return email;
    }

    getSubscriptionId = (jwtToken: string): number => {
        const { subscriptionId } = jwt.decode(jwtToken.replace(/Bearer */, "")) as { subscriptionId: number };
        return subscriptionId;
    }

    getGoogleUser = (jwtToken: string) => {
        const googleUser = jwt.decode(jwtToken.replace(/Bearer */, "")) as JwtGoogleUserPayloadType;

        return googleUser;
    }
}

export default new jwtDataGetters();
