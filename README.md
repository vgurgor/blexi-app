# BLEXI - Apart Management System

A comprehensive dormitory and apartment management system built with Next.js, React, and TypeScript. The application includes features for managing buildings, rooms, students, registrations, financial transactions, and more.

## Features

- **Dashboard**: Overview of properties, residents, and financial status
- **Property Management**: Manage apartments, rooms, and beds with inventory tracking
- **Student Registration**: Complete registration wizard with accommodation booking
- **Financial Management**: Handle invoices, payments, discounts, and tax types
- **Authorization System**: Role-based access control with user management
- **Responsive UI**: Dark/light theme support with modern design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS
- **Authentication**: JWT with custom auth implementation
- **UI Components**: Custom UI library with Tailwind

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/vgurgor/blexi-app.git
cd blexi-app

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

### Linting

```bash
# Run linter
npm run lint
```

## Application Structure

- `/app`: Next.js App Router pages and layouts
- `/components`: Reusable React components
- `/context`: React context providers (Theme, Toast, ReactQuery)
- `/hooks`: Custom React hooks including API query hooks
- `/lib`: Utilities and API integration functions
- `/store`: Zustand state management stores
- `/styles`: Global CSS and Tailwind configuration
- `/types`: TypeScript type definitions
- `/utils`: Helper functions, validators, and formatters

## Key Modules

- **Apartments**: Manage properties and buildings
- **Rooms/Beds**: Track room types, bed assignments, and features
- **Students**: Student profiles and registration management
- **Finance**: Invoicing, payment processing, and financial reporting
- **Inventory**: Track property and room inventory items
- **Settings**: System configuration and user management

## License

Proprietary - All rights reserved.

## Contributors

- Volkan Gürgör