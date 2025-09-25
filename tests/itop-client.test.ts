import axios from 'axios';
import { ITopApiClient } from '../src/connectors/itop/itop-client';
import { ITopApiResponse } from '../src/interfaces/types';

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

  describe('constructor', () => {
    it('should initialize with username/password auth', () => {
      expect(() => new ITopApiClient()).not.toThrow();
    });

    it('should initialize with token auth', () => {
      mockConfig = {
        baseUrl: 'https://test.itop.com/webservices/rest.php',
        auth_token: 'test-token',
        apiVersion: '1.3'
      };
      
      expect(() => new ITopApiClient()).not.toThrow();
    });

    it('should throw error when no auth is provided', () => {
      mockConfig = {
        baseUrl: 'https://test.itop.com/webservices/rest.php',
        apiVersion: '1.3'
      };
      
      expect(() => new ITopApiClient()).toThrow('Either auth_token or both username and password must be provided in config');
    });
  });

  describe('makeRequest', () => {
    it('should make successful API request with username/password', async () => {
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
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('https://test.itop.com/webservices/rest.php?version=1.3'),
        expect.any(Object),
        expect.objectContaining({
          timeout: 30000,
          httpsAgent: expect.any(Object)
        })
      );
    });

    it('should make successful API request with token auth', async () => {
      mockConfig = {
        baseUrl: 'https://test.itop.com/webservices/rest.php',
        auth_token: 'test-token',
        apiVersion: '1.3'
      };
      
      client = new ITopApiClient();

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
    });

    it('should throw ApiError when iTop returns error code', async () => {
      const mockResponse: ITopApiResponse = {
        code: 1,
        message: 'iTop Error Message'
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      await expect(client.makeRequest({
        operation: 'list_operations'
      })).rejects.toThrow('iTop API Error (1): iTop Error Message');
    });

    it('should throw ApiError on HTTP error', async () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Network Error',
        response: { status: 500 }
      };
      
      mockedAxios.post.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(client.makeRequest({
        operation: 'list_operations'
      })).rejects.toThrow('HTTP Error: Network Error');
    });

    it('should rethrow non-axios errors', async () => {
      const customError = new Error('Custom error');
      mockedAxios.post.mockRejectedValueOnce(customError);
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      await expect(client.makeRequest({
        operation: 'list_operations'
      })).rejects.toThrow('Custom error');
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      const mockResponse: ITopApiResponse = {
        code: 0,
        message: 'Success'
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse
      });

      const result = await client.testConnection();
      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.testConnection();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Test connection failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});