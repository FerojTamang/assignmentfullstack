document.addEventListener('DOMContentLoaded', function () {
    const toastEl = document.querySelector('.toast');
    const toast = new bootstrap.Toast(toastEl);
    let currentOperation = 'add';
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let timerInterval;

    // Show Toast Notification
    function showToast(message, type = 'success') {
        const toastBody = document.getElementById('toastMessage');
        toastBody.textContent = message;
        toastBody.parentElement.className = `toast toast-animate ${type === 'success' ? 'bg-success-subtle' : 'bg-danger-subtle'}`;
        toast.show();
    }

    // Dynamic Form
    document.getElementById('dynamicForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('dynamicName').value.trim();
        const age = document.getElementById('dynamicAge').value;
        const resultDiv = document.getElementById('dynamicResult');
        if (name && age) {
            resultDiv.innerHTML = `<div class="alert alert-success" role="alert">Hello, ${name}! You are ${age} years old.</div>`;
            showToast('Form submitted successfully!', 'success');
            this.reset();
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger" role="alert">Please fill out all fields.</div>`;
            showToast('Form submission failed.', 'danger');
        }
    });

    // Calculator
    window.selectOperator = function (operation) {
        currentOperation = operation;
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.operation === operation) btn.classList.add('selected');
        });
    };

    window.calculate = function () {
        const num1 = parseFloat(document.getElementById('calcNum1').value);
        const num2 = parseFloat(document.getElementById('calcNum2').value);
        const resultDiv = document.getElementById('calcResult');
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = 'block';
        setTimeout(() => {
            if (isNaN(num1) || isNaN(num2)) {
                resultDiv.innerHTML = `<div class="alert alert-danger" role="alert">Please enter valid numbers.</div>`;
                showToast('Invalid input.', 'danger');
            } else {
                let result;
                switch (currentOperation) {
                    case 'add': result = num1 + num2; break;
                    case 'subtract': result = num1 - num2; break;
                    case 'multiply': result = num1 * num2; break;
                    case 'divide': result = num2 !== 0 ? num1 / num2 : 'Cannot divide by zero'; break;
                }
                resultDiv.innerHTML = typeof result === 'number' ?
                    `<div class="alert alert-success" role="alert">Result: ${result.toFixed(2)}</div>` :
                    `<div class="alert alert-danger" role="alert">${result}</div>`;
                showToast(typeof result === 'number' ? 'Calculation complete!' : result, typeof result === 'number' ? 'success' : 'danger');
            }
            spinner.style.display = 'none';
        }, 500);
    };

    // Square Root
    window.calculateSqrt = function () {
        const input = parseFloat(document.getElementById('sqrtInput').value);
        const resultDiv = document.getElementById('sqrtResult');
        if (isNaN(input) || input < 0) {
            resultDiv.innerHTML = `<div class="alert alert-danger" role="alert">Please enter a non-negative number.</div>`;
            showToast('Invalid input.', 'danger');
        } else {
            const result = Math.sqrt(input).toFixed(2);
            resultDiv.innerHTML = `<div class="alert alert-success" role="alert">Square Root: ${result}</div>`;
            showToast('Square root calculated!', 'success');
        }
    };

    // Error Handling
    window.runErrorDemo = function () {
        const input = document.getElementById('errorInput').value;
        const resultDiv = document.getElementById('errorResult');
        try {
            if (isNaN(input) || input.trim() === '') throw new Error('Input is not a number.');
            resultDiv.innerHTML = `<div class="alert alert-success" role="alert">Valid number: ${input}</div>`;
            showToast('Input is valid!', 'success');
        } catch (error) {
            resultDiv.innerHTML = `<div class="alert alert-danger" role="alert">${error.message}</div>`;
            showToast(error.message, 'danger');
        }
    };

    // To-Do List
    function renderTasks(filter = '') {
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = '';
        const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(filter.toLowerCase()));
        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span class="todo-text ${task.completed ? 'text-decoration-line-through text-muted' : ''}">${task.text}</span>
                <div>
                    <button class="btn btn-success btn-sm btn-animate me-1" onclick="toggleTask(${index})" aria-label="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                        <i class="bi ${task.completed ? 'bi-arrow-counterclockwise' : 'bi-check'}"></i>
                    </button>
                    <button class="btn btn-danger btn-sm btn-animate" onclick="removeTask(${index})" aria-label="Delete task">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            li.style.opacity = 0;
            li.style.transform = 'translateX(10px)';
            li.style.animation = 'fadeInUp 0.3s ease-out forwards';
            todoList.appendChild(li);
        });
        updateTaskCounter();
    }

    function updateTaskCounter() {
        const completed = tasks.filter(task => task.completed).length;
        document.getElementById('taskCounter').textContent = `Tasks: ${tasks.length} (Completed: ${completed})`;
    }

    document.getElementById('addTaskButton').addEventListener('click', function () {
        const input = document.getElementById('todoInput').value.trim();
        if (input) {
            tasks.push({ text: input, completed: false });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            document.getElementById('todoInput').value = '';
            renderTasks(document.getElementById('todoFilter').value);
            showToast('Task added!', 'success');
        } else {
            showToast('Please enter a task.', 'danger');
        }
    });

    document.getElementById('todoFilter').addEventListener('input', function () {
        renderTasks(this.value);
    });

    document.getElementById('clearTasksButton').addEventListener('click', function () {
        tasks = [];
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        showToast('All tasks cleared!', 'success');
    });

    document.getElementById('clearCompletedButton').addEventListener('click', function () {
        tasks = tasks.filter(task => !task.completed);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        showToast('Completed tasks cleared!', 'success');
    });

    window.toggleTask = function (index) {
        tasks[index].completed = !tasks[index].completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(document.getElementById('todoFilter').value);
        showToast(`Task marked as ${tasks[index].completed ? 'completed' : 'incomplete'}!`, 'success');
    };

    window.removeTask = function (index) {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(document.getElementById('todoFilter').value);
        showToast('Task removed!', 'success');
    };

    // Real-Time Validation
    window.validateInputRealTime = function () {
        const input = document.getElementById('realTimeInput').value;
        const displayDiv = document.getElementById('realTimeInputDisplay');
        const resultDiv = document.getElementById('realTimeResult');
        displayDiv.textContent = input ? `Current Input: ${input}` : '';
        if (input.length >= 3) {
            resultDiv.innerHTML = `<div class="alert alert-success" role="alert">Input is valid!</div>`;
        } else {
            resultDiv.innerHTML = `<div class="alert alert-warning" role="alert">Input must be at least 3 characters.</div>`;
        }
    };

    // Timer
    window.startTimer = function (seconds) {
        clearInterval(timerInterval);
        seconds = parseInt(seconds);
        if (isNaN(seconds) || seconds < 1) {
            document.getElementById('timerDisplay').innerHTML = `<div class="alert alert-danger" role="alert">Please enter a valid number of seconds.</div>`;
            showToast('Invalid timer input.', 'danger');
            return;
        }
        let timeLeft = seconds;
        document.getElementById('timerProgress').style.width = '100%';
        document.getElementById('timerProgress').setAttribute('aria-valuenow', 100);
        document.getElementById('timerDisplay').textContent = `Time left: ${timeLeft}s`;
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                document.getElementById('timerDisplay').innerHTML = `<div class="alert alert-success" role="alert">Timer finished!</div>`;
                document.getElementById('timerProgress').style.width = '0%';
                document.getElementById('timerProgress').setAttribute('aria-valuenow', 0);
                showToast('Timer finished!', 'success');
            } else {
                document.getElementById('timerDisplay').textContent = `Time left: ${timeLeft}s`;
                const progress = (timeLeft / seconds) * 100;
                document.getElementById('timerProgress').style.width = `${progress}%`;
                document.getElementById('timerProgress').setAttribute('aria-valuenow', progress);
            }
        }, 1000);
    };

    window.stopTimer = function () {
        clearInterval(timerInterval);
        document.getElementById('timerDisplay').textContent = 'Timer stopped';
        document.getElementById('timerProgress').style.width = '0%';
        document.getElementById('timerProgress').setAttribute('aria-valuenow', 0);
        showToast('Timer stopped.', 'success');
    };

    // Initialize
    renderTasks();
});