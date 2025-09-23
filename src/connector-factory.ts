// ===========================================
// src/connector-factory.ts - Dynamic Connector Factory
// ===========================================
import { IConnector } from './connector-interface.js';

/**
 * Factory for dynamically loading connectors based on system name
 */
export class ConnectorFactory {
  /**
   * Create a connector instance for the specified system
   * @param system - System name (e.g., 'itop', 'ldap', 'servicenow')
   * @returns Promise<IConnector> - Connector instance
   */
  static async create(system: string): Promise<IConnector> {
    try {
      // Dynamic import with simple naming convention
      const connectorModule = await import(`./connectors/${system}-connector.js`);
      
      // Convention: always export default class
      const ConnectorClass = connectorModule.default;
      
      if (!ConnectorClass) {
        throw new Error(`Default export not found for system: ${system}`);
      }
      
      return new ConnectorClass();
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to load connector for system '${system}': ${err.message}`);
    }
  }

  /**
   * Get list of available connectors by scanning the connectors directory
   * @returns Promise<string[]> - Array of available system names
   */
  static async getAvailableConnectors(): Promise<string[]> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const connectorsDir = path.join(__dirname, 'connectors');
      
      if (!fs.existsSync(connectorsDir)) {
        return [];
      }
      
      const files = fs.readdirSync(connectorsDir);
      
      return files
        .filter(file => file.endsWith('-connector.js'))
        .map(file => file.replace('-connector.js', ''))
        .sort();
    } catch (error) {
      console.warn('Could not scan connectors directory:', error);
      return [];
    }
  }

  /**
   * Check if a connector exists for the given system
   * @param system - System name to check
   * @returns Promise<boolean> - True if connector exists
   */
  static async hasConnector(system: string): Promise<boolean> {
    const available = await this.getAvailableConnectors();
    return available.includes(system);
  }
}