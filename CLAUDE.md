# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
# principles
never use commands to evade lint errors and warnings.

## Project Overview

This is an iTop REST API client written in TypeScript, designed as integration scripts for MidPoint CMD connector. It provides CRUD operations for Person objects in iTop via REST API, with scripts that can be called by MidPoint's CMD connector for identity management automation.

## Architecture

The codebase follows a modular, extensible architecture with a connector pattern:

### Core Components
- **Configuration** (`src/config.ts`): Centralized configuration including API credentials and endpoints
- **Base Script** (`src/base-script.ts`): Abstract base class for all CRUD operation scripts with common functionality
- **MidPoint Integration** (`src/midpoint-integration.ts`): Handles conversion between MidPoint CMD format and CIM Person model
- **Operation Scripts** (`src/{test,create,search,update,delete}.ts`): Individual scripts for each CRUD operation
- **Error Handling** (`src/errors.ts`): Custom error classes for different error scenarios

### Interface Definitions
- **Interfaces Directory** (`src/interfaces/`): All interface and type definitions organized in dedicated directory
  - **CIM Person** (`src/interfaces/cim-person.ts`): Common Information Model (CIM) Person schema serving as intermediate format between MidPoint and target systems
  - **Connector Interface** (`src/interfaces/connector-interface.ts`): Base interface defining standard CRUD operations that all connectors must implement
  - **Type Definitions** (`src/interfaces/types.ts`): TypeScript interfaces for API requests/responses and Person data

### Connector Architecture
- **Connector Factory** (`src/connector-factory.ts`): Dynamic factory for loading connectors based on system name, enabling extensibility
- **Connectors Directory** (`src/connectors/`): System-specific connector implementations organized by system
  - **iTop Directory** (`src/connectors/itop/`): Complete iTop integration
    - **iTop Connector** (`src/connectors/itop/itop-connector.ts`): Business logic and CIM Person conversions
    - **iTop API Client** (`src/connectors/itop/itop-client.ts`): Pure HTTP transport layer for iTop REST API

## Commands

### Build and Test
```bash
# Install dependencies (if needed)
npm install

# Test connection to iTop API
npm run test

# Unit tests with Jest
npm run test:unit
npm run test:watch     # Watch mode for development
npm run test:coverage  # Generate coverage report

# Lint TypeScript files
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Build TypeScript to JavaScript
npm run build  # Uses tsc to compile src/ to dist/
```

### Development Operations
```bash
# Test connection to iTop API
npm run test

# Other operations must be run directly with ts-node:
ts-node src/create.ts "123" "Doe" "first_name=John" "email=john@example.com" 
ts-node src/search.ts "123"
ts-node src/update.ts "123" "Doe" "email=newemail@example.com"
ts-node src/delete.ts "123"
```

Note: Only the `test` script is defined in package.json for connection testing. CRUD operations must be executed directly with ts-node.

## Configuration Requirements

**Security Note**: Credentials are stored in `.creds/config.json` which is excluded from version control.

### Initial Setup
1. Create the credentials directory: `mkdir -p .creds`
2. Copy the example configuration: `cp doc/config-example.json .creds/config.json`
3. Edit `.creds/config.json` with your iTop server details:
   - `baseUrl`: Your iTop server REST endpoint (e.g., `https://itop-server.com/webservices/rest.php`)
   - `auth_token`: iTop API token (preferred method)
   - `username`: iTop API user (alternative to token, requires "REST Services User" profile)
   - `password`: iTop API password (alternative to token)
   - `apiVersion`: API version (default: "1.3")

### Configuration File Structure
The `.creds/config.json` file follows this format:
```json
{
  "baseUrl": "https://your-itop-server.com/webservices/rest.php",
  "auth_token": "your_auth_token_here",
  "apiVersion": "1.3"
}
```

**Important**: The `.creds/` directory is automatically excluded from Git to protect sensitive information.

## CMD Connector Integration

This client is designed to work with MidPoint's CMD connector using a CIM Person abstraction layer:

### Data Flow
1. **Input**: CMD connector arguments (`uid name attr1=value1 attr2=value2`)
2. **Transformation**: MidPoint args → CIM Person model → Target system format
3. **Output**: CMD connector format (`__UID__:id`, `__NAME__:name`, `attr:value`)

### CIM Person Benefits
- **Standardization**: Common schema across different target systems
- **Flexibility**: Easy attribute mapping between MidPoint and target systems  
- **Extensibility**: New connectors can reuse CIM Person transformations
- **Maintainability**: Centralized attribute mapping logic

The scripts expect to be called via shell wrappers (referenced in INSTALL.md) that handle the Node.js execution.

## Architecture Principles

### Separation of Concerns
- **HTTP Transport**: Pure API communication without business logic (`ITopApiClient`)
- **Business Logic**: System-specific operations and data transformations in connectors
- **System Agnostic**: CRUD scripts work with any connector through common interface
- **Data Flow**: Connector → CIM Person → MidPoint Integration → CMD format

### API Client Features
The `ITopApiClient` class provides:
- Connection testing (`testConnection()`)
- Generic HTTP request handling (`makeRequest()`)
- 30-second timeout for API calls
- Form-data based API requests matching iTop REST requirements
- SSL certificate handling (accepts self-signed certificates)
- Token-based and username/password authentication
- Debug logging for troubleshooting API calls

## Testing

The project includes comprehensive testing:

### Unit Tests (Jest)
- **Location**: `tests/` directory
- **Coverage**: Core utilities, type definitions, and API client functionality
- **Commands**: `npm run test:unit`, `npm run test:watch`, `npm run test:coverage`
- **Reports**: Coverage reports generated in `coverage/` directory

### Integration Testing
- **Connection Test**: `npm run test` - Validates iTop API connectivity
- **Operation Testing**: Direct execution of CRUD scripts with ts-node

## Error Handling

All operations include proper error handling and exit codes for CMD connector compatibility:
- Success: exit code 0
- Failure: exit code 1 with error message to stderr

## Extensibility

The connector architecture enables easy extension to other systems:

### Adding New Connectors
1. Create system directory: `src/connectors/{system}/`
2. Implement `IConnector` interface in `src/connectors/{system}/{system}-connector.ts`
3. Create HTTP client in `src/connectors/{system}/{system}-client.ts` (if needed)
4. Use CIM Person model for standardized data transformation
5. Export default connector class following naming convention
6. Connector automatically available via `ConnectorFactory.create('{system}')`

### Available Connectors
- **iTop**: Full implementation for iTop ITSM system
- **Extensible**: Framework ready for LDAP, ServiceNow, etc.