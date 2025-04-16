import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    // Get storage buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return NextResponse.json(
        { error: `Failed to get bucket list: ${bucketsError.message}` },
        { status: 500 }
      );
    }
    
    // Required buckets
    const requiredBuckets = ['brush-files', 'brush-previews', 'brush-gallery', 'avatars', 'category-images'];
    
    // Check bucket status
    const bucketStatus = requiredBuckets.map(name => {
      const bucket = buckets?.find(b => b.name === name);
      return {
        name,
        exists: !!bucket,
        public: bucket?.public || false,
        id: bucket?.id,
        created_at: bucket?.created_at
      };
    });
    
    // Get additional debug information
    let extraInfo = {};
    
    try {
      const { data: config } = await supabase.from('config').select('*').limit(1);
      extraInfo = { ...extraInfo, config_entry_exists: !!config };
    } catch (err) {
      extraInfo = { ...extraInfo, config_error: err instanceof Error ? err.message : 'Unknown error' };
    }
    
    // Get local storage configuration
    let storageConfig = null;
    try {
      const { data: localStorage } = await supabase.storage.getBucket('category-images');
      storageConfig = localStorage;
    } catch (err) {
      extraInfo = { ...extraInfo, storage_config_error: err instanceof Error ? err.message : 'Unknown error' };
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      buckets: bucketStatus,
      all_buckets: buckets || [],
      all_exist: bucketStatus.every(b => b.exists),
      missing_buckets: bucketStatus.filter(b => !b.exists).map(b => b.name),
      extra_info: extraInfo,
      storage_config: storageConfig
    });
    
  } catch (error) {
    console.error('Error getting bucket status:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error occurred while getting bucket status',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 