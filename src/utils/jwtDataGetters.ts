import jwt from "jsonwebtoken";


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
}

export default new jwtDataGetters();
