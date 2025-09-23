// ===========================================
// src/search.ts - Search Person Script
// ===========================================
import { ConnectorFactory } from './connector-factory.js';
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
    const { uid } = CmdUtils.parseArgs(remainingArgs);

    const connector = await ConnectorFactory.create(system);

    if (uid && uid !== '__ACCOUNT__') {
      // Search for specific person
      const personId = parseInt(uid);
      if (!isNaN(personId)) {
        // Search by ID
        const cimPerson = await connector.getPerson(uid, debugFlag);
        if (cimPerson) {
          // Convert CIM person to PersonData format for output
          const personData: PersonData = {
            name: cimPerson.surname || cimPerson.commonName || '',
            status: 'active'
          };
          if (cimPerson.givenName) personData.first_name = cimPerson.givenName;
          if (cimPerson.mail) personData.email = cimPerson.mail;
          if (cimPerson.telephoneNumber) personData.phone = cimPerson.telephoneNumber;
          if (cimPerson.title) personData.function = cimPerson.title;
          if (cimPerson.instanceID) personData.id = parseInt(cimPerson.instanceID);
          CmdUtils.outputPersonData(personData, uid);
        }
      } else {
        // Search by name/query
        const cimPersons = await connector.searchPersons(uid, 10, debugFlag);
        console.log(`Found ${cimPersons.length} persons matching '${uid}'`);
        cimPersons.forEach(cimPerson => {
          // Convert CIM person to PersonData format for output
          const personData: PersonData = {
            name: cimPerson.surname || cimPerson.commonName || '',
            status: 'active'
          };
          if (cimPerson.givenName) personData.first_name = cimPerson.givenName;
          if (cimPerson.mail) personData.email = cimPerson.mail;
          if (cimPerson.telephoneNumber) personData.phone = cimPerson.telephoneNumber;
          if (cimPerson.title) personData.function = cimPerson.title;
          if (cimPerson.instanceID) personData.id = parseInt(cimPerson.instanceID);
          CmdUtils.outputPersonData(personData);
          console.log('---'); // Separator between records
        });
      }
    } else {
      // Get all persons (limited)
      const cimPersons = await connector.searchPersons(undefined, 100, debugFlag);
      console.log(`Found ${cimPersons.length} total persons`);
      cimPersons.forEach(cimPerson => {
        // Convert CIM person to PersonData format for output
        const personData: PersonData = {
          name: cimPerson.surname || cimPerson.commonName || '',
          status: 'active'
        };
        if (cimPerson.givenName) personData.first_name = cimPerson.givenName;
        if (cimPerson.mail) personData.email = cimPerson.mail;
        if (cimPerson.telephoneNumber) personData.phone = cimPerson.telephoneNumber;
        if (cimPerson.title) personData.function = cimPerson.title;
        if (cimPerson.instanceID) personData.id = parseInt(cimPerson.instanceID);
        CmdUtils.outputPersonData(personData);
        console.log('---'); // Separator between records
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Search failed:', error);
    process.exit(1);
  }
}

main();