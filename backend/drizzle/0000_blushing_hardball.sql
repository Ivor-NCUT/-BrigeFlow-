CREATE TABLE "communication_records" (
	"id" text PRIMARY KEY NOT NULL,
	"contact_id" text NOT NULL,
	"date" text NOT NULL,
	"type" text NOT NULL,
	"summary" text NOT NULL,
	"details" text,
	"follow_up_date" text,
	"follow_up_note" text,
	"follow_up_done" boolean
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" text PRIMARY KEY NOT NULL,
	"source_contact_id" text NOT NULL,
	"target_contact_id" text NOT NULL,
	"type" text
);
--> statement-breakpoint
CREATE TABLE "contact_tags" (
	"contact_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "contact_tags_contact_id_tag_id_pk" PRIMARY KEY("contact_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"title" text,
	"company" text,
	"bonjour_link" text,
	"notes" text,
	"created_at" text NOT NULL,
	"last_contacted_at" text NOT NULL,
	"interaction_count" integer DEFAULT 0,
	"share_visible" boolean,
	"sensitive_notes" text
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source_contact_id" text NOT NULL,
	"target_contact_id" text NOT NULL,
	"type" text,
	"strength" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"label" text NOT NULL,
	"category" text NOT NULL,
	"color" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "communication_records" ADD CONSTRAINT "communication_records_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_source_contact_id_contacts_id_fk" FOREIGN KEY ("source_contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_target_contact_id_contacts_id_fk" FOREIGN KEY ("target_contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_tags" ADD CONSTRAINT "contact_tags_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comm_records_contact_id_idx" ON "communication_records" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "connections_source_idx" ON "connections" USING btree ("source_contact_id");--> statement-breakpoint
CREATE INDEX "contacts_user_id_idx" ON "contacts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_relationships_target" ON "relationships" USING btree ("target_contact_id");--> statement-breakpoint
CREATE INDEX "idx_relationships_source" ON "relationships" USING btree ("source_contact_id");--> statement-breakpoint
CREATE INDEX "idx_relationships_user_id" ON "relationships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tags_user_id_idx" ON "tags" USING btree ("user_id");