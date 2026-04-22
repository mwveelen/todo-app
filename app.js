// Initial state
let tasks = {
    'Dinsdag': [],
    'Woensdag': [],
    'Donderdag': [],
    'IB': [],
    'MT': [],
    'LIB': [],
    'Overig': []
};

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tessa_todo_tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    renderAll();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tessa_todo_tasks', JSON.stringify(tasks));
}

// Render tasks for a specific category
function renderCategory(category) {
    const column = document.querySelector(`.column[data-category="${category}"]`);
    const list = column.querySelector('.task-list');
    list.innerHTML = '';

    tasks[category].forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn">&times;</button>
        `;

        // Toggle completion
        const checkbox = li.querySelector('input');
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            saveTasks();
            li.classList.toggle('completed');
        });

        // Click on text also toggles checkbox
        const textSpan = li.querySelector('.task-text');
        textSpan.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        });

        // Delete task
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            tasks[category].splice(index, 1);
            saveTasks();
            renderCategory(category);
        });

        list.appendChild(li);
    });
}

// Render all categories
function renderAll() {
    Object.keys(tasks).forEach(category => {
        renderCategory(category);
    });
}

// Add task logic
function setupEventListeners() {
    // Export functionality
    document.getElementById('export-btn').addEventListener('click', () => {
        const dataStr = JSON.stringify(tasks);
        navigator.clipboard.writeText(dataStr).then(() => {
            alert('Taken zijn gekopieerd naar het klembord! Je kunt dit nu plakken op je andere apparaat via "Importeer".');
        }).catch(err => {
            console.error('Fout bij kopiëren: ', err);
            alert('Er ging iets mis bij het kopiëren.');
        });
    });

    // Import functionality
    document.getElementById('import-btn').addEventListener('click', () => {
        const input = prompt('Plak hier de geëxporteerde code:');
        if (input) {
            try {
                const importedTasks = JSON.parse(input);
                // Basic validation
                if (typeof importedTasks === 'object' && importedTasks !== null) {
                    tasks = importedTasks;
                    saveTasks();
                    renderAll();
                    alert('Taken succesvol geïmporteerd!');
                } else {
                    throw new Error('Ongeldig formaat');
                }
            } catch (e) {
                alert('Oeps! Dat lijkt geen geldige code te zijn. Probeer het opnieuw.');
            }
        }
    });

    document.querySelectorAll('.column').forEach(column => {
        const category = column.dataset.category;
        const input = column.querySelector('.add-task input');
        const button = column.querySelector('.add-btn');

        const addTask = () => {
            const text = input.value.trim();
            if (text) {
                tasks[category].push({
                    text: text,
                    completed: false
                });
                input.value = '';
                saveTasks();
                renderCategory(category);
            }
        };

        button.addEventListener('click', addTask);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
});
