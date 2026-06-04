const APP_STATE = {
  settings: null,
  currentView: "home"
};

const SETTINGS_URL = "/data/settings.json?v=1020";

const RECOVERY_CAPITAL_QUESTIONS = [
  "I have the financial resources to provide for myself and my family.",
  "I have personal transportation or access to public transportation.",
  "I live in a home and neighborhood that is safe and secure.",
  "I live in an environment free from alcohol and other drugs.",
  "I have an intimate partner supportive of my recovery process.",
  "I have family members who are supportive of my recovery process.",
  "I have friends who are supportive of my recovery process.",
  "I have people close to me who are also in recovery.",
  "I have a stable job that I enjoy and that provides for my basic necessities.",
  "I have an education or work environment that is conducive to my long-term recovery.",
  "I continue to participate in a continuing care program of an addiction treatment program.",
  "I have a professional assistance program that is monitoring and supporting my recovery process.",
  "I have a primary care physician who attends to my health problems.",
  "I am now in reasonably good health.",
  "I have an active plan to manage any lingering or potential health problems.",
  "I am on prescribed medication that minimizes my obsession or urges to use alcohol and other drugs.",
  "I have insurance that will allow me to receive help for major health problems.",
  "I have access to regular, nutritious meals.",
  "I have clothes that are comfortable, clean, and conducive to my recovery activities.",
  "I have access to recovery support groups in my local community.",
  "I have established close affiliation with a local recovery support group.",
  "I have a sponsor or equivalent who serves as a special mentor related to my recovery.",
  "I have access to online recovery support groups.",
  "I have completed or am complying with all legal requirements related to my past.",
  "There are other people who rely on me to support their own recoveries.",
  "My immediate physical environment contains literature, tokens, posters, or other symbols of my commitment to recovery.",
  "I have recovery rituals that are now part of my daily life.",
  "I had a profound experience that marked the beginning or deepening of my commitment to recovery.",
  "I now have goals and great hopes for my future.",
  "I have problem-solving skills and resources that I lacked during my years of active addiction.",
  "I feel like I have meaningful, positive participation in my family and community.",
  "Today I have a clear sense of who I am.",
  "I know that my life has a purpose.",
  "Service to others is now an important part of my life.",
  "My personal values and sense of right and wrong have become clearer and stronger in recent years."
];

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  bindNavigation();
  setTodayDate();
  renderRecoveryCapitalQuestions();

  try {
    const response = await fetch(SETTINGS_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Could not load settings.json");
    }

    const settings = await response.json();
    APP_STATE.settings = settings;

    renderCrisisButtons(settings);

    bindConcernForm(settings);
    bindRelapseForm(settings);
    bindRecoveryCapitalForm(settings);
    bindClientHelpForm(settings);
    bindAppProblemForm(settings);
    bindAdminLogin(settings);
  } catch (error) {
    console.error(error);
    showToast("Settings could not be loaded. Check public/data/settings.json.");
  }
}

function bindNavigation() {
  const navButtons = document.querySelectorAll("[data-go]");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.getAttribute("data-go");
      showView(view);
    });
  });

  const homeButton = document.getElementById("homeButton");
  if (homeButton) {
    homeButton.addEventListener("click", () => showView("home"));
  }

  const menuButton = document.getElementById("menuButton");
  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const bottomNav = document.querySelector(".bottom-nav");
      if (bottomNav) {
        bottomNav.classList.toggle("nav-open");
      }
    });
  }
}

