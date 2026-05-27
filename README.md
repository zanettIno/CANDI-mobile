# CANDI Mobile — Documentação Técnica Completa

> Aplicativo React Native para pacientes oncológicos: diário de saúde, agenda de tratamento, rede de apoio e comunidade.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Stack Técnica](#stack-técnica)
3. [Arquitetura e Navegação](#arquitetura-e-navegação)
4. [Design System (Tema)](#design-system-tema)
5. [Contextos Globais](#contextos-globais)
6. [Serviços (Services)](#serviços-services)
7. [Telas (Screens)](#telas-screens)
8. [Componentes Reutilizáveis](#componentes-reutilizáveis)
9. [Regras de Negócio no Frontend](#regras-de-negócio-no-frontend)
10. [Fluxos Principais](#fluxos-principais)
11. [Variáveis de Ambiente](#variáveis-de-ambiente)
12. [Estrutura de Pastas](#estrutura-de-pastas)
13. [Como Rodar](#como-rodar)

---

## Visão Geral

O CANDI Mobile é um aplicativo React Native com Expo voltado para pacientes com câncer. Ele oferece:

- **Diário de saúde** — registro de entradas diárias em texto livre armazenadas no S3
- **Agenda de tratamento** — compromissos, medicamentos, sintomas e relatórios
- **Rede de apoio** — familiares/cuidadores convidados via token podem acompanhar o paciente (somente leitura)
- **Comunidade** — feed público, grupos privados, chat 1-1 e em grupo, posts com mídia
- **Marcos do tratamento** — checkpoints de progresso
- **Painel admin** — moderação de posts, gestão de usuários banidos, gestão de admins
- **Painel de suporte** — visualização somente-leitura do diário, agenda e marcos do paciente vinculado

---

## Stack Técnica

| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.81 | Framework mobile |
| Expo | 54 | Build, EAS, plugins nativos |
| Expo Router | 4.x | Navegação file-based (tabs + stack) |
| TypeScript | 5.x | Tipagem estática |
| TanStack Query | 5.x | Cache e fetching de dados |
| React Native Paper | 5.x | Componentes Material Design |
| @expo-google-fonts/kadwa | — | Fonte Kadwa (títulos) |
| @expo-google-fonts/inter | — | Fonte Inter (corpo) |
| react-native-calendars | — | Calendário com multi-dot marking |
| react-native-safe-area-context | — | Insets de SafeArea |
| @react-navigation/native | — | `useScrollToTop`, primitivos de navegação |
| AsyncStorage | — | Persistência local de tokens, cache de role |
| Socket.IO Client | — | WebSocket em tempo real |
| react-native-paper-dates | — | Date picker |
| expo-image-picker | — | Seleção de fotos do usuário |

---

## Arquitetura e Navegação

### Sistema de Arquivos (Expo Router)

O Expo Router mapeia a estrutura de arquivos em rotas automaticamente. O fluxo de inicialização é:

```
_layout.tsx (Root)
 └── AuthGate (verifica token + role)
      ├── / (index.tsx) → Login
      ├── /cadastro → Registro de Paciente
      ├── /cadastroSupport → Registro de Suporte via convite
      ├── /screens/(tabs)/ → App do Paciente (Bottom Tabs)
      ├── /screens/admin/ → Painel Admin
      └── /screens/support/ → Painel de Suporte
```

### AuthGate — Proteção e Redirecionamento por Role

O `AuthGate` em `_layout.tsx` roda em toda mudança de segmento de rota. Ele:

1. Verifica se existe `accessToken` em AsyncStorage
2. Se não houver token e o usuário estiver em rota protegida → redireciona para `/`
3. Se houver token, lê `userRole` do cache (AsyncStorage) ou busca em `GET /auth/me`
4. Redireciona baseado na role:

| Role | Área permitida | Redireciona se tentar acessar |
|---|---|---|
| `patient` | `/screens/(tabs)/...` | `/admin` ou `/support` → vai para `/screens/(tabs)/home` |
| `support` | `/screens/support/...` | `(tabs)` ou `/admin` → vai para `/screens/support` |
| `admin` | `/screens/admin/...` | `(tabs)` ou `/support` → vai para `/screens/admin` |

> O cache de role (`AsyncStorage.setItem('userRole', role)`) evita chamada à API em cada navegação. É limpo no logout.

### Bottom Tabs (Paciente)

Configuradas em `src/app/screens/(tabs)/_layout.tsx`:

| Índice | Rota | Ícone | Tela |
|---|---|---|---|
| 0 | `homeCommunity` | `people` | Comunidade |
| 1 | `homeAgenda` | `event` | Agenda |
| 2 | `home` | `home` | Início (Home) |
| 3 | `homeDiary` | `book` | Diário |
| 4 | `homeProfile` | `person` | Perfil |

> A tab `adminDummy` aparece condicionalmente para usuários `admin` no fluxo de tabs.

### Stack Screens Registradas

Telas registradas em `_layout.tsx` fora das tabs (abrem como modais/stack sobre as tabs):

```
screens/community/chatCommunity     — Chat privado 1-1
screens/community/groupCommunity    — Chat de grupo
screens/community/postDetail        — Detalhes de post com comentários
screens/admin/index                 — Painel Admin
screens/support/index               — Painel de Suporte (home)
screens/support/diary               — Diário do paciente (somente leitura)
screens/support/diaryEntry          — Entrada específica do diário
screens/support/agenda              — Agenda do paciente (somente leitura)
screens/support/marcos              — Marcos do paciente (somente leitura)
screens/profile/invite              — Gerenciar rede de apoio
screens/profile/about               — Sobre o CANDI
screens/profile/help                — Ajuda (FAQ)
screens/profile/marcosView          — Listar marcos
screens/profile/marcosAdd           — Criar marco
screens/profile/marcosEdit          — Editar marco
screens/diary/passagemAdd           — Nova entrada de diário
screens/diary/passagemRead          — Ler entrada de diário
screens/diary/sentimentosAdd        — Adicionar sentimento
```

---

## Design System (Tema)

Definido em `src/theme/index.ts` e consumido via `AppTheme` em todo o app.

### Paleta de Cores

```typescript
AppTheme.colors = {
  primary:             '#FFC4C4',  // Rosa claro — bordas de avatar, eventos, FAB diary
  secondary:           '#CFFFE5',  // Verde menta — backgrounds de cards, badges
  tertiary:            '#759AAB',  // Azul teal — texto ativo, ícones, botões primários
  background:          '#F6F6F6',  // Cinza claro — fundo de telas
  cardBackground:      '#FFFFFF',  // Branco — cards, top bar, nav
  textColor:           '#413F42',  // Cinza escuro — texto principal
  nameText:            '#1A1A2E',  // Quase preto — nomes, títulos
  placeholderText:     '#9E9E9E',  // Cinza médio — placeholders, subtítulos
  dotsColor:           '#CCCCCC',  // Cinza — separadores, bordas suaves
}
```

### Fontes

Duas famílias de fontes carregadas via `@expo-google-fonts`:

- **Kadwa** — usada em títulos, headings (`fontFamily: 'Kadwa_700Bold'`)
- **Inter** — usada em corpo de texto e labels (`fontFamily: 'Inter_400Regular'`, `'Inter_500Medium'`, `'Inter_600SemiBold'`, `'Inter_700Bold'`)

Tokens disponíveis em `AppTheme.fonts`:

| Token | Família | Tamanho | Peso |
|---|---|---|---|
| `bodySmall` | Inter | 12px | 400 |
| `bodyMedium` | Inter | 14px | 400 |
| `bodyLarge` | Inter | 16px | 400 |
| `labelSmall` | Inter | 11px | 500 |
| `labelMedium` | Inter | 12px | 500 |
| `labelLarge` | Inter | 14px | 600 |
| `titleSmall` | Kadwa | 14px | 700 |
| `titleMedium` | Kadwa | 16px | 700 |
| `titleLarge` | Kadwa | 22px | 700 |
| `headlineLarge` | Kadwa | 32px | 700 |

### Arredondamento

`AppTheme.roundness = 50` — bordas arredondadas padrão para componentes Paper.

---

## Contextos Globais

### ProfileContext (`src/context/ProfileContext.tsx`)

Provê os dados do perfil do usuário logado para todo o app. Carregado uma vez no mount e atualizado via `refreshProfile()`.

```typescript
interface ProfileContextData {
  profileId: string;
  profileName: string;
  profileNickname: string;
  profileEmail: string;
  avatarUri: string | null;   // URL da foto no S3 (profile-images/{id}.jpg)
  role: 'patient' | 'support' | 'admin';
  linkedPatients: Patient[];  // Somente para role=support
  selectedPatient: Patient | null;
  refreshProfile: () => Promise<void>;
}
```

**Chamadas API:**
- `GET /auth/me` — dados do próprio usuário
- `GET /auth/my-patients` — lista de pacientes vinculados (só para `support`)

---

### ChatContext (`src/context/ChatContext.tsx`)

Gerencia o estado global do chat: badge de não lidas e triggers de refresh.

```typescript
interface ChatContextData {
  totalUnread: number;
  activeConversationId: string | null;
  inboxRefreshKey: number;
  feedRefreshKey: number;
  setTotalUnread: (n: number) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
  setActiveConversationId: (id: string | null) => void;
  triggerInboxRefresh: () => void;
  triggerFeedRefresh: () => void;
}
```

**Uso:** O `GlobalSocketController` chama `incrementUnread()` e `triggerInboxRefresh()` quando recebe evento `inbox_update` via WebSocket. O badge da tab de comunidade é lido de `totalUnread`.

---

### NotificationContext (`src/context/NotificationContext.tsx`)

Sistema de notificações in-app (toasts/banners).

```typescript
useToast().success('Mensagem')   // Banner verde
useToast().error('Mensagem')     // Banner vermelho
useToast().warning('Mensagem')   // Banner amarelo
useToast().info('Mensagem')      // Banner azul
```

Notificações podem ter `conversationId` para exibir botão de ação "Ver mensagem" no banner de chat.

---

## Serviços (Services)

### authService.js

Gerencia tokens JWT. É o único serviço em `.js` (não TypeScript) por razões históricas.

```javascript
login(email, password)         // POST /auth/login → salva tokens em AsyncStorage
loginWithGoogle(googleUser)    // POST /auth/google → salva tokens
getValidAccessToken()          // Retorna token válido; faz refresh automático se expirado
```

**Lógica de refresh (mutex):**
- Decodifica o JWT localmente para verificar `exp` (sem chamada API)
- Margem de segurança: renova 60 segundos antes de expirar
- Mutex `refreshPromise` evita múltiplos refreshes paralelos
- Se refresh falhar: remove tokens do AsyncStorage e lança erro

---

### adminService.ts

Wrapper sobre `fetchAdmin()` que injeta o token automaticamente. Todos os endpoints exigem role `admin` no backend.

```typescript
getAdminStats()                                    // GET /admin/stats
getAllReportedPosts()                               // GET /admin/reports/all
getSuspendedPosts()                                // GET /admin/posts/suspended
approvePost(postId)                                // PATCH /admin/posts/:id/approve
removePost(postId)                                 // PATCH /admin/posts/:id/remove
getBannedUsers()                                   // GET /admin/users/banned
unbanUser(userId)                                  // PATCH /admin/users/:id/unban
getAdmins()                                        // GET /admin/admins
createAdmin({ name, email, password })             // POST /admin/admins
deleteAdmin(adminId)                               // DELETE /admin/admins/:id
updateMyCredentials({ email?, password?, current_password }) // PATCH /admin/me/credentials
```

---

### chatService.ts

```typescript
getInbox()                                  // GET /chat/inbox
getMessages(conversationId)                 // GET /chat/messages/:id
sendMessage(conversationId, content)        // POST /chat/messages/:id
startConversationByEmail(email)             // POST /chat/start
getReadStatus(conversationId)               // GET /chat/read-status/:id
```

---

### communityService.ts

```typescript
// Grupos
listGroups(topic?)
getMyGroups()
getGroup(groupId)
createGroup(data)
updateGroup(groupId, data)
deleteGroup(groupId)
joinGroup(groupId)
leaveGroup(groupId)
getGroupMembers(groupId)
getMyGroupStatus(groupId)
getGroupRequests(groupId)
approveOrRejectRequest(groupId, profileId, action)
removeMember(groupId, profileId)
updateMemberRole(groupId, profileId, role)
uploadGroupImage(groupId, formData, type)     // type: 'photo' | 'banner'

// Posts & Likes
getGroupPosts(groupId)
toggleLike(postId)
getPostLikes(postId)
toggleFavorite(postId)
getMyFavorites()
getMyFavoritedPosts()

// Comentários
getComments(postId)
addComment(postId, content)
deleteComment(postId, commentId)

// Outros
sharePostToChat(postId, conversationId)
reportPost(postId, reason)
createPostWithImage(formData, topic?, subgroup?)
```

---

### feedService.ts

```typescript
getPosts(hashtag?, limit?, lastKey?)   // GET /feed/posts (paginação cursor-based)
getPostsByTopic(topic)
createPost(content, topic?, image?)    // POST /feed/posts (multipart se houver imagem)
deletePost(postId)                     // DELETE /feed/posts/:id
```

**Paginação:** cursor-based via `lastKey`. Retorna `{ items[], lastKey }`. O frontend acumula os itens e envia o `lastKey` da última página para buscar mais.

---

### inviteService.ts

```typescript
createInvite(email, permissions[])     // POST /auth/invite
getInviteInfo(token)                   // GET /auth/invite/:token
registerSupport(data)                  // POST /auth/register-support
getMyInvites()                         // GET /auth/my-invites
getSupportNetwork()                    // GET /auth/support-network
removeSupportMember(supportId)         // DELETE /auth/support-network/:id
revokeInvite(inviteToken)              // DELETE /auth/invite/:token
getMyPatients()                        // GET /auth/my-patients
```

---

### socketService.ts

Wrapper sobre Socket.IO client. Instância singleton.

```typescript
initializeSocket()      // Conecta com Bearer token no handshake
getSocket()             // Retorna instância (ou null se desconectado)
disconnectSocket()
isSocketConnected()
```

**Eventos recebidos:**
- `inbox_update` — nova mensagem para o usuário
- `new_post` — novo post no feed global

**Eventos emitidos pelo servidor:**
- `new_message` — mensagem em conversa
- `messages_read` — leitura confirmada
- `kicked_from_group` — remoção de grupo

---

### notifications.ts

Gerencia notificações push locais (Expo Notifications).

```typescript
requestPermissions()
scheduleAppointmentNotification(appointment)   // Notifica 1h antes
scheduleMedicineNotification(medicine)         // Notifica no horário diário
cancelNotification(id)
```

---

## Telas (Screens)

### Autenticação

| Tela | Arquivo | Descrição |
|---|---|---|
| Login | `index.tsx` | Email/senha + Google OAuth + link "Esqueci senha" |
| Registro | `cadastro.tsx` | Nome, email, senha, data nascimento, tipo de câncer |
| Registro Suporte | `cadastroSupport.tsx` | Lê convite via `?invite=token`, valida token, cria conta de suporte |

---

### Tabs — Paciente

#### Home (`screens/(tabs)/home.tsx`)
Dashboard principal do paciente. Exibe:
- Saudação dinâmica (bom dia/tarde/noite) com nome
- **Contatos emergenciais** em cards tocáveis que abrem `tel:` diretamente
- **Marcos do tratamento** — progress bar + lista dos checkpoints
- **Atalho para comunidade** — shortcut para o feed
- **Timeline de eventos** próximos do calendário
- **Carrossel** com informações e programas CANDI
- Botão de publicação rápida no feed

#### Agenda (`screens/(tabs)/homeAgenda.tsx`)
Visão geral da agenda de saúde. Inclui:
- Calendário com `multi-dot` marking:
  - Ponto rosa (`primary`) = tem compromisso
  - Ponto teal (`tertiary`) = tem sintoma registrado
- Lista de compromissos do dia selecionado
- Lista de sintomas do dia selecionado
- Seção de **medicamentos ativos** (sempre visíveis, não filtram por data)
- Grid de acesso rápido: Compromissos, Sintomas, Medicamentos, Relatório
- FAB para criar compromisso

#### Diário (`screens/(tabs)/homeDiary.tsx`)
Tela principal do diário. Exibe:
- Card "hoje" com botão para escrever nova entrada
- Estatísticas: total de entradas, dias consecutivos, mês atual
- Navegador de meses com dots de progresso
- Lista de entradas do mês selecionado (toca para ler)
- Frases motivacionais aleatórias
- FAB para nova entrada

#### Perfil (`screens/(tabs)/homeProfile.tsx`)
Perfil do usuário com:
- Foto de perfil (toca para abrir `ProfilePictureModal`)
- Nome, email, tipo de câncer
- Acesso à rede de apoio, marcos, contatos emergenciais
- Links para Ajuda, Sobre
- Logout com confirmação

#### Comunidade (`screens/(tabs)/homeCommunity/`)
Três sub-telas via tabs interno:
- `homeApp.tsx` — Feed global de posts + busca por hashtag
- `groupView.tsx` — Listagem de grupos por tópico, criar grupo
- `messagesView.tsx` — Inbox de conversas privadas com badge de não lidas

---

### Agenda (Sub-telas)

| Arquivo | Função |
|---|---|
| `compromissosView.tsx` | Lista todos os compromissos com data/hora/local |
| `compromissosAdd.tsx` | Formulário: nome, data, hora, local, notas, toggle lembrete |
| `medicamentosView.tsx` | Lista medicamentos com dosagem/posologia/período |
| `medicamentosAdd.tsx` | Formulário: nome, dosagem, posologia, período, obs, horário lembrete |
| `sintomasView.tsx` | Lista sintomas registrados com data |
| `sintomasAdd.tsx` | Formulário: dropdown de sintomas predefinidos + "outro" livre |
| `relatorio.tsx` | Relatório consolidado: gráficos de sintomas, compromissos, medicamentos |

---

### Diário (Sub-telas)

| Arquivo | Função |
|---|---|
| `passagemView.tsx` | Lista de entradas em formato lista |
| `passagemAdd.tsx` | Editor de nova entrada: texto livre, mood slider |
| `passagemRead.tsx` | Visualização de entrada existente (estilo papel de diário com linhas) |
| `sentimentosAdd.tsx` | Registrar sentimento/humor: escala 0-10 + observação |
| `sentimentosView.tsx` | Histórico de sentimentos com data |

---

### Comunidade (Sub-telas)

| Arquivo | Função |
|---|---|
| `postDetail.tsx` | Post completo com seção de comentários |
| `chatCommunity.tsx` | Chat privado 1-1 com WebSocket em tempo real |
| `groupCommunity.tsx` | Chat de grupo com lista de membros, admin actions |
| `groupAdd.tsx` | Criar novo grupo: nome, descrição, tipo, visibilidade |
| `messagesAdd.tsx` | Iniciar nova conversa: busca usuário por nome/email |

---

### Perfil (Sub-telas)

| Arquivo | Função |
|---|---|
| `invite.tsx` | Gerenciar rede de apoio: enviar convite (email + permissões), ver membros ativos, revogar |
| `marcosView.tsx` | Listar marcos com progress bar e status |
| `marcosAdd.tsx` | Criar novo marco: título, data alvo, descrição |
| `marcosEdit.tsx` | Editar marco existente |
| `contatosView.tsx` | Listar contatos emergenciais |
| `contatosAdd.tsx` | Criar contato: nome, telefone, relação |
| `help.tsx` | FAQ com perguntas e respostas expansíveis |
| `about.tsx` | Sobre o projeto CANDI e o grupo |

---

### Painel Admin (`screens/admin/index.tsx`)

Exclusivo para usuários com `role = 'admin'`. Navegação por bottom tabs internos:

| Tab | Conteúdo |
|---|---|
| **Visão Geral** | Stats: posts reportados, banidos, total denúncias; alertas de posts críticos |
| **Denúncias** | Lista todos os posts com ≥1 denúncia; mostra motivos; botões Aprovar/Remover |
| **Banidos** | Lista usuários banidos automaticamente; botão Desbanir |
| **Admins** | Visível apenas para `is_superadmin = true`; criar/deletar admins |
| **Conta** | Alterar email e senha do próprio admin; logout |

**Regra de acesso à aba Admins:** calculada em runtime via `admins.some(a => a.profile_id === profileId && a.is_superadmin)`.

---

### Painel de Suporte (`screens/support/`)

Exclusivo para usuários com `role = 'support'`. Todas as telas são somente leitura.

| Arquivo | Função |
|---|---|
| `index.tsx` | Grid de permissões do paciente; navega para sub-telas conforme permissão |
| `diary.tsx` | Diário do paciente: lista entradas, navegação por mês, stats |
| `diaryEntry.tsx` | Entrada específica do diário (estilo papel, sem edição) |
| `agenda.tsx` | Agenda: calendário + compromissos do dia + medicamentos |
| `marcos.tsx` | Marcos do tratamento com progresso (sem toggle de conclusão) |

**Identificação do paciente:** todas as sub-telas recebem `patientId` e `patientName` via `useLocalSearchParams`. O `CANDITopBar` mostra o avatar do paciente (borda teal) ao invés do próprio avatar.

---

## Componentes Reutilizáveis

### CANDITopBar (`components/CANDITopBar/`)

Top bar compartilhada entre todas as telas principais.

```typescript
interface Props {
  onAvatarPress?: () => void;
  patientId?: string | null;     // Se preenchido, modo suporte: mostra avatar do paciente
  patientName?: string | null;
  onPatientPress?: () => void;
}
```

**Comportamento:**
- Sem `patientId`: mostra avatar do usuário logado (borda rosa `primary`), toca para abrir perfil
- Com `patientId`: mostra avatar do paciente (`S3/${patientId}.jpg`), borda teal `tertiary`
- Se imagem falhar (`onError`): mostra view com iniciais (2 primeiros chars do nome em uppercase)
- Sempre exibe logo central (`assets/images/original.png`)

---

### Calendar (`components/Calendar/`)

Wrapper sobre `react-native-calendars` com locale PT-BR e tema CANDI.

```typescript
interface Props {
  onDayPress?: (day: { dateString: string }) => void;
  markedDates?: Record<string, any>;
}
```

**Configuração:**
- `markingType="multi-dot"` — suporta múltiplos pontos por dia
- Locale `pt` registrado com nomes de meses/dias em português
- Cores seguem `AppTheme`

**Formato de marcação:**
```typescript
markedDates = {
  '2026-05-20': {
    selected: true,
    dots: [
      { key: 'appt', color: AppTheme.colors.primary },   // Compromisso
      { key: 'sym',  color: AppTheme.colors.tertiary },  // Sintoma
    ]
  }
}
```

---

### ActionSheet (`components/ActionSheet/`)

Bottom sheet de ações com confirmação. Usado para logout, exclusões destrutivas.

```typescript
interface Props {
  visible: boolean;
  title: string;
  options: Array<{ label: string; icon: string; destructive?: boolean; onPress: () => void }>;
  onDismiss: () => void;
}
```

---

### GlobalSocketController (`components/GlobalSocketController.tsx`)

Componente sem UI que gerencia o ciclo de vida do WebSocket. Montado no root layout.

**Responsabilidades:**
- Conecta ao WebSocket após login com token JWT
- Reconecta automaticamente com jitter exponencial
- Escuta `inbox_update` → chama `incrementUnread()` + exibe toast de nova mensagem
- Escuta `new_post` → chama `triggerFeedRefresh()`
- Desconecta no unmount / logout

---

### Outros Componentes

| Componente | Descrição |
|---|---|
| `Avatar/` | Avatar circular com fallback de iniciais |
| `Bubble/` | Bolha de mensagem (enviada / recebida) no chat |
| `Timeline/` | Linha do tempo de eventos próximos |
| `MoodTracker/` | Slider de humor com emojis (0-10) |
| `DiaryList/` | Lista de entradas do diário com pré-visualização |
| `EmptyState/` | Estado vazio genérico com ícone e texto |
| `NotificationDisplay/` | Renderiza toasts/banners de `NotificationContext` |
| `LoadingDots/` | Indicador de carregamento animado |
| `TypingIndicator/` | Animação "digitando..." no chat |
| `NewPassageFAB/` | FAB flutuante para nova entrada de diário |
| `Toggle/` | Checkboxes customizados (ReminderToggle, CheckpointCompletedToggle, NotifyNetworkToggle) |

---

## Regras de Negócio no Frontend

### Tokens e Sessão

- `accessToken` + `refreshToken` armazenados em `AsyncStorage`
- `userRole` cacheado em `AsyncStorage` para evitar chamada à API em cada mount
- Token é renovado automaticamente com margem de **60 segundos** antes do vencimento
- Mutex impede múltiplos refreshes concorrentes
- Se o refresh falhar, a sessão é encerrada e o usuário é redirecionado para `/`

### Upload de Imagens

- Todas as imagens (perfil, posts, grupos) são enviadas como `multipart/form-data`
- Campo obrigatório: `file` (nome fixo)
- O `Content-Type` **não** é definido manualmente no header — o `fetch` define automaticamente com boundary correto

### Paginação do Feed

- Cursor-based via `lastKey`
- Limite padrão: 20 posts por página
- `lastKey` vazio/nulo indica última página

### Rede de Apoio — Permissões

O convite define quais seções o membro de suporte pode ver:

```typescript
permissions: ['agenda', 'diary_read', 'milestones']
```

No painel de suporte, cada card de seção só é tocável se a permissão estiver na lista. Sem a permissão, o card aparece bloqueado (ícone de cadeado).

### Moderação (Admin)

- Post aprovado via admin → status `approved`, imune a novas denúncias
- Post removido via admin → autor acumula `banned_posts_count`; ao atingir 3 remoções, é banido automaticamente
- Ao aprovar ou remover um post, as denúncias da tabela `CANDIReports` são deletadas permanentemente

---

## Fluxos Principais

### Fluxo de Login

```
1. Usuário digita email + senha
2. POST /auth/login
3. Tokens salvos em AsyncStorage
4. userRole cacheado em AsyncStorage
5. AuthGate redireciona para a área correta (tabs / admin / support)
```

### Fluxo de Rede de Apoio

```
1. Paciente: profile → invite → insere email + seleciona permissões
2. POST /auth/invite → email enviado com link deep-link
3. Suporte abre link → /cadastroSupport?invite=TOKEN
4. GET /auth/invite/:token → valida e exibe nome do paciente
5. POST /auth/register-support → cria conta + vínculo
6. Login como suporte → AuthGate redireciona para /screens/support
```

### Fluxo de Chat em Tempo Real

```
1. GlobalSocketController conecta ao WS com token JWT
2. Usuário A envia mensagem → POST /chat/messages/:id
3. Servidor emite new_message via WebSocket
4. Usuário B recebe inbox_update → badge incrementa, toast aparece
5. Usuário B abre chat → GET /chat/messages/:id → marca como lido
6. Servidor emite messages_read para A
```

### Fluxo de Diário

```
1. Usuário abre homeDiary → GET /diary/list
2. Toca em "Escrever hoje" → /screens/diary/passagemAdd
3. POST /diary → salvo no S3 como userId/YYYY-MM-DD.txt
4. homeDiary recarrega ao focar (useFocusEffect)
```

---

## Variáveis de Ambiente

Definidas em `src/constants/api.ts`:

```typescript
export const API_BASE_URL = 'http://<IP_DO_SERVIDOR>:3000';
```

> Em desenvolvimento, use o IP da máquina host (não `localhost`) para o emulador/dispositivo físico conseguir alcançar o servidor.

---

## Estrutura de Pastas

```
CANDI-mobile/
└── candi-app/
    └── src/
        ├── app/
        │   ├── _layout.tsx                    # Root layout + AuthGate
        │   ├── index.tsx                      # Login
        │   ├── cadastro.tsx                   # Registro paciente
        │   ├── cadastroSupport.tsx            # Registro suporte
        │   └── screens/
        │       ├── (tabs)/
        │       │   ├── _layout.tsx
        │       │   ├── home.tsx
        │       │   ├── homeAgenda.tsx
        │       │   ├── homeDiary.tsx
        │       │   ├── homeProfile.tsx
        │       │   └── homeCommunity/
        │       ├── admin/
        │       │   └── index.tsx
        │       ├── support/
        │       │   ├── index.tsx
        │       │   ├── diary.tsx
        │       │   ├── diaryEntry.tsx
        │       │   ├── agenda.tsx
        │       │   └── marcos.tsx
        │       ├── agenda/
        │       │   ├── compromissosAdd.tsx
        │       │   ├── compromissosView.tsx
        │       │   ├── medicamentosAdd.tsx
        │       │   ├── medicamentosView.tsx
        │       │   ├── sintomasAdd.tsx
        │       │   ├── sintomasView.tsx
        │       │   └── relatorio.tsx
        │       ├── diary/
        │       │   ├── passagemAdd.tsx
        │       │   ├── passagemRead.tsx
        │       │   ├── passagemView.tsx
        │       │   ├── sentimentosAdd.tsx
        │       │   └── sentimentosView.tsx
        │       ├── community/
        │       │   ├── chatCommunity.tsx
        │       │   ├── groupCommunity.tsx
        │       │   ├── groupAdd.tsx
        │       │   ├── messagesAdd.tsx
        │       │   └── postDetail.tsx
        │       └── profile/
        │           ├── invite.tsx
        │           ├── contatosAdd.tsx
        │           ├── contatosView.tsx
        │           ├── marcosAdd.tsx
        │           ├── marcosEdit.tsx
        │           ├── marcosView.tsx
        │           ├── settings.tsx
        │           ├── help.tsx
        │           └── about.tsx
        ├── components/
        │   ├── ActionSheet/
        │   ├── Avatar/
        │   ├── Bubble/
        │   ├── Buttons/
        │   ├── CANDITopBar/
        │   ├── Calendar/
        │   ├── Card/
        │   ├── Carousel/
        │   ├── DiaryList/
        │   ├── EmptyState/
        │   ├── GlobalSocketController.tsx
        │   ├── HomeProfile/
        │   ├── Inputs/
        │   ├── LoadingDots/
        │   ├── Modals/
        │   ├── MoodTracker/
        │   ├── NewPassage/
        │   ├── NewPassageFAB/
        │   ├── NotificationDisplay/
        │   ├── Sentiments/
        │   ├── Timeline/
        │   ├── Toggle/
        │   └── TypingIndicator/
        ├── context/
        │   ├── ProfileContext.tsx
        │   ├── ChatContext.tsx
        │   └── NotificationContext.tsx
        ├── services/
        │   ├── authService.js
        │   ├── adminService.ts
        │   ├── chatService.ts
        │   ├── communityService.ts
        │   ├── feedService.ts
        │   ├── inviteService.ts
        │   ├── socketService.ts
        │   ├── notifications.ts
        │   └── PhoneService.ts
        ├── constants/
        │   └── api.ts
        └── theme/
            └── index.ts
```

---

## Como Rodar

```bash
# Instalar dependências
cd CANDI-mobile/candi-app
npm install

# Rodar no Expo Go (desenvolvimento)
npx expo start

# Build para Android (EAS)
eas build --platform android --profile preview

# Build para iOS (EAS)
eas build --platform ios --profile preview
```

> Certifique-se de que `API_BASE_URL` em `src/constants/api.ts` aponta para o IP correto do servidor backend na rede local.

---

# Candi, o Diário do Câncer ft. Rede Feminina de SCS

Este repositório contêm o código fonte para o aplicativo mobile desenvolvido como produto principal na matéria de Projeto Integrador pelo grupo CANDI, na Fatec São Caetano, para os anos de 2025-2026; e tem como objetivo principal preencher o vazio relacionado à complexidade, ou falta, da documentação particular e diária, sobre o câncer, além de incentivar uma maior participação da família e acompanhantes no tratamento oncológico. 

## O grupo CANDI é composto por:

- **Carolina Pichelli Souza :violin: (dev front-end; designer; docs)**
- **Fernando Alcantara D´Ávila :video_game: (dev fullstack; cybersecurity)**
- **Guilherme Xavier Zanetti :drum: (scrum master; dev fullstack; ai admin; docs)**
- **Heloísa Pichelli Souza :tada: (analista de sistemas; dev front-end; UI/UX)**
- **Lucas Batista de Sousa :desktop_computer: (dev back-end)**
- **Nuno Kasuo Tronco Yokoji :long_drum: (DBA)**

---

## :high_brightness: Propósito

Preencher o vazio na documentação diária e particular sobre o câncer, fornecendo uma plataforma segura para pacientes oncológicos registrarem sua jornada, além de conectar pacientes com sua rede de apoio (familiares, cuidadores) e com uma comunidade de pessoas em situações similares.

## :bulb: Características Principais

- **Diário de Saúde**: Registro diário em texto livre com suporte a imagens
- **Agenda de Tratamento**: Compromissos médicos, medicamentos e sintomas centralizados
- **Rede de Apoio**: Familiares e cuidadores acompanham a jornada do paciente com permissões granulares
- **Comunidade**: Feed social, grupos temáticos e chat privado
- **Marcos do Tratamento**: Checkpoints de progresso personalizados
- **Relatórios de Saúde**: Visualização consolidada de sintomas, medicamentos e compromissos

## 🛠️ Tecnologias Utilizadas

- **React Native 0.81 + Expo 54**: Framework mobile cross-platform
- **Expo Router 4**: Navegação file-based com suporte a deep linking
- **TypeScript**: Tipagem estática em todo o projeto
- **TanStack Query**: Cache e sincronização de dados com o servidor
- **Socket.IO**: Comunicação em tempo real (chat, notificações)
- **AsyncStorage**: Persistência local de tokens e cache
- **AWS S3**: Armazenamento de imagens e entradas do diário

## :gear: Arquitetura de Software

Arquitetura em camadas com separação clara entre:
- **Telas (Screens)**: Lógica de UI e estado local
- **Contextos**: Estado global (perfil, chat, notificações)
- **Serviços**: Comunicação com a API (REST + WebSocket)
- **Componentes**: UI reutilizável desacoplada de lógica de negócio

## 📁 Estrutura do Projeto

Ver seção [Estrutura de Pastas](#estrutura-de-pastas) acima para o mapeamento completo.

## 🚀 Como Utilizar 

1. **Instalar dependências:**

    ```bash
    cd CANDI-mobile/candi-app && npm install
    ```

2. **Configurar API URL em `src/constants/api.ts`**

3. **Iniciar:**

    ```bash
    npx expo start
    ```

## 📝 Notas de Desenvolvimento

- O IP do backend deve ser o IP real da máquina na rede — `localhost` não funciona em dispositivos físicos ou emuladores Android
- A role do usuário é cacheada em AsyncStorage para evitar chamadas desnecessárias à API em cada navegação
- Upload de imagens usa `multipart/form-data` com o campo fixo `file` — não definir `Content-Type` manualmente no fetch
- O calendário usa `markingType="multi-dot"` — o formato de `markedDates` precisa usar `{ dots: [] }` e não `{ marked: true, dotColor }`
  
---
