// ===========================================
// src/test.ts - Test Connection Script
// ===========================================
import { ITopApiClient } from './itop-client';

async function main(): Promise<void> {
  try {
    const client = new ITopApiClient();
    const isConnected = await client.testConnection();
    
    if (isConnected) {
      console.log('Test successful');
      process.exit(0);
    } else {
      console.log('Test failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}