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
   CAMBIAR INICIATIVA
================================================== */

function cambiarIniciativa(
    indicePersonaje,
    indiceIniciativa
) {

    const p =
        personajes[indicePersonaje];

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
    indicePersonaje,
    valor
) {

    const p =
        personajes[indicePersonaje];

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
        (p, i) => {

            const elemento =
                document.getElementById(
                    `total-${i}`
                );

            if (elemento) {

                elemento.textContent =
                    `Total: ${p.total}`;
            }
        }
    );
}



/* ==================================================
   SIGUIENTE INPUT DE DADO
================================================== */

function siguienteInput(actualId) {

    const inputs =
        Array.from(
            document.querySelectorAll(
                "#lista input[type='number']"
            )
        );

    const index =
        inputs.findIndex(
            input => input.id === actualId
        );

    if (index === -1) {
        return;
    }

    const current =
        inputs[index];

    const next =
        inputs[index + 1];


    /*
       Guardamos el valor actual.
       Si está vacío, se considera 0.
    */

    if (current) {

        const valor =
            parseInt(current.value);

        current.value =
            Number.isNaN(valor)
                ? 0
                : valor;
    }


    /*
       Pasamos al siguiente personaje.
       MUY IMPORTANTE:
       dejamos el campo completamente vacío
       antes de darle el foco.
    */

    if (next) {

        next.value = "";

        /*
           Un pequeño retraso hace que funcione
           correctamente también en móviles.
        */

        setTimeout(() => {

            next.focus();

        }, 50);

    } else {

        /*
           Si era el último personaje,
           cerramos el teclado.
        */

        if (
            document.activeElement &&
            typeof document.activeElement.blur === "function"
        ) {

            document.activeElement.blur();
        }
    }
}



/* ==================================================
   ORDEN PREPARACIÓN
================================================== */

function ordenarPreparacion(lista) {

    return [...lista].sort(
        (a, b) => {

            const A =
                a.nombre
                    .trim()
                    .toUpperCase();

            const B =
                b.nombre
                    .trim()
                    .toUpperCase();


            function rango(nombre) {

                if (/\d/.test(nombre)) {
                    return 0;
                }

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

                return 6;
            }


            const rangoA =
                rango(A);

            const rangoB =
                rango(B);


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
   ORDEN COMBATE
================================================== */

function ordenarCombate(lista) {

    return [...lista].sort(
        (a, b) =>
            (Number(b.total) || 0) -
            (Number(a.total) || 0)
    );
}



/* ==================================================
   RENDER PRINCIPAL
================================================== */

function render() {

    const lista =
        document.getElementById("lista");

    if (!lista) {
        return;
    }

    lista.innerHTML = "";


    let ordenados;

    if (modoOrden === "combate") {

        ordenados =
            ordenarCombate(personajes);

    } else {

        ordenados =
            ordenarPreparacion(personajes);
    }


    /* ==============================================
       CALCULAR ADVERTENCIAS
    ============================================== */

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


    personajes =
        ordenados;


    /* ==============================================
       CREAR TARJETAS
    ============================================== */

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


            /* ALIADO */

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


            /* PROTAGONISTAS */

            else if (
                protagonistas.includes(
                    nombreRaw.toUpperCase()
                )
            ) {

                color =
                    "#ffffff";
            }


            /* ======================================
               ADVERTENCIA
            ====================================== */

            const warningText =
                p.warning &&
                p.warning.length > 0

                    ? `⚠ ${p.warning.join(", ")}`

                    : "";


            /* ======================================
               INICIATIVAS
            ====================================== */

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
                                        onclick="cambiarIniciativa(${i}, ${indice})"
                                    >
                                        <strong>${letra}</strong>
                                        <span>${valor}</span>
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


            /* ======================================
               TARJETA
            ====================================== */

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
                            id="dado-${i}"
                            value="${
                                Number(p.dado) === 0
                                    ? ""
                                    : p.dado
                            }"
                            oninput="cambiarDado(${i}, this.value)"
                            onkeydown="
                                if(event.key === 'Enter'){
                                    event.preventDefault();
                                    siguienteInput(this.id);
                                }
                            "
                        >

                    </div>


                    <div class="total-linea">

                        <div id="total-${i}">
                            Total: ${
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
                        onclick="borrar(${i})"
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
        document.getElementById("nombre");

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


    const nuevoPersonaje = {

        nombre: nombre,

        ini: valores[0],

        iniciativas: valores,

        iniciativaSeleccionada: 0,

        dado: 0,

        total: valores[0]

    };


    personajes.push(
        nuevoPersonaje
    );


    /* Limpiar formulario */

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


    save();

    render();


    nombreInput.focus();
}



/* ==================================================
   BORRAR PERSONAJE
================================================== */

function borrar(i) {

    if (
        i < 0 ||
        i >= personajes.length
    ) {
        return;
    }


    personajes.splice(
        i,
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

    personajes.forEach(
        (p, i) => {

            const input =
                document.getElementById(
                    `dado-${i}`
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


    /* ==============================================
       INICIAR COMBATE
    ============================================== */

    if (!modoCombate) {

        personajes.forEach(
            (p, i) => {

                const input =
                    document.getElementById(
                        `dado-${i}`
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


        personajes =
            ordenarCombate(
                personajes
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


    /* ==============================================
       FINALIZAR RONDA ACTUAL
    ============================================== */

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


    rondaActual++;


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

            p.iniciativaSeleccionada = 0;

            p.total =
                iniciativaSeleccionada(p);

            p.warning = [];
        }
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
