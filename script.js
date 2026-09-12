let personajes =
    JSON.parse(localStorage.getItem("personajes")) || [];

let modoCombate = false;
let turnoActual = 0;
let modoOrden = "preparacion";

let rondaActual =
    parseInt(localStorage.getItem("rondaActual")) || 1;

let historico =
    JSON.parse(
        localStorage.getItem("historicoCombate")
    ) || [];


const protagonistas = [
    "PLATA",
    "MARAVI",
    "MARTINA",
    "TAKESHI",
    "IMME"
];



/* ==================================================
   GUARDAR
================================================== */

function save() {

    localStorage.setItem(
        "personajes",
        JSON.stringify(personajes)
    );

    localStorage.setItem(
        "rondaActual",
        String(rondaActual)
    );

    localStorage.setItem(
        "historicoCombate",
        JSON.stringify(historico)
    );
}



/* ==================================================
   OBTENER INICIATIVAS
================================================== */

function obtenerIniciativas(p) {

    if (
        Array.isArray(p.iniciativas) &&
        p.iniciativas.length > 0
    ) {
        return p.iniciativas;
    }

    if (typeof p.ini !== "undefined") {
        return [Number(p.ini) || 0];
    }

    return [0];
}



/* ==================================================
   INICIATIVA SELECCIONADA
================================================== */

function iniciativaSeleccionada(p) {

    const iniciativas =
        obtenerIniciativas(p);

    let indice =
        Number(p.iniciativaSeleccionada);

    if (
        !Number.isInteger(indice) ||
        indice < 0 ||
        indice >= iniciativas.length
    ) {
        indice = 0;
    }

    return Number(iniciativas[indice]) || 0;
}



/* ==================================================
   ORDEN DE PREPARACIÓN
================================================== */

function ordenarPreparacion(lista) {

    return [...lista].sort(
        (a, b) => {

            const A =
                String(a.nombre || "")
                    .trim()
                    .toUpperCase();

            const B =
                String(b.nombre || "")
                    .trim()
                    .toUpperCase();


            function rango(nombre) {

                /*
                   Los nombres que contienen números
                   van siempre primero.
                */

                if (/\d/.test(nombre)) {
                    return 0;
                }


                /*
                   Orden fijo de protagonistas.
                */

                if (nombre === "PLATA") {
                    return 1;
                }

                if (nombre === "MARAVI") {
                    return 2;
                }

                if (nombre === "MARTINA") {
                    return 3;
                }

                if (nombre === "TAKESHI") {
                    return 4;
                }

                if (nombre === "IMME") {
                    return 5;
                }


                /*
                   Resto de personajes.
                */

                return 6;
            }


            const rangoA = rango(A);
            const rangoB = rango(B);


            if (rangoA !== rangoB) {
                return rangoA - rangoB;
            }


            return A.localeCompare(
                B,
                "es"
            );
        }
    );
}



/* ==================================================
   ORDEN DE COMBATE
================================================== */

function ordenarCombate(lista) {

    return [...lista].sort(
        (a, b) =>
            (Number(b.total) || 0) -
            (Number(a.total) || 0)
    );
}



/* ==================================================
   CAMBIAR INICIATIVA
================================================== */

function cambiarIniciativa(
    nombrePersonaje,
    indiceIniciativa
) {

    const p =
        personajes.find(
            personaje =>
                personaje.nombre === nombrePersonaje
        );

    if (!p) {
        return;
    }


    p.iniciativaSeleccionada =
        Number(indiceIniciativa) || 0;


    p.total =
        iniciativaSeleccionada(p) +
        (Number(p.dado) || 0);


    save();

    render();
}



/* ==================================================
   CAMBIAR DADO
================================================== */

function cambiarDado(
    nombrePersonaje,
    valor
) {

    const p =
        personajes.find(
            personaje =>
                personaje.nombre === nombrePersonaje
        );

    if (!p) {
        return;
    }


    const dado =
        parseInt(valor);


    p.dado =
        Number.isNaN(dado)
            ? 0
            : dado;


    p.total =
        iniciativaSeleccionada(p) +
        p.dado;


    save();

    actualizarTotalesVisuales();
}



