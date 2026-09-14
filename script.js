let personajes =
    JSON.parse(
        localStorage.getItem("personajes")
    ) || [];

let modoCombate = false;
let turnoActual = 0;

/*
    Indica si los valores han sido calculados
    mediante el botón "Ordenar".

    Esto permite ver los totales antes de
    iniciar el combate.
*/
let valoresOrdenados = false;

let rondaActual =
    parseInt(
        localStorage.getItem("rondaActual")
    ) || 1;

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


function obtenerIniciativas(p) {

    if (
        Array.isArray(p.iniciativas) &&
        p.iniciativas.length > 0
    ) {

        return p.iniciativas;
    }

    if (
        typeof p.ini !== "undefined"
    ) {

        return [
            Number(p.ini) || 0
        ];
    }

    return [0];
}


function iniciativaSeleccionada(p) {

    const iniciativas =
        obtenerIniciativas(p);

    let indice =
        Number(
            p.iniciativaSeleccionada
        );

    if (
        !Number.isInteger(indice) ||
        indice < 0 ||
        indice >= iniciativas.length
    ) {

        indice = 0;
    }

    return (
        Number(
            iniciativas[indice]
        ) || 0
    );
}


function calcularTotal(p) {

    return (
        iniciativaSeleccionada(p) +
        (Number(p.dado) || 0)
    );
}


function ordenarPreparacion(lista) {

    return [...lista].sort(
        (a, b) => {

            const A =
                String(
                    a.nombre || ""
                )
                .trim()
                .toUpperCase();

            const B =
                String(
                    b.nombre || ""
                )
                .trim()
                .toUpperCase();


            function rango(nombre) {

                if (
                    /\d/.test(nombre)
                ) {

                    return 0;
                }

                if (
                    nombre === "PLATA"
                ) {

                    return 1;
                }

                if (
                    nombre === "MARAVI"
                ) {

                    return 2;
                }

                if (
                    nombre === "MARTINA"
                ) {

                    return 3;
                }

                if (
                    nombre === "TAKESHI"
                ) {

                    return 4;
                }

                if (
                    nombre === "IMME"
                ) {

                    return 5;
                }

                return 6;
            }


            const rangoA =
                rango(A);

            const rangoB =
                rango(B);


            if (
                rangoA !== rangoB
            ) {

                return rangoA - rangoB;
            }


            return A.localeCompare(
                B,
                "es"
            );
        }
    );
}


function ordenarCombate(lista) {

    return [...lista].sort(
        (a, b) => {

            return (
                (Number(b.total) || 0) -
                (Number(a.total) || 0)
            );
        }
    );
}


function cambiarIniciativa(
    nombre,
    indice
) {

    const p =
        personajes.find(
            personaje =>
                personaje.nombre === nombre
        );

    if (!p) {
        return;
    }


    p.iniciativaSeleccionada =
        Number(indice) || 0;


    /*
        Si todavía no hemos pulsado Ordenar,
        no mostramos/cambiamos el total.

        Si ya habíamos ordenado, el total se
        actualizará al volver a pulsar Ordenar.
    */

    save();

    render();
}


function cambiarDado(
    nombre,
    valor
) {

    const p =
        personajes.find(
            personaje =>
                personaje.nombre === nombre
        );

    if (!p) {
        return;
    }


    const numero =
        parseInt(valor);


    p.dado =
        Number.isNaN(numero)
            ? 0
            : numero;


    /*
        IMPORTANTE:
        Aquí NO calculamos el total.

        El total se calcula solamente cuando
        se pulsa "Ordenar" o "Iniciar combate".
    */


    save();
}


function siguienteInput(
    actualId
) {

    const ordenPreparacion =
        ordenarPreparacion(
            personajes
        );


    const ids =
        ordenPreparacion.map(
            p =>
                "dado-" +
                encodeURIComponent(
                    p.nombre
                )
        );


    const posicion =
        ids.indexOf(
            actualId
        );


    if (
        posicion === -1
    ) {

        return;
    }


    const actual =
        document.getElementById(
            actualId
        );


    if (actual) {

        const personaje =
            ordenPreparacion[
                posicion
            ];


        const valor =
            parseInt(
                actual.value
            );


        personaje.dado =
            Number.isNaN(valor)
                ? 0
                : valor;
    }


    const siguienteId =
        ids[
            posicion + 1
        ];


    if (siguienteId) {

        const siguiente =
            document.getElementById(
                siguienteId
            );


        if (siguiente) {

            siguiente.value = "";

            setTimeout(
                () => {

                    siguiente.focus();

                },
                50
            );
        }

    } else {

        if (
            document.activeElement &&
            typeof document.activeElement.blur ===
                "function"
        ) {

            document.activeElement.blur();
        }
    }


    save();
}


