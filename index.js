'use strict';

let habitStorage = {'habits': []};
let actualDays;
let monthSelected = new Date().getMonth();

document.addEventListener('DOMContentLoaded', () => {

  chrome.storage.sync.get('habits', (habits) => {
    if (habits.hasOwnProperty('habits')) Object.assign(habitStorage, habits);

    document.getElementById('add-habit-button').addEventListener('click', addHabit);

    setGrid(new Date().getMonth());
  });

});

const getDaysInMonth = (month) => {
  return new Date(new Date().getFullYear(), month + 1, 0).getDate();
}

const createNode = (type, classGiven) => {
  const node = document.createElement(type);
  node.className = classGiven;
  return node;
}

const setGrid = (month) => {

  const daysInMonth = actualDays = getDaysInMonth(month);

  const gridContainerNode = createNode('div', 'grid-main-container');
  gridContainerNode.setAttribute('id', 'grid-main-container');
  gridContainerNode.style['grid-template-rows'] = `repeat(${2 + habitStorage.habits.length}, 1fr)`;
  gridContainerNode.style['grid-template-columns'] = `225px repeat(${daysInMonth}, 1fr)`;
  document.getElementById('main-title').insertAdjacentElement('afterend', gridContainerNode);

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

}

const renderMonths = (month) => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  for (let i = 0; i < months.length; i++) {
    const node = document.createElement('span');
    node.setAttribute('id', `m${i}`);
    i !== month ? node.className = 'month title' : node.className = 'month title selected-month';
    const textNode = document.createTextNode(months[i]);
    node.appendChild(textNode);
    node.addEventListener('click', selectMonth);
    document.getElementById('month-container').appendChild(node);
  }
}

const renderDays = (month) => {
  const daysInMonth = getDaysInMonth(month);
  for (let i = 0; i < daysInMonth; i++) {
    const dayNode = createNode('span', 'day');
    if (new Date().getMonth() === month && (i + 1) === new Date().getDate()) dayNode.classList.add('actual-day');
    const textNode = document.createTextNode(String(i + 1));
    dayNode.appendChild(textNode);
    document.getElementById('grid-main-container').appendChild(dayNode);
  }
}

const selectMonth = (e) => {
  const month = Number(e.target.id.slice(1));
  monthSelected = month;
  document.getElementById('grid-main-container').remove();
  setGrid(month);
}

const renderHabits = () => {
  document.getElementById('grid-main-container').style['grid-template-rows'] = `repeat(${2 + habitStorage.habits.length}, 1fr)`;
  for (let i = 0; i < habitStorage.habits.length; i++) {
    const habitNode = createNode('span', 'habit');
    const textNode = document.createTextNode(habitStorage.habits[i].name);
    habitNode.appendChild(textNode);
    document.getElementById('grid-main-container').appendChild(habitNode);
    for (let j = 0; j < actualDays; j++) {
      const checkNode = createNode('input', 'check');
      checkNode.setAttribute('type', 'checkbox');
      checkNode.addEventListener('click', toggleCheck);
      document.getElementById('grid-main-container').appendChild(checkNode);
      // input value 'schema': HABIT ID 2 DIGITS | YEAR 4 DIGITS | MONTH 2 DIGITS | DAY 2 DIGITS
      const dateValue = `${String(habitStorage.habits[i].id)}${new Date().getFullYear()}${monthSelected < 10 ? '0' + String(monthSelected + 1) : monthSelected + 1}${j + 1 < 10 ? '0' + String(j + 1) : String(j + 1)}`;
      const dateValueIdLessThan10 = `0${dateValue}`;
      checkNode.setAttribute('value', `${habitStorage.habits[i].id < 10 ? dateValueIdLessThan10 : dateValue}`);
      if (habitStorage.habits[i].dates.hasOwnProperty(checkNode.value) && habitStorage.habits[i].dates[checkNode.value] === 1) {
        checkNode.setAttribute('checked', true);
      }
      checkNode.addEventListener('click', toggleCheck);
      document.getElementById('grid-main-container').appendChild(checkNode);
    }
  }
}

const toggleCheck = (e) => {
  const habitClicked = habitStorage.habits[Number(e.target.value.slice(0, 2)) - 1]; // habits arr is 0 - indexed and habits id are 1 - indexed
  if (habitClicked.dates.hasOwnProperty(e.target.value)) {
    if (habitClicked.dates[e.target.value] === 0) {
      habitClicked.dates[e.target.value] = 1;
    } else {
      habitClicked.dates[e.target.value] = 0;
    }
  } else {
    habitStorage.habits[Number(e.target.value.slice(0, 2)) - 1].dates[e.target.value] = 1;
  }
  chrome.storage.sync.set(habitStorage, () => console.log('Check toggled'));
}

const addHabit = () => {
  const habit = prompt('Enter habit:');
  const newHabitId = habitStorage.habits.length + 1;
  habitStorage.habits.push({'id': newHabitId, 'name': habit, 'dates': {}});
  chrome.storage.sync.set(habitStorage, () => console.log('Added habit'));

  document.getElementById('grid-main-container').remove();
  setGrid(monthSelected);
}