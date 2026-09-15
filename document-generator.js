async function generateJPG(elementId, filename) {
    const container = document.getElementById(elementId);
    const element = container.querySelector('.doc-container') || container;
    
    // Configurar html2canvas para la mejor calidad
    const canvas = await html2canvas(element, {
        scale: 2, // Retained for high resolution
        useCORS: true,
        backgroundColor: '#ffffff'
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    return { dataUrl, filename: `${filename}.jpg` };
}

function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
}

async function shareViaWhatsApp(dataUrl, filename, text) {
    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: 'image/jpeg' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Documento Institucional',
                text: text,
                files: [file]
            });
            console.log('Shared successfully');
        } else {
            // Fallback for browsers/devices that don't support Web Share API with files
            alert('Imagen guardada. Abra WhatsApp y adjúntela para compartir.');
            downloadImage(dataUrl, filename);
        }
    } catch (error) {
        console.error('Error sharing:', error);
        alert('Imagen guardada. Abra WhatsApp y adjúntela para compartir.');
        downloadImage(dataUrl, filename);
    }
}

async function generatePDF(elementId, filename) {
    const container = document.getElementById(elementId);
    const element = container.querySelector('.doc-container') || container;
    
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0; //(pdfHeight - imgHeight * ratio) / 2;
    
    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${filename}.pdf`);
}

function printDocument(elementId) {
    const element = document.getElementById(elementId);
    
    // Crear un iframe oculto para imprimir
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const printDoc = iframe.contentWindow.document;
    printDoc.write('<html><head><title>Imprimir Documento</title>');
    
    // Copiar estilos
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(style => {
        printDoc.write(style.outerHTML);
    });
    
    printDoc.write('</head><body>');
    printDoc.write(element.innerHTML);
    printDoc.write('</body></html>');
    printDoc.close();
    
    iframe.contentWindow.focus();
    setTimeout(() => {
        iframe.contentWindow.print();
        document.body.removeChild(iframe);
    }, 500); // Dar tiempo para que carguen los estilos
}
