// ===========================================
// src/delete.ts - Delete Person Script
// ===========================================
import { BaseScript } from './base-script.js';
import { IConnector } from './interfaces/connector-interface.js';

class DeleteScript extends BaseScript {
  protected static override readonly operationName = 'person deletion';

  protected async performOperation(connector: IConnector): Promise<void> {
    // Validate required fields
    if (!this.uid) {
      throw new Error(`uid is required for ${DeleteScript.operationName}`);
    }

    // Delete person
    await connector.deletePerson(this.uid);
    
    console.log(`Person ${this.uid} deleted successfully`);
  }
}

// Instantiate and run the script
const script = new DeleteScript();
script.execute();