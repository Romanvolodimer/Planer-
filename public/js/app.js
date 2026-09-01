/*
=========================================================
ПЛАНУВАЛЬНИК
Тестова версія

КГУ:
- запуск
- зупинка
- збільшення потужності
- зменшення потужності
- АРВЧ
- ручний режим
- номінація
- реномінація

УЗЕ:
- заряд
- розряд
- збільшення/зменшення потужності
- АРВЧ

Установки та погодинні графіки синхронізуються з PostgreSQL.
=========================================================
*/

/* ======================================================
   ТЕСТОВІ УСТАНОВКИ
====================================================== */

let installations = [
  {
    id: 1,
    name: "КГУ №01",
    type: "KGU",
    active: true,

    settings: {
      minPower: 100,
      power: 500,
      maxPower: 500,

      startupMinutes: 10,
      shutdownMinutes: 5,
      loadMinutes: 10,
      unloadMinutes: 5,

      schedule: {
        source: "database",
        automatic: true,
        update: true,
      },

      automation: {
        start: true,
        stop: true,
        load: true,
        unload: true,
        manual: true,
      },

      arvch: {
        enabled: true,
        hours: [],
      },

      gas: {
        enabled: true,
        consumption: 125,
      },

      nomination: {
        time: "09:00",
        automatic: true,
      },

      renomination: {
        time: "13:00",
        automatic: true,
      },
    },
  },

  {
    id: 2,
    name: "КГУ №02",
    type: "KGU",
    active: true,

    settings: {
      minPower: 100,
      power: 1000,
      maxPower: 1000,

      startupMinutes: 15,
      shutdownMinutes: 5,
      loadMinutes: 10,
      unloadMinutes: 10,

      schedule: {
        source: "database",
        automatic: true,
        update: true,
      },

      automation: {
        start: true,
        stop: true,
        load: true,
        unload: true,
        manual: true,
      },

      arvch: {
        enabled: true,
        hours: [],
      },

      gas: {
        enabled: true,
        consumption: 220,
      },

      nomination: {
        time: "09:00",
        automatic: true,
      },

      renomination: {
        time: "13:00",
        automatic: true,
      },
    },
  },

  {
    id: 3,
    name: "КГУ №03",
    type: "KGU",
    active: true,

    settings: {
      minPower: 100,
      power: 500,
      maxPower: 500,

      startupMinutes: 10,
      shutdownMinutes: 5,
      loadMinutes: 10,
      unloadMinutes: 5,

      schedule: {
        source: "database",
        automatic: true,
        update: true,
      },

      automation: {
        start: true,
        stop: true,
        load: true,
        unload: true,
        manual: true,
      },

      arvch: {
        enabled: true,
        hours: [],
      },

      gas: {
        enabled: true,
        consumption: 125,
      },

      nomination: {
        time: "09:00",
        automatic: true,
      },

      renomination: {
        time: "13:00",
        automatic: true,
      },
    },
  },

  {
    id: 4,
    name: "КГУ №04",
    type: "KGU",
    active: true,

    settings: {
      minPower: 100,
      power: 500,
      maxPower: 500,

      startupMinutes: 10,
      shutdownMinutes: 5,
      loadMinutes: 10,
      unloadMinutes: 5,

      schedule: {
        source: "database",
        automatic: true,
        update: true,
      },

      automation: {
        start: true,
        stop: true,
        load: true,
        unload: true,
        manual: true,
      },

      arvch: {
        enabled: true,
        hours: [],
      },

      gas: {
        enabled: true,
        consumption: 125,
      },

      nomination: {
        time: "09:00",
        automatic: true,
      },

      renomination: {
        time: "13:00",
        automatic: true,
      },
    },
  },

  {
    id: 5,
    name: "УЗЕ №01",
    type: "UZE",
    active: true,

    settings: {
      chargePower: 500,
      dischargePower: 500,

      schedule: {
        source: "database",
        automatic: true,
        update: true,
      },

      automation: {
        charge: true,
        discharge: true,
        powerChange: true,
      },

      arvch: {
        enabled: true,
        hours: [],
      },
    },
  },

  {
    id: 6,
    name: "УЗЕ №02",
    type: "UZE",
    active: true,

    settings: {
      chargePower: 1000,
      dischargePower: 1000,

      schedule: {
        source: "database",
        automatic: true,
        update: true,
      },

      automation: {
        charge: true,
        discharge: true,
        powerChange: true,
      },

      arvch: {
        enabled: true,
        hours: [],
      },
    },
  },

  {
    id: 7,
    name: "УЗЕ №03",
    type: "UZE",
    active: true,

    settings: {
      chargePower: 1000,
      dischargePower: 1000,

      schedule: {
        source: "database",
        automatic: true,
        update: true,
      },

      automation: {
        charge: true,
        discharge: true,
        powerChange: true,
      },

      arvch: {
        enabled: true,
        hours: [],
      },
    },
  },
];

/* ======================================================
   ТЕСТОВІ ЗАДАЧІ
====================================================== */

let tasks = [];

/* ======================================================
   ВИБРАНА ДАТА
====================================================== */

let selectedDate = new Date();

selectedDate.setHours(0, 0, 0, 0);

let calendarMonth = new Date(
  selectedDate.getFullYear(),
  selectedDate.getMonth(),
  1,
);

/* ======================================================
   DOM
====================================================== */

function $(id) {
  return document.getElementById(id);
}

/* ======================================================
   DATE
====================================================== */

function dateKey(date) {
  return [
    date.getFullYear(),

    String(date.getMonth() + 1).padStart(2, "0"),

    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function sameDay(date1, date2) {
  return dateKey(date1) === dateKey(date2);
}

function formatDate(date) {
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ======================================================
   TIME
====================================================== */

function timeToMinutes(time) {
  if (!time) {
    return 0;
  }

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  minutes = Math.max(0, Math.min(1439, minutes));

  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;

  return String(hours).padStart(2, "0") + ":" + String(mins).padStart(2, "0");
}

function getCurrentMinutes() {
  const now = new Date();

  return now.getHours() * 60 + now.getMinutes();
}

function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${minutes} хв`;
  }

  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} год`;
  }

  return `${hours} год ${mins} хв`;
}

/* ======================================================
   HTML ESCAPE
====================================================== */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

/* ======================================================
   ACTIVE INSTALLATIONS
====================================================== */

function getActiveInstallations() {
  return installations.filter((installation) => installation.active);
}

/* ======================================================
   INSTALLATIONS LIST
====================================================== */

function renderInstallations() {
  const active = getActiveInstallations();

  const kgu = active.filter((item) => item.type === "KGU").length;

  const uze = active.filter((item) => item.type === "UZE").length;

  $("installationTotal").textContent = active.length;

  $("kguTotal").textContent = kgu;

  $("uzeTotal").textContent = uze;

  if (!active.length) {
    $("installationsList").innerHTML = `

                <div class="empty">
                    Немає активних установок
                </div>

            `;

    return;
  }

  $("installationsList").innerHTML = active
    .map(createInstallationItem)
    .join("");

  document.querySelectorAll("[data-edit-installation]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      openInstallation(Number(button.dataset.editInstallation));
    });
  });

  document.querySelectorAll("[data-delete-installation]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      deactivateInstallation(Number(button.dataset.deleteInstallation));
    });
  });
}

/* ======================================================
   INSTALLATION ITEM
====================================================== */

function createInstallationItem(installation) {
  const isUze = installation.type === "UZE";

  return `

        <div
            class="installation-item">


            <span
                class="installation-status">
            </span>


            <div class="installation-info">

                <div class="installation-name">

                    ${escapeHtml(installation.name)}

                </div>


                <span
                    class="installation-type ${isUze ? "uze" : ""}">

                    ${isUze ? "УЗЕ" : "КГУ"}

                </span>

            </div>


            <div class="installation-actions">


                <button
                    class="installation-action"
                    title="Налаштування"
                    data-edit-installation="${installation.id}">

                    ⚙

                </button>


                <button
                    class="installation-action delete"
                    title="Деактивувати"
                    data-delete-installation="${installation.id}">

                    🗑

                </button>


            </div>


        </div>

    `;
}

/* ======================================================
   INSTALLATION MODAL
====================================================== */

