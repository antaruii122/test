const fs = require('fs');
const path = require('path');

const htmlPath = path.join(process.cwd(), 'legacy', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

const match = html.match(/const catalogData = (\[[\s\S]*?\]);/);

if (match) {
    try {
        const data = JSON.parse(match[1]);
        console.log("Total items:", data.length);
        if (data.length > 0) {
            const firstItem = data[0];
            // Print keys and sample simple values, truncate huge strings like images
            const preview = {};
            for (const key in firstItem) {
                if (key === 'images') {
                    preview[key] = `[Array of ${firstItem[key].length} strings]`;
                } else if (typeof firstItem[key] === 'object') {
                    preview[key] = JSON.stringify(firstItem[key]).substring(0, 100) + "...";
                } else {
                    preview[key] = firstItem[key];
                }
            }
            console.log("First Item Structure:", JSON.stringify(preview, null, 2));
        }
    } catch (e) {
        console.error("Failed to parse JSON:", e.message);
        console.log("Snippet:", match[1].substring(0, 200));
    }
} else {
    console.error("Could not find catalogData variable.");
}
