const designs = [
    { id: 'design-blue', name: 'Institucional Azul', color: '#1e40af' },
    { id: 'design-red', name: 'Urgente Rojo', color: '#dc2626' },
    { id: 'design-green', name: 'Salud Verde', color: '#16a34a' },
    { id: 'design-orange', name: 'Aviso Naranja', color: '#ea580c' },
    { id: 'design-purple', name: 'Citación Morado', color: '#7e22ce' },
    { id: 'design-dark', name: 'Reporte Oscuro', color: '#334155' }
];

function getTemplateHTML(data, designId) {
    const instName = 'I.E. FRANCISCO BOLOGNESI';
    const subtitle = 'AUXILIAR DE EDUCACIÓN';
    
    // Generar la lista de estudiantes HTML
    let estudiantesHTML = '';
    if (data.estudiantes && data.estudiantes.length > 0) {
        estudiantesHTML = '<ul class="student-list-print">';
        data.estudiantes.forEach(est => {
            estudiantesHTML += `<li>${est}</li>`;
        });
        estudiantesHTML += '</ul>';
    }

    // Configurar el texto principal según el tipo
    let mensajeHTML = '';
    let iconHTML = '';
    let title = '';

    switch(data.type) {
        case 'evasion':
            title = 'REPORTE DE EVASIÓN';
            iconHTML = '🏃‍♂️';
            mensajeHTML = `<p>Atención padres de familia de <strong>${data.gradoSeccion || '[Grado/Sección]'}</strong>. Los siguientes alumnos no se encuentran en sus clases correspondientes:</p>
                           ${estudiantesHTML}
                           <p><strong>Detalles:</strong> ${data.detalles || 'Aprovecharon un descuido para poder evadirse del colegio.'}</p>
                           <p>Se pone en conocimiento a los padres de familia para que tomen las medidas correctivas.</p>`;
            break;
        case 'salida-temprana':
            title = 'SALIDA TEMPRANA';
            iconHTML = '🕒';
            mensajeHTML = `<p>Estimados padres de familia de <strong>${data.gradoSeccion || '[Grado/Sección]'}</strong>, buenas tardes. Sus menores hijos se están retirando ya a sus casas.</p>
                           <p><strong>El motivo es:</strong> ${data.detalles || 'Los docentes se encuentran en comisión o curso de capacitación.'}</p>`;
            break;
        case 'salud':
            title = 'CONSIDERACIÓN POR SALUD';
            iconHTML = '🏥';
            mensajeHTML = `<p>Tener consideración con el/los siguiente(s) estudiante(s) de <strong>${data.gradoSeccion || '[Grado/Sección]'}</strong>, por encontrarse mal de salud:</p>
                           ${estudiantesHTML}
                           <p><strong>Detalles:</strong> ${data.detalles || 'Se comunicó a los padres de familia para su retiro o atención médica.'}</p>`;
            break;
        case 'disciplina':
            title = 'REPORTE DE INDISCIPLINA';
            iconHTML = '👕';
            mensajeHTML = `<p>Lamento comunicar a los padres de familia de <strong>${data.gradoSeccion || '[Grado/Sección]'}</strong> que los siguientes alumnos no están cumpliendo con el reglamento interno del colegio (uso de buzo en días no permitidos o reacios al uso del uniforme escolar):</p>
                           ${estudiantesHTML}
                           <p><strong>Observaciones:</strong> ${data.detalles || 'Se comunica a sus padres para conocimiento y toma de acciones.'}</p>`;
            break;
        case 'citacion':
            title = 'CITACIÓN A PADRES DE FAMILIA';
            iconHTML = '📅';
            mensajeHTML = `<p>Se cita con carácter de urgencia a los padres de familia o apoderados de los siguientes alumnos de <strong>${data.gradoSeccion || '[Grado/Sección]'}</strong>:</p>
                           ${estudiantesHTML}
                           <div class="citacion-box">
                               <p><strong>Fecha de la cita:</strong> ${data.fechaCita || '---'}</p>
                               <p><strong>Hora:</strong> ${data.horaCita || '---'}</p>
                           </div>
                           <p><strong>Motivo / Tutor:</strong> ${data.detalles || 'Conversar asuntos disciplinarios o académicos.'}</p>`;
            break;
        case 'reporte-evidencia':
            title = 'REPORTE / ASISTENCIA';
            iconHTML = '📸';
            mensajeHTML = `<p>Comunicado para los padres de familia de <strong>${data.gradoSeccion || '[Grado/Sección]'}</strong>.</p>
                           <p><strong>Descripción:</strong> ${data.detalles || 'Se adjunta reporte o evidencia fotográfica (asistencia, incidencias, etc.).'}</p>
                           ${estudiantesHTML}`;
            break;
    }

    // Foto de evidencia si existe
    let evidenciaHTML = '';
    if (data.fotoEvidencia) {
        evidenciaHTML = `<div class="evidencia-container">
                            <img src="${data.fotoEvidencia}" alt="Evidencia fotográfica">
                         </div>`;
    }

    // Fecha actual formateada
    let todayStr = '';
    if (data.fecha) {
        const [y, m, d] = data.fecha.split('-');
        todayStr = `${d}/${m}/${y}`;
    } else {
        todayStr = new Date().toLocaleDateString('es-ES');
    }

    let content = `
        <div class="wa-header">
            <img src="${logoBase64}" class="wa-logo" alt="Logo">
            <div class="wa-inst-info">
                <h1>${instName}</h1>
                <h2>${subtitle}</h2>
            </div>
        </div>
        
        <div class="wa-body">
            <div class="wa-title-box">
                <span class="wa-title-icon">${iconHTML}</span>
                <span class="wa-title-text">${title}</span>
            </div>
            
            <div class="wa-message-content">
                ${mensajeHTML}
                ${evidenciaHTML}
            </div>
        </div>
        
        <div class="wa-footer">
            <div class="wa-date">Fecha del reporte: ${todayStr}</div>
            <div class="wa-firma">
                AUXILIAR DE EDUCACIÓN SECUNDARIA
            </div>
        </div>
    `;

    return `<div class="wa-card ${designId}">${content}</div>`;
}

