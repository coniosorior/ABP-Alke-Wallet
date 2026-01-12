/* =====================================
   LOGIN
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
   MENÚ PRINCIPAL
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
