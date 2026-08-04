-- CreateTable
CREATE TABLE "Secao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "icone" TEXT,
    "nivel" TEXT NOT NULL,
    "tipoPadrao" TEXT NOT NULL DEFAULT 'youtube',
    "acesso" TEXT NOT NULL DEFAULT 'aberto',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Secao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "provas" TEXT NOT NULL DEFAULT '[]',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- SeedData: migra os 6 blocos fixos (antes hardcoded em src/data/blocos.ts)
-- para a tabela Secao, PRESERVANDO os ids que os conteúdos já referenciam.
INSERT INTO "Secao" ("id", "titulo", "icone", "nivel", "tipoPadrao", "acesso", "ordem", "atualizadoEm") VALUES
  ('ultra-revisao-r1',        'Ultra Revisão R1',       '⚡', 'R1', 'youtube', 'aberto', 0, CURRENT_TIMESTAMP),
  ('ultra-revisao-rmais',     'Ultra Revisão R+',       '⚡', 'R+', 'youtube', 'aberto', 1, CURRENT_TIMESTAMP),
  ('previsoes-medbrain-r1',   'Previsões Medbrain R1',  '🧠', 'R1', 'arquivo', 'aberto', 2, CURRENT_TIMESTAMP),
  ('previsoes-medbrain-rmais','Previsões Medbrain R+',  '🧠', 'R+', 'arquivo', 'aberto', 3, CURRENT_TIMESTAMP),
  ('lives-correcao-r1',       'Lives de Correção R1',   '🎥', 'R1', 'youtube', 'aberto', 4, CURRENT_TIMESTAMP),
  ('lives-correcao-rmais',    'Lives de Correção R+',   '🎥', 'R+', 'youtube', 'aberto', 5, CURRENT_TIMESTAMP);

-- AddForeignKey
ALTER TABLE "Conteudo" ADD CONSTRAINT "Conteudo_blocoId_fkey" FOREIGN KEY ("blocoId") REFERENCES "Secao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
