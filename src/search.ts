// ===========================================
// src/search.ts - Search Person Script
// ===========================================
import { ITopApiClient } from './itop-client.js';
import { CmdUtils } from './cmd-utils.js';

async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const { uid } = CmdUtils.parseArgs(args);

    const client = new ITopApiClient();

    if (uid && uid !== '__ACCOUNT__') {
      // Search for specific person
      const personId = parseInt(uid);
      if (!isNaN(personId)) {
        // Search by ID
        const person = await client.getPerson(personId);
        if (person) {
          CmdUtils.outputPersonData(person, uid);
        }
      } else {
        // Search by name/query
        const persons = await client.searchPersons(uid, 10);
        persons.forEach(person => {
          CmdUtils.outputPersonData(person);
          console.log('---'); // Separator between records
        });
      }
    } else {
      // Get all persons (limited)
      const persons = await client.searchPersons(undefined, 100);
      persons.forEach(person => {
        CmdUtils.outputPersonData(person);
        console.log('---'); // Separator between records
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Search failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}