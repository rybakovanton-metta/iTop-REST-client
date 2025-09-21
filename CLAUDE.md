# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an iTop REST API client written in TypeScript, designed as integration scripts for MidPoint CMD connector. It provides CRUD operations for Person objects in iTop via REST API, with scripts that can be called by MidPoint's CMD connector for identity management automation.

## Architecture

The codebase follows a modular architecture:

- **Core API Client** (`src/itop-client.ts`): Main API client with typed methods for iTop REST operations
- **Configuration** (`src/config.ts`): Centralized configuration including API credentials and endpoints
- **Type Definitions** (`src/types.ts`): TypeScript interfaces for API requests/responses and Person data
- **CMD Utilities** (`src/cmd-utils.ts`): Utilities for parsing command-line arguments and formatting output for CMD connector
- **Operation Scripts** (`src/{test,create,search,update,delete}.ts`): Individual scripts for each CRUD operation

## Commands

### Build and Test
```bash
# Install dependencies (if needed)
npm install

# Test connection to iTop API
npm run test

# Lint TypeScript files
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Build TypeScript to JavaScript
npm run build  # Uses tsc to compile src/ to dist/
```

### Development Operations
```bash
# Run operations directly with ts-node
npm run test
npm run create "123" "Doe" "first_name=John" "email=john@example.com" 
npm run search "123"
npm run update "123" "Doe" "email=newemail@example.com"
npm run delete "123"
```

Note: The package.json only defines the test script; other operations would need to be run via `ts-node src/{operation}.ts` directly.

## Configuration Requirements

**Security Note**: Credentials are stored in `.creds/config.json` which is excluded from version control.

### Initial Setup
1. Copy the example configuration: `cp doc/config-example.json .creds/config.json`
2. Edit `.creds/config.json` with your iTop server details:
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

This client is designed to work with MidPoint's CMD connector. Each operation script:
1. Parses command-line arguments in CMD connector format (`uid name attr1=value1 attr2=value2`)
2. Calls the appropriate iTop API method
3. Outputs results in CMD connector format (`__UID__:id`, `__NAME__:name`, `attr:value`)

The scripts expect to be called via shell wrappers (referenced in INSTALL.md) that handle the Node.js execution.

## API Client Features

The `ITopApiClient` class provides:
- Connection testing (`testConnection()`)
- Person CRUD operations with proper error handling
- Typed interfaces for all API interactions
- 30-second timeout for API calls
- Form-data based API requests matching iTop REST requirements
- SSL certificate handling (accepts self-signed certificates)
- Token-based and username/password authentication
- Debug logging for troubleshooting API calls

## Error Handling

All operations include proper error handling and exit codes for CMD connector compatibility:
- Success: exit code 0
- Failure: exit code 1 with error message to stderr