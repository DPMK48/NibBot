CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" varchar(50) NOT NULL,
	"language" varchar(20) DEFAULT 'English',
	"state" varchar(50) DEFAULT 'welcome',
	"pending_data" jsonb DEFAULT '{}'::jsonb,
	"last_activity" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "conversations_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"type" varchar(20) NOT NULL,
	"product" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit" varchar(50) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"date" timestamp with time zone DEFAULT now(),
	"language" varchar(20) DEFAULT 'English',
	"input_type" varchar(20) DEFAULT 'text'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" varchar(50) NOT NULL,
	"name" varchar(255),
	"language" varchar(20) DEFAULT 'English',
	"business_type" varchar(100),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"business_type" varchar(100),
	"language" varchar(20) DEFAULT 'English',
	"created_at" timestamp with time zone DEFAULT now()
);
