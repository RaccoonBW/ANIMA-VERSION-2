let personajes = JSON.parse(localStorage.getItem("personajes")) || [];

let modoCombate = false;
let turnoActual = 0;

let modoOrden = "preparacion";

let rondaActual = parseInt(localStorage.getItem("rondaActual")) || 1;

let historico = JSON.parse(localStorage.getItem("historicoCombate")) || [];

const protagonistas = ["PLATA", "MARAVI", "TAKESHI", "MARTINA", "IMME"];


/* =========================
   GUARDAR
========================= */

function save(){
    localStorage.setItem("personajes", JSON.stringify(personajes));
    localStorage.setItem("rondaActual", rondaActual);
    localStorage.setItem("historicoCombate", JSON.stringify(historico));
}


/* =========================
   INPUTS
========================= */

function siguienteInput(actualId){

    const inputs = Array.from(
        document.querySelectorAll("input[type='number']")
    );

    const index = inputs.findIndex(i => i.id === actualId);

    const current = inputs[index];
    const next = inputs[index + 1];

    if(current){
        current.value = parseInt(current.value) || 0;
    }

    if(next){
        next.value = 0;
        next.focus();
        next.select();
    }else{
        document.activeElement.blur();
    }
}


/* =========================
   INICIATIVAS
========================= */

function obtenerIniciativas(p){

    if(Array.isArray(p.iniciativas) && p.iniciativas.length > 0){
        return p.iniciativas;
    }

    return [p.ini ?? 0];
}


function iniciativaSeleccionada(p){

    const iniciativas = obtenerIniciativas(p);

    let indice = parseInt(p.iniciativaSeleccionada);

    if(isNaN(indice) || indice < 0 || indice >= iniciativas.length){
        indice = 0;
    }

    return iniciativas[indice];
}


/* =========================
   ORDEN PREPARACIÓN
========================= */

function ordenarPreparacion(lista){

    return [...lista].sort((a,b) => {

        const A = a.nombre.trim().toUpperCase();
        const B = b.nombre.trim().toUpperCase();

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
            return A.localeCompare(B, "es");
        }

        return rA - rB;
    });
}


/* =========================
   ORDEN COMBATE
========================= */

function ordenarCombate(lista){
    return [...lista].sort((a,b) => b.total - a.total);
}


/* =========================
   CAMBIAR INICIATIVA
========================= */

function cambiarIniciativa(indicePersonaje, indiceIniciativa){

    const p = personajes[indicePersonaje];

    p.iniciativaSeleccionada = parseInt(indiceIniciativa) || 0;

    const dadoInput = document.getElementById(`dado-${indicePersonaje}`);

    const dado = dadoInput
        ? parseInt(dadoInput.value) || 0
        : (p.dado || 0);

    p.dado = dado;
    p.total = iniciativaSeleccionada(p) + dado;

    save();

    render();
}


/* =========================
   CAMBIAR DADO
========================= */

function cambiarDado(indicePersonaje, valor){

    const p = personajes[indicePersonaje];

    const dado = parseInt(valor) || 0;

    p.dado = dado;
    p.total = iniciativaSeleccionada(p) + dado;

    save();

    actualizarTotalesVisuales();
}


function actualizarTotalesVisuales(){

    personajes.forEach((p, i) => {

        const totalElement = document.getElementById(`total-${i}`);

        if(totalElement){
            totalElement.textContent = `Total: ${p.total}`;
        }
    });
}


/* =========================
   RENDER
========================= */

