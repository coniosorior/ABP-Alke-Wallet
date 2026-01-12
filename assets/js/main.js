
/* =========================
   INDEX (Bienvenida)
========================= */

#welcomeCard,
#autoText {
  display: none;
}


.aw-pulse {
  animation: awPulse 1.1s infinite;
}

@keyframes awPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1); }
}







$(document).ready(function () {

  // ✅ 1) Elegimos sessionStorage para toda la app
  const STORAGE = sessionStorage;

  // ✅ 2) Helpers (funciones pequeñas) para ordenar el código
  function mostrarAlerta(tipo, mensaje) {
    if (!$("#alert-container").length) return;

    $("#alert-container").html(`
      <div class="alert alert-${tipo} mt-3" role="alert">
        ${mensaje}
      </div>
    `);
  }

  function initDataSiNoExiste() {
    if (STORAGE.getItem("aw_balance") === null) STORAGE.setItem("aw_balance", "60000");
    if (STORAGE.getItem("aw_contacts") === null) STORAGE.setItem("aw_contacts", "[]");
    if (STORAGE.getItem("aw_transactions") === null) STORAGE.setItem("aw_transactions", "[]");
  }

  function isLoggedIn() {
    return STORAGE.getItem("aw_user") !== null;
  }

  function protegerPantallas() {
    // Si NO estás en login y no hay sesión, vuelve a login
    const estasEnLogin = $("#loginForm").length > 0;
    if (!estasEnLogin && !isLoggedIn()) {
      window.location.href = "login.html";
    }
  }

  // ✅ Protege pantallas desde el inicio
  protegerPantallas();

  /* =====================================
     LOGIN
  ===================================== */

  if ($("#loginForm").length) {

    $("#loginForm").submit(function (event) {
      event.preventDefault();

      const email = $("#email").val().trim();
      const password = $("#password").val().trim();

      if (email === "" || password === "") {
        mostrarAlerta("danger", "Completa correo y contraseña.");
        return;
      }

      // ✅ Guardamos sesión en sessionStorage
      STORAGE.setItem("aw_user", email);

      // ✅ Inicializamos datos para esta sesión
      initDataSiNoExiste();

      mostrarAlerta("success", "Login correcto. Redirigiendo...");

      setTimeout(function () {
        window.location.href = "menu.html";
      }, 1000);
    });

  }

  /* =====================================
     LOGOUT (opcional: si agregas botón)
  ===================================== */

  if ($("#logoutBtn").length) {
    $("#logoutBtn").click(function () {
      STORAGE.clear(); // borra todo lo de esta sesión
      window.location.href = "login.html";
    });
  }

  /* =====================================
     MENU
  ===================================== */

  if ($("#balance").length) {

    initDataSiNoExiste();

    const saldo = Number(STORAGE.getItem("aw_balance")) || 0;
    $("#balance").text(saldo.toLocaleString("es-CL"));

    $("#btnDepositar").click(function () {
      $("#menuMessage").text("Redirigiendo a depósito...").css("color", "green");
      setTimeout(function () {
        window.location.href = "deposit.html";
      }, 600);
    });

    $("#btnEnviar").click(function () {
      $("#menuMessage").text("Redirigiendo a enviar dinero...").css("color", "green");
      setTimeout(function () {
        window.location.href = "sendmoney.html";
      }, 600);
    });

    $("#btnMovimientos").click(function () {
      $("#menuMessage").text("Redirigiendo a últimos movimientos...").css("color", "green");
      setTimeout(function () {
        window.location.href = "transactions.html";
      }, 600);
    });
  }

  /* =====================================
     DEPOSIT
  ===================================== */

  if ($("#depositForm").length) {

    initDataSiNoExiste();

    const saldoActual = Number(STORAGE.getItem("aw_balance")) || 0;
    $("#currentBalance").text("$" + saldoActual.toLocaleString("es-CL"));

    $("#depositForm").submit(function (event) {
      event.preventDefault();

      const monto = Number($("#depositAmount").val());

      if (isNaN(monto) || monto <= 0) {
        mostrarAlerta("danger", "Monto inválido. Ingresa un número mayor a 0.");
        return;
      }

      const saldo = Number(STORAGE.getItem("aw_balance")) || 0;
      const nuevoSaldo = saldo + monto;

      STORAGE.setItem("aw_balance", String(nuevoSaldo));

      if ($("#depositLegend").length) {
        $("#depositLegend")
          .text(`Depositaste $${monto.toLocaleString("es-CL")}.`)
          .css("color", "green");
      }

      const transacciones = JSON.parse(STORAGE.getItem("aw_transactions") || "[]");
      transacciones.unshift({
        type: "deposit",
        amount: monto,
        detail: `Depósito de $${monto.toLocaleString("es-CL")}`,
        date: new Date().toLocaleString("es-CL")
      });
      STORAGE.setItem("aw_transactions", JSON.stringify(transacciones));

      mostrarAlerta("success", "Depósito realizado con éxito. Redirigiendo al menú...");

      $("#depositAmount").val("");

      setTimeout(function () {
        window.location.href = "menu.html";
      }, 2000);
    });
  }

  /* =====================================
     SENDMONEY
  ===================================== */

  if ($("#contactList").length) {

    initDataSiNoExiste();

    function obtenerContactos() {
      return JSON.parse(STORAGE.getItem("aw_contacts") || "[]");
    }

    function guardarContactos(contactos) {
      STORAGE.setItem("aw_contacts", JSON.stringify(contactos));
    }

    let contactoSeleccionado = null;

    function renderContactos(filtro = "") {
      const contactos = obtenerContactos();
      const texto = filtro.trim().toLowerCase();

      $("#contactList").empty();

      const filtrados = contactos.filter(c => {
        const combinado = `${c.nombre} ${c.alias}`.toLowerCase();
        return texto === "" || combinado.includes(texto);
      });

      if (filtrados.length === 0) {
        $("#contactList").append(`<li class="list-group-item">No hay contactos. Agrega uno.</li>`);
        contactoSeleccionado = null;
        $("#sendBtn").hide();
        return;
      }

      filtrados.forEach((c) => {
        const isSelected = contactoSeleccionado && contactoSeleccionado.id === c.id;

        const li = $(`
          <li class="list-group-item contact-item ${isSelected ? "contact-selected" : ""}">
            <strong>${c.nombre}</strong><br>
            <small>CBU: ${c.cbu} | Alias: ${c.alias} | Banco: ${c.banco}</small>
          </li>
        `);

        li.click(function () {
          contactoSeleccionado = c;
          renderContactos($("#searchContact").val());
          $("#sendBtn").show();
        });

        $("#contactList").append(li);
      });

      const sigueEnLista = filtrados.some(c => contactoSeleccionado && c.id === contactoSeleccionado.id);
      if (!sigueEnLista) {
        contactoSeleccionado = null;
        $("#sendBtn").hide();
      }
    }

    renderContactos("");

    $("#searchForm").submit(function (e) {
      e.preventDefault();
      renderContactos($("#searchContact").val());
    });

    $("#btnNuevoContacto").click(function () {
      $("#newContactForm").show();
    });

    $("#btnCancelarContacto").click(function () {
      $("#newContactForm").hide();
      $("#newContactForm")[0].reset();
    });

    $("#newContactForm").submit(function (e) {
      e.preventDefault();

      const nombre = $("#contactName").val().trim();
      const cbu = $("#contactCBU").val().trim();
      const alias = $("#contactAlias").val().trim();
      const banco = $("#contactBank").val().trim();

      if (!nombre || !cbu || !alias || !banco) {
        mostrarAlerta("danger", "Completa todos los campos del contacto.");
        return;
      }

      const soloNumeros = /^\d+$/;
      if (!soloNumeros.test(cbu) || cbu.length < 6) {
        mostrarAlerta("danger", "CBU inválido. Debe tener solo números y al menos 6 dígitos.");
        return;
      }

      const contactos = obtenerContactos();
      contactos.push({
        id: Date.now(),
        nombre,
        cbu,
        alias,
        banco
      });

      guardarContactos(contactos);

      mostrarAlerta("success", "Contacto agregado ✅");

      $("#newContactForm")[0].reset();
      $("#newContactForm").hide();

      renderContactos($("#searchContact").val());
    });

    $("#sendMoneyForm").submit(function (e) {
      e.preventDefault();

      if (!contactoSeleccionado) {
        mostrarAlerta("danger", "Selecciona un contacto para poder enviar dinero.");
        return;
      }

      const monto = Number($("#sendAmount").val());
      if (isNaN(monto) || monto <= 0) {
        mostrarAlerta("danger", "Ingresa un monto válido (mayor a 0).");
        return;
      }

      const saldo = Number(STORAGE.getItem("aw_balance")) || 0;
      if (monto > saldo) {
        mostrarAlerta("danger", "Saldo insuficiente.");
        return;
      }

      const nuevoSaldo = saldo - monto;
      STORAGE.setItem("aw_balance", String(nuevoSaldo));

      const transacciones = JSON.parse(STORAGE.getItem("aw_transactions") || "[]");
      transacciones.unshift({
        type: "send",
        amount: monto,
        detail: `Envío a ${contactoSeleccionado.nombre} (${contactoSeleccionado.alias})`,
        date: new Date().toLocaleString("es-CL")
      });
      STORAGE.setItem("aw_transactions", JSON.stringify(transacciones));

      $("#sendMessage")
        .text(`✅ Envío realizado: $${monto.toLocaleString("es-CL")} a ${contactoSeleccionado.nombre}`)
        .css("color", "green");

      mostrarAlerta("success", "Transferencia realizada con éxito. Redirigiendo al menú...");

      $("#sendAmount").val("");

      setTimeout(function () {
        window.location.href = "menu.html";
      }, 2000);
    });
  }

  /* =====================================
     TRANSACTIONS
  ===================================== */

  if ($("#transactionsList").length) {

    initDataSiNoExiste();

    function getTipoTransaccion(tipo) {
      if (tipo === "deposit") return "Depósito";
      if (tipo === "send") return "Envío de dinero";
      if (tipo === "withdraw") return "Retiro";
      if (tipo === "receive") return "Recibido";
      return "Movimiento";
    }

    function getBadgeClass(tipo) {
      if (tipo === "deposit") return "badge-success";
      if (tipo === "send") return "badge-primary";
      if (tipo === "withdraw") return "badge-danger";
      if (tipo === "receive") return "badge-info";
      return "badge-secondary";
    }

    function obtenerTransacciones() {
      return JSON.parse(STORAGE.getItem("aw_transactions") || "[]");
    }

    function mostrarUltimosMovimientos(filtro) {
      const transacciones = obtenerTransacciones();

      $("#transactionsList").empty();

      const filtradas = transacciones.filter(t => {
        if (filtro === "all") return true;
        return t.type === filtro;
      });

      if (filtradas.length === 0) {
        $("#transactionsList").append(`
          <li class="list-group-item">No hay movimientos para este filtro.</li>
        `);
        return;
      }

      filtradas.forEach(t => {
        const tipoTexto = getTipoTransaccion(t.type);
        const badgeClass = getBadgeClass(t.type);

        $("#transactionsList").append(`
          <li class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <strong>${tipoTexto}</strong>
              <span class="badge ${badgeClass}">${tipoTexto}</span>
            </div>

            <div class="mt-1">${t.detail || ""}</div>

            <div class="text-muted mt-1 transaction-date">
              ${t.date || ""}
            </div>

            <div class="mt-2">
              <strong>Monto:</strong> $${Number(t.amount || 0).toLocaleString("es-CL")}
            </div>
          </li>
        `);
      });
    }

    mostrarUltimosMovimientos("all");

    $("#filterType").change(function () {
      mostrarUltimosMovimientos($(this).val());
    });
  }

});
