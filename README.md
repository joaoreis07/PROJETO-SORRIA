# Projeto Sorria — site

## Organização do site

- **Página inicial (index.html):** apresentação do projeto, números, próxima data, fotos de destaque e caminhos para participar.
- **Galeria (fotos.html):** página própria com as 245 fotos copiadas localmente dos álbuns de 2025 e da Páscoa de 2026. Os filtros separam os anos; as fotos abrem em uma visualização ampliada com navegação por teclado e setas.
- **Identidade:** preto e amarelo, com composição editorial, fotos em destaque, pequenos movimentos e elementos que aparecem conforme a rolagem. O menu e as páginas se adaptam a telas menores.
- **Impacto informado pela organização:** mais de 1.500 crianças, 120 voluntários e 30 padrinhos/patrocinadores.
- **Razão social:** o site explica o que significa, sem inventar nome jurídico ou CNPJ que não foram fornecidos.
- **Data da ação:** 12 de dezembro. A contagem regressiva atualiza a cada segundo e passa para 12/12 do próximo ano após a data.
- **Contato e QR codes:** voluntariado, apadrinhamento e ajuda geral abrem o WhatsApp (43) 9681-0919 com mensagens diferentes. Os códigos não são Pix; dados oficiais de contribuição devem ser pedidos à equipe.

## Fotos

Acesso aos dois álbuns do Drive confirmado. Foram revisadas visualmente 50 fotos do álbum de 2025 e 195 do álbum da Páscoa de 2026. As 245 imagens estão em assets/fotos/2025 e assets/fotos/2026 e a galeria usa esses arquivos locais, sem direcionar a pessoa ao Drive.

A pasta assets/selecionadas reúne 15 fotos de destaque em alta resolução, mais a foto da equipe enviada na conversa. A landing usa uma seleção variada; os nomes e critérios estão em assets/selecionadas/README.md. As imagens de destaque também aparecem na galeria completa.

As fotos originais somam cerca de 376 MB; a pasta de destaques contém cópias adicionais em alta resolução. A galeria carrega cada imagem sob demanda ao rolar, mas o conjunto de arquivos do site continua grande.

## Abrir localmente

Abra index.html no navegador. O botão Explorar a galeria abre fotos.html. A lista da galeria está em assets/fotos/manifest.js, mantida junto das fotos para funcionar também quando abertas como arquivos locais.
