# PSSE Admin Authentication & Event Management Implementation

## Overview

This document details the implementation of JWT-based authentication for the admin panel and the integration of comprehensive event management features including image upload functionality using Cloudinary. This implementation enables secure admin access, proper authentication flows, and a complete event creation workflow with file uploads.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | Frontend UI library |
| TypeScript | 5.9.3 | Type safety |
| React Hook Form | 7.68.0 | Form state management |
| Zod | 4.1.13 | Schema validation |
| @hookform/resolvers | 5.2.2 | Zod resolver for React Hook Form |
| Sonner | 2.0.7 | Toast notifications |
| Axios | 1.13.2 | HTTP client |
| NestJS | 11.x | Backend framework |
| Cloudinary | - | Image hosting service |

---

## Project Structure

### Backend Changes

```
psse-backend/src/
├── auth/
│   ├── auth.controller.ts       # JWT authentication endpoints
│   ├── auth.service.ts          # Authentication business logic
│   ├── guards/
│   │   ├── jwt-auth.guard.ts    # JWT validation guard
│   │   └── roles.guard.ts       # Role-based authorization
│   ├── strategies/
│   │   └── jwt.strategy.ts      # Passport JWT strategy
│   └── decorators/
│       └── current-user.decorator.ts
├── cloudinary/
│   ├── cloudinary.service.ts    # Image upload service
│   ├── cloudinary.provider.ts   # Cloudinary configuration
│   └── cloudinary.module.ts     # Cloudinary module
├── events/
│   ├── events.module.ts         # Updated with AuthModule import
│   ├── dto/
│   │   └── create-event.dto.ts  # Fixed duplicate imageUrl field
│   └── ...
├── officers/
│   └── officers.module.ts       # Updated with AuthModule import
├── orders/
│   └── orders.module.ts         # Updated with AuthModule import
└── products/
    └── products.module.ts       # Updated with AuthModule import
```

### Frontend Changes

```
psse-react/src/
├── components/
│   ├── common/
│   │   └── ProtectedRoute.tsx   # Route protection component
│   └── features/
│       └── CreateEventModal.tsx # New: Event creation modal
├── lib/
│   └── axios.ts                 # Enhanced with error handling
├── pages/
│   └── admin/
│       ├── Login.tsx            # Fixed access_token field
│       └── Dashboard.tsx        # Enhanced error handling
└── types/
    └── api.types.ts             # Fixed AuthResponse interface
```

---

## Implementation Details

### 1. Authentication Flow

#### Login Process

**Frontend (`Login.tsx`):**
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);

  try {
    const response = await authApi.login(email, password);
    localStorage.setItem('access_token', response.access_token);
    navigate('/admin/dashboard');
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};
```

**Key Changes:**
- Fixed field name from `accessToken` to `access_token` to match backend response
- Added proper error handling
- Stores JWT token in localStorage

#### JWT Token Management

**Axios Interceptor (`axios.ts`):**
```typescript
// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    if (token && token !== 'undefined') {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Key Features:**
- Automatically attaches JWT token to all API requests
- Validates token exists and is not 'undefined'
- Ensures headers object exists before setting Authorization

#### Error Handling & Auto-Redirect

**Response Interceptor (`axios.ts`):**
```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from backend API response
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      'An unexpected error occurred';
    
    // Show error toast
    toast.error(errorMessage);
    
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      console.error('401 Unauthorized error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: errorMessage,
        hasAuthHeader: !!error.config?.headers?.Authorization,
      });
      localStorage.removeItem('access_token');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);
```

**Key Features:**
- Extracts error messages from backend responses
- Displays user-friendly toast notifications using Sonner
- Automatically handles 401 Unauthorized errors
- Clears invalid tokens and redirects to login page
- Logs detailed error information for debugging

---

### 2. Toast Notifications

#### Installation & Setup

**Dependencies Added:**
```json
{
  "dependencies": {
    "sonner": "^2.0.7"
  }
}
```

**App Integration (`App.tsx`):**
```typescript
import { Toaster } from 'sonner';

function App() {
  return (
    <OrderProvider>
      <Toaster position="top-right" richColors />
      <Router>
        {/* Routes */}
      </Router>
    </OrderProvider>
  );
}
```

**Usage Examples:**
- Success: `toast.success('Event created successfully!')`
- Error: `toast.error(errorMessage)`
- Info: `toast.info('Processing...')`
- Warning: `toast.warning('Please verify your input')`

---

