# Database Security Model

## Row Level Security (RLS)

All tables in the portfolio tracker schema have Row Level Security (RLS) enabled. This ensures that users can only access their own data.

## Security Architecture

### User Isolation

The security model uses a hierarchical approach:
1. **Portfolios** are directly owned by users (`user_id` references `auth.users`)
2. **Assets** are owned through portfolios (check portfolio ownership)
3. **Transactions** are owned through assets (check asset → portfolio ownership)

### RLS Policy Pattern

All RLS policies follow this pattern:
- **SELECT**: Users can view their own data
- **INSERT**: Users can create data in their own resources
- **UPDATE**: Users can update their own data
- **DELETE**: Users can delete their own data

## Portfolio Policies

```sql
-- Users can only see their own portfolios
CREATE POLICY "Users can view their own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);
```

**Security Check**: Direct comparison with `auth.uid()`

## Asset Policies

```sql
-- Users can only see assets in their portfolios
CREATE POLICY "Users can view assets in their portfolios"
  ON assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = assets.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );
```

**Security Check**: EXISTS subquery checks portfolio ownership

## Transaction Policies

```sql
-- Users can only see transactions for their assets
CREATE POLICY "Users can view transactions for their assets"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assets
      JOIN portfolios ON portfolios.id = assets.portfolio_id
      WHERE assets.id = transactions.asset_id
      AND portfolios.user_id = auth.uid()
    )
  );
```

**Security Check**: EXISTS subquery through assets → portfolios

## Security Testing

### Test User Isolation

1. **Create two test users**:
   ```sql
   -- User A creates portfolio
   SET LOCAL role TO authenticated;
   SET LOCAL request.jwt.claim.sub TO 'user-a-id';
   INSERT INTO portfolios (user_id, name) VALUES ('user-a-id', 'Portfolio A');
   
   -- User B tries to access User A's portfolio (should fail)
   SET LOCAL request.jwt.claim.sub TO 'user-b-id';
   SELECT * FROM portfolios WHERE user_id = 'user-a-id'; -- Should return empty
   ```

2. **Test Asset Access**:
   ```sql
   -- User A creates asset
   SET LOCAL request.jwt.claim.sub TO 'user-a-id';
   INSERT INTO assets (portfolio_id, symbol, quantity, average_buy_price, type)
   VALUES ('portfolio-a-id', 'AAPL', 10, 150.00, 'STOCK');
   
   -- User B tries to access User A's asset (should fail)
   SET LOCAL request.jwt.claim.sub TO 'user-b-id';
   SELECT * FROM assets WHERE portfolio_id = 'portfolio-a-id'; -- Should return empty
   ```

3. **Test Transaction Access**:
   ```sql
   -- User A creates transaction
   SET LOCAL request.jwt.claim.sub TO 'user-a-id';
   INSERT INTO transactions (asset_id, type, amount, price, date)
   VALUES ('asset-a-id', 'BUY', 10, 150.00, NOW());
   
   -- User B tries to access User A's transaction (should fail)
   SET LOCAL request.jwt.claim.sub TO 'user-b-id';
   SELECT * FROM transactions WHERE asset_id = 'asset-a-id'; -- Should return empty
   ```

## Security Best Practices

1. **Always use RLS**: Never disable RLS in production
2. **Test policies**: Verify user isolation with multiple users
3. **Monitor access**: Log and monitor RLS policy performance
4. **Review policies**: Regularly review RLS policies for correctness
5. **Use EXISTS efficiently**: RLS policies use EXISTS subqueries which are optimized with indexes

## Performance Considerations

RLS policies add overhead to queries. To minimize impact:
- Index foreign keys (portfolio_id, asset_id)
- Use EXISTS subqueries (more efficient than JOINs in policies)
- Monitor query performance
- Consider composite indexes for common query patterns

## Common Security Issues

### Issue: Users can see other users' data

**Cause**: RLS not enabled or policy incorrect
**Solution**: Verify RLS is enabled and policies use correct user check

### Issue: Users cannot create assets

**Cause**: INSERT policy missing or incorrect
**Solution**: Verify INSERT policy exists and checks portfolio ownership

### Issue: RLS policies slow down queries

**Cause**: Missing indexes or inefficient policy queries
**Solution**: Add indexes on foreign keys, optimize EXISTS subqueries

