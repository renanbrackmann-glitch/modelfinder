# Base de Dados — Modelos Jurídicos do Gabinete

> **Este documento é a fonte da verdade do sistema de organização de modelos.**
> Ele é lido e atualizado pelo assistente organizador. Qualquer alteração nas regras, categorias, cores ou modelos catalogados deve ser refletida aqui.
>
> Última atualização: 23/02/2026
> Total de modelos catalogados: 104

---

## 1. Tabela de Cores (Referência HEX e-Proc)

Cada cor indica o **tipo funcional** do modelo. Um modelo recebe apenas **uma** cor.

O e-Proc disponibiliza 11 cores. As cores abaixo estão vinculadas a tipos funcionais específicos. A coluna "tipo funcional" indica a função que os modelos daquela cor desempenham; ela deve ser usada como critério principal para atribuição de cor a novos modelos. Observe que um mesmo modelo pode ter categorias diversas, mas a COR deve observar a categoria principal. Por ex: o modelo 'LOCAÇÃO - Liminar de despejo e requisitos do art 59 da Lei 8245/91 - Texto introdutório' recebe a cor LARANJA PÊSSEGO, pois seu tema central é locação, mas recebe também a tag processual ESTRUTURA, pois é um texto estrutural. O modelo 'DESPACHO - Intimação para recolhimento do preparo em dobro por intempestividade do pagamento (art. 1.007, §4º, CPC, Ofício-Circular 05/2019-DIJUD, expediente forense, horário bancário, guia, deserção)' recebe a cor AZUL AÇO, mas também recebe as tags processuais Admissibilidade (que seria uma cor avulsa, mas é mais importante que todos os despachos estejam reunidos em sequência, sem misturar com acórdãos ou monocráticas que tratem de Admissibilidade).

| HEX e-Proc | Nome da Cor | Tipo Funcional | Quando usar |
|---|---|---|---|
| `EDEF93` | Amarelo-esverdeado | *Competência residual* | *O texto diz respeito a uma matéria de competência da Câmara de menor incidência, de modo que não se justifica a atribuição de uma cor específica. São competências residuais processos que tratam sobre: Corretagem, representação comercial, gestão de negócios, depósito mercantil* |
| `8CACCC` | Azul Aço | *Despachos* | *Quando o texto não diz respeito ao julgamento do recurso propriamente dito, mas a alguma decisão interlocutória ou despacho de mero expediente* |
| `EBD992` | Amarelo Areia | *Admissibilidade, Preliminares e Prejudiciais* | *Quando o núcleo do texto trate a respeito de questões de admissibilidade recursal, ou preliminares e prejudiciais de mérito, como interesse de agir, ilegitimidade de parte, prescrição etc.* |
| `C8DEFA` | Azul Céu | *Nulidades* | *Quando o texto está enfrentando alguma alegação de nulidade processual ou material. Por ex: nulidade por vício de fundamentação (nulidade processual) ou nulidade em uma outorga uxória (nulidade material)* |
| `ACECA8` | Verde Menta | *Estrutura* | *Voltado para textos estruturais de decisões. Por exemplo: relatório introdutório para recurso, introdução ou definição de vícios de embargos declaratórios, requisitos para a concessão de liminar. Esses textos não fazem menção ao mérito nem entram em exame aprofundado. São textos rápidos e normalmente curtos que podem ser aplicados em situações diversas, sem vinculação a uma matéria específica.* |
| `EFB778` | Laranja Pêssego | *Locação* | *Textos que tratam de questões específicas de contratos de locação, ações de cobrança de alugueis, ações de despejo, ações renovatórias etc.* |
| `F7C5DF` | Rosa Claro | *Honorários e Ônus sucumbenciais* | *Textos que resolvem controvérsia acerca de honorários advocatícios. Pode tratar de ações de arbitramento de honorários contratuais, mas também podem resolver questões atinentes a honorários sucumbenciais, incluindo custas processuais* |
| `D58381` | Vermelho Telha | *Danos* | *Textos que resolvem disputas envolvendo responsabilidade civil (por ex: danos morais ou danos materiais) ou aplicação de multas e sanções.* |
| `BB946C` | Marrom Bronze | *Execução* | *Textos que resolvem questões atinentes à fase de cumprimento de sentença ou execução de título extrajudicial. Pode englobar questões como excesso de execução, penhoras, atribuição de efeito suspensivo à execução etc.* |
| `E9AA91` | Salmão / Coral | *Ações de consumo* | *Textos que tratam de modo específico de debates envolvendo o CDC. Pode englobar: inversão do ônus da prova, aplicação do CDC a um caso específico, dever de informação, venda casada, abusos em contratos de consumo etc.* |
| `FFFFFF` | Branco | Sem classificação de cor / Neutro | Modelos que não se encaixam em nenhuma categoria funcional de cor |

