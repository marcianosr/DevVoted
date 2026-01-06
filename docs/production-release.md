# Production release

When a branch is merged to main, a release is created automatically in Vercel.

At the moment we do not have automatic database migrations set up for production. Therefore, follow the steps below to apply database changes to production.
**Manual Migration Approach** (Current):

1. Generate migration locally: `npm run db:generate`
2. Review the generated SQL in `drizzle/` folder
3. Apply to production using psql:
   ```bash
   psql "postgresql://postgres.smrkmigjsnhrhwrxobjc:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres" \
     -f drizzle/XXXX_migration_name.sql
   ```
4. Push code changes to `main` branch

**Note:** Replace `[PASSWORD]` with your Supabase database password and `XXXX_migration_name.sql` with the actual migration filename.

### Production release

- Update the db if changes were made by connecting to the production server and running DB scripts
- Push to `main` branch

### Create a new release tag if needed

Only create releases for **milestones** (major features, significant updates). Every merge to main already deploys automatically via Vercel.


#### Via CLI
```bash
# 1. Update CHANGELOG.md with new version section

# 2. Update package.json version
npm version minor  # 1.0.0 → 1.1.0 (new features)
npm version patch  # 1.0.0 → 1.0.1 (bug fixes only)

# 3. Commit changes
git add CHANGELOG.md package.json
git commit -m "chore: release v1.1.0"

# 4. Create tag locally
git tag v1.1.0

# 5. Push everything
git push origin main
git push origin v1.1.0