function render() {

    const lista =
        document.getElementById(
            "lista"
        );


    if (!lista) {
        return;
    }


    lista.innerHTML = "";


    /*
        Durante combate:
        ordenar por total.

        Fuera de combate:
        mantener el orden de preparación,
        salvo que acabemos de pulsar Ordenar.
    */

    if (modoCombate) {

        personajes =
            ordenarCombate(
                personajes
            );

    } else {

        if (valoresOrdenados) {

            personajes =
                ordenarCombate(
                    personajes
                );

        } else {

            personajes =
                ordenarPreparacion(
                    personajes
                );
        }
    }


    personajes.forEach(
        p => {

            p.warning = [];
        }
    );


    /*
        Las advertencias se calculan cuando
        estamos viendo los resultados ordenados.
    */

    if (
        modoCombate ||
        valoresOrdenados
    ) {

        for (
            let j = 0;
            j < personajes.length;
            j++
        ) {

            for (
                let i = 0;
                i < j;
                i++
            ) {

                const diferencia =
                    (
                        Number(
                            personajes[i].total
                        ) || 0
                    ) -
                    (
                        Number(
                            personajes[j].total
                        ) || 0
                    );


                if (
                    diferencia >= 150
                ) {

                    personajes[j]
                        .warning
                        .push(
                            personajes[i].nombre
                        );
                }
            }
        }
    }


    personajes.forEach(
        (p, i) => {

            const activo =
                modoCombate &&
                i === turnoActual
                    ? "🔴 "
                    : "";


            const nombreOriginal =
                String(
                    p.nombre || ""
                ).trim();


            let nombreMostrar =
                nombreOriginal;


            let color =
                "#ff9800";


            if (
                nombreOriginal
                    .toUpperCase()
                    .startsWith(
                        "ALIADO "
                    )
            ) {

                color =
                    "#2e7d32";


                nombreMostrar =
                    nombreOriginal.replace(
                        /^ALIADO\s+/i,
                        ""
                    );

            }

            else if (
                protagonistas.includes(
                    nombreOriginal
                        .toUpperCase()
                )
            ) {

                color =
                    "#ffffff";
            }


            const idSeguro =
                encodeURIComponent(
                    nombreOriginal
                );


            const iniciativas =
                obtenerIniciativas(p);


            let indiceActivo =
                Number(
                    p.iniciativaSeleccionada
                );


            if (
                !Number.isInteger(
                    indiceActivo
                ) ||
                indiceActivo < 0 ||
                indiceActivo >=
                    iniciativas.length
            ) {

                indiceActivo = 0;
            }


            let iniciativasHTML =
                "";


            if (
                iniciativas.length > 1
            ) {

                iniciativasHTML = `

                    <div class="selector-iniciativas">

                        ${iniciativas.map(
                            (valor, indice) => {

                                const letra =
                                    String.fromCharCode(
                                        65 + indice
                                    );


                                const seleccionada =
                                    indice ===
                                    indiceActivo
                                        ? "seleccionada"
                                        : "";


                                return `

                                    <button
                                        type="button"
                                        class="boton-iniciativa ${seleccionada}"
                                        onclick="
                                            cambiarIniciativa(
                                                '${nombreOriginal.replace(/'/g, "\\'")}',
                                                ${indice}
                                            )
                                        "
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

            }

            else {

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
                AHORA EL TOTAL SE MUESTRA
                TAMBIÉN DESPUÉS DE PULSAR ORDENAR.
            */

            let totalHTML =
                "";


            if (
                modoCombate ||
                valoresOrdenados
            ) {

                totalHTML = `

                    <div
                        id="total-${idSeguro}"
                        class="total-linea"
                    >
                        Total:
                        ${p.total}
                    </div>

                `;
            }


            let warningHTML =
                "";


            if (
                (modoCombate ||
                valoresOrdenados) &&
                p.warning &&
                p.warning.length > 0
            ) {

                warningHTML = `

                    <div class="warning">

                        ⚠ ${p.warning.join(", ")}

                    </div>

                `;
            }


            const valorDado =
                Number(p.dado) === 0
                    ? ""
                    : p.dado;


            lista.innerHTML += `

                <div class="card">

                    <b
                        class="nombre-personaje"
                        style="color:${color}"
                    >
                        ${activo}${nombreMostrar}
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
                                    '${nombreOriginal.replace(/'/g, "\\'")}',
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


                    ${totalHTML}


                    ${warningHTML}


                    <button
                        type="button"
                        class="delete"

                        onclick="
                            borrar(
                                '${nombreOriginal.replace(/'/g, "\\'")}'
                            )
                        "
                    >
                        🗑️
                    </button>

                </div>

            `;
        }
    );


    actualizarBotonCombate();

    actualizarRonda();

    renderHistorico();

    save();
}