---

## 2. Categorias para Descrição (Prefixo obrigatório)

A descrição de todo modelo **deve iniciar** com uma das categorias abaixo em caixa alta, seguida de " - ". A categoria é o primeiro agrupador e determina como o modelo aparece na busca via `@`.

| Categoria | Quando usar | Quantidade atual |
|---|---|---|
| `ADMISS` | Questões de admissibilidade recursal: cabimento, dialeticidade, preparo/deserção, interesse recursal, tempestividade, documentos extemporâneos, pedidos em contrarrazões | 19 |
| `DESPACHO` | Atos ordinatórios de distribuição: receber recurso, intimar para preparo, deserção, retratação, prevenção, contrarrazões, AJG na distribuição | 16 |
| `LOCAÇÃO` | Direito locatício: despejo, fiança, benfeitorias, locativos, legitimidade em ações locatícias, prescrição locatícia | 14 |
| `ESTRUTURA` | Esqueletos e textos-base reutilizáveis: introduções de voto, relatórios, tutela de urgência genérica, julgamento virtual, prequestionamento | 9 |
| `AJG` | Gratuidade de justiça: deferimento e indeferimento para PF, PJ, MEI, microempresa | 6 |
| `ED` | Embargos de declaração: conceitos (omissão, contradição, obscuridade, erro material), introdução, prequestionamento | 6 |
| `EXECUÇÃO` | Processo de execução: penhora/impenhorabilidade, embargos à execução, exceção de pré-executividade, menor onerosidade, cálculos | 6 |
| `HONORÁRIOS` | Honorários advocatícios: fixação, equidade, majoração recursal, arbitramento, sucumbência, responsabilidade do advogado | 6 |
| `CONSUMIDOR` | Relações de consumo: teoria finalista, inversão do ônus da prova, notificação prévia, repetição de indébito | 4 |
| `NULIDADE` | Nulidades processuais: fundamentação (art. 489 CPC), outorga uxória, cerceamento de defesa | 4 |
| `BANCÁRIO` | Contratos bancários: RMC, exibição de documentos, produção antecipada de prova | 3 |
| `REVISIONAL` | Ações revisionais bancárias: venda casada, tarifas (TAC/TEC/IOF) | 2 |
| `PRESCRIÇÃO` | Prescrição e decadência como questão autônoma: pandemia/RJET, preclusão | 2 |
| `RESP. CIVIL` | Responsabilidade civil: dano moral, perda de uma chance | 2 |
| `CORRETAGEM` | Contrato de corretagem | 1 |
| `JUROS / CORREÇÃO` | Juros e correção monetária como questão autônoma: Lei 14.905/24, SELIC, IPCA | 1 |
| `PRELIMINAR` | Preliminares processuais autônomas: litigância predatória | 1 |
| `SANÇÕES / MULTAS` | Sanções processuais: litigância de má-fé, multas | 1 |

### Regras para escolha da categoria

1. A categoria reflete o **tema jurídico principal** do modelo, não sua posição processual.
2. Quando o tema do modelo se encaixa em mais de uma categoria, escolher a mais específica. Ex: prescrição de locativos → `LOCAÇÃO` (porque é prescrição específica do direito locatício); prescrição como questão autônoma → `PRESCRIÇÃO`.
3. Modelos sobre questões processuais de admissibilidade usam `ADMISS`, mesmo que tratem de deserção (que poderia ser `DESPACHO`). O critério é: se o modelo é sobre uma tese jurídica de admissibilidade, usa `ADMISS`; se é um despacho/ato ordinatório, usa `DESPACHO`.
4. `ESTRUTURA` é reservado para textos que servem como esqueleto ou introdução, sem conteúdo jurídico substantivo próprio.

---

## 3. Classificações (Tags)

Cada modelo recebe de **1 a 6 classificações** (média atual: 2,5 por modelo). As tags funcionam como um sistema multidimensional de busca e filtragem.

