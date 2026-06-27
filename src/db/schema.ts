import { pgTable, serial, varchar, text, integer, timestamp, decimal, jsonb, boolean } from "drizzle-orm/pg-core";


export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // SALE or PURCHASE
  product: varchar("product", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date", { withTimezone: true }).defaultNow(),
  language: varchar("language", { length: 20 }).default("English"),
  inputType: varchar("input_type", { length: 20 }).default("text"), // voice or text
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  language: varchar("language", { length: 20 }).default("English"),
  businessType: varchar("business_type", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  isSubscribed: boolean("is_subscribed").default(false),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 50 }).notNull().unique(),
  language: varchar("language", { length: 20 }).default("English"),
  state: varchar("state", { length: 50 }).default("welcome"),
  pendingData: jsonb("pending_data").default({}),
  lastActivity: timestamp("last_activity", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 50 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  businessType: varchar("business_type", { length: 100 }),
  language: varchar("language", { length: 20 }).default("English"),
  story: text("story").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});


