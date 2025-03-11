const description = document.querySelector('.description');
const form = document.querySelector('.form-search');
const searcher = document.querySelector('.searcher')
const humidity = document.querySelector('.humidity');
const temp = document.querySelector('.temp');
const image = document.getElementById('image');
const titleCity = document.querySelector('figcaption');

// Cache para almacenar resultados
const weatherCache = {
    data: new Map(),
    timeoutMinutes: 10,
    
    set: function(key, value) {
        this.data.set(key, {
            value,
            timestamp: Date.now()
        });
    },
    
    get: function(key) {
        const item = this.data.get(key);
        if (!item) return null;
        
        const isExpired = (Date.now() - item.timestamp) > (this.timeoutMinutes * 60 * 1000);
        if (isExpired) {
            this.data.delete(key);
            return null;
        }
        
        return item.value;
    }
};

// Estado de la aplicación
const state = {
    isLoading: false,
    error: null,
    setLoading: function(loading) {
        this.isLoading = loading;
        document.body.classList.toggle('loading', loading);
    },
    setError: function(error) {
        this.error = error;
        if (error) {
            titleCity.textContent = 'Error';
            description.textContent = error;
        }
    }
};

function init() {
    let coordenadas = {
        lat: 0,
        lon: 0,
    };
    
    let isSearch = false;
    
    const getApiKey = async () => {
        try {
            const response = await fetch('/api-key');
            if (!response.ok) throw new Error('No se pudo obtener la API key');
            const data = await response.json();
            return data.apiKey;
        } catch (error) {
            throw new Error('Error al obtener la API key');
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if(searcher.value.trim()) {
            isSearch = true;
            getData();
            searcher.value = '';
        }
    });
    
    const getData = async () => {
        try {
            state.setLoading(true);
            state.setError(null);
            
            const API_KEY = await getApiKey();
            let link = `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=es&appid=${API_KEY}`;

            if(!isSearch) {
                link = `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=es&lat=${coordenadas.lat}&lon=${coordenadas.lon}&appid=${API_KEY}`;
            } else {
                link = `${link}&q=${searcher.value}`;
            }

            // Verificar caché
            const cacheKey = isSearch ? searcher.value : `${coordenadas.lat},${coordenadas.lon}`;
            const cachedData = weatherCache.get(cacheKey);
            if (cachedData) {
                updateUI(cachedData);
                return cachedData;
            }
    
            const res = await fetch(link);
            if (!res.ok) {
                throw new Error(res.status === 404 ? 'Ciudad no encontrada' : 'Error al obtener datos del clima');
            }
            
            const data = await res.json();
            weatherCache.set(cacheKey, data);
            updateUI(data);
            
            return data;
        } catch (error) {
            state.setError(error.message);
            console.error('Error:', error);
        } finally {
            state.setLoading(false);
        }
    };

    function updateUI(data) {
        if (isSearch) titleCity.textContent = data.name;
    
        const icon = data.weather[0].icon;
        image.src = `http://openweathermap.org/img/w/${icon}.png`;
    
        description.textContent = data.weather[0].description;
        humidity.textContent = `${data.main.humidity}%`;
    
        const convertTemp = data.main.temp;
        temp.textContent = `${convertTemp.toString().slice(0, 4)}°C`;
    }

    window.addEventListener('load', () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                coordenadas.lat = position.coords.latitude;
                coordenadas.lon = position.coords.longitude;
                titleCity.textContent = 'Tu ciudad';
                getData();
            },
            (error) => {
                state.setError('Error al obtener la ubicación. Por favor busca una ciudad.');
                console.error('Geolocation error:', error);
            }
        );
    });
};

init();