# Studio Create System - Architecture Documentation

## Overview

The Studio Create system has been completely refactored to follow modern React patterns, improve maintainability, and enhance security. This document outlines the new architecture and best practices.

## Architecture Principles

### 1. **Separation of Concerns**

- **UI Components**: Pure presentation logic
- **State Management**: Centralized in Zustand stores
- **Business Logic**: Extracted to services and utilities
- **Data Fetching**: Direct Supabase integration

### 2. **Security First**

- No sensitive data in localStorage
- Proper error boundaries
- Input validation at multiple levels
- Secure state persistence

### 3. **Performance Optimized**

- Component lazy loading
- Memoized expensive operations
- Efficient re-renders
- Optimistic updates

## Directory Structure

```
app/dashboard/studio/create/
├── page.jsx                          # Main page wrapper
└── components/
    ├── StudioCreateWizard.jsx         # Main orchestrator
    ├── StepNavigation.jsx             # Progress indicator
    ├── steps/                         # Step components
    │   ├── PlanSelectionStep.jsx
    │   ├── ImageUploadStep.jsx
    │   ├── StylePairingStep.jsx
    │   ├── AttributesStep.jsx
    │   └── ReviewStep.jsx
    └── forms/
        └── StudioFormProvider.jsx     # Form context & validation

stores/
├── studioCreateStore.js              # Dedicated studio state
└── dashboardStore.js                 # General dashboard state

services/
└── creditService.js                  # Credit operations

components/ui/
├── ErrorBoundary.jsx                 # Error handling
└── LoadingStates.jsx                 # Loading components
```

## State Management

### Studio Create Store (`studioCreateStore.js`)

**Responsibilities:**

- Form data persistence (secure)
- UI state management
- Credit information
- Organization settings
- Step navigation

**Key Features:**

- Zustand with persistence middleware
- Version-controlled migrations
- Partial persistence (only form data)
- Automatic cleanup

```javascript
// Usage example
const { formData, updateFormField, fetchCredits, nextStep, prevStep } =
  useStudioCreateStore();
```

### Dashboard Store (`dashboardStore.js`)

**Responsibilities:**

- Organization admin features
- Invitation management
- General dashboard state

**Changes Made:**

- Removed studio-related state
- Kept organization settings for compatibility
- Simplified structure

## Component Architecture

### 1. **Page Level** (`page.jsx`)

```javascript
export default function StudioCreatePage() {
  return (
    <ContentLayout title="Create AI Studio">
      <ErrorBoundary>
        <StudioFormProvider>
          <StudioCreateWizard />
        </StudioFormProvider>
      </ErrorBoundary>
    </ContentLayout>
  );
}
```

### 2. **Wizard Orchestrator** (`StudioCreateWizard.jsx`)

- Manages overall flow
- Handles context switching
- Coordinates between steps
- Error handling

### 3. **Step Components**

Each step is a focused, single-responsibility component:

- **PlanSelectionStep**: Credit-aware plan selection
- **ImageUploadStep**: File upload with validation
- **StylePairingStep**: Clothing/background combinations
- **AttributesStep**: User attribute collection
- **ReviewStep**: Final review and submission

### 4. **Form Provider** (`StudioFormProvider.jsx`)

- Centralized validation using Zod
- Step-specific validation
- Error management
- Form state coordination

## Data Flow

```
User Input → Step Component → Store Update → Validation → Next Step
     ↓
Form Provider (Validation) → Store (Persistence) → API (Submission)
```

## Security Improvements

### 1. **Data Persistence**

- **Before**: Plain text in localStorage
- **After**: Zustand persist with versioning
- **Benefits**: Secure, reliable, automatic cleanup

### 2. **Error Handling**

- **Before**: Inconsistent error states
- **After**: Error boundaries + centralized error management
- **Benefits**: Graceful failures, better UX

### 3. **Input Validation**

- **Before**: Mixed validation patterns
- **After**: Zod schemas with step-specific validation
- **Benefits**: Type safety, consistent validation

## Performance Optimizations

### 1. **Component Splitting**

- **Before**: 1,026-line monolithic component
- **After**: Focused components <200 lines each
- **Benefits**: Better tree shaking, faster rendering

### 2. **State Management**

- **Before**: Multiple state systems
- **After**: Single source of truth
- **Benefits**: Predictable updates, easier debugging

### 3. **Credit Fetching**

- **Before**: TypeScript hook with dependencies
- **After**: Direct Supabase service
- **Benefits**: Simpler, more reliable, better error handling

## Migration Guide

### From Old System

1. **Replace imports:**

```javascript
// Old
import { useCredits } from "@/hooks/useCredits";
import useDashboardStore from "@/stores/dashboardStore";

// New
import useStudioCreateStore from "@/stores/studioCreateStore";
import { fetchUserCredits } from "@/services/creditService";
```

2. **Update state usage:**

```javascript
// Old
const { currentStep, setCurrentStep } = useDashboardStore();

// New
const { currentStep, setCurrentStep } = useStudioCreateStore();
```

3. **Replace form persistence:**

```javascript
// Old
const { loadFormValues } = useFormPersistence(key, values, deps);

// New
// Automatic with Zustand persist - no manual calls needed
```

## Best Practices

### 1. **Component Design**

- Single responsibility principle
- Props interface clearly defined
- Error states handled
- Loading states included

### 2. **State Updates**

- Use store actions, not direct state mutation
- Validate before updating
- Handle errors gracefully

### 3. **Error Handling**

- Wrap components in ErrorBoundary
- Provide fallback UI
- Log errors appropriately

### 4. **Performance**

- Use React.memo for expensive components
- Debounce user inputs
- Lazy load non-critical components

## Testing Strategy

### 1. **Unit Tests**

- Store actions and reducers
- Utility functions
- Validation schemas

### 2. **Integration Tests**

- Step navigation flow
- Form submission
- Error scenarios

### 3. **E2E Tests**

- Complete studio creation flow
- Different user contexts
- Error recovery

## Monitoring & Analytics

### 1. **Error Tracking**

- ErrorBoundary integration with Sentry
- API error logging
- User action tracking

### 2. **Performance Metrics**

- Component render times
- Bundle size monitoring
- User flow completion rates

## Future Enhancements

### 1. **Planned Features**

- Real-time progress updates
- Advanced image validation
- Batch operations
- Mobile optimization

### 2. **Technical Improvements**

- Server-side validation
- Advanced caching strategies
- Progressive web app features
- Accessibility enhancements

## Troubleshooting

### Common Issues

1. **State not persisting**

   - Check Zustand persist configuration
   - Verify localStorage permissions
   - Check for version mismatches

2. **Validation errors**

   - Review Zod schemas
   - Check step-specific validation
   - Verify error state handling

3. **Credit fetching failures**
   - Check Supabase connection
   - Verify user authentication
   - Review error logs

### Debug Tools

1. **Zustand DevTools**

   - Monitor state changes
   - Time travel debugging
   - Action replay

2. **React DevTools**
   - Component tree inspection
   - Props and state debugging
   - Performance profiling

## Conclusion

The new Studio Create architecture provides:

- **Better maintainability** through separation of concerns
- **Improved security** with proper data handling
- **Enhanced performance** through optimized components
- **Better user experience** with proper error handling
- **Future-proof design** for easy feature additions

This architecture serves as a foundation for building robust, scalable React applications within the Headsshot platform.