### 3. Event Management with Image Upload

#### Form Validation with Zod

**Schema Definition (`CreateEventModal.tsx`):**
```typescript
const createEventSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters'),
  image: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'Image is required')
    .refine((files) => {
      const file = files[0];
      return file && file.size <= 5 * 1024 * 1024; // 5MB max
    }, 'Image must be less than 5MB')
    .refine((files) => {
      const file = files[0];
      return file && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    }, 'Only JPEG, PNG, and WebP images are allowed'),
});
```

**Validation Features:**
- Required field validation
- String length constraints
- File type validation (JPEG, PNG, WebP only)
- File size limit (5MB maximum)
- Custom error messages

#### React Hook Form Integration

**Form Setup:**
```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
  reset,
} = useForm<CreateEventFormData>({
  resolver: zodResolver(createEventSchema),
});
```

**Benefits:**
- Type-safe form data
- Automatic validation
- Error message display
- Form reset functionality

#### Image Preview

**Preview Implementation:**
```typescript
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  } else {
    setImagePreview(null);
  }
};
```

**Features:**
- Real-time image preview
- Base64 encoding for display
- Cleanup on file removal

#### Form Submission with File Upload

**Submit Handler:**
```typescript
const onSubmit = async (data: CreateEventFormData) => {
  try {
    setIsSubmitting(true);

    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('date', data.date);
    formData.append('location', data.location);
    
    // Append the image file
    const imageFile = data.image[0];
    formData.append('image', imageFile);

    // Send FormData to backend with multipart/form-data
    const response = await axiosInstance.post<ApiEvent>('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Event created successfully!');
    
    if (onSuccess) {
      onSuccess(response.data);
    }

    reset();
    setImagePreview(null);
    onClose();
  } catch (error: any) {
    console.error('Error creating event:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

**Key Features:**
- FormData for multipart file uploads
- Proper content-type headers
- Success callback for parent component refresh
- Form reset after successful submission
- Loading state management

---

### 4. Backend Module Configuration

#### AuthModule Integration

**Problem Solved:**
All resource modules needed to import AuthModule to enable JWT authentication guards.

**Modules Updated:**
1. **EventsModule** (`events.module.ts`)
2. **OfficersModule** (`officers.module.ts`)
3. **OrdersModule** (`orders.module.ts`)
4. **ProductsModule** (`products.module.ts`)

**Implementation Pattern:**
```typescript
import { AuthModule } from '../auth';

