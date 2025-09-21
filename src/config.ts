// ===========================================
// src/config.ts - Configuration
// ===========================================
export interface ITopConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  auth_token?: string;
  apiVersion: string;
}

export const config: ITopConfig = {
  baseUrl: "https://10.3.1.87/webservices/rest.php",
  username: "tech_midpoint.int.itop",
  password: "your_password_here", // UPDATE THIS
  // auth_token: "your_token_here", // Alternative to username/password
  apiVersion: "1.3"
};