### 3.1 Tags Processuais (indicam a posição do modelo no fluxo processual)

| Tag | Descrição | Qtd atual |
|---|---|---|
| Distribuição | Modelos usados na fase de distribuição/triagem do recurso | 27 |
| Admissibilidade | Questões de admissibilidade recursal | 23 |
| Estrutura | Esqueletos, introduções, textos-base reutilizáveis | 17 |
| Agravo de instrumento | Modelos específicos ou aplicáveis a agravos de instrumento | 14 |
| Preparo | Questões de preparo recursal, deserção, custas | 12 |
| Apelação | Modelos específicos ou aplicáveis a apelações | 8 |
| Cabimento | Questões de cabimento/adequação do recurso | 8 |
| Preliminares | Questões preliminares ao mérito | 6 |
| Agravo interno | Modelos específicos ou aplicáveis a agravos internos | 4 |
| Retratação | Juízo de retratação em apelações contra sentenças extintivas | 3 |
| Interesse | Interesse recursal, interesse de agir | 3 |
| LIMINAR | Modelos sobre tutela de urgência, efeito suspensivo, efeito ativo | 3 |
| Dialeticidade | Princípio da dialeticidade recursal | 2 |
| Prevenção | Prevenção de competência, distribuição por dependência | 2 |
| Tempestividade | Questões de tempestividade recursal | 1 |
| Efeito Suspensivo à Apelação | Efeito suspensivo específico em apelações | 1 |

### 3.2 Tags Temáticas (indicam a matéria de direito)

| Tag | Descrição | Qtd atual |
|---|---|---|
| MÉRITO | Tag genérica indicando que o modelo trata de questão de mérito | 24 |
| Locação | Direito locatício, Lei 8.245/91 | 15 |
| Gratuidade de Justiça | AJG, hipossuficiência, custas | 10 |
| Execução | Processo de execução, cumprimento de sentença | 9 |
| Bancário | Contratos bancários, RMC, revisional | 8 |
| Honorários | Honorários advocatícios, sucumbência | 6 |
| CDC | Relações de consumo, Código de Defesa do Consumidor | 6 |
| Embargos de declaração | ED, omissão, contradição, obscuridade | 6 |
| Nulidades | Nulidades processuais, fundamentação | 5 |
| Prescrição | Prescrição, decadência, prazos extintivos | 5 |
| Responsabilidade Civil | Danos morais, danos materiais, perda de chance | 4 |
| Legitimidade Ativa | Questões de legitimidade ativa | 4 |
| Despejo | Ações de despejo, desocupação | 4 |
| Sucumbência | Sucumbência, fixação de honorários | 4 |
| Provas | Questões probatórias, ônus da prova, cerceamento | 3 |
| Legitimidade Passiva | Questões de legitimidade passiva | 3 |
| Juros e Correção Monetária | SELIC, IPCA, atualização monetária | 2 |
| Sanções / Multas | Litigância de má-fé, multas processuais | 2 |
| Penhora | Penhora, impenhorabilidade, constrição patrimonial | 2 |
| Fiança | Fiança locatícia, outorga uxória | 1 |

### Regras para atribuição de tags

1. **Sempre incluir** a tag temática principal (ex: modelo de locação → tag `Locação`).
2. **Sempre incluir** tags processuais relevantes (ex: modelo de cabimento de agravo → tags `Admissibilidade` + `Cabimento` + `Agravo de instrumento`).
3. **Usar `MÉRITO`** quando o modelo trata de questão substancial de mérito (não mero despacho ou admissibilidade pura).
4. **Usar `Distribuição`** em modelos que são utilizados na fase de distribuição/triagem.
5. **Combinar livremente** tags processuais e temáticas. Ex: `Admissibilidade - Cabimento - Distribuição - Execução` combina 3 tags processuais + 1 temática.
6. As tags são separadas por " - " no campo Classificação do e-Proc.

---

## 4. Prefixos para Siglas

A sigla (máximo 30 caracteres) segue o formato `prefixo-tema-detalhe`, usando hífens como separadores, sem espaços.

