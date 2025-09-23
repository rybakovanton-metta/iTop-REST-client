// ===========================================
// src/itop-client.ts - iTop API Client
// ===========================================
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import https from 'https';
import { config } from './config.js';
import { ITopApiRequest, ITopApiResponse, PersonData } from './types.js';

export class ITopApiClient {
  private readonly baseUrl: string;
  private readonly username?: string;
  private readonly password?: string;
  private readonly authToken?: string;
  private readonly apiVersion: string;
  private readonly debug: boolean;

  constructor(debug: boolean = false) {
    this.baseUrl = config.baseUrl;
    this.apiVersion = config.apiVersion;
    this.debug = debug;
    
    // Assign optional properties only if they exist
    if (config.username !== undefined) {
      this.username = config.username;
    }
    if (config.password !== undefined) {
      this.password = config.password;
    }
    if (config.auth_token !== undefined) {
      this.authToken = config.auth_token;
    }

    // Validate authentication configuration
    if (!this.authToken && (!this.username || !this.password)) {
      throw new Error('Either auth_token or both username and password must be provided in config');
    }
  }

  private debugRequest(requestData: ITopApiRequest, urlWithVersion: string): void {
    if (this.debug) {
      console.log('=== iTop API Request Debug ===');
      console.log('URL:', urlWithVersion);
      console.log('Request Data:', JSON.stringify(requestData, null, 2));
      console.log('Auth Method:', this.authToken ? 'Token' : 'Username/Password');
      console.log('==============================');
    }
  }

  private debugResponse(response: ITopApiResponse): void {
    if (this.debug) {
      console.log('=== Search Response Debug ===');
      console.log('Response code:', response.code);
      console.log('Response message:', response.message);
      console.log('Response objects:', response.objects ? Object.keys(response.objects).length + ' objects' : 'null');
      console.log('=============================');
    }
  }

  async makeRequest(requestData: ITopApiRequest): Promise<ITopApiResponse> {
    try {
      const formData = new FormData();
      
      // Use token authentication if available, otherwise use username/password
      if (this.authToken) {
        formData.append('auth_token', this.authToken);
      } else if (this.username && this.password) {
        formData.append('auth_user', this.username);
        formData.append('auth_pwd', this.password);
      } else {
        throw new Error('Invalid authentication configuration');
      }
      
      formData.append('json_data', JSON.stringify(requestData));

      // Add version as URL parameter according to iTop documentation
      const urlWithVersion = `${this.baseUrl}?version=${this.apiVersion}`;

      // Debug logging
      this.debugRequest(requestData, urlWithVersion);

      const response: AxiosResponse = await axios.post(urlWithVersion, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 second timeout
        httpsAgent: new https.Agent({
          rejectUnauthorized: false // Accept self-signed certificates
        })
      });

      const result: ITopApiResponse = response.data;

      if (result.code !== 0) {
        throw new Error(`iTop API Error (${result.code}): ${result.message}`);
      }

      return result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`HTTP Error: ${error.message}`);
      }
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        operation: 'list_operations'
      });
      return response.code === 0;
    } catch (error) {
      console.error('Test connection failed:', error);
      return false;
    }
  }

  async createPerson(personData: PersonData): Promise<{ id: number; data: PersonData }> {
    const response = await this.makeRequest({
      operation: 'core/create',
      comment: 'Created via MidPoint IGA',
      class: 'Person',
      output_fields: 'id,name,first_name,email,phone,org_id,status,function',
      fields: personData
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
      id: person.key,
      data: person.fields
    };
  }

  async updatePerson(id: number, updateData: Partial<PersonData>): Promise<PersonData> {
    const response = await this.makeRequest({
      operation: 'core/update',
      comment: 'Updated via MidPoint IGA',
      class: 'Person',
      key: id,
      output_fields: 'id,name,first_name,email,phone,org_id,status,function',
      fields: updateData
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
    return person.fields;
  }

  async getPerson(id: number): Promise<PersonData | null> {
    try {
      const response = await this.makeRequest({
        operation: 'core/get',
        class: 'Person',
        key: id,
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
      return person.fields;
    } catch {
      // Person not found
      return null;
    }
  }

  async searchPersons(query?: string, limit: number = 100): Promise<PersonData[]> {
    const searchKey = query 
      ? `SELECT Person WHERE name LIKE '%${query}%' OR first_name LIKE '%${query}%' OR email LIKE '%${query}%'`
      : `SELECT Person`;

    const response = await this.makeRequest({
      operation: 'core/get',
      class: 'Person',
      key: searchKey,
      output_fields: 'id,name,first_name,email,phone,org_id,status,function',
      limit: limit
    });

    this.debugResponse(response);

    if (!response.objects) {
      return [];
    }

    return Object.values(response.objects).map(obj => obj.fields);
  }

  async deletePerson(id: number): Promise<void> {
    await this.makeRequest({
      operation: 'core/delete',
      comment: 'Deleted via MidPoint IGA',
      class: 'Person',
      key: id,
      simulate: false
    });
  }
}