function showView(viewName) {
  const views = document.querySelectorAll("[data-view]");

  views.forEach((view) => {
    if (view.getAttribute("data-view") === viewName) {
      view.classList.remove("hidden");
    } else {
      view.classList.add("hidden");
    }
  });

  APP_STATE.currentView = viewName;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function renderCrisisButtons(settings) {
  const crisisButtons = document.getElementById("crisisButtons");
  if (!crisisButtons || !Array.isArray(settings.crisis)) return;

  crisisButtons.innerHTML = "";

  settings.crisis.forEach((item) => {
    const cleanPhone = cleanPhoneNumber(item.phone);

    const card = document.createElement("div");
    card.className = "resource-card crisis-card";

    const title = document.createElement("h3");
    title.textContent = item.name || "Support";

    const description = document.createElement("p");
    description.textContent = item.description || "";

    const actions = document.createElement("div");
    actions.className = "contact-actions";

    const callButton = document.createElement("button");
    callButton.type = "button";
    callButton.className = "secondary-button";
    callButton.textContent = cleanPhone ? `Call ${formatPhone(cleanPhone)}` : "Call";
    callButton.addEventListener("click", () => {
      if (cleanPhone) {
        window.location.href = `tel:${cleanPhone}`;
      }
    });

    actions.appendChild(callButton);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(actions);
    crisisButtons.appendChild(card);
  });
}

function renderRecoveryCapitalQuestions() {
  const container = document.getElementById("recoveryCapitalQuestions");
  if (!container || container.children.length > 0) return;

  RECOVERY_CAPITAL_QUESTIONS.forEach((question, index) => {
    const itemNumber = index + 1;

    const card = document.createElement("div");
    card.className = "question-card";

    const title = document.createElement("h4");
    title.textContent = `${itemNumber}. ${question}`;

    const scaleRow = document.createElement("div");
    scaleRow.className = "scale-row";

    for (let score = 0; score <= 5; score++) {
      const label = document.createElement("label");
      label.className = "scale-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `rc_item_${itemNumber}`;
      input.value = String(score);
      input.required = true;

      input.addEventListener("change", updateRecoveryCapitalScore);

      const number = document.createElement("span");
      number.textContent = String(score);

      label.appendChild(input);
      label.appendChild(number);
      scaleRow.appendChild(label);
    }

    card.appendChild(title);
    card.appendChild(scaleRow);
    container.appendChild(card);
  });
}

function updateRecoveryCapitalScore() {
  const answers = getRecoveryCapitalAnswers();
  const answeredOnly = answers.filter((answer) => answer.answered);
  const total = answeredOnly.reduce((sum, answer) => sum + answer.score, 0);

  const scoreDisplay = document.getElementById("recoveryCapitalScore");
  const totalInput = document.getElementById("totalScoreInput");
  const lowestInput = document.getElementById("lowestItemsInput");
  const highestInput = document.getElementById("highestItemsInput");
  const lowestDisplay = document.getElementById("lowestItemsDisplay");
  const highestDisplay = document.getElementById("highestItemsDisplay");

  if (scoreDisplay) scoreDisplay.textContent = String(total);
  if (totalInput) totalInput.value = String(total);

  if (answeredOnly.length === 0) {
    if (lowestInput) lowestInput.value = "";
    if (highestInput) highestInput.value = "";
    if (lowestDisplay) lowestDisplay.textContent = "Complete the scale to see your lowest items.";
    if (highestDisplay) highestDisplay.textContent = "Complete the scale to see your highest items.";
    return;
  }

  const sortedLow = [...answeredOnly].sort((a, b) => a.score - b.score);
  const sortedHigh = [...answeredOnly].sort((a, b) => b.score - a.score);

  const lowest = sortedLow.slice(0, 5).map(formatRecoveryCapitalItem);
  const highest = sortedHigh.slice(0, 5).map(formatRecoveryCapitalItem);

  if (lowestInput) lowestInput.value = lowest.join(" | ");
  if (highestInput) highestInput.value = highest.join(" | ");
  if (lowestDisplay) lowestDisplay.textContent = lowest.join("; ");
  if (highestDisplay) highestDisplay.textContent = highest.join("; ");
}

function getRecoveryCapitalAnswers() {
  return RECOVERY_CAPITAL_QUESTIONS.map((question, index) => {
    const itemNumber = index + 1;
    const selected = document.querySelector(`input[name="rc_item_${itemNumber}"]:checked`);

    return {
      itemNumber,
      question,
      score: selected ? Number(selected.value) : 0,
      answered: Boolean(selected)
    };
  });
}

function formatRecoveryCapitalItem(answer) {
  return `#${answer.itemNumber} (${answer.score}) ${answer.question}`;
}

function bindConcernForm(settings) {
  const form = document.getElementById("concernForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const endpoint = settings?.forms?.concernEndpoint;

    if (!endpoint) {
      submitByEmailFallback(form, settings, "Crossroads Concern");
      return;
    }

    const formData = new FormData(form);
    formData.append("submissionType", "Anonymous Concern");
    formData.append("source", "Crossroads Recovery App");

    await submitFormspreeForm(form, endpoint, formData, "Concern submitted. Leadership has received it.");
  });
}

