const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busqueda = require("./models/busqueda");

const main = async () => {  
    let opcion;
    const busqueda = new Busqueda();
    do{
        opcion = await inquirerMenu();
        switch(opcion){
            case '1': 
                //Mostrar mensaje
                const ciudadBuscada = await leerInput('Ciudad: ');

                //Buscar lugares
                const ciudades = await busqueda.ciudad(ciudadBuscada);

                //Seleccionar el lugar
                const idSeleccionado = await listarLugares(ciudades);
                if ( idSeleccionado === 0 ) continue;
                const { nombre, longitud, latitud} = ciudades.find( c => c.id === idSeleccionado);

                busqueda.agregarHistorial(nombre);

                //Clima
                const { description, temp_min, temp, temp_max} = await busqueda.clima(longitud, latitud);
                //Mostrar resultados

                console.log('\nInformación de la ciudad:\n'.green);
                console.log('Ciudad: '.green, `${nombre}`);
                console.log('Latitud: '.green, `${latitud}`);
                console.log('Longitud: '.green, `${longitud}`);
                console.log('Temperatura: '.green, `${temp}° (Clima: ${description})`);
                console.log('Maxima: '.green, `${temp_max}°`);
                console.log('Minima: '.green, `${temp_min}°`);
                break;
            case '2': console.log("Opcion 2");
                busqueda.historial.forEach( (h, i) => {
                    console.log(`${ i+1 }.`.cyan, `${h}`);
                });
                    break;
            case '0': console.log('\nGracias por haber utilizado mi aplicación!\n'.magenta); 
                break;
            default: console.log('Opcion Incorrecta');
        }

        if(opcion !== '0'){
            await pausa();
        }
    } while( opcion !== '0' );
}

main();