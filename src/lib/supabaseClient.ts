import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://db.baijfzqjgvgbfzuauroi.supabase.co'.replace('db.', '');
const supabaseAnonKey = 'sb_publishable_KgxbQGt7kRlk52ju5V0OPQ_xWxbVHgS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
