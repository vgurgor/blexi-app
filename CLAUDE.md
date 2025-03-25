# BLEXI APP DEVELOPMENT GUIDE

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Run production build
- `npm run lint` - Run linter

## Testing
- No testing commands found in package.json (consider adding Jest or React Testing Library)

## Code Style Guidelines
- **TypeScript**: Use strict typing throughout the application
- **Components**: Use functional components with TypeScript interfaces for props
- **Naming**: 
  - PascalCase for components and interfaces
  - camelCase for functions, methods, and variables
- **Formatting**: Follow Next.js conventions with proper indentation
- **CSS**: Use Tailwind CSS classes with custom animations when needed
- **Imports**: Group imports by external libraries, then internal components/utilities
- **Error Handling**: Use try/catch for async operations with proper user feedback
- **Folder Structure**: Follow Next.js App Router conventions for pages and routes

When editing, maintain consistent style with the surrounding code.