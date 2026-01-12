/* =====================================
   Login
===================================== */

$(document).ready(function () {

  function mostrarAlerta(tipo, mensaje) {

    $("#alert-container").html(`
      <div class="alert alert-${tipo} mt-3" role="alert">
        ${mensaje}
      </div>
    `);
  }

  if ($("#loginForm").length) {

    $("#loginForm").submit(function (event) {
      event.preventDefault();

      const email = $("#email").val().trim();
      const password = $("#password").val().trim();

      if (email === "" || password === "") {
        mostrarAlerta("danger", "Completa correo y contraseña.");
        return;
      }

      localStorage.setItem("aw_user", email);

      if (localStorage.getItem("aw_balance") === null) {
        localStorage.setItem("aw_balance", "60000");
      }

      if (localStorage.getItem("aw_contacts") === null) {
        localStorage.setItem("aw_contacts", "[]");
      }
      if (localStorage.getItem("aw_transactions") === null) {
        localStorage.setItem("aw_transactions", "[]");
      }

      mostrarAlerta("success", "Login correcto. Redirigiendo...");

      setTimeout(function () {
        window.location.href = "menu.html";
      }, 1000);
    });

  }

});

/* =====================================
   Menu
===================================== */

if ($("#balance").length) {

  const saldo = Number(localStorage.getItem("aw_balance")) || 0;
  $("#balance").text("$" + saldo.toLocaleString("es-CL"));

  $("#btnDepositar").click(function () {
    $("#menuMessage").text("Redirigiendo a depósito...");
    $("#menuMessage").css("color", "green");

    setTimeout(function () {
      window.location.href = "deposit.html";
    }, 600);
  });

  $("#btnEnviar").click(function () {
    $("#menuMessage").text("Redirigiendo a enviar dinero...");
    $("#menuMessage").css("color", "green");

    setTimeout(function () {
      window.location.href = "sendmoney.html";
    }, 600);
  });

  $("#btnMovimientos").click(function () {
    $("#menuMessage").text("Redirigiendo a últimos movimientos...");
    $("#menuMessage").css("color", "green");

    setTimeout(function () {
      window.location.href = "transactions.html";
    }, 600);
  });
}

/* =====================================
   Deposite
===================================== */

if ($("#depositForm").length) {

  function mostrarAlerta(tipo, mensaje) {
    $("#alert-container").html(`
      <div class="alert alert-${tipo} mt-3" role="alert">
        ${mensaje}
      </div>
    `);
  }

  const saldoActual = Number(localStorage.getItem("aw_balance")) || 0;
  $("#currentBalance").text("$" + saldoActual.toLocaleString("es-CL"));

  $("#depositForm").submit(function (event) {
    event.preventDefault();

    const monto = Number($("#depositAmount").val());

    if (isNaN(monto) || monto <= 0) {
      mostrarAlerta("danger", "Monto inválido. Ingresa un número mayor a 0.");
      return;
    }

    const saldo = Number(localStorage.getItem("aw_balance")) || 0;
    const nuevoSaldo = saldo + monto;

    localStorage.setItem("aw_balance", String(nuevoSaldo));

    $("#depositLegend").text(`Depositaste $${monto.toLocaleString("es-CL")}.`);
    $("#depositLegend").css("color", "green");

    mostrarAlerta("success", "Depósito realizado con éxito. Redirigiendo al menú...");

    $("#depositAmount").val("");

    const transacciones = JSON.parse(localStorage.getItem("aw_transactions") || "[]");
    transacciones.unshift({
      type: "deposit",
      amount: monto,
      detail: `Depósito de $${monto.toLocaleString("es-CL")}`,
      date: new Date().toLocaleString("es-CL")
    });
    localStorage.setItem("aw_transactions", JSON.stringify(transacciones));

    setTimeout(function () {
      window.location.href = "menu.html";
    }, 2000);
  });
}

/* =====================================
  Sendmoney
===================================== */

if ($("#contactList").length) {

  function mostrarAlerta(tipo, mensaje) {
    $("#alert-container").html(`
      <div class="alert alert-${tipo} mt-3" role="alert">
        ${mensaje}
      </div>
    `);
  }

  function obtenerContactos() {
    return JSON.parse(localStorage.getItem("aw_contacts") || "[]");
  }

  function guardarContactos(contactos) {
    localStorage.setItem("aw_contacts", JSON.stringify(contactos));
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
      $("#contactList").append(`
        <li class="list-group-item">No hay contactos. Agrega uno.</li>
      `);
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

    const nuevo = {
      id: Date.now(),
      nombre,
      cbu,
      alias,
      banco
    };

    contactos.push(nuevo);
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

    const saldo = Number(localStorage.getItem("aw_balance")) || 0;
    if (monto > saldo) {
      mostrarAlerta("danger", "Saldo insuficiente.");
      return;
    }

    const nuevoSaldo = saldo - monto;
    localStorage.setItem("aw_balance", String(nuevoSaldo));

    const transacciones = JSON.parse(localStorage.getItem("aw_transactions") || "[]");
    transacciones.unshift({
      type: "send",
      amount: monto,
      detail: `Envío a ${contactoSeleccionado.nombre} (${contactoSeleccionado.alias})`,
      date: new Date().toLocaleString("es-CL")
    });
    localStorage.setItem("aw_transactions", JSON.stringify(transacciones));

    $("#sendMessage").text(
      `✅ Envío realizado: $${monto.toLocaleString("es-CL")} a ${contactoSeleccionado.nombre}`
    ).css("color", "green");

    mostrarAlerta("success", "Transferencia realizada con éxito. Redirigiendo al menú...");

    $("#sendAmount").val("");

    setTimeout(function () {
      window.location.href = "menu.html";
    }, 2000);
  });

}

/* =====================================
   Transactions
===================================== */

if ($("#transactionsList").length) {

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
    return JSON.parse(localStorage.getItem("aw_transactions") || "[]");
  }

  function mostrarUltimosMovimientos(filtro) {
    const transacciones = obtenerTransacciones();

    $("#transactionsList").empty();

    // Filtrar
    const filtradas = transacciones.filter(t => {
      if (filtro === "all") return true;
      return t.type === filtro;
    });

    if (filtradas.length === 0) {
      $("#transactionsList").append(`
        <li class="list-group-item">
          No hay movimientos para este filtro.
        </li>
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

          <div class="text-muted mt-1" style="font-size: 0.9em;">
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
    const filtro = $(this).val();
    mostrarUltimosMovimientos(filtro);
  });

}
