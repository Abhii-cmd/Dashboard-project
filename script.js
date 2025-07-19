document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  let weatherApiKey = localStorage.getItem("weatherApiKey") || "37f9c27d30e2a93bb7ad1d223c72475d";
  let newsApiKey = localStorage.getItem("newsApiKey") || "8b8802931aa24de3a508c93168e32a3e";

  // --- Page Navigation ---
  const navLinks = document.querySelectorAll(".sidebar .nav-link");
  const pages = document.querySelectorAll(".page");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");

  navLinks.forEach((link) => {
    if (link.dataset.page) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetPage = document.getElementById(link.dataset.page);

        pages.forEach((page) => page.classList.remove("active"));
        navLinks.forEach((nav) => nav.classList.remove("active"));

        targetPage.classList.add("active");
        link.classList.add("active");

        // Hide sidebar on navigation on mobile
        if (window.innerWidth < 992) {
          sidebar.classList.remove("show");
          overlay.classList.remove("show");
        }
      });
    }
  });

  // --- Sidebar Toggle for Mobile ---
  const sidebarToggle = document.getElementById("sidebar-toggle");
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("show");
    overlay.classList.toggle("show");
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("show");
    overlay.classList.remove("show");
  });

  // --- Theme Toggle ---
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeText = document.getElementById("theme-text");

  themeToggle.addEventListener("click", (e) => {
    e.preventDefault();
    body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
    updateThemeUI();
  });

  function updateThemeUI() {
    const isDarkMode = body.classList.contains("dark-mode");
    themeIcon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";
    themeText.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
  }

  // --- Date & Time ---
  const datetimeElement = document.getElementById("datetime");
  setInterval(() => {
    datetimeElement.textContent = new Date().toLocaleString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, 1000);

  // --- Weather ---
  const cityInput = document.getElementById("city-input");
  const weatherErrorEl = document.getElementById("weather-error");
  async function getWeather(city) {
    if (!city) return;
    if (!weatherApiKey) {
      weatherErrorEl.textContent =
        "Weather API Key missing. Please set it in Settings.";
      return;
    }
    try {
      weatherErrorEl.textContent = "";
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
      );
      if (!response.ok) throw new Error("City not found.");
      const data = await response.json();
      document.getElementById("city-name").textContent = data.name;
      document.getElementById(
        "weather-icon"
      ).src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      document.getElementById("temperature").textContent = `${Math.round(
        data.main.temp
      )}°C`;
      document.getElementById("description").textContent =
        data.weather[0].description;
      localStorage.setItem("weatherCity", city);
    } catch (error) {
      weatherErrorEl.textContent = error.message;
    }
  }
  document
    .getElementById("get-weather-btn")
    .addEventListener("click", () => getWeather(cityInput.value));

  // --- To-Do List ---
  const todoInput = document.getElementById("todo-input");
  const todoListEl = document.getElementById("todo-list");
  let todos = JSON.parse(localStorage.getItem("todos")) || [];
  function renderTodos() {
    todoListEl.innerHTML = todos
      .map(
        (todo, index) => `
                    <li class="d-flex align-items-center p-2 ${
                      todo.completed
                        ? "text-decoration-line-through opacity-50"
                        : ""
                    }">
                        <input type="checkbox" class="form-check-input me-3" ${
                          todo.completed ? "checked" : ""
                        } data-index="${index}">
                        <span class="flex-grow-1">${todo.text}</span>
                        <i class="fas fa-trash-alt text-danger" role="button" data-index="${index}"></i>
                    </li>`
      )
      .join("");
    localStorage.setItem("todos", JSON.stringify(todos));
  }
  document.getElementById("add-todo-btn").addEventListener("click", () => {
    if (todoInput.value.trim()) {
      todos.push({ text: todoInput.value.trim(), completed: false });
      todoInput.value = "";
      renderTodos();
    }
  });
  todoListEl.addEventListener("click", (e) => {
    if (e.target.type === "checkbox")
      todos[e.target.dataset.index].completed = e.target.checked;
    if (e.target.classList.contains("fa-trash-alt"))
      todos.splice(e.target.dataset.index, 1);
    renderTodos();
  });

  // --- News Feed ---
  const newsErrorEl = document.getElementById("news-error");
  async function getNews() {
    if (!newsApiKey) {
      newsErrorEl.textContent =
        "News API Key missing. Please set it in Settings.";
      return;
    }
    try {
      newsErrorEl.textContent = "";
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsApiKey}`
      );
      const data = await response.json();
      if (data.status !== "ok") throw new Error(data.message);
      document.getElementById("news-feed").innerHTML = data.articles
        .slice(0, 10)
        .map(
          (article) => `
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="list-group-item list-group-item-action">
                            <div class="fw-bold">${article.title}</div>
                            <small class="text-muted">${article.source.name}</small>
                        </a>`
        )
        .join("");
    } catch (error) {
      newsErrorEl.textContent = "Could not fetch news. " + error.message;
    }
  }

  // --- Crypto Prices ---
  const cryptoErrorEl = document.getElementById("crypto-error");
  async function getCrypto() {
    try {
      cryptoErrorEl.textContent = "";
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,cardano&vs_currencies=usd"
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      document.getElementById("crypto-feed").innerHTML = Object.entries(data)
        .map(
          ([name, price]) => `
                        <div class="d-flex justify-content-between align-items-center mb-2 crypto-item">
                            <span class="text-capitalize fw-bold">${name}</span>
                            <span class="badge bg-success">$${price.usd.toLocaleString()}</span>
                        </div>`
        )
        .join("");
    } catch (error) {
      cryptoErrorEl.textContent = "Could not fetch crypto prices.";
    }
  }

  // --- Quote of the Day ---
  async function handleQuoteOfTheDay() {
    const quoteEl = document.getElementById("quote");
    const authorEl = document.getElementById("quote-author");
    const storedQuoteData = JSON.parse(localStorage.getItem("quoteData"));
    const now = new Date().getTime();

    // Check if we have a stored quote and if it's less than 24 hours old
    if (
      storedQuoteData &&
      now - storedQuoteData.timestamp < 24 * 60 * 60 * 1000
    ) {
      quoteEl.textContent = storedQuoteData.quote;
      authorEl.textContent = storedQuoteData.author;
    } else {
      // Fetch a new quote
      try {
        const response = await fetch("https://api.quotable.io/random");
        const data = await response.json();

        const newQuoteData = {
          quote: data.content,
          author: data.author,
          timestamp: now,
        };

        localStorage.setItem("quoteData", JSON.stringify(newQuoteData));
        quoteEl.textContent = newQuoteData.quote;
        authorEl.textContent = newQuoteData.author;
      } catch (error) {
        // Fallback quote in case of API error
        quoteEl.textContent =
          "The best way to predict the future is to create it.";
        authorEl.textContent = "Peter Drucker";
      }
    }
  }

  // --- Quick Links ---
  const quickLinksGrid = document.getElementById("quick-links-grid");
  const quickLinkModal = new bootstrap.Modal(
    document.getElementById("quickLinkModal")
  );
  const quickLinkForm = document.getElementById("quickLinkForm");
  const quickLinkModalLabel = document.getElementById("quickLinkModalLabel");
  const deleteLinkBtn = document.getElementById("delete-link-btn");

  let quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [
    { id: 1, name: "Google", url: "https://google.com", icon: "fab fa-google" },
    {
      id: 2,
      name: "YouTube",
      url: "https://youtube.com",
      icon: "fab fa-youtube",
    },
    { id: 3, name: "GitHub", url: "https://github.com", icon: "fab fa-github" },
  ];

  function renderQuickLinks() {
    quickLinksGrid.innerHTML =
      quickLinks
        .map(
          (link) => `
                    <div class="quick-link">
                        <div class="quick-link-icon-container">
                             <a href="${
                               link.url
                             }" target="_blank" rel="noopener noreferrer" title="${
            link.name
          }">
                                <div class="quick-link-icon"><i class="${
                                  link.icon || "fas fa-link"
                                }"></i></div>
                                <span class="quick-link-name">${
                                  link.name
                                }</span>
                            </a>
                            <button class="btn-edit-link" data-id="${
                              link.id
                            }" title="Edit Link"><i class="fas fa-pencil-alt"></i></button>
                        </div>
                    </div>`
        )
        .join("") +
      `<div class="quick-link">
                        <a href="#" id="add-link-btn" title="Add New Link">
                            <div class="quick-link-icon btn-add-link"><i class="fas fa-plus"></i></div>
                            <span class="quick-link-name">Add</span>
                        </a>
                    </div>`;
    localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
  }

  quickLinksGrid.addEventListener("click", (e) => {
    const addLinkBtn = e.target.closest("#add-link-btn");
    const editLinkBtn = e.target.closest(".btn-edit-link");

    if (addLinkBtn) {
      e.preventDefault();
      quickLinkForm.reset();
      document.getElementById("link-id").value = "";
      deleteLinkBtn.classList.add("d-none");
      quickLinkModalLabel.textContent = "Add Quick Link";
      quickLinkModal.show();
    } else if (editLinkBtn) {
      e.preventDefault();
      const linkId = editLinkBtn.dataset.id;
      const linkToEdit = quickLinks.find((l) => l.id == linkId);
      if (linkToEdit) {
        document.getElementById("link-id").value = linkToEdit.id;
        document.getElementById("link-name").value = linkToEdit.name;
        document.getElementById("link-url").value = linkToEdit.url;
        document.getElementById("link-icon").value = linkToEdit.icon;
        deleteLinkBtn.classList.remove("d-none");
        quickLinkModalLabel.textContent = "Edit Quick Link";
        quickLinkModal.show();
      }
    }
  });

  quickLinkForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("link-id").value;
    const linkData = {
      id: id ? Number(id) : Date.now(),
      name: document.getElementById("link-name").value,
      url: document.getElementById("link-url").value,
      icon: document.getElementById("link-icon").value,
    };
    if (id) {
      quickLinks = quickLinks.map((l) => (l.id == id ? linkData : l));
    } else {
      quickLinks.push(linkData);
    }
    renderQuickLinks();
    quickLinkModal.hide();
  });

  deleteLinkBtn.addEventListener("click", () => {
    const id = document.getElementById("link-id").value;
    if (id) {
      quickLinks = quickLinks.filter((l) => l.id != id);
      renderQuickLinks();
      quickLinkModal.hide();
    }
  });

  // --- Settings & Profile ---
  const profileForm = document.getElementById("profile-form");
  const apiKeysForm = document.getElementById("api-keys-form");
  const appearanceForm = document.getElementById("appearance-form");

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.setItem(
      "profileName",
      document.getElementById("profile-name").value
    );
    localStorage.setItem(
      "profileBio",
      document.getElementById("profile-bio").value
    );
    loadProfile();
    alert("Profile saved!");
  });

  apiKeysForm.addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.setItem(
      "weatherApiKey",
      document.getElementById("weather-api-key").value
    );
    localStorage.setItem(
      "newsApiKey",
      document.getElementById("news-api-key").value
    );
    weatherApiKey = localStorage.getItem("weatherApiKey");
    newsApiKey = localStorage.getItem("newsApiKey");
    alert("API Keys saved!");
    getWeather(localStorage.getItem("weatherCity") || "Panaji");
    getNews();
  });

  appearanceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const bgUrl = document.getElementById("bg-image-url").value;
    localStorage.setItem("backgroundImage", bgUrl);
    setBackground(bgUrl);
  });

  document.getElementById("clear-bg-btn").addEventListener("click", () => {
    localStorage.removeItem("backgroundImage");
    setBackground(null);
  });

  document.getElementById("clear-data-btn").addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to clear ALL local data? This cannot be undone."
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  });

  function loadProfile() {
    const name = localStorage.getItem("profileName") || "User";
    document.getElementById("profile-name-header").textContent = name;
    document.getElementById("profile-name").value = name;
    document.getElementById("profile-bio").value =
      localStorage.getItem("profileBio") || "";
  }

  function loadSettings() {
    document.getElementById("weather-api-key").value =
      localStorage.getItem("weatherApiKey") || "";
    document.getElementById("news-api-key").value =
      localStorage.getItem("newsApiKey") || "";
    document.getElementById("bg-image-url").value =
      localStorage.getItem("backgroundImage") || "";
  }

  function setBackground(url) {
    if (url) body.style.backgroundImage = `url(${url})`;
    else body.style.backgroundImage = "none";
  }

  // --- Initial Load ---
  function init() {
    if (localStorage.getItem("darkMode") === "true") {
      body.classList.add("dark-mode");
    }
    updateThemeUI();

    const savedCity = localStorage.getItem("weatherCity") || "Panaji";
    cityInput.value = savedCity;
    getWeather(savedCity);

    renderTodos();
    getNews();
    getCrypto();
    handleQuoteOfTheDay();
    renderQuickLinks();
    loadProfile();
    loadSettings();
    setBackground(localStorage.getItem("backgroundImage"));
  }

  init();
});