async function openInstallation(id = null) {
  const modal = $("installationModal");

  let installation = null;

  if (id !== null) {
    installation = installations.find((item) => Number(item.id) === Number(id));
  }

  if (installation) {
    modal.dataset.editId = installation.id;

    $("installationModalTitle").textContent = "Налаштування установки";

    $("installationName").value = installation.name;

    $("installationType").value = installation.type;

    $("installationActive").checked = installation.active !== false;

    fillInstallationForm(installation);

    /*
      Графік для відкритої установки
      беремо з PostgreSQL за вибрану дату.
    */
    await loadScheduleFromDatabase(installation, dateKey(selectedDate));

    renderHourlySchedule();
    renderArvchPreview();
  } else {
    modal.dataset.editId = "";

    $("installationModalTitle").textContent = "Нова установка";

    $("installationName").value = "";

    $("installationType").value = "KGU";

    $("installationActive").checked = true;

    clearInstallationForm();
  }

  updateInstallationType();

  renderHourlySchedule();

  renderArvchPreview();

  activateInstallationTab("basic");

  modal.classList.remove("hidden");
}

/* ======================================================
   CLEAR FORM
====================================================== */

function clearInstallationForm() {
  $("kguMinPower").value = "";

  $("kguPower").value = "";

  $("kguMaxPower").value = "";

  $("kguStartupMinutes").value = "";

  $("kguShutdownMinutes").value = "";

  $("kguLoadMinutes").value = "";

  $("kguUnloadMinutes").value = "";

  $("kguLoadPower").value = "";

  $("kguUnloadPower").value = "";

  $("uzeChargePower").value = "";

  $("uzeDischargePower").value = "";

  $("scheduleSource").value = "database";

  $("scheduleAutomatic").checked = true;

  $("scheduleUpdate").checked = true;

  $("autoStart").checked = true;

  $("autoStop").checked = true;

  $("autoLoad").checked = true;

  $("autoUnload").checked = true;

  $("autoManual").checked = true;

  $("autoCharge").checked = true;

  $("autoDischarge").checked = true;

  $("autoPowerChange").checked = true;

  $("arvchEnabled").checked = true;

  $("gasEnabled").checked = true;

  $("gasConsumption").value = "";

  $("nominationTime").value = "09:00";

  $("renominationTime").value = "13:00";

  $("nominationAutomatic").checked = true;

  $("renominationAutomatic").checked = true;
}

/* ======================================================
   FILL FORM
====================================================== */

function fillInstallationForm(installation) {
  const s = installation.settings || {};

  /*
        КГУ
    */

  $("kguMinPower").value = s.minPower ?? "";

  $("kguPower").value = s.power ?? "";

  $("kguMaxPower").value = s.maxPower ?? "";

  $("kguStartupMinutes").value = s.startupMinutes ?? "";

  $("kguShutdownMinutes").value = s.shutdownMinutes ?? "";

  $("kguLoadMinutes").value = s.loadMinutes ?? "";

  $("kguUnloadMinutes").value = s.unloadMinutes ?? "";

  $("kguLoadPower").value = s.loadPower ?? "";

  $("kguUnloadPower").value = s.unloadPower ?? "";

  /*
        УЗЕ
    */

  $("uzeChargePower").value = s.chargePower ?? "";

  $("uzeDischargePower").value = s.dischargePower ?? "";

  /*
        Графік
    */

  $("scheduleSource").value = s.schedule?.source || "database";

  $("scheduleAutomatic").checked = s.schedule?.automatic ?? true;

  $("scheduleUpdate").checked = s.schedule?.update ?? true;

  /*
        Автоматизація
    */

  $("autoStart").checked = s.automation?.start ?? true;

  $("autoStop").checked = s.automation?.stop ?? true;

  $("autoLoad").checked = s.automation?.load ?? true;

  $("autoUnload").checked = s.automation?.unload ?? true;

  $("autoManual").checked = s.automation?.manual ?? true;

  $("autoCharge").checked = s.automation?.charge ?? true;

  $("autoDischarge").checked = s.automation?.discharge ?? true;

  $("autoPowerChange").checked = s.automation?.powerChange ?? true;

  /*
        АРВЧ
    */

  $("arvchEnabled").checked = s.arvch?.enabled ?? true;

  /*
        Газ
    */

  $("gasEnabled").checked = s.gas?.enabled ?? true;

  $("gasConsumption").value = s.gas?.consumption ?? "";

  /*
        Номінація
    */

  $("nominationTime").value = s.nomination?.time || "09:00";

  $("nominationAutomatic").checked = s.nomination?.automatic ?? true;

  /*
        Реномінація
    */

  $("renominationTime").value = s.renomination?.time || "13:00";

  $("renominationAutomatic").checked = s.renomination?.automatic ?? true;
}

/* ======================================================
   UPDATE INSTALLATION TYPE
====================================================== */

function updateInstallationType() {
  const type = $("installationType").value;

  const isKGU = type === "KGU";

  /*
        Основні
    */

  $("kguBasicSettings").classList.toggle("hidden", !isKGU);

  $("uzeBasicSettings").classList.toggle("hidden", isKGU);

  /*
        Автоматизація
    */

  $("kguAutomationSettings").classList.toggle("hidden", !isKGU);

  $("uzeAutomationSettings").classList.toggle("hidden", isKGU);

  /*
        Газ / номінація
    */

  document.querySelectorAll(".kgu-only-tab").forEach((tab) => {
    tab.style.display = isKGU ? "" : "none";
  });

  document.querySelectorAll(".kgu-only-content").forEach((content) => {
    content.style.display = isKGU ? "" : "none";
  });

  /*
        Якщо зараз вибрана вкладка,
        яка доступна тільки КГУ
    */

  const activeTab = document.querySelector(".installation-tab.active");

  if (!isKGU && activeTab && activeTab.classList.contains("kgu-only-tab")) {
    activateInstallationTab("basic");
  }
}

/* ======================================================
   SAVE INSTALLATION
====================================================== */

