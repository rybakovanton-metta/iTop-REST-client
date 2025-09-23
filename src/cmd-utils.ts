// ===========================================
// src/cmd-utils.ts - CMD Connector Utilities
// ===========================================
import { CmdConnectorArgs, PersonData } from './types.js';
import { CIMPersonConverter, CIMPerson } from './cim-person.js';

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
    // Convert MidPoint args to CIM Person model
    const cimPerson = CIMPersonConverter.fromMidPointArgs(attributes);
    
    // Convert CIM Person to iTop PersonData
    const itopData = CIMPersonConverter.toITopPersonData(cimPerson);
    
    // Ensure required fields for PersonData interface
    const personData: PersonData = {
      name: (itopData['name'] as string) || '',
      status: (itopData['status'] as string) || 'active',
    };

    // Add optional fields if they exist
    if (itopData['first_name']) personData.first_name = itopData['first_name'] as string;
    if (itopData['email']) personData.email = itopData['email'] as string;
    if (itopData['phone']) personData.phone = itopData['phone'] as string;
    if (itopData['function']) personData.function = itopData['function'] as string;
    
    // Handle organization - keep as name for now, will be resolved by iTop API client
    if (itopData['org_name']) {
      personData['org_name'] = itopData['org_name'] as string;
    } else {
      personData.org_id = 1; // Default fallback
    }

    return personData;
  }

  static buildCIMPerson(attributes: Record<string, string>): CIMPerson {
    return CIMPersonConverter.fromMidPointArgs(attributes);
  }
}
