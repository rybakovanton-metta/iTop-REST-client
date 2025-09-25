// ===========================================
// src/search.ts - Search Person Script
// ===========================================
import { BaseScript } from './base-script.js';
import { IConnector } from './interfaces/connector-interface.js';
import { MidPointIntegration } from './midpoint-integration.js';

class SearchScript extends BaseScript {
  protected static override readonly operationName = 'person search';

  protected async performOperation(connector: IConnector): Promise<void> {
    if (this.uid && this.uid !== '__ACCOUNT__') {
      // Search for specific person
      const personId = parseInt(this.uid);
      if (!isNaN(personId)) {
        // Search by ID
        const cimPerson = await connector.getPerson(this.uid);
        if (cimPerson) {
          MidPointIntegration.outputCIMPersonForCMD(cimPerson, this.uid);
        }
      } else {
        // Search by name/query
        const cimPersons = await connector.searchPersons(this.uid, 10);
        console.log(`Found ${cimPersons.length} persons matching '${this.uid}'`);
        cimPersons.forEach(cimPerson => {
          MidPointIntegration.outputCIMPersonForCMD(cimPerson);
          console.log('---'); // Separator between records
        });
      }
    } else {
      // Get all persons (limited)
      const cimPersons = await connector.searchPersons(undefined, 100);
      console.log(`Found ${cimPersons.length} total persons`);
      cimPersons.forEach(cimPerson => {
        MidPointIntegration.outputCIMPersonForCMD(cimPerson);
        console.log('---'); // Separator between records
      });
    }
  }
}

// Instantiate and run the script
const script = new SearchScript();
script.execute();