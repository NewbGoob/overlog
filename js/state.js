// ============================================
// SHARED STATE MODULE
// ============================================

import { createInitialState } from './config.js';

// Export the global state object
// All modules import this to access/modify state
export const state = createInitialState();
