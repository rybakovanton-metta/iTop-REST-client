// ===========================================
// src/delete.ts - Delete Person Script
// ===========================================
import { ITopApiClient } from './itop-client';
import { CmdUtils } from './cmd-utils';

async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const { uid } = CmdUtils.parseArgs(args);

    if (!uid) {
      throw new Error('UID is required for person deletion');
    }

    const personId = parseInt(uid);
    if (isNaN(personId)) {
      throw new Error('Invalid UID: must be a number');
    }

    const client = new ITopApiClient();
    await client.deletePerson(personId);
    
    console.log(`Person ${uid} deleted successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Delete failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}