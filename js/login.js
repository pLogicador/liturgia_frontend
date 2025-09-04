// Aguarda o DOM estar carregado antes de rodar
document.addEventListener("DOMContentLoaded", () => {
  // Função para exibir toast messages
  function showToast(message, type = "success", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    if (duration !== 999999) {
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => document.body.removeChild(toast), 400);
      }, duration);
    }

    return toast;
  }

  let loadingToast;

  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector("button[type='submit']");
    btn.classList.add("loading");
    btn.disabled = true;

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      showToast("Preencha todos os campos", "error");
      btn.classList.remove("loading");
      btn.disabled = false;
      return;
    }

    const data = new URLSearchParams();
    data.append("username", email);
    data.append("password", password);

    try {
      // 🔹 Mostra toast de carregamento (fica até ser removido)
      loadingToast = showToast("Conectando à API...", "info", 999999);

      const res = await fetch(
        "https://liturgia-api-q635.onrender.com/auth/login",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();

      // 🔹 Remove o toast de carregamento
      if (loadingToast) loadingToast.remove();

      if (res.ok) {
        sessionStorage.setItem("token", result.access_token);
        showToast("Login realizado com sucesso!", "success");
        setTimeout(() => (window.location.href = "liturgy.html"), 1000);
      } else {
        showToast(result.detail || "Erro ao logar", "error");
      }
    } catch {
      if (loadingToast) loadingToast.remove();
      showToast("Erro de conexão", "error");
    } finally {
      btn.classList.remove("loading");
      btn.disabled = false;
    }
  });
});
