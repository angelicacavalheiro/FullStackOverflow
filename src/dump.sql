CREATE TABLE "questions" (
	"id" serial NOT NULL,
	"question" TEXT NOT NULL,
	"student" varchar(255) NOT NULL,
	"class_id" integer NOT NULL,
	"tags" varchar(255) NOT NULL,
	"answered" BOOLEAN NOT NULL,
	"submitAt" varchar(255) NOT NULL,
	"answeredAt" varchar(255),
	"token_replied" TEXT,
	"answer" TEXT
) WITH (
  OIDS=FALSE
);


CREATE TABLE "class" (
	"id" serial NOT NULL,
	"class_name" varchar(255) NOT NULL UNIQUE,
	CONSTRAINT "class_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);


CREATE TABLE "user" (
	"token" TEXT NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"class_id" integer NOT NULL,
	CONSTRAINT "user_pk" PRIMARY KEY ("token")
) WITH (
  OIDS=FALSE
);


ALTER TABLE "questions" ADD CONSTRAINT "questions_fk0" FOREIGN KEY ("class_id") REFERENCES "class"("id");
ALTER TABLE "questions" ADD CONSTRAINT "questions_fk1" FOREIGN KEY ("token_replied") REFERENCES "user"("token");

ALTER TABLE "user" ADD CONSTRAINT "user_fk0" FOREIGN KEY ("user_name") REFERENCES ""("");
ALTER TABLE "user" ADD CONSTRAINT "user_fk1" FOREIGN KEY ("class_id") REFERENCES "class"("id");
