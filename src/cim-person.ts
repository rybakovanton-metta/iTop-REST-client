// ===========================================
// src/cim-person.ts - CIM Person Model
// ===========================================

/**
 * CIM Person model based on CIM_Person schema
 * Serves as intermediate format between MidPoint and target systems
 */
export interface CIMPerson {
  // Core Identity
  commonName: string;           // Required - display name
  givenName?: string;          // First name
  surname?: string;            // Last name
  name?: string;               // Full distinguished name
  
  // Contact Information
  mail?: string;               // Email address
  telephoneNumber?: string;    // Phone number
  mobile?: string;             // Mobile phone
  facsimileTelephoneNumber?: string; // Fax
  homePhone?: string;          // Home phone
  pager?: string;              // Pager
  
  // Organizational
  ou?: string;                 // Organizational Unit
  organization?: string;       // Organization name
  title?: string;              // Job title/position
  employeeNumber?: string;     // Employee ID
  employeeType?: string;       // Employee, Contractor, etc.
  manager?: string;            // Manager reference
  
  // System/Technical
  userID?: string;             // Login/username
  instanceID?: string;         // Unique instance identifier
  
  // Location
  localityName?: string;       // City
  stateOrProvince?: string;    // State/Province
  postalCode?: string;         // Postal/ZIP code
  postalAddress?: string[];    // Address lines
  homePostalAddress?: string[]; // Home address
  
  // Additional
  businessCategory?: string;   // Business category
  preferredLanguage?: string;  // Preferred language
  secretary?: string;          // Secretary reference
  jpegPhoto?: string;          // Photo data
  description?: string;        // Description
  caption?: string;            // Short description
  elementName?: string;        // User-friendly name
  generation?: number;         // Version/generation
}

/**
 * Converter class to transform between different formats
 */
export class CIMPersonConverter {
  
  /**
   * Convert MidPoint arguments to CIM Person model
   */
  static fromMidPointArgs(args: Record<string, string>): CIMPerson {
    const cimPerson: CIMPerson = {
      commonName: args['commonName'] || args['cn'] || args['name'] || '',
    };

    // Map MidPoint attributes to CIM properties (only if they exist)
    const givenName = args['givenName'] || args['first_name'];
    if (givenName) cimPerson.givenName = givenName;
    
    const surname = args['sn'] || args['surname'] || args['last_name'];
    if (surname) cimPerson.surname = surname;
    
    const mail = args['mail'] || args['email'];
    if (mail) cimPerson.mail = mail;
    
    const phone = args['telephoneNumber'] || args['phone'];
    if (phone) cimPerson.telephoneNumber = phone;
    
    if (args['mobile']) cimPerson.mobile = args['mobile'];
    
    const ou = args['ou'] || args['organizationalUnit'];
    if (ou) cimPerson.ou = ou;
    
    const org = args['o'] || args['organization'];
    if (org) cimPerson.organization = org;
    
    if (args['title']) cimPerson.title = args['title'];
    
    const empNum = args['employeeNumber'] || args['employee_number'];
    if (empNum) cimPerson.employeeNumber = empNum;
    
    const empType = args['employeeType'] || args['employee_type'];
    if (empType) cimPerson.employeeType = empType;
    
    const userId = args['uid'] || args['userID'];
    if (userId) cimPerson.userID = userId;
    
    if (args['manager']) cimPerson.manager = args['manager'];
    
    const locality = args['l'] || args['localityName'] || args['city'];
    if (locality) cimPerson.localityName = locality;
    
    const state = args['st'] || args['stateOrProvince'] || args['state'];
    if (state) cimPerson.stateOrProvince = state;
    
    const postal = args['postalCode'] || args['zipCode'];
    if (postal) cimPerson.postalCode = postal;
    
    if (args['description']) cimPerson.description = args['description'];

    return cimPerson;
  }

  /**
   * Convert CIM Person to iTop PersonData format
   */
  static toITopPersonData(cimPerson: CIMPerson): Record<string, unknown> {
    const itopData: Record<string, unknown> = {
      name: cimPerson.surname || cimPerson.commonName,
      status: 'active'
    };

    // Map CIM properties to iTop fields
    if (cimPerson.givenName) {
      itopData['first_name'] = cimPerson.givenName;
    }
    
    if (cimPerson.mail) {
      itopData['email'] = cimPerson.mail;
    }
    
    if (cimPerson.telephoneNumber) {
      itopData['phone'] = cimPerson.telephoneNumber;
    }
    
    if (cimPerson.title) {
      itopData['function'] = cimPerson.title;
    }

    // Use organization name directly - iTop will resolve it
    if (cimPerson.organization) {
      itopData['org_name'] = cimPerson.organization;
    } else if (cimPerson.ou) {
      itopData['org_name'] = cimPerson.ou;
    }

    return itopData;
  }

  /**
   * Convert iTop PersonData to CIM Person format
   */
  static fromITopPersonData(itopData: Record<string, unknown>): CIMPerson {
    const cimPerson: CIMPerson = {
      commonName: (itopData['name'] as string) || '',
    };

    if (itopData['first_name']) cimPerson.givenName = itopData['first_name'] as string;
    if (itopData['name']) cimPerson.surname = itopData['name'] as string;
    if (itopData['email']) cimPerson.mail = itopData['email'] as string;
    if (itopData['phone']) cimPerson.telephoneNumber = itopData['phone'] as string;
    if (itopData['function']) cimPerson.title = itopData['function'] as string;
    if (itopData['id']) cimPerson.instanceID = itopData['id'].toString();

    return cimPerson;
  }
}