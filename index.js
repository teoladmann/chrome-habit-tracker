'use strict';

//Declare global variables
let habitStorage = { habits: [] }; //For updating sync storage
let actualDays; //Days in selected month for rendering
let monthSelected = new Date().getMonth(); //Actual month selected 0-indexed

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('habits', (habits) => {
    //Check sync storage
    if (habits.hasOwnProperty('habits')) Object.assign(habitStorage, habits);
    //Chrome doesn't allow this to be put directly on index.html
    document
      .getElementById('add-habit-button')
      .addEventListener('click', showInput);
    //Render grid
    setGrid(new Date().getMonth());
  });
});

const getDaysInMonth = (month) => {
  //Month passed as 1-indexed
  return new Date(new Date().getFullYear(), month + 1, 0).getDate();
};

const createNode = (type, classGiven) => {
  //Shortcut for creating nodes
  const node = document.createElement(type);
  node.className = classGiven;
  return node;
};

const setGrid = (month) => {
  const daysInMonth = (actualDays = getDaysInMonth(month));

  const gridContainerNode = createNode('div', 'grid-main-container');
  gridContainerNode.setAttribute('id', 'grid-main-container');
  gridContainerNode.style['grid-template-rows'] = `repeat(${
    2 + habitStorage.habits.length
  }, 1fr)`;
  gridContainerNode.style[
    'grid-template-columns'
  ] = `225px repeat(${daysInMonth}, 1fr)`;
  document
    .getElementById('main-title')
    .insertAdjacentElement('afterend', gridContainerNode);

  const monthTitleNode = createNode('div', 'month-title title');
  monthTitleNode.appendChild(document.createTextNode('MONTH'));
  gridContainerNode.appendChild(monthTitleNode);

  const monthContainerNode = createNode('div', 'flex-month-container');
  monthContainerNode.setAttribute('id', 'month-container');
  monthContainerNode.style['grid-column'] = '2 / -1';
  gridContainerNode.appendChild(monthContainerNode);

  renderMonths(month);

  const habitTitleNode = createNode('div', 'habit-title title');
  habitTitleNode.appendChild(document.createTextNode('HABIT'));
  gridContainerNode.appendChild(habitTitleNode);

  renderDays(month);

  renderHabits();
};

const renderMonths = (month) => {
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  for (let i = 0; i < months.length; i++) {
    const monthNode = createNode('span', 'month title');
    monthNode.setAttribute('id', `m${i}`);
    monthNode.addEventListener('click', selectMonth);
    if (i === month) {
      const selectedMonth = createNode('p', 'selected-month month title');
      const textNode = document.createTextNode(months[i]);
      selectedMonth.appendChild(textNode);
      monthNode.appendChild(selectedMonth);
      document.getElementById('month-container').appendChild(monthNode);
    } else {
      const textNode = document.createTextNode(months[i]);
      monthNode.appendChild(textNode);
      document.getElementById('month-container').appendChild(monthNode);
    }
  }
};

const renderDays = (month) => {
  const daysInMonth = getDaysInMonth(month);
  for (let i = 0; i < daysInMonth; i++) {
    const dayNode = createNode('span', 'day');
    if (i === 0) dayNode.classList.add('first-one');
    if (i === daysInMonth - 1) dayNode.classList.add('last-one');
    if (new Date().getMonth() === month && i + 1 === new Date().getDate()) {
      const actualDayNode = createNode('p', 'actual-day');
      const textNode = document.createTextNode(String(i + 1));
      actualDayNode.appendChild(textNode);
      dayNode.appendChild(actualDayNode);
      document.getElementById('grid-main-container').appendChild(dayNode);
    } else {
      const textNode = document.createTextNode(String(i + 1));
      dayNode.appendChild(textNode);
      document.getElementById('grid-main-container').appendChild(dayNode);
    }
  }
};

const selectMonth = (e) => {
  const month = Number(e.target.id.slice(1));
  monthSelected = month;
  document.getElementById('grid-main-container').remove();
  setGrid(month);
};

