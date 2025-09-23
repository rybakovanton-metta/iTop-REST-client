// ===========================================
// src/connectors/itop-connector.ts - iTop Connector Implementation
// ===========================================
import { IConnector } from '../connector-interface.js';
import { CIMPerson, CIMPersonConverter } from '../cim-person.js';
import { ITopApiClient } from '../itop-client.js';
import { PersonData } from '../types.js';

/**
 * iTop connector implementation
 * Handles conversion from CIM Person format to iTop and API operations
 */
export default class ITopConnector implements IConnector {
  private client: ITopApiClient;

  constructor() {
    // Client will be created with debug flag when needed
    this.client = new ITopApiClient(false);
  }

  async testConnection(debug: boolean = false): Promise<boolean> {
    this.client = new ITopApiClient(debug);
    return await this.client.testConnection();
  }

  async createPerson(cimPerson: CIMPerson, debug: boolean = false): Promise<{ id: string; data: any }> {
    this.client = new ITopApiClient(debug);
    
    // Convert CIM Person to iTop PersonData format
    const itopData = this.convertCIMToITop(cimPerson);
    
    // Create person via iTop API
    const result = await this.client.createPerson(itopData);
    
    return {
      id: result.id.toString(),
      data: result.data
    };
  }

  async searchPersons(query?: string, limit: number = 100, debug: boolean = false): Promise<CIMPerson[]> {
    this.client = new ITopApiClient(debug);
    
    // Search via iTop API
    const itopPersons = await this.client.searchPersons(query, limit);
    
    // Convert each iTop person back to CIM format
    return itopPersons.map(itopPerson => this.convertITopToCIM(itopPerson));
  }

  async getPerson(id: string, debug: boolean = false): Promise<CIMPerson | null> {
    this.client = new ITopApiClient(debug);
    
    const personId = parseInt(id);
    if (isNaN(personId)) {
      throw new Error(`Invalid person ID: ${id}`);
    }
    
    // Get person via iTop API
    const itopPerson = await this.client.getPerson(personId);
    if (!itopPerson) {
      return null;
    }
    
    // Convert to CIM format
    return this.convertITopToCIM(itopPerson);
  }

  async updatePerson(id: string, cimPerson: Partial<CIMPerson>, debug: boolean = false): Promise<CIMPerson> {
    this.client = new ITopApiClient(debug);
    
    const personId = parseInt(id);
    if (isNaN(personId)) {
      throw new Error(`Invalid person ID: ${id}`);
    }
    
    // Convert CIM updates to iTop format (partial data)
    const itopUpdateData = this.convertCIMToITop(cimPerson as CIMPerson, true);
    
    // Update via iTop API
    const updatedItopPerson = await this.client.updatePerson(personId, itopUpdateData);
    
    // Convert back to CIM format
    return this.convertITopToCIM(updatedItopPerson);
  }

  async deletePerson(id: string, debug: boolean = false): Promise<void> {
    this.client = new ITopApiClient(debug);
    
    const personId = parseInt(id);
    if (isNaN(personId)) {
      throw new Error(`Invalid person ID: ${id}`);
    }
    
    // Delete via iTop API
    await this.client.deletePerson(personId);
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
    return CIMPersonConverter.fromITopPersonData(itopData as Record<string, unknown>);
  }
}