async function saveInstallation() {
  const modal = $("installationModal");

  const editId = Number(modal.dataset.editId);

  const name = $("installationName").value.trim();

  const type = $("installationType").value;

  if (!name) {
    alert("Введи назву установки.");
    return;
  }

  const hourlySchedule = getHourlySchedule();

  const arvchHours = getArvchHours();

  let settings;

  if (type === "KGU") {
    settings = {
      minPower: numberOrNull($("kguMinPower").value),
      power: numberOrNull($("kguPower").value),
      maxPower: numberOrNull($("kguMaxPower").value),
      startupMinutes: numberOrZero($("kguStartupMinutes").value),
      shutdownMinutes: numberOrZero($("kguShutdownMinutes").value),
      loadMinutes: numberOrZero($("kguLoadMinutes").value),
      unloadMinutes: numberOrZero($("kguUnloadMinutes").value),
      loadPower: numberOrNull($("kguLoadPower").value),
      unloadPower: numberOrNull($("kguUnloadPower").value),

      hourlySchedule,

      schedule: {
        source: $("scheduleSource").value,
        automatic: $("scheduleAutomatic").checked,
        update: $("scheduleUpdate").checked,
      },

      automation: {
        start: $("autoStart").checked,
        stop: $("autoStop").checked,
        load: $("autoLoad").checked,
        unload: $("autoUnload").checked,
        manual: $("autoManual").checked,
      },

      arvch: {
        enabled: $("arvchEnabled").checked,
        hours: arvchHours,
      },

      gas: {
        enabled: $("gasEnabled").checked,
        consumption: numberOrNull($("gasConsumption").value),
      },

      nomination: {
        time: $("nominationTime").value,
        automatic: $("nominationAutomatic").checked,
      },

      renomination: {
        time: $("renominationTime").value,
        automatic: $("renominationAutomatic").checked,
      },
    };
  } else {
    settings = {
      chargePower: numberOrNull($("uzeChargePower").value),
      dischargePower: numberOrNull($("uzeDischargePower").value),

      hourlySchedule,

      schedule: {
        source: $("scheduleSource").value,
        automatic: $("scheduleAutomatic").checked,
        update: $("scheduleUpdate").checked,
      },

      automation: {
        charge: $("autoCharge").checked,
        discharge: $("autoDischarge").checked,
        powerChange: $("autoPowerChange").checked,
      },

      arvch: {
        enabled: $("arvchEnabled").checked,
        hours: arvchHours,
      },
    };
  }

  const active = $("installationActive").checked;

  let installation;

  try {
    if (editId) {
      installation = installations.find((item) => Number(item.id) === editId);

      if (!installation) {
        throw new Error("Установку не знайдено.");
      }

      installation.name = name;
      installation.type = type;
      installation.active = active;
      installation.settings = settings;

      const response = await fetch(`/api/installations/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          active,
          settings,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Не вдалося зберегти установку.");
      }
    } else {
      const response = await fetch("/api/installations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          active,
          settings,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Не вдалося створити установку.");
      }

      installation = {
        id: Number(data.installation.id),
        name: data.installation.name,
        type: data.installation.type,
        active: data.installation.active !== false,
        settings: data.installation.settings || settings,
      };

      installations.push(installation);
    }
  } catch (error) {
    console.error("❌ Збереження установки:", error);

    alert("Не вдалося зберегти налаштування установки.\n\n" + error.message);

    return;
  }

  /*
    Погодинний графік зберігаємо окремо
    у installation_schedule.
  */

  if (installation) {
    const scheduleSaved = await saveScheduleToDatabase(
      installation,
      dateKey(selectedDate),
    );

    if (!scheduleSaved) {
      return;
    }
  }

  closeInstallationModal();

  const newAutomaticTasks = generateAutomaticTasks();

  await saveNewAutomaticTasksToDatabase(newAutomaticTasks);

  renderAll();
}

/* ======================================================
   NUMBERS
====================================================== */

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function numberOrZero(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getNextInstallationId() {
  if (installations.length === 0) {
    return 1;
  }

  return Math.max(...installations.map((item) => item.id)) + 1;
}

/* ======================================================
   DEACTIVATE
====================================================== */

async function deactivateInstallation(id) {
  const installation = installations.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!installation) {
    return;
  }

  if (
    !confirm(
      `Деактивувати установку "${installation.name}"?

` + `Її задачі будуть збережені.`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`/api/installations/${installation.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        active: false,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Не вдалося деактивувати установку.");
    }

    installation.active = false;

    renderAll();
  } catch (error) {
    console.error("❌ Деактивація установки:", error);

    alert("Не вдалося деактивувати установку.\n\n" + error.message);
  }
}

/* ======================================================
   TABS
====================================================== */

function activateInstallationTab(tabName) {
  document.querySelectorAll(".installation-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  document.querySelectorAll(".installation-tab-content").forEach((content) => {
    content.classList.toggle("active", content.dataset.tabContent === tabName);
  });

  if (tabName === "schedule") {
    renderHourlySchedule();
  }

  if (tabName === "arvch") {
    renderArvchPreview();
  }
}

/* ======================================================
   HOURLY SCHEDULE
====================================================== */

function renderHourlySchedule() {
  const container = $("hourlySchedule");

  if (!container) {
    return;
  }

  let html = `

        <div class="schedule-row header">

            <div class="schedule-hour">
                Година
            </div>

            <div class="schedule-value">
                Інтервал / Потужність
            </div>

            <div class="schedule-arvch">
                АРВЧ
            </div>

        </div>

    `;

  /*
    =====================================================
    24 ПОГОДИННІ ІНТЕРВАЛИ

    01 = 00:00–01:00
    02 = 01:00–02:00
    ...
    24 = 23:00–00:00
    =====================================================
    */

  for (let hour = 1; hour <= 24; hour++) {
    const startHour = hour - 1;

    const endHour = hour === 24 ? 0 : hour;

    const startTime = `${String(startHour).padStart(2, "0")}:00`;

    const endTime = `${String(endHour).padStart(2, "0")}:00`;

    const interval = `${startTime}–${endTime}`;

    html += `

            <div class="schedule-row">


                <div class="schedule-hour">

                    ${String(hour).padStart(2, "0")}

                </div>


                <div class="schedule-value">


                    <div
                        style="
                            display:grid;
                            grid-template-columns:110px 1fr;
                            align-items:center;
                            gap:8px;
                        ">


                        <span
                            style="
                                color:#8a92a1;
                                font-size:10px;
                                white-space:nowrap;
                            ">

                            ${interval}

                        </span>


                        <input
                            type="number"
                            step="0.01"
                            data-schedule-hour="${hour}"
                            placeholder="0">

                    </div>


                </div>


                <div class="schedule-arvch">

                    <input
                        type="checkbox"
                        data-arvch-hour="${hour}">

                </div>


            </div>

        `;
  }

  container.innerHTML = html;

  /*
    =====================================================
    ВІДНОВЛЮЄМО ЗБЕРЕЖЕНІ ЗНАЧЕННЯ
    =====================================================
    */

  const installation = getEditingInstallation();

  if (!installation) {
    return;
  }

  /*
    Графік

    Важливо:
    hour тепер 1..24,
    а не 0..23.
    */

  const schedule = installation.settings?.hourlySchedule || [];

  schedule.forEach((item) => {
    const input = container.querySelector(
      `[data-schedule-hour="${item.hour}"]`,
    );

    if (input) {
      input.value = item.value ?? "";
    }
  });

  /*
    =====================================================
    АРВЧ

    Так само використовуємо 1..24
    =====================================================
    */

  const arvchHours = installation.settings?.arvch?.hours || [];

  arvchHours.forEach((hour) => {
    const checkbox = container.querySelector(`[data-arvch-hour="${hour}"]`);

    if (checkbox) {
      checkbox.checked = true;
    }
  });
}

/* ======================================================
   READ HOURLY SCHEDULE
====================================================== */

function getHourlySchedule() {
  const result = [];

  document.querySelectorAll("[data-schedule-hour]").forEach((input) => {
    const hour = Number(input.dataset.scheduleHour);

    const value = input.value === "" ? 0 : Number(input.value);

    const startHour = hour - 1;

    const endHour = hour === 24 ? 0 : hour;

    result.push({
      /*
                01–24
                */

      hour,

      /*
                Наприклад:
                01 = 00:00–01:00
                24 = 23:00–00:00
                */

      start: `${String(startHour).padStart(2, "0")}:00`,

      end: `${String(endHour).padStart(2, "0")}:00`,

      interval:
        `${String(startHour).padStart(2, "0")}:00–` +
        `${String(endHour).padStart(2, "0")}:00`,

      value: Number.isFinite(value) ? value : 0,
    });
  });

  return result;
}

/* ======================================================
   ARVCH HOURS
====================================================== */

function getArvchHours() {
  return Array.from(document.querySelectorAll("[data-arvch-hour]:checked"))
    .map((checkbox) => Number(checkbox.dataset.arvchHour))
    .sort((a, b) => a - b);
}

/* ======================================================
   ARVCH PREVIEW
====================================================== */

function renderArvchPreview() {
  const container = $("arvchPreview");

  if (!container) {
    return;
  }

  const installation = getEditingInstallation();

  const selectedHours = installation?.settings?.arvch?.hours || [];

  let html = "";

  for (let hour = 1; hour <= 24; hour++) {
    const active = selectedHours.includes(hour);

    const startHour = hour - 1;
    const endHour = hour === 24 ? 0 : hour;

    const interval =
      `${String(startHour).padStart(2, "0")}:00–` +
      `${String(endHour).padStart(2, "0")}:00`;

    html += `
      <div class="arvch-row ${active ? "active" : ""}">
        <span>${String(hour).padStart(2, "0")} · ${interval}</span>
        <span class="arvch-status">
          ${active ? "АРВЧ" : "Звичайний режим"}
        </span>
      </div>
    `;
  }

  container.innerHTML = html;
}

/* ======================================================
   EDITING INSTALLATION
====================================================== */

function getEditingInstallation() {
  const id = Number($("installationModal")?.dataset.editId);

  if (!id) {
    return null;
  }

  return installations.find((item) => item.id === id) || null;
}

/* ======================================================
   CALENDAR
====================================================== */

function renderCalendar() {
  $("calendarMonth").textContent = calendarMonth.toLocaleDateString("uk-UA", {
    month: "long",
    year: "numeric",
  });

  const year = calendarMonth.getFullYear();

  const month = calendarMonth.getMonth();

  const first = new Date(year, month, 1);

  let startDay = first.getDay();

  startDay = startDay === 0 ? 6 : startDay - 1;

  const days = new Date(year, month + 1, 0).getDate();

  const previousDays = new Date(year, month, 0).getDate();

  let html = "";

  for (let i = startDay - 1; i >= 0; i--) {
    const day = previousDays - i;

    const date = new Date(year, month - 1, day);

    html += `

            <div
                class="calendar-day muted"
                data-date="${dateKey(date)}">

                ${day}

            </div>

        `;
  }

  for (let day = 1; day <= days; day++) {
    const date = new Date(year, month, day);

    let classes = "calendar-day";

    if (sameDay(date, selectedDate)) {
      classes += " selected";
    }

    if (sameDay(date, new Date())) {
      classes += " today";
    }

    html += `

            <div
                class="${classes}"
                data-date="${dateKey(date)}">

                ${day}

            </div>

        `;
  }

  const total = Math.ceil((startDay + days) / 7) * 7;

  const remaining = total - startDay - days;

  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day);

    html += `

            <div
                class="calendar-day muted"
                data-date="${dateKey(date)}">

                ${day}

            </div>

        `;
  }

  $("calendarDays").innerHTML = html;

  document.querySelectorAll(".calendar-day").forEach((day) => {
    day.addEventListener("click", () => {
      const [y, m, d] = day.dataset.date.split("-").map(Number);

      selectedDate = new Date(y, m - 1, d);

      calendarMonth = new Date(y, m - 1, 1);

      renderAll();
      loadSchedulesForSelectedDate();
    });
  });
}

