class TodoApp {
            constructor() {
                this.todos = this.loadTodos();
                this.currentFilter = 'all';
                this.editingId = null;
                this.isDarkMode = localStorage.getItem('darkMode') === 'true';
                
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.applyTheme();
                this.render();
                this.updateStats();
            }

            setupEventListeners() {
                // Form submission
                const todoForm = document.getElementById('todoForm');
                todoForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addTodo();
                });

                // Also add click listener to the button directly as backup
                const addButton = todoForm.querySelector('.btn-primary');
                addButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.addTodo();
                });

                // Filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    if (!btn.id) {
                        btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
                    }
                });

                // Clear completed
                document.getElementById('clearCompleted').addEventListener('click', () => {
                    this.clearCompleted();
                });

                // Theme toggle
                document.getElementById('themeToggle').addEventListener('click', () => {
                    this.toggleTheme();
                });

                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.editingId) {
                        this.cancelEdit();
                    }
                });
            }

            addTodo() {
                const input = document.getElementById('todoInput');
                const priority = document.getElementById('prioritySelect').value;
                const dueDate = document.getElementById('dueDateInput').value;
                const text = input.value.trim();

                console.log('Adding todo:', text); // Debug log
                
                if (!text) {
                    alert('Please enter a task!');
                    return;
                }

                // Check for duplicates
                if (this.todos.some(todo => todo.text.toLowerCase() === text.toLowerCase())) {
                    alert('This task already exists!');
                    return;
                }

                const todo = {
                    id: Date.now(),
                    text: text,
                    completed: false,
                    priority: priority,
                    dueDate: dueDate || null,
                    createdAt: new Date().toISOString()
                };

                this.todos.unshift(todo);
                this.saveTodos();
                this.render();
                this.updateStats();

                // Reset form
                input.value = '';
                document.getElementById('dueDateInput').value = '';
                document.getElementById('prioritySelect').value = 'medium';
            }

            toggleTodo(id) {
                const todo = this.todos.find(t => t.id === id);
                if (todo) {
                    todo.completed = !todo.completed;
                    this.saveTodos();
                    this.render();
                    this.updateStats();
                }
            }

            deleteTodo(id) {
                const todoElement = document.querySelector(`[data-id="${id}"]`);
                if (todoElement) {
                    todoElement.classList.add('removing');
                    setTimeout(() => {
                        this.todos = this.todos.filter(t => t.id !== id);
                        this.saveTodos();
                        this.render();
                        this.updateStats();
                    }, 300);
                }
            }

            editTodo(id) {
                if (this.editingId && this.editingId !== id) {
                    this.cancelEdit();
                }
                
                this.editingId = id;
                this.render();
            }

            saveEdit(id) {
                const input = document.querySelector(`[data-id="${id}"] .edit-input`);
                const newText = input.value.trim();
                
                if (!newText) return;

                const todo = this.todos.find(t => t.id === id);
                if (todo) {
                    todo.text = newText;
                    this.editingId = null;
                    this.saveTodos();
                    this.render();
                }
            }

            cancelEdit() {
                this.editingId = null;
                this.render();
            }

            setFilter(filter) {
                this.currentFilter = filter;
                
                // Update filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.filter === filter) {
                        btn.classList.add('active');
                    }
                });

                this.render();
            }

            clearCompleted() {
                const completedCount = this.todos.filter(t => t.completed).length;
                if (completedCount === 0) return;

                if (confirm(`Are you sure you want to delete ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
                    this.todos = this.todos.filter(t => !t.completed);
                    this.saveTodos();
                    this.render();
                    this.updateStats();
                }
            }

            getFilteredTodos() {
                switch (this.currentFilter) {
                    case 'active':
                        return this.todos.filter(t => !t.completed);
                    case 'completed':
                        return this.todos.filter(t => t.completed);
                    case 'high':
                        return this.todos.filter(t => t.priority === 'high');
                    default:
                        return this.todos;
                }
            }

            render() {
                const todoList = document.getElementById('todoList');
                const filteredTodos = this.getFilteredTodos();

                if (filteredTodos.length === 0) {
                    todoList.innerHTML = `
                        <div class="empty-state">
                            <div class="emoji">${this.getEmptyStateEmoji()}</div>
                            <h3>${this.getEmptyStateTitle()}</h3>
                            <p>${this.getEmptyStateMessage()}</p>
                        </div>
                    `;
                    return;
                }

                todoList.innerHTML = filteredTodos.map(todo => this.renderTodoItem(todo)).join('');
                
                // Add event listeners to todo items
                this.attachTodoEventListeners();
            }

            renderTodoItem(todo) {
                const isEditing = this.editingId === todo.id;
                const dueDateDisplay = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : null;
                
                return `
                    <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                             onclick="app.toggleTodo(${todo.id})" 
                             role="checkbox" 
                             aria-checked="${todo.completed}"
                             tabindex="0"></div>
                        <div class="todo-content">
                            ${isEditing ? 
                                `<input type="text" class="edit-input" value="${todo.text}" 
                                        onblur="app.saveEdit(${todo.id})" 
                                        onkeydown="if(event.key==='Enter') app.saveEdit(${todo.id}); if(event.key==='Escape') app.cancelEdit();"
                                        autofocus />` :
                                `<div class="todo-text">${todo.text}</div>`
                            }
                            <div class="todo-meta">
                                <span class="priority-badge priority-${todo.priority}">
                                    ${todo.priority} priority
                                </span>
                                ${dueDateDisplay ? `<span>📅 ${dueDateDisplay}</span>` : ''}
                                <span>📅 ${new Date(todo.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="todo-actions">
                            ${!isEditing ? 
                                `<button class="action-btn edit-btn" onclick="app.editTodo(${todo.id})" 
                                         aria-label="Edit task">✏️</button>` : ''
                            }
                            <button class="action-btn delete-btn" onclick="app.deleteTodo(${todo.id})" 
                                    aria-label="Delete task">🗑️</button>
                        </div>
                    </div>
                `;
            }

            attachTodoEventListeners() {
                // Add keyboard navigation for checkboxes
                document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            checkbox.click();
                        }
                    });
                });
            }

            updateStats() {
                const total = this.todos.length;
                const completed = this.todos.filter(t => t.completed).length;
                const remaining = total - completed;

                document.getElementById('totalTasks').textContent = total;
                document.getElementById('completedTasks').textContent = completed;
                document.getElementById('remainingTasks').textContent = remaining;
            }

            getEmptyStateEmoji() {
                switch (this.currentFilter) {
                    case 'completed': return '🎉';
                    case 'active': return '⚡';
                    case 'high': return '🔥';
                    default: return '📝';
                }
            }

            getEmptyStateTitle() {
                switch (this.currentFilter) {
                    case 'completed': return 'No completed tasks';
                    case 'active': return 'No active tasks';
                    case 'high': return 'No high priority tasks';
                    default: return 'No tasks yet';
                }
            }

            getEmptyStateMessage() {
                switch (this.currentFilter) {
                    case 'completed': return 'Complete some tasks to see them here!';
                    case 'active': return 'All tasks are completed! 🎉';
                    case 'high': return 'No urgent tasks at the moment!';
                    default: return 'Add a task above to get started!';
                }
            }

            toggleTheme() {
                this.isDarkMode = !this.isDarkMode;
                localStorage.setItem('darkMode', this.isDarkMode.toString());
                this.applyTheme();
            }

            applyTheme() {
                const body = document.body;
                const themeToggle = document.getElementById('themeToggle');
                
                if (this.isDarkMode) {
                    body.setAttribute('data-theme', 'dark');
                    themeToggle.textContent = '☀️';
                } else {
                    body.removeAttribute('data-theme');
                    themeToggle.textContent = '🌙';
                }
            }

            // Storage methods
            loadTodos() {
                try {
                    const todos = JSON.parse(localStorage.getItem('todos')) || [];
                    return todos;
                } catch (error) {
                    console.error('Error loading todos:', error);
                    return [];
                }
            }

            saveTodos() {
                try {
                    localStorage.setItem('todos', JSON.stringify(this.todos));
                } catch (error) {
                    console.error('Error saving todos:', error);
                    alert('Unable to save todos. Storage might be full.');
                }
            }
        }

        // Initialize the app
        const app = new TodoApp();

        // Service worker registration for offline support (optional enhancement)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // We could register a service worker here for offline functionality
            });
        }