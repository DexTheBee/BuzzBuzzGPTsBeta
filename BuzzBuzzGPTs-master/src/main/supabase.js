/**
 * Supabase Client for Electron
 * Handles authentication and database operations
 */

const { createClient } = require('@supabase/supabase-js');
const { app } = require('electron');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Production mode check
const isProduction = process.env.NODE_ENV === 'production' || app.isPackaged;
const log = isProduction ? () => {} : console.log.bind(console);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file');
}

// Custom storage adapter for Electron to persist sessions
class ElectronStorage {
  constructor() {
    this.storageKey = 'supabase.auth.token';
    this.storagePath = path.join(app.getPath('userData'), 'auth-session.json');
  }

  async getItem(key) {
    try {
      log('[STORAGE] Getting item:', key);
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf-8');
        const parsed = JSON.parse(data);
        const value = parsed[key] || null;
        log('[STORAGE] Found:', value ? 'Session data exists' : 'No session data');
        return value;
      }
      log('[STORAGE] No storage file exists yet');
      return null;
    } catch (error) {
      console.error('[STORAGE] Error reading session:', error);
      return null;
    }
  }

  async setItem(key, value) {
    try {
      log('[STORAGE] Saving item:', key);
      let data = {};
      if (fs.existsSync(this.storagePath)) {
        const existing = fs.readFileSync(this.storagePath, 'utf-8');
        data = JSON.parse(existing);
      }
      data[key] = value;
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
      log('[STORAGE] ✅ Session saved to:', this.storagePath);
    } catch (error) {
      console.error('[STORAGE] Error saving session:', error);
    }
  }

  async removeItem(key) {
    try {
      log('[STORAGE] Removing item:', key);
      if (fs.existsSync(this.storagePath)) {
        const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
        delete data[key];
        fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
        log('[STORAGE] ✅ Session removed');
      }
    } catch (error) {
      console.error('[STORAGE] Error removing session:', error);
    }
  }
}

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: new ElectronStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  : null;

module.exports = { supabase };
