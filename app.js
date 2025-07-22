// 🟢 Nombre del usuario
const nombreUsuario = localStorage.getItem("nombreUsuario") || "Anónimo";
document.getElementById("saludo").innerText =
  `Bienvenido de nuevo, ${nombreUsuario}. Hoy te espera una nueva semilla.`;

// 🔊 Reproducir música tras interacción
window.addEventListener("click", () => {
  const audio = document.getElementById("musica");
  if (audio && audio.paused) {
    audio.play().catch(() => console.log("Autoplay bloqueado por el navegador."));
  }
});

// 🗣️ Función para pronunciar la cita y reflexión
function hablar(texto) {
  const voz = new SpeechSynthesisUtterance(texto);
  voz.lang = "es-ES";
  voz.rate = 0.9;
  speechSynthesis.speak(voz);
}

// 🔁 Cargar cita desde JSON y evitar repeticiones
fetch("./assets/citas.json")
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
    hablar(`${citaElegida.texto}. ${citaElegida.reflexion}`);

    const nuevoCiclo = [...ciclo, data.indexOf(citaElegida)];
    localStorage.setItem("cicloCitas", JSON.stringify(nuevoCiclo));
  })
  .catch(() => {
    document.getElementById("cita").innerText = "⛔ Error al cargar cita.";
    document.getElementById("reflexion").innerText =
      "Verifica el archivo 'citas.json' y su ubicación.";
  });

// 📌 Reacciones únicas por usuario
let likesCita = 0;
let dislikesCita = 0;
const reaccionesComentarios = {};

function reaccionar(id, positivo) {
  const key = `reaccionado-${id}`;
  if (localStorage.getItem(key)) {
    alert("Ya reaccionaste a esta publicación 🌱");
    return;
  }
  localStorage.setItem(key, positivo ? "like" : "dislike");

  if (id === "cita") {
    positivo ? likesCita++ : dislikesCita++;
    document.getElementById("likes-cita").innerText =
      `${likesCita} 👍 / ${dislikesCita} 👎`;
  } else {
    reaccionesComentarios[id] = reaccionesComentarios[id] || { likes: 0, dislikes: 0 };
    positivo ? reaccionesComentarios[id].likes++ : reaccionesComentarios[id].dislikes++;
    document.getElementById("likes-" + id).innerText =
      `${reaccionesComentarios[id].likes} 👍 / ${reaccionesComentarios[id].dislikes} 👎`;
  }
}

// 💬 Publicar comentario
function publicarComentario() {
  const texto = document.getElementById("comentario").value.trim();
  if (!texto) return alert("Escribe tu comentario antes de publicar.");
  const id = "comentario" + Date.now();
  const div = document.createElement("div");
  div.className = "comentario";
  div.id = id;
  div.innerHTML = `<strong>${nombreUsuario}</strong>: ${texto}
    <div>
      <button onclick="reaccionar('${id}', true)">👍</button>
      <button onclick="reaccionar('${id}', false)">👎</button>
      <span id="likes-${id}">0 👍 / 0 👎</span>
      <button onclick="borrarComentario('${id}')">🗑️</button>
    </div>`;
  document.getElementById("comentarios").prepend(div);
  document.getElementById("comentario").value = "";
}

// 🗑️ Borrar comentario con clave
function borrarComentario(id) {
  const clave = prompt("🔐 Ingresa la clave maestra:");
  if (clave === "HinmerClave2025") {
    document.getElementById(id)?.remove();
  } else {
    alert("Clave incorrecta.");
  }
}

// ✍️ Guardar aporte personal
function guardarPropia() {
  const citaP = document.getElementById("citaPersonal").value.trim();
  const refleP = document.getElementById("reflexionPersonal").value.trim();

  if (!citaP || !refleP) return alert("Completa ambos campos.");
  if (citaP.length > 500 || refleP.length > 1000)
    return alert("Excede el límite permitido.");

  const id = "personal" + Date.now();
  const div = document.createElement("div");
  div.className = "comentario";
  div.id = id;
  div.innerHTML = `<strong>${nombreUsuario} 🌿 (aporte personal)</strong><br/>
    <em>${citaP}</em><br/>
    <p>${refleP}</p>
    <div>
      <button onclick="reaccionar('${id}', true)">👍</button>
      <button onclick="reaccionar('${id}', false)">👎</button>
      <span id="likes-${id}">0 👍 / 0 👎</span>
      <button onclick="borrarComentario('${id}')">🗑️</button>
    </div>`;
  document.getElementById("comentarios").prepend(div);
  document.getElementById("citaPersonal").value = "";
  document.getElementById("reflexionPersonal").value = "";
}