| Prefixo | Tema | Exemplos |
|---|---|---|
| `adm` | Admissibilidade (teses) | adm-cab-embexec, adm-dialeticidade-intro |
| `desp` | Despacho processual | desp-ai-recebimento, desp-retrat-improced |
| `estr` | Estrutura / Esqueleto | estr-voto-generico, estr-tutela-300 |
| `ajg` | Gratuidade de Justiça | ajg-pf-deferir, ajg-pj-indefere |
| `loc` | Locação | loc-despejo-caução, loc-legit-propriedade |
| `ed` | Embargos de Declaração | edintro, edobscuridade, edcontradição |
| `exec` | Execução / Penhora | exec-impen-bemfam-completo |
| `hon` | Honorários | hon-equidade-distorção, hon-recursais-nao-fixa-majora |
| `ban` | Bancário / Revisional | ban-rmc-revisao-inviabil, ban-seguro-venda-casada |
| `cdc` | Consumidor / CDC | cdc-finalismo-mitigado, cdc-inversao-onus-limites |
| `nulid` | Nulidades | nulid-489-iv, nulid-outorga-uxoria |
| `presc` | Prescrição | presc-preclusao-interloc |
| `danos` | Responsabilidade Civil / Danos | danos-adv-perda-chance |
| `ipca` | Juros e Correção Monetária | ipca-selic |

> **NOTA**: Alguns modelos legados ainda não seguem o padrão de prefixo com hífens (ex: `edobscuridade` sem hífen, `embargos sem garantia` com espaços, `corretagemintro` sem separação). Esses devem ser padronizados conforme oportunidade.

---

## 5. Regras para a Descrição (200 caracteres)

A descrição de cada modelo tem **duas funções simultâneas**: ser legível por humano (para que o assessor entenda o conteúdo sem abrir o modelo) e ser pesquisável via `@` (cada palavra é um termo de busca).

### Formato observado na base atual

Na prática, os modelos atuais utilizam **três estilos**, todos válidos:

**Estilo A — Frase legível + keywords entre parênteses (preferencial, 59% dos modelos)**
```
ADMISS - Inadmissibilidade de agravo contra decisão em embargos à execução (ação de conhecimento incidental, rol taxativo, art. 1.015, parágrafo único, REsp 1.682.120/RS)
```
A frase antes dos parênteses é o título legível. Os parênteses contêm termos de busca adicionais (artigos de lei, nomes de precedentes, sinônimos).

**Estilo B — Frases descritivas separadas por ponto (17% dos modelos)**
```
ED - Definição de contradição sanável. Necessidade de vício interno entre proposições do próprio julgado. Inviabilidade de alegar contradição com prova, lei ou entendimento da parte.
```
Usado quando o modelo precisa descrever múltiplos aspectos conceituais. Cada frase adiciona informação substantiva.

**Estilo C — Keywords (24% dos modelos, geralmente despachos curtos)**
```
DESPACHO - Apelação sentença extintiva inércia do autor retratação abandono intimação pessoal 485
```
Usado em despachos simples onde o título por si só já é suficiente e não há necessidade de parênteses.

### Regras para novos modelos

1. **Iniciar sempre com a CATEGORIA em caixa alta**, seguida de " - ".
2. **Escrever uma frase legível** que descreva o conteúdo do modelo de forma que qualquer assessor entenda do que se trata sem abrir o arquivo.
3. **Incluir entre parênteses** os termos de busca adicionais: artigos de lei, números de REsp/Tema, sinônimos, termos que o assessor poderia digitar via `@`. Não repetir palavras que já aparecem na frase legível.
4. **Nunca ultrapassar 200 caracteres.**
5. **Priorizar clareza sobre quantidade de keywords.** Um assessor deve conseguir ler a descrição e decidir se precisa abrir o modelo.

---

## 6. Modelos Catalogados

> 104 modelos organizados em 18 categorias.
> O assistente deve consultar esta lista para evitar duplicatas e manter consistência.

