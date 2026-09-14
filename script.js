let personajes =
    JSON.parse(
        localStorage.getItem("personajes")
    ) || [];


let modoCombate = false;


let turnoActual = 0;


let rondaActual =
    parseInt(
        localStorage.getItem("rondaActual")
    ) || 1;


let historico =
    JSON.parse(
        localStorage.getItem("historicoCombate")
    ) || [];



/* ==================================================
   ORDEN DE PREPARACIÓN
================================================== */

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


    if (
        typeof p.ini !== "undefined"
    ) {

        return [
            Number(p.ini) || 0
        ];
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



/* ==================================================
   CALCULAR TOTAL
================================================== */

function calcularTotal(p) {

    return (
        iniciativaSeleccionada(p) +
        (Number(p.dado) || 0)
    );
}



/* ==================================================
   ORDEN DE PREPARACIÓN
==================================================

   1. Nombres con números
   2. PLATA
   3. MARAVI
   4. MARTINA
   5. TAKESHI
   6. IMME
   7. Resto alfabéticamente
================================================== */

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

                /*
                   NOMBRES CON NÚMEROS
                */

                if (
                    /\d/.test(nombre)
                ) {

                    return 0;
                }


                /*
                   PERSONAJES
                */

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


                /*
                   OTROS
                */

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



/* ==================================================
   ORDEN DE COMBATE
================================================== */

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



/* ==================================================
   CAMBIAR INICIATIVA
================================================== */

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
       Guardamos la selección.

       No ordenamos aquí.
    */

    save();

    render();
}



/* ==================================================
   CAMBIAR DADO
================================================== */

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
       MUY IMPORTANTE:

       Aquí NO calculamos el total.

       El total se calcula cuando se pulsa
       ORDENAR o INICIAR COMBATE.
    */

    save();
}



/* ==================================================
   SIGUIENTE INPUT
================================================== */

