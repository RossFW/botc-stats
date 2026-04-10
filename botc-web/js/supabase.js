/**
 * Database connection module for Blood on the Clocktower stats
 *
 * Connects to Supabase for all data access.
 */

// ==========================================
// CONFIGURATION — Update these with your Supabase project details
// See README.md for setup instructions
// ==========================================
const SUPABASE_URL = 'YOUR_SUPABASE_URL';       // e.g., 'https://abcdefgh.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Dashboard > Settings > API > "anon public"

// ==========================================
// SUPABASE SQL SCHEMA
// ==========================================
/*
-- Run this in your Supabase SQL Editor to set up the database:

CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    game_id INTEGER UNIQUE NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    players JSONB NOT NULL,
    winning_team TEXT NOT NULL CHECK (winning_team IN ('Good', 'Evil')),
    game_mode TEXT,
    story_teller TEXT,
    modifiers JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE access_codes (
    code TEXT PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert your confirmation code (change 'your-secret-code' to your actual code)
INSERT INTO access_codes (code, description) VALUES ('your-secret-code', 'Friends access');

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read games
CREATE POLICY "Games are viewable by everyone" ON games
    FOR SELECT USING (true);

-- Allow inserts (validation happens in JavaScript)
CREATE POLICY "Games can be inserted" ON games
    FOR INSERT WITH CHECK (true);

-- Allow reading access codes for validation
CREATE POLICY "Access codes can be read for validation" ON access_codes
    FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX idx_games_game_id ON games(game_id);
*/

// ==========================================
// SUPABASE CLIENT
// ==========================================
let supabase = null;

async function initSupabase() {
    if (supabase) return supabase;
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabase;
}

// ==========================================
// DATA ACCESS FUNCTIONS
// ==========================================

/**
 * Fetch all games from the database.
 * @returns {Promise<Array>} Array of game objects
 */
export async function fetchGames() {
    await initSupabase();
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('game_id', { ascending: true });

    if (error) {
        console.error('Error fetching games:', error);
        throw error;
    }

    return data.map(game => ({
        game_id: game.game_id,
        date: game.date,
        players: game.players,
        winning_team: game.winning_team,
        game_mode: game.game_mode,
        story_teller: game.story_teller,
        modifiers: game.modifiers || null
    }));
}

/**
 * Validate an access code using secure RPC function.
 * @param {string} code - The confirmation code to validate
 * @returns {Promise<boolean>} True if code is valid
 */
export async function validateAccessCode(code) {
    await initSupabase();
    const { data, error } = await supabase
        .rpc('validate_access_code', { input_code: code });

    if (error) {
        console.error('Error validating code:', error);
        return false;
    }

    return data && data.length > 0 && data[0].is_valid === true;
}

/**
 * Submit a new game.
 * @param {Object} gameData - The game data to submit
 * @param {string} code - The confirmation code
 * @returns {Promise<Object>} The inserted game record
 */
export async function submitGame(gameData, code) {
    // Validate code first
    const isValid = await validateAccessCode(code);
    if (!isValid) {
        throw new Error('Invalid confirmation code');
    }

    await initSupabase();

    // Get the next game_id
    const { data: maxGame } = await supabase
        .from('games')
        .select('game_id')
        .order('game_id', { ascending: false })
        .limit(1);

    const nextId = (maxGame && maxGame.length > 0) ? maxGame[0].game_id + 1 : 1;

    // Insert the new game
    const { data, error } = await supabase
        .from('games')
        .insert({
            game_id: nextId,
            date: new Date().toISOString(),
            players: gameData.players,
            winning_team: gameData.winning_team,
            game_mode: gameData.game_mode,
            story_teller: gameData.story_teller,
            modifiers: gameData.modifiers
        })
        .select()
        .single();

    if (error) {
        console.error('Error submitting game:', error);
        throw error;
    }

    return data;
}

/**
 * Get the stored confirmation code from localStorage.
 * @returns {string|null} The stored code or null
 */
export function getStoredCode() {
    return localStorage.getItem('botc_access_code');
}

/**
 * Store a confirmation code in localStorage.
 * @param {string} code - The code to store
 */
export function storeCode(code) {
    localStorage.setItem('botc_access_code', code);
}

/**
 * Clear the stored confirmation code.
 */
