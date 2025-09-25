// ===========================================
// src/test.ts - Test Connection Script
// ===========================================
import { BaseScript } from './base-script.js';
import { IConnector } from './interfaces/connector-interface.js';

class TestScript extends BaseScript {
  protected static override readonly operationName = 'connection test';

  protected async performOperation(connector: IConnector): Promise<void> {
    const isConnected = await connector.testConnection();
    
    if (isConnected) {
      console.log('Test successful');
    } else {
      console.log('Test failed');
      process.exit(1);
    }
  }
}

// Instantiate and run the script
const script = new TestScript();
script.execute();