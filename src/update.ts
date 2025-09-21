// ===========================================
// src/update.ts - Update Person Script
// ===========================================
import { ITopApiClient } from './itop-client.js';
import { CmdUtils } from './cmd-utils.js';

async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const { uid, attributes } = CmdUtils.parseArgs(args);

    if (!uid) {
      throw new Error('UID is required for person update');
    }

    const personId = parseInt(uid);
    if (isNaN(personId)) {
      throw new Error('Invalid UID: must be a number');
    }

    // Build update data from changed attributes
    const updateData: Record<string, string | number> = {};
    Object.entries(attributes).forEach(([key, value]) => {
      if (['name', 'first_name', 'email', 'phone', 'org_id', 'status', 'function'].includes(key)) {
        updateData[key] = key === 'org_id' ? parseInt(value) : value;
      }
    });

    const client = new ITopApiClient();
    const result = await client.updatePerson(personId, updateData);
    
    // Output the updated person data
    CmdUtils.outputPersonData(result, uid);
    
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

main();