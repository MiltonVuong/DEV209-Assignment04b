document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const todoForm = document.getElementById('todo-form');
    const todosList = document.getElementById('todos');
    const logoutButton = document.getElementById('logout');
    const authDiv = document.getElementById('auth');
    const todoListDiv = document.getElementById('todo-list');

    const apiUrl = 'http://localhost:3000';

    // Check for saved auth token and load todos if available
    const authToken = getCookie('authToken');
    if (authToken) {
        authDiv.style.display = 'none';
        todoListDiv.style.display = 'block';
        loadTodos();
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        const response = await fetch(`${apiUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            alert('Registration successful!');
        } else {
            alert('Registration failed.');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            setCookie('authToken', data.token, 1); // Set cookie for 1 day
            authDiv.style.display = 'none';
            todoListDiv.style.display = 'block';
            loadTodos();
        } else {
            alert('Login failed.');
        }
    });

    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const todoInput = document.getElementById('todo-input').value;

        if (!todoInput) {
            alert('Title is required');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ title: todoInput, description: '' })
            });

            if (response.ok) {
                loadTodos();
            } else {
                console.error('Failed to add todo:', response.statusText);
                alert('Failed to add todo.');
            }
        } catch (error) {
            console.error('Error adding todo:', error);
            alert('Error adding todo.');
        }
    });

    logoutButton.addEventListener('click', () => {
        setCookie('authToken', '', -1); // Remove cookie
        authDiv.style.display = 'block';
        todoListDiv.style.display = 'none';
    });

    async function loadTodos() {
        const authToken = getCookie('authToken');
        console.log(`Auth Token: ${authToken}`); // Log the auth token
        try {
            console.log(`trying`);
            const response = await fetch(`${apiUrl}/todos`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                console.log(`response ok`);
                const todos = await response.json();
                console.log(todos); // Log the response data
                todosList.innerHTML = ''; // Clear the current list
                console.log(`clearing`);
                todos.forEach(todo => {
                    const li = document.createElement('li');

                    // Create checkbox container
                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.classList.add('checkbox-container');
                    console.log(`create checkbox`);

                    // Create checkbox for completion
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = todo.completed;
                    checkbox.addEventListener('change', () => {
                        toggleTodoCompletion(todo.id);
                    });
                    checkboxContainer.appendChild(checkbox);
                    li.appendChild(checkboxContainer);

                    // Add todo title
                    const span = document.createElement('span');
                    span.textContent = todo.title;
                    if (todo.completed) {
                        span.classList.add('completed');
                    }
                    li.appendChild(span);

                    // Create delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent the click event from bubbling up to the li element
                        deleteTodoItem(todo.id);
                    });
                    li.appendChild(deleteButton);

                    todosList.appendChild(li);
                });
            } else {
                console.error('Failed to load todos:', response.statusText);
                alert('Failed to load todos.');
            }
        } catch (error) {
            console.error('Error loading todos:', error);
            alert('Error loading todos.');
        }
    }

    async function toggleTodoCompletion(id) {
        console.log(`Toggling completion for todo with id: ${id}`); // Log the ID
        const authToken = getCookie('authToken');
        console.log(`Auth Token: ${authToken}`); // Log the auth token
        try {
            const response = await fetch(`${apiUrl}/todos/${id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                console.log('Todo toggled successfully');
                loadTodos(); // Refresh the list after toggling
            } else {
                console.error('Failed to toggle todo:', response.statusText);
                alert('Failed to toggle todo.');
            }
        } catch (error) {
            console.error('Error toggling todo:', error);
            alert('Error toggling todo.');
        }
    }

    async function deleteTodoItem(id) {
        console.log(`Deleting todo with id: ${id}`); // Log the ID
        const authToken = getCookie('authToken');
        console.log(`Auth Token: ${authToken}`); // Log the auth token
        try {
            const response = await fetch(`${apiUrl}/todos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                console.log('Todo deleted successfully');
                loadTodos(); // Refresh the list after deleting
            } else {
                console.error('Failed to delete todo:', response.statusText);
                alert('Failed to delete todo.');
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
            alert('Error deleting todo.');
        }
    }

    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});