/* ==================================================
   ACTUALIZAR TOTALES
================================================== */

function actualizarTotalesVisuales() {

    personajes.forEach(
        p => {

            const elemento =
                document.getElementById(
                    `total-${encodeURIComponent(p.nombre)}`
                );


            if (elemento) {

                elemento.textContent =
                    `Total: ${p.total}`;
            }
        }
    );
}



/* ==================================================
   SIGUIENTE INPUT
================================================== */

function siguienteInput(actualId) {

    /*
       IMPORTANTE:
       Aquí SIEMPRE usamos el orden de preparación
       cuando todavía no estamos en combate.
    */

    const ordenPreparacion =
        ordenarPreparacion(personajes);


    const ids =
        ordenPreparacion.map(
            p =>
                `dado-${encodeURIComponent(p.nombre)}`
        );


    const index =
        ids.indexOf(actualId);


    if (index === -1) {
        return;
    }


    const siguiente =
        ids[index + 1];


    /*
       Guardamos el valor actual.
    */

    const actual =
        document.getElementById(actualId);


    if (actual) {

        const valor =
            parseInt(actual.value);

        const personaje =
            ordenPreparacion[index];


        if (personaje) {

            personaje.dado =
                Number.isNaN(valor)
                    ? 0
                    : valor;


            personaje.total =
                iniciativaSeleccionada(personaje) +
                personaje.dado;
        }
    }


    /*
       Pasamos al siguiente personaje.
    */

    if (siguiente) {

        const siguienteInputElement =
            document.getElementById(siguiente);


        if (siguienteInputElement) {

            /*
               Vaciamos el campo.
               Así no aparece el 0 al escribir.
            */

            siguienteInputElement.value = "";


            setTimeout(
                () => {

                    siguienteInputElement.focus();

                },
                50
            );
        }

    } else {

        /*
           Era el último personaje de preparación.
           Cerramos teclado.
        */

        if (
            document.activeElement &&
            typeof document.activeElement.blur === "function"
        ) {

            document.activeElement.blur();
        }
    }


    save();

    actualizarTotalesVisuales();
}



/* ==================================================
   RENDER
================================================== */

