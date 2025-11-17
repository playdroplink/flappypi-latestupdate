-- Create user_scores table for leaderboard functionality
CREATE TABLE IF NOT EXISTS public.user_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    highest_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_scores_highest_score ON public.user_scores(highest_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON public.user_scores(user_id);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    username TEXT,
    avatar_url TEXT,
    total_coins INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_plan TEXT,
    subscription_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    equipped BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for inventory
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_type ON public.inventory(item_type); 