function actualizarBotonCombate() {

    const boton =
        document.querySelector(
            ".combat.iniciar"
        );


    if (!boton) {
        return;
    }


    if (modoCombate) {

        boton.textContent =
            "Finalizar combate";


        boton.classList.add(
            "activo"
        );

    } else {

        boton.textContent =
            "▶ Iniciar combate";


        boton.classList.remove(
            "activo"
        );
    }
}


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


    const ids =
        [
            "ini1",
            "ini2",
            "ini3",
            "ini4"
        ];


    const iniciativas =
        [];


    ids.forEach(
        id => {

            const input =
                document.getElementById(
                    id
                );


            if (!input) {
                return;
            }


            const valor =
                parseInt(
                    input.value
                );


            if (
                !Number.isNaN(valor)
            ) {

                iniciativas.push(
                    valor
                );
            }
        }
    );


    if (
        iniciativas.length === 0
    ) {

        iniciativas.push(0);
    }


    personajes.push({

        nombre:
            nombre,

        ini:
            iniciativas[0],

        iniciativas:
            iniciativas,

        iniciativaSeleccionada:
            0,

        dado:
            0,

        total:
            iniciativas[0]

    });


    modoCombate = false;

    valoresOrdenados = false;

    turnoActual = 0;


    nombreInput.value = "";


    ids.forEach(
        id => {

            const input =
                document.getElementById(
                    id
                );


            if (input) {

                input.value = "";
            }
        }
    );


    save();

    render();

    nombreInput.focus();
}


function borrar(nombre) {

    const indice =
        personajes.findIndex(
            p =>
                p.nombre === nombre
        );


    if (
        indice === -1
    ) {

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
        turnoActual >=
        personajes.length
    ) {

        turnoActual =
            personajes.length - 1;
    }


    save();

    render();
}


function ordenar() {

    if (
        personajes.length === 0
    ) {

        return;
    }


    /*
        Primero recuperamos el orden de preparación
        para leer correctamente los dados.
    */

    const preparacion =
        ordenarPreparacion(
            personajes
        );


    /*
        AQUÍ SE CALCULAN LOS TOTALES.

        No se calculan al escribir el dado.
        Solo al pulsar "Ordenar".
    */

    preparacion.forEach(
        p => {

            const input =
                document.getElementById(
                    "dado-" +
                    encodeURIComponent(
                        p.nombre
                    )
                );


            if (input) {

                const valor =
                    parseInt(
                        input.value
                    );


                p.dado =
                    Number.isNaN(valor)
                        ? 0
                        : valor;
            }


            p.total =
                calcularTotal(p);
        }
    );


    /*
        Ordenamos por total descendente.
    */

    personajes =
        ordenarCombate(
            preparacion
        );


    /*
        IMPORTANTE:

        Todavía NO estamos en combate.

        Simplemente mostramos los resultados
        calculados para poder comprobarlos.
    */

    valoresOrdenados = true;

    modoCombate = false;

    turnoActual = 0;


    save();

    render();
}


function iniciarCombate() {

    if (
        personajes.length === 0
    ) {

        return;
    }


    /*
        INICIAR COMBATE
    */

    if (!modoCombate) {

        /*
            Volvemos al orden de preparación
            para recoger los valores actuales
            de los campos de dado.
        */

        const preparacion =
            ordenarPreparacion(
                personajes
            );


        /*
            Calculamos de nuevo los totales
            al iniciar.
        */

        preparacion.forEach(
            p => {

                const input =
                    document.getElementById(
                        "dado-" +
                        encodeURIComponent(
                            p.nombre
                        )
                    );


                if (input) {

                    const valor =
                        parseInt(
                            input.value
                        );


                    p.dado =
                        Number.isNaN(valor)
                            ? 0
                            : valor;
                }


                p.total =
                    calcularTotal(p);
            }
        );


        personajes =
            ordenarCombate(
                preparacion
            );


        modoCombate = true;

        valoresOrdenados = true;

        turnoActual = 0;


        save();

        render();

        return;
    }


    /*
        FINALIZAR COMBATE

        Guardamos los resultados de la ronda.
    */

    historico.push({

        ronda:
            rondaActual,

        resultados:
            personajes.map(
                p => ({

                    nombre:
                        p.nombre,

                    total:
                        Number(
                            p.total
                        ) || 0

                })
            )
    });


    rondaActual++;


    /*
        Reiniciamos los dados.
    */

    personajes.forEach(
        p => {

            p.dado = 0;

            p.total =
                iniciativaSeleccionada(p);

            p.warning = [];
        }
    );


    /*
        Volvemos al orden de preparación
        para introducir los dados de la
        siguiente ronda.
    */

    personajes =
        ordenarPreparacion(
            personajes
        );


    modoCombate = false;

    valoresOrdenados = false;

    turnoActual = 0;


    save();

    render();
}


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


function nuevoCombate() {

    const confirmar =
        confirm(
            "¿Seguro que quieres empezar un combate nuevo? Se borrará el histórico actual y los dados volverán a 0."
        );


    if (!confirmar) {
        return;
    }


    rondaActual = 1;

    historico = [];

    modoCombate = false;

    valoresOrdenados = false;

    turnoActual = 0;


    personajes.forEach(
        p => {

            p.dado = 0;

            p.iniciativaSeleccionada =
                0;

            p.total =
                iniciativaSeleccionada(p);

            p.warning = [];
        }
    );


    personajes =
        ordenarPreparacion(
            personajes
        );


    save();

    render();
}


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


document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.tagName !== "INPUT"
        ) {

            if (
                document.activeElement &&
                typeof document.activeElement.blur ===
                    "function"
            ) {

                document.activeElement.blur();
            }
        }
    }
);


render();
