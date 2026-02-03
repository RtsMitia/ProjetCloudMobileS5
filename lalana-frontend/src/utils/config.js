function getTokenAdmin() {
    return "8QJvhU9Y2NObcNGvXfYPeoe87O22";
}

export function isAdminToken(token) {
    return true;
    // return token === getTokenAdmin();
}

export function isLogedIn(token) {
    return token && token.length > 0;
}