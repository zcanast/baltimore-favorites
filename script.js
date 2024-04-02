/* eslint-disable max-len */

function getRandomInclusive(min, max) {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);
  return Math.floor(Math.random() * (newMax - newMin + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector('#things_list');
  target.innerHTML = '';

  const listEl = document.createElement('ol');
  target.appendChild(listEl);

  list.forEach((item) => {
    const el = document.createElement('li');
    el.innerText = (item.Thing + " (" + item.Location + ")");
    listEl.appendChild(el);
  });
}

function processThings(list) {
  console.log('fired list of things');
  //const range = [...Array(15).keys()];
  const range = [...Array(list.length).keys()];
  const newArray = range.map((item) => {
    const index = getRandomInclusive(0, list.length);
    return list[index];
  });
  //return newArray;
  return list;
}

function initChart(chart, object) {
  const labels = Object.keys(object);
  const info = Object.keys(object).map((item) => object[item].length);

  const data = {
    labels: labels,
    datasets: [{
      label: 'Activities By Category',
      data: info,
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {}
  };

  return new Chart(
    chart,
    config
  );
}

function changeChart(chart, dataObject) {
  const labels = Object.keys(dataObject);
  const info = Object.keys(dataObject).map((item) => dataObject[item].length);
  
  chart.data.labels = labels;
  chart.data.datasets.forEach((set) => {
    set.data = info;
    return set;
  });

  chart.update();
}

function shapeDataForLineChart(array) {
  return array.reduce((collection, item) => {
    if (!collection[item.Category]) {
      collection[item.Category] = [item];
    } else {
      collection[item.Category].push(item);
    }
    return collection;
  }, {});
}

function filterList(list, filterInputValue) {
  return list.filter((item) => {
    if (!item.Category || !item.Thing) { return; }
    const lowerCaseName1 = item.Thing.toLowerCase();
    const lowerCaseName2 = item.Category.toLowerCase();
    const lowerCaseName3 = item.Location.toLowerCase();
    const lowerCaseQuery = filterInputValue.toLowerCase();
    return lowerCaseName1.includes(lowerCaseQuery) || lowerCaseName2.includes(lowerCaseQuery) || lowerCaseName3.includes(lowerCaseQuery);
  });
}

function initMap() {
  console.log('initMap');
  const map = L.map('map').setView([39.278112175109804, -76.62266148465638], 11);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  return map;
}

function markerPlace(array, map) {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });

  array.forEach((item, index) => {
    
    L.marker([item.Latitude, item.Longitude]).addTo(map).bindPopup(title=item.Thing);
    //L.marker([item.Latitude, item.Longitude]).addTo(map);
    if (index === 0) {
      map.setView([item.Latitude, item.Longitude], 10);
    }
  });
}
 


async function getData() {
  const url = await d3.csv('https://docs.google.com/spreadsheets/d/1BPAIzOJhjZGaWvx4DHgF2C6J57Kgppbu1jpGGZRgqmU/gviz/tq?tqx=out:csv');
  console.log(url);
  return url;
}


 
async function mainEvent() {
  const pageMap = initMap();
  const form = document.querySelector('.main_form');
  const submit = document.querySelector('#get-resto');
  const loadAnimation = document.querySelector('.lds-ellipsis');
  const chartTarget = document.querySelector('#myChart'); 
  submit.style.display = 'none';

  const results = await getData();
  const shapedData = shapeDataForLineChart(results);
  const myChart = initChart(chartTarget, shapedData);

  if (!results?.length > 0) { return; }

  submit.style.display = 'block'; 

  loadAnimation.classList.remove('lds-ellipsis');
  loadAnimation.classList.add('lds-ellipsis_hidden');

  let currentList = [];

  form.addEventListener('input', (event) => {
    const filteredList = filterList(currentList, event.target.value);
    injectHTML(filteredList);
    markerPlace(filteredList, pageMap);
    const localData = shapeDataForLineChart(filterList(currentList, event.target.value));
    changeChart(myChart, localData);
  });

  form.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();

    currentList = processThings(results);

    injectHTML(currentList);
    markerPlace(currentList, pageMap);
    const localData = shapeDataForLineChart(currentList);
    changeChart(myChart, localData);
  });
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());
