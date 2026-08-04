-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "hubspotEm" TIMESTAMP(3),
ADD COLUMN     "respostas" TEXT NOT NULL DEFAULT '{}';
