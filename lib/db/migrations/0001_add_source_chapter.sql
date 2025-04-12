DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'resources' AND column_name = 'source') THEN
        ALTER TABLE resources ADD COLUMN source VARCHAR(191) NOT NULL DEFAULT 'unknown';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'resources' AND column_name = 'chapter') THEN
        ALTER TABLE resources ADD COLUMN chapter VARCHAR(191) NOT NULL DEFAULT 'unknown';
    END IF;
END $$; 