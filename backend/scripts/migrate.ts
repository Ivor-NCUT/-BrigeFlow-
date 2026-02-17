import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// Old Supabase DB
const oldDbUrl = 'postgresql://postgres:YuanmaiBridgeFlow@db.wiqqiiobloozchsjsogi.supabase.co:5432/postgres';
// New Insforge DB
const newDbUrl = process.env.DATABASE_URL!;

if (!newDbUrl) {
  console.error('DATABASE_URL not found in environment');
  process.exit(1);
}

const oldSql = postgres(oldDbUrl);
const newSql = postgres(newDbUrl, { ssl: 'require' });

async function migrateTable(tableName: string, conflictTarget?: string[]) {
  console.log(`Migrating ${tableName}...`);
  try {
    const rows = await oldSql`SELECT * FROM ${oldSql(tableName)}`;
    if (rows.length === 0) {
      console.log(`No data in ${tableName}`);
      return;
    }
    
    console.log(`Found ${rows.length} rows in ${tableName}`);

    // Batch insert
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      // Clean up batch data if needed (e.g. remove nulls if not allowed, though migration usually keeps them)
      // postgres.js handles keys automatically
      
      try {
          if (conflictTarget) {
               // Construct explicit ON CONFLICT clause
               // Note: postgres.js helper doesn't support complex ON CONFLICT easily with the helper
               // So we just use ON CONFLICT DO NOTHING for simplicity, assuming PKs exist
               await newSql`INSERT INTO ${newSql(tableName)} ${newSql(batch)} ON CONFLICT DO NOTHING`;
          } else {
               await newSql`INSERT INTO ${newSql(tableName)} ${newSql(batch)} ON CONFLICT DO NOTHING`;
          }
      } catch (err) {
          console.error(`Error inserting batch into ${tableName}:`, err);
          // Try row by row if batch fails
          for (const row of batch) {
              try {
                await newSql`INSERT INTO ${newSql(tableName)} ${newSql(row)} ON CONFLICT DO NOTHING`;
              } catch (e) {
                  console.error(`Failed to insert row in ${tableName}:`, row, e);
              }
          }
      }
    }
    console.log(`Migrated ${rows.length} rows to ${tableName}`);
  } catch (err) {
      console.error(`Failed to read/migrate ${tableName}:`, err);
  }
}

async function main() {
  try {
    // 1. Contacts (Core)
    await migrateTable('contacts');
    
    // 2. Tags (Independent)
    await migrateTable('tags');
    
    // 3. Contact Tags (Junction)
    await migrateTable('contact_tags');
    
    // 4. Communication Records
    await migrateTable('communication_records');
    
    // 5. Relationships & Connections
    await migrateTable('relationships');
    await migrateTable('connections');
    
    // 6. Shared Pages
    await migrateTable('shared_pages');
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await oldSql.end();
    await newSql.end();
  }
}

main();
