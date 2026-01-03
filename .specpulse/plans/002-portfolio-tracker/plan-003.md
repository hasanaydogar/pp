# Implementation Plan: Enhanced Portfolio Tracker Features

<!-- FEATURE_DIR: 002-portfolio-tracker -->
<!-- FEATURE_ID: 002 -->
<!-- PLAN_NUMBER: 003 -->
<!-- STATUS: pending -->
<!-- CREATED: 2025-11-30T14:30:00.000000 -->

## Specification Reference
- **Spec ID**: SPEC-002-003
- **Spec Version**: 1.0
- **Plan Version**: 1.0
- **Generated**: 2025-11-30
- **Related Spec**: spec-003.md

## Architecture Overview

### High-Level Design

This plan enhances the existing Portfolio Tracker API with professional-grade features:
- Historical data import capabilities
- Multi-currency support
- Enhanced transaction handling (SELL quantity reduction)
- Cost basis tracking
- Benchmark comparison
- Advanced analytics

### Technical Stack
- **Database**: Supabase PostgreSQL (existing)
- **API Layer**: Next.js 15 Route Handlers (existing)
- **New Features**: Database migrations, enhanced business logic, new endpoints

## Implementation Phases

### Phase 1: Database Schema Updates [Priority: HIGH]
**Timeline**: 1-2 days
**Dependencies**: None

#### Tasks
1. [ ] Create migration for currency fields
2. [ ] Create migration for initial_purchase_date
3. [ ] Create migration for benchmark_symbol
4. [ ] Create migration for notes fields
5. [ ] Create migration for cost_basis_lots table
6. [ ] Create migration for realized_gain_loss
7. [ ] Update RLS policies for new fields
8. [ ] Test migrations in development

#### Deliverables
- [ ] Migration files for all schema updates
- [ ] Updated TypeScript types
- [ ] Updated Zod schemas
- [ ] RLS policies updated

#### Acceptance Criteria
- [ ] All migrations run successfully
- [ ] Existing data preserved
- [ ] New fields have proper defaults
- [ ] RLS policies work correctly

### Phase 2: SELL Transaction Enhancement [Priority: HIGH]
**Timeline**: 1-2 days
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] Update business logic for SELL transactions
2. [ ] Implement quantity reduction logic
3. [ ] Add quantity validation (sufficient quantity check)
4. [ ] Implement realized gain/loss calculation
5. [ ] Update transaction POST endpoint
6. [ ] Handle zero quantity case (optional asset deletion)
7. [ ] Update business logic tests
8. [ ] Test SELL transaction flow

#### Deliverables
- [ ] Updated `lib/api/business-logic.ts`
- [ ] Updated transaction POST endpoint
- [ ] Updated tests
- [ ] Documentation

#### Acceptance Criteria
- [ ] SELL transactions reduce asset quantity
- [ ] Insufficient quantity returns 400 error
- [ ] Realized gain/loss calculated correctly
- [ ] Zero quantity handled appropriately
- [ ] All tests passing

### Phase 3: Historical Import [Priority: HIGH]
**Timeline**: 2-3 days
**Dependencies**: Phase 2 complete

#### Tasks
1. [ ] Create bulk transaction import endpoint
2. [ ] Create asset creation from transactions endpoint
3. [ ] Implement transaction sorting by date
4. [ ] Implement quantity and average price calculation from transactions
5. [ ] Add validation for historical dates
6. [ ] Add error handling for invalid data
7. [ ] Create import schemas (Zod)
8. [ ] Test bulk import scenarios

#### Deliverables
- [ ] `POST /api/portfolios/[id]/assets/import` endpoint
- [ ] `POST /api/assets/[id]/transactions/import` endpoint
- [ ] Import validation logic
- [ ] Test cases

#### Acceptance Criteria
- [ ] Can import multiple historical transactions
- [ ] Asset created with correct initial values
- [ ] Transactions processed in chronological order
- [ ] Validation errors handled properly
- [ ] Import works for large datasets

### Phase 4: Currency Support [Priority: MEDIUM]
**Timeline**: 1-2 days
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] Update CreateAssetSchema to include currency
2. [ ] Update CreateTransactionSchema to include currency
3. [ ] Add currency validation (supported currencies)
4. [ ] Update asset creation endpoint
5. [ ] Update transaction creation endpoint
6. [ ] Add currency to response types
7. [ ] Test multi-currency scenarios

#### Deliverables
- [ ] Currency validation utility
- [ ] Updated schemas and types
- [ ] Updated endpoints
- [ ] Currency enum/constants

#### Acceptance Criteria
- [ ] Assets can be created with currency
- [ ] Transactions can have currency
- [ ] Invalid currency returns 400 error
- [ ] Default currency (USD) works
- [ ] Multi-currency portfolios supported

### Phase 5: Cost Basis Tracking [Priority: MEDIUM]
**Timeline**: 2-3 days
**Dependencies**: Phase 2, Phase 4 complete

