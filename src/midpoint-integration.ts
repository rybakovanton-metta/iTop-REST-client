// ===========================================
// src/midpoint-integration.ts - MidPoint Integration Layer
// ===========================================
import { CIMPerson } from './interfaces/cim-person.js';

/**
 * MidPoint integration utilities for CMD connector
 * Handles conversion between CIM Person and MidPoint-specific formats
 */
export class MidPointIntegration {
  
  /**
   * Convert MidPoint arguments to CIM Person model
   */
  static convertFromMidPointArgs(args: Record<string, string>): CIMPerson {
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
   * Output CIM Person in MidPoint CMD connector format
   */
  static outputCIMPersonForCMD(cimPerson: CIMPerson, uid?: string): void {
    // Output in format expected by CMD connector
    if (uid) {
      console.log(`__UID__:${uid}`);
    } else if (cimPerson.instanceID) {
      console.log(`__UID__:${cimPerson.instanceID}`);
    }

    // Use surname or commonName for __NAME__
    const name = cimPerson.surname || cimPerson.commonName;
    if (name) {
      console.log(`__NAME__:${name}`);
    }

    // Output CIM Person attributes in MidPoint format
    if (name) console.log(`name:${name}`);
    if (cimPerson.givenName) console.log(`first_name:${cimPerson.givenName}`);
    if (cimPerson.mail) console.log(`email:${cimPerson.mail}`);
    if (cimPerson.telephoneNumber) console.log(`phone:${cimPerson.telephoneNumber}`);
    if (cimPerson.title) console.log(`function:${cimPerson.title}`);
    if (cimPerson.organization) console.log(`organization:${cimPerson.organization}`);
    if (cimPerson.ou) console.log(`ou:${cimPerson.ou}`);
    if (cimPerson.userID) console.log(`userID:${cimPerson.userID}`);
    if (cimPerson.employeeNumber) console.log(`employeeNumber:${cimPerson.employeeNumber}`);
    if (cimPerson.employeeType) console.log(`employeeType:${cimPerson.employeeType}`);
    if (cimPerson.manager) console.log(`manager:${cimPerson.manager}`);
    if (cimPerson.localityName) console.log(`localityName:${cimPerson.localityName}`);
    if (cimPerson.stateOrProvince) console.log(`stateOrProvince:${cimPerson.stateOrProvince}`);
    if (cimPerson.postalCode) console.log(`postalCode:${cimPerson.postalCode}`);
    if (cimPerson.description) console.log(`description:${cimPerson.description}`);
    
    // Always output status as active
    console.log(`status:active`);
  }
}