function bindRelapseForm(settings) {
  const form = document.getElementById("relapseForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const endpoint = settings?.forms?.relapseEndpoint;

    if (!endpoint) {
      submitByEmailFallback(form, settings, "Crossroads Relapse Help Request");
      return;
    }

    const formData = new FormData(form);
    formData.append("submissionType", "Relapse Help Request");
    formData.append("source", "Crossroads Recovery App");

    await submitFormspreeForm(form, endpoint, formData, "Help request submitted. Leadership has received it.");
  });
}

function bindRecoveryCapitalForm(settings) {
  const form = document.getElementById("recoveryCapitalForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    updateRecoveryCapitalScore();

    const answers = getRecoveryCapitalAnswers();
    const missingAnswers = answers.filter((answer) => !answer.answered);

    if (missingAnswers.length > 0) {
      showToast("Please answer every Recovery Capital question before submitting.");
      return;
    }

    const endpoint = settings?.forms?.recoveryCapitalEndpoint;

    if (!endpoint) {
      submitByEmailFallback(form, settings, "Crossroads Recovery Capital Scale and Plan");
      return;
    }

    const formData = new FormData(form);

    answers.forEach((answer) => {
      formData.append(`Item ${answer.itemNumber}`, `${answer.score} - ${answer.question}`);
    });

    formData.append("submissionType", "Recovery Capital Scale and Plan");
    formData.append("source", "Crossroads Recovery App");
    formData.append("possibleScore", "175");

    await submitFormspreeForm(form, endpoint, formData, "Recovery Capital Scale & Plan submitted.");
  });
}

function bindClientHelpForm(settings) {
  const form = document.getElementById("clientHelpForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const endpoint = settings?.forms?.clientHelpEndpoint || settings?.forms?.concernEndpoint;

    if (!endpoint) {
      submitByEmailFallback(form, settings, "Crossroads Client Help Request");
      return;
    }

    const formData = new FormData(form);
    formData.append("submissionType", "Client Help / Document Request");
    formData.append("source", "Crossroads Recovery App");

    await submitFormspreeForm(form, endpoint, formData, "Client help request submitted. Staff has received it.");
  });
}

function bindAppProblemForm(settings) {
  const form = document.getElementById("appProblemForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const endpoint = settings?.forms?.appProblemEndpoint || settings?.forms?.concernEndpoint;

    if (!endpoint) {
      submitByEmailFallback(form, settings, "Crossroads App Problem Report");
      return;
    }

    const formData = new FormData(form);
    formData.append("submissionType", "App Problem Report");
    formData.append("source", "Crossroads Recovery App");

    await submitFormspreeForm(form, endpoint, formData, "App problem report submitted.");
  });
}

function bindAdminLogin(settings) {
  const adminButton = document.getElementById("adminLoginButton");
  if (!adminButton) return;

  adminButton.addEventListener("click", () => {
    const adminUrl = settings?.admin?.url || "https://formspree.io/login";
    window.open(adminUrl, "_blank", "noopener,noreferrer");
  });
}

async function submitFormspreeForm(form, endpoint, formData, successMessage) {
  const submitButton = form.querySelector("button[type='submit']");
  const originalButtonText = submitButton ? submitButton.textContent : "";

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Form submission failed.");
    }

    form.reset();

    if (form.id === "recoveryCapitalForm") {
      clearRecoveryCapitalAnswers();
      updateRecoveryCapitalScore();
      setTodayDate();
    }

    showToast(successMessage);
  } catch (error) {
    console.error(error);
    showToast("The form could not send. Try again or contact leadership directly.");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}

function clearRecoveryCapitalAnswers() {
  const selectedAnswers = document.querySelectorAll("#recoveryCapitalQuestions input[type='radio']:checked");

  selectedAnswers.forEach((input) => {
    input.checked = false;
  });
}

function submitByEmailFallback(form, settings, subject) {
  const fallbackEmail = settings?.forms?.fallbackEmail || "leadership@example.com";
  const formData = new FormData(form);
  const lines = [];

  formData.forEach((value, key) => {
    lines.push(`${key}: ${value}`);
  });

  const body = encodeURIComponent(lines.join("\n"));
  const encodedSubject = encodeURIComponent(subject);

  window.location.href = `mailto:${fallbackEmail}?subject=${encodedSubject}&body=${body}`;
}

function cleanPhoneNumber(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function formatPhone(phone) {
  const digits = cleanPhoneNumber(phone);

  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone || "";
}

function setTodayDate() {
  const dateInput = document.querySelector("#recoveryCapitalForm input[name='date']");
  if (!dateInput) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  dateInput.value = `${year}-${month}-${day}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.add("hidden");
  }, 3200);
}
