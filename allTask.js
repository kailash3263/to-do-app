const container = document.getElementById('container');
const statusMessage = document.getElementById('status');

function setStatus(message = '') {
  if (statusMessage) {
    statusMessage.textContent = message;
  }
}

function makeField(labelText, value, type = 'text') {
  const label = document.createElement('label');
  label.textContent = labelText;

  const input = document.createElement(type === 'select' ? 'select' : 'input');
  if (type !== 'select') {
    input.type = type;
  }

  if (type === 'select') {
    ['studies', 'college_project', 'personal', 'fun', 'other'].forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category.replace('_', ' ');
      input.append(option);
    });
  }

  input.value = value ?? '';
  label.append(input);
  return { label, input };
}

function toDateTimeLocal(value) {
  if (!value) return '';

  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().slice(0, 16);
    }
  }

  return value.slice(0, 16);
}

function renderTask(task, index) {
  const card = document.createElement('article');
  card.className = 'task-card';

  const name = document.createElement('div');
  name.textContent = task.task_name;

  const deadline = document.createElement('div');
  deadline.textContent = `Deadline: ${task.deadline ?? ''}`;

  const category = document.createElement('div');
  category.textContent = `Category: ${task.category ?? ''}`;

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => renderEditor(card, task, index));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', async () => {
    deleteButton.disabled = true;
    setStatus('');

    try {
      const response = await window.todoAuth.fetchWithAuth(
        `/delete/${encodeURIComponent(task.task_name)}`,
        { method: 'DELETE' },
      );
      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }
      await fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      deleteButton.disabled = false;
      setStatus('Could not delete the task. Please try again.');
    }
  });

  actions.append(editButton, deleteButton);
  card.append(name, deadline, category, actions);
  container.append(card);
}

function renderEditor(card, task, index) {
  card.replaceChildren();

  const nameField = makeField('Task name', task.task_name);
  const deadlineField = makeField(
    'Deadline',
    toDateTimeLocal(task.deadline),
    'datetime-local',
  );
  const categoryField = makeField('Category', task.category ?? '', 'select');
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.textContent = 'Save';
  saveButton.addEventListener('click', async () => {
    const updatedTask = {
      task_name: nameField.input.value.trim(),
      deadline: deadlineField.input.value,
      category: categoryField.input.value,
    };

    if (!updatedTask.task_name || !updatedTask.deadline || !updatedTask.category) {
      setStatus('Please complete all task fields.');
      return;
    }

    saveButton.disabled = true;
    setStatus('');

    try {
      const response = await window.todoAuth.fetchWithAuth(
        `/update/${encodeURIComponent(task.task_name)}`,{
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        },
      );
      if (!response.ok) {
        throw new Error(`Update failed (${response.status})`);
      }

      await fetchData();
      setStatus('Task updated.');
    } catch (error) {
      console.error('Error updating task:', error);
      saveButton.disabled = false;
      setStatus('Could not update the task. Please try again.');
    }
  });

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => fetchData());

  actions.append(saveButton, cancelButton);
  card.append(nameField.label, deadlineField.label, categoryField.label, actions);
}

async function fetchData() {
  if (!window.todoAuth.requireAuth()) {
    return;
  }

  if (!container) {
    console.error('Could not find the task container.');
    return;
  }

  try {
    const response = await window.todoAuth.fetchWithAuth('/all-task');
    if (!response.ok) {
      throw new Error(`Could not load tasks (${response.status})`);
    }

    const result = await response.json();
    if (!Array.isArray(result)) {
      throw new Error('The task response was not a list.');
    }

    container.replaceChildren();
    result.forEach((taskData, index) => {
      const task = typeof taskData === 'string' ? JSON.parse(taskData) : taskData;
      renderTask(task, index);
    });
  } catch (error) {
    console.error('Error loading tasks:', error);
    setStatus('Could not load tasks. Check that the backend is running.');
  }
}

fetchData();
