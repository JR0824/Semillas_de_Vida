function guardarNombre() {
  const nombre = document.getElementById("nombreInput").value.trim() || "Anónimo";
  localStorage.setItem("nombreUsuario", nombre);
  document.getElementById("saludo").textContent =
    `🌿 Bienvenido, ${nombre}. Hoy te espera una nueva semilla. Dios te bendiga.`;
  cargarMensaje();
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

// 💬 Publicar comentario
function publicarComentario() {
  const texto = document.getElementById("comentario").value.trim();
  if (!texto) return alert("Escribe tu comentario primero.");
  const nombre = localStorage.getItem("nombreUsuario") || "Anónimo";
  const id = "comentario" + Date.now();
  const div = document.createElement("div");
  div.className = "comentario";
  div.id = id;
  div.innerHTML = `<strong>${nombre}</strong>: ${texto}
    <div>
      <button onclick="reaccionar('${id}', true)">👍</button>
      <button onclick="reaccionar('${id}', false)">👎</button>
      <span id="likes-${id}">0 👍 / 0 👎</span>
    </div>`;
  document.getElementById("comentarios").prepend(div);
  document.getElementById("comentario").value = "";
}

// ✍️ Guardar aporte personal
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
