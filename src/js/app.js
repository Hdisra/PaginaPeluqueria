var pagina = 1;//Para saber en qué TAB me encuentro y por default se inicia con la primer seccion

const citaResumen = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp(){
    mostrarServicios();

    //Para resaltar el DIV actual según el TAB en el que me encuentro
    mostrarSeccionActual();

    //Para ocultar o resaltar una determinada sección según el TAB que se presiona
    cambiarSeccion();

    //Para intercalar los botones de la paginacion dependiendo de la pagina en la que se encuentra
    paginaSiguiente();

    paginaAnterior();

    //Verifica en que seccion me encuentro para mostrar o ocultar los botones de la paginacion
    verificaPaginacion();

    //Muestra el resumen de la cita o mensaje de error en caso de no pasar la validacion
    mostrarResumen();

    //Validar y guardar el nombre de la persona del formulario en el objeto
    nombreCita();

    //Valida y almacena la fecha de la cita en el objeto citaResumen
    fechaCita();

    //Deshabilita dias pasados en el formulario
    deshabilitarDiasPasados();

    //Valida la hora del formulario 
    horaCita();

}

async function mostrarServicios(){

    try {
        //Usando Fetch API con async-await
        const resultado = await fetch('./servicios.json');//Haciendo fetch(leer) el arhivo .json que tendrá los servicios
        const datos = await resultado.json();//Para avisar que se obtendra la informacion de un .json

        const servicios = datos.servicios;//Para guardar el arreglo que se leyó del .json
        // console.log(servicios)
        
        servicios.forEach( servicio => {
            //Haciendo destructuring para generar las variables con los valores de cada objeto
            const {id, nombre, precio} = servicio;

            //DOM Scripting - creando HTML
            //Nombre
            const nombreServcio = document.createElement('P');
            nombreServcio.textContent = nombre;
            nombreServcio.classList.add('nombre-servicio');
            // console.log(nombreServcio)
            
            //Precio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = "$ "+precio;
            precioServicio.classList.add('precio-servicio');
            // console.log(precioServicio)

            //Generar div contenedor para cada servicio
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');

            //Cuando se selecciona un servicio
            servicioDiv.onclick = seleccionaServicio;//"onclick" se usa cuando se crean elementos desde JS
            servicioDiv.dataset.idServicio = id;//Agregando propiedad para relacionarla al ID

            //Insertando los parrafos de nombre y precio al div
            servicioDiv.appendChild(nombreServcio);
            servicioDiv.appendChild(precioServicio);

            // console.log(servicioDiv)

            //Meter los div al HTML, en el div con el id 'servicios'
            document.querySelector('#servicios').appendChild(servicioDiv);
        });

    } catch (error) {
        console.log(error);
    }
}

function seleccionaServicio(e) {
    // console.log("Se dio click");
    // console.log(e.target.tagName);//Para saber a qué elemento se dio click
    // const id = e.target.dataset.idServicio;
    // console.log(id)

    //Forzar a que elemento al cual se da click sea el DIV
    let elemento;//Almacenara el DIV
    if(e.target.tagName == 'P'){
        // console.log("Le diste click al parrafo");
        //console.log(e.target.parentElement)imprimirá el DIV
        elemento = e.target.parentElement;//Sera el div su elemento padre
    }else {
        // console.log("Le diste click al DIV")
        elemento = e.target;
    }

    //Para que se cree o elimine una clase al div al ser seleccionado
    if(elemento.classList.contains('seleccionado')){

        elemento.classList.remove('seleccionado');


        const id = parseInt(elemento.dataset.idServicio);

        //Para remover el servicio de la lista de la seccion de Resumen
        eliminarServicio(id);

    }else{ 
        elemento.classList.add('seleccionado');

        //Para saber a qué numero de servicio accedemos, con el atributo creado:
        // console.log(elemento.dataset.idServicio);
        //Para acceder al primer parrafo del div(elemento)
        // console.log(elemento.firstElementChild);
        // console.log(elemento.lastElementChild)Accede al Precio  del Div(elemento)

        const servicioObj = {
            id: parseInt(elemento.dataset.idServicio),
            nombre: elemento.firstElementChild.textContent,
            precio: elemento.firstElementChild.nextElementSibling.textContent//Accede al elemento despues del primero 
        }
        // console.table(servicioObj)


        //Para agregar el servicio a la lista de Resumen
        agregarServicio(servicioObj);
    } 
    // console.log(elemento.tagName);imprimirá DIV
}

