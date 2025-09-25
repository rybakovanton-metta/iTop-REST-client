// ===========================================
// src/types.ts - Type Definitions
// ===========================================
export interface PersonData {
  id?: number;
  name: string;
  first_name?: string;
  email?: string;
  phone?: string;
  org_id?: number | string;
  org_name?: string;
  status?: string;
  function?: string;
  [key: string]: unknown;
}

export interface ITopApiRequest {
  operation: string;
  comment?: string;
  class?: string;
  key?: string | number | object;
  output_fields?: string;
  fields?: Record<string, unknown>;
  simulate?: boolean;
  limit?: number;
}

export interface ITopApiResponse {
  code: number;
  message: string;
  objects?: Record<string, {
    code: number;
    message: string;
    class: string;
    key: number;
    fields: PersonData;
  }>;
  operations?: Array<{
    verb: string;
    description: string;
    extension: string;
  }>;
}

export interface CmdConnectorArgs {
  uid?: string;
  name?: string;
  attributes: Record<string, string>;
}