function render() {

    const lista =
        document.getElementById("lista");


    if (!lista) {
        return;
    }


    lista.innerHTML = "";


    /*
       Durante preparación usamos SIEMPRE
       el orden de preparación.
    */

    let ordenados;


    if (modoCombate) {

        ordenados =
            ordenarCombate(personajes);

    } else {

        ordenados =
            ordenarPreparacion(personajes);
    }


    /*
       Calculamos advertencias sobre el orden
       que se está mostrando.
    */

    ordenados.forEach(
        p => {
            p.warning = [];
        }
    );


    for (
        let j = 0;
        j < ordenados.length;
        j++
    ) {

        for (
            let i = 0;
            i < j;
            i++
        ) {

            const diferencia =
                (Number(ordenados[i].total) || 0) -
                (Number(ordenados[j].total) || 0);


            if (diferencia >= 150) {

                ordenados[j]
                    .warning
                    .push(
                        ordenados[i].nombre
                    );
            }
        }
    }


    /*
       En preparación guardamos el array en el orden
       de preparación.
       
       En combate guardamos el orden de combate.
    */

    personajes =
        ordenados;


    /* ==================================================
       CREAR TARJETAS
    ================================================== */

    personajes.forEach(
        (p, i) => {

            const activo =
                modoCombate &&
                i === turnoActual
                    ? "🔴 "
                    : "";


            let nombreRaw =
                String(p.nombre || "").trim();


            let color =
                "#ff9800";


            /*
               ALIADO
            */

            if (
                nombreRaw
                    .toUpperCase()
                    .startsWith("ALIADO ")
            ) {

                color =
                    "#2e7d32";


                nombreRaw =
                    nombreRaw.replace(
                        /^ALIADO\s+/i,
                        ""
                    );
            }


            /*
               PROTAGONISTAS
            */

            else if (
                protagonistas.includes(
                    nombreRaw.toUpperCase()
                )
            ) {

                color =
                    "#ffffff";
            }


            /*
               ID único basado en el nombre original.
            */

            const idSeguro =
                encodeURIComponent(
                    p.nombre
                );


            /*
               ADVERTENCIAS
            */

            const warningText =
                p.warning &&
                p.warning.length > 0

                    ? `⚠ ${p.warning.join(", ")}`

                    : "";


            /*
               INICIATIVAS
            */

            const iniciativas =
                obtenerIniciativas(p);


            let indiceActivo =
                Number(
                    p.iniciativaSeleccionada
                );


            if (
                !Number.isInteger(indiceActivo) ||
                indiceActivo < 0 ||
                indiceActivo >= iniciativas.length
            ) {

                indiceActivo = 0;
            }


            let iniciativasHTML =
                "";


            if (iniciativas.length > 1) {

                iniciativasHTML = `

                    <div class="selector-iniciativas">

                        ${iniciativas.map(
                            (valor, indice) => {

                                const letra =
                                    String.fromCharCode(
                                        65 + indice
                                    );


                                const seleccionada =
                                    indice === indiceActivo
                                        ? "seleccionada"
                                        : "";


                                return `

                                    <button
                                        type="button"
                                        class="boton-iniciativa ${seleccionada}"
                                        onclick="cambiarIniciativa('${p.nombre.replace(/'/g, "\\'")}', ${indice})"
                                    >
                                        <strong>
                                            ${letra}
                                        </strong>

                                        <span>
                                            ${valor}
                                        </span>

                                    </button>

                                `;
                            }
                        ).join("")}

                    </div>

                `;

            } else {

                iniciativasHTML = `

                    <div class="iniciativa-unica">

                        Iniciativa:

                        <strong>
                            ${iniciativas[0]}
                        </strong>

                    </div>

                `;
            }


            /*
               VALOR DEL DADO

               Si es 0, mostramos el campo vacío.
            */

            const valorDado =
                Number(p.dado) === 0
                    ? ""
                    : p.dado;


            /*
               TARJETA
            */

            lista.innerHTML += `

                <div class="card">

                    <b
                        class="nombre-personaje"
                        style="color:${color}"
                    >
                        ${activo}${nombreRaw}
                    </b>


                    ${iniciativasHTML}


                    <div class="dado-linea">

                        <span>
                            🎲 Dado:
                        </span>


                        <input
                            type="number"
                            id="dado-${idSeguro}"
                            value="${valorDado}"

                            oninput="
                                cambiarDado(
                                    '${p.nombre.replace(/'/g, "\\'")}',
                                    this.value
                                )
                            "

                            onkeydown="
                                if(event.key === 'Enter'){
                                    event.preventDefault();
                                    siguienteInput(this.id);
                                }
                            "
                        >

                    </div>


                    <div class="total-linea">

                        <div
                            id="total-${idSeguro}"
                        >
                            Total:
                            ${
                                Number.isFinite(
                                    Number(p.total)
                                )
                                    ? p.total
                                    : iniciativaSeleccionada(p)
                            }
                        </div>


                        ${
                            p.warning &&
                            p.warning.length > 0

                                ? `

                                    <div class="warning">
                                        ${warningText}
                                    </div>

                                  `

                                : ""
                        }

                    </div>


                    <button
                        type="button"
                        class="delete"
                        onclick="
                            borrar(
                                '${p.nombre.replace(/'/g, "\\'")}'
                            )
                        "
                    >
                        🗑️
                    </button>

                </div>

            `;
        }
    );


    actualizarBotones();

    actualizarRonda();

    renderHistorico();

    save();
}



/* ==================================================
   BOTONES
================================================== */