function cambiarSeccion(){/* Se usará ahora para cambiar de seccion con los tabs*/

    //Para seleccionar todos los botones(TABS)
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach( enlace => {
        //Agregar evento a cada boton
        enlace.addEventListener('click', (evento) => {
            evento.preventDefault();
            // console.log("Se dio click a un TAB");
            // console.log(evento.target.dataset.paso)//Para imprimir el atributo data-paso de los button
            pagina = parseInt(evento.target.dataset.paso);

            //Agrega la clase donde dimos click
            // const seccion = document.querySelector("#paso-"+pagina);//Accedo al div con el id "paso-n"
            // seccion.classList.add('mostrar-seccion');

            
            //Agregar la clase al tab que se dio click por medio de su atributo
            // var tab = document.querySelector(`[data-paso="${pagina}"]`)
            // tab.classList.add("tab-actual");

            //Para que se cambie de seccion
            mostrarSeccionActual();

            verificaPaginacion();

        });
    });
} 

function mostrarSeccionActual() {

    //Para eliminar la clase "mostrar-seccion" del elemento que lo tenia antes
    const seccionAnterior = document.querySelector(".mostrar-seccion");
    if(seccionAnterior){//Preguntamos si existe un elemento con esa clase para poder eliminarlo
        seccionAnterior.classList.remove("mostrar-seccion");
    }

    const seccionActual = document.querySelector("#paso-"+pagina);
    seccionActual.classList.add("mostrar-seccion")


    //Para eliminar la clase "tab-actual" del tab anterior
    const tabAnterior = document.querySelector(".tabs .tab-actual")
    if(tabAnterior){//Verificamos si hay un elemento con la clase para eliminarla
        tabAnterior.classList.remove("tab-actual")
    }

    //Para resalar el TAB actual
    var tabActual = document.querySelector(`[data-paso="${pagina}"]`)//Para seleccionar el ATRIBUTO
    tabActual.classList.add('tab-actual');
}

/* PAginacion */
function paginaSiguiente(){

    var sig = document.querySelector("#siguiente");
    
    sig.addEventListener('click', () => {//Agregar un evento cuando se de click al boton de siguiente
        pagina++;

        console.log(pagina)

        verificaPaginacion();//Para verificar si oultar o no un boton dependiendo del valor de 'pagina'
    });
}

function paginaAnterior(){
    const pagAnterior = document.querySelector('#anterior');

    pagAnterior.addEventListener('click', () => {

        pagina--;

        console.log(pagina);

        verificaPaginacion();//Para que se oculten o muestre algunos botones de eso paginadores cada vez que se de click a uno
    });

}

function verificaPaginacion(){
    const pagAnterior = document.querySelector('#anterior');
    const pagSiguiente = document.querySelector('#siguiente');

    if(pagina == 1){
        // console.log("El boton de \'anterior\' no se debe de mostrar aqui");
        pagAnterior.classList.add("ocultarBoton");//Para ocultar ese boton
        pagSiguiente.classList.remove("ocultarBoton");
    }else if(pagina == 3){
        pagAnterior.classList.remove("ocultarBoton");//Para que si se muestre este boton
        pagSiguiente.classList.add("ocultarBoton");

        //Para que se vuelva a verificar si ya se llenaron todos los datos para el Resumen
        mostrarResumen();

    }else{
        //Para que ambos se muestren al estar en la pagina 2
        pagAnterior.classList.remove("ocultarBoton");
        pagSiguiente.classList.remove("ocultarBoton");
    }

    mostrarSeccionActual();//Para cambiar de seccion conforme cambia la paginacion

}


