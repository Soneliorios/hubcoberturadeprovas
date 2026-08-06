-- CreateTable
CREATE TABLE "Prova" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "estado" TEXT,
    "nivel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'votacao',
    "dataProva" TIMESTAMP(3),
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prova_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Previsao" (
    "id" TEXT NOT NULL,
    "provaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "especialidade" TEXT,
    "caiu" BOOLEAN,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Previsao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voto" (
    "id" TEXT NOT NULL,
    "previsaoId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "voto" BOOLEAN NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prova_status_idx" ON "Prova"("status");

-- CreateIndex
CREATE INDEX "Previsao_provaId_idx" ON "Previsao"("provaId");

-- CreateIndex
CREATE INDEX "Voto_leadId_idx" ON "Voto"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Voto_previsaoId_leadId_key" ON "Voto"("previsaoId", "leadId");

-- AddForeignKey
ALTER TABLE "Previsao" ADD CONSTRAINT "Previsao_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "Prova"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_previsaoId_fkey" FOREIGN KEY ("previsaoId") REFERENCES "Previsao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
