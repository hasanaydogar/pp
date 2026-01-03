# Implementation Plan: Portfolio Tracker Database Schema

<!-- FEATURE_DIR: 002-portfolio-tracker -->
<!-- FEATURE_ID: 002 -->
<!-- PLAN_NUMBER: 001 -->
<!-- STATUS: pending -->
<!-- CREATED: 2025-11-30T11:10:00.000000 -->

## Specification Reference
- **Spec ID**: SPEC-002
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2025-11-30

## Architecture Overview

### High-Level Design

The portfolio tracker database schema will be implemented in Supabase PostgreSQL using a hierarchical data model:
- **User** (auth.users) → **Portfolios** → **Assets** → **Transactions**

This design ensures:
- Data isolation through Row Level Security (RLS)
- Referential integrity through foreign key constraints
- Performance optimization through strategic indexing
- Type safety through PostgreSQL ENUM types
- Data validation through CHECK constraints

### Technical Stack
- **Database**: Supabase PostgreSQL (PostgreSQL 15+)
- **Migration Tool**: Supabase CLI migrations
- **Type Generation**: Supabase TypeScript type generator
- **Security**: Row Level Security (RLS) policies
- **Language**: SQL (PostgreSQL), TypeScript for types

## Implementation Phases

### Phase 1: Database Schema Foundation [Priority: HIGH]
**Timeline**: 1-2 days
**Dependencies**: None

#### Tasks
1. [ ] Set up Supabase migration directory structure
2. [ ] Create ENUM types (asset_type, transaction_type)
3. [ ] Create portfolios table with basic structure
4. [ ] Create assets table with foreign keys and constraints
5. [ ] Create transactions table with foreign keys and constraints
6. [ ] Add timestamps (created_at, updated_at) to all tables
7. [ ] Test table creation in development environment

#### Deliverables
- [ ] Migration file: `create_portfolio_schema.sql`
- [ ] All ENUM types created successfully
- [ ] All tables created with correct structure
- [ ] Foreign key relationships established
- [ ] Basic constraints (NOT NULL, CHECK) implemented

#### Acceptance Criteria
- [ ] Migration runs without errors
- [ ] All tables visible in Supabase dashboard
- [ ] Foreign keys can be verified in database
- [ ] Enum types available for use in tables

### Phase 2: Data Integrity & Constraints [Priority: HIGH]
**Timeline**: 1 day
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] Add CHECK constraints for positive values (quantity, price, amount)
2. [ ] Add CHECK constraint for non-negative transaction_cost
3. [ ] Add UNIQUE constraint on assets (portfolio_id, symbol, type)
4. [ ] Add NOT NULL constraints on required fields
5. [ ] Test constraint validation with invalid data
6. [ ] Document constraint behavior

#### Deliverables
- [ ] All CHECK constraints implemented
- [ ] UNIQUE constraint prevents duplicate assets
- [ ] Invalid data properly rejected
- [ ] Constraint documentation updated

#### Acceptance Criteria
- [ ] Attempting to insert negative quantity fails
- [ ] Attempting to insert duplicate asset fails
- [ ] Attempting to insert NULL in required fields fails
- [ ] Transaction cost defaults to 0 if not provided

### Phase 3: Row Level Security (RLS) [Priority: HIGH]
**Timeline**: 2-3 days
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] Enable RLS on portfolios table
2. [ ] Create RLS policies for portfolios (SELECT, INSERT, UPDATE, DELETE)
3. [ ] Enable RLS on assets table
4. [ ] Create RLS policies for assets (via portfolio ownership)
5. [ ] Enable RLS on transactions table
6. [ ] Create RLS policies for transactions (via asset ownership)
7. [ ] Test RLS policies with multiple users
8. [ ] Verify user isolation works correctly

#### Deliverables
- [ ] RLS enabled on all tables
- [ ] All CRUD policies implemented
- [ ] User isolation verified
- [ ] RLS policy documentation

#### Acceptance Criteria
- [ ] User A cannot see User B's portfolios
- [ ] User A cannot create assets in User B's portfolios
- [ ] User A cannot access User B's transactions
- [ ] RLS policies work correctly for all operations

