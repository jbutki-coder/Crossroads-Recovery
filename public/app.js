const APP_STATE = {
  settings: null,
  currentView: "home"
};

const SETTINGS_URL = "/data/settings.json?v=999";

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  bindNavigation();

  try {
    const response = await fetch(SETTINGS_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Could not load settings.json");
    }

    const settings = await response.json();
    APP_STATE.settings = settings;

    renderCrisisButtons(settings);
    renderMeetings(settings);
    renderReadings(settings);
    renderLiterature(settings);
    renderContacts(settings);
    bindConcernForm(settings);
    bindRelapseForm(settings);

    showToast("App loaded.");
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

    const callButton = document.createElement("a");
    callButton.className = "secondary-button";
    callButton.href = `tel:${cleanPhone}`;
    callButton.textContent = `Call ${formatPhone(cleanPhone)}`;

    actions.appendChild(callButton);

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(actions);

    crisisButtons.appendChild(card);
  });
}

function renderMeetings(settings) {
  const meetingLinks = document.getElementById("meetingLinks");
  const meetingFrame = document.getElementById("meetingFrame");

  if (meetingLinks && Array.isArray(settings.meetings)) {
    meetingLinks.innerHTML = "";

    settings.meetings.forEach((item) => {
      const card = document.createElement("div");
      card.className = "resource-card";

      const title = document.createElement("h3");
      title.textContent = item.name || "Meeting Link";

      const description = document.createElement("p");
      description.textContent = item.description || "";

      const button = document.createElement("a");
      button.className = "secondary-button";
      button.href = item.url || "#";
      button.target = "_blank";
      button.rel = "noopener noreferrer";
      button.textContent = "Open Meeting Finder";

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(button);

      meetingLinks.appendChild(card);
    });
  }

  if (meetingFrame && settings.meetingEmbedUrl) {
    meetingFrame.src = settings.meetingEmbedUrl;

    meetingFrame.addEventListener("load", () => {
      meetingFrame.classList.add("loaded");
    });
  }
}

function renderReadings(settings) {
  const readingLinks = document.getElementById("readingLinks");
  const readingFrame = document.getElementById("readingFrame");

  if (!readingLinks || !Array.isArray(settings.readings)) return;

  readingLinks.innerHTML = "";

  settings.readings.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "resource-card";

    const title = document.createElement("h3");
    title.textContent = item.name || "Daily Reading";

    const description = document.createElement("p");
    description.textContent = item.description || "";

    const openInApp = document.createElement("button");
    openInApp.className = "secondary-button";
    openInApp.type = "button";
    openInApp.textContent = "Open in App";

    openInApp.addEventListener("click", () => {
      if (readingFrame) {
        readingFrame.src = item.url;
        readingFrame.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });

    const openNewTab = document.createElement("a");
    openNewTab.className = "secondary-button";
    openNewTab.href = item.url || "#";
    openNewTab.target = "_blank";
    openNewTab.rel = "noopener noreferrer";
    openNewTab.textContent = "Open New Tab";

    const actions = document.createElement("div");
    actions.className = "contact-actions";
    actions.appendChild(openInApp);
    actions.appendChild(openNewTab);

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(actions);

    readingLinks.appendChild(card);

    if (index === 0 && readingFrame && item.url) {
      readingFrame.src = item.url;
    }
  });
}

function renderLiterature(settings) {
  const literatureLinks = document.getElementById("literatureLinks");
  const literatureFrame = document.getElementById("literatureFrame");
  const literatureFrameTitle = document.getElementById("literatureFrameTitle");

  if (!literatureLinks || !Array.isArray(settings.literature)) return;

  literatureLinks.innerHTML = "";

  settings.literature.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "resource-card literature-card";

    const title = document.createElement("h3");
    title.textContent = item.name || "Recovery Literature";

    const description = document.createElement("p");
    description.textContent = item.description || "";

    const actions = document.createElement("div");
    actions.className = "contact-actions";

    const openInApp = document.createElement("button");
    openInApp.className = "secondary-button";
    openInApp.type = "button";
    openInApp.textContent = "Open in App";

    openInApp.addEventListener("click", () => {
      const previewUrl = toDrivePreviewUrl(item.url);

      if (literatureFrame) {
        literatureFrame.src = previewUrl;
      }

      if (literatureFrameTitle) {
        literatureFrameTitle.textContent = item.name || "Recovery Literature Viewer";
      }

      if (literatureFrame) {
        literatureFrame.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });

    const openNewTab = document.createElement("a");
    openNewTab.className = "secondary-button";
    openNewTab.href = item.url || "#";
    openNewTab.target = "_blank";
    openNewTab.rel = "noopener noreferrer";
    openNewTab.textContent = "Open New Tab";

    actions.appendChild(openInApp);
    actions.appendChild(openNewTab);

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(actions);

    literatureLinks.appendChild(card);

    if (index === 0 && literatureFrame && item.url) {
      literatureFrame.src = toDrivePreviewUrl(item.url);

      if (literatureFrameTitle) {
        literatureFrameTitle.textContent = item.name || "Recovery Literature Viewer";
      }
    }
  });
}

function renderContacts(settings) {
  const contactLinks = document.getElementById("contactLinks");
  if (!contactLinks || !Array.isArray(settings.contacts)) return;

  contactLinks.innerHTML = "";

  settings.contacts.forEach((contact) => {
    const card = document.createElement("div");
    card.className = "contact-card";

    const title = document.createElement("h3");
    title.textContent = contact.name || "Leadership";

    const role = document.createElement("span");
    role.className = "contact-role";
    role.textContent = contact.role || "Leadership";

    const phoneDisplay = document.createElement("span");
    phoneDisplay.className = "contact-phone";

    const cleanPhone = cleanPhoneNumber(contact.phone);

    if (cleanPhone) {
      phoneDisplay.textContent = formatPhone(cleanPhone);
    } else {
      phoneDisplay.textContent = "Add phone number in data/settings.json";
    }

    card.appendChild(title);
    card.appendChild(role);
    card.appendChild(phoneDisplay);

    if (cleanPhone) {
      const actions = document.createElement("div");
      actions.className = "contact-actions";

      const call = document.createElement("a");
      call.href = `tel:${cleanPhone}`;
      call.textContent = "Call";
      call.className = "secondary-button";

      const text = document.createElement("a");
      text.href = `sms:${cleanPhone}`;
      text.textContent = "Text";
      text.className = "secondary-button";

      actions.appendChild(call);
      actions.appendChild(text);

      card.appendChild(actions);
    }

    contactLinks.appendChild(card);
  });
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

function toDrivePreviewUrl(url) {
  if (!url) return "";

  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/\/file\/d\/([^/]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  return url;
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
