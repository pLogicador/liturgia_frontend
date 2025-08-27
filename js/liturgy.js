const token = sessionStorage.getItem("token");
if (!token) window.location.href = "index.html";

/* =========================
   Toast
========================= */
function showToast(message, type = "success", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => document.body.removeChild(toast), 400);
  }, duration);
}

/* =========================
   Util: Title Case PT-BR
========================= */
const SMALL_WORDS = new Set([
  "da",
  "de",
  "do",
  "das",
  "dos",
  "e",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "a",
  "o",
  "as",
  "os",
  "por",
  "para",
  "com",
  "sem",
  "sob",
  "sobre",
  "entre",
]);
const MINISTER_PREFIX = ["rev.", "pr.", "pb.", "dc.", "ev."];

function toTitleCase(str) {
  if (!str) return "";
  const raw = str.trim();
  if (!raw) return "";

  return raw
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => {
      const isMinister = MINISTER_PREFIX.includes(w.replace(/,$/, ""));
      if (isMinister) {
        const base = w.replace(/[^a-z\.]/g, "");
        const fixed = base.charAt(0).toUpperCase() + base.slice(1);
        return w.replace(base, fixed);
      }
      if (i > 0 && SMALL_WORDS.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/* =========================
   Livros da Bíblia (PT-BR)
========================= */
const BIBLE_BOOKS = [
  "Gênesis",
  "Êxodo",
  "Levítico",
  "Números",
  "Deuteronômio",
  "Josué",
  "Juízes",
  "Rute",
  "1 Samuel",
  "2 Samuel",
  "1 Reis",
  "2 Reis",
  "1 Crônicas",
  "2 Crônicas",
  "Esdras",
  "Neemias",
  "Ester",
  "Jó",
  "Salmos",
  "Provérbios",
  "Eclesiastes",
  "Cânticos",
  "Isaías",
  "Jeremias",
  "Lamentações",
  "Ezequiel",
  "Daniel",
  "Oseias",
  "Joel",
  "Amós",
  "Obadias",
  "Jonas",
  "Miqueias",
  "Naum",
  "Habacuque",
  "Sofonias",
  "Ageu",
  "Zacarias",
  "Malaquias",
  "Mateus",
  "Marcos",
  "Lucas",
  "João",
  "Atos",
  "Romanos",
  "1 Coríntios",
  "2 Coríntios",
  "Gálatas",
  "Efésios",
  "Filipenses",
  "Colossenses",
  "1 Tessalonicenses",
  "2 Tessalonicenses",
  "1 Timóteo",
  "2 Timóteo",
  "Tito",
  "Filemom",
  "Hebreus",
  "Tiago",
  "1 Pedro",
  "2 Pedro",
  "1 João",
  "2 João",
  "3 João",
  "Judas",
  "Apocalipse",
];

function normalizeKey(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
const BOOKS_BY_KEY = new Map(BIBLE_BOOKS.map((b) => [normalizeKey(b), b]));

/* =========================
   Referência Bíblica
========================= */
function normalizeBibRef(input) {
  if (!input) return "";
  let ref = input.trim().replace(/\s+/g, " ").replace(/[–—]/g, "-");

  const m = ref.match(
    /^([1-3]?\s*[A-Za-zÀ-ÿ\.çãõêéáíóúâôüÇÃÕÊÉÁÍÓÚÂÔÜ\s]+?)\s+(\d+)\s*[:\.]\s*(\d+)(?:\s*-\s*(\d+))?$/
  );
  if (!m) return null;

  let [, bookRaw, chap, v1, v2] = m;
  let bookKey = normalizeKey(toTitleCase(bookRaw));
  let canonical = BOOKS_BY_KEY.get(bookKey);

  if (!canonical) {
    bookKey = normalizeKey(toTitleCase(bookRaw.replace(/^([1-3])\s+/, "$1 ")));
    canonical = BOOKS_BY_KEY.get(bookKey);
  }
  if (!canonical) return null;

  const chapter = parseInt(chap, 10);
  const verse1 = parseInt(v1, 10);
  if (isNaN(chapter) || chapter < 1 || isNaN(verse1) || verse1 < 1) return null;

  let out = `${canonical} ${chapter}.${verse1}`;
  if (v2) {
    const verse2 = parseInt(v2, 10);
    if (!isNaN(verse2) && verse2 > 0) out += `-${verse2}`;
  }
  return out;
}

/* =========================
   Auto-format
========================= */
function applyAutoFormat() {
  const textInputs = document.querySelectorAll(
    "input[type='text']:not(#bib_ref), textarea"
  );
  textInputs.forEach((input) => {
    input.addEventListener("blur", () => {
      input.value = toTitleCase(input.value.trim());
    });
  });

  const bibRefInput = document.getElementById("bib_ref");
  if (bibRefInput) {
    bibRefInput.addEventListener("blur", () => {
      const normalized = normalizeBibRef(bibRefInput.value);
      if (bibRefInput.value.trim() && !normalized) {
        showToast("Referência inválida. Use ex: Mateus 1.1-2", "error");
      } else {
        bibRefInput.value = normalized || "";
      }
    });
  }
}
applyAutoFormat();

/* =========================
   UI Responsáveis
========================= */
const responsiblesContainer = document.getElementById("responsibles");

function createResponsibleDiv() {
  const div = document.createElement("div");
  div.className = "responsible";

  const momentInput = document.createElement("input");
  momentInput.type = "text";
  momentInput.placeholder = "Momento";
  momentInput.className = "moment";
  momentInput.setAttribute("list", "moments");
  momentInput.required = true;

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Nome";
  nameInput.className = "name";
  nameInput.setAttribute("list", "names");
  nameInput.required = true;

  const bookInput = document.createElement("input");
  bookInput.type = "text";
  bookInput.placeholder = "Livro";
  bookInput.className = "book";
  bookInput.setAttribute("list", "bibleBooks");
  bookInput.required = true;

  const chapterInput = document.createElement("input");
  chapterInput.type = "number";
  chapterInput.placeholder = "Capítulo";
  chapterInput.className = "chapter";
  chapterInput.min = "1";
  chapterInput.required = true;

  const versesInput = document.createElement("input");
  versesInput.type = "text";
  versesInput.placeholder = "Versículos";
  versesInput.className = "verses";
  versesInput.required = true;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "removeResponsible";
  removeBtn.textContent = "Remover";

  div.append(
    momentInput,
    nameInput,
    bookInput,
    chapterInput,
    versesInput,
    removeBtn
  );
  return div;
}

// Adicionar novo responsável
document.getElementById("addResponsible").addEventListener("click", () => {
  responsiblesContainer.appendChild(createResponsibleDiv());
});

// Remover responsável
responsiblesContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("removeResponsible")) {
    e.target.parentElement.remove();
  }
});

// Autoformatação para inputs dinâmicos
responsiblesContainer.addEventListener("focusout", (e) => {
  const el = e.target;
  if (el && el.matches("input[type='text']:not(#bib_ref), textarea")) {
    el.value = toTitleCase(el.value.trim());
  }
});

/* =========================
   Submit
========================= */
document.getElementById("liturgyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = e.target.querySelector("button[type='submit']");
  btn.classList.add("loading");
  btn.disabled = true;

  const notes = document.getElementById("notes").value.trim();
  const event_name = document.getElementById("event_name").value;
  const date = document.getElementById("date").value;
  const start_time = document.getElementById("start_time").value;
  const sermon_title = toTitleCase(
    document.getElementById("sermon_title").value.trim()
  );
  const speaker = toTitleCase(document.getElementById("speaker").value.trim());
  const bibRefRaw = document.getElementById("bib_ref").value.trim();
  const bib_ref = bibRefRaw ? normalizeBibRef(bibRefRaw) : "";

  if (!event_name || !date || !start_time || !sermon_title || !speaker) {
    showToast("Preencha todos os campos obrigatórios.", "error");
    return resetBtn(btn);
  }
  if (sermon_title.length > 50)
    return errorReset(
      "O título do sermão deve ter no máximo 50 caracteres.",
      btn
    );
  if (speaker.length > 20)
    return errorReset(
      "O nome do palestrante deve ter no máximo 20 caracteres.",
      btn
    );
  if (bibRefRaw && !bib_ref)
    return errorReset("Referência inválida. Use ex: Mateus 1.1-2", btn);

  const today = new Date().toISOString().split("T")[0];
  if (date < today)
    return errorReset("A data não pode ser anterior a hoje.", btn);

  const responsibleDivs = document.querySelectorAll(".responsible");
  const responsible = [];
  for (const div of responsibleDivs) {
    const moment = toTitleCase(div.querySelector(".moment").value.trim());
    const name = toTitleCase(div.querySelector(".name").value.trim());
    const book = toTitleCase(div.querySelector(".book").value.trim());
    const chapter = parseInt(div.querySelector(".chapter").value);
    const versesRaw = div.querySelector(".verses").value.trim();

    if (!moment || !name || !book || !chapter || !versesRaw)
      return errorReset("Preencha todos os campos de responsáveis.", btn);

    if (isNaN(chapter) || chapter < 1)
      return errorReset("O capítulo deve ser um número positivo.", btn);

    if (!/^\d+([.:]\d+)?(-\d+([.:]\d+)?)?$/.test(versesRaw))
      return errorReset(
        "Formato de versículos inválido. Use ex: 1.1-2 ou 3-5",
        btn
      );

    responsible.push({ moment, name, book, chapter, verses: versesRaw });
  }

  const payload = {
    event_name,
    date,
    start_time,
    sermon_title,
    speaker,
    bib_ref,
    responsible,
  };

  try {
    const res = await fetch(
      "https://liturgia-api-q635.onrender.com/liturgies/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await res.json();
    if (res.ok) {
      showToast("Liturgia criada com sucesso!", "success");
      document.getElementById("downloadPDF").style.display = "block";
      generatePDF({ ...payload, notes });
    } else {
      showToast(result.detail || "Erro ao criar liturgia", "error");
    }
  } catch {
    showToast("Erro na conexão", "error");
  } finally {
    resetBtn(btn);
  }
});

function errorReset(msg, btn) {
  showToast(msg, "error");
  resetBtn(btn);
}
function resetBtn(btn) {
  btn.classList.remove("loading");
  btn.disabled = false;
}

/* =========================
   PDF
========================= */
async function generatePDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 40;
  const columnGap = 20;

  // =========================
  // Cabeçalho
  // =========================
  doc.setFontSize(20);
  doc.setTextColor("#4CAF50");
  doc.text("Liturgia", pageWidth / 2, y, { align: "center" });
  y += 30;

  // =========================
  // Sessão: Informações do Evento
  // =========================
  doc.setFontSize(14);
  doc.setTextColor("#1976D2");
  doc.text("Informações do Evento", margin, y);
  y += 18;

  const drawInfoField = (label, value) => {
    doc.setFillColor("#e0f7fa");
    const rectHeight = 22;
    doc.rect(margin, y, pageWidth - 2 * margin, rectHeight, "F");
    doc.setFontSize(10);
    doc.setTextColor("#000");
    doc.text(`${label}: ${value}`, margin + 6, y + 15);
    y += rectHeight + 10;
  };

  drawInfoField("Evento", data.event_name);
  drawInfoField("Data", data.date);
  drawInfoField("Hora", data.start_time);
  drawInfoField("Título do Sermão", data.sermon_title);
  drawInfoField("Palestrante", data.speaker);
  if (data.bib_ref) drawInfoField("Referência Bíblica", data.bib_ref);

  y += 10;

  // =========================
  // Sessão: Responsáveis
  // =========================
  doc.setFontSize(14);
  doc.setTextColor("#1976D2");
  doc.text("Responsáveis", margin, y);
  y += 18;

  const colWidth = (pageWidth - 2 * margin - columnGap) / 2;
  let colIndex = 0;
  let startY = y;

  data.responsible.forEach((r, index) => {
    const x = margin + colIndex * (colWidth + columnGap);
    let tempY = startY;

    const drawResponsibleField = (label, value) => {
      const rectHeight = 20;
      doc.setFillColor("#f1f8e9");
      doc.rect(x, tempY, colWidth, rectHeight, "F");
      doc.setFontSize(9);
      doc.setTextColor("#000");
      doc.text(`${label}: ${value}`, x + 4, tempY + 14);
      tempY += rectHeight + 4;
    };

    drawResponsibleField("Momento", r.moment);
    drawResponsibleField("Nome", r.name);
    drawResponsibleField("Livro", r.book);
    drawResponsibleField("Capítulo", r.chapter.toString());
    drawResponsibleField("Versículos", r.verses);

    // Atualiza a altura da linha mais alta na coluna
    if (tempY - startY > y - startY) y = tempY;

    colIndex++;
    if (colIndex >= 2) {
      colIndex = 0;
      startY = y + 10;
      y = startY;
    }

    // Quebra de página se necessário
    if (y > pageHeight - margin - 50) {
      doc.addPage();
      y = margin;
      startY = y;
      colIndex = 0;
    }
  });

  y += 20;

  // =========================
  // Sessão: Anotações
  // =========================
  if (data.notes) {
    doc.setFontSize(14);
    doc.setTextColor("#FF5722");
    doc.text("Anotações", margin, y);
    y += 18;

    const lines = doc.splitTextToSize(data.notes, pageWidth - 2 * margin);
    doc.setFontSize(10);
    doc.setTextColor("#000");
    lines.forEach((line) => {
      if (y > pageHeight - margin - 50) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    });
  }

  // =========================
  // Rodapé
  // =========================
  doc.setFontSize(9);
  doc.setTextColor("#9e9e9e");
  doc.text(`Gerado em ${new Date().toLocaleString()}`, margin, pageHeight - 30);

  doc.save(`liturgia-${data.date}.pdf`);
}
