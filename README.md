# Checkout System - LaunchDarkly Demo App

This is a demo application showcasing LaunchDarkly feature flag integration. It demonstrates how feature flags can be used to control various aspects of a web application, from UI changes to backend functionality.

**Note:** This is a demo app for testing feature flag removal and discovery tools.

## Features

This application includes 9 feature flags controlling different aspects of the system:

### UI/Visual Flags
- **show-new-header** - Shows redesigned header vs old one
- **enable-premium-features** - Unlocks premium UI elements (badges, special styling)

### Functional Flags
- **enable-user-analytics** - Tracks user behavior and logs analytics events
- **enable-search-filter** - Adds advanced search and filtering capabilities

### Backend Flags
- **use-new-api-endpoint** - Switches between API versions (old vs new product data)
- **use-new-database-query** - Switches database query implementations

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- LaunchDarkly account (free tier works fine)

## Setup Instructions

### 1. Get Your LaunchDarkly SDK Key

1. Sign up for a free account at [LaunchDarkly](https://launchdarkly.com/)
2. Create a new project (or use an existing one)
3. Navigate to: **Account Settings > Projects > [Your Project] > Environments > [Your Environment]**
4. Copy the **SDK Key** (starts with `sdk-`)

### 2. Create Feature Flags in LaunchDarkly

Create the following boolean flags in your LaunchDarkly project:

- `show-new-header`
- `enable-premium-features`
- `enable-user-analytics`
- `enable-search-filter`
- `use-new-api-endpoint`
- `use-new-database-query`

You can set them to `true` or `false` to test different behaviors.

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your LaunchDarkly SDK key:

```
LAUNCHDARKLY_SDK_KEY=sdk-your-actual-key-here
PORT=3000
```

### 5. Run the Application

```bash
npm start
```

The server will start on `http://localhost:3000`

### 6. Open in Browser

Navigate to `http://localhost:3000` in your web browser.

## Testing

Run the test suite:

```bash
npm test
```

The tests verify that feature flags are properly integrated and working as expected.

## Project Structure

```
checkout_system/
├── server.js              # Express server with LaunchDarkly integration
├── database.js            # Database module with feature flags
├── flags.config.js        # Feature flags configuration and documentation
├── server.test.js         # Tests for feature flag functionality
├── public/
│   ├── index.html        # Frontend HTML
│   └── app.js            # Frontend JavaScript with flag integration
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Feature Flag Usage Examples

### In Database Module (database.js)
```javascript
const useNewQuery = await ldClient.variation('use-new-database-query', user, false);
if (useNewQuery) {
  // New optimized query
} else {
  // Old query
}
```

### In Frontend (app.js)
```javascript
if (flags.showNewHeader) {
  // Render new header design
}
```

## Demo Features

The application includes interactive controls to toggle flags for demonstration purposes:

- **Toggle Dark Mode** - Switch between light and dark themes
- **Toggle Header Style** - Switch between old and new header designs
- **Reload Products** - Fetch products with current flag settings
- **Search** - Test the search filter feature (when enabled)

## Flag Configuration

All feature flags are documented in `flags.config.js`, which includes:
- Flag keys and names
- Descriptions
- Default values
- Files where each flag is used

## API Endpoints

- `GET /api/products` - Get products (uses `use-new-api-endpoint`)
- `GET /api/search?q=query` - Search products (requires `enable-search-filter`)
- `GET /api/user/:id` - Get user data (uses `enable-user-analytics`)
- `GET /api/flags` - Get current flag values for frontend

## Development

The application uses:
- **Express.js** for the backend server
- **LaunchDarkly Node SDK** for server-side feature flags
- **Vanilla JavaScript** for the frontend
- **Jest & Supertest** for testing

## Notes

- This app uses in-memory storage, so data resets on restart
- The frontend polls the backend for flag values
- All flags default to `false` if not configured in LaunchDarkly
- Rate limiting and caching are simplified for demo purposes

## Troubleshooting

**Error: LaunchDarkly client error**
- Verify your SDK key is correct in `.env`
- Ensure you're using a server-side SDK key (not client-side)

**Flags not working**
- Check that flags are created in LaunchDarkly with the exact keys listed above
- Verify flags are turned on in your LaunchDarkly environment
- Check the browser console and server logs for errors

**Port already in use**
- Change the `PORT` in `.env` to a different value

## License

ISC

## Contact

This is a demo application for testing feature flag removal tools.
