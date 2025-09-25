// ===========================================
// src/config.ts - Configuration
// ===========================================
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ConfigurationError } from './errors.js';

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
    const err = error as Error;
    throw new ConfigurationError(
      `Failed to load config from .creds/config.json: ${err.message}. ` +
      'Please ensure .creds/config.json exists and is properly formatted. ' +
      'See doc/config-example.json for the expected format.'
    );
  }
}

export const config: ITopConfig = loadConfig();