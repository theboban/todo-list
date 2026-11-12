'use strict';

const storageKey = 'todo-list.tasks.v1';
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#tasks');
const empty = document.querySelector('#empty');
const notice = document.querySelector('#notice');
const count = document.querySelector('#count');
const progress = document.querySelector('#progress');
const template = document.querySelector('#task-template');

function showStorageError() {
  notice.textContent = 'Хранилище браузера недоступно. Изменения могут пропасть после обновления страницы.';
  notice.hidden = false;
}

function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    if (!Array.isArray(stored)) return [];

    return stored.filter(task =>
      task && typeof task.title === 'string' && typeof task.done === 'boolean'
    );
  } catch {
    showStorageError();
    return [];
  }
}

const tasks = loadTasks();

function updateSummary() {
  const completed = tasks.filter(task => task.done).length;
  count.textContent = `${completed} из ${tasks.length}`;
  progress.max = tasks.length || 1;
  progress.value = completed;
  empty.hidden = tasks.length > 0;
}

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    notice.hidden = true;
  } catch {
    showStorageError();
  }
  updateSummary();
}

function createTaskRow(task) {
  const row = template.content.firstElementChild.cloneNode(true);
  const checkbox = row.querySelector('input');
  const remove = row.querySelector('button');

  row.querySelector('span').textContent = task.title;
  checkbox.checked = task.done;
  remove.setAttribute('aria-label', `Удалить задачу «${task.title}»`);

  checkbox.addEventListener('change', () => {
    task.done = checkbox.checked;
    saveTasks();
  });

  remove.addEventListener('click', () => {
    const adjacentRow = row.nextElementSibling ?? row.previousElementSibling;
    tasks.splice(tasks.indexOf(task), 1);
    row.remove();
    saveTasks();
    (adjacentRow?.querySelector('button') ?? input).focus();
  });

  return row;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const title = input.value.trim();

  if (!title) {
    input.setCustomValidity('Введите название задачи.');
    input.reportValidity();
    return;
  }

  const task = { title, done: false };
  tasks.push(task);
  list.append(createTaskRow(task));
  saveTasks();
  form.reset();
  input.focus();
});

input.addEventListener('input', () => input.setCustomValidity(''));

list.append(...tasks.map(createTaskRow));
updateSummary();
