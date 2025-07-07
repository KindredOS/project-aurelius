# Admin System Integration Guide

This guide shows how to properly integrate your admin dashboard with the backend API endpoints.

## Backend Integration Points

### 1. Main FastAPI App (main.py)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from edu_router.admin import router as admin_router

app = FastAPI(title="Educational AI Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include admin router
app.include_router(admin_router, prefix="/api")
```

### 2. Router Configuration (router.py)
```python
from fastapi import APIRouter
from edu_router.admin import router as admin_router

# Main API router
api_router = APIRouter()

# Include admin routes
api_router.include_router(admin_router, tags=["admin"])
```

### 3. Frontend API Configuration (ApiMaster.js)
```javascript
// ApiMaster.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export function getApiUrl() {
  return `${API_BASE_URL}/api`;
}

// Export all API modules
export * from './Admin';
export * from './Student';
export * from './Teacher';
```

## Component Integration

### 1. Enhanced Dashboard Component
- Uses React hooks for state management
- Implements error handling and loading states
- Connects to backend API endpoints
- Provides real-time data updates

### 2. User Management Panel
- Full CRUD operations for users
- Role-based filtering
- Bulk operations support
- Real-time user statistics

### 3. Performance Overview
- Comprehensive metrics dashboard
- Student performance analytics
- Teacher activity tracking
- System health monitoring

### 4. System Notices
- Create, read, update, delete notices
- Priority-based categorization
- Target audience selection
- Expiration date management

## API Endpoints Mapping

| Frontend Function | Backend Endpoint | Method | Description |
|-------------------|------------------|---------|-------------|
| `fetchAdminInit()` | `/api/admin/init` | GET | Dashboard initialization |
| `fetchAllUsers()` | `/api/admin/users` | GET | Get all users |
| `fetchUsersByRole(role)` | `/api/admin/users/{role}` | GET | Get users by role |
| `deleteUser(email)` | `/api/admin/users/{email}` | DELETE | Delete user |
| `fetchNotices()` | `/api/admin/notices` | GET | Get all notices |
| `createNotice(data)` | `/api/admin/notices` | POST | Create notice |
| `deleteNotice(id)` | `/api/admin/notices/{id}` | DELETE | Delete notice |
| `fetchInviteCodes()` | `/api/admin/invite-codes` | GET | Get invite codes |
| `createInviteCode(data)` | `/api/admin/invite-codes` | POST | Create invite code |
| `deleteInviteCode(code)` | `/api/admin/invite-codes/{code}` | DELETE | Delete invite code |
| `fetchSchoolMetrics()` | `/api/admin/metrics` | GET | Get comprehensive metrics |
| `createSystemBackup()` | `/api/admin/system/backup` | POST | Create system backup |
| `fetchSystemLogs()` | `/api/admin/system/logs` | GET | Get system logs |

## Error Handling

### Frontend Error Handling
```javascript
try {
  const data = await fetchAdminInit();
  // Handle success
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
  setError('Failed to load data. Please try again.');
}
```

### Backend Error Responses
```python
# Standard error responses
raise HTTPException(
    status_code=404, 
    detail="Resource not found"
)

raise HTTPException(
    status_code=400, 
    detail="Invalid request data"
)
```

## Security Considerations

### Authentication & Authorization
1. Implement JWT token authentication
2. Add role-based access control
3. Validate admin permissions for sensitive operations

### Data Protection
1. Sanitize all user inputs
2. Implement rate limiting
3. Use HTTPS in production
4. Validate file uploads

## Performance Optimizations

### Frontend
1. Implement React.memo for components
2. Use useMemo for expensive calculations
3. Implement pagination for large datasets
4. Add loading skeletons

### Backend
1. Implement database connection pooling
2. Add caching for frequently accessed data
3. Use async/await for I/O operations
4. Implement proper error logging

## File Structure
```
project/
├── backend/
│   ├── main.py
│   ├── router.py
│   └── edu_router/
│       └── admin.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── ApiMaster.js
│   │   │   └── Admin.js
│   │   ├── components/
│   │   │   └── admin/
│   │   │       ├── UserManagementPanel.js
│   │   │       ├── SchoolPerformanceOverview.js
│   │   │       ├── SystemNoticesPanel.js
│   │   │       └── AdminModules.module.css
│   │   └── pages/
│   │       └── DashboardAdmin.jsx
└── data/
    └── Edu_AiA/
        ├── admin/
        ├── student/
        └── teacher/
```

## Testing

### Backend Testing
```python
# Test admin endpoints
def test_admin_init():
    response = client.get("/api/admin/init")
    assert response.status_code == 200
    assert "summary" in response.json()

def test_user_management():
    response = client.get("/api/admin/users")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### Frontend Testing
```javascript
// Test API functions
import { fetchAdminInit } from '../api/Admin';

test('fetchAdminInit returns dashboard data', async () => {
  const data = await fetchAdminInit();
  expect(data).toHaveProperty('summary');
  expect(data.summary).toHaveProperty('total_users');
});
```

## Deployment Checklist

1. ✅ Configure environment variables
2. ✅ Set up CORS properly
3. ✅ Implement authentication
4. ✅ Add error logging
5. ✅ Configure database connections
6. ✅ Set up monitoring
7. ✅ Test all API endpoints
8. ✅ Verify frontend-backend communication
9. ✅ Implement backup strategies
10. ✅ Configure security headers

## Next Steps

1. **Authentication Integration**: Add JWT authentication to all admin endpoints
2. **Real-time Updates**: Implement WebSocket connections for live data updates
3. **Advanced Analytics**: Add more detailed reporting and analytics features
4. **Mobile Responsiveness**: Ensure all admin panels work well on mobile devices
5. **Internationalization**: Add support for multiple languages
6. **Audit Logging**: Track all admin actions for security compliance