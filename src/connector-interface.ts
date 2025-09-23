// ===========================================
// src/connector-interface.ts - Base Connector Interface
// ===========================================
import { CIMPerson } from './cim-person.js';

/**
 * Base interface that all connectors must implement
 */
export interface IConnector {
  /**
   * Test connection to the target system
   */
  testConnection(debug?: boolean): Promise<boolean>;

  /**
   * Create a person in the target system
   */
  createPerson(cimPerson: CIMPerson, debug?: boolean): Promise<{ id: string; data: any }>;

  /**
   * Search for persons in the target system
   */
  searchPersons(query?: string, limit?: number, debug?: boolean): Promise<CIMPerson[]>;

  /**
   * Get a specific person by ID
   */
  getPerson(id: string, debug?: boolean): Promise<CIMPerson | null>;

  /**
   * Update a person in the target system
   */
  updatePerson(id: string, cimPerson: Partial<CIMPerson>, debug?: boolean): Promise<CIMPerson>;

  /**
   * Delete a person from the target system
   */
  deletePerson(id: string, debug?: boolean): Promise<void>;
}