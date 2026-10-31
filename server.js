const express = require("express");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

/* =====================================================
   POSTGRESQL
===================================================== */

const pool = new Pool({
  user: process.env.PG_USER,

  host: process.env.PG_HOST || "localhost",

  database: process.env.PG_DATABASE,

  password: process.env.PG_PASSWORD,

  port: Number(process.env.PG_PORT || 5432),

  ssl: {
    rejectUnauthorized: false,
  },
});

/* =====================================================
   INSTALLATION SETTINGS TABLE

   Основна таблиця installations залишається без змін.
   Налаштування планера зберігаються окремо по installation_id.
===================================================== */

async function ensureInstallationSettingsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS installation_settings (
      installation_id INTEGER PRIMARY KEY
        REFERENCES installations(id) ON DELETE CASCADE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

/* =====================================================
   TASKS TABLE

   Постійне збереження задач планувальника.
   Статус completed зберігається в PostgreSQL,
   тому після перезавантаження сторінки задача
   не повертається в активні/прострочені.
===================================================== */

async function ensureTasksTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS planner_tasks (
      id BIGSERIAL PRIMARY KEY,

      installation_id INTEGER
        REFERENCES installations(id)
        ON DELETE CASCADE,

      record_date DATE NOT NULL,

      name TEXT NOT NULL,

      start_time TIME NOT NULL,

      end_time TIME NOT NULL,

      description TEXT DEFAULT '',

      status TEXT NOT NULL DEFAULT 'planned',

      task_type TEXT DEFAULT 'manual',

      is_automatic BOOLEAN NOT NULL DEFAULT FALSE,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      task_key TEXT,

      CONSTRAINT planner_tasks_status_check
        CHECK (
          status IN (
            'planned',
            'completed'
          )
        )
    );

    CREATE INDEX IF NOT EXISTS
      planner_tasks_date_idx
    ON planner_tasks(record_date);

    CREATE INDEX IF NOT EXISTS
      planner_tasks_installation_date_idx
    ON planner_tasks(
      installation_id,
      record_date
    );
  `);
}
async function ensureTasksTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS planner_tasks (
      id BIGSERIAL PRIMARY KEY,

      installation_id INTEGER
        REFERENCES installations(id)
        ON DELETE CASCADE,

      record_date DATE NOT NULL,

      name TEXT NOT NULL,

      start_time TIME NOT NULL,

      end_time TIME NOT NULL,

      description TEXT DEFAULT '',

      status TEXT NOT NULL DEFAULT 'planned',

      task_type TEXT DEFAULT 'manual',

      is_automatic BOOLEAN NOT NULL DEFAULT FALSE,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      task_key TEXT,

      CONSTRAINT planner_tasks_status_check
        CHECK (
          status IN (
            'planned',
            'completed'
          )
        )
    );
  `);
}
/* =====================================================
   DATABASE CONNECTION
===================================================== */

pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("✅ PostgreSQL підключено");

    console.log("Час БД:", result.rows[0].now);
  })
  .catch((error) => {
    console.error("❌ Помилка підключення PostgreSQL:");

    console.error(error.message);
  });

/* =====================================================
   GET INSTALLATIONS
=====================================================

   Отримуємо установки ТІЛЬКИ з нової таблиці
   installations.

===================================================== */

