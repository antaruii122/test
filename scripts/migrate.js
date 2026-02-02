
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://baijfzqjgvgbfzuauroi.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_KgxbQGt7kRlk52ju5V0OPQ_xWxbVHgS';
const BUCKET_NAME = 'catalog';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function decodeBase64Image(dataString) {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }
    return Buffer.from(matches[2], 'base64');
}

function extractPrice(data) {
    const prices = [];
    const priceKeywords = ['PRECIO', 'FOB', 'Precio', 'PRICE', 'foc', 'Total'];

    for (const [key, value] of Object.entries(data)) {
        if (!value) continue;
        const valStr = String(value);
        const hasKeyword = priceKeywords.some(kw => valStr.includes(kw)); // simplified: usually label is in key or nearby, but legacy logic checked value too
        // Legacy logic: key.includes(kw) || value.includes(kw)
        // But data keys are "A1", "B2". They won't include keywords. 
        // Wait, the legacy extractPrice checked `key.includes`... BUT keys are "A1" etc.
        // Unless 'data' passes something else? 
        // No, legacy code: for (const [key, value] of Object.entries(data))...
        // Maybe some keys ARE labels? "A2" is just coordinates.
        // Ah, maybe the cell CONTENT has the label? Yes.
        // `value.includes(kw)` is the main driver.

        if (hasKeyword) {
            // It splits numbers. 
            // Legacy regex: /[^0-9.,]/g
            const numStr = valStr.replace(/[^0-9.,]/g, '');
            // Replace first comma with dot if present? Legacy: .replace(',', '.')
            if (numStr) {
                const num = parseFloat(numStr.replace(',', '.'));
                if (!isNaN(num) && num > 0) {
                    prices.push(num);
                }
            }
        }
    }
    // Also check explicit neighbors if needed, but let's stick to legacy "dumb search" first.
    return [...new Set(prices)];
}

function parseSpecs(data) {
    const specs = [];
    const processed = new Set();
    const skipWords = ['PRECIO', 'PRICE', 'FOB', 'Image', 'imagen', 'Photo'];

    for (let row = 1; row <= 50; row++) {
        const labelA = data[`A${row}`];
        const valueB = data[`B${row}`];
        const valueC = data[`C${row}`];
        const labelB = data[`B${row}`]; // For case 2

        // Case 1: Col A is label
        if (labelA && (valueB || valueC)) {
            const lA = String(labelA);
            const vB = valueB ? String(valueB) : '';
            const vC = valueC ? String(valueC) : '';

            const shouldSkip = skipWords.some(word => lA.includes(word) || vB.includes(word));
            if (!shouldSkip && lA !== vB && lA !== vC) {
                const key = `A${row}`;
                if (!processed.has(key)) {
                    specs.push({ label: lA, value: vB || vC });
                    processed.add(key);
                }
            }
        }

        // Case 2: Col B is label, C is value
        if (labelB && valueC) {
            const lB = String(labelB);
            const vC = String(valueC);
            if (lB !== vC) {
                const shouldSkip = skipWords.some(word => lB.includes(word) || vC.includes(word));
                // Also ensure we didn't just consume this row in Case 1?
                // processed check handles it if keys overlap, but here keys are different (A vs B).
                // We rely on order.
                const key = `B${row}`;
                if (!shouldSkip && !processed.has(key)) {
                    specs.push({ label: lB, value: vC });
                    processed.add(key);
                }
            }
        }
    }
    return specs;
}

async function migrate() {
    console.log("Starting migration...");

    // 1. Read HTML
    const htmlPath = path.join(process.cwd(), 'legacy', 'index.html');
    if (!fs.existsSync(htmlPath)) {
        console.error("legacy/index.html not found!");
        return;
    }
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const match = html.match(/const catalogData = (\[[\s\S]*?\]);/);
    if (!match) {
        console.error("No catalogData found");
        return;
    }

    let catalogData;
    try {
        catalogData = JSON.parse(match[1]);
    } catch (e) {
        console.error("JSON parse failed", e);
        return;
    }

    console.log(`Found ${catalogData.length} items to migrate.`);

    for (const item of catalogData) {
        const title = item.filename.replace('.xlsx', '').replace('.xls', '').replace(/_/g, ' ');
        console.log(`Processing: ${title}`);

        // 2. Insert Page
        const { data: pageData, error: pageError } = await supabase
            .from('pages')
            .insert({
                title: title
            })
            .select()
            .single();

        if (pageError) {
            console.error(`Error creating page ${title}:`, pageError);
            continue;
        }

        const pageId = pageData.id;

        // 3. Upload Images & Insert
        if (item.images && item.images.length > 0) {
            let order = 0;
            for (const base64Str of item.images) {
                try {
                    const buffer = decodeBase64Image(base64Str);
                    const timestamp = Date.now();
                    const fileName = `${pageId}/${order}_${timestamp}.jpg`;

                    const { data: uploadData, error: uploadError } = await supabase
                        .storage
                        .from(BUCKET_NAME)
                        .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

                    if (uploadError) {
                        console.error(`  Upload error: ${uploadError.message}`);
                    } else {
                        const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName).data.publicUrl;

                        await supabase.from('images').insert({
                            page_id: pageId,
                            url: publicUrl,
                            display_order: order++
                        });
                    }
                } catch (imgErr) {
                    console.error("  Image processing error:", imgErr.message);
                }
            }
        }

        // 4. Prices
        const extractedPrices = extractPrice(item.data);
        if (extractedPrices.length > 0) {
            for (const price of extractedPrices) {
                await supabase.from('prices').insert({
                    page_id: pageId,
                    amount: price,
                    currency: 'USD'
                });
            }
        }

        // 5. Specs
        const specs = parseSpecs(item.data);
        if (specs.length > 0) {
            const specRows = specs.map((s, idx) => ({
                page_id: pageId,
                label: s.label,
                value: s.value,
                display_order: idx
            }));
            await supabase.from('specifications').insert(specRows);
        }

        console.log(`  Done. Images: ${item.images.length}, Prices: ${extractedPrices.length}, Specs: ${specs.length}`);
    }

    console.log("Migration complete.");
}

migrate();