export function clearStoredCode() {
    localStorage.removeItem('botc_access_code');
    localStorage.removeItem('botc_permission_level');
}

/**
 * Get stored permission level.
 * @returns {string|null} 'submit', 'edit', or null
 */
export function getStoredPermissionLevel() {
    return localStorage.getItem('botc_permission_level');
}

/**
 * Store permission level in localStorage.
 * @param {string} level - 'submit' or 'edit'
 */
export function storePermissionLevel(level) {
    localStorage.setItem('botc_permission_level', level);
}

// ==========================================
// PHASE 4B: GAME EDITING FUNCTIONS
// ==========================================

/**
 * Validate access code and return permission level using secure RPC function.
 * @param {string} code - The confirmation code to validate
 * @returns {Promise<string|null>} 'submit', 'edit', or null if invalid
 */
export async function validateAccessCodeWithLevel(code) {
    await initSupabase();
    const { data, error } = await supabase
        .rpc('validate_access_code', { input_code: code });

    if (error) {
        console.error('Error validating code:', error);
        return null;
    }

    if (data && data.length > 0 && data[0].is_valid === true) {
        return data[0].permission_level || 'submit';
    }
    return null;
}

/**
 * Search games by game ID, storyteller, or script.
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching games (summary only)
 */
export async function searchGames(query) {
    await initSupabase();

    const trimmedQuery = query.trim();
    const gameIdNum = parseInt(trimmedQuery);

    // Build search - try game_id first if it's a number
    let searchQuery = supabase
        .from('games')
        .select('game_id, date, game_mode, story_teller, winning_team')
        .order('game_id', { ascending: false })
        .limit(20);

    if (!isNaN(gameIdNum) && trimmedQuery === String(gameIdNum)) {
        // Search by game ID
        searchQuery = searchQuery.eq('game_id', gameIdNum);
    } else {
        // Search by storyteller or script name
        searchQuery = searchQuery.or(`story_teller.ilike.%${trimmedQuery}%,game_mode.ilike.%${trimmedQuery}%`);
    }

    const { data, error } = await searchQuery;

    if (error) {
        console.error('Error searching games:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get full game data by game_id.
 * @param {number} gameId - The game ID
 * @returns {Promise<Object>} Full game object
 */
export async function getGameById(gameId) {
    await initSupabase();
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('game_id', gameId)
        .single();

    if (error) {
        console.error('Error fetching game:', error);
        throw error;
    }

    return data;
}

/**
 * Update an existing game.
 * @param {number} gameId - The game ID to update
 * @param {Object} gameData - Updated game data
 * @param {string} code - The edit confirmation code
 * @returns {Promise<Object>} The updated game record
 */
export async function updateGame(gameId, gameData, code) {
    // Validate code has edit permission
    const level = await validateAccessCodeWithLevel(code);
    if (level !== 'edit') {
        throw new Error('Edit access required. Use the edit code.');
    }

    await initSupabase();
    const { data, error } = await supabase
        .from('games')
        .update({
            players: gameData.players,
            winning_team: gameData.winning_team,
            game_mode: gameData.game_mode,
            story_teller: gameData.story_teller,
            modifiers: gameData.modifiers
        })
        .eq('game_id', gameId)
        .select()
        .single();

    if (error) {
        console.error('Error updating game:', error);
        throw error;
    }

    return data;
}

// ==========================================
// PHASE 4C: SCRIPTS MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Fetch all scripts from the database.
 * @returns {Promise<Array>} Array of script objects
 */
export async function fetchScripts() {
    await initSupabase();
    const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching scripts:', error);
        // Return empty array if scripts table doesn't exist yet
        return [];
    }

    return data || [];
}

/**
 * Add a new script to the database.
 * @param {Object} scriptData - { name, category }
 * @param {string} code - The edit confirmation code
 * @returns {Promise<Object>} The inserted script
 */
export async function addScript(scriptData, code) {
    // Validate code has edit permission
    const level = await validateAccessCodeWithLevel(code);
    if (level !== 'edit') {
        throw new Error('Edit access required to add scripts');
    }

    await initSupabase();
    const { data, error } = await supabase
        .from('scripts')
        .insert({
            name: scriptData.name,
            category: scriptData.category
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding script:', error);
        throw error;
    }

    return data;
}
