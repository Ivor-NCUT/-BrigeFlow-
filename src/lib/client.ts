import { api } from './api';

// Re-export api to match the expected interface of the previous client
export const client = {
  api: api,
  auth: {
    // These are no-ops as we are moving to Supabase Auth
    renderAuthUI: () => console.warn("Use Supabase Auth UI"),
    user: null, 
  }
};
