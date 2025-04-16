import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

// This is a simplified API specifically for creating the category-images storage bucket
// Skips authentication to simplify the troubleshooting process
export async function GET() {
  try {
    // Get Supabase client
    const supabase = getSupabaseClient();
    
    // Check if bucket exists
    const { data: existingBuckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return NextResponse.json(
        { error: `Failed to get bucket list: ${bucketsError.message}` },
        { status: 500 }
      );
    }
    
    // Check if category-images bucket already exists
    const bucketExists = existingBuckets?.some(bucket => bucket.name === 'category-images') || false;
    
    if (bucketExists) {
      return NextResponse.json({ 
        success: true, 
        message: 'category-images bucket already exists',
        created: false
      });
    }
    
    // Create category-images bucket
    const { error } = await supabase.storage.createBucket('category-images', { public: true });
    
    if (error) {
      return NextResponse.json(
        { 
          error: `Failed to create category-images bucket: ${error.message}`,
          success: false
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully created category-images bucket',
      created: true
    });
    
  } catch (error) {
    console.error('Error creating category-images bucket:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error occurred while creating category-images bucket',
        success: false
      },
      { status: 500 }
    );
  }
} 