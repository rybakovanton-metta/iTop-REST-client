// ===========================================
// src/connectors/itop-connector.ts - iTop Connector Implementation
// ===========================================
import { IConnector } from '../../interfaces/connector-interface.js';
import { CIMPerson } from '../../interfaces/cim-person.js';
import { ITopApiClient } from './itop-client.js';
import { PersonData } from '../../interfaces/types.js';
import { InvalidPersonIdError } from '../../errors.js';

/**
 * iTop connector implementation
 * Handles conversion from CIM Person format to iTop and API operations
 */
export default class ITopConnector implements IConnector {
  private client: ITopApiClient;

  constructor(debug: boolean = false) {
    // Create client once with debug setting
    this.client = new ITopApiClient(debug);
  }

  async testConnection(): Promise<boolean> {
    return await this.client.testConnection();
  }

  async createPerson(cimPerson: CIMPerson): Promise<{ id: string; data: PersonData }> {
    // Convert CIM Person to iTop PersonData format
    const itopData = this.convertCIMToITop(cimPerson);
    
    // Create person via iTop API
    const response = await this.client.makeRequest({
      operation: 'core/create',
      comment: 'Created via MidPoint IGA',
      class: 'Person',
      output_fields: 'id,name,first_name,email,phone,org_id,status,function',
      fields: itopData
    });

    if (!response.objects) {
      throw new Error('No objects returned from create operation');
    }

    const personKey = Object.keys(response.objects)[0];
    if (!personKey) {
      throw new Error('No person key found in response');
    }
    const person = response.objects[personKey];
    if (!person) {
      throw new Error('No person data found in response');
    }
    
    return {
      id: person.key.toString(),
      data: person.fields
    };
  }

  async searchPersons(query?: string, limit: number = 100): Promise<CIMPerson[]> {
    const searchKey = query 
      ? `SELECT Person WHERE name LIKE '%${query}%' OR first_name LIKE '%${query}%' OR email LIKE '%${query}%'`
      : `SELECT Person`;

    const response = await this.client.makeRequest({
      operation: 'core/get',
      class: 'Person',
      key: searchKey,
      output_fields: 'id,name,first_name,email,phone,org_id,status,function',
      limit: limit
    });

    if (!response.objects) {
      return [];
    }

    // Convert each iTop person back to CIM format
    const itopPersons = Object.values(response.objects).map(obj => obj.fields);
    return itopPersons.map(itopPerson => this.convertITopToCIM(itopPerson));
  }

  async getPerson(id: string): Promise<CIMPerson | null> {
    const personId = parseInt(id);
    if (isNaN(personId)) {
      throw new InvalidPersonIdError(id);
    }
    
    try {
      const response = await this.client.makeRequest({
        operation: 'core/get',
        class: 'Person',
        key: personId,
        output_fields: 'id,name,first_name,email,phone,org_id,status,function'
      });

      if (!response.objects) {
        return null;
      }

      const personKey = Object.keys(response.objects)[0];
      if (!personKey) {
        return null;
      }
      const person = response.objects[personKey];
      if (!person) {
        return null;
      }
      
      // Convert to CIM format
      return this.convertITopToCIM(person.fields);
    } catch {
      // Person not found
      return null;
    }
  }

  async updatePerson(id: string, cimPerson: Partial<CIMPerson>): Promise<CIMPerson> {
    const personId = parseInt(id);
    if (isNaN(personId)) {
      throw new InvalidPersonIdError(id);
    }
    
    // Convert CIM updates to iTop format (partial data)
    const itopUpdateData = this.convertCIMToITop(cimPerson as CIMPerson, true);
    
    const response = await this.client.makeRequest({
      operation: 'core/update',
      comment: 'Updated via MidPoint IGA',
      class: 'Person',
      key: personId,
      output_fields: 'id,name,first_name,email,phone,org_id,status,function',
      fields: itopUpdateData
    });

    if (!response.objects) {
      throw new Error('No objects returned from update operation');
    }

    const personKey = Object.keys(response.objects)[0];
    if (!personKey) {
      throw new Error('No person key found in response');
    }
    const person = response.objects[personKey];
    if (!person) {
      throw new Error('No person data found in response');
    }
    
    // Convert back to CIM format
    return this.convertITopToCIM(person.fields);
  }

  async deletePerson(id: string): Promise<void> {
    const personId = parseInt(id);
    if (isNaN(personId)) {
      throw new InvalidPersonIdError(id);
    }
    
    await this.client.makeRequest({
      operation: 'core/delete',
      comment: 'Deleted via MidPoint IGA',
      class: 'Person',
      key: personId,
      simulate: false
    });
  }

  /**
   * Convert CIM Person to iTop PersonData format
   */
  private convertCIMToITop(cimPerson: CIMPerson, isPartialUpdate: boolean = false): PersonData {
    const itopData: PersonData = {
      name: cimPerson.surname || cimPerson.commonName || '',
      status: 'active'
    };

    // Only add fields that exist in CIM person
    if (cimPerson.givenName) {
      itopData.first_name = cimPerson.givenName;
    }
    
    if (cimPerson.mail) {
      itopData.email = cimPerson.mail;
    }
    
    if (cimPerson.telephoneNumber) {
      itopData.phone = cimPerson.telephoneNumber;
    }
    
    if (cimPerson.title) {
      itopData.function = cimPerson.title;
    }

    // Handle organization - use name directly, let iTop resolve it
    if (cimPerson.organization) {
      itopData.org_name = cimPerson.organization;
    } else if (cimPerson.ou) {
      itopData.org_name = cimPerson.ou;
    } else if (!isPartialUpdate) {
      // Only set default org_id for create operations, not updates
      itopData.org_id = 1;
    }

    return itopData;
  }

  /**
   * Convert iTop PersonData to CIM Person format
   */
  private convertITopToCIM(itopData: PersonData): CIMPerson {
    const cimPerson: CIMPerson = {
      commonName: itopData.name || '',
    };

    if (itopData.first_name) cimPerson.givenName = itopData.first_name;
    if (itopData.name) cimPerson.surname = itopData.name;
    if (itopData.email) cimPerson.mail = itopData.email;
    if (itopData.phone) cimPerson.telephoneNumber = itopData.phone;
    if (itopData.function) cimPerson.title = itopData.function;
    if (itopData.id) cimPerson.instanceID = itopData.id.toString();

    return cimPerson;
  }

}