# iTop CMD Connector - Node.js Installation Guide

## Prerequisites
- Node.js 18+ installed on MidPoint server
- npm package manager
- Access to iTop REST API

## Installation Steps

### 1. Install Node.js Dependencies
```bash
cd /opt/midpoint/scripts/itop-nodejs
npm install
```

### 2. Configure iTop Connection
**Important**: Credentials are stored securely outside of version control.

1. Create configuration directory (if not exists):
   ```bash
   mkdir -p .creds
   ```

2. Copy the example configuration:
   ```bash
   cp doc/config-example.json .creds/config.json
   ```

3. Edit `.creds/config.json` with your iTop server details:
   ```json
   {
     "baseUrl": "https://your-itop-server.com/webservices/rest.php",
     "auth_token": "your_auth_token_here",
     "apiVersion": "1.3"
   }
   ```

   **Authentication Options:**
   - **Preferred**: Use `auth_token` (iTop API token)
   - **Alternative**: Use `username` + `password` (user must have "REST Services User" profile)

4. Secure the configuration file:
   ```bash
   chmod 600 .creds/config.json
   chown midpoint:midpoint .creds/config.json
   ```

### 3. Build TypeScript
```bash
npm run build
```

### 4. Test Connection
```bash
npm run test
# or use shell wrapper:
./test.sh
```

### 5. Update MidPoint Resource Configuration
Update the CMD connector paths in your resource XML:
```xml
<connidcmd:testCmdPath>/opt/midpoint/scripts/itop-nodejs/test.sh</connidcmd:testCmdPath>
<connidcmd:createCmdPath>/opt/midpoint/scripts/itop-nodejs/create.sh</connidcmd:createCmdPath>
<connidcmd:updateCmdPath>/opt/midpoint/scripts/itop-nodejs/update.sh</connidcmd:updateCmdPath>
<connidcmd:deleteCmdPath>/opt/midpoint/scripts/itop-nodejs/delete.sh</connidcmd:deleteCmdPath>
<connidcmd:searchCmdPath>/opt/midpoint/scripts/itop-nodejs/search.sh</connidcmd:searchCmdPath>
```

## Manual Testing

### Test Connection
```bash
./test.sh
```

### Create Person
```bash
./create.sh "123" "Doe" "first_name=John" "email=john.doe@example.com" "phone=+1234567890"
```

### Search Person
```bash
./search.sh "123"  # Search by ID
./search.sh        # Get all persons
```

### Update Person
```bash
./update.sh "123" "Doe" "email=newemail@example.com" "phone=+9876543210"
```

### Delete Person
```bash
./delete.sh "123"
```

## Development

### Run in Development Mode
```bash
# Test connection
npm run test

# Create person
npm run create "123" "Doe" "first_name=John" "email=john@example.com"

# Search persons  
npm run search "123"

# Update person
npm run update "123" "Doe" "email=newemail@example.com"

# Delete person
npm run delete "123"
```

### Rebuild After Changes
```bash
npm run build
```

## Troubleshooting

### Check Node.js Version
```bash
node --version  # Should be 18+
npm --version
```

### Check Permissions
```bash
# Ensure MidPoint can execute scripts
chmod +x /opt/midpoint/scripts/itop-nodejs/*.sh
chown -R midpoint:midpoint /opt/midpoint/scripts/itop-nodejs
```

### Debug Mode
Add console.log statements in TypeScript files and run:
```bash
npm run build
npm run test  # or other commands
```

### Check iTop API Manually
```bash
# Using token authentication (preferred)
curl -X POST \
  -F 'auth_token=your_auth_token' \
  -F 'json_data={"operation":"list_operations"}' \
  'https://your-itop-server/webservices/rest.php?version=1.3'

# Using username/password authentication  
curl -X POST \
  -F 'auth_user=your_user' \
  -F 'auth_pwd=your_password' \
  -F 'json_data={"operation":"list_operations"}' \
  'https://your-itop-server/webservices/rest.php?version=1.3'

# For self-signed certificates, add:
curl -k ...
```

## Production Considerations

1. **Security**: 
   - Credentials are already stored securely in `.creds/config.json` (excluded from Git)
   - Set proper file permissions: `chmod 600 .creds/config.json`
   - Consider using dedicated service accounts for iTop API access
2. **Logging**: Add proper logging for production use
3. **Error Handling**: Enhance error handling and retry logic
4. **Performance**: Consider connection pooling for high-volume operations
5. **Monitoring**: Set up monitoring for script execution failures
6. **SSL Certificates**: Client handles self-signed certificates automatically

## File Structure
```
/opt/midpoint/scripts/itop-nodejs/
├── package.json
├── tsconfig.json
├── .gitignore
├── src/
│   ├── config.ts          # Loads from .creds/config.json
│   ├── types.ts
│   ├── itop-client.ts     # Main API client with SSL support
│   ├── cmd-utils.ts
│   ├── test.ts
│   ├── create.ts
│   ├── update.ts
│   ├── search.ts
│   └── delete.ts
├── .creds/
│   └── config.json        # Secure credentials (not in Git)
├── doc/
│   └── config-example.json # Configuration template
├── dist/                  # Compiled JavaScript (auto-generated)
├── node_modules/          # Dependencies (auto-generated)
├── test.sh                # Shell wrappers for CMD connector
├── create.sh
├── update.sh
├── search.sh
├── delete.sh
├── README.md
├── INSTALL.md
└── CLAUDE.md
```