const renderHabits = () => {
  document.getElementById('grid-main-container').style[
    'grid-template-rows'
  ] = `repeat(${2 + habitStorage.habits.length}, 1fr)`;
  for (let i = 0; i < habitStorage.habits.length; i++) {
    const habitContainerNode = createNode('div', 'habit-container');
    document
      .getElementById('grid-main-container')
      .appendChild(habitContainerNode);
    habitContainerNode.setAttribute(
      'id',
      `habit-container-${habitStorage.habits[i].id}`
    );
    const removeNode = createNode('span', 'remove-habit');
    removeNode.setAttribute('id', habitStorage.habits[i].id);
    removeNode.addEventListener('click', removeHabit);
    const removeTextNode = document.createTextNode('X');
    removeNode.appendChild(removeTextNode);
    document
      .getElementById(`habit-container-${habitStorage.habits[i].id}`)
      .appendChild(removeNode);
    const habitNode = createNode('span', 'habit');
    const textNode = document.createTextNode(habitStorage.habits[i].name);
    habitNode.appendChild(textNode);
    habitNode.setAttribute('id', `habit-${habitStorage.habits[i].id}`);
    document
      .getElementById(`habit-container-${habitStorage.habits[i].id}`)
      .appendChild(habitNode);
    for (let j = 0; j < actualDays; j++) {
      const checkNode = createNode('input', 'check');
      checkNode.setAttribute('id', `checkbox-${i + '-' + j}`);
      checkNode.setAttribute('type', 'checkbox');
      checkNode.addEventListener('click', toggleCheck);
      const labelCheckNode = document.createElement('label');
      labelCheckNode.setAttribute('for', `checkbox-${i + '-' + j}`);
      const checkContainerNode = createNode('div', 'check-container');
      checkContainerNode.appendChild(checkNode);
      checkContainerNode.appendChild(labelCheckNode);
      if (j === actualDays - 1) checkContainerNode.classList.add('last-one');
      document
        .getElementById('grid-main-container')
        .appendChild(checkContainerNode);
      // input value logic: YEAR 4 DIGITS | MONTH 2 DIGITS | DAY 2 DIGITS
      const dateValue = `${new Date().getFullYear()}${
        monthSelected < 10 ? '0' + String(monthSelected + 1) : monthSelected + 1
      }${j + 1 < 10 ? '0' + String(j + 1) : String(j + 1)}`;
      checkNode.setAttribute('value', `${dateValue}`);
      checkNode.setAttribute('name', habitStorage.habits[i].id);
      if (habitStorage.habits[i].dates.includes(checkNode.value)) {
        checkNode.setAttribute('checked', true);
      }
      checkNode.addEventListener('click', toggleCheck);
      document
        .getElementById('grid-main-container')
        .appendChild(checkContainerNode);
    }
  }
};

const toggleCheck = (e) => {
  const habitClicked = habitStorage.habits.find((h) => h.id === e.target.name);
  if (habitClicked.dates.includes(e.target.value)) {
    habitClicked.dates = habitClicked.dates.filter((d) => d !== e.target.value);
  } else {
    habitClicked.dates.push(e.target.value);
  }
  chrome.storage.sync.set(habitStorage);
};

const showInput = () => {
  document.getElementById('add-habit-container').style['display'] = 'none';
  document.getElementById('habit-input').addEventListener('blur', hideInput);
  document.getElementById('habit-input').addEventListener('keydown', keyInput);
  document.getElementById('habit-input-container').style['display'] = 'flex';
  document.getElementById('habit-input-container').style['align-items'] =
    'center';
  document.getElementById('habit-input').blur();
  document.getElementById('habit-input').focus();
};

const addHabit = (habit) => {
  if (habitStorage.habits.some((h) => h.name === habit)) return;
  const newHabitId = `${Date.now()}`;
  habitStorage.habits.push({ id: newHabitId, name: habit, dates: [] });
  chrome.storage.sync.set(habitStorage);
  document.getElementById('grid-main-container').remove();
  document.getElementById('habit-input').value = '';
  hideInput();
  setGrid(monthSelected);
};

const hideInput = () => {
  document.getElementById('habit-input-container').style['display'] = 'none';
  document.getElementById('add-habit-container').style['display'] = 'flex';
};

const keyInput = (e) => {
  let val = document.getElementById('habit-input').value;
  if (e.keyCode === 27) {
    hideInput();
  } else if (e.key === 'Enter' && val.length > 0) {
    e.preventDefault();
    addHabit(val);
  } else if (e.key === 'Enter') {
    e.preventDefault();
  } else {
    val += String.fromCharCode(e.keyCode);
  }
};

const removeHabit = (e) => {
  habitStorage.habits = habitStorage.habits.filter((h) => h.id !== e.target.id);
  chrome.storage.sync.set(habitStorage);
  document.getElementById('grid-main-container').remove();
  setGrid(monthSelected);
};