app.get("/api/installations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.name,
        i.type,
        COALESCE(s.active, TRUE) AS active,
        COALESCE(s.settings, '{}'::jsonb) AS settings
      FROM installations i
      LEFT JOIN installation_settings s
        ON s.installation_id = i.id
      ORDER BY i.id
    `);

    res.json({
      success: true,
      installations: result.rows,
    });
  } catch (error) {
    console.error("GET /api/installations:", error);

    res.status(500).json({
      success: false,
      error: "Помилка отримання установок",
      details: error.message,
    });
  }
});

/* =====================================================
   GET ONE INSTALLATION
===================================================== */

app.get("/api/installations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        error: "Невірний ID установки",
      });
    }

    const result = await pool.query(
      `
      SELECT
        i.id,
        i.name,
        i.type,
        COALESCE(s.active, TRUE) AS active,
        COALESCE(s.settings, '{}'::jsonb) AS settings
      FROM installations i
      LEFT JOIN installation_settings s
        ON s.installation_id = i.id
      WHERE i.id = $1
    `,
      [id],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Установку не знайдено",
      });
    }

    res.json({
      success: true,
      installation: result.rows[0],
    });
  } catch (error) {
    console.error("GET /api/installations/:id:", error);

    res.status(500).json({
      success: false,
      error: "Помилка отримання установки",
      details: error.message,
    });
  }
});

/* =====================================================
   CREATE INSTALLATION
===================================================== */

app.post("/api/installations", async (req, res) => {
  const client = await pool.connect();

  try {
    const { name, type, active = true, settings = {} } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        error: "Не вказана назва установки",
      });
    }

    if (type !== "KGU" && type !== "UZE") {
      return res.status(400).json({
        success: false,
        error: "Невірний тип установки",
      });
    }

    await client.query("BEGIN");

    const installationResult = await client.query(
      `
      INSERT INTO installations (name, type)
      VALUES ($1, $2)
      RETURNING id, name, type
    `,
      [String(name).trim(), type],
    );

    const installation = installationResult.rows[0];

    await client.query(
      `
      INSERT INTO installation_settings
      (
        installation_id,
        active,
        settings,
        updated_at
      )
      VALUES ($1, $2, $3::jsonb, NOW())
    `,
      [installation.id, active !== false, JSON.stringify(settings || {})],
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      installation: {
        ...installation,
        active: active !== false,
        settings: settings || {},
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("POST /api/installations:", error);

    res.status(500).json({
      success: false,
      error: "Помилка створення установки",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

/* =====================================================
   UPDATE INSTALLATION
===================================================== */

app.put("/api/installations/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        error: "Невірний ID установки",
      });
    }

    const existingResult = await client.query(
      `
      SELECT id, name, type
      FROM installations
      WHERE id = $1
    `,
      [id],
    );

    if (!existingResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Установку не знайдено",
      });
    }

    const existing = existingResult.rows[0];

    const name =
      req.body.name !== undefined
        ? String(req.body.name).trim()
        : existing.name;

    const type = req.body.type !== undefined ? req.body.type : existing.type;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Не вказана назва установки",
      });
    }

    if (type !== "KGU" && type !== "UZE") {
      return res.status(400).json({
        success: false,
        error: "Невірний тип установки",
      });
    }

    await client.query("BEGIN");

    await client.query(
      `
      UPDATE installations
      SET
        name = $1,
        type = $2
      WHERE id = $3
    `,
      [name, type, id],
    );

    const currentSettingsResult = await client.query(
      `
      SELECT
        active,
        settings
      FROM installation_settings
      WHERE installation_id = $1
    `,
      [id],
    );

    const current = currentSettingsResult.rows[0] || {
      active: true,
      settings: {},
    };

    const active =
      req.body.active !== undefined
        ? req.body.active !== false
        : current.active;

    const settings =
      req.body.settings !== undefined
        ? req.body.settings
        : current.settings || {};

    await client.query(
      `
      INSERT INTO installation_settings
      (
        installation_id,
        active,
        settings,
        updated_at
      )
      VALUES ($1, $2, $3::jsonb, NOW())
      ON CONFLICT (installation_id)
      DO UPDATE SET
        active = EXCLUDED.active,
        settings = EXCLUDED.settings,
        updated_at = NOW()
    `,
      [id, active, JSON.stringify(settings)],
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      installation: {
        id,
        name,
        type,
        active,
        settings,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("PUT /api/installations/:id:", error);

    res.status(500).json({
      success: false,
      error: "Помилка збереження установки",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

/* =====================================================
   GET INSTALLATION SCHEDULE
=====================================================

   GET:

   /api/schedule/:installationId/:date

   installationId:
   ID установки з installations

   date:
   YYYY-MM-DD

   Повертаємо всі 24 години.

   1  = 00:00–01:00
   ...
   24 = 23:00–00:00

===================================================== */

app.get("/api/schedule/:installationId/:date", async (req, res) => {
  try {
    const installationId = Number(req.params.installationId);

    const date = req.params.date;

    if (!Number.isInteger(installationId)) {
      return res.status(400).json({
        success: false,

        error: "Невірний ID установки",
      });
    }

    /*
            ---------------------------------------------
            Перевіряємо установку
            ---------------------------------------------
            */

    const installationResult = await pool.query(
      `

                    SELECT
                        id,
                        name,
                        type

                    FROM installations

                    WHERE id = $1

                    `,

      [installationId],
    );

    if (installationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,

        error: "Установку не знайдено",
      });
    }

    const installation = installationResult.rows[0];

    /*
            ---------------------------------------------
            Отримуємо графік
            ---------------------------------------------
            */

    const result = await pool.query(
      `

                    SELECT

                        hour_of_day,

                        value

                    FROM installation_schedule

                    WHERE
                        installation_id = $1

                        AND record_date = $2

                    ORDER BY
                        hour_of_day

                    `,

      [installationId, date],
    );

    /*
            ---------------------------------------------
            Формуємо всі 24 години.

            Якщо запису ще немає —
            повертаємо value = 0.
            ---------------------------------------------
            */

    const schedule = [];

    for (let hour = 1; hour <= 24; hour++) {
      const row = result.rows.find((item) => Number(item.hour_of_day) === hour);

      schedule.push({
        hour,

        start: `${String(hour - 1).padStart(2, "0")}:00`,

        end: hour === 24 ? "00:00" : `${String(hour).padStart(2, "0")}:00`,

        value: row ? Number(row.value) || 0 : 0,
      });
    }

    res.json({
      success: true,

      installation: {
        id: installation.id,

        name: installation.name,

        type: installation.type,
      },

      date,

      schedule,
    });
  } catch (error) {
    console.error("GET /api/schedule:", error);

    res.status(500).json({
      success: false,

      error: "Помилка отримання графіка",
    });
  }
});

/* =====================================================
   SAVE INSTALLATION SCHEDULE
=====================================================

   POST:

   /api/schedule

   Body:

   {
       installation_id: 1,

       record_date: "2026-09-01",

       schedule: [

           {
               hour: 1,
               value: 0
           },

           {
               hour: 2,
               value: 200
           }

       ]
   }

===================================================== */

app.post("/api/schedule", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      installation_id,

      record_date,

      schedule,
    } = req.body;

    const installationId = Number(installation_id);

    /*
            ---------------------------------------------
            Перевірка
            ---------------------------------------------
            */

    if (!Number.isInteger(installationId)) {
      return res.status(400).json({
        success: false,

        error: "Невірний installation_id",
      });
    }

    if (!record_date) {
      return res.status(400).json({
        success: false,

        error: "Не вказана дата",
      });
    }

    if (!Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,

        error: "Графік має бути масивом",
      });
    }

    /*
            ---------------------------------------------
            Перевіряємо існування установки
            ---------------------------------------------
            */

    const installationResult = await client.query(
      `

                    SELECT
                        id,
                        name,
                        type

                    FROM installations

                    WHERE id = $1

                    `,

      [installationId],
    );

    if (installationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,

        error: "Установку не знайдено",
      });
    }

    const installation = installationResult.rows[0];

    /*
            ---------------------------------------------
            Починаємо транзакцію
            ---------------------------------------------
            */

    await client.query("BEGIN");

    /*
            ---------------------------------------------
            Записуємо всі 24 години.

            UPSERT:

            якщо запис існує → UPDATE
            якщо немає → INSERT
            ---------------------------------------------
            */

    for (let hour = 1; hour <= 24; hour++) {
      const item = schedule.find((row) => Number(row.hour) === hour);

      const value = item ? Number(item.value) || 0 : 0;

      await client.query(
        `

                    INSERT INTO installation_schedule
                    (
                        installation_id,
                        record_date,
                        hour_of_day,
                        value
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4
                    )

                    ON CONFLICT
                    (
                        installation_id,
                        record_date,
                        hour_of_day
                    )

                    DO UPDATE SET

                        value =
                            EXCLUDED.value,

                        updated_at =
                            NOW()

                    `,

        [installationId, record_date, hour, value],
      );
    }

    await client.query("COMMIT");

    console.log(`✅ Графік збережено: ${installation.name}, ${record_date}`);

    res.json({
      success: true,

      message: "Графік успішно збережено",

      installation: {
        id: installation.id,

        name: installation.name,

        type: installation.type,
      },

      date: record_date,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("POST /api/schedule:", error);

    res.status(500).json({
      success: false,

      error: "Помилка збереження графіка",

      details: error.message,
    });
  } finally {
    client.release();
  }
});

/* =====================================================
   TASKS API
===================================================== */

/*
   GET TASKS FOR DATE
   GET /api/tasks/:date
*/

app.get("/api/tasks/:date", async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Не вказана дата",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          installation_id,
          record_date,
          name,
          start_time,
          end_time,
          description,
          status,
          task_type,
          is_automatic,
          task_key,
          created_at,
          updated_at
        FROM planner_tasks
        WHERE record_date = $1
        ORDER BY start_time, id
      `,
      [date],
    );

    res.json({
      success: true,
      tasks: result.rows,
    });
  } catch (error) {
    console.error("GET /api/tasks/:date:", error);

    res.status(500).json({
      success: false,
      error: "Помилка отримання задач",
      details: error.message,
    });
  }
});

