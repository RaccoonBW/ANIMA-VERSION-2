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
        localStorage.getItem(
            "historicoCombate"
        )
    ) || [];



/* ==================================================
   ORDEN DE LOS PERSONAJES EN PREPARACIÓN
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
        Array.isArray(
            p.iniciativas
        ) &&
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
       La iniciativa seleccionada cambia
       inmediatamente.

       El orden NO se modifica aquí.
       El orden por total solo se hará
       al pulsar ORDENAR o INICIAR COMBATE.
    */

    p.total =
        calcularTotal(p);


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
       NO calculamos el total aquí.

       Mientras se introducen los números,
       solo guardamos el dado.

       El cálculo definitivo se hace al
       pulsar ORDENAR.
    */

    save();
}



/* ==================================================
   SIGUIENTE PERSONAJE CON ENTER
================================================== */

function siguienteInput(
    actualId
) {

    /*
       Siempre utilizamos el orden
       de PREPARACIÓN para introducir
       los dados.
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
       Guardamos el número actual.
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
               Importante:
               el siguiente campo queda vacío.
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
           Era el último personaje.

           NO comenzamos el combate
           automáticamente.

           El usuario decide cuándo pulsar
           Ordenar o Iniciar combate.
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
       PREPARACIÓN:
       números → personajes → otros.

       COMBATE:
       total más alto → más bajo.
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


    /*
       Limpiar advertencias.
    */

    personajes.forEach(
        p => {

            p.warning = [];
        }
    );


    /*
       Advertencias:
       si un personaje anterior tiene
       150 o más puntos de diferencia.
    */

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

                                        onclick="cambiarIniciativa(
                                            '${nombreOriginal.replace(/'/g, "\\'")}',
                                            ${indice}
                                        )"
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



            /* ======================================
               TOTAL

               Solo se muestra después de ordenar.
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

               0 = campo vacío.
            ====================================== */

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
   INDICADOR DE RONDA
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
       Añadir un personaje nos devuelve
       a preparación.
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
   BORRAR PERSONAJE
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
       Primero recuperamos el orden de
       PREPARACIÓN.
    */

    const preparacion =
        ordenarPreparacion(
            personajes
        );


    /*
       Recoger todos los dados.
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
               AQUÍ, Y SOLO AQUÍ,
               calculamos el total.
            */

            p.total =
                calcularTotal(p);
        }
    );


    /*
       Ahora sí ordenamos
       por total descendente.
    */

    personajes =
        ordenarCombate(
            preparacion
        );


    turnoActual = 0;


    /*
       Seguimos fuera del combate.

       Esto permite pulsar Ordenar
       para comprobar el orden antes
       de iniciar.
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
           Recuperar orden de preparación.
        */

        const preparacion =
            ordenarPreparacion(
                personajes
            );


        /*
           Recoger dados y calcular totales.
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
       Guardar los resultados actuales.
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
       Pasar a la siguiente ronda.
    */

    rondaActual++;


    /*
       Resetear dados.
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
       Ya no estamos en combate.

       Ahora se pueden introducir
       nuevamente los dados.
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
       Confirmación para evitar
       pulsaciones accidentales.
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
       Volver a preparación.
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
       Rondas más recientes primero.
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
   CERRAR TECLADO AL PULSAR FUERA
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
   INICIAR APP
================================================== */

render();
