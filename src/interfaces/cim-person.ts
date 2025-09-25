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

