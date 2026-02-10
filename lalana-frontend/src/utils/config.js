import API_BASE_URL from "../api/config";

async function getTokenAdmin() {
    return "ts2LXs3eOzgP1z1DB1ffNk4xxWh2";
}

export async function isAdminToken(token) {
    //return true;
    return token === await getTokenAdmin();
}

export function isLogedIn(token) {
    return token && token.length > 0;
}

export function pathImages() {
    return `${API_BASE_URL}/images/signalement/`;
}