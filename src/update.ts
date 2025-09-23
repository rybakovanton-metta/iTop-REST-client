// ===========================================
// src/update.ts - Update Person Script
// ===========================================
import { ConnectorFactory } from './connector-factory.js';
import { CIMPersonConverter } from './cim-person.js';
import { CmdUtils } from './cmd-utils.js';
import { PersonData } from './types.js';

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
    const { uid, attributes } = CmdUtils.parseArgs(remainingArgs);

    if (!uid) {
      throw new Error('UID is required for person update');
    }

    // Convert MidPoint args to CIM Person (partial update)
    const cimPersonUpdates = CIMPersonConverter.fromMidPointArgs(attributes);
    
    // Create connector and update person
    const connector = await ConnectorFactory.create(system);
    const updatedCimPerson = await connector.updatePerson(uid, cimPersonUpdates, debugFlag);
    
    // Convert CIM person to PersonData format for output
    const personData: PersonData = {
      name: updatedCimPerson.surname || updatedCimPerson.commonName || '',
      status: 'active'
    };
    if (updatedCimPerson.givenName) personData.first_name = updatedCimPerson.givenName;
    if (updatedCimPerson.mail) personData.email = updatedCimPerson.mail;
    if (updatedCimPerson.telephoneNumber) personData.phone = updatedCimPerson.telephoneNumber;
    if (updatedCimPerson.title) personData.function = updatedCimPerson.title;
    if (updatedCimPerson.instanceID) personData.id = parseInt(updatedCimPerson.instanceID);
    
    // Output the updated person data
    CmdUtils.outputPersonData(personData, uid);
    
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

main();