/* ======================================================
   TASK NOTIFICATION SOUND
====================================================== */

let audioContext = null;

const announcedActiveTasks = new Set();
const announcedOverdueTasks = new Set();

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return null;
    }

    audioContext = new AudioContext();
  }

  return audioContext;
}

/*
   Короткий сигнал:
   2 ноти для нового активного завдання
*/

function playNewTaskSound() {
  const ctx = getAudioContext();

  if (!ctx) {
    return;
  }

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";

  oscillator.frequency.setValueAtTime(880, now);

  oscillator.frequency.setValueAtTime(1175, now + 0.12);

  gain.gain.setValueAtTime(0.0001, now);

  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);

  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.35);
}

/*
   Інший сигнал:
   3 короткі ноти для простроченого завдання
*/

function playOverdueTaskSound() {
  const ctx = getAudioContext();

  if (!ctx) {
    return;
  }

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const frequencies = [660, 520, 660];

  frequencies.forEach((frequency, index) => {
    const start = ctx.currentTime + index * 0.13;

    const oscillator = ctx.createOscillator();

    const gain = ctx.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);

    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.015);

    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(start);
    oscillator.stop(start + 0.12);
  });
}

/*
   Перевірка появи нових активних
   та прострочених задач
*/

function checkTaskNotifications() {
  const active = getActiveTasks();

  const overdue = getOverdueTasks();

  /*
    НОВІ АКТИВНІ
  */

  for (const task of active) {
    const taskKey = String(task.id);

    if (!announcedActiveTasks.has(taskKey)) {
      announcedActiveTasks.add(taskKey);

      playNewTaskSound();

      console.log("🔔 Нове активне завдання:", task.name);
    }
  }

  /*
    ПРОСТРОЧЕНІ
  */

  for (const task of overdue) {
    const taskKey = String(task.id);

    if (!announcedOverdueTasks.has(taskKey)) {
      announcedOverdueTasks.add(taskKey);

      playOverdueTaskSound();

      console.log("⚠️ Завдання прострочене:", task.name);
    }
  }
}

/* ======================================================
   TASKS
====================================================== */

function getActiveTasks() {
  if (!sameDay(selectedDate, new Date())) {
    return [];
  }

  const now = getCurrentMinutes();

  return tasks.filter((task) => {
    if (task.status === "completed") {
      return false;
    }

    const start = timeToMinutes(task.start);

    const end = timeToMinutes(task.end);

    return start <= now && now < end;
  });
}

function getOverdueTasks() {
  if (!sameDay(selectedDate, new Date())) {
    return [];
  }

  const now = getCurrentMinutes();

  return tasks.filter((task) => {
    if (task.status === "completed") {
      return false;
    }

    return timeToMinutes(task.end) <= now;
  });
}

/* ======================================================
   SIDEBAR TASKS
====================================================== */

function renderSidebarTasks() {
  const active = getActiveTasks();

  const overdue = getOverdueTasks();

  $("activeCount").textContent = active.length;

  $("overdueCount").textContent = overdue.length;

  $("activeTasks").innerHTML = active.length
    ? active.map(createActiveTaskCard).join("")
    : `

                <div class="empty">
                    Зараз немає активних задач
                </div>

            `;

  $("overdueTasks").innerHTML = overdue.length
    ? overdue.map(createOverdueTaskCard).join("")
    : `

                <div class="empty">
                    Протермінованих задач немає
                </div>

            `;

  document.querySelectorAll("[data-complete-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      completeTask(Number(button.dataset.completeId));
    });
  });
}

function createActiveTaskCard(task) {
  const installation = installations.find(
    (item) => item.id === task.installationId,
  );

  const name = installation ? installation.name : "Установка видалена";

  const now = getCurrentMinutes();

  const start = timeToMinutes(task.start);

  const end = timeToMinutes(task.end);

  const percent =
    end > start
      ? Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100))
      : 0;

  return `

        <div class="task-card">

            <div class="task-name">

                ${escapeHtml(task.name)}

            </div>


            <div class="task-installation">

                ${escapeHtml(name)}

            </div>


            <div class="task-time">

                ${task.start}
                —
                ${task.end}

            </div>


            <div class="progress">

                <span
                    style="width:${percent}%">
                </span>

            </div>


            <button
                class="complete-button"
                data-complete-id="${task.id}">

                ✓ Виконано

            </button>

        </div>

    `;
}

function createOverdueTaskCard(task) {
  const installation = installations.find(
    (item) => item.id === task.installationId,
  );

  const name = installation ? installation.name : "Установка видалена";

  const overdue = Math.max(0, getCurrentMinutes() - timeToMinutes(task.end));

  return `

        <div class="task-card">

            <div class="task-name">

                ${escapeHtml(task.name)}

            </div>


            <div class="task-installation">

                ${escapeHtml(name)}

            </div>


            <div class="task-time">

                Протерміновано на
                ${formatMinutes(overdue)}

            </div>


            <button
                class="complete-button overdue-button"
                data-complete-id="${task.id}">

                ✓ Виконано

            </button>

        </div>

    `;
}

/* ======================================================
   COMPLETE TASK
====================================================== */

