import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
    console.log('🔧 Setting up Neon database...\n');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment variables');
        console.log('Please create a .env file with your Neon connection string');
        process.exit(1);
    }
    
    try {
        const sql = neon(process.env.DATABASE_URL);
        
        // Read schema file
        const schemaPath = join(__dirname, '..', 'schema.sql');
        const schema = await readFile(schemaPath, 'utf-8');
        
        console.log('📝 Executing schema...');
        
        // Split schema by statements and execute them
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
            try {
                await sql([statement + ';']);
                console.log('✅ Executed:', statement.split('\n')[0].substring(0, 60) + '...');
            } catch (error) {
                // Ignore "already exists" errors
                if (!error.message.includes('already exists')) {
                    throw error;
                }
                console.log('⏭️  Skipped (already exists):', statement.split('\n')[0].substring(0, 50) + '...');
            }
        }
        
        console.log('\n✅ Database setup complete!');
        console.log('\nYou can now run: npm start');
        
    } catch (error) {
        console.error('\n❌ Database setup failed:', error.message);
        process.exit(1);
    }
}

setupDatabase();

