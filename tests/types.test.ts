import { PersonData, ITopApiRequest, ITopApiResponse, CmdConnectorArgs } from '../src/types';

describe('Type Definitions', () => {
  describe('PersonData', () => {
    it('should accept valid person data with required fields', () => {
      const personData: PersonData = {
        name: 'John Doe'
      };

      expect(personData.name).toBe('John Doe');
    });

    it('should accept person data with all optional fields', () => {
      const personData: PersonData = {
        id: 123,
        name: 'John Doe',
        first_name: 'John',
        email: 'john@example.com',
        phone: '555-1234',
        org_id: 2,
        status: 'active',
        function: 'Developer'
      };

      expect(personData.id).toBe(123);
      expect(personData.name).toBe('John Doe');
      expect(personData.first_name).toBe('John');
      expect(personData.email).toBe('john@example.com');
      expect(personData.phone).toBe('555-1234');
      expect(personData.org_id).toBe(2);
      expect(personData.status).toBe('active');
      expect(personData.function).toBe('Developer');
    });

    it('should accept additional properties via index signature', () => {
      const personData: PersonData = {
        name: 'John Doe',
        customField: 'custom value'
      };

      expect(personData.name).toBe('John Doe');
      expect(personData['customField']).toBe('custom value');
    });
  });

  describe('ITopApiRequest', () => {
    it('should accept minimal request with operation only', () => {
      const request: ITopApiRequest = {
        operation: 'list_operations'
      };

      expect(request.operation).toBe('list_operations');
    });

    it('should accept complete request with all fields', () => {
      const request: ITopApiRequest = {
        operation: 'core/create',
        comment: 'Test comment',
        class: 'Person',
        key: 123,
        output_fields: 'id,name,email',
        fields: { name: 'John Doe' },
        simulate: false
      };

      expect(request.operation).toBe('core/create');
      expect(request.comment).toBe('Test comment');
      expect(request.class).toBe('Person');
      expect(request.key).toBe(123);
      expect(request.output_fields).toBe('id,name,email');
      expect(request.fields).toEqual({ name: 'John Doe' });
      expect(request.simulate).toBe(false);
    });
  });

  describe('ITopApiResponse', () => {
    it('should accept basic response structure', () => {
      const response: ITopApiResponse = {
        code: 0,
        message: 'Success'
      };

      expect(response.code).toBe(0);
      expect(response.message).toBe('Success');
    });

    it('should accept response with objects', () => {
      const response: ITopApiResponse = {
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
              name: 'John Doe'
            }
          }
        }
      };

      expect(response.objects).toBeDefined();
      expect(response.objects?.['Person::123']?.key).toBe(123);
      expect(response.objects?.['Person::123']?.fields.name).toBe('John Doe');
    });

    it('should accept response with operations', () => {
      const response: ITopApiResponse = {
        code: 0,
        message: 'Success',
        operations: [
          {
            verb: 'GET',
            description: 'Get objects',
            extension: '/core/get'
          }
        ]
      };

      expect(response.operations).toBeDefined();
      expect(response.operations?.[0]?.verb).toBe('GET');
    });
  });

  describe('CmdConnectorArgs', () => {
    it('should accept minimal arguments with attributes only', () => {
      const args: CmdConnectorArgs = {
        attributes: {}
      };

      expect(args.attributes).toEqual({});
    });

    it('should accept complete arguments', () => {
      const args: CmdConnectorArgs = {
        uid: '123',
        name: 'John Doe',
        attributes: {
          email: 'john@example.com',
          phone: '555-1234'
        }
      };

      expect(args.uid).toBe('123');
      expect(args.name).toBe('John Doe');
      expect(args.attributes['email']).toBe('john@example.com');
      expect(args.attributes['phone']).toBe('555-1234');
    });

    it('should accept args with undefined uid and name', () => {
      const args: CmdConnectorArgs = {
        attributes: { key: 'value' }
      };

      expect(args.uid).toBeUndefined();
      expect(args.name).toBeUndefined();
      expect(args.attributes).toEqual({ key: 'value' });
    });
  });
});