### 6.1 ADMISS (19 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| adm-dialet-afasta-preliminar | Afastar preliminar de ofensa à dialeticidade | Admissibilidade · MÉRITO · Dialeticidade |
| adm-legit-assercao-stj | Legitimidade passiva pela teoria da asserção | Legitimidade Passiva · Preliminares |
| desp-desercao-guia-simples | Deserção guia simples pagamento dobro | Distribuição · Admissibilidade · Preparo |
| desp-desercao-5dias | Deserção pagamento preparo cinco dias | Distribuição · Admissibilidade · Preparo |
| desp-desercao-1grau | Deserção preparo recolhido guia primeiro grau | Distribuição · Preparo · Admissibilidade · Agravo de instrumento |
| adm-cab-embexec | Inadmissibilidade agravo em embargos à execução | Admissibilidade · Cabimento · Distribuição · Execução |
| adm-cab-ajg-deferida-nao-revog | Inadmissibilidade agravo - deferimento AJG/revogação | Admissibilidade · Cabimento · Distribuição · Gratuidade de Justiça |
| adm-cab-audiencia | Inadmissibilidade agravo - audiência de conciliação | Admissibilidade · Agravo de instrumento · Cabimento · Distribuição |
| adm-cab-provas | Inadmissibilidade agravo - produção de provas | Admissibilidade · Agravo de instrumento · Cabimento · Distribuição · Provas |
| adm-cab-legitimidade-mantida | Inadmissibilidade agravo - ilegitimidade mantida | Admissibilidade · Agravo de instrumento · Cabimento · Legitimidade Ativa · Legitimidade Passiva · Distribuição |
| adm-cab-despacho | Inadmissibilidade agravo - emenda da inicial | Admissibilidade · Cabimento · Distribuição · Agravo de instrumento |
| adm-cab-extinção-execução | Inadmissibilidade agravo - extinção da execução | Admissibilidade · Cabimento · Agravo de instrumento · Distribuição · Execução |
| adm-cab-revelia | Inadmissibilidade agravo - revelia | Admissibilidade · Cabimento · Distribuição · Agravo de instrumento |
| adm-docs-extemporaneos | Documentos extemporâneos em grau recursal | Admissibilidade · MÉRITO · Provas |
| adm-contrarraz-pedidos | Pedidos em contrarrazões sem recurso próprio | Admissibilidade · MÉRITO |
| adm-interesse-recursal-intro | Ausência de interesse recursal | Admissibilidade · Interesse |
| adm-dialeticidade-intro | Violação à dialeticidade | Admissibilidade · Agravo de instrumento · Agravo interno · Apelação · Estrutura · Dialeticidade |
| embargos como reconsideração | AI - ED recebidos como reconsideração | Distribuição · Admissibilidade · Tempestividade · Agravo de instrumento |
| afastar falta de interesse | Rejeição de falta de interesse de agir | Preliminares · Interesse |

### 6.2 DESPACHO (16 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| desp-ai-contrarraz | Intimar agravado para contrarrazões | Agravo de instrumento |
| desp-ajg-custasfinais | AJG indeferida - recolher custas finais | Distribuição · Preparo · Gratuidade de Justiça |
| desp-ajg-pf-indefere | AJG PF indeferir - intimar preparo | Distribuição · Preparo · Gratuidade de Justiça |
| desp-ajg-pj-indefere | AJG PJ indeferir - intimar preparo | Distribuição · Preparo · Gratuidade de Justiça |
| desp-retrat-improced | Retratação - improcedência liminar | Distribuição · Apelação · Retratação |
| desp-retrat-indeferida | Retratação - indeferimento da inicial | Distribuição · Apelação · Retratação |
| desp-retrat-inercia | Retratação - inércia do autor | Distribuição · Apelação · Retratação |
| desp-guia-preparo | Emissão de guia para preparo recursal | Distribuição · Preparo |
| desp-prep-complem-simples | Complementar preparo insuficiente (5 dias) | Admissibilidade · Distribuição · Preparo |
| desp-prep-dobro-silencio | Preparo em dobro - ausência de comprovação | Admissibilidade · Distribuição · Preparo |
| desp-prep-dobro-intempes | Preparo em dobro - intempestividade | Admissibilidade · Distribuição · Preparo · Agravo de instrumento |
| desp-prep-dobro-procdivers | Preparo em dobro - guia de processo diverso | Admissibilidade · Distribuição · Preparo |
| desp-prep-1grau | Preparo recolhido no primeiro grau | Admissibilidade · Distribuição · Preparo · Agravo de instrumento |
| Prevenção - recurso prévio | Declinar competência - recurso prévio | Distribuição · Prevenção |
| desp-ai-recebimento | Receber AI sem efeito suspensivo | Distribuição |
| desp-prevencao-resc | Rescisória extinta - prevenção | Distribuição · Prevenção |

