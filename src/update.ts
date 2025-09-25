// ===========================================
// src/update.ts - Update Person Script
// ===========================================
import { BaseScript } from './base-script.js';
import { IConnector } from './interfaces/connector-interface.js';
import { MidPointIntegration } from './midpoint-integration.js';

class UpdateScript extends BaseScript {
  protected static override readonly operationName = 'person update';

  protected async performOperation(connector: IConnector): Promise<void> {
    // Validate required fields
    if (!this.uid) {
      throw new Error(`uid is required for ${UpdateScript.operationName}`);
    }

    // Convert MidPoint args to CIM Person (partial update)
    const cimPersonUpdates = MidPointIntegration.convertFromMidPointArgs(this.attributes);
    
    // Update person
    const updatedCimPerson = await connector.updatePerson(this.uid, cimPersonUpdates);
    
    // Output the updated CIM person data
    MidPointIntegration.outputCIMPersonForCMD(updatedCimPerson, this.uid);
  }
}

// Instantiate and run the script
const script = new UpdateScript();
script.execute();