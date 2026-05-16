# React Project Guidelines

## Feature Structure

- For every new feature, create a separate folder inside the `features` folder.
- Feature folder naming should follow lowercase kebab-case.

Example:

features/
└── user-management/
    ├── user-management.tsx
    ├── user-management.api.ts
    ├── user-management.css

## File Responsibilities

### feature-name.tsx
- Main feature component
- UI rendering logic
- Uses reusable/common components whenever possible

### feature-name.api.ts
- All API calls related to the feature
- Keep API logic separate from UI
- Use async/await
- Handle API errors properly

### feature-name.css
- Feature-specific styles only
- Avoid global styling

---

## Forms

- All Add/Edit forms should be opened inside a Modal.
- Reuse the same form component for both Add and Edit operations.
- Use controlled components for form handling.
- Add validation for required fields.

---

## Common Components

- Always prefer reusable common components before creating new UI elements.
- Use shared components for:
  - Buttons
  - Inputs
  - Tables
  - Modals
  - Dropdowns
  - Loaders

- Avoid duplicate UI implementations.

---

## Coding Standards

- Keep components small and reusable
- Use async/await instead of promise chaining