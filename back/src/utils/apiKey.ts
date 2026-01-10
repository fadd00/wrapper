/**
 * API Key generation and validation utilities
 * Format: wp_<32_random_characters>
 */

/**
 * Generate a random API key with wp_ prefix
 * Example: wp_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 */
export function generateApiKey(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    let key = '';

    for (let i = 0; i < length; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
    }

    return `wp_${key}`;
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
    return /^wp_[a-z0-9]{32}$/.test(key);
}
