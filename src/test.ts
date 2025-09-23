// ===========================================
// src/test.ts - Test Connection Script
// ===========================================
import { ConnectorFactory } from './connector-factory.js';

async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    
    // Check for debug flag
    const debugFlag = args.includes('--debug') || args.includes('-d');
    const filteredArgs = args.filter(arg => arg !== '--debug' && arg !== '-d');
    
    // Get system name (required)
    const system = filteredArgs[0];
    if (!system) {
      throw new Error('System name is required as first argument (e.g., "itop", "ldap", "servicenow")');
    }
    
    // Create connector dynamically
    const connector = await ConnectorFactory.create(system);
    const isConnected = await connector.testConnection(debugFlag);
    
    if (isConnected) {
      console.log('Test successful');
      process.exit(0);
    } else {
      console.log('Test failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main();