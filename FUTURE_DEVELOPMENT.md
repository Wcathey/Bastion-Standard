# Future Development Ideas

This document contains concepts and ideas for future development that are not yet implemented but should be considered for future iterations of the platform.

---

## User Profile JSON Storage (Concept)

### Idea
Create a `user_profiles` table in Supabase that stores the complete user profile as a JSON object instead of querying multiple tables.

### Current Implementation
Currently, the user profile is built by:
1. Querying `auth.users` via `supabase.auth.getUser()` for authentication data
2. Querying `accounts` table for account/personal information
3. (Future) Querying `orders` table for order history
4. (Future) Querying Stripe API or `billing` table for payment methods

This results in multiple database queries every time a user profile needs to be loaded.

### Proposed Implementation

#### Database Schema
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_json JSONB NOT NULL,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_json ON user_profiles USING GIN (profile_json);
```

#### Profile JSON Structure
```json
{
  "currentUser": {
    "id": "uuid",
    "email": "user@example.com",
    "email_confirmed_at": "timestamp",
    "user_metadata": {
      "first_name": "John",
      "last_name": "Doe"
    }
  },
  "accountData": {
    "id": "uuid",
    "user_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "1234567890",
    "billing_address_line1": "123 Main St",
    "shipping_address_line1": "123 Main St",
    "user_type": "customer"
  },
  "orders": [
    {
      "id": "order_id",
      "status": "delivered",
      "total": 99.99,
      "created_at": "timestamp"
    }
  ],
  "billing": {
    "stripe_customer_id": "cus_xxx",
    "payment_methods": [
      {
        "id": "pm_xxx",
        "type": "card",
        "last4": "4242"
      }
    ]
  }
}
```

### Benefits

1. **Performance**: Single query instead of multiple database calls
2. **Caching**: Easier to cache entire profile in memory/Redis
3. **Versioning**: Can track profile changes over time
4. **Flexibility**: Can add/modify profile structure without schema changes
5. **API Efficiency**: Single endpoint to get all user data

### Considerations

1. **Data Consistency**: Need to keep JSON in sync with source tables
   - Use database triggers or event listeners
   - Rebuild profile JSON whenever related tables are updated

2. **Query Complexity**: JSONB queries can be complex
   - Postgres has good JSONB support with GIN indexes
   - Can query nested fields: `profile_json->'accountData'->>'first_name'`

3. **Storage**: Duplicate data across tables and JSON
   - Need to decide if this is source of truth or cache
   - Consider storage costs for large user bases

4. **Consistency Model**:
   - **Option A**: Source of truth in original tables, JSON is cache
   - **Option B**: JSON is source of truth, original tables are deprecated
   - **Recommendation**: Option A (JSON as optimized cache)

### Implementation Strategy

1. **Phase 1**: Keep current multi-table architecture
2. **Phase 2**: Add `user_profiles` table as read-only cache
3. **Phase 3**: Create triggers to auto-update JSON when source tables change
4. **Phase 4**: Migrate frontend to read from JSON table
5. **Phase 5**: Monitor performance and optimize

### Trigger Example (PostgreSQL)
```sql
-- Function to rebuild user profile JSON
CREATE OR REPLACE FUNCTION rebuild_user_profile(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_profile JSONB;
BEGIN
  -- Build complete profile
  SELECT jsonb_build_object(
    'accountData', row_to_json(a.*),
    'orders', (
      SELECT jsonb_agg(row_to_json(o.*))
      FROM orders o
      WHERE o.user_id = p_user_id
    ),
    'billing', (
      SELECT jsonb_build_object(
        'stripe_customer_id', stripe_customer_id,
        'payment_methods', payment_methods_json
      )
      FROM billing_info
      WHERE user_id = p_user_id
    )
  )
  INTO v_profile
  FROM accounts a
  WHERE a.user_id = p_user_id;

  -- Upsert into user_profiles
  INSERT INTO user_profiles (user_id, profile_json, last_updated_at)
  VALUES (p_user_id, v_profile, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    profile_json = EXCLUDED.profile_json,
    last_updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger on accounts table
CREATE TRIGGER trigger_rebuild_profile_on_account_update
AFTER INSERT OR UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION rebuild_user_profile(NEW.user_id);
```

### Alternative Approach: Materialized Views

Instead of JSON storage, could use PostgreSQL materialized views:

```sql
CREATE MATERIALIZED VIEW user_profile_view AS
SELECT
  u.id as user_id,
  u.email,
  a.first_name,
  a.last_name,
  a.phone,
  COUNT(o.id) as total_orders,
  SUM(o.total) as lifetime_value
FROM auth.users u
LEFT JOIN accounts a ON a.user_id = u.id
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.email, a.first_name, a.last_name, a.phone;

-- Refresh periodically
REFRESH MATERIALIZED VIEW user_profile_view;
```

**Pros**: No data duplication, SQL-based queries
**Cons**: Requires manual refresh, less flexible than JSONB

---

## Decision
This feature is **NOT YET IMPLEMENTED** and requires:
- [ ] Performance testing with current architecture
- [ ] Analysis of read/write patterns
- [ ] Cost-benefit analysis of duplicate storage
- [ ] Decision on consistency model (cache vs source of truth)
- [ ] Implementation of proper syncing mechanism

**Status**: Conceptual - Pending performance requirements and scale analysis
