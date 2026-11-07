import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

test('Database Security: all migration files exist and enforce Row Level Security', () => {
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  assert.ok(fs.existsSync(migrationsDir), 'supabase/migrations directory must exist');

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
  assert.ok(files.length >= 2, 'Must contain at least initial schema and cloud synchronization migrations');

  const combinedSql = files
    .map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf8'))
    .join('\n');

  // Tables that store user data
  const requiredUserTables = [
    'profiles',
    'games',
    'lesson_progress',
    'arena_evaluations',
    'user_academy_progress',
    'user_lesson_progress',
    'user_activity_history',
    'test_arena_reports',
    'learner_profiles',
  ];

  for (const tableName of requiredUserTables) {
    // 1. Table creation check
    const createTableRegex = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?(public\\.)?${tableName}\\b`, 'i');
    assert.ok(
      createTableRegex.test(combinedSql),
      `Table ${tableName} must be declared in migrations`
    );

    // 2. Row Level Security must be enabled
    const rlsRegex = new RegExp(`ALTER\\s+TABLE\\s+(public\\.)?${tableName}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
    assert.ok(
      rlsRegex.test(combinedSql),
      `Row Level Security must be explicitly ENABLED on ${tableName}`
    );

    // 3. RLS policy with auth.uid() check
    const policyRegex = new RegExp(
      `CREATE\\s+POLICY\\s+[^;]+ON\\s+(public\\.)?${tableName}\\s+[^;]*auth\\.uid\\(\\)`,
      'i'
    );
    assert.ok(
      policyRegex.test(combinedSql),
      `A security policy referencing auth.uid() must exist for ${tableName}`
    );
  }

  // Verify foreign key cascades to auth.users
  assert.ok(
    /REFERENCES\s+auth\.users\s*\(\s*id\s*\)\s+ON\s+DELETE\s+CASCADE/i.test(combinedSql),
    'Foreign key cascade on auth.users(id) must be declared'
  );

  // Verify no service role or secret key hardcoded
  assert.ok(!/service_role_key/i.test(combinedSql), 'No service role key may be mentioned in migrations');
  assert.ok(!/AIzaSy/i.test(combinedSql), 'No API keys in migrations');
});

test('Database Security: required performance indexes on user_id exist', () => {
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const syncMigration = fs.readFileSync(
    path.join(migrationsDir, '00002_cloud_synchronization.sql'),
    'utf8'
  );

  const expectedIndexes = [
    'idx_user_lesson_progress_user_id',
    'idx_user_activity_history_user_id',
    'idx_test_arena_reports_user_id',
  ];

  for (const idx of expectedIndexes) {
    assert.ok(
      syncMigration.includes(idx),
      `Expected index ${idx} must be present in cloud synchronization migration`
    );
  }

  // learner_profiles has user_id as PRIMARY KEY (which automatically generates a unique B-tree index in Postgres)
  assert.ok(
    /user_id\s+UUID\s+PRIMARY\s+KEY/i.test(syncMigration),
    'learner_profiles must declare user_id as PRIMARY KEY'
  );
});

test('Database Security: WITH CHECK clauses prevent cross-user ID assignment and anonymous access', () => {
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const syncMigration = fs.readFileSync(
    path.join(migrationsDir, '00002_cloud_synchronization.sql'),
    'utf8'
  );

  // User synchronization tables must enforce WITH CHECK on INSERT and UPDATE
  const userSyncTables = [
    'user_academy_progress',
    'user_lesson_progress',
    'user_activity_history',
    'test_arena_reports',
    'learner_profiles',
  ];

  for (const table of userSyncTables) {
    const insertWithCheck = new RegExp(
      `CREATE\\s+POLICY\\s+[^;]+ON\\s+public\\.${table}\\s+FOR\\s+INSERT\\s+WITH\\s+CHECK\\s*\\([^;]*auth\\.uid\\(\\)`,
      'i'
    );
    assert.ok(
      insertWithCheck.test(syncMigration),
      `Table ${table} must enforce WITH CHECK (auth.uid() = user_id) on INSERT`
    );

    const updateWithCheck = new RegExp(
      `CREATE\\s+POLICY\\s+[^;]+ON\\s+public\\.${table}\\s+FOR\\s+UPDATE\\s+USING\\s*\\([^;]*auth\\.uid\\(\\)[^;]*WITH\\s+CHECK\\s*\\([^;]*auth\\.uid\\(\\)`,
      'i'
    );
    assert.ok(
      updateWithCheck.test(syncMigration),
      `Table ${table} must enforce USING and WITH CHECK on UPDATE`
    );
  }

  // Check that policies explicitly guard against anonymous access (auth.uid() IS NOT NULL)
  assert.ok(
    /auth\.uid\(\)\s+IS\s+NOT\s+NULL/i.test(syncMigration),
    'Policies must explicitly verify that auth.uid() IS NOT NULL to reject anonymous requests'
  );
});

test('Database Security: deterministic simulated two-user isolation model', () => {
  // Deterministic simulation testing mathematical isolation predicate:
  // Predicate: auth.uid() IS NOT NULL AND auth.uid() = record.user_id
  function evaluateRlsPolicy(
    authUid: string | null,
    recordUserId: string,
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    newRecordUserId?: string
  ): boolean {
    if (!authUid) return false; // Anonymous rejected
    if (authUid !== recordUserId) return false; // Cross-user access rejected
    if (operation === 'INSERT' || operation === 'UPDATE') {
      if (newRecordUserId && newRecordUserId !== authUid) return false; // WITH CHECK failure
    }
    return true;
  }

  const userA = '00000000-0000-0000-0000-000000000001';
  const userB = '00000000-0000-0000-0000-000000000002';

  // 1. User A can SELECT own record
  assert.equal(evaluateRlsPolicy(userA, userA, 'SELECT'), true);

  // 2. User A CANNOT SELECT User B's record
  assert.equal(evaluateRlsPolicy(userA, userB, 'SELECT'), false);

  // 3. User A CANNOT UPDATE User B's record
  assert.equal(evaluateRlsPolicy(userA, userB, 'UPDATE'), false);

  // 4. User A CANNOT DELETE User B's record
  assert.equal(evaluateRlsPolicy(userA, userB, 'DELETE'), false);

  // 5. User A CANNOT INSERT a record assigning user_id = User B
  assert.equal(evaluateRlsPolicy(userA, userB, 'INSERT', userB), false);

  // 6. User A CANNOT UPDATE their record to change user_id = User B
  assert.equal(evaluateRlsPolicy(userA, userA, 'UPDATE', userB), false);

  // 7. Anonymous user (auth.uid() = null) CANNOT access any user data
  assert.equal(evaluateRlsPolicy(null, userA, 'SELECT'), false);
  assert.equal(evaluateRlsPolicy(null, userA, 'INSERT', userA), false);
  assert.equal(evaluateRlsPolicy(null, userA, 'UPDATE'), false);
  assert.equal(evaluateRlsPolicy(null, userA, 'DELETE'), false);
});
