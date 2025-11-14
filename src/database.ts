import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

export async function initializeDatabase() {
  if (db) {
    console.log('Database already initialized.');
    return db;
  }

  db = await open({
    filename: './kick_stats.db',
    driver: sqlite3.Database,
  });

  console.log('Database initialized and connected to kick_stats.db');

  // Check for schema migration
  const tableInfo = await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='daily_stats'");
  
  // If table exists and doesn't have the composite unique key, we need to migrate.
  if (tableInfo && !/UNIQUE\s*\(\s*date\s*,\s*channelName\s*\)/i.test(tableInfo.sql)) {
      console.log('Old database schema detected. Migrating...');
      await db.exec('BEGIN TRANSACTION;');
      try {
        await db.exec('ALTER TABLE daily_stats RENAME TO daily_stats_old;');
        // create new table
        await db.exec(`
            CREATE TABLE daily_stats (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT NOT NULL,
              channelName TEXT NOT NULL,
              totalMessages INTEGER,
              uniqueUsers INTEGER,
              subscriptions INTEGER,
              giftedSubscriptions INTEGER,
              kicks INTEGER,
              usersBanned INTEGER,
              hostChannels INTEGER,
              polls INTEGER,
              pinnedMessages INTEGER,
              averageMessageLength REAL,
              uptime INTEGER,
              messagesPerMinute INTEGER,
              UNIQUE(date, channelName)
            );
        `);
        // copy data
        await db.exec(`INSERT INTO daily_stats (id, date, channelName, totalMessages, uniqueUsers, subscriptions, giftedSubscriptions, kicks, usersBanned, hostChannels, polls, pinnedMessages, averageMessageLength, uptime, messagesPerMinute)
                     SELECT id, date, channelName, totalMessages, uniqueUsers, subscriptions, giftedSubscriptions, kicks, usersBanned, hostChannels, polls, pinnedMessages, averageMessageLength, uptime, messagesPerMinute FROM daily_stats_old;`);
        await db.exec('DROP TABLE daily_stats_old;');
        await db.exec('COMMIT;');
        console.log('Database migration complete.');
      } catch (e) {
        await db.exec('ROLLBACK;');
        console.error('Database migration failed:', e);
        throw new Error('Failed to migrate database schema.');
      }
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      channelName TEXT NOT NULL,
      totalMessages INTEGER,
      uniqueUsers INTEGER,
      subscriptions INTEGER,
      giftedSubscriptions INTEGER,
      kicks INTEGER,
      usersBanned INTEGER,
      hostChannels INTEGER,
      polls INTEGER,
      pinnedMessages INTEGER,
      averageMessageLength REAL,
      uptime INTEGER,
      messagesPerMinute INTEGER,
      UNIQUE(date, channelName)
    );
  `);
  console.log('Daily stats table ensured.');

  return db;
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export async function saveDailyStats(stats: any) {
  const database = await getDatabase();
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Prepare topUsers for JSON storage if needed, or just store count
  // For simplicity, we'll store counts directly for now.

  await database.run(
    `INSERT OR REPLACE INTO daily_stats (
      date, channelName, totalMessages, uniqueUsers, subscriptions, giftedSubscriptions,
      kicks, usersBanned, hostChannels, polls, pinnedMessages, averageMessageLength,
      uptime, messagesPerMinute
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    date, stats.channelName, stats.totalMessages, stats.uniqueUsers.size, stats.subscriptions,
    stats.giftedSubscriptions, stats.kicks, stats.usersBanned, stats.hostChannels, stats.polls,
    stats.pinnedMessages, stats.averageMessageLength, stats.uptime, stats.messagesPerMinute
  );
  console.log(`Daily stats saved for ${stats.channelName} on ${date}`);
}

export async function getTodaysStats(channelName: string) {
  const today = new Date().toISOString().split('T')[0];
  return getDailyStatsForDate(today, channelName);
}

export async function getDailyStatsForDate(date: string, channelName: string) {
  const database = await getDatabase();
  return database.get(
    `SELECT * FROM daily_stats WHERE date = ? AND channelName = ?`,
    date, channelName
  );
}