/*
   CREATE TASK
   POST /api/tasks
*/

app.post("/api/tasks", async (req, res) => {
  try {
    const {
      installation_id,
      record_date,
      name,
      start_time,
      end_time,
      description = "",
      status = "planned",
      task_type = "manual",
      is_automatic = false,
      task_key = null,
    } = req.body;

    if (!record_date) {
      return res.status(400).json({
        success: false,
        error: "Не вказана дата задачі",
      });
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        error: "Не вказана назва задачі",
      });
    }

    if (!start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: "Не вказаний час задачі",
      });
    }

    if (status !== "planned" && status !== "completed") {
      return res.status(400).json({
        success: false,
        error: "Невірний статус задачі",
      });
    }

    const installationId =
      installation_id === null ||
      installation_id === undefined ||
      installation_id === ""
        ? null
        : Number(installation_id);

    if (installationId !== null && !Number.isInteger(installationId)) {
      return res.status(400).json({
        success: false,
        error: "Невірний installation_id",
      });
    }

    const result = await pool.query(
      `
    INSERT INTO planner_tasks
    (
      installation_id,
      record_date,
      name,
      start_time,
      end_time,
      description,
      status,
      task_type,
      is_automatic,
      task_key,
      created_at,
      updated_at
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      NOW(),
      NOW()
    )
    ON CONFLICT (task_key)
    WHERE task_key IS NOT NULL
    DO UPDATE SET
      installation_id = EXCLUDED.installation_id,
      record_date = EXCLUDED.record_date,
      name = EXCLUDED.name,
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time,
      description = EXCLUDED.description,
      task_type = EXCLUDED.task_type,
      is_automatic = EXCLUDED.is_automatic,
      updated_at = NOW()
    RETURNING
      id,
      installation_id,
      record_date,
      name,
      start_time,
      end_time,
      description,
      status,
      task_type,
      is_automatic,
      task_key,
      created_at,
      updated_at
  `,
      [
        installationId,
        record_date,
        String(name).trim(),
        start_time,
        end_time,
        String(description || ""),
        status,
        String(task_type || "manual"),
        Boolean(is_automatic),
        task_key || null,
      ],
    );

    res.status(201).json({
      success: true,
      task: result.rows[0],
    });
  } catch (error) {
    console.error("POST /api/tasks:", error);

    res.status(500).json({
      success: false,
      error: "Помилка створення задачі",
      details: error.message,
    });
  }
});

