import axios from 'axios';
import { ITopApiClient } from '../src/itop-client';
import { ITopApiResponse, PersonData } from '../src/types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock config - default to username/password auth
let mockConfig: any;

jest.mock('../src/config', () => ({
  get config() {
    return mockConfig || {
      baseUrl: 'https://test.itop.com/webservices/rest.php',
      username: 'testuser',
      password: 'testpass',
      apiVersion: '1.3'
    };
  }
}));

describe('ITopApiClient', () => {
  let client: ITopApiClient;

  beforeEach(() => {
    // Reset to default username/password config
    mockConfig = {
      baseUrl: 'https://test.itop.com/webservices/rest.php',
      username: 'testuser',
      password: 'testpass',
      apiVersion: '1.3'
    };
    
    client = new ITopApiClient();
    jest.clearAllMocks();
  });

  describe('makeRequest', () => {
    it('should make successful API request', async () => {
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success'
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      const result = await client.makeRequest({
        operation: 'list_operations'
      });

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle API error responses', async () => {
      const mockResponse: ITopApiResponse = {
        code: 1,
        message: 'Error occurred'
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      await expect(client.makeRequest({
        operation: 'invalid_operation'
      })).rejects.toThrow('iTop API Error (1): Error occurred');
    });

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      await expect(client.makeRequest({
        operation: 'test'
      })).rejects.toThrow('Network error');
    });

    it('should handle axios errors', async () => {
      const axiosError = new Error('Request failed') as any;
      axiosError.isAxiosError = true;
      mockedAxios.post.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(client.makeRequest({
        operation: 'test'
      })).rejects.toThrow('HTTP Error: Request failed');
    });
  });

  describe('Authentication', () => {
    it('should use auth_token when provided', async () => {
      // Configure for token auth
      mockConfig = {
        baseUrl: 'https://test.itop.com/webservices/rest.php',
        auth_token: 'test-token-123',
        apiVersion: '1.3'
      };

      const tokenClient = new ITopApiClient();
      
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success'
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      await tokenClient.makeRequest({
        operation: 'list_operations'
      });

      // Verify the request was made with auth_token
      const formDataCall = mockedAxios.post.mock.calls[0];
      expect(formDataCall).toBeDefined();
      const formData = formDataCall![1] as any;
      
      expect(formData.getBuffer().toString()).toContain('auth_token');
      expect(formData.getBuffer().toString()).toContain('test-token-123');
      expect(formData.getBuffer().toString()).not.toContain('auth_user');
      expect(formData.getBuffer().toString()).not.toContain('auth_pwd');
    });

    it('should use username/password when auth_token not provided', async () => {
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success'
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      await client.makeRequest({
        operation: 'list_operations'
      });

      // Verify the request was made with username/password
      const formDataCall = mockedAxios.post.mock.calls[0];
      expect(formDataCall).toBeDefined();
      const formData = formDataCall![1] as any;
      
      expect(formData.getBuffer().toString()).toContain('auth_user');
      expect(formData.getBuffer().toString()).toContain('testuser');
      expect(formData.getBuffer().toString()).toContain('auth_pwd');
      expect(formData.getBuffer().toString()).toContain('testpass');
      expect(formData.getBuffer().toString()).not.toContain('auth_token');
    });

    it('should throw error when neither auth_token nor username/password provided', () => {
      // Configure invalid auth
      mockConfig = {
        baseUrl: 'https://test.itop.com/webservices/rest.php',
        apiVersion: '1.3'
      };

      expect(() => new ITopApiClient()).toThrow('Either auth_token or both username and password must be provided in config');
    });

    it('should throw error when only username provided without password', () => {
      // Configure invalid auth - username only
      mockConfig = {
        baseUrl: 'https://test.itop.com/webservices/rest.php',
        username: 'testuser',
        apiVersion: '1.3'
      };

      expect(() => new ITopApiClient()).toThrow('Either auth_token or both username and password must be provided in config');
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success',
        operations: []
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      const result = await client.testConnection();

      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Connection failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await client.testConnection();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Test connection failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('createPerson', () => {
    it('should create person successfully', async () => {
      const personData: PersonData = {
        name: 'John Doe',
        first_name: 'John',
        email: 'john@example.com'
      };

      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success',
        objects: {
          'Person::123': {
            code: 0,
            message: 'created',
            class: 'Person',
            key: 123,
            fields: {
              ...personData,
              id: 123
            }
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      const result = await client.createPerson(personData);

      expect(result.id).toBe(123);
      expect(result.data.name).toBe('John Doe');
    });

    it('should throw error when no objects returned', async () => {
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success'
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      await expect(client.createPerson({
        name: 'John Doe'
      })).rejects.toThrow('No objects returned from create operation');
    });
  });

  describe('updatePerson', () => {
    it('should update person successfully', async () => {
      const updateData = {
        email: 'newemail@example.com'
      };

      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success',
        objects: {
          'Person::123': {
            code: 0,
            message: 'updated',
            class: 'Person',
            key: 123,
            fields: {
              id: 123,
              name: 'John Doe',
              email: 'newemail@example.com'
            }
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      const result = await client.updatePerson(123, updateData);

      expect(result.email).toBe('newemail@example.com');
    });
  });

  describe('getPerson', () => {
    it('should get person successfully', async () => {
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success',
        objects: {
          'Person::123': {
            code: 0,
            message: 'found',
            class: 'Person',
            key: 123,
            fields: {
              id: 123,
              name: 'John Doe',
              email: 'john@example.com'
            }
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      const result = await client.getPerson(123);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('John Doe');
    });

    it('should return null when person not found', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Not found'));

      const result = await client.getPerson(999);

      expect(result).toBeNull();
    });

    it('should return null when no objects in response', async () => {
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success'
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      const result = await client.getPerson(123);

      expect(result).toBeNull();
    });
  });

  describe('searchPersons', () => {
    it('should search persons with query', async () => {
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success',
        objects: {
          'Person::123': {
            code: 0,
            message: 'found',
            class: 'Person',
            key: 123,
            fields: {
              id: 123,
              name: 'John Doe',
              email: 'john@example.com'
            }
          },
          'Person::456': {
            code: 0,
            message: 'found',
            class: 'Person',
            key: 456,
            fields: {
              id: 456,
              name: 'Jane Doe',
              email: 'jane@example.com'
            }
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      const result = await client.searchPersons('Doe');

      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe('John Doe');
      expect(result[1]?.name).toBe('Jane Doe');
    });

    it('should return empty array when no objects found', async () => {
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success'
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      const result = await client.searchPersons('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('deletePerson', () => {
    it('should delete person successfully', async () => {
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success'
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      await expect(client.deletePerson(123)).resolves.not.toThrow();
    });
  });
});