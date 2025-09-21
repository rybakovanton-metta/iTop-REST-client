# iTop REST API Client for MidPoint

A TypeScript-based REST API client for iTop ITSM, designed for integration with MidPoint CMD connector for identity management automation.

## Features

- 🔒 **Secure Configuration**: Credentials stored outside version control
- 🛡️ **SSL Support**: Handles self-signed certificates automatically  
- 🔑 **Flexible Authentication**: Token-based or username/password
- 📝 **Full CRUD Operations**: Create, Read, Update, Delete Person objects
- 🔍 **Debug Logging**: Built-in request/response debugging
- ⚡ **CMD Connector Ready**: Direct integration with MidPoint
- 📊 **TypeScript**: Fully typed for better development experience

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Credentials
```bash
# Copy configuration template
cp doc/config-example.json .creds/config.json

# Edit with your iTop server details
nano .creds/config.json
```

### 3. Test Connection
```bash
npm run test
```

### 4. Build for Production
```bash
npm run build
```

## Configuration

Create `.creds/config.json` with your iTop server details:

```json
{
  "baseUrl": "https://your-itop-server.com/webservices/rest.php",
  "auth_token": "your_auth_token_here",
  "apiVersion": "1.3"
}
```

### Authentication Options

**Option 1: Token Authentication (Recommended)**
```json
{
  "baseUrl": "https://itop.example.com/webservices/rest.php",
  "auth_token": "your_api_token",
  "apiVersion": "1.3"
}
```

**Option 2: Username/Password Authentication**
```json
{
  "baseUrl": "https://itop.example.com/webservices/rest.php", 
  "username": "api_user",
  "password": "api_password",
  "apiVersion": "1.3"
}
```

## Usage

### Development Mode
```bash
# Test connection
npm run test

# Search operations (using ts-node)
ts-node src/search.ts "123"           # Search by ID
ts-node src/search.ts "John Doe"      # Search by name
ts-node src/search.ts                 # List all persons

# CRUD operations
ts-node src/create.ts "123" "Doe" "first_name=John" "email=john@example.com"
ts-node src/update.ts "123" "Doe" "email=newemail@example.com"
ts-node src/delete.ts "123"
```

### Production Mode (Compiled)
```bash
# Build first
npm run build

# Run compiled JavaScript
node dist/test.js
node dist/search.js "123"
node dist/create.js "123" "Doe" "first_name=John" "email=john@example.com"
```

### MidPoint CMD Connector Integration

The client outputs data in CMD connector format:
```
__UID__:123
__NAME__:John Doe
first_name:John
email:john.doe@example.com
phone:+1234567890
```

## API Client Features

The `ITopApiClient` class provides:

- **Connection Testing**: `testConnection()`
- **Person CRUD Operations**: Full create, read, update, delete support
- **Search Capabilities**: By ID, name, or custom queries
- **Error Handling**: Comprehensive error handling with proper exit codes
- **SSL Certificate Support**: Automatically handles self-signed certificates
- **Timeout Protection**: 30-second timeout for all API calls
- **Debug Logging**: Detailed request/response logging for troubleshooting

## Project Structure

```
├── src/
│   ├── config.ts          # Configuration loader
│   ├── types.ts           # TypeScript interfaces
│   ├── itop-client.ts     # Main API client
│   ├── cmd-utils.ts       # CMD connector utilities
│   ├── test.ts            # Connection test script
│   ├── create.ts          # Create person script
│   ├── search.ts          # Search persons script
│   ├── update.ts          # Update person script
│   └── delete.ts          # Delete person script
├── .creds/
│   └── config.json        # Secure credentials (not in Git)
├── doc/
│   └── config-example.json # Configuration template
├── dist/                  # Compiled JavaScript
└── README.md
```

## Security

- ✅ Credentials stored in `.creds/config.json` (excluded from Git)
- ✅ Self-signed SSL certificates supported
- ✅ Token-based authentication preferred
- ✅ Proper file permissions recommended (`chmod 600 .creds/config.json`)

## Development

### Available Scripts

```bash
npm run build        # Compile TypeScript to JavaScript
npm run test         # Test iTop connection
npm run lint         # Lint TypeScript files
npm run lint:fix     # Lint and auto-fix issues
```

### Adding New Operations

1. Create new script in `src/` directory
2. Import `ITopApiClient` and `CmdUtils`
3. Follow existing patterns for argument parsing and output formatting
4. Build and test with `npm run build && node dist/your-script.js`

## Troubleshooting

### Common Issues

**404 Error**: Check your `baseUrl` in `.creds/config.json`
```bash
# Verify iTop REST endpoint exists
curl -k 'https://your-server/webservices/rest.php?version=1.3'
```

**SSL Certificate Error**: Client handles self-signed certificates automatically, but verify your server URL.

**Authentication Error**: Verify your token or username/password in `.creds/config.json`

### Debug Mode

The client includes built-in debug logging that shows:
- Complete request URL
- Request payload
- Authentication method used

This helps troubleshoot API call issues.

## Requirements

- **Node.js**: 18+ 
- **iTop**: Version with REST API support
- **iTop User**: Must have "REST Services User" profile
- **Network**: HTTPS access to iTop server

## License

ISC

## Support

For MidPoint integration questions, consult the MidPoint CMD connector documentation.
For iTop API questions, refer to the [iTop REST API documentation](https://www.itophub.io/wiki/page?id=latest%3Aadvancedtopics%3Arest_json).