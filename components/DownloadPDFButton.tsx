'use client';

export interface MemberForPDF {
  designation: string;
  name: string;
  club: string;
  classification: string;
  mobile: string;
  blood: string;
  email: string;
  address: string;
  dob: string;
  rid: string;
  img: string;
  headerColor: string;
  bodyColor: string;
}

interface Props {
  members: MemberForPDF[];
  title: string;
  filename: string;
}

export default function DownloadPDFButton({ members, title, filename }: Props) {
  const handleDownload = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    const colW = (pageW - margin * 2 - 6) / 2;
    let x = margin;
    let y = 20;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageW / 2, y, { align: 'center' });
    y += 12;

    members.forEach((m, i) => {
      const cardH = 60;
      if (y + cardH > doc.internal.pageSize.getHeight() - 14) {
        doc.addPage();
        y = 20;
        x = margin;
      }

      // Card background
      doc.setFillColor(m.bodyColor);
      doc.roundedRect(x, y, colW, cardH, 3, 3, 'F');

      // Header bar
      doc.setFillColor(m.headerColor);
      doc.roundedRect(x, y, colW, 10, 3, 3, 'F');
      doc.setFillColor(m.headerColor);
      doc.rect(x, y + 5, colW, 5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(m.designation, x + colW / 2, y + 7, { align: 'center', maxWidth: colW - 4 });

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      const tx = x + 4;
      let ty = y + 16;
      const lineH = 5.5;

      const line = (label: string, value: string) => {
        if (!value) return;
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, tx, ty);
        doc.setFont('helvetica', 'normal');
        doc.text(value, tx + doc.getTextWidth(`${label}: `), ty, { maxWidth: colW - doc.getTextWidth(`${label}: `) - 4 });
        ty += lineH;
      };

      line('Name', m.name);
      line('Club', m.club);
      line('Mobile', m.mobile);
      line('Email', m.email);
      if (m.dob) line('DOB', m.dob);
      if (m.blood) line('Blood', m.blood);
      if (m.rid) line('RI', m.rid);

      // Move to next column or next row
      if (i % 2 === 0) {
        x = margin + colW + 6;
      } else {
        x = margin;
        y += cardH + 6;
      }
    });

    doc.save(filename);
  };

  return (
    <button onClick={handleDownload} className="theme-btn btn-one dist-btn" type="button">
      Download PDF
    </button>
  );
}