function siguienteInput(
    actualId
) {

    /*
       El orden para introducir los dados
       SIEMPRE es el orden de preparación.
    */

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


    /*
       Guardar el valor actual.
    */

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


    /*
       Buscar siguiente.
    */

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

            /*
               Evita que se escriba sobre
               el 0 que se muestra internamente.
            */

            siguiente.value = "";


            setTimeout(
                () => {

                    siguiente.focus();

                },
                50
            );
        }

    } else {

        /*
           Último personaje.

           No iniciamos el combate.
           El usuario pulsa Ordenar.
        */

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



/* ==================================================
   RENDER
================================================== */

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
       =============================================
       ORDEN DE LA LISTA
       =============================================

       Preparación:
       números → personajes → otros

       Combate:
       total descendente
    */

    if (modoCombate) {

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



    /* ==================================================
       ADVERTENCIAS
    ================================================== */

    personajes.forEach(
        p => {

            p.warning = [];
        }
    );


    if (modoCombate) {

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



    /* ==================================================
       CREAR TARJETAS
    ================================================== */

    personajes.forEach(
        (p, i) => {

            /*
               Marcador de turno activo.
            */

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


            /*
               Color por tipo de personaje.
            */

            let color =
                "#ff9800";


            /*
               ALIADO
            */

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


            /*
               PROTAGONISTAS
            */

            else if (
                protagonistas.includes(
                    nombreOriginal
                        .toUpperCase()
                )
            ) {

                color =
                    "#ffffff";
            }


            /*
               ID para el input.
            */

            const idSeguro =
                encodeURIComponent(
                    nombreOriginal
                );



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


            /*
               VARIAS INICIATIVAS
            */

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

            /*
               UNA SOLA INICIATIVA
            */

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



            /* ======================================
               TOTAL
            ====================================== */

            let totalHTML =
                "";


            if (modoCombate) {

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



            /* ======================================
               ADVERTENCIA
            ====================================== */

            let warningHTML =
                "";


            if (
                modoCombate &&
                p.warning &&
                p.warning.length > 0
            ) {

                warningHTML = `

                    <div class="warning">

                        ⚠ ${p.warning.join(", ")}

                    </div>

                `;
            }



            /* ======================================
               DADO
            ====================================== */

            /*
               Si el dado es 0, el campo aparece
               vacío.
            */

            const valorDado =
                Number(p.dado) === 0
                    ? ""
                    : p.dado;



            /* ======================================
               TARJETA
            ====================================== */

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



/* ==================================================
   BOTÓN INICIAR / FINALIZAR
================================================== */

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


    /*
       Si no se introduce ninguna,
       usamos 0.
    */

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


    /*
       Añadir personaje vuelve a preparación.
    */

    modoCombate = false;

    turnoActual = 0;


    /*
       Limpiar formulario.
    */

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



/* ==================================================
   BORRAR
================================================== */

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



/* ==================================================
   ORDENAR
================================================== */

function ordenar() {

    if (
        personajes.length === 0
    ) {

        return;
    }


    /*
       1. Recuperar orden de preparación.
    */

    const preparacion =
        ordenarPreparacion(
            personajes
        );


    /*
       2. Recoger los dados.
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


            /*
               3. AQUÍ se calcula el total.
            */

            p.total =
                calcularTotal(p);
        }
    );


    /*
       4. AHORA se ordenan por total.
    */

    personajes =
        ordenarCombate(
            preparacion
        );


    turnoActual = 0;


    /*
       Todavía no hemos iniciado combate.
    */

    modoCombate = false;


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

        /*
           Primero recuperamos el orden
           de preparación.
        */

        const preparacion =
            ordenarPreparacion(
                personajes
            );


        /*
           Recoger dados y calcular.
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
           Ordenar por total.
        */

        personajes =
            ordenarCombate(
                preparacion
            );


        /*
           Entramos en combate.
        */

        modoCombate = true;

        turnoActual = 0;


        save();

        render();

        return;
    }



    /* ==============================================
       FINALIZAR RONDA
    ============================================== */

    /*
       Guardamos los resultados
       de la ronda actual.
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


    /*
       Pasamos a la siguiente ronda.
    */

    rondaActual++;


    /*
       Reiniciar dados.
    */

    personajes.forEach(
        p => {

            p.dado = 0;

            /*
               Conservamos la iniciativa
               que estuviera seleccionada.
            */

            p.total =
                iniciativaSeleccionada(p);

            p.warning = [];
        }
    );


    /*
       ============================================
       VOLVER A PREPARACIÓN
       ============================================

       Números
       ↓
       PLATA
       ↓
       MARAVI
       ↓
       MARTINA
       ↓
       TAKESHI
       ↓
       IMME
       ↓
       Otros
    */

    personajes =
        ordenarPreparacion(
            personajes
        );


    /*
       Dejamos de estar en combate.

       Los tres botones siguen estando
       abajo porque la barra es fija.
    */

    modoCombate = false;

    turnoActual = 0;


    save();

    render();
}



/* ==================================================
   SIGUIENTE TURNO
================================================== */

function siguienteTurno() {

    /*
       Solo funciona durante el combate.
    */

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

    /*
       Protección contra pulsaciones accidentales.
    */

    const confirmar =
        confirm(
            "¿Seguro que quieres empezar un combate nuevo? Se borrará el histórico actual y los dados volverán a 0."
        );


    if (!confirmar) {

        return;
    }


    /*
       Reiniciar ronda.
    */

    rondaActual = 1;


    /*
       Borrar histórico.
    */

    historico = [];


    /*
       Salir de combate.
    */

    modoCombate = false;

    turnoActual = 0;


    /*
       Reiniciar dados e iniciativas.
    */

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


    /*
       Orden de preparación.
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
       La ronda más reciente aparece primero.
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
                typeof document.activeElement.blur ===
                    "function"
            ) {

                document.activeElement.blur();
            }
        }
    }
);



/* ==================================================
   INICIAR
================================================== */

render();