/*
   UPDATE TASK
   PUT /api/tasks/:id
*/

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        error: "Невірний ID задачі",
      });
    }

    const allowedFields = [
      "name",
      "start_time",
      "end_time",
      "description",
      "status",
      "task_type",
      "is_automatic",
    ];

    const updates = [];
    const values = [];

    let parameterIndex = 1;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${parameterIndex}`);

        values.push(req.body[field]);

        parameterIndex++;
      }
    }

    if (!updates.length) {
      return res.status(400).json({
        success: false,
        error: "Немає даних для оновлення",
      });
    }

    if (
      req.body.status !== undefined &&
      req.body.status !== "planned" &&
      req.body.status !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        error: "Невірний статус задачі",
      });
    }

    updates.push(`updated_at = NOW()`);

    values.push(id);

    const result = await pool.query(
      `
        UPDATE planner_tasks
        SET
          ${updates.join(", ")}
        WHERE id = $${parameterIndex}
        RETURNING
          id,
          installation_id,
          record_date,
          name,
          start_time,
          end_time,
          description,
          status,
          task_type,
          is_automatic,
          created_at,
          updated_at
      `,
      values,
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Задачу не знайдено",
      });
    }

    res.json({
      success: true,
      task: result.rows[0],
    });
  } catch (error) {
    console.error("PUT /api/tasks/:id:", error);

    res.status(500).json({
      success: false,
      error: "Помилка оновлення задачі",
      details: error.message,
    });
  }
});

/*
   DELETE TASK
   DELETE /api/tasks/:id
*/

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        error: "Невірний ID задачі",
      });
    }

    const result = await pool.query(
      `
        DELETE FROM planner_tasks
        WHERE id = $1
        RETURNING id
      `,
      [id],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Задачу не знайдено",
      });
    }

    res.json({
      success: true,
      message: "Задачу видалено",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("DELETE /api/tasks/:id:", error);

    res.status(500).json({
      success: false,
      error: "Помилка видалення задачі",
      details: error.message,
    });
  }
});

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");

    res.json({
      success: true,

      database: "connected",

      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      database: "disconnected",

      error: error.message,
    });
  }
});

/* =====================================================
   FRONTEND
===================================================== */

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =====================================================
   START SERVER
===================================================== */

ensureInstallationSettingsTable()
  .then(() => {
    console.log("✅ Таблиця installation_settings перевірена");

    return ensureTasksTable();
  })
  .then(() => {
    console.log("✅ Таблиця planner_tasks перевірена");

    app.listen(PORT, () => {
      console.log(`✅ Планувальник запущено: http://localhost:${PORT}`);
    });
  });
