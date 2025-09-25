// ===========================================
// src/create.ts - Create Person Script
// ===========================================
import { BaseScript } from './base-script.js';
import { IConnector } from './interfaces/connector-interface.js';
import { MidPointIntegration } from './midpoint-integration.js';

class CreateScript extends BaseScript {
  protected static override readonly operationName = 'person creation';

  protected async performOperation(connector: IConnector): Promise<void> {
    // Validate required fields
    if (!this.name) {
      throw new Error(`name is required for ${CreateScript.operationName}`);
    }

    // Convert MidPoint args to CIM Person
    const cimPerson = MidPointIntegration.convertFromMidPointArgs({ ...this.attributes, name: this.name });
    
    // Create person
    const result = await connector.createPerson(cimPerson);
    
    // Output the created person data
    // Convert the result back to CIM Person for output
    const createdCimPerson = await connector.getPerson(result.id);
    if (createdCimPerson) {
      MidPointIntegration.outputCIMPersonForCMD(createdCimPerson, result.id);
    }
  }
}

// Instantiate and run the script
const script = new CreateScript();
script.execute();
