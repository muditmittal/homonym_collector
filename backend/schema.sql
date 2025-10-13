-- Homonym Collector Database Schema
-- PostgreSQL schema for Neon database

-- Collections table
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Homonym groups table
CREATE TABLE homonym_groups (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    pronunciation VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Words table (individual words in homonym groups)
CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    homonym_group_id INTEGER REFERENCES homonym_groups(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    word_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_homonym_groups_collection ON homonym_groups(collection_id);
CREATE INDEX idx_words_homonym_group ON words(homonym_group_id);
CREATE INDEX idx_words_word ON words(word);

-- Create default collection
INSERT INTO collections (name) VALUES ('Oshi''s Homonyms');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homonym_groups_updated_at BEFORE UPDATE ON homonym_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

