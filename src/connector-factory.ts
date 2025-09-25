// ===========================================
// src/connector-factory.ts - Dynamic Connector Factory
// ===========================================
import { IConnector } from './interfaces/connector-interface.js';
import { ConnectorError } from './errors.js';

/**
 * Factory for dynamically loading connectors based on system name
 */
export class ConnectorFactory {
  /**
   * Create a connector instance for the specified system
   * @param system - System name (e.g., 'itop', 'ldap', 'servicenow')
   * @param debug - Enable debug mode for the connector
   * @returns Promise<IConnector> - Connector instance
   */
  static async create(system: string, debug: boolean = false): Promise<IConnector> {
    try {
      // Dynamic import with system-specific directory structure
      const connectorModule = await import(`./connectors/${system}/${system}-connector.js`);
      
      // Convention: always export default class
      const ConnectorClass = connectorModule.default;
      
      if (!ConnectorClass) {
        throw new ConnectorError(system, 'Default export not found');
      }
      
      return new ConnectorClass(debug);
    } catch (error) {
      const err = error as Error;
      throw new ConnectorError(system, `Failed to load connector: ${err.message}`);
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
      
      // Scan for subdirectories, each representing a system
      const entries = fs.readdirSync(connectorsDir, { withFileTypes: true });
      
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(systemName => {
          // Check if the system has a connector file
          const connectorFile = path.join(connectorsDir, systemName, `${systemName}-connector.js`);
          return fs.existsSync(connectorFile);
        })
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