@Module({
  imports: [PrismaModule, CloudinaryModule, AuthModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
```

**Why This Is Needed:**
- Enables `@UseGuards(JwtAuthGuard)` decorator usage
- Provides JWT strategy for Passport
- Allows role-based authorization with `RolesGuard`
- Ensures proper token validation across all protected endpoints

#### DTO Validation Fix

**CreateEventDto (`create-event.dto.ts`):**

**Issue:**
- Duplicate `imageUrl` field definition
- One marked as required, one as optional

**Fix:**
```typescript
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;  // Single required field

  @IsBoolean()
  @IsOptional()
  isUpcoming?: boolean;
}
```

---

### 5. Cloudinary Service Enhancement

#### Error Handling Improvement

**Previous Implementation:**
```typescript
(error, result) => {
  if (error) {
    reject(error);
  } else {
    resolve(result);
  }
}
```

**Enhanced Implementation:**
```typescript
(error, result) => {
  if (error) {
    reject(error);
  } else if (result) {
    resolve(result);
  } else {
    reject(new Error('Upload failed: No result returned'));
  }
}
```

**Improvement:**
- Handles edge case where upload completes without error but returns no result
- Provides clear error message for debugging
- Prevents undefined result resolution

---

### 6. Type System Refinements

#### AuthResponse Type

**Fixed Type (`api.types.ts`):**
```typescript
export interface AuthResponse {
  access_token: string;  // Changed from accessToken
}
```

**Reason:**
- Matches NestJS JWT module default response format
- Aligns with backend implementation
- Prevents runtime errors from field mismatch

---

## Security Considerations

### 1. JWT Token Storage
- **Current:** localStorage
- **Security Note:** Vulnerable to XSS attacks
- **Recommendation:** Consider httpOnly cookies for production

### 2. Token Validation
- JWT tokens validated on every protected route
- Expired tokens automatically cleared
- User redirected to login on authentication failure

### 3. File Upload Security
- File type validation (frontend & backend)
- File size limits (5MB frontend, configurable backend)
- Cloudinary handles file sanitization and storage

### 4. Protected Routes
- Admin routes wrapped in `ProtectedRoute` component
- JWT guard on backend controllers
- Role-based access control ready (ADMIN role)

---

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://..."

# JWT Configuration
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="24h"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Frontend (.env)
```bash
VITE_API_URL="http://localhost:3000"
```

---

## API Endpoints

### Authentication
- **POST** `/auth/login` - Admin login with email/password
  - Request: `{ email: string, password: string }`
  - Response: `{ access_token: string }`

### Events (Protected)
- **GET** `/events` - Get all events
- **GET** `/events/:id` - Get single event
- **POST** `/events` - Create event (multipart/form-data)
  - Requires: JWT token
  - Accepts: FormData with image file
- **PATCH** `/events/:id` - Update event
- **DELETE** `/events/:id` - Delete event

---

## Dependencies Added

### Frontend
```json
{
  "@hookform/resolvers": "^5.2.2",
  "react-hook-form": "^7.68.0",
  "sonner": "^2.0.7",
  "zod": "^4.1.13"
}
```

### Purpose
- **react-hook-form:** Efficient form state management
- **@hookform/resolvers:** Zod integration for RHF
- **zod:** Type-safe schema validation
- **sonner:** Beautiful toast notifications

---

## User Experience Improvements

### 1. Real-time Feedback
- Loading states during API calls
- Toast notifications for all actions
- Image preview before upload
- Form validation messages

### 2. Error Handling
- User-friendly error messages
- Automatic retry prompts
- Clear validation feedback
- Network error handling

### 3. Admin Dashboard
- Seamless event creation flow
- Automatic list refresh after operations
- Confirmation dialogs for destructive actions
- Responsive modal design

---

## Testing Checklist

### Authentication
- [ ] Admin login with valid credentials
- [ ] Admin login with invalid credentials
- [ ] JWT token persistence across page refreshes
- [ ] Auto-redirect on token expiration
- [ ] Logout functionality

### Event Creation
- [ ] Form validation for all fields
- [ ] Image file type validation
- [ ] Image file size validation
- [ ] Image preview functionality
- [ ] Successful event creation
- [ ] Error handling on upload failure

### Protected Routes
- [ ] Unauthenticated access redirects to login
- [ ] Authenticated access allows dashboard access
- [ ] Token included in all API requests
- [ ] 401 errors trigger re-authentication

---

## Future Enhancements

### Short-term
1. Implement event editing functionality
2. Add image cropping/resizing before upload
3. Batch event operations
4. Event search and filtering

### Long-term
1. Implement refresh tokens
2. Add OAuth2 authentication (Google, Microsoft)
3. Role-based permissions granularity
4. Audit logging for admin actions
5. WebSocket real-time updates

---

## Troubleshooting

### Common Issues

#### 1. 401 Unauthorized Errors
**Symptoms:** Continuous redirects to login page

**Solutions:**
- Check JWT_SECRET matches between env files
- Verify token format in localStorage
- Check token expiration time
- Ensure AuthModule imported in resource modules

#### 2. Image Upload Failures
**Symptoms:** "Upload failed: No result returned"

**Solutions:**
- Verify Cloudinary credentials in .env
- Check file size and type constraints
- Ensure network connectivity
- Review Cloudinary dashboard for errors

#### 3. Form Validation Not Working
**Symptoms:** Form submits with invalid data

**Solutions:**
- Verify Zod schema is correctly defined
- Check zodResolver is properly configured
- Ensure React Hook Form version compatibility
- Review error messages in console

---

## Related Documentation

- [Backend Implementation Documentation](./backend-implementation-documentation.md)
- [Backend Setup Documentation](./backend-setup-documentation.md)
- [Migration Documentation](./migration-documentation.md)

---

## Changelog

### December 6, 2025
- ✅ Implemented JWT authentication flow
- ✅ Fixed AuthResponse type to use `access_token`
- ✅ Enhanced Axios interceptors with error handling
- ✅ Added Sonner toast notifications
- ✅ Created CreateEventModal with file upload
- ✅ Integrated React Hook Form with Zod validation
- ✅ Fixed AuthModule imports in all resource modules
- ✅ Resolved CreateEventDto duplicate field issue
- ✅ Enhanced Cloudinary service error handling
- ✅ Implemented automatic redirect on 401 errors

---

## License

This project is part of the PSSE Website and follows the organization's licensing terms.
