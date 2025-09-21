import { CmdUtils } from '../src/cmd-utils';
import { CmdConnectorArgs, PersonData } from '../src/types';

describe('CmdUtils', () => {
  describe('parseArgs', () => {
    it('should parse basic uid and name arguments', () => {
      const args = ['123', 'John Doe'];
      const result = CmdUtils.parseArgs(args);
      
      expect(result.uid).toBe('123');
      expect(result.name).toBe('John Doe');
      expect(result.attributes).toEqual({});
    });

    it('should parse attributes in key=value format', () => {
      const args = ['123', 'John Doe', 'email=john@example.com', 'phone=555-1234'];
      const result = CmdUtils.parseArgs(args);
      
      expect(result.uid).toBe('123');
      expect(result.name).toBe('John Doe');
      expect(result.attributes).toEqual({
        email: 'john@example.com',
        phone: '555-1234'
      });
    });

    it('should handle missing uid and name', () => {
      const args: string[] = [];
      const result = CmdUtils.parseArgs(args);
      
      expect(result.uid).toBeUndefined();
      expect(result.name).toBeUndefined();
      expect(result.attributes).toEqual({});
    });

    it('should handle arguments without equals sign', () => {
      const args = ['123', 'John Doe', 'invalid-arg', 'email=john@example.com'];
      const result = CmdUtils.parseArgs(args);
      
      expect(result.uid).toBe('123');
      expect(result.name).toBe('John Doe');
      expect(result.attributes).toEqual({
        email: 'john@example.com'
      });
    });

    it('should handle empty values in key=value pairs', () => {
      const args = ['123', 'John Doe', 'email=', 'phone=555-1234'];
      const result = CmdUtils.parseArgs(args);
      
      expect(result.attributes).toEqual({
        email: '',
        phone: '555-1234'
      });
    });
  });

  describe('buildPersonData', () => {
    it('should build PersonData with required fields', () => {
      const attributes = {
        name: 'John Doe',
        org_id: '2',
        status: 'inactive'
      };
      
      const result = CmdUtils.buildPersonData(attributes);
      
      expect(result.name).toBe('John Doe');
      expect(result.org_id).toBe(2);
      expect(result.status).toBe('inactive');
    });

    it('should use default values for missing required fields', () => {
      const attributes = {};
      
      const result = CmdUtils.buildPersonData(attributes);
      
      expect(result.name).toBe('');
      expect(result.org_id).toBe(1);
      expect(result.status).toBe('active');
    });

    it('should handle optional fields', () => {
      const attributes = {
        name: 'John Doe',
        first_name: 'John',
        email: 'john@example.com',
        phone: '555-1234',
        function: 'Developer'
      };
      
      const result = CmdUtils.buildPersonData(attributes);
      
      expect(result.name).toBe('John Doe');
      expect(result.first_name).toBe('John');
      expect(result.email).toBe('john@example.com');
      expect(result.phone).toBe('555-1234');
      expect(result.function).toBe('Developer');
    });

    it('should handle invalid org_id', () => {
      const attributes = {
        name: 'John Doe',
        org_id: 'invalid'
      };
      
      const result = CmdUtils.buildPersonData(attributes);
      
      expect(result.org_id).toBe(1); // Should fallback to default
    });
  });

  describe('outputPersonData', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should output person data with UID from parameter', () => {
      const personData: PersonData = {
        id: 123,
        name: 'John Doe',
        first_name: 'John',
        email: 'john@example.com'
      };
      
      CmdUtils.outputPersonData(personData, '456');
      
      expect(consoleSpy).toHaveBeenCalledWith('__UID__:456');
      expect(consoleSpy).toHaveBeenCalledWith('__NAME__:John Doe');
      expect(consoleSpy).toHaveBeenCalledWith('name:John Doe');
      expect(consoleSpy).toHaveBeenCalledWith('first_name:John');
      expect(consoleSpy).toHaveBeenCalledWith('email:john@example.com');
      expect(consoleSpy).not.toHaveBeenCalledWith('id:123');
    });

    it('should output person data with UID from person data', () => {
      const personData: PersonData = {
        id: 123,
        name: 'John Doe'
      };
      
      CmdUtils.outputPersonData(personData);
      
      expect(consoleSpy).toHaveBeenCalledWith('__UID__:123');
      expect(consoleSpy).toHaveBeenCalledWith('__NAME__:John Doe');
    });

    it('should not output undefined or null values', () => {
      const personData: PersonData = {
        name: 'John Doe',
        email: null as any
      };
      
      CmdUtils.outputPersonData(personData);
      
      expect(consoleSpy).toHaveBeenCalledWith('__NAME__:John Doe');
      expect(consoleSpy).toHaveBeenCalledWith('name:John Doe');
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringMatching(/first_name:/));
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringMatching(/email:/));
    });
  });
});