let personajes = JSON.parse(localStorage.getItem("personajes")) || [];

let modoCombate = false;
let turnoActual = 0;

let modoOrden = "preparacion";

let rondaActual =
parseInt(localStorage.getItem("rondaActual")) || 1;

let historico =
JSON.parse(localStorage.getItem("historicoCombate")) || [];

const protagonistas = [
"PLATA",
"MARAVI",
"TAKESHI",
"MARTINA",
"IMME"
];

/* =========================
GUARDAR
========================= */

function save(){

```
localStorage.setItem(
    "personajes",
    JSON.stringify(personajes)
);

localStorage.setItem(
    "rondaActual",
    rondaActual
);

localStorage.setItem(
    "historicoCombate",
    JSON.stringify(historico)
);
```

}

/* =========================
INICIATIVAS
========================= */

function obtenerIniciativas(p){

```
if(
    Array.isArray(p.iniciativas) &&
    p.iniciativas.length > 0
){
    return p.iniciativas;
}

return [p.ini ?? 0];
```

}

function iniciativaSeleccionada(p){

```
const iniciativas =
    obtenerIniciativas(p);

let indice =
    parseInt(p.iniciativaSeleccionada);


if(
    isNaN(indice) ||
    indice < 0 ||
    indice >= iniciativas.length
){

    indice = 0;
}


return iniciativas[indice];
```

}

/* =========================
CAMBIAR INICIATIVA
========================= */

function cambiarIniciativa(
indicePersonaje,
indiceIniciativa
){

```
const p =
    personajes[indicePersonaje];


p.iniciativaSeleccionada =
    parseInt(indiceIniciativa) || 0;


p.total =
    iniciativaSeleccionada(p) +
    (p.dado || 0);


save();

render();
```

}

/* =========================
CAMBIAR DADO
========================= */

function cambiarDado(
indicePersonaje,
valor
){

```
const p =
    personajes[indicePersonaje];


const dado =
    parseInt(valor) || 0;


p.dado = dado;


p.total =
    iniciativaSeleccionada(p) +
    dado;


save();

actualizarTotalesVisuales();
```

}

function actualizarTotalesVisuales(){

```
personajes.forEach((p, i) => {

    const totalElement =
        document.getElementById(
            `total-${i}`
        );


    if(totalElement){

        totalElement.textContent =
            `Total: ${p.total}`;
    }

});
```

}

/* =========================
SIGUIENTE INPUT
========================= */

function siguienteInput(actualId){

```
const inputs =
    Array.from(
        document.querySelectorAll(
            "#lista input[type='number']"
        )
    );


const index =
    inputs.findIndex(
        i => i.id === actualId
    );


const current =
    inputs[index];

const next =
    inputs[index + 1];


if(current){

    current.value =
        parseInt(current.value) || 0;
}


if(next){

    next.value = 0;

    next.focus();

    next.select();

}else{

    document.activeElement.blur();
}
```

}

/* =========================
ORDEN PREPARACIÓN
========================= */

function ordenarPreparacion(lista){

```
return [...lista].sort((a,b) => {

    const A =
        a.nombre
            .trim()
            .toUpperCase();


    const B =
        b.nombre
            .trim()
            .toUpperCase();


    const rank = (name) => {

        if(/\d/.test(name)) return 0;

        if(name === "PLATA") return 1;

        if(name === "MARAVI") return 2;

        if(name === "MARTINA") return 3;

        if(name === "TAKESHI") return 4;

        if(name === "IMME") return 5;

        return 6;
    };


    const rA = rank(A);

    const rB = rank(B);


    if(rA === rB){

        return A.localeCompare(
            B,
            "es"
        );
    }


    return rA - rB;
});
```

}

/* =========================
ORDEN COMBATE
========================= */

function ordenarCombate(lista){

```
return [...lista].sort(
    (a,b) => b.total - a.total
);
```

}

/* =========================
RENDER
========================= */