function actualizarBotones() {

    const btn =
        document.querySelector(
            ".combat.iniciar"
        );


    if (!btn) {
        return;
    }


    if (modoCombate) {

        btn.textContent =
            "Finalizar combate";


        btn.classList.add(
            "activo"
        );

    } else {

        btn.textContent =
            "▶ Iniciar combate";


        btn.classList.remove(
            "activo"
        );
    }
}



/* ==================================================
   RONDA
================================================== */

function actualizarRonda() {

    const elemento =
        document.getElementById(
            "rondaActual"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        `⚔ Ronda ${rondaActual}`;
}



/* ==================================================
   AÑADIR PERSONAJE
================================================== */

function addPersonaje() {

    const nombreInput =
        document.getElementById(
            "nombre"
        );


    if (!nombreInput) {
        return;
    }


    const nombre =
        nombreInput.value.trim();


    if (!nombre) {

        nombreInput.focus();

        return;
    }


    const campos =
        [
            "ini1",
            "ini2",
            "ini3",
            "ini4"
        ];


    const valores =
        [];


    campos.forEach(
        id => {

            const input =
                document.getElementById(id);


            if (!input) {
                return;
            }


            const valor =
                parseInt(input.value);


            if (!Number.isNaN(valor)) {

                valores.push(valor);
            }
        }
    );


    if (valores.length === 0) {

        valores.push(0);
    }


    personajes.push({

        nombre: nombre,

        ini: valores[0],

        iniciativas: valores,

        iniciativaSeleccionada: 0,

        dado: 0,

        total: valores[0]

    });


    /*
       Limpiar formulario.
    */

    nombreInput.value = "";


    campos.forEach(
        id => {

            const input =
                document.getElementById(id);


            if (input) {

                input.value = "";
            }
        }
    );


    /*
       Al añadir seguimos estando
       en preparación.
    */

    modoCombate = false;

    modoOrden = "preparacion";


    save();

    render();


    nombreInput.focus();
}



/* ==================================================
   BORRAR
================================================== */

function borrar(nombre) {

    const indice =
        personajes.findIndex(
            p =>
                p.nombre === nombre
        );


    if (indice === -1) {
        return;
    }


    personajes.splice(
        indice,
        1
    );


    if (
        personajes.length === 0
    ) {

        turnoActual = 0;

    } else if (
        turnoActual >= personajes.length
    ) {

        turnoActual =
            personajes.length - 1;
    }


    save();

    render();
}



/* ==================================================
   ORDENAR
================================================== */

function ordenar() {

    /*
       Primero recogemos los dados
       respetando el orden de preparación.
    */

    const preparacion =
        ordenarPreparacion(personajes);


    preparacion.forEach(
        p => {

            const input =
                document.getElementById(
                    `dado-${encodeURIComponent(p.nombre)}`
                );


            if (input) {

                const valor =
                    parseInt(input.value);


                p.dado =
                    Number.isNaN(valor)
                        ? 0
                        : valor;
            }


            p.total =
                iniciativaSeleccionada(p) +
                (Number(p.dado) || 0);
        }
    );


    /*
       Ahora sí cambiamos al orden de combate.
    */

    personajes =
        ordenarCombate(
            preparacion
        );


    modoOrden =
        "combate";


    turnoActual = 0;


    save();

    render();
}



/* ==================================================
   INICIAR / FINALIZAR COMBATE
================================================== */

function iniciarCombate() {

    if (
        personajes.length === 0
    ) {
        return;
    }


    /*
       =============================================
       INICIAR COMBATE
       =============================================
    */

    if (!modoCombate) {

        /*
           Recogemos los dados siguiendo
           el orden de preparación.
        */

        const preparacion =
            ordenarPreparacion(personajes);


        preparacion.forEach(
            p => {

                const input =
                    document.getElementById(
                        `dado-${encodeURIComponent(p.nombre)}`
                    );


                if (input) {

                    const valor =
                        parseInt(input.value);


                    p.dado =
                        Number.isNaN(valor)
                            ? 0
                            : valor;
                }


                p.total =
                    iniciativaSeleccionada(p) +
                    (Number(p.dado) || 0);
            }
        );


        /*
           Una vez introducidos todos los dados,
           comienza el combate y se ordena por total.
        */

        personajes =
            ordenarCombate(
                preparacion
            );


        modoOrden =
            "combate";


        modoCombate =
            true;


        turnoActual = 0;


        save();

        render();

        return;
    }



    /*
       =============================================
       FINALIZAR RONDA
       =============================================
    */

    const resultados =
        personajes.map(
            p => ({

                nombre:
                    p.nombre,

                total:
                    Number(p.total) || 0
            })
        );


    historico.push({

        ronda:
            rondaActual,

        resultados:
            resultados
    });


    /*
       Siguiente ronda.
    */

    rondaActual++;


    /*
       Resetear dados manteniendo
       la iniciativa seleccionada.
    */

    personajes.forEach(
        p => {

            p.dado = 0;

            p.total =
                iniciativaSeleccionada(p);
        }
    );


    turnoActual = 0;

    modoCombate = true;

    modoOrden = "combate";


    save();

    render();
}



/* ==================================================
   SIGUIENTE TURNO
================================================== */

function siguienteTurno() {

    if (!modoCombate) {
        return;
    }


    if (
        personajes.length === 0
    ) {
        return;
    }


    turnoActual++;


    if (
        turnoActual >=
        personajes.length
    ) {

        turnoActual = 0;
    }


    render();
}



/* ==================================================
   COMBATE NUEVO
================================================== */

function nuevoCombate() {

    rondaActual = 1;

    historico = [];

    turnoActual = 0;

    modoCombate = false;

    modoOrden = "preparacion";


    personajes.forEach(
        p => {

            p.dado = 0;

            /*
               Volvemos a la iniciativa A.
            */

            p.iniciativaSeleccionada = 0;

            p.total =
                iniciativaSeleccionada(p);

            p.warning = [];
        }
    );


    /*
       Al volver a preparación,
       se recupera automáticamente
       el orden de preparación.
    */

    personajes =
        ordenarPreparacion(
            personajes
        );


    save();

    render();
}



/* ==================================================
   HISTÓRICO
================================================== */

function renderHistorico() {

    const contenedor =
        document.getElementById(
            "historicoLista"
        );


    if (!contenedor) {
        return;
    }


    if (
        historico.length === 0
    ) {

        contenedor.innerHTML = `

            <p class="sin-historico">
                Todavía no hay rondas registradas.
            </p>

        `;

        return;
    }


    contenedor.innerHTML = "";


    /*
       Ronda más reciente primero.
    */

    [...historico]
        .reverse()
        .forEach(
            registro => {

                const details =
                    document.createElement(
                        "details"
                    );


                const summary =
                    document.createElement(
                        "summary"
                    );


                summary.textContent =
                    `⚔ Ronda ${registro.ronda}`;


                details.appendChild(
                    summary
                );


                const contenido =
                    document.createElement(
                        "div"
                    );


                contenido.className =
                    "historico-ronda";


                registro.resultados
                    .forEach(
                        resultado => {

                            const fila =
                                document.createElement(
                                    "div"
                                );


                            fila.className =
                                "historico-personaje";


                            fila.innerHTML = `

                                <span>
                                    ${resultado.nombre}
                                </span>

                                <strong>
                                    ${resultado.total}
                                </strong>

                            `;


                            contenido.appendChild(
                                fila
                            );
                        }
                    );


                details.appendChild(
                    contenido
                );


                contenedor.appendChild(
                    details
                );
            }
        );
}



/* ==================================================
   CERRAR TECLADO
================================================== */

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.tagName !== "INPUT"
        ) {

            if (
                document.activeElement &&
                typeof document.activeElement.blur === "function"
            ) {

                document.activeElement.blur();
            }
        }
    }
);



/* ==================================================
   INICIO
================================================== */

render();
