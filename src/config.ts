// ===========================================
// src/config.ts - Configuration
// ===========================================
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface ITopConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  auth_token?: string;
  apiVersion: string;
}

function loadConfig(): ITopConfig {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const configPath = join(__dirname, '..', '.creds', 'config.json');
    const configData = readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Failed to load config from .creds/config.json:', error);
    console.error('Please ensure .creds/config.json exists and is properly formatted.');
    console.error('See doc/config-example.json for the expected format.');
    process.exit(1);
  }
}

export const config: ITopConfig = loadConfig();