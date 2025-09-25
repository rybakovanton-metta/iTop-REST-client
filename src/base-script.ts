// ===========================================
// src/base-script.ts - Base Script Class
// ===========================================
import { ConnectorFactory } from './connector-factory.js';
import { IConnector } from './interfaces/connector-interface.js';

/**
 * Parsed command line arguments for all scripts
 */
export interface ScriptArgs {
  system: string;
  debug: boolean;
  uid: string | undefined;
  name: string | undefined;
  attributes: Record<string, string>;
}

/**
 * Base class for all operation scripts to eliminate code duplication
 */
export abstract class BaseScript {
  protected static readonly operationName: string;
  
  private _system: string;
  private _debug: boolean;
  private _uid: string;
  private _name: string;
  private _attributes: Record<string, string>;

  //#region Getters
  protected get system(): string {
    return this._system;
  }

  protected get debug(): boolean {
    return this._debug;
  }

  protected get uid(): string {
    return this._uid;
  }

  protected get name(): string {
    return this._name;
  }

  protected get attributes(): Record<string, string> {
    return this._attributes;
  }
  //#endregion

  constructor() {
    const args = this.parseCommonArgs();
    this._system = args.system;
    this._debug = args.debug;
    this._uid = args.uid || '';
    this._name = args.name || '';
    this._attributes = args.attributes;
  }
  /**
   * Main execution method that handles common patterns
   */
  public async execute(): Promise<void> {
    try {
      const connector = await ConnectorFactory.create(this.system, this.debug);
      await this.performOperation(connector);
      process.exit(0);
    } catch (error) {
      console.error(`${(this.constructor as typeof BaseScript).operationName} failed:`, error);
      process.exit(1);
    }
  }

  /**
   * Parse common command line arguments shared by all scripts
   */
  protected parseCommonArgs(): ScriptArgs {
    const args = process.argv.slice(2);

    // Check for debug flag
    const debugFlag = args.includes('--debug') || args.includes('-d');
    const filteredArgs = args.filter(arg => arg !== '--debug' && arg !== '-d');

    // Get system name (required for all operations)
    const system = filteredArgs[0];
    if (!system) {
      throw new Error(`System name is required for ${(this.constructor as typeof BaseScript).operationName} (e.g., "itop", "ldap", "servicenow")`);
    }

    // Parse remaining arguments
    const remainingArgs = filteredArgs.slice(1);
    const uid = remainingArgs[0];
    const name = remainingArgs[1];
    const attributes: Record<string, string> = {};

    // Parse attribute=value pairs
    const attributeArgs = remainingArgs.slice(2);
    for (const arg of attributeArgs) {
      if (arg?.includes('=')) {
        const [key, value] = arg.split('=', 2);
        if (key !== undefined && value !== undefined) {
          attributes[key] = value;
        }
      }
    }

    return {
      system,
      debug: debugFlag,
      uid,
      name,
      attributes
    };
  }


  /**
   * Abstract method that each operation script must implement
   */
  protected abstract performOperation(connector: IConnector): Promise<void>;


}