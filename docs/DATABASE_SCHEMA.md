# Database Schema Documentation

## Overview
The application uses Supabase (PostgreSQL) as the primary database with Row Level Security (RLS) policies for data protection.

## Core Tables

### profiles
User profile information and metadata.

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
- Users can read/update their own profile
- Public read access for organization member lookups

### organizations
Organization/team management.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
- Organization owners can read/update their organizations
- Members can read organization details

### organization_members
Team membership management.

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  UNIQUE(organization_id, user_id)
);
```

**RLS Policies:**
- Organization owners can manage all memberships
- Members can read their own membership status

### studios
AI training studios and projects.

```sql
CREATE TABLE studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  images_path TEXT, -- R2 storage path
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'training', 'completed', 'failed')),
  plan_type TEXT NOT NULL,
  context TEXT DEFAULT 'personal' CHECK (context IN ('personal', 'organization')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
- Users can manage their personal studios
- Organization members can access organization studios

### credits
Credit management and transactions.

```sql
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('purchase', 'usage', 'refund')),
  description TEXT,
  studio_id UUID REFERENCES studios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
- Users can read their personal credit history
- Organization members can read organization credits

## Database Extensions

### Required Extensions
```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Additional extensions for future features
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Text similarity
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Indexing
```

## Indexes

### Performance Indexes
```sql
-- User lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Organization queries
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);

-- Studio queries
CREATE INDEX idx_studios_user_id ON studios(user_id);
CREATE INDEX idx_studios_organization_id ON studios(organization_id);
CREATE INDEX idx_studios_status ON studios(status);

-- Credit queries
CREATE INDEX idx_credits_user_id ON credits(user_id);
CREATE INDEX idx_credits_organization_id ON credits(organization_id);
```

## Row Level Security (RLS)

### Security Principles
1. **User Isolation**: Users can only access their own data
2. **Organization Access**: Members can access shared organization data
3. **Owner Privileges**: Organization owners have full control
4. **Public Safety**: No sensitive data exposed publicly

### Policy Examples

#### Profiles RLS
```sql
-- Users can read/update their own profile
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- Public read for organization lookups
CREATE POLICY "Public read access" ON profiles
  FOR SELECT USING (true);
```

#### Organizations RLS
```sql
-- Owners can manage their organizations
CREATE POLICY "Owners can manage organizations" ON organizations
  FOR ALL USING (auth.uid() = owner_id);

-- Members can read organization details
CREATE POLICY "Members can read organizations" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );
```

## Data Relationships

### User Context Flow
```
auth.users (Supabase Auth)
    ↓
profiles (user metadata)
    ↓
studios (personal projects)
    ↓
credits (personal credits)

auth.users
    ↓
organizations (owned organizations)
    ↓
organization_members (team members)
    ↓
studios (organization projects)
    ↓
credits (organization credits)
```

### File Storage Integration
- **R2 Storage Path**: `user_id/studio_uuid/`
- **Database Reference**: `studios.images_path`
- **Focus Data**: JSON files stored alongside images
- **Access Control**: Database permissions control file access

## Migration Strategy

### Version Control
- Migrations stored in `supabase/migrations/`
- Timestamp-based naming convention
- Incremental schema updates
- Rollback capabilities

### Migration Files
```
20250101000000_setup_extensions_and_enums.sql
20250101000100_create_profiles_table.sql
20250101000101_profiles_rls_policies.sql
20250101000200_create_organizations_table.sql
...
```

## Backup and Recovery

### Automated Backups
- Daily automated backups via Supabase
- Point-in-time recovery available
- Cross-region replication for disaster recovery

### Data Export
- Regular exports of critical business data
- JSON format for easy restoration
- Encrypted storage of backup files

## Performance Considerations

### Query Optimization
- Proper indexing on frequently queried columns
- RLS policies optimized for performance
- Connection pooling for high concurrency

### Scaling Strategies
- Read replicas for heavy read workloads
- Partitioning for large tables (future)
- Caching layer for frequently accessed data
