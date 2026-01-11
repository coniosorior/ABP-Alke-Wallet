/* =====================================
   LOGIN
===================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    message.textContent = "";
    message.style.color = "";

    if (email !== "" && password !== "") {
      if (sessionStorage.getItem("saldo") === null) {
        sessionStorage.setItem("saldo", "60000");
      }

      message.textContent = "Login correcto. Redirigiendo...";
      message.style.color = "green";

      window.location.href = "menuprincipal.html";
    } else {
      message.textContent = "Completa email y contraseña";
      message.style.color = "red";
    }
  });
}

/* =====================================
   SALDO
===================================== */

function obtenerSaldo() {
  const saldoStr = sessionStorage.getItem("saldo");
  if (saldoStr === null) return 60000;
  return Number(saldoStr);
}

function guardarSaldo(nuevoSaldo) {
  sessionStorage.setItem("saldo", String(nuevoSaldo));
}

/* =====================================
   CONTACTOS
===================================== */

function obtenerContactos() {
  const contactosStr = sessionStorage.getItem("contactos");
  if (contactosStr === null) return [];
  return JSON.parse(contactosStr);
}

function guardarContactos(contactos) {
  sessionStorage.setItem("contactos", JSON.stringify(contactos));
}

/* =====================================
   MOVIMIENTOS 
===================================== */

function obtenerMovimientos() {
  const movStr = sessionStorage.getItem("movimientos");
  if (movStr === null) return [];
  return JSON.parse(movStr);
}

function guardarMovimientos(movs) {
  sessionStorage.setItem("movimientos", JSON.stringify(movs));
}

function agregarMovimiento(movimiento) {
  const movs = obtenerMovimientos();
  movs.unshift(movimiento); // lo último queda arriba
  guardarMovimientos(movs);
}

/* =====================================
   MENÚ PRINCIPAL
===================================== */

const balanceElement = document.getElementById("balance");

if (balanceElement) {
  const saldo = obtenerSaldo();
  balanceElement.textContent = "$" + saldo.toLocaleString("es-CL");
}

const btnDepositar = document.getElementById("btnDepositar");
const btnEnviar = document.getElementById("btnEnviar");
const btnMovimientos = document.getElementById("btnMovimientos");
const menuMessage = document.getElementById("menuMessage");

if (btnDepositar && btnEnviar && btnMovimientos && menuMessage) {
  btnDepositar.addEventListener("click", function () {
    menuMessage.textContent = "Redirigiendo a Depositar...";
    menuMessage.style.color = "green";
    window.location.href = "depositar.html";
  });

  btnEnviar.addEventListener("click", function () {
    menuMessage.textContent = "Redirigiendo a Enviar Dinero...";
    menuMessage.style.color = "green";
    window.location.href = "enviardinero.html";
  });

  btnMovimientos.addEventListener("click", function () {
    menuMessage.textContent = "Redirigiendo a Últimos Movimientos...";
    menuMessage.style.color = "green";
    window.location.href = "transacciones.html";
  });
}

/* =====================================
   DEPOSITAR
===================================== */

const formDeposito = document.getElementById("depositForm");
const inputMonto = document.getElementById("depositAmount");

if (formDeposito && inputMonto) {
  formDeposito.addEventListener("submit", function (event) {
    event.preventDefault();

    const monto = Number(inputMonto.value);

    if (isNaN(monto) || monto <= 0) {
      alert("Ingresa un monto válido");
      return;
    }

    const saldoActual = obtenerSaldo();
    const nuevoSaldo = saldoActual + monto;

    guardarSaldo(nuevoSaldo);

    // ✅ Guardar movimiento
    agregarMovimiento({
      tipo: "Depósito",
      detalle: `Depósito de $${monto.toLocaleString("es-CL")}`,
      fecha: new Date().toLocaleString("es-CL")
    });

    window.location.href = "menuprincipal.html";
  });
}

/* =====================================
   ENVIAR DINERO
===================================== */

const contactList = document.getElementById("contactList");
const searchContact = document.getElementById("searchContact");
const btnNuevoContacto = document.getElementById("btnNuevoContacto");
const newContactForm = document.getElementById("newContactForm");
const sendMoneyForm = document.getElementById("sendMoneyForm");
const sendAmount = document.getElementById("sendAmount");
const sendMessage = document.getElementById("sendMessage");