### 6.3 LOCAÇÃO (14 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| loc-legit-pass-imobil | Legitimidade passiva da imobiliária | Locação · Legitimidade Passiva |
| loc-moradia-funcaosocial | Função social da moradia vs. despejo | Locação · Despejo |
| loc-ilegit-imobiliaria | Ilegitimidade ativa da administradora | Locação · Legitimidade Ativa |
| loc-legit-propriedade | Legitimidade ativa independe de propriedade | Locação · Legitimidade Ativa |
| loc-legit-novo-proprietario | Legitimidade do novo proprietário | Locação · Legitimidade Ativa |
| loc-vistoria-notif | Notificação prévia para vistoria final | Locação · MÉRITO |
| loc-apel-efeito-susp | Efeito suspensivo à apelação em despejo | Locação · Efeito Suspensivo à Apelação |
| loc-multas-bisidem | Cumulação de multas - bis in idem | Locação · MÉRITO |
| loc-despejo-caução | Dispensa de caução - despejo liminar | Locação · Despejo |
| loc-prescricao-trienal | Prescrição trienal de locativos | Locação · Prescrição · MÉRITO |
| loc-despejo-fianca | Despejo liminar - exoneração de fiança | Locação · Despejo |
| loc-resp-imobil-mand | Responsabilidade da imobiliária | Locação · MÉRITO |
| loc-locativos-reparos | Locativos após entrega das chaves | Locação · MÉRITO |
| loc-benfeit-renuncia | Renúncia a benfeitorias | Locação · MÉRITO |

### 6.4 ESTRUTURA (9 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| estr-voto-generico | Esqueleto genérico voto recurso | Estrutura · Agravo de instrumento · Apelação |
| estr-ai-tutela-intro | Introdução AI - efeito suspensivo/tutela | Agravo de instrumento · Estrutura · LIMINAR |
| estr-loc-despejo-liminar | Liminar de despejo - introdução | Estrutura · Despejo · Locação · LIMINAR |
| estr-tutela-300 | Pressupostos da tutela de urgência | Estrutura · LIMINAR |
| estr-prequestionamento | Prequestionamento ficto de teses | Estrutura · MÉRITO |
| estr-relat-agrint | Relatório introdutório agravo interno | Estrutura · Agravo interno |
| estr-relat-generico | Relatório introdutório genérico | Estrutura · Agravo interno · Apelação |
| estr-julg-virtual-ritjrs | Julgamento virtual - certificação | Estrutura · Admissibilidade |
| estr-voto-agrint | Voto agravo interno padrão | Estrutura · Agravo interno |

### 6.5 AJG (6 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| ajg-mei-defere | Empresário individual / MEI - deferir | Gratuidade de Justiça · MÉRITO |
| ajg-pj-defere | Pessoa jurídica - deferir | Gratuidade de Justiça · MÉRITO |
| ajg-pj-indefere | Pessoa jurídica - indeferir | Gratuidade de Justiça · MÉRITO |
| ajg-pf-indeferir | Pessoa física - indeferir (>5 SM) | MÉRITO · Gratuidade de Justiça |
| ajg-pf-deferir | Pessoa física - deferir | Gratuidade de Justiça · MÉRITO |
| AJG-pj-liquidação-indefere | PJ em liquidação extrajudicial - Portocred | Gratuidade de Justiça · MÉRITO |

### 6.6 ED (6 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| edobscuridade | Conceito de obscuridade | Estrutura · Embargos de declaração |
| edcontradição | Conceito de contradição sanável | Estrutura · Embargos de declaração |
| ederromaterial | Conceito de erro material | Estrutura · Embargos de declaração |
| edomissão | Dever de fundamentação - limites (489 §1º IV) | Estrutura · Embargos de declaração |
| edintro | Natureza jurídica - função integradora | Estrutura · Embargos de declaração |
| eds-prequestionamento | Prequestionamento ficto - art. 1.025 CPC | Estrutura · Embargos de declaração |

### 6.7 EXECUÇÃO (6 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| OI - CÁLCULO - PRECLUSÃO | Cálculos - metodologia e critérios | Execução · Juros e Correção Monetária |
| embargos sem garantia | Embargos à execução - efeito suspensivo | Execução |
| excesso de execução-exceção | Exceção de pré-executividade - excesso | Execução |
| exec-impen-bemfam-completo | Impenhorabilidade bem de família | Execução · Penhora |
| exec-impen-rural-completo | Impenhorabilidade propriedade rural | Execução · Penhora |
| exec-menor-onerosidade | Menor onerosidade vs. efetividade | Execução |

