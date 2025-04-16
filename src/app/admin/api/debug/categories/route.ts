import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

// Define types to avoid type errors
interface DebugResults {
  status: string;
  auth: {
    hasSession?: boolean;
    error?: string | null;
  } | null;
  storage: {
    buckets?: string[];
    error?: string | null;
  } | null;
  database: {
    hasCategories?: boolean;
    count?: number;
    examples?: string[];
    error?: string | null;
  } | null;
  timestamp: string;
}

// This API route is used to check category storage functionality and database connections
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const results: DebugResults = {
      status: 'success',
      auth: null,
      storage: null,
      database: null,
      timestamp: new Date().toISOString()
    };

    // 1. Check authentication status
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      results.auth = {
        hasSession: !!authData?.session,
        error: authError ? authError.message : null
      };
    } catch (err) {
      results.auth = { error: 'Auth check failed' };
    }

    // 2. Check storage bucket status
    try {
      const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
      results.storage = {
        buckets: bucketsData?.map(b => b.name) || [],
        error: bucketsError ? bucketsError.message : null,
      };
    } catch (err) {
      results.storage = { error: 'Storage check failed' };
    }

    // 3. Check categories table
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .limit(5);

      results.database = {
        hasCategories: !!(categoriesData && categoriesData.length > 0),
        count: categoriesData?.length || 0,
        examples: categoriesData?.slice(0, 3).map(c => c.name) || [],
        error: categoriesError ? categoriesError.message : null
      };
    } catch (err) {
      results.database = { error: 'Database check failed' };
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 