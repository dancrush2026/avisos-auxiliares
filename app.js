document.addEventListener('DOMContentLoaded', async () => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.error('SW Error:', err));
    }

    // Inicializar DB
    await initDB();
    
    // Variables de Estado
    let currentDocType = '';
    let currentDesignId = designs[0].id;
    let currentEditingId = null;
    let estudiantesList = [];
    let fotoEvidenciaBase64 = null;

    // --- ELEMENTOS DEL DOM ---
    const docSelectionScreen = document.getElementById('doc-selection-screen');
    const editorScreen = document.getElementById('editor-screen');
    const btnBack = document.getElementById('btn-back');
    const currentDocTitle = document.getElementById('current-doc-title');
    const docWa = document.getElementById('doc-wa');

    // Inputs
    const selGrado = document.getElementById('sel-grado');
    const selSeccion = document.getElementById('sel-seccion');
    const inputFecha = document.getElementById('fecha');
    const inputDetalles = document.getElementById('detalles-texto');
    const inputFechaCita = document.getElementById('fecha-cita');
    const inputHoraCita = document.getElementById('hora-cita');
    const inputNuevoEstudiante = document.getElementById('nuevo-estudiante');
    const btnAddStudent = document.getElementById('btn-add-student');
    const listaEstudiantesEl = document.getElementById('lista-estudiantes');
    const inputFoto = document.getElementById('foto-evidencia');
    const previewFoto = document.getElementById('preview-evidencia');
    const btnRemoveFoto = document.getElementById('btn-remove-foto');

    // Secciones Dinámicas
    const secEstudiantes = document.getElementById('estudiantes-section');
    const secDetalles = document.getElementById('detalles-section');
    const lblDetalles = document.getElementById('lbl-detalles');
    const secCita = document.getElementById('cita-section');
    const secEvidencia = document.getElementById('evidencia-section');

    // Generar Selector de Diseños
    const designsSelector = document.getElementById('designs-selector');
    designs.forEach(design => {
        const thumb = document.createElement('div');
        thumb.className = 'design-thumb ' + design.id;
        thumb.style.backgroundColor = design.color;
        if(design.id === currentDesignId) thumb.classList.add('active');
        thumb.title = design.name;
        thumb.dataset.id = design.id;
        thumb.addEventListener('click', () => {
            document.querySelectorAll('.design-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            currentDesignId = design.id;
            updatePreview();
        });
        designsSelector.appendChild(thumb);
    });

    // --- NAVEGACIÓN ---
    document.querySelectorAll('.doc-card').forEach(card => {
        card.addEventListener('click', () => {
            currentDocType = card.dataset.type;
            currentDocTitle.textContent = card.querySelector('h3').textContent;
            
            // Set colors based on type
            const designMap = {
                'evasion': 'design-red',
                'salida-temprana': 'design-orange',
                'salud': 'design-green',
                'disciplina': 'design-blue',
                'citacion': 'design-purple',
                'reporte-evidencia': 'design-dark'
            };
            
            currentDesignId = designMap[currentDocType] || designs[0].id;
            document.querySelectorAll('.design-thumb').forEach(t => {
                t.classList.remove('active');
                if (t.dataset.id === currentDesignId) t.classList.add('active');
            });

            resetForm();
            setupDynamicFields(currentDocType);
            
            docSelectionScreen.classList.remove('active');
            editorScreen.classList.remove('hidden');
            editorScreen.classList.add('active');
            
            updatePreview();
        });
    });

    btnBack.addEventListener('click', () => {
        editorScreen.classList.remove('active');
        editorScreen.classList.add('hidden');
        docSelectionScreen.classList.add('active');
        loadHistory();
    });

    // --- LÓGICA DEL FORMULARIO ---
    
    function setupDynamicFields(type) {
        // Reset visibilidad
        secEstudiantes.classList.remove('hidden');
        secDetalles.classList.remove('hidden');
        secCita.classList.add('hidden');
        secEvidencia.classList.add('hidden');
        
        switch(type) {
            case 'evasion':
                lblDetalles.textContent = 'Profesor a cargo / Observaciones';
                break;
            case 'salida-temprana':
                secEstudiantes.classList.add('hidden'); // Todo el salon
                lblDetalles.textContent = 'Motivo del retiro de alumnos';
                break;
            case 'salud':
                lblDetalles.textContent = 'Detalles (Enfermedad / Acciones)';
                break;
            case 'disciplina':
                lblDetalles.textContent = 'Observaciones (buzo, rebeldía, etc.)';
                break;
            case 'citacion':
                lblDetalles.textContent = 'Motivo de la citación / Tutor';
                secCita.classList.remove('hidden');
                break;
            case 'reporte-evidencia':
                lblDetalles.textContent = 'Descripción de la incidencia';
                secEvidencia.classList.remove('hidden');
                break;
        }
    }

    // Estudiantes
    function renderEstudiantes() {
        listaEstudiantesEl.innerHTML = '';
        estudiantesList.forEach((est, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${est}</span> <button class="btn-remove" data-index="${index}">×</button>`;
            listaEstudiantesEl.appendChild(li);
        });
        
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                estudiantesList.splice(index, 1);
                renderEstudiantes();
                updatePreview();
            });
        });
    }

    btnAddStudent.addEventListener('click', () => {
        const val = inputNuevoEstudiante.value.trim();
        if (val) {
            estudiantesList.push(val);
            inputNuevoEstudiante.value = '';
            renderEstudiantes();
            updatePreview();
        }
    });

    inputNuevoEstudiante.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnAddStudent.click();
        }
    });

    // Foto Evidencia
    inputFoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                fotoEvidenciaBase64 = evt.target.result;
                previewFoto.src = fotoEvidenciaBase64;
                previewFoto.style.display = 'block';
                btnRemoveFoto.classList.remove('hidden');
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    btnRemoveFoto.addEventListener('click', () => {
        fotoEvidenciaBase64 = null;
        inputFoto.value = '';
        previewFoto.src = '';
        previewFoto.style.display = 'none';
        btnRemoveFoto.classList.add('hidden');
        updatePreview();
    });

    // Eventos para actualizar vista previa en tiempo real
    [selGrado, selSeccion, inputFecha, inputDetalles, inputFechaCita, inputHoraCita].forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    function resetForm() {
        selGrado.value = '1ro';
        selSeccion.value = 'A';
        inputFecha.value = new Date().toISOString().split('T')[0];
        inputDetalles.value = '';
        inputFechaCita.value = '';
        inputHoraCita.value = '';
        inputNuevoEstudiante.value = '';
        estudiantesList = [];
        renderEstudiantes();
        btnRemoveFoto.click(); // limpia foto
        currentEditingId = null;
    }

    // --- ACTUALIZACIÓN VISTA PREVIA ---
    function updatePreview() {
        const formData = {
            type: currentDocType,
            gradoSeccion: selGrado.value + ' ' + selSeccion.value,
            fecha: inputFecha.value,
            estudiantes: estudiantesList,
            detalles: inputDetalles.value,
            fechaCita: inputFechaCita.value,
            horaCita: inputHoraCita.value,
            fotoEvidencia: fotoEvidenciaBase64
        };

        if(formData.fechaCita) {
             const [y, m, d] = formData.fechaCita.split('-');
             formData.fechaCita = `${d}/${m}/${y}`;
        }

        docWa.innerHTML = getTemplateHTML(formData, currentDesignId);
        
        // Scale logic for preview
        const wrapper = document.getElementById('preview-wa');
        const scale = wrapper.clientWidth / 1080;
        docWa.style.transform = `scale(${scale})`;
    }

    window.addEventListener('resize', updatePreview); // Rescale on window resize

    // --- ACCIONES DE COMPARTIR Y GUARDAR ---
    function getCleanFilename() {
        const dateStr = inputFecha.value || new Date().toISOString().split('T')[0];
        let name = currentDocType.toUpperCase().replace('-', '_');
        return `AVISO_${name}_${dateStr}`;
    }

    async function generateImageBlob() {
        // We temporarily remove the scale transform so html2canvas captures full 1080x1350 resolution
        docWa.style.transform = 'scale(1)';
        const canvas = await html2canvas(docWa, {
            scale: 1, 
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        
        // Restore scale
        updatePreview();
        
        return new Promise(resolve => {
            canvas.toBlob(blob => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    }

    document.getElementById('btn-share-wa').addEventListener('click', async () => {
        try {
            const blob = await generateImageBlob();
            const file = new File([blob], getCleanFilename() + '.jpg', { type: 'image/jpeg' });
            
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Aviso Auxiliar',
                    text: 'Se adjunta aviso importante.'
                });
            } else {
                alert('Compartir archivos no está soportado en este navegador. Por favor guarda la imagen e intenta enviarla manualmente.');
                document.getElementById('btn-dl-jpg').click();
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Hubo un error al intentar compartir.');
        }
    });

    document.getElementById('btn-dl-jpg').addEventListener('click', async () => {
        const blob = await generateImageBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getCleanFilename() + '.jpg';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('btn-save').addEventListener('click', async () => {
        const doc = {
            id: currentEditingId,
            type: currentDocType,
            designId: currentDesignId,
            formData: {
                gradoSeccion: selGrado.value + ' ' + selSeccion.value,
                grado: selGrado.value,
                seccion: selSeccion.value,
                fecha: inputFecha.value,
                detalles: inputDetalles.value,
                fechaCita: inputFechaCita.value,
                horaCita: inputHoraCita.value,
                estudiantes: estudiantesList,
                fotoEvidencia: fotoEvidenciaBase64
            }
        };

        if(!doc.id) delete doc.id; 
        
        await saveDocument(doc);
        alert('Aviso guardado en borradores/historial');
    });

    // --- HISTORIAL ---
    async function loadHistory() {
        const docs = await getAllDocuments();
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        
        if(docs.length === 0) {
            list.innerHTML = '<p style="color:#64748b;">No hay reportes recientes.</p>';
            return;
        }

        docs.forEach(doc => {
            const el = document.createElement('div');
            el.className = 'history-item';
            el.innerHTML = `
                <div>
                    <strong style="color:var(--primary-dark)">${doc.type.toUpperCase().replace('-', ' ')}</strong><br>
                    <small style="color:var(--text-muted)">${doc.formData.gradoSeccion || 'Sin Grado'} - ${doc.formData.fecha}</small>
                </div>
                <div class="btn-group">
                    <button class="btn-secondary btn-edit" style="padding:0.4rem;">Editar</button>
                    <button class="btn-secondary btn-del" style="padding:0.4rem; color:var(--primary-red);">Eliminar</button>
                </div>
            `;

            el.querySelector('.btn-edit').addEventListener('click', () => loadDocumentToEditor(doc));
            el.querySelector('.btn-del').addEventListener('click', async () => {
                if(confirm('¿Eliminar este aviso?')) {
                    await deleteDocument(doc.id);
                    loadHistory();
                }
            });

            list.appendChild(el);
        });
    }

    function loadDocumentToEditor(doc) {
        currentDocType = doc.type;
        currentDesignId = doc.designId;
        currentEditingId = doc.id;
        
        // Título y diseño
        currentDocTitle.textContent = 'Editar Aviso';
        document.querySelectorAll('.design-thumb').forEach(t => {
            t.classList.remove('active');
            if(t.dataset.id === currentDesignId) t.classList.add('active');
        });

        // Configurar formulario
        setupDynamicFields(currentDocType);

        // Restaurar datos
        const data = doc.formData;
        if (data.grado) selGrado.value = data.grado;
        if (data.seccion) selSeccion.value = data.seccion;
        inputFecha.value = data.fecha || '';
        inputDetalles.value = data.detalles || '';
        inputFechaCita.value = data.fechaCita || '';
        inputHoraCita.value = data.horaCita || '';
        
        estudiantesList = data.estudiantes || [];
        renderEstudiantes();

        if (data.fotoEvidencia) {
            fotoEvidenciaBase64 = data.fotoEvidencia;
            previewFoto.src = fotoEvidenciaBase64;
            previewFoto.style.display = 'block';
            btnRemoveFoto.classList.remove('hidden');
        } else {
            btnRemoveFoto.click();
        }

        docSelectionScreen.classList.remove('active');
        editorScreen.classList.remove('hidden');
        editorScreen.classList.add('active');
        
        updatePreview();
    }

    // Inicializar historial
    loadHistory();
});
