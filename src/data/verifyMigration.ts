/**
 * Migration Verification Script
 * 
 * This script verifies that the migration is finding and processing all files.
 * Run this to debug migration issues.
 */

// This is a helper script - not used in production
// It's here to help verify the glob pattern works

export function verifyGlobPattern(): void {
  console.log('=== VERIFICATION: Testing Glob Patterns ===');
  
  // Test pattern 1
  try {
    const pattern1 = import.meta.glob('/PCV1_final/src/data/interview/**/*.json', { eager: true });
    console.log(`Pattern 1 (/PCV1_final/...): ${Object.keys(pattern1).length} files`);
    if (Object.keys(pattern1).length > 0) {
      console.log('  Sample files:', Object.keys(pattern1).slice(0, 5));
    }
  } catch (e) {
    console.error('Pattern 1 failed:', e);
  }
  
  // Test pattern 2
  try {
    const pattern2 = import.meta.glob('../../PCV1_final/src/data/interview/**/*.json', { eager: true });
    console.log(`Pattern 2 (../../PCV1_final/...): ${Object.keys(pattern2).length} files`);
    if (Object.keys(pattern2).length > 0) {
      console.log('  Sample files:', Object.keys(pattern2).slice(0, 5));
    }
  } catch (e) {
    console.error('Pattern 2 failed:', e);
  }
  
  // Test pattern 3
  try {
    const pattern3 = import.meta.glob('../PCV1_final/src/data/interview/**/*.json', { eager: true });
    console.log(`Pattern 3 (../PCV1_final/...): ${Object.keys(pattern3).length} files`);
    if (Object.keys(pattern3).length > 0) {
      console.log('  Sample files:', Object.keys(pattern3).slice(0, 5));
    }
  } catch (e) {
    console.error('Pattern 3 failed:', e);
  }
  
  console.log('=== END VERIFICATION ===');
}

