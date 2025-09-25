// ===========================================
// src/connector-interface.ts - Base Connector Interface
// ===========================================
import { CIMPerson } from './cim-person.js';
import { PersonData } from './types.js';

/**
 * Base interface that all connectors must implement
 */
export interface IConnector {
  /**
   * Test connection to the target system
   */
  testConnection(): Promise<boolean>;

  /**
   * Create a person in the target system
   */
  createPerson(cimPerson: CIMPerson): Promise<{ id: string; data: PersonData }>;

  /**
   * Search for persons in the target system
   */
  searchPersons(query?: string, limit?: number): Promise<CIMPerson[]>;

  /**
   * Get a specific person by ID
   */
  getPerson(id: string): Promise<CIMPerson | null>;

  /**
   * Update a person in the target system
   */
  updatePerson(id: string, cimPerson: Partial<CIMPerson>): Promise<CIMPerson>;

  /**
   * Delete a person from the target system
   */
  deletePerson(id: string): Promise<void>;
}