async function completeTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return;
  }

  /*
    Якщо задача ще не має ID з PostgreSQL,
    її неможливо оновити в БД.
  */

  if (!Number.isInteger(Number(task.id))) {
    console.error("❌ У задачі немає коректного ID:", task);

    return;
  }

  /*
    Не дозволяємо повторно підтверджувати
    вже виконану задачу.
  */

  if (task.status === "completed") {
    return;
  }

  try {
    const response = await fetch(`/api/tasks/${encodeURIComponent(task.id)}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status: "completed",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    /*
      БД підтвердила зміну.
      Тільки після успішного запису
      змінюємо локальний стан.
    */

    task.status = "completed";

    console.log(`✅ Задачу ${task.id} виконано та збережено в БД`);

    renderAll();
  } catch (error) {
    console.error("❌ Не вдалося зберегти виконання задачі:", error);

    alert("Не вдалося зберегти виконання задачі в базі даних.");
  }
}

/* ======================================================
   TIMELINE
====================================================== */

function renderTimeline() {
  $("currentDateTitle").textContent = sameDay(selectedDate, new Date())
    ? "Сьогодні"
    : formatDate(selectedDate);

  const active = getActiveInstallations();

  $("installationHeaders").innerHTML = active
    .map(
      (installation) => `

                    <div class="installation-header">

                        ${escapeHtml(installation.name)}

                    </div>

                `,
    )
    .join("");

  let timeHTML = "";

  for (let hour = 0; hour < 24; hour++) {
    timeHTML += `

            <div
                class="time-mark"
                style="top:${hour * 72}px">

                ${String(hour).padStart(2, "0")}:00

            </div>

        `;
  }

  $("timeColumn").innerHTML = timeHTML;

  $("installationGrid").innerHTML = active
    .map(createInstallationColumn)
    .join("");

  updateCurrentTimeLine();

  document.querySelectorAll(".task-block").forEach((block) => {
    block.addEventListener("click", () => {
      openTask(Number(block.dataset.taskId));
    });
  });
}

function createInstallationColumn(installation) {
  const installationTasks = tasks.filter(
    (task) => task.installationId === installation.id,
  );

  return `

        <div class="installation-column">

            ${installationTasks.map(createTaskBlock).join("")}

        </div>

    `;
}

function createTaskBlock(task) {
  const start = timeToMinutes(task.start);

  const end = timeToMinutes(task.end);

  const top = (start / 60) * 72;

  const height = Math.max(34, ((end - start) / 60) * 72 - 5);

  let className = "task-block";

  if (task.status === "completed") {
    className += " completed";
  } else if (sameDay(selectedDate, new Date())) {
    const now = getCurrentMinutes();

    if (start <= now && now < end) {
      className += " active";
    } else if (end < now) {
      className += " overdue";
    }
  }

  return `

        <div
            class="${className}"
            data-task-id="${task.id}"

            style="
                top:${top}px;
                height:${height}px;
            ">


            <strong>

                ${escapeHtml(task.name)}

            </strong>


            <span>

                ${task.start}
                —
                ${task.end}

            </span>


        </div>

    `;
}

/* ======================================================
   CURRENT TIME
====================================================== */

function updateCurrentTimeLine() {
  if (!sameDay(selectedDate, new Date())) {
    $("currentTimeLine").style.display = "none";

    return;
  }

  const top = (getCurrentMinutes() / 60) * 72;

  $("currentTimeLine").style.top = `${top}px`;

  $("currentTimeLine").style.display = "block";
}

/* ======================================================
   TASK MODAL
====================================================== */

function openTask(id = null) {
  const active = getActiveInstallations();

  if (!active.length) {
    alert("Спочатку додай активну установку.");

    return;
  }

  $("taskInstallation").innerHTML = active
    .map(
      (installation) => `

                    <option
                        value="${installation.id}">

                        ${escapeHtml(installation.name)}

                    </option>

                `,
    )
    .join("");

  const task = id ? tasks.find((item) => item.id === id) : null;

  if (task) {
    $("modalTitle").textContent = "Редагування задачі";

    $("taskInstallation").value = task.installationId;

    $("taskName").value = task.name;

    $("taskStart").value = task.start;

    $("taskEnd").value = task.end;

    $("taskDescription").value = task.description || "";

    $("taskModal").dataset.editId = task.id;
  } else {
    $("modalTitle").textContent = "Нова задача";

    $("taskInstallation").value = active[0].id;

    $("taskName").value = "";

    $("taskStart").value = "10:00";

    $("taskEnd").value = "11:00";

    $("taskDescription").value = "";

    $("taskModal").dataset.editId = "";
  }

  $("taskModal").classList.remove("hidden");
}

/* ======================================================
   SAVE TASK
====================================================== */

async function saveTask() {
  const editId = Number($("taskModal").dataset.editId);

  const installationId = Number($("taskInstallation").value);

  const name = $("taskName").value.trim();

  const start = $("taskStart").value;

  const end = $("taskEnd").value;

  const description = $("taskDescription").value.trim();

  const recordDate = dateKey(selectedDate);

  if (!name) {
    alert("Введи назву задачі.");
    return;
  }

  if (timeToMinutes(end) <= timeToMinutes(start)) {
    alert("Час завершення має бути пізніше часу початку.");
    return;
  }

  try {
    /*
      =====================================================
      РЕДАГУВАННЯ ІСНУЮЧОЇ ЗАДАЧІ
      =====================================================
    */

    if (editId) {
      const index = tasks.findIndex((task) => Number(task.id) === editId);

      if (index === -1) {
        alert("Задачу не знайдено.");
        return;
      }

      const response = await fetch(`/api/tasks/${encodeURIComponent(editId)}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          installation_id: installationId,
          record_date: recordDate,
          name,
          start_time: start,
          end_time: end,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      tasks[index] = {
        ...tasks[index],

        installationId,
        name,
        start,
        end,
        description,
      };

      /*
      =====================================================
      СТВОРЕННЯ НОВОЇ РУЧНОЇ ЗАДАЧІ
      =====================================================
    */
    } else {
      const response = await fetch("/api/tasks", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          installation_id: installationId,

          record_date: recordDate,

          name,

          start_time: start,

          end_time: end,

          description,

          status: "planned",

          task_type: "manual",

          is_automatic: false,

          task_key: null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      /*
        Беремо справжній ID із PostgreSQL.
      */

      const savedTask = data.task;

      tasks.push({
        id: Number(savedTask.id),

        installationId:
          savedTask.installation_id !== null
            ? Number(savedTask.installation_id)
            : null,

        name: savedTask.name,

        start: String(savedTask.start_time).slice(0, 5),

        end: String(savedTask.end_time).slice(0, 5),

        description: savedTask.description || "",

        status: savedTask.status || "planned",

        taskType: savedTask.task_type || "manual",

        generated: Boolean(savedTask.is_automatic),

        automatic: Boolean(savedTask.is_automatic),

        taskKey: savedTask.task_key || null,

        recordDate: savedTask.record_date,
      });

      console.log("✅ Ручну задачу збережено в БД:", savedTask);
    }

    closeModal();

    renderAll();
  } catch (error) {
    console.error("❌ Не вдалося зберегти задачу:", error);

    alert("Не вдалося зберегти задачу в базі даних.\n\n" + error.message);
  }
}

/* ======================================================
   CLOSE MODALS
====================================================== */

function closeModal() {
  $("taskModal").classList.add("hidden");
}

function closeInstallationModal() {
  $("installationModal").classList.add("hidden");
}

/* ======================================================
   DAY NAVIGATION
====================================================== */

function goToday() {
  selectedDate = new Date();

  selectedDate.setHours(0, 0, 0, 0);

  calendarMonth = new Date(
    selectedDate.getFullYear(),

    selectedDate.getMonth(),

    1,
  );

  renderAll();
  loadSchedulesForSelectedDate();
}

$("prevDay").addEventListener("click", async () => {
  selectedDate.setDate(selectedDate.getDate() - 1);

  renderAll();
  await loadSchedulesForSelectedDate();
});

$("nextDay").addEventListener("click", async () => {
  selectedDate.setDate(selectedDate.getDate() + 1);

  renderAll();
  await loadSchedulesForSelectedDate();
});

$("todayButton").addEventListener("click", goToday);

$("mainToday").addEventListener("click", goToday);

/* ======================================================
   MONTH NAVIGATION
====================================================== */

$("prevMonth").addEventListener("click", () => {
  calendarMonth.setMonth(calendarMonth.getMonth() - 1);

  renderCalendar();
});

$("nextMonth").addEventListener("click", () => {
  calendarMonth.setMonth(calendarMonth.getMonth() + 1);

  renderCalendar();
});

/* ======================================================
   INSTALLATION
====================================================== */

$("addInstallation").addEventListener("click", () => {
  openInstallation();
});

$("closeInstallationModal").addEventListener("click", closeInstallationModal);

$("cancelInstallation").addEventListener("click", closeInstallationModal);

$("saveInstallation").addEventListener("click", saveInstallation);

$("installationType").addEventListener("change", () => {
  updateInstallationType();

  renderHourlySchedule();

  renderArvchPreview();
});

/* ======================================================
   TABS EVENTS
====================================================== */

document.querySelectorAll(".installation-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activateInstallationTab(tab.dataset.tab);
  });
});

/* ======================================================
   HOURLY SCHEDULE EVENTS
====================================================== */

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-arvch-hour]")) {
    renderArvchPreview();
  }
});

/* ======================================================
   TASK EVENTS
====================================================== */

$("newTask").addEventListener("click", () => {
  openTask();
});

$("closeModal").addEventListener("click", closeModal);

$("cancelModal").addEventListener("click", closeModal);

$("saveTask").addEventListener("click", saveTask);

/* ======================================================
   ESC
====================================================== */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();

    closeInstallationModal();
  }
});

/* ======================================================
   CLICK OUTSIDE MODALS
====================================================== */

$("taskModal").addEventListener("click", (event) => {
  if (event.target === $("taskModal")) {
    closeModal();
  }
});

$("installationModal").addEventListener("click", (event) => {
  if (event.target === $("installationModal")) {
    closeInstallationModal();
  }
});

/* ======================================================
   DATABASE INTEGRATION
====================================================== */

async function loadInstallationsFromDatabase() {
  try {
    const response = await fetch("/api/installations");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    const templates = installations;

    installations = data.installations.map((dbInstallation) => {
      const existing = templates.find(
        (item) => Number(item.id) === Number(dbInstallation.id),
      );

      return {
        id: Number(dbInstallation.id),
        name: dbInstallation.name,
        type: dbInstallation.type,
        active: dbInstallation.active !== false,
        settings:
          dbInstallation.settings && Object.keys(dbInstallation.settings).length
            ? dbInstallation.settings
            : existing?.settings || {},
      };
    });

    console.log("✅ Установки завантажено з БД:", installations);

    return true;
  } catch (error) {
    console.error("❌ Помилка завантаження установок:", error);
    return false;
  }
}

