const api_url = 'htpp://localhost:3000/tasks';

let author = localStorage.getItem('todo_author_session');

const curenUsertext = document.getElementByid('currenUser');
const logoutBtn = document.getElementById('logoutBtn'); 
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const tasContainer =document.getElementById('taskContainer');

const customModal = document.getElementById('custoModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const loginInput = document.getElementById('loginInput');

function openCustmModal(title, message, isConfirm = false, onConfirmCallback = null) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modalCancelBtn.style.display = isConfirm ? 'block' : 'none';
    customModal.classList.add('active');

    const nuevoconfirmBtn = modalConfirmBtn.cloneNode(true);
    const nuevoCancelBtn = modalCancelBtn.cloneNode(true);
    modalCancelBtn.parentNode.replaceChild(nuevoconfirmBtn,modalConfirmBtn);
    modalCancelBtn.parentNode.removeChild(nuevoCancelBtn, modalCancelBtn);

    nuevoconfirmBtn.addEventListener('click', () => {
        customModal.classList.remove('active');
        if (onConfirmCallback) onConfirmCallback();
    });

    nuevoCancelBtn.addEventListener('click', () => {
        customModal.classList.remove('active');
    });
}

function checkAuth() {
    if (!AUTHOR) {
        loginModal.classList.add('active')
    } else {
        loginModal.classList.remove('active');
        curenUsertext.textContent = AUTHOR;
        fetchtask();
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = loginInput.value.trim();

    if (name && name.length >= 2) {
        AUTHOR = name;
        localStorage.setItem('todo_author-session', AUTHOR);
        loginModal.classList.remove('active');
        curenUsertext.textContent = AUTHOR;
        fetchtask();
    } else {
        openCustmModal('validacion', 'por favor ingresa un nombre valido (minimo 2 caracteres).' , false);
    }
});

async function fetchtask() {
    try {
        const response = await fetcht(API_URL);
        const json = await response.json();

        if (json.status === 'success' && json.data.tasks) {
            rendertasks(json.data.tasks);
        }
    } catch (error) {
        console.error('error de red:' , error);
        tasksContainer.innerHTML = '<p class="error">No se pudo conectar con el servidor nativo.</p>';
    }
}

function rendertasks(tasks) {
    tasksContainer.innerHTML = '';

    if (tasks.length === 0) {
        tasContainer.innerHTML = '<p class="empty"> No hay tareas pendientes en la base de datos.</p>';
        return;
    }
    tasks.forEach(task => {
        const taskcard = document.createElement('div');
        taskcard.className = `task-card ${task,is_completed ? 'completed' : ''}`;
        
        const setHtmlModoLectura = () => {
            taskcard.innerHTML = `
            <div class="task-info">
                <h3>${task.title}</h3>
                <p>${task.description || ''}</p>
                <span class="author">Autor: ${task.author}</span>
            </div>
            <div class="task-actions" style="display: flex; gap: 5px;">
                <button class="btn-edit" style="background-color: #2563eb; font-size: 0.85rem; width: auto; padding: 5px 10px; color: white; border: none; border-radius: 4px; cursor: pointer;">Editar</button>
                <button class="btn-delete" style="background-color: #dc2626; font-size: 0.85rem; width: auto; padding: 5px 10px; color: white; border: none; border-radius: 4px; cursor: pointer;">Eliminar</button>
            </div>
            `; 
            taskcard.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id, task.author));
            taskcard.querySelector('.btn-edit').addEventListener('click', () => cambiarAModoEdicion(task, taskcard));
        };
        setHtmlModoLectura();
        taskContainer.appendChild(taskcard);
    });
}

function cambiarAModoEdicion(task, taskcard) {
    if (AUTHOR !== task.author) {
        openCustmModal('Acceso Restringido', `!No autorizado¡ Esta tarea le pertenece a "${task.author}" y tu eres "${AUTHOR}"` , false);
        return;
    }
    taskcard.innerHTML = `
    <div class="task-edit-form" style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
        <input type="text" class="edit-title" value="${task.title}" style="padding: 5px; border: 1px solid #2563eb; border-radius: 4px;">
        <textarea class="edit-desc" style="padding: 5px; border: 1px solid #2563eb; border-radius: 4px; resize: none;">${task.description || ''}</textarea>
        <div style="display: flex; gap: 5px; justify-content: flex-end;">
        <button class="btn-save-edit" style=background-color: #6b7280; font-size: 0.85rem; width: auto; padding: 5px 10px; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
        <button class="btn-save-edit" style=background-color: #10b981; font-size: 0.85rem; width: auto; padding: 5px 10px; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
        </div>
        </div>
        `;

        const btncancelar = taskcard.querySelector('.btn-cancel-edit');
        const btnguardar = taskcard.querySelector('.btn-save-edit');

        btncancelar.addEventListener('click', () => fethtask());

        btnguardar.addEventListener('click', () => {
            const newTitulo = taskcard.querySelector('.edit-title').value.trim();
            const nuevaDescripcion = taskcard.querySelector('.edit-desc').value.trim();
            
            if (!nuevoTitulo) {
                openCustmModal('Validacion', 'El titulo de la tarea es obligatorio.', false);
                return;
            }

            updateTask(task.id, nuevoTiutulo, nuevaDescripcion, rask.is_completed);
        });
}

taskform.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();

    try {
        const response = await fetch(api_url, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ title, description, author })
        });

        if (response.ok) {
            taskForm.reset();
            fetchtask();
        }
    } catch (error) {
        openCustmModal('Error de red', 'Error de red al intentar crear la tarea.', false);
    }
});

async function updatetask(id, title, description, is_completed) {
    try {
        const response = await fetch(`${api_url}/${id}`, {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ title, description, is_completed, author: AUTHOR })
        });

        const json = await response.json();

        if (response.ok && json.status === 'success') {
            fetchtask();
        } else{
            openCustomModal('Error de servidor', json.message || 'Error al actualizar en el servidor.', false);
        }
    } catch (error) {
        openCustmModal('Error de red', 'Error al comunicar la actualizacion.', false);
    }
}

async function deleteTask(id, taskAuthor) {
    if (AUTHOR !== taskAuthor) {
        openCustmModal('Acceso denegado', `¡No autorizado! Esta tarea es de "${taskAuthor}"`, false);
        return;
    }

    openCustomModal(
        '¿Confirmar Eliminacion?',
        '¿Estas seguro de eliminar esta tarea de l abase de datos de manera permanente?',
        true,
        async () => {
            try {
            const response = await fetch(`${api_url}/${id}`, {
                method: `DELETE`,
                headers: {'content-type': 'application/json' },
                body: JSON.stringify({ author: AUTHOR })
            });

            const json = await response.json();

            if (response.ok && json.status === `success`) {
                fetchtask();
            }   else {
                openCustomModal('Error de servidor', json.message || 'Fallo de autorizacion en el servidor', false);
            } 
        } catch (error) {
                openCustomModal('Error de red', 'Error de red al eliminar la tarea.', false)
        }
    }
    );
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('todo_author_session');
    window.location.reload();
});

checkAuth();