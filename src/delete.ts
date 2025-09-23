// ===========================================
// src/delete.ts - Delete Person Script
// ===========================================
import { ConnectorFactory } from './connector-factory.js';
import { CmdUtils } from './cmd-utils.js';

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
    
    // Parse remaining arguments
    const remainingArgs = filteredArgs.slice(1);
    const { uid } = CmdUtils.parseArgs(remainingArgs);

    if (!uid) {
      throw new Error('UID is required for person deletion');
    }

    // Create connector and delete person
    const connector = await ConnectorFactory.create(system);
    await connector.deletePerson(uid, debugFlag);
    
    console.log(`Person ${uid} deleted successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Delete failed:', error);
    process.exit(1);
  }
}

main();