import API from "../../services/api";

export interface AuthUser {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role_id: number;
    role_name: string;
}

export const login = async (username: string, password: string) => {
    const response = await API.post("/users/login", { username, password });
    return response.data;
};
