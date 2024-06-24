const description = document.querySelector('.description');
const form = document.querySelector('.form-search');
const searcher = document.querySelector('.searcher')
const humidity = document.querySelector('.humidity');
const temp = document.querySelector('.temp');
const image = document.getElementById('image');
const titleCity = document.querySelector('figcaption');

const API_KEY = '437d846bf169b338073368ae2fc77bc1';
let link = `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=es&appid=${API_KEY}`;

let coordenadas = {
    lat: 0,
    lon: 0,
};

let isSearch = false;

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(searcher.value != ''){
        isSearch = true;
        getData();
        searcher.value = '';
    }
});

const getData = async () => {
    if(!isSearch){
        link = `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=es&lat=${coordenadas.lat}&lon=${coordenadas.lon}&appid=${API_KEY}`;
    } else {
        link = `${link}&q=${searcher.value}`;
    }

    const res = await fetch(link)
    const data = await res.json();
    console.log(data)
    
    if(isSearch) titleCity.textContent = data.name;

    const icon = data.weather[0].icon
    image.src = `http://openweathermap.org/img/w/${icon}.png`;

    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;

    const convertTemp = data.main.temp;
    temp.textContent = `${convertTemp.toString().slice(0, 4)}°C`;
    
    link = `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=es&appid=${API_KEY}`;

    return data;
};

window.addEventListener('load', () => {
    navigator.geolocation.getCurrentPosition((position) => {
        coordenadas.lat = position.coords.latitude;
        coordenadas.lon = position.coords.longitude;
    });
    titleCity.textContent = 'Tu ciudad';
    getData();
});