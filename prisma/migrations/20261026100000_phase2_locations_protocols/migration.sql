-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('SOURCE_VERIFIED', 'PARTIALLY_VERIFIED', 'TEXTBOOK_ONLY', 'MANUAL_REVIEW_REQUIRED');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "canonicalCode" TEXT,
ADD COLUMN     "controversies" TEXT,
ADD COLUMN     "germanVsInternational" TEXT,
ADD COLUMN     "importKey" TEXT,
ADD COLUMN     "protocolCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewData" JSONB,
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "verificationStatus" "VerificationStatus";

-- AlterTable
ALTER TABLE "QuestionAnswer" ADD COLUMN     "followUps" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "keyPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "shortAnswer" TEXT;

-- AlterTable
ALTER TABLE "AnswerCitation" ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verified" BOOLEAN;

-- AlterTable
ALTER TABLE "ExamSession" ADD COLUMN     "locationId" TEXT;

-- CreateTable
CREATE TABLE "ExamLocation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "chamber" TEXT,
    "bundesland" TEXT,
    "bundeslandDerived" BOOLEAN NOT NULL DEFAULT false,
    "isUnknown" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExamLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamProtocol" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "year" INTEGER,
    "dateText" TEXT,
    "examFormat" TEXT,
    "isGermanOralExam" BOOLEAN NOT NULL DEFAULT true,
    "lowConfidence" BOOLEAN NOT NULL DEFAULT false,
    "sourceDocument" TEXT,
    "sourcePages" TEXT,

    CONSTRAINT "ExamProtocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOccurrence" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "questionId" TEXT,
    "protocolId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "correctedText" TEXT,
    "answerExcerpt" TEXT,
    "sourcePages" TEXT,
    "flags" TEXT,

    CONSTRAINT "QuestionOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionLocation" (
    "questionId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "QuestionLocation_pkey" PRIMARY KEY ("questionId","locationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamLocation_code_key" ON "ExamLocation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ExamLocation_slug_key" ON "ExamLocation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExamProtocol_code_key" ON "ExamProtocol"("code");

-- CreateIndex
CREATE INDEX "ExamProtocol_locationId_idx" ON "ExamProtocol"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOccurrence_code_key" ON "QuestionOccurrence"("code");

-- CreateIndex
CREATE INDEX "QuestionOccurrence_questionId_idx" ON "QuestionOccurrence"("questionId");

-- CreateIndex
CREATE INDEX "QuestionOccurrence_protocolId_idx" ON "QuestionOccurrence"("protocolId");

-- CreateIndex
CREATE INDEX "QuestionLocation_locationId_idx" ON "QuestionLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_canonicalCode_key" ON "Question"("canonicalCode");

-- CreateIndex
CREATE UNIQUE INDEX "Question_importKey_key" ON "Question"("importKey");

-- CreateIndex
CREATE INDEX "Question_subcategory_idx" ON "Question"("subcategory");

-- AddForeignKey
ALTER TABLE "ExamProtocol" ADD CONSTRAINT "ExamProtocol_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "ExamLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOccurrence" ADD CONSTRAINT "QuestionOccurrence_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOccurrence" ADD CONSTRAINT "QuestionOccurrence_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "ExamProtocol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLocation" ADD CONSTRAINT "QuestionLocation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLocation" ADD CONSTRAINT "QuestionLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "ExamLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "ExamLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

