# AgroSegPlay — Cinematic Motion Experience

Estúdio de edição e exportação com React, TypeScript, Remotion, Three.js e FFmpeg. Sete cenas reutilizáveis, câmera 3D calculada por quadro, cards em perspectiva, animação tipográfica, áudio e exportação H.264/AAC. A pasta `entrega/` anterior foi preservada.

## Executar

Requisitos testados nesta máquina: Node 24, Chromium 154, FFmpeg 7.1. Não é necessário instalar ou baixar outro navegador.

```bash
npm ci
npm run dev
```

O painel atende na porta **3000**. Abra essa porta no seu navegador local ou pelo encaminhamento de portas do seu ambiente de desenvolvimento. Esta entrega não cria uma hospedagem pública da aplicação.

Para outra instalação do Chromium, defina `CHROME_EXECUTABLE` com o caminho completo. Para produção local:

```bash
npm run build
npm start
```

## Renderizar

```bash
npm run render -- --format vertical
npm run render -- --format horizontal
npm run render -- --format short
```

- `vertical`: 1080 × 1920, 35 segundos.
- `horizontal`: 1920 × 1080, 35 segundos.
- `short`: 1080 × 1920, 15 segundos.
- Todos: 30 FPS, MP4 H.264, AAC a 48 kHz e 192 kbps.

As saídas ficam em `renders/`, acompanhadas de relatório JSON com os parâmetros e a inspeção do FFprobe.

Para usar uma configuração própria:

```bash
npm run render -- --config meu-projeto.json --format vertical --output renders/campanha.mp4
```

O esquema e os valores iniciais estão em `src/config/project.ts`. No painel, edições podem ser salvas em `.runtime/project.json`. O botão **Exportar MP4** envia a configuração atual para o renderizador, exibe progresso real e disponibiliza o arquivo concluído. Não se trata de gravação de tela ou de botão demonstrativo. A fila aceita uma exportação por vez; o renderizador usa duas instâncias concorrentes para respeitar os recursos da máquina.

## Controles do painel

- Reprodução, pausa, avanço por quadro, volume e tela cheia.
- Seletor vertical, horizontal e corte de 15 segundos.
- Linha do tempo e seleção das sete cenas.
- Edição dos textos e das durações (a versão de 15 segundos usa tempos fixos).
- Paleta parametrizada.
- Importação de logotipo, screenshot da plataforma e até cinco imagens de trilhas.
- Substituição da narração por arquivo de áudio, normalizado para -16 LUFS.
- Importação de SRT, VTT ou JSON e legendas com destaque progressivo das palavras.
- Edição da oferta, bloqueada até a confirmação de que os valores foram conferidos no site.
- Validação de duração: a exportação recusa cortar silenciosamente uma narração maior que o vídeo.

Os uploads são locais, não são enviados a terceiros e ficam em `public/uploads/` (ignorados no Git). O estado do painel e os trabalhos em andamento não são persistidos no Git; guarde seus arquivos e exporte a configuração se migrar para outra máquina. A configuração pode ser recuperada pelo endpoint `GET /api/project`.

## Animação e áudio

Todas as animações do filme dependem exclusivamente do quadro, dos parâmetros e de sementes fixas. Three.js fornece a câmera e a projeção 3D do campo digital; a rasterização usa SVG, sem depender de GPU, simulações em tempo real, `Date.now()` ou `requestAnimationFrame`. Painéis e cards usam perspectiva e transformações 3D. Isso permite exportar de forma consistente com Chromium em ambiente de CPU.

A trilha é uma composição instrumental procedural original. Varreduras e impactos acompanham os cortes calculados da linha do tempo. A exportação aplica **sidechain compression** para baixar a música durante a locução, normalização da voz e limitador final. A prévia usa uma mixagem de monitoramento mais baixa; o processamento final de ducking ocorre no FFmpeg.

## Vozes e sincronização: situação real

As seis falas fornecidas pelo usuário estão em `public/audio/source/`. A versão de 35 segundos concatena as seis na ordem original com velocidade 1,10× e preservação de altura, para acomodar a duração. O corte de 15 segundos utiliza as falas 01 e 06, sem gerar voz nova. Confira esse recorte editorial antes de publicar uma campanha.

**Não foi gerada uma nova narração masculina.** Não há serviço de voz natural configurado. O download do modelo de transcrição também foi bloqueado pela rede. Portanto, a correspondência palavra a palavra das gravações com o novo roteiro não foi verificada. As cenas seguem os tempos do briefing, não alinhamento automático das palavras. As legendas ficam desativadas até a importação de um arquivo revisado, e os textos de cena são peças editoriais, não transcrições das falas.

O roteiro solicitado está documentado em `docs/NARRACAO.md`. Substitua a voz e importe as legendas no painel para concluir a sincronização fina com o novo roteiro.

## Verificação da marca e das informações comerciais

A consulta ao site oficial foi tentada antes da implementação. A requisição HTTP retornou bloqueio **403**; a captura com Playwright e proxy do ambiente não concluiu a validação TLS. Nenhuma verificação de certificado foi desativada. O diagnóstico registrado está em `docs/site-audit.json`.

Por esse motivo:

- Não foi identificado nem inventado um logotipo oficial: o vídeo apresenta apenas o nome tipográfico AgroSegPlay.
- A paleta é uma proposta baseada no briefing, não foi confirmada no site.
- Não se apresentam screenshots fictícios como se fossem a plataforma. Sem captura oficial, os painéis exibem imagem editorial do campo.
- As imagens agrícolas são ilustrativas, geradas para este projeto. Os cards sem imagens reais representam temas do briefing, não telas ou cursos comprovados.
- O número de 230 aulas e os preços sugeridos não são exibidos por padrão.
- O link de inscrição não foi validado. O CTA leva ao domínio oficial fornecido pelo usuário.

Para refazer a análise quando a rede estiver liberada:

```bash
npm run capture:site
```

Isso salva screenshots reais e um relatório de textos, cores, fontes, imagens e links. Revise o relatório, importe os ativos e confira os preços antes de ativá-los. O processo de captura não declara automaticamente que uma informação comercial está atualizada.

## Validar

```bash
npm run typecheck
npm test
npm run build
# Em outro terminal, com npm run dev em execução:
npm run test:browser
```

O teste de navegador usa o Chromium instalado e realiza uma exportação verdadeira de 15 segundos. A verificação inclui player, formatos, salvamento e recarga, layout móvel, controles de mídia, proteção de legendas e download HTTP do MP4 gerado. É um teste de integração com custo de renderização, não um mock.

## Arquitetura

- `src/scenes/`: sete cenas independentes.
- `src/compositions/`: composição e metadados do Remotion.
- `src/components/`: elementos visuais e câmera do campo 3D.
- `src/animations/`: interpolação, spring e aleatoriedade determinística.
- `src/config/`: tema, formatos, textos, oferta e validação.
- `server/`: API, upload, fila, renderização e mixagem.
- `scripts/`: exportação, trilha, capturas e quadros de inspeção.
- `tests/`: testes de regras e integração no navegador.
- `docs/`: evidências, limites, storyboard, licenças e roteiro.
- `entrega/cinematic/`: arquivos finais disponibilizados no GitHub.

A aplicação web e os arquivos finais são independentes. Para assistir aos MP4, não é necessário executar o projeto.