function render(){

```
const lista =
    document.getElementById("lista");


lista.innerHTML = "";


const ordenados =
    modoOrden === "combate"

        ? ordenarCombate(personajes)

        : ordenarPreparacion(personajes);


ordenados.forEach(
    p => p.warning = []
);


for(
    let j = 0;
    j < ordenados.length;
    j++
){

    for(
        let i = 0;
        i < j;
        i++
    ){

        const gap =
            ordenados[i].total -
            ordenados[j].total;


        if(gap >= 150){

            ordenados[j]
                .warning
                .push(
                    ordenados[i].nombre
                );
        }
    }
}


personajes = ordenados;


personajes.forEach((p, i) => {

    const activo =
        modoCombate &&
        i === turnoActual

            ? "🔴"

            : "";


    let nombreRaw =
        p.nombre.trim();


    let color =
        "#ff9800";


    if(
        nombreRaw
            .toUpperCase()
            .startsWith("ALIADO ")
    ){

        color =
            "#2e7d32";


        nombreRaw =
            nombreRaw.replace(
                /^[Aa]liado\s+/,
                ""
            );
    }

    else if(
        protagonistas.includes(
            nombreRaw.toUpperCase()
        )
    ){

        color =
            "#ffffff";
    }


    const warningText =
        p.warning.length > 0

            ? `⚠ ${p.warning.join(", ")}`

            : "";


    const iniciativas =
        obtenerIniciativas(p);


    const indiceActivo =
        p.iniciativaSeleccionada || 0;


    /*
     * BOTONES A / B / C / D
     */

    let iniciativasHTML = "";


    if(iniciativas.length > 1){

        iniciativasHTML = `

            <div class="selector-iniciativas">

                ${iniciativas.map(
                    (valor, indice) => {

                        const letra =
                            String.fromCharCode(
                                65 + indice
                            );


                        const activoClase =
                            indice === indiceActivo
                                ? "seleccionada"
                                : "";


                        return `

                            <button
                                class="boton-iniciativa ${activoClase}"
                                onclick="
                                    cambiarIniciativa(
                                        ${i},
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

    }else{

        iniciativasHTML = `

            <div class="iniciativa-unica">

                Iniciativa:
                <strong>
                    ${iniciativas[0]}
                </strong>

            </div>

        `;
    }


    lista.innerHTML += `

        <div class="card">

            <b
                class="nombre-personaje"
                style="color:${color}"
            >

                ${activo}
                ${nombreRaw}

            </b>


            ${iniciativasHTML}


            <div class="dado-linea">

                <span>
                    🎲 Dado:
                </span>


                <input
                    type="number"
                    id="dado-${i}"
                    value="${p.dado ?? 0}"
                    oninput="
                        cambiarDado(
                            ${i},
                            this.value
                        )
                    "
                    onkeydown="
                        if(event.key==='Enter'){
                            event.preventDefault();
                            siguienteInput(this.id);
                        }
                    "
                >

            </div>


            <div class="total-linea">

                <div id="total-${i}">
                    Total:
                    ${p.total ??
                    iniciativaSeleccionada(p)}
                </div>


                ${
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
                class="delete"
                onclick="borrar(${i})"
            >
                🗑️
            </button>

        </div>

    `;
});


actualizarBotones();

actualizarRonda();

renderHistorico();
```

}

/* =========================
BOTONES
========================= */

function actualizarBotones(){

```
const btn =
    document.querySelector(
        ".combat.iniciar"
    );


btn.textContent =
    modoCombate

        ? "Finalizar combate"

        : "Iniciar combate";


if(modoCombate){

    btn.classList.add("activo");

}else{

    btn.classList.remove("activo");
}
```

}

function actualizarRonda(){

```
document.getElementById(
    "rondaActual"
).textContent =
    `⚔ Ronda ${rondaActual}`;
```

}

/* =========================
AÑADIR PERSONAJE
========================= */

function addPersonaje(){

```
const nombre =
    document
        .getElementById("nombre")
        .value
        .trim();


if(!nombre) return;


const valores = [

    parseInt(
        document.getElementById("ini1").value
    ),

    parseInt(
        document.getElementById("ini2").value
    ),

    parseInt(
        document.getElementById("ini3").value
    ),

    parseInt(
        document.getElementById("ini4").value
    )

].filter(
    valor => !isNaN(valor)
);


if(valores.length === 0){

    valores.push(0);
}


personajes.push({

    nombre,

    ini: valores[0],

    iniciativas: valores,

    iniciativaSeleccionada: 0,

    dado: 0,

    total: valores[0]

});


document.getElementById(
    "nombre"
).value = "";


document.getElementById(
    "ini1"
).value = "";


document.getElementById(
    "ini2"
).value = "";


document.getElementById(
    "ini3"
).value = "";


document.getElementById(
    "ini4"
).value = "";


save();

render();
```

}

/* =========================
BORRAR
========================= */

function borrar(i){

```
personajes.splice(
    i,
    1
);


save();

render();
```

}

/* =========================
ORDENAR
========================= */

function ordenar(){

```
personajes.forEach((p, i) => {

    const input =
        document.getElementById(
            `dado-${i}`
        );


    const dado =
        input
            ? parseInt(input.value)
            : 0;


    p.dado =
        isNaN(dado)
            ? 0
            : dado;


    p.total =
        iniciativaSeleccionada(p) +
        p.dado;

});


modoOrden =
    "combate";


render();
```

}

/* =========================
INICIAR / FINALIZAR COMBATE
========================= */

function iniciarCombate(){

```
if(personajes.length === 0){
    return;
}


/*
 * INICIAR COMBATE
 */

if(!modoCombate){

    personajes.forEach((p, i) => {

        const input =
            document.getElementById(
                `dado-${i}`
            );


        if(input){

            const dado =
                parseInt(input.value);


            p.dado =
                isNaN(dado)
                    ? 0
                    : dado;


            p.total =
                iniciativaSeleccionada(p) +
                p.dado;
        }

    });


    personajes.sort(
        (a,b) =>
            b.total - a.total
    );


    modoOrden =
        "combate";


    modoCombate =
        true;


    turnoActual =
        0;


/*
 * FINALIZAR RONDA
 */

}else{

    /*
     * GUARDAMOS LOS RESULTADOS
     * DE LA RONDA TERMINADA
     */

    const resultados =
        personajes.map(p => ({

            nombre:
                p.nombre,

            total:
                p.total

        }));


    historico.push({

        ronda:
            rondaActual,

        resultados:
            resultados

    });


    /*
     * PASAMOS A LA
     * SIGUIENTE RONDA
     */

    rondaActual++;


    /*
     * LOS DADOS VUELVEN A 0
     */

    personajes.forEach(p => {

        p.dado =
            0;


        p.total =
            iniciativaSeleccionada(p);

    });


    turnoActual =
        0;


    /*
     * EL COMBATE SIGUE ACTIVO
     */

    modoCombate =
        true;


    modoOrden =
        "combate";

}


save();

render();
```

}

/* =========================
SIGUIENTE TURNO
========================= */

function siguienteTurno(){

```
if(!modoCombate){
    return;
}


turnoActual++;


if(
    turnoActual >=
    personajes.length
){

    turnoActual =
        0;
}


render();
```

}

/* =========================
COMBATE NUEVO
========================= */

function nuevoCombate(){

```
rondaActual =
    1;


historico =
    [];


turnoActual =
    0;


modoCombate =
    false;


modoOrden =
    "preparacion";


personajes.forEach(p => {

    p.dado =
        0;


    p.iniciativaSeleccionada =
        0;


    p.total =
        iniciativaSeleccionada(p);


    p.warning =
        [];

});


save();

render();
```

}

/* =========================
HISTÓRICO
========================= */

function renderHistorico(){

```
const contenedor =
    document.getElementById(
        "historicoLista"
    );


if(historico.length === 0){

    contenedor.innerHTML = `

        <p class="sin-historico">
            Todavía no hay rondas registradas.
        </p>

    `;

    return;
}


contenedor.innerHTML =
    "";


/*
 * MOSTRAMOS LAS RONDAS
 * MÁS RECIENTES ARRIBA
 */

[...historico]
    .reverse()
    .forEach(registro => {

        const details =
            document.createElement(
                "details"
            );


        const summary =
            document.createElement(
                "summary"
            );


        summary.textContent =
            `Ronda ${registro.ronda}`;


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
            .forEach(resultado => {

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

            });


        details.appendChild(
            contenido
        );


        contenedor.appendChild(
            details
        );

    });
```

}

/* =========================
CERRAR TECLADO
========================= */

document.addEventListener(
"click",
function(e){

```
    if(
        e.target.tagName !== "INPUT"
    ){

        document.activeElement.blur();
    }

}
```

);

/* =========================
INICIO
========================= */

render();

```

## 3. `style.css`

:::writing{variant="document" id="92647" title="style.css"}
body{
    margin:0;
    font-family:Arial, sans-serif;
    background:#121212;
    color:white;
}

*{
    box-sizing:border-box;
}


.app{
    width:100%;
    max-width:500px;
    margin:auto;
    padding:15px;
    padding-bottom:125px;
}


h1{
    text-align:center;
    font-size:25px;
    margin:8px 0 18px;
}


/* =========================
   PANEL CREACIÓN
========================= */

.panel{
    display:flex;
    flex-direction:column;
    gap:8px;
    margin-bottom:14px;
}


.panel > input{
    width:100%;
    padding:11px;
    font-size:16px;
    border-radius:8px;
    border:none;
}


.iniciativas-panel{
    background:#1b1b1b;
    padding:9px;
    border-radius:8px;
}


.iniciativas-titulo{
    font-size:13px;
    color:#aaa;
    margin-bottom:7px;
}


.iniciativa-inputs{
    display:grid;
    grid-template-columns:
        repeat(4, 1fr);

    gap:5px;
}


.ini-input{
    display:flex;
    align-items:center;
    gap:3px;
    min-width:0;
}


.ini-input span{
    font-weight:bold;
    font-size:13px;
    width:13px;
    text-align:center;
}


.ini-input input{
    width:100%;
    min-width:0;
    padding:8px 3px;
    font-size:14px;
    border:none;
    border-radius:6px;
}


.panel > button{
    width:100%;
}


/* =========================
   RONDA
========================= */

.ronda-indicador{
    background:#f9a825;
    color:#121212;
    font-weight:bold;
    text-align:center;
    padding:7px;
    border-radius:7px;
    margin:12px 0;
    font-size:15px;
}


/* =========================
   CARTAS
========================= */

.card{
    background:#1f1f1f;
    padding:12px;
    margin:9px 0;
    border-radius:10px;
    position:relative;
    padding-right:55px;
}


.nombre-personaje{
    display:block;
    font-size:17px;
    margin-bottom:8px;
}


/* =========================
   BOTONES DE INICIATIVA
========================= */

.selector-iniciativas{
    display:flex;
    gap:5px;
    flex-wrap:wrap;
    margin:5px 0 9px;
}


.boton-iniciativa{
    margin:0;
    padding:7px 9px;
    background:#333;
    color:#ddd;
    border:1px solid #555;
    border-radius:6px;
    font-size:13px;
    min-width:45px;
}


.boton-iniciativa strong{
    margin-right:3px;
    color:white;
}


.boton-iniciativa.seleccionada{
    background:#f9a825;
    color:#121212;
    border-color:#f9a825;
}


.boton-iniciativa.seleccionada strong{
    color:#121212;
}


.iniciativa-unica{
    color:#999;
    font-size:13px;
    margin-bottom:7px;
}


/* =========================
   DADO
========================= */

.dado-linea{
    display:flex;
    align-items:center;
    gap:7px;
    margin-top:5px;
}


.dado-linea input{
    width:75px;
    padding:8px;
    margin:0;
    font-size:16px;
}


.total-linea{
    display:flex;
    align-items:center;
    flex-wrap:wrap;
    margin-top:8px;
    font-size:18px;
    font-weight:bold;
    gap:8px;
}


.warning{
    color:#e53935;
    font-size:13px;
    font-weight:normal;
}


.delete{
    position:absolute;
    right:9px;
    top:50%;
    transform:translateY(-50%);
    background:#e53935;
    color:white;
    padding:9px;
}


/* =========================
   BARRA FIJA
========================= */

#combatBtns{
    position:fixed;
    bottom:0;
    left:0;
    right:0;

    background:#121212;

    padding:7px;

    display:flex;
    flex-direction:column;

    gap:5px;

    border-top:2px solid #333;

    z-index:100;
}


.botones-principales{
    width:100%;
    display:flex;
    gap:5px;
}


.botones-secundarios{
    width:100%;
    display:flex;
}


.botones-principales button{
    flex:1;
}


.botones-secundarios button{
    width:100%;
}


#combatBtns button{
    margin:0;
    min-width:0;
    font-size:12px;
    padding:9px 4px;
}


/* =========================
   COLORES BOTONES
========================= */

.combat.ordenar{
    background:#f9a825;
    color:#121212;
}


.combat.iniciar{
    background:#1e88e5;
    color:white;
}


.combat.iniciar.activo{
    background:#e53935 !important;
}


.combat.siguiente{
    background:#6a1b9a;
    color:white;
}


.combat.nuevo{
    background:#424242;
    color:white;
}


/* =========================
   HISTÓRICO
========================= */

#historico{
    margin-top:110px;
    padding-top:25px;
    border-top:2px solid #333;
}


#historico h2{
    font-size:20px;
    margin-bottom:15px;
}


#historico details{
    background:#1f1f1f;
    border-radius:8px;
    margin-bottom:8px;
    overflow:hidden;
}


#historico summary{
    padding:12px;
    cursor:pointer;
    font-weight:bold;
    color:#f9a825;
    font-size:15px;
}


.historico-ronda{
    padding:5px 12px 12px;
}


.historico-personaje{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:8px 0;
    border-bottom:1px solid #333;
    gap:10px;
}


.historico-personaje:last-child{
    border-bottom:none;
}


.historico-personaje strong{
    font-size:17px;
}


.sin-historico{
    color:#888;
    font-size:14px;
}


/* =========================
   MÓVIL
========================= */

@media(max-width:380px){

    .app{
        padding-left:10px;
        padding-right:10px;
    }


    h1{
        font-size:23px;
    }


    .iniciativa-inputs{
        gap:3px;
    }


    .ini-input span{
        font-size:12px;
        width:12px;
    }


    .ini-input input{
        font-size:13px;
        padding:8px 2px;
    }


    #combatBtns button{
        font-size:11px;
        padding:8px 2px;
    }


    .boton-iniciativa{
        font-size:12px;
        padding:7px 8px;
    }

}
```

