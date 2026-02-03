import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateCatalogPDF(containerClassName: string) {
    const pages = document.querySelectorAll(containerClassName);
    if (!pages.length) return;

    // A4 size in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;

        const canvas = await html2canvas(page, {
            scale: 2, // Higher resolution
            useCORS: true,
            backgroundColor: '#000000',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight(); // Use full page height for calc if we want stretch, but we keep aspect ratio

        // Calculate aspect ratio height for the image
        const imgRatioHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) pdf.addPage();

        // 1. Fill page with black to prevent white flashes/gaps
        pdf.setFillColor(5, 5, 5); // Matching user's detailed background roughly or just pure black
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

        // 2. Add image (Centered vertically if needed, or top aligned)
        // We stick to top aligned as per standard documents
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgRatioHeight);
    }

    pdf.save('MSI_Gaming_Catalog.pdf');
}
