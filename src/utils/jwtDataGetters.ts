class jwtDataGetters {
    getUserId = (jwtToken: string): number => {
        const [, jwtPayloadStr,] = jwtToken.replace(/Bearer */, "").split(".");
        const jwtPayload = JSON.parse(Buffer.from(jwtPayloadStr, "base64").toString());
        const userId: number = Number(jwtPayload.userId);
        return userId;
    }

    getEmail = (jwtToken: string): string => {
        const [, jwtPayloadStr,] = jwtToken.replace(/Bearer */, "").split(".");
        const jwtPayload = JSON.parse(Buffer.from(jwtPayloadStr, "base64").toString());
        const email: string = jwtPayload.email;
        return email;
    }
}

export default new jwtDataGetters();
