'use strict';

let habitStorage = {'habits': []};
console.log(habitStorage);
let actualDays;

document.addEventListener('DOMContentLoaded', () => {

  chrome.storage.sync.get('habits', (habits) => {
    if (habits.hasOwnProperty('habits')) Object.assign(habitStorage, habits);
    console.log(habitStorage);

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
    if (new Date().getMonth() === month && i === new Date().getDate()) dayNode.classList.add('actual-day');
    const textNode = document.createTextNode(String(i + 1));
    dayNode.appendChild(textNode);
    document.getElementById('grid-main-container').appendChild(dayNode);
  }
}

const selectMonth = (e) => {
  const month = Number(e.target.id.slice(1));
  document.getElementById('grid-main-container').remove();
  setGrid(month);
}

const renderHabits = () => {
  for (let i = 0; i < habitStorage.habits.length; i++) {
    const habitNode = createNode('span', 'habit');
    const textNode = document.createTextNode(habitStorage.habits[i].name);
    habitNode.appendChild(textNode);
    document.getElementById('grid-main-container').appendChild(habitNode);
    for (let j = 0; j < actualDays; j++) {
      const checkNode = createNode('input', 'check');
      checkNode.setAttribute('type', 'checkbox');
      document.getElementById('grid-main-container').appendChild(checkNode);
    }
  }
}

const addHabit = () => {

  const habit = prompt('Enter habit:');

  if (habitStorage.hasOwnProperty('habits')) {
    habitStorage.habits.push({'name': habit, 'dates': {}});
  } else {
    habitStorage = {'habits': [{'name': habit, 'dates': []}]};
  }
  chrome.storage.sync.set(habitStorage, () => console.log('Added habit'));

  document.getElementById('grid-main-container').style['grid-template-rows'] = `repeat(${2 + habitStorage.habits.length}, 1fr)`;
  const habitNode = createNode('span', 'habit');
  const textNode = document.createTextNode(habit);
  habitNode.appendChild(textNode);
  document.getElementById('grid-main-container').appendChild(habitNode);

  for (let i = 0; i < actualDays; i++) {
    const checkNode = createNode('input', 'check');
    checkNode.setAttribute('type', 'checkbox');
    document.getElementById('grid-main-container').appendChild(checkNode);
  }

}