async function loadScheduleFromDatabase(installation, date) {
  try {
    const response = await fetch(
      `/api/schedule/${encodeURIComponent(installation.id)}/${encodeURIComponent(date)}`,
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    installation.settings = installation.settings || {};

    installation.settings.hourlySchedule = data.schedule.map((item) => ({
      hour: Number(item.hour),
      start: item.start,
      end: item.end,
      value: Number(item.value) || 0,
    }));

    return true;
  } catch (error) {
    console.error(
      `❌ Помилка завантаження графіка ${installation.name}:`,
      error,
    );
    return false;
  }
}

/* ======================================================
   SAVE NEW AUTOMATIC TASKS TO DATABASE
====================================================== */

async function saveNewAutomaticTasksToDatabase(newTasks) {
  if (!Array.isArray(newTasks)) {
    return;
  }

  /*
    Якщо нових задач немає —
    нічого не робимо.
  */

  if (!newTasks.length) {
    return;
  }

  const date = dateKey(selectedDate);

  for (const task of newTasks) {
    /*
      Автоматична задача повинна мати
      taskKey для захисту від дублювання.
    */

    if (!task.taskKey) {
      console.warn("⚠️ Автоматична задача без taskKey:", task);

      continue;
    }

    /*
      Визначаємо установку.
    */

    const installation = installations.find(
      (item) => Number(item.id) === Number(task.installationId),
    );

    if (!installation) {
      console.warn("⚠️ Установку для задачі не знайдено:", task);

      continue;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          installation_id: Number(task.installationId),

          record_date: date,

          name: task.name,

          start_time: task.start,

          end_time: task.end,

          description: task.description || "",

          status: task.status || "planned",

          task_type: task.taskType || "automatic",

          is_automatic: true,

          task_key: task.taskKey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      /*
        PostgreSQL повернув справжній ID.
      */

      if (data.task?.id) {
        task.id = Number(data.task.id);
      }

      /*
        Зберігаємо taskKey,
        який прийшов від БД.
      */

      task.taskKey = data.task?.task_key || task.taskKey;

      console.log("✅ Автоматичну задачу збережено:", task);
    } catch (error) {
      console.error("❌ Не вдалося зберегти автоматичну задачу:", task, error);
    }
  }
}

async function loadSchedulesForSelectedDate() {
  const date = dateKey(selectedDate);

  const active = getActiveInstallations();

  /*
    1. Завантажуємо погодинні графіки
  */

  await Promise.all(
    active.map((installation) => loadScheduleFromDatabase(installation, date)),
  );

  /*
    2. Завантажуємо вже збережені задачі
    з PostgreSQL
  */

  await loadTasksFromDatabase(date);

  /*
    3. Генеруємо автоматичні задачі.

    Тут важливо:
    generateAutomaticTasks() більше НЕ повинен
    просто видаляти всі старі автоматичні задачі.

    Наступним кроком ми змінимо його так,
    щоб він порівнював taskKey.
  */

  const generatedTasks = generateAutomaticTasks();

  await saveNewAutomaticTasksToDatabase(generatedTasks);

  /*
  4. Відображаємо результат
*/

  renderAll();
}

/* ======================================================
   LOAD TASKS FROM DATABASE
====================================================== */

async function loadTasksFromDatabase(date) {
  try {
    const response = await fetch(`/api/tasks/${encodeURIComponent(date)}`);

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    /*
      Перетворюємо формат БД у формат,
      який використовує існуючий планер.
    */

    tasks = data.tasks.map((task) => ({
      id: Number(task.id),

      installationId:
        task.installation_id !== null ? Number(task.installation_id) : null,

      name: task.name,

      start: String(task.start_time).slice(0, 5),

      end: String(task.end_time).slice(0, 5),

      description: task.description || "",

      status: task.status || "planned",

      taskType: task.task_type || "manual",

      generated: Boolean(task.is_automatic),

      automatic: Boolean(task.is_automatic),

      taskKey: task.task_key || null,

      recordDate: task.record_date,
    }));

    console.log("✅ Задачі завантажено з БД:", tasks);

    return true;
  } catch (error) {
    console.error("❌ Помилка завантаження задач:", error);

    /*
      Якщо БД задач недоступна,
      не стираємо поточний стан без пояснення.
    */

    return false;
  }
}

async function saveScheduleToDatabase(installation, date) {
  try {
    const schedule = installation.settings?.hourlySchedule || [];

    const response = await fetch("/api/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        installation_id: Number(installation.id),
        record_date: date,
        schedule: schedule.map((item) => ({
          hour: Number(item.hour),
          value: Number(item.value) || 0,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("❌ Помилка збереження графіка:", error);

    alert("Не вдалося зберегти погодинний графік у БД.\n\n" + error.message);

    return false;
  }
}

async function initializeDatabasePlanner() {
  console.log("🔄 Підключення планувальника до БД...");

  const loaded = await loadInstallationsFromDatabase();

  if (!loaded) {
    renderAll();
    return;
  }

  await loadSchedulesForSelectedDate();

  console.log("✅ Планувальник синхронізовано з БД");
}

/* ======================================================
   RENDER ALL
====================================================== */

function renderAll() {
  renderCalendar();

  renderInstallations();

  renderSidebarTasks();

  renderTimeline();
}

/* ======================================================
   AUTO UPDATE
====================================================== */

setInterval(() => {
  renderSidebarTasks();

  renderTimeline();

  checkTaskNotifications();
}, 1000);

/* ======================================================
   LOAD / UNLOAD POWER MODAL
====================================================== */

let powerChangeMode = "load";

function openPowerChangeModal(mode) {
  powerChangeMode = mode;

  const modal = $("powerChangeModal");

  const title = $("powerChangeModalTitle");

  /*
    Назва операції
  */

  if (mode === "load") {
    title.textContent = "Завантаження";
  } else {
    title.textContent = "Розвантаження";
  }

  /*
    Чистимо попередній вибір
  */

  const container = $("powerChangeInstallations");

  container.innerHTML = "";

  /*
    Показуємо тільки КГУ
  */

  const kguInstallations = installations.filter(
    (installation) =>
      installation.type === "KGU" && installation.active !== false,
  );

  /*
    Створюємо чекбокси
  */

  kguInstallations.forEach((installation) => {
    const settings = installation.settings || {};

    const power =
      mode === "load"
        ? Number(settings.loadPower || 0)
        : Number(settings.unloadPower || 0);

    const row = document.createElement("label");

    row.className = "power-change-installation";

    row.innerHTML = `
        <input
          type="checkbox"
          class="power-change-checkbox"
          value="${installation.id}">
          
        <span>
          ${escapeHtml(installation.name)}
        </span>

        <span class="power-change-value">
          ${power > 0 ? `${power} кВт` : "не задано"}
        </span>
      `;

    container.appendChild(row);
  });

  /*
    Очищаємо попередній preview
  */

  if ($("powerChangePreview")) {
    $("powerChangePreview").innerHTML = "";
  }

  /*
    Відкриваємо модалку
  */

  modal.classList.remove("hidden");

  /*
    Оновлюємо preview при зміні
    часу або установок
  */

  updatePowerChangePreview();
}

/* ======================================================
   POWER CHANGE PREVIEW
====================================================== */

function updatePowerChangePreview() {
  const container = $("powerChangePreview");

  if (!container) {
    return;
  }

  const selected = Array.from(
    document.querySelectorAll(".power-change-checkbox:checked"),
  );

  if (!selected.length) {
    container.innerHTML = "Оберіть установки.";

    return;
  }

  const mode = powerChangeMode;

  const lines = selected
    .map((checkbox) => {
      const installation = installations.find(
        (item) => Number(item.id) === Number(checkbox.value),
      );

      if (!installation) {
        return "";
      }

      const settings = installation.settings || {};

      const power =
        mode === "load"
          ? Number(settings.loadPower || 0)
          : Number(settings.unloadPower || 0);

      const sign = mode === "load" ? "+" : "-";

      return `
          <div>
            <strong>
              ${escapeHtml(installation.name)}
            </strong>
            →
            ${sign}${power} кВт
          </div>
        `;
    })
    .join("");

  container.innerHTML = lines;
}

/* ======================================================
   CLOSE POWER CHANGE MODAL
====================================================== */

function closePowerChangeModal() {
  $("powerChangeModal").classList.add("hidden");
}

/* ======================================================
   POWER CHANGE EVENTS
====================================================== */

$("loadPowerButton").addEventListener("click", () => {
  openPowerChangeModal("load");
});

$("unloadPowerButton").addEventListener("click", () => {
  openPowerChangeModal("unload");
});

$("closePowerChangeModal").addEventListener("click", closePowerChangeModal);

$("cancelPowerChange").addEventListener("click", closePowerChangeModal);

$("powerChangeModal").addEventListener("click", (event) => {
  if (event.target === $("powerChangeModal")) {
    closePowerChangeModal();
  }
});

/*
  Оновлення preview
*/

$("powerChangeInstallations").addEventListener(
  "change",
  updatePowerChangePreview,
);

$("powerChangeStart").addEventListener("change", updatePowerChangePreview);

$("powerChangeEnd").addEventListener("change", updatePowerChangePreview);

/* ======================================================
   START
====================================================== */

renderAll();

initializeDatabasePlanner();

/* ======================================================
   АВТОМАТИЧНЕ ФОРМУВАННЯ ЗАДАЧ
====================================================== */

/*
=========================================================
ОТРИМАННЯ ГРАФІКА УСТАНОВКИ

hour:
1  = 00:00–01:00
2  = 01:00–02:00
...
24 = 23:00–00:00
=========================================================
*/

function getInstallationSchedule(installation) {
  const schedule = installation.settings?.hourlySchedule || [];

  const result = [];

  for (let hour = 1; hour <= 24; hour++) {
    const existing = schedule.find((item) => Number(item.hour) === hour);

    result.push({
      hour,

      startMinutes: (hour - 1) * 60,

      endMinutes: hour * 60,

      value: existing ? Number(existing.value) || 0 : 0,

      arvch: installation.settings?.arvch?.hours?.includes(hour) || false,
    });
  }

  return result;
}

/*
=========================================================
СТВОРЕННЯ АВТОМАТИЧНОЇ ЗАДАЧІ
=========================================================
*/

function createAutomaticTask(
  installation,
  name,
  startMinutes,
  endMinutes,
  extra = {},
) {
  /*
    Не допускаємо вихід за межі доби.
  */

  startMinutes = Math.max(0, Math.min(1439, startMinutes));

  endMinutes = Math.max(startMinutes + 1, Math.min(1440, endMinutes));

  const start = minutesToTime(startMinutes);

  const end = endMinutes >= 1440 ? "00:00" : minutesToTime(endMinutes);

  /*
    Стабільний ключ автоматичної задачі.

    Він потрібен для того, щоб після перезавантаження
    або повторної генерації ми могли зрозуміти,
    що це саме та сама задача, а не нова.
  */

  const taskType = extra.taskType || "automatic";

  let taskKey;

  if (taskType === "nomination" || taskType === "renomination") {
    /*
    Номінація та реномінація є постійними
    щоденними задачами для конкретної установки.

    Час НЕ включаємо в taskKey,
    щоб при зміні часу стара задача
    оновлювалася, а не створювалася нова.
  */

    taskKey = [dateKey(selectedDate), installation.id, taskType].join("|");
  } else {
    /*
    Для всіх інших автоматичних задач
    залишаємо стару логіку.
  */

    taskKey = [
      dateKey(selectedDate),
      installation.id,
      taskType,
      start,
      end,
      name,
      extra.powerFrom ?? "",
      extra.powerTo ?? "",
    ].join("|");
  }

  return {
    /*
      Поки задача ще не збережена в БД,
      ID буде null.

      Справжній ID PostgreSQL з'явиться
      після збереження задачі.
    */

    id: null,

    taskKey,

    installationId: installation.id,

    name,

    start,

    end,

    status: "planned",

    automatic: true,

    generated: true,

    description: extra.description || "",

    taskType: extra.taskType || "automatic",

    powerFrom: extra.powerFrom ?? null,

    powerTo: extra.powerTo ?? null,
  };
}

/*
=========================================================
УЗЕ
=========================================================
*/

function generateUzeTasks(installation) {
  const schedule = getInstallationSchedule(installation);

  const generated = [];

  let previousValue = 0;

  let previousMode = "stop";

  for (const hour of schedule) {
    const value = Number(hour.value) || 0;

    /*
        =================================================
        ПОТОЧНИЙ РЕЖИМ

        + = РОЗРЯД
        - = ЗАРЯД
        0 = СТОП
        =================================================
        */

    let currentMode = "stop";

    if (value > 0) {
      currentMode = "discharge";
    } else if (value < 0) {
      currentMode = "charge";
    }

    const currentPower = Math.abs(value);

    const previousPower = Math.abs(previousValue);

    /*
        =================================================
        1. 0 → РОБОТА
        =================================================
        */

    if (previousMode === "stop" && currentMode !== "stop") {
      generated.push(
        createAutomaticTask(
          installation,

          currentMode === "discharge"
            ? `Запустити розряд УЗЕ на ${currentPower} кВт`
            : `Запустити заряд УЗЕ на ${currentPower} кВт`,

          hour.startMinutes,

          hour.startMinutes + 1,

          {
            taskType:
              currentMode === "discharge" ? "discharge-start" : "charge-start",

            powerTo: currentPower,
          },
        ),
      );
    } else if (previousMode !== "stop" && currentMode === "stop") {
      /*
        =================================================
        2. РОБОТА → 0
        =================================================
        */
      generated.push(
        createAutomaticTask(
          installation,

          previousMode === "discharge"
            ? "Зупинити розряд УЗЕ"
            : "Зупинити заряд УЗЕ",

          hour.startMinutes,

          hour.startMinutes + 1,

          {
            taskType:
              previousMode === "discharge" ? "discharge-stop" : "charge-stop",

            powerFrom: previousPower,
          },
        ),
      );
    } else if (
      /*
        =================================================
        3. ЗМІНА РЕЖИМУ

        РОЗРЯД → ЗАРЯД
        або
        ЗАРЯД → РОЗРЯД
        =================================================
        */
      previousMode !== "stop" &&
      currentMode !== "stop" &&
      previousMode !== currentMode
    ) {
      /*
            Спочатку зупиняємо
            попередній режим.
            */

      generated.push(
        createAutomaticTask(
          installation,

          previousMode === "discharge"
            ? "Зупинити розряд УЗЕ"
            : "Зупинити заряд УЗЕ",

          hour.startMinutes,

          hour.startMinutes + 1,

          {
            taskType: "mode-stop",

            powerFrom: previousPower,
          },
        ),
      );

      /*
            Потім запускаємо
            новий режим.
            */

      generated.push(
        createAutomaticTask(
          installation,

          currentMode === "discharge"
            ? `Запустити розряд УЗЕ на ${currentPower} кВт`
            : `Запустити заряд УЗЕ на ${currentPower} кВт`,

          hour.startMinutes,

          hour.startMinutes + 1,

          {
            taskType: "mode-start",

            powerTo: currentPower,
          },
        ),
      );
    } else if (
      /*
        =================================================
        4. ЗМІНА ПОТУЖНОСТІ

        Наприклад:

        200 → 500
        500 → 300

        Створюємо ОКРЕМУ задачу.
        =================================================
        */
      currentMode !== "stop" &&
      previousMode === currentMode &&
      previousPower !== currentPower
    ) {
      const increasing = currentPower > previousPower;

      generated.push(
        createAutomaticTask(
          installation,

          increasing
            ? `Збільшити ${currentMode === "discharge" ? "розряд" : "заряд"} ${previousPower} → ${currentPower} кВт`
            : `Зменшити ${currentMode === "discharge" ? "розряд" : "заряд"} ${previousPower} → ${currentPower} кВт`,

          hour.startMinutes,

          hour.startMinutes + 1,

          {
            taskType: increasing ? "power-increase" : "power-decrease",

            powerFrom: previousPower,

            powerTo: currentPower,
          },
        ),
      );
    }

    /*
        =================================================
        5. АРВЧ

        Перехід у/з АРВЧ
        =================================================
        */

    /*
        Вхід в АРВЧ
        */

    if (hour.arvch && !schedule[hour.hour - 2]?.arvch) {
      generated.push(
        createAutomaticTask(
          installation,

          "Перевести УЗЕ в АРВЧ",

          hour.startMinutes,

          hour.startMinutes + 1,

          {
            taskType: "arvch-start",
          },
        ),
      );
    }

    /*
        Вихід з АРВЧ
        */

    if (!hour.arvch && schedule[hour.hour - 2]?.arvch) {
      generated.push(
        createAutomaticTask(
          installation,

          "Вивести УЗЕ з АРВЧ",

          hour.startMinutes,

          hour.startMinutes + 1,

          {
            taskType: "arvch-stop",
          },
        ),
      );
    }

    previousValue = value;

    previousMode = currentMode;
  }

  return generated;
}

/*
=========================================================
КГУ
=========================================================
*/

function generateKguTasks(installation) {
  const schedule = getInstallationSchedule(installation);

  const settings = installation.settings;

  const generated = [];

  /*
    =====================================================
    НОМІНАЦІЯ / РЕНОМІНАЦІЯ

    Це постійні щоденні задачі КГУ.
    Вони не залежать від погодинного графіка
    навантаження.
    =====================================================
  */

  /*
    НОМІНАЦІЯ
  */

  if (settings.nomination?.automatic && settings.nomination?.time) {
    const nominationMinutes = timeToMinutes(settings.nomination.time);

    generated.push(
      createAutomaticTask(
        installation,

        "Номінація",

        nominationMinutes,

        nominationMinutes + 1,

        {
          taskType: "nomination",

          description: `Виконати номінацію КГУ о ${settings.nomination.time}.`,
        },
      ),
    );
  }

  /*
    РЕНОМІНАЦІЯ
  */

  if (settings.renomination?.automatic && settings.renomination?.time) {
    const renominationMinutes = timeToMinutes(settings.renomination.time);

    generated.push(
      createAutomaticTask(
        installation,

        "Реномінація",

        renominationMinutes,

        renominationMinutes + 1,

        {
          taskType: "renomination",

          description: `Виконати реномінацію КГУ о ${settings.renomination.time}.`,
        },
      ),
    );
  }

  let previousValue = 0;

  let running = false;

  let arvchActive = false;

  for (const hour of schedule) {
    const value = Math.max(0, hour.value);

    /*
        =================================================
        1. ПОТУЖНІСТЬ = 0
        =================================================
        */

    if (value === 0) {
      /*
            Якщо КГУ працювала —
            створюємо одну задачу зупинки.
            */

      if (running) {
        const shutdownMinutes = Number(settings.shutdownMinutes) || 0;

        const shutdownStart = hour.startMinutes - shutdownMinutes;

        generated.push(
          createAutomaticTask(
            installation,

            "Зупинити КГУ",

            shutdownStart,

            hour.startMinutes,

            {
              taskType: "stop",

              description: `Зупинка КГУ перед переходом на 0 кВт.`,
            },
          ),
        );

        running = false;
      }

      /*
            Якщо АРВЧ була активна —
            виходимо з неї.
            */

      if (arvchActive) {
        generated.push(
          createAutomaticTask(
            installation,

            "Вийти з АРВЧ",

            hour.startMinutes,

            hour.startMinutes + 1,

            {
              taskType: "arvch-stop",
            },
          ),
        );

        arvchActive = false;
      }

      previousValue = 0;

      continue;
    }

    /*
        =================================================
        2. КГУ БУЛА ВИМКНЕНА → ЗАПУСК
        =================================================

        Тепер це ОДНА задача:

        "Запустити КГУ на 200 кВт"

        а не:

        "Запуск"
        +
        "Вихід на 200 кВт"
        =================================================
        */

    if (!running) {
      const startupMinutes = Number(settings.startupMinutes) || 0;

      const startupStart = Math.max(0, hour.startMinutes - startupMinutes);

      generated.push(
        createAutomaticTask(
          installation,

          `Запустити КГУ на ${value} кВт`,

          startupStart,

          hour.startMinutes,

          {
            taskType: "start",

            powerTo: value,

            description: `Запуск КГУ з виходом на ${value} кВт.`,
          },
        ),
      );

      running = true;

      previousValue = value;
    } else if (previousValue !== value) {
      /*
        =================================================
        3. КГУ ВЖЕ ПРАЦЮЄ

        Перевіряємо зміну потужності.
        =================================================
        */
      const increasing = value > previousValue;

      /*
            ---------------------------------------------
            ЗБІЛЬШЕННЯ
            ---------------------------------------------
            */

      if (increasing) {
        const loadMinutes = Number(settings.loadMinutes) || 0;

        generated.push(
          createAutomaticTask(
            installation,

            `Збільшити потужність ${previousValue} → ${value} кВт`,

            hour.startMinutes,

            hour.startMinutes + Math.max(1, loadMinutes),

            {
              taskType: "power-increase",

              powerFrom: previousValue,

              powerTo: value,

              description: `Збільшення потужності КГУ з ${previousValue} до ${value} кВт.`,
            },
          ),
        );
      } else {
        /*
            ---------------------------------------------
            ЗМЕНШЕННЯ
            ---------------------------------------------
            */
        const unloadMinutes = Number(settings.unloadMinutes) || 0;

        generated.push(
          createAutomaticTask(
            installation,

            `Зменшити потужність ${previousValue} → ${value} кВт`,

            hour.startMinutes,

            hour.startMinutes + Math.max(1, unloadMinutes),

            {
              taskType: "power-decrease",

              powerFrom: previousValue,

              powerTo: value,

              description: `Зменшення потужності КГУ з ${previousValue} до ${value} кВт.`,
            },
          ),
        );
      }

      previousValue = value;
    }

    /*
        =================================================
        4. АРВЧ
        =================================================
        */

    if (settings.arvch?.enabled) {
      /*
            ВХІД В АРВЧ
            */

      if (hour.arvch && !arvchActive) {
        generated.push(
          createAutomaticTask(
            installation,

            "Перевести КГУ в АРВЧ",

            hour.startMinutes,

            hour.startMinutes + 1,

            {
              taskType: "arvch-start",
            },
          ),
        );

        arvchActive = true;
      }

      /*
            ВИХІД З АРВЧ
            */

      if (!hour.arvch && arvchActive) {
        generated.push(
          createAutomaticTask(
            installation,

            "Вивести КГУ з АРВЧ",

            hour.startMinutes,

            hour.startMinutes + 1,

            {
              taskType: "arvch-stop",
            },
          ),
        );

        arvchActive = false;
      }
    }
  }

  /*
    =====================================================
    КІНЕЦЬ ДОБИ

    Якщо після 24-ї години КГУ ще працює,
    створюємо зупинку о 00:00.

    =====================================================
    */

  if (running) {
    const shutdownMinutes = Number(settings.shutdownMinutes) || 0;

    const shutdownStart = Math.max(0, 1440 - shutdownMinutes);

    generated.push(
      createAutomaticTask(
        installation,

        "Зупинити КГУ",

        shutdownStart,

        1440,

        {
          taskType: "stop",
        },
      ),
    );
  }

  return generated;
}

/*
=========================================================
ГЕНЕРАТОР ДЛЯ ВСІХ УСТАНОВОК
=========================================================
*/

function generateAutomaticTasks() {
  /*
    Автоматичні задачі, які вже завантажені з БД,
    не видаляємо.

    Вони потрібні для збереження статусу:
    planned / completed.
  */

  const savedAutomaticTasks = tasks.filter((task) => task.generated);

  const manualTasks = tasks.filter((task) => !task.generated);

  const active = getActiveInstallations();

  let generated = [];

  for (const installation of active) {
    const automatic = installation.settings?.schedule?.automatic;

    if (!automatic) {
      continue;
    }

    if (installation.type === "UZE") {
      generated = generated.concat(generateUzeTasks(installation));
    }

    if (installation.type === "KGU") {
      generated = generated.concat(generateKguTasks(installation));
    }
  }

  /*
    =====================================================
    НОМІНАЦІЯ / РЕНОМІНАЦІЯ
    =====================================================

    Для них taskKey тепер стабільний:
    дата + установка + тип.

    Тому якщо час змінився,
    стара задача більше не повинна залишатися.
  */

  const nominationTypes = new Set(["nomination", "renomination"]);

  const generatedNominationKeys = new Set(
    generated
      .filter((task) => nominationTypes.has(task.taskType))
      .map((task) => task.taskKey),
  );

  /*
    Залишаємо старі автоматичні задачі,
    крім номінації/реномінації, для яких
    вже була згенерована нова версія.
  */

  const preservedAutomaticTasks = savedAutomaticTasks.filter((savedTask) => {
    if (!nominationTypes.has(savedTask.taskType)) {
      return true;
    }

    return generatedNominationKeys.has(savedTask.taskKey);
  });

  /*
    Додаємо тільки задачі, яких ще немає.
  */

  const newAutomaticTasks = generated.filter((generatedTask) => {
    return !preservedAutomaticTasks.some(
      (savedTask) =>
        savedTask.taskKey &&
        generatedTask.taskKey &&
        savedTask.taskKey === generatedTask.taskKey,
    );
  });

  tasks = [...manualTasks, ...preservedAutomaticTasks, ...newAutomaticTasks];

  return newAutomaticTasks;
}
