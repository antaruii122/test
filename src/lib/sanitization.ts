/**
 * Centralized data sanitization utilities
 */

/**
 * Trims whitespace and removes double spaces from text.
 * @param value - The value to sanitize
 * @returns Cleaned string or empty string if null/undefined
 */
export const sanitizeText = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
};

/**
 * Extracts numeric value from a string, optionally stripping unit suffixes.
 * @param value - The value to parse
 * @returns The extracted number or 0 if invalid
 */
export const sanitizeNumericField = (value: any): number => {
    if (!value) return 0;
    const strValue = String(value);
    // Remove all non-numeric characters except decimal point
    const cleaned = strValue.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
};

/**
 * Normalizes measurement strings by removing units and returning just the value as a string.
 * Example: "350mm" -> "350", "2.5 inches" -> "2.5"
 * @param value - The value to normalize
 * @returns Normalized string
 */
export const normalizeUnit = (value: any): string => {
    if (!value) return '';
    const strValue = String(value);
    // similar to sanitizeNumericField but returns string and might handle specific unit logic if we need it later
    // For now, let's essentially strip non-numeric but keep it as string to preserve "350" vs 350
    const match = strValue.match(/([\d.]+)/);
    return match ? match[1] : '';
};

/**
 * Validates that a required field is present.
 * @param value - The value to check
 * @param fieldName - Name of the field for error message
 * @throws Error if validation fails
 */
export const validateRequiredField = (value: any, fieldName: string): string => {
    const sanitized = sanitizeText(value);
    if (!sanitized) {
        throw new Error(`${fieldName} is required`);
    }
    return sanitized;
};