let contactoSeleccionadoIndex = null;

function renderContactos(filtroTexto = "") {
  if (!contactList) return;

  const contactos = obtenerContactos();
  contactList.innerHTML = "";

  const filtro = filtroTexto.trim().toLowerCase();

  contactos.forEach((c, index) => {
    const textoCompleto = `${c.nombre} ${c.cbu} ${c.alias} ${c.banco}`.toLowerCase();
    if (filtro && !textoCompleto.includes(filtro)) return;

    const li = document.createElement("li");
    li.className = "list-group-item";
    li.style.cursor = "pointer";

    if (contactoSeleccionadoIndex === index) {
      li.style.border = "2px solid green";
    } else {
      li.style.border = "";
    }

    li.innerHTML = `
      <strong>${c.nombre}</strong><br>
      CBU: ${c.cbu} | Alias: ${c.alias} | Banco: ${c.banco}
    `;

    li.addEventListener("click", () => {
      contactoSeleccionadoIndex = index;
      renderContactos(searchContact ? searchContact.value : "");
    });

    contactList.appendChild(li);
  });

  if (contactList.children.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = "No hay contactos aún. Agrega uno.";
    contactList.appendChild(li);
  }
}


if (contactList) {
  renderContactos("");
}


if (searchContact) {
  searchContact.addEventListener("input", () => {
    renderContactos(searchContact.value);
  });
}

if (btnNuevoContacto && newContactForm) {
  btnNuevoContacto.addEventListener("click", () => {
    newContactForm.style.display = "block";
  });
}


if (newContactForm) {
  newContactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("contactName").value.trim();
    const cbu = document.getElementById("contactCBU").value.trim();
    const alias = document.getElementById("contactAlias").value.trim();
    const banco = document.getElementById("contactBank").value.trim();

    if (!nombre || !cbu || !alias || !banco) {
      alert("Completa todos los campos");
      return;
    }

    const contactos = obtenerContactos();
    contactos.push({ nombre, cbu, alias, banco });
    guardarContactos(contactos);

    newContactForm.reset();
    newContactForm.style.display = "none";

    contactoSeleccionadoIndex = contactos.length - 1;

    renderContactos(searchContact ? searchContact.value : "");
  });
}


if (sendMoneyForm && sendAmount) {
  sendMoneyForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const monto = Number(sendAmount.value);

    if (contactoSeleccionadoIndex === null) {
      alert("Selecciona un contacto");
      return;
    }

    if (isNaN(monto) || monto <= 0) {
      alert("Ingresa un monto válido");
      return;
    }

    const saldoActual = obtenerSaldo();
    if (monto > saldoActual) {
      alert("Saldo insuficiente");
      return;
    }

    const contactos = obtenerContactos();
    const contacto = contactos[contactoSeleccionadoIndex];

    guardarSaldo(saldoActual - monto);

  
    agregarMovimiento({
      tipo: "Envío de dinero",
      detalle: `Envío a ${contacto.nombre} (${contacto.alias}) - $${monto.toLocaleString("es-CL")}`,
      fecha: new Date().toLocaleString("es-CL")
    });

    if (sendMessage) {
      sendMessage.textContent =
        `✅ Transferencia realizada: $${monto.toLocaleString("es-CL")} a ${contacto.nombre} (${contacto.alias}).`;
      sendMessage.style.color = "green";
    }

    sendAmount.value = "";

    setTimeout(() => {
      window.location.href = "menuprincipal.html";
    }, 800);
  });
}

/* =====================================
   TRANSACCIONES / ÚLTIMOS MOVIMIENTOS
===================================== */

const movementsList = document.getElementById("movementsList");

if (movementsList) {
  const movs = obtenerMovimientos();
  movementsList.innerHTML = "";

  if (movs.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = "No hay movimientos todavía.";
    movementsList.appendChild(li);
  } else {
    movs.forEach((m) => {
      const li = document.createElement("li");
      li.className = "list-group-item";

      li.innerHTML = `
        <strong>${m.tipo}</strong><br>
        ${m.detalle}<br>
        <small>${m.fecha}</small>
      `;

      movementsList.appendChild(li);
    });
  }
}
