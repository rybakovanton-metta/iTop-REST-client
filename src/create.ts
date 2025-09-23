// ===========================================
// src/create.ts - Create Person Script
// ===========================================
import { ConnectorFactory } from './connector-factory.js';
import { CIMPersonConverter } from './cim-person.js';
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
    const { name, attributes } = CmdUtils.parseArgs(remainingArgs);

    if (!name) {
      throw new Error('Name is required for person creation');
    }

    // Convert MidPoint args to CIM Person
    const cimPerson = CIMPersonConverter.fromMidPointArgs({ ...attributes, name });
    
    // Create connector and create person
    const connector = await ConnectorFactory.create(system);
    const result = await connector.createPerson(cimPerson, debugFlag);
    
    // Output the created person data (convert back to PersonData format for cmd-utils)
    const personData = { ...result.data, id: parseInt(result.id) };
    CmdUtils.outputPersonData(personData, result.id);
    
    process.exit(0);
  } catch (error) {
    console.error('Create failed:', error);
    process.exit(1);
  }
}

main();