### 6.8 HONORÁRIOS (6 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| hon-arbit-revog-intro | Arbitramento - revogação de mandato | Honorários · MÉRITO |
| hon-presc-interrup-exito | Cobrança - prescrição - cláusula de êxito | Honorários · MÉRITO · Prescrição |
| hon-recursais-nao-fixa-majora | Honorários recursais - não fixar/majorar | Honorários · Sucumbência |
| hon-resp-adv-sem-mandato | Responsabilização do advogado sem procuração | Honorários · Nulidades · Sucumbência |
| hon-rev-banc-vlcausa | Revisional - fixação sobre valor da causa | Honorários · Sucumbência · Bancário |
| hon-equidade-distorção | Fixação por equidade - proveito inestimável | Honorários · Sucumbência |

### 6.9 CONSUMIDOR (4 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| cdc-finalismo-mitigado | Teoria finalista mitigada - CDC à PJ | CDC · MÉRITO |
| cdc-inversao-onus-limites | Inversão do ônus da prova - limites | Provas · CDC |
| cdc-notifi-eletronica-validade | Notificação prévia por e-mail/SMS | CDC · MÉRITO · Responsabilidade Civil |
| repetição indébito dobro | Repetição em dobro do indébito | CDC · Sanções / Multas · Responsabilidade Civil |

### 6.10 NULIDADE (4 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| nulid-489-iv | Dever de enfrentar argumentos (489 IV) | Nulidades |
| nulid-489-iii | Fundamentação genérica (489 III) | Nulidades |
| nulid-outorga-uxoria | Outorga uxória - fiança/aval | Fiança · Nulidades |
| nulid-cerceam-prejuizo | Cerceamento de defesa - decisão surpresa | Nulidades |

### 6.11 BANCÁRIO (3 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| ban-exibição-interesse-agir | Produção antecipada de prova - exibição | CDC · Bancário · Interesse |
| ban-rmc-revisao-inviabil | RMC - revisão/conversão inviável | Bancário |
| ban-rmc-repeticao-simples | RMC - repetição de indébito simples | Bancário |

### 6.12 REVISIONAL (2 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| ban-seguro-venda-casada | Seguro prestamista - venda casada | Bancário |
| ban-tarifas-tac-tec-iof | Tarifas TAC/TEC/IOF | Bancário · MÉRITO |

### 6.13 PRESCRIÇÃO (2 modelos)

| Sigla | Descrição (resumida) | Classificações |
|---|---|---|
| presc-preclusao-interloc | Prejudicial em apelação - preclusão | Preliminares · Apelação · Prescrição |
| prescição-pandemia-rjet-stj | Suspensão pela Lei 14.010/2020 (RJET) | Prescrição · Preliminares |

### 6.14 Demais categorias (5 modelos)

| Sigla | Categoria | Descrição (resumida) | Classificações |
|---|---|---|---|
| ban-rmc-prescrIção-decadência | BANCÁRIO | RMC - prescrição e decadência | Bancário · Preliminares · Prescrição |
| corretagemintro | CORRETAGEM | Texto introdutório - corretagem | Estrutura · MÉRITO |
| ipca-selic | JUROS / CORREÇÃO | Lei 14.905/24 - IPCA e SELIC | Juros e Correção Monetária · Execução · MÉRITO |
| danos-banc-desconto-indevido | RESP. CIVIL | Dano moral - fraude empréstimo consignado | CDC · Apelação · Responsabilidade Civil · Bancário |
| danos-adv-perda-chance | RESP. CIVIL | Perda de uma chance - advogado | Responsabilidade Civil · MÉRITO |
| adm-advocacia-predatoria | PRELIMINAR | Litigância predatória - rejeição | Preliminares |
| litigância-ma-fe-geral | SANÇÕES / MULTAS | Litigância de má-fé - critérios | Sanções / Multas |

---

## 7. Notas e Decisões do Gabinete

- 23/02/2026 — Base consolidada com 104 modelos, reorganização completa de descrições, siglas e classificações.
- 23/02/2026 — Tabela de cores HEX mapeada, aguardando vinculação definitiva cor↔tipo funcional pelo usuário.
- 23/02/2026 — Siglas legadas com formato antigo (sem hífens, com espaços) identificadas para padronização futura.
