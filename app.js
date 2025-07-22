// 🟢 Obtener nombre del usuario
const nombreUsuario = localStorage.getItem("nombreUsuario") || "Anónimo";
document.getElementById("saludo").innerText =
  `🌿 Bienvenido de nuevo, ${nombreUsuario}. Hoy te espera una nueva semilla.`;

// 🔊 Activar música tras interacción
window.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("pointerdown", () => {
    const audio = document.getElementById("musica");
    if (audio && audio.paused) {
      audio.play().catch(() => console.log("Autoplay bloqueado."));
    }
  });
});

// 🗣️ Voz espiritual para mensaje
function hablar(texto) {
  const voz = new SpeechSynthesisUtterance(texto);
  voz.lang = "es-ES";
  voz.rate = 0.9;
  speechSynthesis.speak(voz);
}

// 📅 Mostrar cita del día desde archivo
fetch("./citas.json")
  .then(res => res.json())
  .then(data => {
    const hoy = new Date().toISOString().split("T")[0];
    const citaHoy = data.find(cita => cita.fecha === hoy);

    if (citaHoy) {
      document.getElementById("cita").innerText = citaHoy.texto;
      document.getElementById("reflexion").innerText = citaHoy.reflexion;

      if (citaHoy.espiritu_activo) {
        document.body.classList.add("espiritu-presente");
        hablar(`Hoy el espíritu está presente. ${citaHoy.texto}. ${citaHoy.reflexion}`);
      } else {
        hablar(`${citaHoy.texto}. ${citaHoy.reflexion}`);
      }
    } else {
      document.getElementById("cita").innerText = "🌱 No hay semilla para hoy.";
      document.getElementById("reflexion").innerText = "Puedes sembrar una tú mismo abajo.";
    }
  })
  .catch(() => {
    document.getElementById("cita").innerText = "⛔ Error al cargar cita.";
    document.getElementById("reflexion").innerText = "Verifica el archivo 'citas.json' en la raíz.";
  });

// 👍👎 Reacciones únicas por usuario
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
  const claveMaestra = localStorage.getItem("claveJR") || "HinmerClave2025";
  const clave = prompt("🔐 Ingresa la clave maestra:");
  if (clave === claveMaestra) {
    document.getElementById(id)?.remove();
  } else {
    alert("Clave incorrecta.");
  }
}

// ✍️ Guardar aporte personal como semilla
function guardarPropia() {
  const citaP = document.getElementById("citaPersonal").value.trim();
  const refleP = document.getElementById("reflexionPersonal").value.trim();

  if (!citaP || !refleP) return alert("Completa ambos campos.");
  if (citaP.length > 500 || refleP.length > 1000)
    return alert("Excede el límite permitido.");

  const id = "personal" + Date.now();
  const div = document.createElement("div");
  div.className = "comentario aporte-personal";
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
