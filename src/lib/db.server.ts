import { createClient, type Client } from "@libsql/client";

let dbInstance: Client | null = null;

export function getDb(): Client {
  if (!dbInstance) {
    const url = process.env["TURSO_DATABASE_URL"];
    const authToken = process.env["TURSO_AUTH_TOKEN"];

    if (!url) {
      throw new Error(
        "TURSO_DATABASE_URL environment variable is not set. " +
          "Get it from https://app.turso.tech after creating a database.",
      );
    }

    // Create Turso client — omit authToken entirely when falsy (exactOptionalPropertyTypes)
    dbInstance = authToken
      ? createClient({ url, authToken })
      : createClient({ url });
  }

  return dbInstance;
}

// Initialize database schema — call once at startup
export async function initDb(): Promise<void> {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
}
