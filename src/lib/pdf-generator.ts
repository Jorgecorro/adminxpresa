import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Order, OrderItem } from '@/types/database';
import { formatCurrency, formatDate } from './utils';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: unknown) => jsPDF;
    }
}

interface QuotationData {
    quoteNumber: number;
    clientName: string;
    clientEmail: string;
    notes: string;
    items: OrderItem[];
    total: number;
    date: Date;
}

export async function generateQuotationPDF(data: QuotationData): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // 1. Header with Dark Polygon and White Logo
    // Draw the dark shape for the logo background
    doc.setFillColor(33, 33, 33);
    doc.triangle(0, 0, 110, 0, 80, 45, 'F');
    doc.rect(0, 0, 80, 45, 'F');

    try {
        // Try to load the white logo - ensure it's in public/logo-white.png
        const logoImg = await loadImage('/logo-white.png');
        const logoWidth = 50;
        const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
        doc.addImage(logoImg, 'PNG', 15, 10, logoWidth, logoHeight);
    } catch (e) {
        // Fallback text if logo fails
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('xpresa', 15, 25);
    }

    // Title and Date on the right
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(`COTIZACIÓN: ${data.quoteNumber}`, pageWidth - margin, 25, { align: 'right' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${formatDate(data.date)}`, pageWidth - margin, 35, { align: 'right' });

    let yPos = 60;

    // 2. Client Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del cliente:', margin, yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.text(`Nombre: ${data.clientName}`, margin, yPos);
    yPos += 7;
    doc.text(`Correo: ${data.clientEmail}`, margin, yPos);

    yPos += 15;

    // 3. Products Table
    const tableData = data.items.map(item => [
        item.quantity.toString(),
        item.product_name,
        formatCurrency(item.unit_price),
        formatCurrency(item.subtotal),
    ]);

    doc.autoTable({
        startY: yPos,
        head: [['Cantidad', 'Producto', 'Precio', 'Subtotal']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [33, 33, 33],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 4,
        },
        styles: {
            fontSize: 10,
            cellPadding: 4,
            valign: 'middle',
        },
        columnStyles: {
            0: { cellWidth: 25, halign: 'center' },
            1: { cellWidth: 'auto', fontStyle: 'bold' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' },
        },
    });

    const finalTableY = (doc as any).lastAutoTable.finalY;

    // Total Row
    doc.setFillColor(240, 240, 240);
    doc.rect(pageWidth - 90, finalTableY, 70, 12, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 33, 33);
    doc.text('TOTAL:', pageWidth - 80, finalTableY + 8);
    doc.text(formatCurrency(data.total), pageWidth - margin, finalTableY + 8, { align: 'right' });

    yPos = finalTableY + 30;

    // 4. Notes Section with Gray Background
    if (data.notes || true) { // Default notes if empty
        doc.setFillColor(235, 235, 235);
        doc.rect(margin, yPos, pageWidth - (margin * 2), 35, 'F');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Notas:', margin + 5, yPos + 10);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const defaultNotes = data.notes || "Tiempo de entrega 6 días hábiles\n\nSi requiere factura envie sus datos fiscales a ventas@xpresa.net";
        const splitNotes = doc.splitTextToSize(defaultNotes, pageWidth - (margin * 2) - 10);
        doc.text(splitNotes, margin + 5, yPos + 18);
    }

    // 5. Footer with dark background and company details
    doc.setFillColor(33, 33, 33);
    doc.rect(0, pageHeight - 35, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);

    // Left side footer
    let footerLeftY = pageHeight - 22;
    doc.setFont('helvetica', 'bold');
    doc.text('Xpresa Sport SA de C.V.', margin, footerLeftY);
    doc.setFont('helvetica', 'normal');
    doc.text('Fernando Montes de Oca 105,', margin, footerLeftY + 5);
    doc.text('La Laguna, Ezequiel Montes, Qro.', margin, footerLeftY + 10);

    // Right side footer
    let footerRightY = pageHeight - 22;
    doc.setFont('helvetica', 'bold');
    doc.text('Xpresa Sport SA de C.V.', pageWidth - margin, footerRightY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text('Cel. 442 382 5516', pageWidth - margin, footerRightY + 5, { align: 'right' });
    doc.text('ventas@xpresa.net', pageWidth - margin, footerRightY + 10, { align: 'right' });

    // Download
    doc.save(`Cotizacion_${data.quoteNumber}.pdf`);
}

const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
};

export async function generatePrevioPDF(order: Order, items: OrderItem[], vendedorName: string = 'Vendedor'): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    const isFootballOrder = items.some(item => {
        const name = (item.product_name || '').toLowerCase();
        return name.includes('uniforme futbol') || name.includes('uniforme de futbol');
    });

    const displayNumber = order.previo_number
        ? `Previo${order.previo_number}`
        : `Temp${order.temp_id}`;

    // 1. Header with Logo & Title
    try {
        // Try to load the logo - ensure it's in public/logo.png
        const logoImg = await loadImage('/logo.png');
        const logoWidth = 50;
        const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
        doc.addImage(logoImg, 'PNG', margin, 15, logoWidth, logoHeight);
    } catch (e) {
        // Fallback to stylized text if logo fails to load
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(0, 0, 0);
        doc.text('xpresa', margin, 25);
    }

    // Title in Red
    doc.setTextColor(180, 0, 0); // Redish
    doc.setFontSize(24);
    doc.text(displayNumber, pageWidth - margin, 20, { align: 'right' });

    // Date
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(order.created_at), pageWidth - margin, 28, { align: 'right' });

    // Divider Line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 38, pageWidth - margin, 38);

    let yPos = 48;

    // Reset colors
    doc.setTextColor(0, 0, 0);

    // 2. Images Section
    const imgWidth = 80;
    const imgHeight = 80;
    const gap = 10;
    const centralX = (pageWidth - (imgWidth * 2 + gap)) / 2;

    try {
        if (order.image_url) {
            const frontImg = await loadImage(order.image_url);
            doc.addImage(frontImg, 'JPEG', centralX, yPos, imgWidth, imgHeight);
        } else {
            doc.setDrawColor(240, 240, 240);
            doc.setFillColor(250, 250, 250);
            doc.rect(centralX, yPos, imgWidth, imgHeight, 'F');
            doc.setTextColor(200, 200, 200);
            doc.setFontSize(8);
            doc.text('Sin imagen frontal', centralX + imgWidth / 2, yPos + imgHeight / 2, { align: 'center' });
        }

        if (order.image_back_url) {
            const backImg = await loadImage(order.image_back_url);
            doc.addImage(backImg, 'JPEG', centralX + imgWidth + gap, yPos, imgWidth, imgHeight);
        } else {
            doc.setDrawColor(240, 240, 240);
            doc.setFillColor(250, 250, 250);
            doc.rect(centralX + imgWidth + gap, yPos, imgWidth, imgHeight, 'F');
            doc.setTextColor(200, 200, 200);
            doc.setFontSize(8);
            doc.text('Sin imagen espalda', centralX + imgWidth + gap + imgWidth / 2, yPos + imgHeight / 2, { align: 'center' });
        }
    } catch (e) {
        console.error('Error loading images for PDF:', e);
    }

    yPos += imgHeight + 15;

    // 3. Vendedor and Restante Info
    const restante = order.total_amount - order.anticipo;

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Vendedor: ${vendedorName}`, margin, yPos);
    doc.text(`Restante: ${formatCurrency(restante)}`, pageWidth - margin, yPos, { align: 'right' });

    yPos += 5;

    // 4. Products Table
    const tableData = items.map(item => [
        item.quantity.toString(),
        (item.size || '-').toUpperCase(),
        item.product_name,
    ]);

    doc.autoTable({
        startY: yPos,
        head: [['Cantidad', 'Talla', 'Producto']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [100, 100, 100],
            fontStyle: 'normal',
            lineWidth: 0.1,
            lineColor: [200, 200, 200],
        },
        styles: {
            fontSize: 10,
            cellPadding: 4,
            textColor: [50, 50, 50],
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
        },
        columnStyles: {
            0: { cellWidth: 25, halign: 'center' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 'auto' },
        },
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // 5. Conditional Uniform Details
    if (isFootballOrder) {
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);

        doc.text(`Calcetas: ${order.calcetas_color || 'N/A'}`, margin, yPos);
        doc.text(`Regalo: ${order.regalo_detalle || 'N/A'}`, pageWidth / 2 + 10, yPos);

        yPos += 12;
    }

    // 6. Notes
    if (order.notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Notas:', margin, yPos);
        doc.setFont('helvetica', 'normal');

        const splitNotes = doc.splitTextToSize(order.notes, pageWidth - (margin * 2));
        doc.text(splitNotes, margin, yPos + 6);
    }

    // Footer divider
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    // Download
    doc.save(`${displayNumber}.pdf`);
}

