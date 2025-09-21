// ===========================================
// src/cmd-utils.ts - CMD Connector Utilities
// ===========================================
import { CmdConnectorArgs, PersonData } from './types';

export class CmdUtils {
  static parseArgs(args: string[]): CmdConnectorArgs {
    const uid = args[0];
    const name = args[1];
    const attributes: Record<string, string> = {};

    // Parse remaining arguments as attribute=value pairs
    for (let i = 2; i < args.length; i++) {
      const arg = args[i];
      if (arg?.includes('=')) {
        const [key, value] = arg.split('=', 2);
        if (key !== undefined && value !== undefined) {
          attributes[key] = value;
        }
      }
    }

    const result: CmdConnectorArgs = { attributes };
    if (uid) result.uid = uid;
    if (name) result.name = name;
    return result;
  }

  static outputPersonData(personData: PersonData, uid?: string): void {
    // Output in format expected by CMD connector
    if (uid) {
      console.log(`__UID__:${uid}`);
    } else if (personData.id) {
      console.log(`__UID__:${personData.id}`);
    }

    if (personData.name) {
      console.log(`__NAME__:${personData.name}`);
    }

    // Output all attributes
    Object.entries(personData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'id') {
        console.log(`${key}:${value}`);
      }
    });
  }

  static buildPersonData(attributes: Record<string, string>): PersonData {
    const personData: PersonData = {
      name: attributes['name'] || '',
      org_id: parseInt(attributes['org_id'] || '1') || 1,
      status: attributes['status'] || 'active'
    };

    // Map optional attributes
    if (attributes['first_name']) personData.first_name = attributes['first_name'];
    if (attributes['email']) personData.email = attributes['email'];
    if (attributes['phone']) personData.phone = attributes['phone'];
    if (attributes['function']) personData.function = attributes['function'];

    return personData;
  }
}