function mostrarResumen(){
    //Destructuring
    const {nombre, fecha ,hora, servicios} = citaResumen;

    //Seleccionando el div con la seccion de Resumen
    const resumenDiv = document.querySelector(".seccion-resumen");

    // console.log(Object.values(citaResumen)) Crea un arreglo con los valores del objeto

    //Para limpiar el HTML previo
    while(resumenDiv.firstChild) {
        resumenDiv.removeChild(resumenDiv.firstChild);//Borrara el mensaje anterior SI existe
    }

    //Validar datos
    if(Object.values(citaResumen).includes('')){//Para verificar si esta vacio algun dato del objeto
        // console.log("Esta vacío algun dato del objeto de la cita")
        const aviso = document.createElement("P");
        aviso.textContent = "Faltan datos de Servicios, hora, fecha o nombre";
        aviso.classList.add("invalidar-cita");

        //Agregar parrafo al div del Resumen
        resumenDiv.appendChild(aviso);

        return;//Para que se salga de la funcion en caso de no haber un dato 
    }
    
    //Mostrando el resumen 
    // console.log("Todos los datos fueron llenados");
    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;//Agrega HTML al parrafo
    
    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;//Agrega HTML al parrafo
    
    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora}`;//Agrega HTML al parrafo
    
    const servicioCita = document.createElement('DIV');
    servicioCita.classList.add('resumen-servicios');

    //Heading para los servicios
    const headingServicio = document.createElement('H3');
    headingServicio.textContent = "Resumen de los Servicios"
    servicioCita.appendChild(headingServicio)

    //Heading para los datos del usuario
    const headingUsuario = document.createElement('H3');
    headingUsuario.textContent = "Tus Datos";

    var cantidad = 0;

    //Añadir los servicios al Resumen iterando sobre el arreglo 
    servicios.forEach( servicio => {
        const {nombre, precio} = servicio;

        contenedorServicio = document.createElement('DIV')//Para cada servicio agregar un DIV
        contenedorServicio.classList.add('contenedor-servicio');

        const textServicio = document.createElement('P');
        textServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio')

        //Para almacenar el precio de cada servicio sin el $
        const totalServicio = precio.split('$');
        // console.log(totalServicio[1].trim())Para quitarle el espacio que tiene
        cantidad += parseInt(totalServicio[1].trim());


        //Colocar el texto y el precio en el div
        contenedorServicio.appendChild(textServicio);
        contenedorServicio.appendChild(precioServicio);
        servicioCita.appendChild(contenedorServicio);
    });

    console.log(cantidad)

    resumenDiv.appendChild(headingUsuario);
    resumenDiv.appendChild(nombreCita);    
    resumenDiv.appendChild(fechaCita);    
    resumenDiv.appendChild(horaCita);   

    //Agregando los servicios iterados al Resumen
    resumenDiv.appendChild(servicioCita);

    const totalAPagar = document.createElement('P');
    totalAPagar.innerHTML = `<span>Total a Pagar: </span> $ ${cantidad}`;
    totalAPagar.classList.add('total');
    resumenDiv.appendChild(totalAPagar);

}

function eliminarServicio(id){
    // console.log('Eliminado el servicio ',id)
    const {servicios} = citaResumen;

    //Actualizo el arreglo Global
    citaResumen.servicios = servicios.filter( servicio => servicio.id !== id);//Regresara los objetos/elementos que no tengan el id que se paso de parametro, el cual es el que se deselecciona en la pagina

    console.log(citaResumen)

}

function agregarServicio(servicioObj){
    // console.log('Agregando el servicio')

    const { servicios } = citaResumen;//Para guardar por un momento el arreglo de servicios que tenia la cita
                //   Copia el arreglo 
    citaResumen.servicios = [...servicios, servicioObj];//Concatenamos y actualzamos el arreglo de servicios agregandole el objeto que se paso como parámetro
    // console.log(citaResumen.servicios);
    // console.log(servicios)
    console.log(citaResumen)
}

function nombreCita(){

    const nombreInput = document.querySelector("#nombre");

    nombreInput.addEventListener('input', (evento) => {//con input se ejecutara el arrow function cada vez que se escriba algo en el input
        // console.log("Se esta escribiendo en el input de nombre")
        // console.log(evento.target.value)Para saber que esta escribiendo
        const nombreText = evento.target.value.trim()//Para quitar los espacios extremos

        //Validacion para que nombreText deba tener texto y mayor a 3 letras
        if(nombreText === '' || nombreText.length < 3){
            // console.log("Nombre no válido")
            mostrarAlerta('Nombre no válido', 'error');

        }else{
            // console.log("Nombre válido")

            //Para eliminar la alerta que se generó una vez que se pasen las 3 letras
            const alerta = document.querySelector(".alerta");
            if(alerta){
                alerta.remove();
            }

            citaResumen.nombre = nombreText
        }

        // console.log(citaResumen.nombre)

    });


}

function mostrarAlerta(message, tipo){
    // console.log("El mensaje es: "+message);

    //Si hay una alerta previa, eliminarla
    var alertaPrevia = document.querySelector(".alerta");
    if(alertaPrevia){
        return;//Para salirse de la funcion y no se cree otra vez el DIV
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = message;
    alerta.classList.add("alerta");

    if(tipo === 'error'){
        alerta.classList.add("error");//si la alerta es de tipo error agregar otra clase 
    }
    // console.log(alerta)

    //Insertar en el formulario del HTML
    const formulario = document.querySelector(".formulario");
    formulario.appendChild(alerta)

    //Eliminar la alerta despues de 3 segundos
    setTimeout(() => {
        alerta.remove();//Despues de 3 segundos se eliminará la alerta
    }, 3000);//3 segundos
}

function fechaCita(){

    const fechaInput = document.querySelector("#fecha");
    fechaInput.addEventListener('input', evento => {
        // console.log(evento.target.value)//Accede a la fecha

        const fecha = new Date(evento.target.value).getUTCDay();//Convertir a tipo Date y retorna el número del dia, 0 - Domingo, 1 - Lunes, etc.

        // const opcionesFecha = {
        //     weekday: 'long',
        //     month: 'long',
        //     year: 'numeric'
        // }
        // console.log(fecha.toLocaleDateString('es-Es', opcionesFecha))//Para traducir al español con las especificaiones de las opciones del objeto pasado

        if([0, 6].includes(fecha)){//Verifica si en fecha esta el 0 o el 6
            // console.log("No hay citas en Sábado o Domingo");
            fechaInput.value = '';//Para que no se agregue la fecha al input
            mostrarAlerta("Fines de Semana no son permitidos", "error")

        }else{
            // console.log("Día válido")
            citaResumen.fecha = fechaInput.value

            const alerta = document.querySelector(".alerta");
            if(alerta){
                alerta.remove();
            }
        }
    });
}

function deshabilitarDiasPasados(){
    const fechaInput = document.querySelector("#fecha");
    const fechaAhora = new Date();
    const year = fechaAhora.getFullYear();//DEvuelve el año actual
    const mes = fechaAhora.getMonth() + 1;//Ya que devuelve el mes anterior por empezar desde 0
    const dia = fechaAhora.getDate() + 1;//Para que no se puedan hacer citas el mismo día

    //Formato para el MIN del input de fecha: AAAA-MM-DD
    const minFecha = `${year}-0${mes}-${dia}`;//Para colocarlo en el MIN y sea la fecha actual la fecha a partir la cual se podrán hacer las citas, no antes

    fechaInput.min = minFecha;//Agregar el MIN
}

function horaCita(){
    const horaInput = document.querySelector("#hora");
    horaInput.addEventListener('input', evento => {
        const hour = evento.target.value;
        arregloHora = hour.split(':');//Para que cree un arreglo separanado los elementos cuando se encuentre con ":", i.e. 11:00 == [11, 00]
        // console.log(arregloHora);
        if(arregloHora[0] < 10 || arregloHora[0] > 18){//Para que antes de las 10 y despues de las 18 no se acepten mas citas
            // console.log("No se aceptan citas en ese horario");
            mostrarAlerta("Hora no válida", "error");//Colocar la alerta de CSS
            
            setTimeout(() => {
                horaInput.value = '';//Para que se reinicie el input despues de 3 segundos
            }, 3000);

        }else{
            // console.log("Horas válidas")
            citaResumen.hora = hour;
            console.log(citaResumen)
        }
    });
}