### Phase 4: Performance Optimization [Priority: MEDIUM]
**Timeline**: 1 day
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] Create index on portfolios.user_id
2. [ ] Create index on assets.portfolio_id
3. [ ] Create index on assets.symbol
4. [ ] Create index on assets.type
5. [ ] Create index on transactions.asset_id
6. [ ] Create index on transactions.date
7. [ ] Analyze query plans to verify index usage
8. [ ] Document index strategy

#### Deliverables
- [ ] All indexes created
- [ ] Query performance verified
- [ ] Index usage confirmed in query plans
- [ ] Performance benchmarks documented

#### Acceptance Criteria
- [ ] Queries on user_id use index
- [ ] Queries on portfolio_id use index
- [ ] Symbol lookups use index
- [ ] Date range queries use index
- [ ] Query performance < 100ms for typical operations

### Phase 5: TypeScript Types & Type Safety [Priority: MEDIUM]
**Timeline**: 1 day
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] Generate TypeScript types from Supabase schema
2. [ ] Create TypeScript enum types matching PostgreSQL ENUMs
3. [ ] Create Zod schemas for runtime validation
4. [ ] Create TypeScript types for database operations
5. [ ] Test type generation and validation
6. [ ] Document type usage patterns

#### Deliverables
- [ ] TypeScript types file generated
- [ ] Zod schemas for validation
- [ ] Type-safe database client setup
- [ ] Type documentation

#### Acceptance Criteria
- [ ] TypeScript types match database schema
- [ ] Enum types properly typed
- [ ] Zod schemas validate data correctly
- [ ] Type errors caught at compile time

### Phase 6: Testing & Validation [Priority: HIGH]
**Timeline**: 2-3 days
**Dependencies**: Phases 1-5 complete

#### Tasks
1. [ ] Write unit tests for schema creation
2. [ ] Write tests for constraint validation
3. [ ] Write integration tests for RLS policies
4. [ ] Write tests for foreign key relationships
5. [ ] Write tests for cascade deletes
6. [ ] Write performance tests for queries
7. [ ] Write E2E tests for complete flows
8. [ ] Test with multiple users and data isolation

#### Deliverables
- [ ] Unit test suite
- [ ] Integration test suite
- [ ] E2E test suite
- [ ] Test coverage > 80%
- [ ] Test documentation

#### Acceptance Criteria
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] RLS policies tested with multiple users
- [ ] Performance tests meet benchmarks

### Phase 7: Documentation & Migration Finalization [Priority: MEDIUM]
**Timeline**: 1 day
**Dependencies**: Phases 1-6 complete

#### Tasks
1. [ ] Create database schema documentation
2. [ ] Document RLS policies and security model
3. [ ] Document migration process
4. [ ] Create rollback migration script
5. [ ] Update project README with schema details
6. [ ] Create developer guide for using the schema
7. [ ] Review and finalize all documentation

#### Deliverables
- [ ] Complete schema documentation
- [ ] Migration guide
- [ ] Developer documentation
- [ ] Rollback procedures documented
- [ ] README updated

#### Acceptance Criteria
- [ ] Documentation is comprehensive
- [ ] Migration process is clear
- [ ] Rollback procedures tested
- [ ] Developer guide is helpful
- [ ] All documentation reviewed

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| RLS policies performance issues | Medium | High | Optimize RLS policies with proper indexes, use EXISTS subqueries efficiently |
| Migration failures in production | Low | High | Test migrations thoroughly in staging, have rollback scripts ready |
| Type generation mismatches | Medium | Medium | Verify types match schema after each migration, use automated type generation |
| Foreign key constraint violations | Low | Medium | Implement proper cascade strategies, validate data before inserts |
| Index performance degradation | Low | Medium | Monitor query performance, add composite indexes if needed |

### Dependencies

| Dependency | Risk | Contingency |
|------------|------|-------------|
| Supabase PostgreSQL availability | Low | Use local PostgreSQL for development, Supabase for production |
| Supabase CLI for migrations | Low | Use SQL files directly if CLI unavailable |
| TypeScript type generator | Low | Manually create types if generator fails |