#### Tasks
1. [ ] Implement FIFO cost basis calculation
2. [ ] Implement Average Cost method
3. [ ] Create cost_basis_lots management
4. [ ] Update SELL transaction to track cost basis
5. [ ] Create cost basis endpoint
6. [ ] Calculate realized gain/loss per transaction
7. [ ] Test cost basis calculations

#### Deliverables
- [ ] Cost basis calculation functions
- [ ] `GET /api/assets/[id]/cost-basis` endpoint
- [ ] Cost basis tracking logic
- [ ] Tests for FIFO and Average Cost

#### Acceptance Criteria
- [ ] FIFO cost basis calculated correctly
- [ ] Average cost method works
- [ ] Realized gain/loss tracked per transaction
- [ ] Cost basis endpoint returns accurate data
- [ ] Edge cases handled (zero quantity, etc.)

### Phase 6: Benchmark Comparison [Priority: MEDIUM]
**Timeline**: 1-2 days
**Dependencies**: Phase 1 complete

#### Tasks
1. [ ] Update portfolio creation to include benchmark_symbol
2. [ ] Create benchmark comparison logic
3. [ ] Create benchmark comparison endpoint
4. [ ] Calculate relative performance
5. [ ] Add benchmark data structure (future: external API)

#### Deliverables
- [ ] `GET /api/portfolios/[id]/benchmark-comparison` endpoint
- [ ] Benchmark comparison logic
- [ ] Performance calculation functions

#### Acceptance Criteria
- [ ] Portfolio can have benchmark symbol
- [ ] Benchmark comparison endpoint works
- [ ] Relative performance calculated
- [ ] Handles missing benchmark data gracefully

### Phase 7: Analytics Endpoints [Priority: LOW]
**Timeline**: 2-3 days
**Dependencies**: Phase 2, Phase 5 complete

#### Tasks
1. [ ] Create portfolio analytics endpoint
2. [ ] Create asset performance endpoint
3. [ ] Create transaction analytics endpoint
4. [ ] Implement performance calculations
5. [ ] Add time-based analytics
6. [ ] Test analytics endpoints

#### Deliverables
- [ ] `GET /api/portfolios/[id]/analytics` endpoint
- [ ] `GET /api/assets/[id]/performance` endpoint
- [ ] `GET /api/portfolios/[id]/transactions/analytics` endpoint
- [ ] Analytics calculation functions

#### Acceptance Criteria
- [ ] Portfolio analytics return accurate data
- [ ] Asset performance calculated correctly
- [ ] Transaction analytics work
- [ ] Performance metrics are accurate

## Risk Assessment

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Migration breaks existing data | HIGH | LOW | Test migrations thoroughly, use defaults |
| SELL logic breaks existing flows | MEDIUM | MEDIUM | Comprehensive testing, backward compatibility |
| Bulk import performance issues | MEDIUM | MEDIUM | Batch processing, pagination |
| Cost basis calculation errors | HIGH | MEDIUM | Unit tests, edge case testing |

### Project Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Feature scope creep | MEDIUM | MEDIUM | Prioritize must-have features |
| Timeline delays | MEDIUM | MEDIUM | Phase-based implementation |

## Success Metrics

### Functional Metrics
- [ ] SELL transactions reduce quantity correctly
- [ ] Historical import works for 100+ transactions
- [ ] Multi-currency support functional
- [ ] Cost basis tracking accurate
- [ ] Benchmark comparison available

### Quality Metrics
- [ ] All existing tests still pass
- [ ] New tests cover new features
- [ ] Backward compatibility maintained
- [ ] Performance acceptable

## Timeline Estimate

| Phase | Duration | Total Days |
|-------|----------|------------|
| Phase 1: Database Updates | 1-2 days | 2 |
| Phase 2: SELL Enhancement | 1-2 days | 2 |
| Phase 3: Historical Import | 2-3 days | 3 |
| Phase 4: Currency Support | 1-2 days | 2 |
| Phase 5: Cost Basis | 2-3 days | 3 |
| Phase 6: Benchmark | 1-2 days | 2 |
| Phase 7: Analytics | 2-3 days | 3 |
| **Total** | | **17-20 days** |

## Dependencies

### Prerequisites (Completed)
- ✅ Database schema (spec-001.md)
- ✅ API endpoints (spec-002.md)
- ✅ Authentication system

### New Dependencies
- None (all features use existing stack)

## Implementation Order

1. **Database Updates** → Foundation for all features
2. **SELL Enhancement** → Critical business logic
3. **Historical Import** → High-value feature
4. **Currency Support** → Enables multi-currency
5. **Cost Basis** → Advanced tracking
6. **Benchmark** → Comparison features
7. **Analytics** → Reporting features

## Notes

- Maintain backward compatibility throughout
- Test migrations thoroughly before production
- Prioritize must-have features first
- Document all new endpoints
- Update Postman collection