function render(){

    const lista = document.getElementById("lista");

    lista.innerHTML = "";

    const ordenados = modoOrden === "combate"
        ? ordenarCombate(personajes)
        : ordenarPreparacion(personajes);

    ordenados.forEach(p => p.warning = []);

    for(let j = 0; j < ordenados.length; j++){

        for(let i = 0; i < j; i++){

            const gap = ordenados[i].total - ordenados[j].total;

            if(gap >= 150){
                ordenados[j].warning.push(ordenados[i].nombre);
            }
        }
    }

    personajes = ordenados;

    personajes.forEach((p, i) => {

        const activo =
            modoCombate && i === turnoActual
                ? "🔴"
                : "";

        let nombreRaw = p.nombre.trim();

        let color = "#ff9800";

        if(nombreRaw.toUpperCase().startsWith("ALIADO ")){

            color = "#2e7d32";

            nombreRaw = nombreRaw.replace(
                /^[Aa]liado\s+/,
                ""
            );
        }

        else if(
            protagonistas.includes(
                nombreRaw.toUpperCase()
            )
        ){

            color = "#ffffff";
        }


        const warningText = p.warning.length > 0
            ? `⚠ ${p.warning.join(", ")}`
            : "";


        const iniciativas = obtenerIniciativas(p);


        let selectorHTML = "";

        if(iniciativas.length > 1){

            selectorHTML = `
                <select
                    class="selector-iniciativa"
                    onchange="cambiarIniciativa(${i}, this.value)"
                >
                    ${iniciativas.map((valor, indice) => `
                        <option
                            value="${indice}"
                            ${indice === (p.iniciativaSeleccionada || 0) ? "selected" : ""}
                        >
                            Iniciativa ${indice + 1}: ${valor}
                        </option>
                    `).join("")}
                </select>
            `;

        }else{

            selectorHTML = `
                <span class="iniciativa-unica">
                    Iniciativa: ${iniciativas[0]}
                </span>
            `;
        }


        lista.innerHTML += `

        <div class="card">

            <b style="color:${color}">
                ${activo} ${nombreRaw}
            </b>

            <br>

            <div class="iniciativa-seleccion">

                ${selectorHTML}

            </div>


            <div class="dado-linea">

                🎲 Dado:

                <input
                    type="number"
                    id="dado-${i}"
                    value="${p.dado ?? 0}"
                    oninput="cambiarDado(${i}, this.value)"
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
                    Total: ${p.total ?? iniciativaSeleccionada(p)}
                </div>

                ${p.warning.length > 0 ? `
                    <div class="warning">
                        ${warningText}
                    </div>
                ` : ""}

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
}


/* =========================
   BOTONES
========================= */

function actualizarBotones(){

    const btn = document.querySelector(".combat.iniciar");

    btn.textContent = modoCombate
        ? "Finalizar combate"
        : "Iniciar combate";

    if(modoCombate){

        btn.classList.add("activo");

    }else{

        btn.classList.remove("activo");
    }
}


function actualizarRonda(){

    document.getElementById("rondaActual").textContent =
        `⚔ Ronda ${rondaActual}`;
}


/* =========================
   AÑADIR PERSONAJE
========================= */

function addPersonaje(){

    const nombre =
        document.getElementById("nombre").value.trim();

    if(!nombre) return;


    const valores = [

        parseInt(document.getElementById("ini1").value),

        parseInt(document.getElementById("ini2").value),

        parseInt(document.getElementById("ini3").value),

        parseInt(document.getElementById("ini4").value)

    ].filter(valor => !isNaN(valor));


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


    document.getElementById("nombre").value = "";

    document.getElementById("ini1").value = "";
    document.getElementById("ini2").value = "";
    document.getElementById("ini3").value = "";
    document.getElementById("ini4").value = "";


    save();

    render();
}


/* =========================
   BORRAR
========================= */

function borrar(i){

    personajes.splice(i,1);

    save();

    render();
}


/* =========================
   ORDENAR
========================= */

function ordenar(){

    personajes.forEach((p, i) => {

        const input =
            document.getElementById(`dado-${i}`);

        const dado =
            input
                ? parseInt(input.value)
                : 0;

        p.dado = isNaN(dado) ? 0 : dado;

        p.total =
            iniciativaSeleccionada(p) + p.dado;
    });


    modoOrden = "combate";

    render();
}


/* =========================
   INICIAR / FINALIZAR COMBATE
========================= */

function iniciarCombate(){

    if(personajes.length === 0) return;


    if(!modoCombate){

        personajes.forEach((p, i) => {

            const input =
                document.getElementById(`dado-${i}`);

            if(input){

                const dado =
                    parseInt(input.value);

                p.dado =
                    isNaN(dado) ? 0 : dado;

                p.total =
                    iniciativaSeleccionada(p) + p.dado;
            }
        });


        personajes.sort(
            (a,b) => b.total - a.total
        );


        modoOrden = "combate";

        modoCombate = true;

        turnoActual = 0;

    }else{

        modoCombate = false;

        modoOrden = "preparacion";
    }


    save();

    render();
}


/* =========================
   SIGUIENTE TURNO
========================= */

function siguienteTurno(){

    if(!modoCombate) return;


    turnoActual++;


    if(turnoActual >= personajes.length){

        turnoActual = 0;

    }


    render();
}


/* =========================
   TERMINAR RONDA
========================= */

function terminarRonda(){

    if(!modoCombate) return;

    if(personajes.length === 0) return;


    /*
       Guardamos los resultados de la ronda
       ANTES de poner los dados a cero.
    */

    const resultados = personajes.map(p => ({

        nombre: p.nombre,

        total: p.total

    }));


    historico.push({

        ronda: rondaActual,

        resultados: resultados

    });


    /*
       Pasamos directamente a la siguiente ronda.
    */

    rondaActual++;


    personajes.forEach(p => {

        p.dado = 0;

        p.total = iniciativaSeleccionada(p);

    });


    turnoActual = 0;

    modoCombate = true;

    modoOrden = "combate";


    save();

    render();
}


/* =========================
   COMBATE NUEVO
========================= */

function nuevoCombate(){

    rondaActual = 1;

    historico = [];

    turnoActual = 0;

    modoCombate = false;

    modoOrden = "preparacion";


    personajes.forEach(p => {

        p.dado = 0;

        p.iniciativaSeleccionada = 0;

        p.total = iniciativaSeleccionada(p);

        p.warning = [];

    });


    save();

    render();
}


/* =========================
   HISTÓRICO
========================= */

function renderHistorico(){

    const contenedor =
        document.getElementById("historicoLista");


    if(historico.length === 0){

        contenedor.innerHTML = `
            <p class="sin-historico">
                Todavía no hay rondas registradas.
            </p>
        `;

        return;
    }


    contenedor.innerHTML = "";


    /*
       Las rondas aparecen de la más reciente
       a la más antigua.
    */

    [...historico]
        .reverse()
        .forEach(registro => {

            const details =
                document.createElement("details");


            const summary =
                document.createElement("summary");


            summary.textContent =
                `Ronda ${registro.ronda}`;


            details.appendChild(summary);


            const contenido =
                document.createElement("div");

            contenido.className =
                "historico-ronda";


            registro.resultados.forEach(resultado => {

                const fila =
                    document.createElement("div");

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


                contenido.appendChild(fila);
            });


            details.appendChild(contenido);


            contenedor.appendChild(details);

        });
}


/* =========================
   CERRAR TECLADO
========================= */

document.addEventListener("click", function(e){

    if(e.target.tagName !== "INPUT"){

        document.activeElement.blur();
    }
});


/* =========================
   INICIO
========================= */

render();
