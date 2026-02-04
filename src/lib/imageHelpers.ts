/**
 * Checks if a string is a Base64 image data URI.
 * @param str - The string to check
 * @returns True if it looks like a Base64 image
 */
export const isBase64Image = (str: string): boolean => {
    return /^data:image\/[a-zA-Z]+;base64,/.test(str);
};

/**
 * Converts a Base64 string to a File object.
 * @param base64Data - The full Base64 string (including prefix)
 * @param filename - The filename to assign to the file
 * @returns File object
 */
export const base64ToFile = (base64Data: string, filename: string): File => {
    const arr = base64Data.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};