// Estilos dinámicos para la tarjeta de WhatsApp
const styleEl = document.createElement('style');
styleEl.textContent = `
    .wa-card {
        width: 1080px;
        height: 1350px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        font-family: 'Outfit', sans-serif;
        color: #1e293b;
        position: relative;
        overflow: hidden;
    }

    /* Colores por diseño */
    .design-blue { --theme-color: #1e40af; --theme-light: #eff6ff; }
    .design-red { --theme-color: #dc2626; --theme-light: #fef2f2; }
    .design-green { --theme-color: #16a34a; --theme-light: #f0fdf4; }
    .design-orange { --theme-color: #ea580c; --theme-light: #fff7ed; }
    .design-purple { --theme-color: #7e22ce; --theme-light: #faf5ff; }
    .design-dark { --theme-color: #334155; --theme-light: #f8fafc; }

    .wa-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 30px;
        background: var(--theme-color);
    }
    .wa-card::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 20px;
        background: var(--theme-color);
    }

    .wa-header {
        display: flex;
        align-items: center;
        gap: 40px;
        padding: 70px 80px 40px;
        border-bottom: 3px solid #e2e8f0;
    }

    .wa-logo {
        width: 160px;
        height: 160px;
        object-fit: contain;
    }

    .wa-inst-info h1 {
        font-size: 48px;
        font-weight: 800;
        color: var(--theme-color);
        margin: 0 0 10px 0;
        line-height: 1.1;
    }

    .wa-inst-info h2 {
        font-size: 32px;
        font-weight: 600;
        color: #64748b;
        margin: 0;
        letter-spacing: 2px;
    }

    .wa-body {
        flex: 1;
        padding: 50px 80px;
        display: flex;
        flex-direction: column;
        gap: 40px;
    }

    .wa-title-box {
        display: flex;
        align-items: center;
        gap: 25px;
        background-color: var(--theme-color);
        color: white;
        padding: 25px 40px;
        border-radius: 24px;
    }

    .wa-title-icon {
        font-size: 60px;
    }

    .wa-title-text {
        font-size: 50px;
        font-weight: 800;
        letter-spacing: 1px;
    }

    .wa-message-content {
        font-size: 40px;
        line-height: 1.5;
        background: var(--theme-light);
        padding: 40px;
        border-radius: 24px;
        border: 2px solid var(--theme-color);
        flex: 1;
        overflow: hidden;
    }

    .wa-message-content p {
        margin-bottom: 30px;
    }
    
    .wa-message-content p:last-child {
        margin-bottom: 0;
    }

    .student-list-print {
        background: white;
        padding: 30px 30px 30px 60px;
        border-radius: 16px;
        margin: 30px 0;
        border: 2px dashed #cbd5e1;
    }

    .student-list-print li {
        margin-bottom: 15px;
        font-weight: 600;
        font-size: 42px;
    }

    .citacion-box {
        background: white;
        padding: 30px;
        border-radius: 16px;
        border-left: 8px solid var(--theme-color);
        margin: 30px 0;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .citacion-box p {
        margin-bottom: 15px !important;
        font-size: 44px;
    }

    .evidencia-container {
        margin-top: 40px;
        text-align: center;
        height: 380px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #000;
        border-radius: 20px;
        overflow: hidden;
    }

    .evidencia-container img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .wa-footer {
        padding: 0 80px 60px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .wa-date {
        font-size: 34px;
        font-weight: 600;
        color: #64748b;
        background: #f1f5f9;
        padding: 15px 30px;
        border-radius: 12px;
    }

    .wa-firma {
        text-align: center;
        font-size: 34px;
        font-weight: 800;
        color: var(--theme-color);
        width: 500px;
    }

    .firma-line {
        height: 4px;
        background: var(--theme-color);
        margin-bottom: 15px;
    }
`;
document.head.appendChild(styleEl);
