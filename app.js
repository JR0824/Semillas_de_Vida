const BIN_ID = "688041de7b4b8670d8a5afca";
const API_KEY = "$2a$10$OdpoN/dA9hV6SHvsJ9c.wONOsie7tWX1GWbN839tI4zUxeeTXwA4W";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const BIN_LATEST = `${BIN_URL}/latest`;

// 🌿 Guardar nombre e iniciar experiencia
function guardarNombre() {
  const nombre = document.getElementById("nombreInput").value.trim() || "Anónimo";
  localStorage.setItem("nombreUsuario", nombre);
  document.getElementById("saludo").textContent =
    `🌿 Bienvenido, ${nombre}. Hoy te espera una nueva semilla. Dios te bendiga.`;
  cargarMensaje();
  cargarComentarios(); // Inicia el jardín comunitario vacío
}

// 🔀 Mostrar mensaje aleatorio sin repetir
function cargarMensaje() {
  fetch("./citas.json")
    .then(res => res.json())
    .then(data => {
      const ciclo = JSON.parse(localStorage.getItem("cicloCitas")) || [];
      let restantes = data.filter((_, i) => !ciclo.includes(i));

      if (restantes.length === 0) {
        localStorage.setItem("cicloCitas", "[]");
        restantes = data;
      }

      const indice = Math.floor(Math.random() * restantes.length);
      const citaElegida = restantes[indice];

      document.getElementById("cita").innerText = citaElegida.texto;
      document.getElementById("reflexion").innerText = citaElegida.reflexion;

      if (citaElegida.espiritu_activo) {
        document.body.classList.add("espiritu-presente");
      }

      const nuevoCiclo = [...ciclo, data.indexOf(citaElegida)];
      localStorage.setItem("cicloCitas", JSON.stringify(nuevoCiclo));
    });
}

// 👍👎 Reacciones locales
let likesCita = 0;
let dislikesCita = 0;
const reaccionesComentarios = {};

function reaccionar(id, positivo) {
  const key = `reaccionado-${id}`;
  if (localStorage.getItem(key)) {
    alert("Ya reaccionaste 🌱");
    return;
  }

  localStorage.setItem(key, positivo ? "like" : "dislike");

  if (id === "cita") {
    positivo ? likesCita++ : dislikesCita++;
    document.getElementById("likes-cita").textContent =
      `${likesCita} 👍 / ${dislikesCita} 👎`;
  } else {
    reaccionesComentarios[id] = reaccionesComentarios[id] || { likes: 0, dislikes: 0 };
    positivo ? reaccionesComentarios[id].likes++ : reaccionesComentarios[id].dislikes++;
    document.getElementById("likes-" + id).textContent =
      `${reaccionesComentarios[id].likes} 👍 / ${reaccionesComentarios[id].dislikes} 👎`;
  }
}

// 💬 Publicar primer comentario
async function publicarComentario() {
  const texto = document.getElementById("comentario").value.trim();
  const nombre = localStorage.getItem("nombreUsuario") || "Anónimo";
  if (!texto) return alert("Escribe tu comentario primero 🌿");

  try {
    const res = await fetch(BIN_LATEST, {
      headers: { "X-ACCESS-KEY": API_KEY }
    });
    const data = await res.json();
    const comentarios = data.record || [];

    comentarios.unshift({
      nombre,
      texto,
      fecha: new Date().toISOString()
    });

    await fetch(BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-ACCESS-KEY": API_KEY
      },
      body: JSON.stringify(comentarios)
    });

    document.getElementById("comentario").value = "";
    cargarComentarios();
  } catch (e) {
    console.error("Error al publicar:", e);
    alert("No se pudo guardar tu comentario 🥀");
  }
}

// 🌍 Mostrar comentarios desde el bin (inicialmente vacío)
async function cargarComentarios() {
  try {
    const res = await fetch(BIN_LATEST, {
      headers: { "X-ACCESS-KEY": API_KEY }
    });
    const data = await res.json();
    const comentarios = data.record || [];

    const contenedor = document.getElementById("comentarios");
    contenedor.innerHTML = "";

    comentarios.forEach(({ nombre, texto }) => {
      const id = "comentario-" + Math.random().toString(36).substring(2, 9);
      const div = document.createElement("div");
      div.className = "comentario";
      div.id = id;
      div.innerHTML = `<strong>${nombre}</strong>: ${texto}
        <div>
          <button onclick="reaccionar('${id}', true)">👍</button>
          <button onclick="reaccionar('${id}', false)">👎</button>
          <span id="likes-${id}">0 👍 / 0 👎</span>
        </div>`;
      contenedor.appendChild(div);
    });
  } catch (e) {
    console.error("Error al cargar comentarios:", e);
    alert("No se pudieron cargar los comentarios 🌧️");
  }
}

// ✍️ Guardar aporte personal (solo visible para el visitante actual)
function guardarPropia() {
  const nombre = localStorage.getItem("nombreUsuario") || "Anónimo";
  const citaP = document.getElementById("citaPersonal").value.trim();
  const refleP = document.getElementById("reflexionPersonal").value.trim();

  if (!citaP || !refleP) {
    alert("Completa ambos campos antes de guardar tu aporte 🌿");
    return;
  }

  if (citaP.length > 500 || refleP.length > 1000) {
    alert("Tu aporte excede el límite permitido.");
    return;
  }

  const id = "personal" + Date.now();
  const div = document.createElement("div");
  div.className = "comentario aporte-personal";
  div.id = id;
  div.innerHTML = `<strong>${nombre} 🌿 (aporte personal)</strong><br/>
    <em>${citaP}</em><br/>
    <p>${refleP}</p>
    <div>
      <button onclick="reaccionar('${id}', true)">👍</button>
      <button onclick="reaccionar('${id}', false)">👎</button>
      <span id="likes-${id}">0 👍 / 0 👎</span>
    </div>`;
  document.getElementById("comentarios").prepend(div);

  document.getElementById("citaPersonal").value = "";
  document.getElementById("reflexionPersonal").value = "";
}
