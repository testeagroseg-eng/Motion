# Validação executada

- TypeScript: passou.
- Regras de composição: 5 testes passaram; nenhum teste ignorado.
- Vite: build de produção passou.
- Playwright: player, formatos, controles de ativos, proteção de legendas, salvar e recarregar, largura móvel e exportar MP4 pelo botão passaram.
- Download do MP4 da fila: resposta HTTP válida, arquivo maior que 100 KB, sem exceções JavaScript no navegador.
- Aplicação: modo de desenvolvimento e modo de produção iniciados; smoke test de reprodução e API passou.
- MP4 vertical 35s, horizontal 35s e vertical 15s: codec H.264, 30 fps, áudio AAC, duração correta e decodificação integral sem erro.
- Captura oficial: não concluída. HTTP 403 e erro de autoridade TLS no navegador; verificação não desativada.
- Nova locução masculina e transcrição automática: não produzidas; vozes fornecidas reaproveitadas.
- Dados comerciais: não validados, desativados por padrão.
- Screenshots reais do produto e logotipo oficial: não obtidos; campos de importação prontos.
- Pull Request pela API: a consulta a api.github.com retornou Forbidden. A autenticação de Git permitiu enviar a branch, mas isso não confirma autorização da API.

Evidências: `browser-test.json`, `render-validation.json`, `site-audit.json`, `screenshots/` e `frames/`.

A aplicação é executável no ambiente e em máquina compatível; não foi publicada em um serviço de hospedagem web. O envio ao GitHub entrega código e arquivos, não cria um site em produção.
