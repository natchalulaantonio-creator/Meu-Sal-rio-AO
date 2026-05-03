// src/lib/pdfService.ts
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export interface PDFData {
  title: string;
  userName: string;
  details: { label: string; value: string }[];
  summary: { label: string; value: string }[];
}

export const generateProfessionalPDF = (data: PDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(30, 58, 138); // Primary color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Meu Salário AO', 20, 25);
  doc.setFontSize(10);
  doc.text('Calculadora Oficial de RH - Angola', 20, 32);
  
  doc.setFontSize(10);
  doc.text(`Data: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - 20, 25, { align: 'right' });
  
  // Content
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.text(data.title, 20, 55);
  
  doc.setFontSize(10);
  doc.text(`Preparado para: ${data.userName}`, 20, 62);
  
  // Details Table
  let y = 75;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, y - 5, pageWidth - 20, y - 5);
  
  data.details.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, 20, y);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, pageWidth - 20, y, { align: 'right' });
    y += 10;
  });
  
  // Summary
  y += 10;
  doc.setFillColor(248, 250, 252);
  doc.rect(20, y, pageWidth - 40, 25, 'F');
  
  data.summary.forEach((item, index) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(item.label, 30, y + 16);
    doc.setFontSize(16);
    doc.text(item.value, pageWidth - 30, y + 16, { align: 'right' });
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Este documento é uma simulação informativa baseada na legislação vigente.', pageWidth / 2, 280, { align: 'center' });
  
  doc.save(`${data.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
