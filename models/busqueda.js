const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

class Busqueda {
    historial = [];
    databasePath = process.env.DATABASE_PATH;
    constructor(){
        // Leer base de datos (si existe)
        const db = this.leerDatabase();
        this.historial = db?.historial || [];
    }
    
    get paramsMapBox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        };
    }

    get paramsOpenWeather(){
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad( ciudadBuscada = '' ) {
        try{
            // Peticion HTTP y retornar resultado
            const instance = axios.default.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ciudadBuscada}.json`,
                params: this.paramsMapBox
            })
            const response = await instance.get();  
            return response.data.features.map( place => ({
                id: place.id, 
                nombre: place.place_name, 
                longitud: place.center[0],
                latitud: place.center[1]
            }))
        }catch(error){
            return [];
        }
    }

    async clima(lon, lat){
        try{
            const instance = axios.default.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {lat, lon, ...this.paramsOpenWeather}
            });

            const response = await instance.get(); 
            const {main, description} = response.data.weather[0];
            const {temp, temp_min, temp_max} = response.data.main;   

            return {
                clima: main,
                description,
                temp,
                temp_min, temp_max
            }    
        }catch{
            return {}
        }
    }

    agregarHistorial( lugar = ''){
        // Prevenir duplicados
        if( this.historial.map(h => h.toLowerCase()).includes(lugar.toLowerCase())){
            return;
        }
        this.historial.unshift(lugar);
        this.historial = this.historial.slice(0, 5);
        // Persistir dato
        this.guardarDatabase();
    }

    guardarDatabase(){
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync( this.databasePath, JSON.stringify(payload));
    }

    leerDatabase(){
        if(fs.existsSync(this.databasePath)){
            const db = fs.readFileSync(this.databasePath);
            return JSON.parse(db);
        }else{
            return undefined
        }
    }
}

module.exports = Busqueda;