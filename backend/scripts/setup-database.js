import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
    console.log('🔧 Setting up Neon database...\n');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment variables');
        console.log('Please create a .env file with your Neon connection string');
        process.exit(1);
    }
    
    try {
        const sql = neon(process.env.DATABASE_URL);
        
        console.log('📝 Creating tables...');
        
        // Create collections table
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS collections (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            console.log('✅ Created collections table');
        } catch (error) {
            if (!error.message.includes('already exists')) {
                throw error;
            }
            console.log('⏭️  Collections table already exists');
        }
        
        // Create homonym_groups table
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS homonym_groups (
                    id SERIAL PRIMARY KEY,
                    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
                    pronunciation VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            console.log('✅ Created homonym_groups table');
        } catch (error) {
            if (!error.message.includes('already exists')) {
                throw error;
            }
            console.log('⏭️  Homonym_groups table already exists');
        }
        
        // Create words table
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS words (
                    id SERIAL PRIMARY KEY,
                    homonym_group_id INTEGER REFERENCES homonym_groups(id) ON DELETE CASCADE,
                    word VARCHAR(255) NOT NULL,
                    definition TEXT NOT NULL,
                    word_order INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            console.log('✅ Created words table');
        } catch (error) {
            if (!error.message.includes('already exists')) {
                throw error;
            }
            console.log('⏭️  Words table already exists');
        }
        
        // Create indexes
        console.log('\n📊 Creating indexes...');
        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_homonym_groups_collection ON homonym_groups(collection_id)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_words_homonym_group ON words(homonym_group_id)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_words_word ON words(word)`;
            console.log('✅ Created indexes');
        } catch (error) {
            console.log('⏭️  Indexes already exist');
        }
        
        // Create default collection if it doesn't exist
        console.log('\n📚 Setting up default collection...');
        const existingCollections = await sql`SELECT COUNT(*) as count FROM collections`;
        if (existingCollections[0].count === '0') {
            await sql`INSERT INTO collections (name) VALUES ('Oshi''s Homonyms')`;
            console.log('✅ Created default collection: Oshi\'s Homonyms');
        } else {
            console.log('⏭️  Collection already exists');
        }
        
        console.log('\n✅ Database setup complete!');
        console.log('\nYou can now run: npm start');
        
    } catch (error) {
        console.error('\n❌ Database setup failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

setupDatabase();

