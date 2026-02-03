async function getTokenAdmin() {
    return "8QJvhU9Y2NObcNGvXfYPeoe87O22";
}

export async function isAdminToken(token) {
    console.log(`isAdminToken called with token=${token}`);
    console.log(`Admin token is ${await getTokenAdmin()}`);
    console.log(`Comparison result: ${token === await getTokenAdmin()}`);
    return token === await getTokenAdmin();
}

export function isLogedIn(token) {
    return token && token.length > 0;
}