// ===========================================
// src/create.ts - Create Person Script
// ===========================================
import { ITopApiClient } from './itop-client.js';
import { CmdUtils } from './cmd-utils.js';

async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const { name, attributes } = CmdUtils.parseArgs(args);

    if (!name) {
      throw new Error('Name is required for person creation');
    }

    const personData = CmdUtils.buildPersonData({ ...attributes, name });
    
    const client = new ITopApiClient();
    const result = await client.createPerson(personData);
    
    // Output the created person data
    CmdUtils.outputPersonData(result.data, result.id.toString());
    
    process.exit(0);
  } catch (error) {
    console.error('Create failed:', error);
    process.exit(1);
  }
}

main();
