-- CreateEnum
CREATE TYPE "ClassSessionOverrideState" AS ENUM ('CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateTable
CREATE TABLE "class_session_override" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "class_rule_id" TEXT NOT NULL,
    "original_date" DATE NOT NULL,
    "state" "ClassSessionOverrideState" NOT NULL,
    "rescheduled_date" DATE,
    "rescheduled_start_time" TIME,
    "rescheduled_end_time" TIME,
    "reason" TEXT,

    CONSTRAINT "class_session_override_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "user_id" TEXT NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_rule" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "course_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "interval_days" INTEGER,
    "end_date" DATE,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "room" TEXT,

    CONSTRAINT "class_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_key" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "description" TEXT,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_course" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "student_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "password_salt" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "avatar_url" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_session_override_class_rule_id_idx" ON "class_session_override"("class_rule_id");

-- CreateIndex
CREATE INDEX "class_session_override_original_date_idx" ON "class_session_override"("original_date");

-- CreateIndex
CREATE UNIQUE INDEX "class_session_override_class_rule_id_original_date_key" ON "class_session_override"("class_rule_id", "original_date");

-- CreateIndex
CREATE INDEX "course_user_id_idx" ON "course"("user_id");

-- CreateIndex
CREATE INDEX "class_rule_course_id_idx" ON "class_rule"("course_id");

-- CreateIndex
CREATE INDEX "student_user_id_idx" ON "student"("user_id") WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "student_course_student_id_idx" ON "student_course"("student_id");

-- CreateIndex
CREATE INDEX "student_course_course_id_idx" ON "student_course"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_course_student_id_course_id_key" ON "student_course"("student_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- AddForeignKey
ALTER TABLE "class_session_override" ADD CONSTRAINT "class_session_override_class_rule_id_fkey" FOREIGN KEY ("class_rule_id") REFERENCES "class_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_rule" ADD CONSTRAINT "class_rule_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course" ADD CONSTRAINT "student_course_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course" ADD CONSTRAINT "student_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
