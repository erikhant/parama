# Demo Production - Form Builder Package Testing

This project tests the Parama Form Builder packages **as if they were installed from npm**. It uses the compiled packages from the `dist/` folders instead of the source code, simulating a real-world usage scenario.

## Purpose

- ✅ **Validate published packages**: Ensure the built packages work correctly
- ✅ **Test import paths**: Verify all imports resolve properly
- ✅ **Check styling**: Confirm CSS and TailwindCSS integration works
- ✅ **Simulate npm installation**: Use dist builds instead of workspace source

## Architecture

This demo project uses:

### Package Structure

```
@form-builder/types      → ../../packages/types/dist/index.js
@form-builder/core       → ../../packages/core/dist/index.es.js
@form-builder/renderer   → ../../packages/renderer/dist/index.es.js
@form-builder/editor     → ../../packages/editor/dist/index.es.js
@parama-ui/react         → ../../packages/parama-ui/dist/index.es.js
@parama-ui/css           → ../../packages/parama-ui/dist/parama-ui.min.css
```

### Key Differences from Development Demo

| Aspect          | Development Demo            | Production Demo               |
| --------------- | --------------------------- | ----------------------------- |
| **Source**      | Uses `src/` files           | Uses `dist/` files            |
| **Imports**     | Direct package references   | Compiled bundle references    |
| **TypeScript**  | Source `.ts/.tsx` files     | Compiled `.d.ts` declarations |
| **CSS**         | Source styles + PostCSS     | Pre-compiled CSS bundles      |
| **Build Speed** | Slower (compilation needed) | Faster (pre-compiled)         |

## Running the Demo

### Method 1: Direct Command

```bash
cd apps/demo-production
pnpm install
pnpm run dev
```

### Method 2: Root Script

```bash
# From project root
pnpm run build              # Build all packages first
./test-production.sh        # Linux/macOS
# OR
test-production.bat         # Windows
```

## Testing Scenarios

This demo tests:

1. **Package Imports** - All form builder packages load correctly
2. **Type Definitions** - TypeScript declarations work properly
3. **CSS Styling** - Parama UI styles are applied correctly
4. **Form Functionality** - FormEditor components work as expected
5. **Build Output** - Dist files contain everything needed

## Troubleshooting

### Common Issues

**Import Errors**: Check that all packages have been built (`pnpm run build` from root)

**CSS Not Loading**: Verify `parama-ui.min.css` exists in the parama-ui dist folder

**TypeScript Errors**: Ensure `.d.ts` declaration files are generated correctly

**Runtime Errors**: Check browser console - may indicate missing dependencies in built packages

### Build Dependencies

Before running this demo, ensure all packages are built:

```bash
# From project root
pnpm run build:types
pnpm run build:core
pnpm run build:parama-ui
pnpm run build:renderer
pnpm run build:editor
```

Or simply:

```bash
pnpm run build
```

## Deployment Simulation

This project structure mimics how the packages would be used after:

1. Publishing to npm: `npm publish` for each package
2. Installing in a new project: `npm install @form-builder/editor @parama-ui/react`
3. Importing in application code: `import { FormEditor } from '@form-builder/editor'`

The aliases in `vite.config.ts` simulate the node_modules resolution that would happen in a real npm installation.

## JSON Server Integration

This demo now includes form submission functionality using JSON Server for data persistence.

### Getting Started with JSON Server

#### 1. Start JSON Server (in one terminal)

```bash
npm run json-server
```

This will start JSON Server on http://localhost:3000 and watch the `db.json` file for changes.

#### 2. Start the Development Server (in another terminal)

```bash
npm run dev
```

This will start the Vite development server on http://localhost:5002.

### Form Submission Features

- **Real-time persistence**: Form submissions are saved to `db.json`
- **RESTful API**: Access submissions via JSON Server endpoints
- **Error handling**: Proper error messages if JSON Server is not running

### API Endpoints

When JSON Server is running, you can access:

- `GET /form-submissions` - View all form submissions
- `POST /form-submissions` - Submit new form data
- `GET /form-submissions/:id` - Get specific submission
- `PUT /form-submissions/:id` - Update submission
- `DELETE /form-submissions/:id` - Delete submission

### Form Submission Structure

Each form submission is saved with the following structure:

```json
{
  "id": "timestamp",
  "formId": "production-test-form",
  "formTitle": "Production Test Form",
  "submittedAt": "2025-01-01T12:00:00.000Z",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

### Usage Instructions

1. Open http://localhost:5002 in your browser
2. Use the FormEditor to modify the form schema if needed
3. Fill out the form in the FormRenderer section
4. Click submit to save the form data to JSON Server
5. Check the `db.json` file to see the submitted data
6. View all submissions at http://localhost:3000/form-submissions