## Resource Requirements

### Development Team
- **Backend/Database Developer**: 1 developer
- **QA Engineer**: 0.5 engineer (for testing phase)

### Infrastructure
- **Development Environment**: Supabase free tier sufficient
- **Testing Environment**: Supabase development project
- **Production Environment**: Supabase project (existing)

### Tools Required
- Supabase CLI
- PostgreSQL client (psql or GUI)
- TypeScript compiler
- Jest for testing
- Supabase TypeScript generator

## Success Metrics

- **Performance**: 
  - Queries complete within 100ms for portfolios with < 100 assets
  - Index usage confirmed in query plans
  - RLS policies don't add significant overhead

- **Security**: 
  - 100% user data isolation verified
  - All RLS policies tested and working
  - No unauthorized access possible

- **Data Integrity**: 
  - All constraints working correctly
  - Foreign keys prevent orphaned records
  - Unique constraints prevent duplicates

- **Code Quality**: 
  - TypeScript types match database schema
  - Test coverage > 80%
  - All migrations tested and documented

## Rollout Plan

### Phase Rollout Strategy

1. **Development**: 
   - Create schema in development Supabase project
   - Test all features thoroughly
   - Generate types and validate

2. **Staging**: 
   - Apply migration to staging environment
   - Run full test suite
   - Verify RLS policies work correctly

3. **Production**: 
   - Apply migration to production during low-traffic period
   - Monitor for issues
   - Have rollback plan ready

### Migration Strategy

1. **Pre-migration**:
   - Backup production database
   - Test migration on staging
   - Review migration script

2. **Migration**:
   - Run migration script
   - Verify all tables created
   - Verify RLS policies enabled
   - Verify indexes created

3. **Post-migration**:
   - Generate TypeScript types
   - Run test suite
   - Monitor performance
   - Document any issues

### Monitoring & Observability

- **Database Metrics**: 
  - Query performance
  - Index usage
  - RLS policy performance

- **Application Metrics**: 
  - Migration success/failure
  - Type generation success
  - Test coverage

- **Error Monitoring**: 
  - Migration errors
  - Constraint violations
  - RLS policy failures

## Definition of Done

- [ ] All database tables created successfully
- [ ] All ENUM types created
- [ ] All foreign key relationships established
- [ ] All CHECK constraints implemented
- [ ] All RLS policies created and tested
- [ ] All indexes created and verified
- [ ] TypeScript types generated successfully
- [ ] Test coverage > 80%
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Migration tested in staging
- [ ] Rollback procedure documented
- [ ] Schema reviewed and approved

## Additional Notes

### Migration File Naming Convention

Migration files should follow this pattern:
```
supabase/migrations/YYYYMMDDHHMMSS_create_portfolio_schema.sql
```

Example: `20251130110000_create_portfolio_schema.sql`

### Rollback Strategy

Create a rollback migration that:
1. Drops all RLS policies
2. Drops all indexes
3. Drops all tables
4. Drops all ENUM types

File naming: `YYYYMMDDHHMMSS_rollback_portfolio_schema.sql`

### Testing Strategy

1. **Unit Tests**: Test individual constraints and validations
2. **Integration Tests**: Test RLS policies with real Supabase client
3. **E2E Tests**: Test complete user flows with multiple users
4. **Performance Tests**: Verify query performance meets benchmarks

### Future Enhancements

Consider these enhancements in future iterations:
- Soft delete support with `deleted_at` timestamp
- Portfolio metadata fields (description, currency)
- Asset metadata fields (company name, exchange)
- Transaction notes field
- Multi-currency support
- Historical price tracking
- Portfolio performance calculations

### Security Considerations

- RLS policies are the primary security mechanism
- All policies use `auth.uid()` for user identification
- Policies use EXISTS subqueries for efficient checking
- Foreign keys prevent data corruption
- Constraints prevent invalid data entry

### Performance Considerations

- Indexes on foreign keys for join performance
- Indexes on commonly queried columns (symbol, date)
- RLS policies optimized with EXISTS subqueries
- Consider composite indexes for common query patterns
- Monitor query plans and adjust indexes as needed

