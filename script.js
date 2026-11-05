/**
 * EzDeck Landing Page — Script Interativo & Multi-idiomas Completo
 * Suporte aos 11 idiomas oficiais do EzDeck com bandeiras SVG:
 * pt-BR, en, es, ja, it, fr, de, zh-CN, vi, ko, ar
 * 
 * Simulação interativa:
 * - Celular na horizontal (landscape) abaixo
 * - Computador Windows acima sincronizado em tempo real
 */

// --------------------------------------------------------------------------
// 1. Gestão de Tema (Dark / Light)
// --------------------------------------------------------------------------
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const rootElement = document.documentElement;

function getPreferredTheme() {
  const saved = localStorage.getItem('ezdeck-theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function setTheme(theme) {
  rootElement.setAttribute('data-theme', theme);
  localStorage.setItem('ezdeck-theme', theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  if (!themeToggleBtn) return;
  themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
  themeToggleBtn.innerHTML = theme === 'dark' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

setTheme(getPreferredTheme());

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const current = rootElement.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// --------------------------------------------------------------------------
// 2. Bandeiras Oficiais em SVG (Alta Nitidez)
// --------------------------------------------------------------------------
const SVG_FLAGS = {
  'pt': "<svg viewBox='0 0 24 16'><path fill='#009b3a' d='M0 0h24v16H0z'/><path fill='#ffdf00' d='m12 2 9 6-9 6-9-6z'/><circle cx='12' cy='8' r='3.4' fill='#002776'/></svg>",
  'en': "<svg viewBox='0 0 24 16'><path fill='#b22234' d='M0 0h24v16H0z'/><path stroke='#fff' stroke-width='1.23' d='M0 2h24M0 4.5h24M0 7h24M0 9.5h24M0 12h24M0 14.5h24'/><path fill='#3c3b6e' d='M0 0h10v7H0z'/></svg>",
  'es': "<svg viewBox='0 0 24 16'><path fill='#aa151b' d='M0 0h24v16H0z'/><path fill='#f1bf00' d='M0 4h24v8H0z'/></svg>",
  'ja': "<svg viewBox='0 0 24 16'><path fill='#fff' d='M0 0h24v16H0z'/><circle cx='12' cy='8' r='4' fill='#bc002d'/></svg>",
  'it': "<svg viewBox='0 0 24 16'><path fill='#009246' d='M0 0h8v16H0z'/><path fill='#fff' d='M8 0h8v16H8z'/><path fill='#ce2b37' d='M16 0h8v16h-8z'/></svg>",
  'fr': "<svg viewBox='0 0 24 16'><path fill='#002654' d='M0 0h8v16H0z'/><path fill='#fff' d='M8 0h8v16H8z'/><path fill='#ed2939' d='M16 0h8v16h-8z'/></svg>",
  'de': "<svg viewBox='0 0 24 16'><path fill='#111' d='M0 0h24v5.34H0z'/><path fill='#dd0000' d='M0 5.33h24v5.34H0z'/><path fill='#ffce00' d='M0 10.66h24V16H0z'/></svg>",
  'zh-CN': "<svg viewBox='0 0 24 16'><path fill='#de2910' d='M0 0h24v16H0z'/><path fill='#ffde00' d='m5 2 .75 2.3L8.2 4l-2 1.45.75 2.3L5 6.35 3.05 7.75l.75-2.3-2-1.45 2.45.3z'/></svg>",
  'vi': "<svg viewBox='0 0 24 16'><path fill='#da251d' d='M0 0h24v16H0z'/><path fill='#ff0' d='m12 3 .9 2.75h2.9l-2.35 1.7.9 2.75L12 8.5l-2.35 1.7.9-2.75-2.35-1.7h2.9z'/></svg>",
  'ko': "<svg viewBox='0 0 24 16'><path fill='#fff' d='M0 0h24v16H0z'/><circle cx='12' cy='8' r='4' fill='#cd2e3a'/><path fill='#0047a0' d='M12 12a4 4 0 0 1 0-8 2 2 0 0 0 0 4 2 2 0 0 1 0 4z'/></svg>",
  'ar': "<svg viewBox='0 0 24 16'><path fill='#006c35' d='M0 0h24v16H0z'/><path stroke='#fff' stroke-width='1' d='M6 8h12M9 11h6'/></svg>"
};

const languageMeta = {
  'pt': { name: 'Português (BR)', code: 'PT-BR' },
  'en': { name: 'English', code: 'EN' },
  'es': { name: 'Español', code: 'ES' },
  'ja': { name: '日本語', code: 'JA' },
  'it': { name: 'Italiano', code: 'IT' },
  'fr': { name: 'Français', code: 'FR' },
  'de': { name: 'Deutsch', code: 'DE' },
  'zh-CN': { name: '简体中文', code: 'ZH' },
  'vi': { name: 'Tiếng Việt', code: 'VI' },
  'ko': { name: '한국어', code: 'KO' },
  'ar': { name: 'العربية', code: 'AR' }
};

// --------------------------------------------------------------------------
// 3. Dicionário dos 11 Idiomas (Sem numeração duplicada nos 3 passos)
// --------------------------------------------------------------------------
const translations = {
  'pt': {
    navSimulator: 'Simulador',
    navHowItWorks: 'Como Funciona',
    navFeatures: 'Recursos',
    navCompare: 'Comparativo',
    navDownloads: 'Downloads',
    navFaq: 'FAQ',
    btnDownloadHeader: 'Baixar',
    heroBadge: '100% Gratuito & Open Source • Sem Nuvem',
    heroTitle: 'Seu celular encostado agora é o seu <span class="text-gradient">Stream Deck</span> no Windows.',
    heroDesc: 'Controle OBS Studio, Discord, Spotify, jogos e atalhos do Windows direto da tela do seu smartphone ou tablet. Conexão instantânea pelo Wi-Fi local com latência de milissegundos e zero dependência de servidores externos.',
    btnHeroWin: 'Baixar EzDeck para Windows',
    btnHeroGithub: 'Código no GitHub',
    specWin: 'Windows 10 & 11',
    specNode: 'Sem instalar Node.js',
    specMobile: 'Android 5.0+ e PWA iOS',
    specLocal: '100% Rede Local',
    
    simHostTitle: 'Windows 11 Pro — Host EzDeck Ativo',
    simHostSubtitle: 'Rede Local Wi-Fi (Sem Nuvem) • Latência < 2ms',
    simHint: 'Toque nas teclas do celular abaixo para acionar o computador acima em tempo real',
    btnPrevPage: 'Anterior',
    btnNextPage: 'Próxima',
    pageIndicator: 'Página {current} de {total}',

    stepsTag: 'Fácil e Sem Complicação',
    stepsTitle: 'Como funciona em 3 passos simples',
    stepsSubtitle: 'Você não precisa ser técnico nem saber programar. Em menos de 2 minutos seu controle estará pronto.',
    step1Title: 'Instale no seu Windows',
    step1Desc: 'Baixe o executável EzDeck-Setup.exe. O instalador já inclui tudo o que o app precisa para rodar; você não precisa instalar Node.js. Um ícone prático ficará na sua bandeja.',
    step2Title: 'Pareie com PIN de 4 dígitos',
    step2Desc: 'Abra o app no Android ou acesse pelo navegador no iOS. A descoberta UDP encontra seu PC na rede Wi-Fi automaticamente. Digite o PIN de 4 números para conectar.',
    step3Title: 'Arraste e use na hora',
    step3Desc: 'Na janela do EzDeck, arraste seus programas, atalhos de teclado (como Ctrl+C ou Win+Shift+S) e comandos do OBS para os 8 slots do deck. O celular atualiza instantaneamente.',

    bentoTag: 'Recursos e Diferenciais',
    bentoTitle: 'Construído para velocidade, privacidade e controle total',
    bentoSubtitle: 'Tudo o que você precisa em um deck de streaming, sem pagar mensalidades nem arriscar sua privacidade.',
    bento1Title: '100% Rede Local — Zero Nuvem & Privacidade Real',
    bento1Desc: 'Nenhum dado, atalho ou comando sai da sua casa. O EzDeck comunica o celular com o PC exclusivamente pela rede Wi-Fi local. Funciona mesmo sem internet.',
    bento1Tag: 'Privacidade por design — Sem telemetria',
    bento2Title: 'Até 40 Botões em 5 Páginas',
    bento2Desc: 'Organize seu setup em 5 páginas dedicadas de 8 teclas cada (grid 4x2) para lives, games, trabalho ou atalhos diários.',
    bento2Tag: '8 botões por página (Grid 4x2)',
    bento3Title: 'OBS Studio Integrado',
    bento3Desc: 'Comunicação nativa via OBS WebSocket (v5). Inicie gravações, silencie microfone e troque de cena com um toque.',
    bento3Tag: 'obs-ws v5 compatível',
    bento4Title: 'Atalhos de Teclado, Programas e Scripts',
    bento4Desc: 'Cadastre qualquer combinação com Ctrl, Alt, Shift e Win, ou aponte para executáveis .exe, atalhos .lnk e scripts .bat.',
    bento4Tag: 'Lê atalhos do Menu Iniciar e Microsoft Store',
    bento5Title: 'Descoberta UDP Automática',
    bento5Desc: 'O app localiza o computador na rede Wi-Fi sem que você precise descobrir ou digitar o IP manualmente.',
    bento5Tag: 'Pareamento em 1 clique',
    bento6Title: 'Qualquer Tela Serve de Controle',
    bento6Desc: 'Funciona no Android com APK nativo (desde Android 5.0) ou em iPhone e iPad pelo navegador em tela cheia (PWA).',
    bento6Tag: 'Reaproveite aparelhos antigos',

    compareTag: 'Transparência',
    compareTitle: 'EzDeck vs Deck Físico vs Outros Aplicativos',
    compareSubtitle: 'Veja por que o EzDeck entrega a melhor relação entre custo, controle e liberdade.',
    thFeature: 'Característica',
    thEzDeck: 'EzDeck (Windows + Mobile)',
    thPhysical: 'Stream Deck Físico',
    thPaid: 'Apps Pagos Tradicionais',
    tdCost: 'Investimento Inicial',
    tdCostEz: 'R$ 0,00 (Gratuito & Open Source)',
    tdCostPh: 'R$ 900 a R$ 1.800+',
    tdCostPd: 'Mensalidade ou R$ 150+',
    tdPriv: 'Conexão & Privacidade',
    tdPrivEz: '✓ 100% Rede Local (Sem Nuvem)',
    tdPrivPh: '✓ Cabo USB direto',
    tdPrivPd: '✗ Exigem conta e servidor externo',
    tdDevice: 'Reaproveitamento de Celular Antigo',
    tdDeviceEz: '✓ Sim (Android 5.0+ e PWA iOS)',
    tdDevicePh: '✗ Não (hardware proprietário)',
    tdDevicePd: 'Limitado a versões recentes',
    tdKeys: 'Quantidade de Botões',
    tdKeysEz: 'Até 40 teclas (5 páginas de 8)',
    tdKeysPh: '6, 15 ou 32 teclas fixas',
    tdKeysPd: 'Varia por assinatura',
    tdSetup: 'Instalação sem Complicação',
    tdSetupEz: '✓ Runtime incluso no .exe (sem Node.js)',
    tdSetupPh: '✓ Driver próprio',
    tdSetupPd: 'Varia',
    tdLatency: 'Latência de Resposta',
    tdLatencyEz: 'Milissegundos (WebSocket local)',
    tdLatencyPh: 'Milissegundos (USB)',
    tdLatencyPd: 'Média/Alta (depende da nuvem)',

    dlTag: 'Instale Gratuitamente',
    dlTitle: 'Baixe o EzDeck e comece agora',
    dlSubtitle: 'Escolha o instalador para o seu computador e conecte seus dispositivos auxiliares.',
    dlWinTitle: 'EzDeck para Windows',
    dlWinDesc: 'Instalador oficial com janela nativa, ícone na bandeja e runtime embutido. Compatível com Windows 10 e 11.',
    dlWinBtn: 'Baixar EzDeck-Setup.exe',
    dlAndroidTitle: 'Companion Android',
    dlAndroidDesc: 'APK dedicado com auto-descoberta UDP, vibração tátil ao toque e reconexão rápida. Compatível com Android 5.0+.',
    dlAndroidBtn: 'Baixar APK (Android)',
    dlIosTitle: 'iPhone, iPad & Navegadores',
    dlIosDesc: 'Acesse o endereço exibido no EzDeck Windows pelo Safari ou Chrome e escolha "Adicionar à Tela de Início".',
    dlIosBtn: 'Ver Instruções PWA',

    faqTag: 'Dúvidas Frequentes',
    faqTitle: 'Perguntas e Respostas',
    faqSubtitle: 'Tudo o que você precisa saber sobre segurança, conexão e compatibilidade do EzDeck.',
    q1: 'Preciso ter o Node.js instalado no meu computador?',
    a1: '<strong>Não!</strong> O instalador <code>EzDeck-Setup.exe</code> já inclui o runtime necessário. Quem baixa o instalador só precisa dar dois cliques e usar. O Node.js é necessário apenas se você for desenvolvedor e quiser clonar e modificar o código-fonte manualmente.',
    q2: 'Por que o Windows SmartScreen pode alertar na primeira execução?',
    a2: 'Como o EzDeck é um projeto open-source independente que está no processo de obtenção de assinatura de código gratuita via SignPath Foundation, o Windows SmartScreen pode exibir um aviso comum de "arquivo não reconhecido". Basta clicar em <strong>"Mais informações"</strong> e depois em <strong>"Executar assim mesmo"</strong>. Certifique-se de baixar sempre pelas Releases oficiais do GitHub.',
    q3: 'O que fazer quando o Firewall do Windows pedir autorização?',
    a3: 'Permita o acesso <strong>apenas em redes privadas</strong> (sua casa ou estúdio). Nunca marque redes públicas e nunca exponha a porta 3100 para a internet. O EzDeck foi concebido para viver protegido dentro da sua rede local.',
    q4: 'O EzDeck funciona no iPhone ou iPad?',
    a4: '<strong>Sim!</strong> Basta abrir o Safari no iPhone ou iPad, digitar o endereço da rede local informado na janela do EzDeck (por exemplo, <code>http://192.168.1.15:3100</code>) e clicar no botão Compartilhar do Safari → <strong>"Adicionar à Tela de Início"</strong>. Ele abre em tela cheia como se fosse um app nativo.',
    q5: 'Como funciona a segurança do PIN de 4 dígitos?',
    a5: 'O PIN garante que apenas aparelhos autorizados possam acionar os botões do seu computador. O sistema possui proteção contra força bruta: se alguém errar o PIN 5 vezes seguidas, aquele IP fica bloqueado por 60 segundos. Além disso, cadastrar programas e caminhos executáveis exige acesso direto à janela física do Windows.',
    q6: 'Qual é a origem do EzDeck?',
    a6: 'EzDeck é uma adaptação e evolução independente para Windows e Android inspirada no projeto open source Dokke (de Felipe Alves), sob licença MIT. Mantido por Ed Stone (eddesignerez), o EzDeck adiciona empacotamento nativo Windows, integração profunda com atalhos de teclado, OBS Studio, aplicativo Android dedicado e suporte internacional a 11 idiomas.',

    ctaTitle: 'Pronto para assumir o controle do seu PC?',
    ctaDesc: 'Dê vida nova àquele celular parado na gaveta e tenha um Stream Deck completo sem gastar um centavo.',
    ctaBtn: 'Baixar Gratuitamente para Windows'
  },

  'en': {
    navSimulator: 'Simulator',
    navHowItWorks: 'How It Works',
    navFeatures: 'Features',
    navCompare: 'Comparison',
    navDownloads: 'Downloads',
    navFaq: 'FAQ',
    btnDownloadHeader: 'Download',
    heroBadge: '100% Free & Open Source • Zero Cloud',
    heroTitle: 'Turn your spare phone into a <span class="text-gradient">dedicated Stream Deck</span> for Windows.',
    heroDesc: 'Control OBS Studio, Discord, Spotify, games, and keyboard macros right from your smartphone or tablet. 100% local Wi-Fi, ultra-low latency, and complete privacy.',
    btnHeroWin: 'Download EzDeck for Windows',
    btnHeroGithub: 'View Source on GitHub',
    specWin: 'Windows 10 & 11',
    specNode: 'No Node.js Required',
    specMobile: 'Android 5.0+ & iOS PWA',
    specLocal: '100% Local Network',

    simHostTitle: 'Windows 11 Pro — EzDeck Host Active',
    simHostSubtitle: 'Local Wi-Fi Network (Zero Cloud) • Latency < 2ms',
    simHint: 'Tap any key on the phone below to trigger actions on the PC above in real time',
    btnPrevPage: 'Previous',
    btnNextPage: 'Next',
    pageIndicator: 'Page {current} of {total}',

    stepsTag: 'Quick & Simple',
    stepsTitle: 'Up and running in 3 easy steps',
    stepsSubtitle: 'No coding or complex technical setup. You will be ready in under two minutes.',
    step1Title: 'Install on Windows',
    step1Desc: 'Download EzDeck-Setup.exe. The runtime is fully bundled, so you never need to install Node.js. Sits neatly in your system tray.',
    step2Title: 'Pair with a 4-Digit PIN',
    step2Desc: 'Open the companion app or access via browser. UDP auto-discovery finds your PC on Wi-Fi automatically. Type the PIN to connect securely.',
    step3Title: 'Drag, Drop & Control',
    step3Desc: 'Drag applications, keyboard combinations (like Win+Shift+S), or OBS actions into the 8-key dock. Your phone updates in real time.',

    bentoTag: 'Features & Architecture',
    bentoTitle: 'Engineered for speed, privacy, and full control',
    bentoSubtitle: 'No subscription fees, no third-party cloud. Complete mastery over your PC setup.',
    bento1Title: '100% Local Network — Zero Cloud',
    bento1Desc: 'No commands, shortcuts, or telemetry leave your local router. Works flawlessly even if your internet connection drops during a live stream.',
    bento1Tag: 'Privacy by Design — No Outbound Telemetry',
    bento2Title: 'Up to 40 Shortcuts (5 Pages × 8 Keys)',
    bento2Desc: 'Organize pages for live streaming, gaming, video editing, or daily productivity with instant swipe/tap navigation.',
    bento2Tag: '8 Large Keys per Page (4x2 Grid)',
    bento3Title: 'Native OBS Studio Integration',
    bento3Desc: 'Built-in obs-ws v5 support. Switch scenes, toggle microphone mute, and start recording with zero perceived latency.',
    bento3Tag: 'obs-ws v5 Compatible',
    bento4Title: 'Keyboard Combos, Executables & Scripts',
    bento4Desc: 'Launch .exe files, custom .bat scripts, or trigger global combinations like Ctrl+Shift+Esc with a single physical tap.',
    bento4Tag: 'Scans Start Menu & Store Apps',
    bento5Title: 'Automatic UDP Discovery',
    bento5Desc: 'No need to dig around for local IP addresses. The companion app discovers the host PC automatically on your Wi-Fi.',
    bento5Tag: '1-Click Pairing',
    bento6Title: 'Any Screen Becomes a Controller',
    bento6Desc: 'Works with a dedicated native Android APK (Android 5.0+) or any device with a modern browser (iPhone, iPad) as a fullscreen PWA.',
    bento6Tag: 'Upcycle Old Devices',

    compareTag: 'Transparency',
    compareTitle: 'EzDeck vs Physical Decks vs Paid Apps',
    compareSubtitle: 'See why EzDeck delivers the best combination of cost, privacy, and performance.',
    thFeature: 'Feature',
    thEzDeck: 'EzDeck (Windows + Mobile)',
    thPhysical: 'Physical Stream Deck',
    thPaid: 'Traditional Paid Apps',
    tdCost: 'Initial Investment',
    tdCostEz: '$0.00 (Free & Open Source)',
    tdCostPh: '$150 to $250+',
    tdCostPd: '$5/mo or $30+ license',
    tdPriv: 'Connection & Privacy',
    tdPrivEz: '✓ 100% Local Network (Zero Cloud)',
    tdPrivPh: '✓ Direct USB Cable',
    tdPrivPd: '✗ Requires Cloud Account & Login',
    tdDevice: 'Repurpose Old Phone',
    tdDeviceEz: '✓ Yes (Android 5.0+ & iOS PWA)',
    tdDevicePh: '✗ No (Proprietary Hardware)',
    tdDevicePd: 'Often limited to newest OS',
    tdKeys: 'Total Shortcut Slots',
    tdKeysEz: 'Up to 40 Keys (5 Pages of 8)',
    tdKeysPh: '6, 15, or 32 Fixed Keys',
    tdKeysPd: 'Limited by Subscription',
    tdSetup: 'Hassle-free Installation',
    tdSetupEz: '✓ Standalone .exe (No Node.js needed)',
    tdSetupPh: '✓ Dedicated Drivers',
    tdSetupPd: 'Varies',
    tdLatency: 'Response Latency',
    tdLatencyEz: 'Milliseconds (Local WebSocket)',
    tdLatencyPh: 'Milliseconds (USB)',
    tdLatencyPd: 'Medium to High (Cloud dependent)',

    dlTag: 'Free Download',
    dlTitle: 'Download EzDeck and Get Started',
    dlSubtitle: 'Get the official Windows installer and connect your mobile companion devices.',
    dlWinTitle: 'EzDeck for Windows',
    dlWinDesc: 'Official installer with native window, system tray icon, and bundled runtime. Windows 10 & 11 ready.',
    dlWinBtn: 'Download EzDeck-Setup.exe',
    dlAndroidTitle: 'Android Companion',
    dlAndroidDesc: 'Dedicated APK with UDP auto-discovery, haptic tactile vibration, and instant reconnection.',
    dlAndroidBtn: 'Download APK (Android)',
    dlIosTitle: 'iPhone, iPad & Browsers',
    dlIosDesc: 'Open the URL shown on your Windows host using Safari or Chrome and select "Add to Home Screen".',
    dlIosBtn: 'View PWA Instructions',

    faqTag: 'FAQ',
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Everything you need to know about security, networking, and compatibility.',
    q1: 'Do I need Node.js installed on my computer?',
    a1: '<strong>No!</strong> The official installer <code>EzDeck-Setup.exe</code> bundles the necessary runtime. Simply download, run, and enjoy. Node.js is only needed if you are a developer looking to build from source.',
    q2: 'Why does Windows SmartScreen show a warning?',
    a2: 'EzDeck is an independent open-source project currently preparing for complimentary code signing via the SignPath Foundation. When SmartScreen shows an unrecognized app warning, click <strong>"More info"</strong> and then <strong>"Run anyway"</strong>. Always download exclusively from official GitHub Releases.',
    q3: 'What should I do when Windows Firewall asks for permission?',
    a3: 'Allow access <strong>only on Private Networks</strong> (your home or studio Wi-Fi). Never check public networks, and never expose port 3100 to the public internet.',
    q4: 'Does EzDeck work on iPhone or iPad?',
    a4: '<strong>Yes!</strong> Open Safari on your iPhone or iPad, navigate to the local address shown on your Windows EzDeck host (e.g., <code>http://192.168.1.15:3100</code>), tap Share and choose <strong>"Add to Home Screen"</strong>. It launches in fullscreen mode just like a native app.',
    q5: 'How secure is the 4-digit PIN system?',
    a5: 'The PIN ensures that only authorized devices on your Wi-Fi can trigger actions. It features anti-bruteforce locking: 5 consecutive incorrect attempts lock that IP for 60 seconds. Adding new applications or paths requires direct physical access to the Windows host.',
    q6: 'What is the origin of EzDeck?',
    a6: 'EzDeck is an independent Windows & Android evolution inspired by the open-source project Dokke (by Felipe Alves), licensed under MIT. Maintained by Ed Stone (eddesignerez), EzDeck introduces standalone Windows packaging, deep keyboard shortcuts, OBS Studio integration, a dedicated Android APK, and 11 language localizations.',

    ctaTitle: 'Ready to take full command of your PC?',
    ctaDesc: 'Breathe new life into your old devices and build your ultimate custom shortcut deck today.',
    ctaBtn: 'Download Free for Windows'
  },

  'es': {
    navSimulator: 'Simulador',
    navHowItWorks: 'Cómo Funciona',
    navFeatures: 'Características',
    navCompare: 'Comparativa',
    navDownloads: 'Descargas',
    navFaq: 'Preguntas Frecuentes',
    btnDownloadHeader: 'Descargar',
    heroBadge: '100% Gratuito y Open Source • Sin Nube',
    heroTitle: 'Convierte tu móvil en desuso en un <span class="text-gradient">Stream Deck profesional</span> para Windows.',
    heroDesc: 'Controla OBS Studio, Discord, Spotify, juegos y macros de teclado directamente desde la pantalla de tu smartphone o tablet. 100% red local, latencia mínima y sin cuentas en la nube.',
    btnHeroWin: 'Descargar EzDeck para Windows',
    btnHeroGithub: 'Ver código en GitHub',
    specWin: 'Windows 10 y 11',
    specNode: 'Sin instalar Node.js',
    specMobile: 'Android 5.0+ e iOS PWA',
    specLocal: '100% Red Local',

    simHostTitle: 'Windows 11 Pro — Host EzDeck Activo',
    simHostSubtitle: 'Red Wi-Fi Local (Sin Nube) • Latencia < 2ms',
    simHint: 'Toca las teclas del móvil abajo para activar acciones en el ordenador arriba en tiempo real',
    btnPrevPage: 'Anterior',
    btnNextPage: 'Siguiente',
    pageIndicator: 'Página {current} de {total}',

    stepsTag: 'Fácil y Rápido',
    stepsTitle: 'Listo para usar en 3 simples pasos',
    stepsSubtitle: 'Sin configuraciones complejas ni necesidad de saber programación.',
    step1Title: 'Instala en Windows',
    step1Desc: 'Descarga EzDeck-Setup.exe. Ya incluye su propio runtime, sin necesidad de configurar Node.js. Queda accesible en la bandeja del sistema.',
    step2Title: 'Conecta con PIN de 4 dígitos',
    step2Desc: 'Abre la app en Android o entra desde el navegador en iOS. La detección UDP localiza tu PC en el Wi-Fi automáticamente. Introduce el PIN para conectar.',
    step3Title: 'Arrastra y personaliza',
    step3Desc: 'Arrastra tus programas, combinaciones de teclas (como Win+Shift+S) o escenas de OBS a los 8 botones. La pantalla del móvil se actualiza al instante.',

    bentoTag: 'Ventajas Principales',
    bentoTitle: 'Diseñado para máxima velocidad y privacidad',
    bentoSubtitle: 'Sin suscripciones ni servidores de terceros. Control absoluto en tu escritorio.',
    bento1Title: '100% Red Local — Privacidad Total',
    bento1Desc: 'Ningún dato sale de tu hogar. Todo funciona a través de tu Wi-Fi local sin depender de servidores externos ni cuentas.',
    bento1Tag: 'Privacidad por diseño — Sin telemetría',
    bento2Title: 'Hasta 40 Accesos Directos (5 Páginas)',
    bento2Desc: 'Organiza páginas para streaming, videojuegos, edición de vídeo o trabajo con botones grandes y sensibles al tacto.',
    bento2Tag: '8 botones por página (Grid 4x2)',
    bento3Title: 'Integración Nativa con OBS Studio',
    bento3Desc: 'Compatible con obs-ws v5. Cambia de escena, silencia el micrófono e inicia grabaciones sin retraso perceptible.',
    bento3Tag: 'Compatible con obs-ws v5',
    bento4Title: 'Atajos de Teclado, Programas y Scripts',
    bento4Desc: 'Ejecuta archivos .exe, scripts .bat o envía combinaciones globales complejas a la ventana activa de Windows.',
    bento4Tag: 'Carga apps del Menú Inicio y Store',
    bento5Title: 'Detección Automática por UDP',
    bento5Desc: 'Olvídate de buscar la dirección IP de tu ordenador: la aplicación la encuentra de forma automática en la red local.',
    bento5Tag: 'Emparejamiento en 1 clic',
    bento6Title: 'Cualquier Pantalla es un Controlador',
    bento6Desc: 'Funciona en Android con APK nativo (desde Android 5.0) o en iPhone/iPad como Web App PWA a pantalla completa.',
    bento6Tag: 'Reutiliza móviles antiguos',

    compareTag: 'Transparencia',
    compareTitle: 'EzDeck vs Deck Físico vs Apps de Pago',
    compareSubtitle: 'Comprueba por qué EzDeck ofrece la mejor combinación de ahorro, privacidad y versatilidad.',
    thFeature: 'Característica',
    thEzDeck: 'EzDeck (Windows + Móvil)',
    thPhysical: 'Stream Deck Físico',
    thPaid: 'Apps de Pago Típicas',
    tdCost: 'Inversión Inicial',
    tdCostEz: '0 € (Gratis y Open Source)',
    tdCostPh: '150 € a 250 €+',
    tdCostPd: 'Suscripción o pago recurrente',
    tdPriv: 'Conexión y Privacidad',
    tdPrivEz: '✓ 100% Wi-Fi Local (Sin Nube)',
    tdPrivPh: '✓ Cable USB Directo',
    tdPrivPd: '✗ Requiere cuenta en la nube',
    tdDevice: 'Reutilizar Móvil Antiguo',
    tdDeviceEz: '✓ Sí (Android 5.0+ y PWA iOS)',
    tdDevicePh: '✗ No (Hardware cerrado)',
    tdDevicePd: 'Limitado a modelos recientes',
    tdKeys: 'Total de Botones',
    tdKeysEz: 'Hasta 40 teclas (5 páginas de 8)',
    tdKeysPh: '6, 15 o 32 teclas fijas',
    tdKeysPd: 'Limitado según suscripción',
    tdSetup: 'Facilidad de Instalación',
    tdSetupEz: '✓ Instalador .exe (Sin Node.js)',
    tdSetupPh: '✓ Controladores propios',
    tdSetupPd: 'Variable',
    tdLatency: 'Latencia de Respuesta',
    tdLatencyEz: 'Milisegundos (WebSocket local)',
    tdLatencyPh: 'Milisegundos (USB)',
    tdLatencyPd: 'Media/Alta (Depende de Internet)',

    dlTag: 'Descarga Gratuita',
    dlTitle: 'Descarga EzDeck y Empieza Hoy',
    dlSubtitle: 'Consigue el instalador para tu ordenador y conecta tus dispositivos auxiliares.',
    dlWinTitle: 'EzDeck para Windows',
    dlWinDesc: 'Instalador oficial con ventana nativa, icono en la bandeja y runtime integrado. Compatible con Windows 10 y 11.',
    dlWinBtn: 'Descargar EzDeck-Setup.exe',
    dlAndroidTitle: 'Companion Android',
    dlAndroidDesc: 'APK nativa con búsqueda automática por UDP, vibración háptica táctil y reconexión rápida.',
    dlAndroidBtn: 'Descargar APK (Android)',
    dlIosTitle: 'iPhone, iPad y Navegadores',
    dlIosDesc: 'Entra desde Safari o Chrome en la dirección de tu host Windows y selecciona "Añadir a pantalla de inicio".',
    dlIosBtn: 'Ver Instrucciones PWA',

    faqTag: 'Preguntas Frecuentes',
    faqTitle: 'Preguntas y Respuestas',
    faqSubtitle: 'Todo sobre seguridad, conexión de red y compatibilidad.',
    q1: '¿Necesito instalar Node.js en mi ordenador?',
    a1: '<strong>¡No!</strong> El instalador <code>EzDeck-Setup.exe</code> ya incluye todo lo necesario. Solo descarga y ejecuta.',
    q2: '¿Por qué Windows SmartScreen muestra un aviso?',
    a2: 'Pulsa en <strong>"Más información"</strong> y luego en <strong>"Ejecutar de todas formas"</strong>. Descarga siempre de las Releases oficiales en GitHub.',
    q3: '¿Qué hacer si el Firewall de Windows pide permiso?',
    a3: 'Permite el acceso <strong>únicamente en redes privadas</strong> (tu hogar o estudio). No marques redes públicas ni expongas el puerto 3100 a internet.',
    q4: '¿Funciona en iPhone o iPad?',
    a4: '<strong>¡Sí!</strong> Abre Safari en tu iPhone o iPad, escribe la dirección IP local de tu PC y elige <strong>"Añadir a pantalla de inicio"</strong>.',
    q5: '¿Es seguro el sistema de PIN de 4 dígitos?',
    a5: 'El PIN asegura que solo dispositivos autorizados puedan interactuar con tu PC. Bloquea la IP por 60 segundos tras 5 intentos fallidos.',
    q6: '¿Cuál es el origen de EzDeck?',
    a6: 'EzDeck es una evolución independiente para Windows y Android basada en el proyecto de código abierto Dokke (de Felipe Alves), bajo licencia MIT. Mantenido por Ed Stone (eddesignerez).',

    ctaTitle: '¿Listo para controlar tu ordenador como un profesional?',
    ctaDesc: 'Convierte tu teléfono en tu centro de mandos definitivo de forma gratuita.',
    ctaBtn: 'Descargar Gratis para Windows'
  },

  'ja': {
    navSimulator: 'シミュレーター',
    navHowItWorks: '使い方',
    navFeatures: '機能紹介',
    navCompare: '徹底比較',
    navDownloads: 'ダウンロード',
    navFaq: 'よくある質問',
    btnDownloadHeader: '無料ダウンロード',
    heroBadge: '完全無料・オープンソース • クラウド不要',
    heroTitle: '使わなくなった<wbr>スマホが、<wbr>あなたの<wbr>Windows用<wbr><span class="phrase-block"><span class="text-gradient">本格ストリームデッキ</span>に。</span>',
    heroDesc: 'OBS、<wbr>Discord、<wbr>Spotify、<wbr>キーボードマクロを<wbr>手元の<wbr>画面から<wbr>ワンタップ操作。<wbr>自宅の<wbr>Wi-Fiローカル通信だけで<wbr>完結し、<wbr>クラウド不要・超低遅延・完全な<wbr>プライバシーを<wbr>両立します。',
    btnHeroWin: 'Windows版 EzDeck を無料ダウンロード',
    btnHeroGithub: 'GitHubでコードを見る',
    specWin: 'Windows 10 & 11 対応',
    specNode: 'Node.js のインストール不要',
    specMobile: 'Android 5.0+ / iOS (PWA)',
    specLocal: '100% 自宅Wi-Fiローカル通信',

    simHostTitle: 'Windows 11 Pro — EzDeck ホスト稼働中',
    simHostSubtitle: 'ローカルWi-Fi通信<wbr>（クラウド不要）<wbr> • 遅延 < 2ms',
    simHint: '下の<wbr>スマホの<wbr>ボタンを<wbr>タップすると、<wbr>上の<wbr>PC画面が<wbr>リアルタイムで<wbr>連動します',
    btnPrevPage: '前のページ',
    btnNextPage: '次のページ',
    pageIndicator: 'ページ {current} / {total}',

    stepsTag: 'かんたん3ステップ',
    stepsTitle: 'わずか<wbr>2分で<wbr>セットアップ完了',
    stepsSubtitle: 'プログラミングや<wbr>専門知識は<wbr>不要。<wbr>今日から<wbr>すぐ<wbr>使えます。',
    step1Title: 'PCに<wbr>インストールするだけ',
    step1Desc: 'EzDeck-Setup.exeを<wbr>実行。<wbr>必要な<wbr>ランタイムが<wbr>すべて<wbr>同梱されている<wbr>ため、<wbr>Node.jsなどの<wbr>追加環境構築は<wbr>一切<wbr>不要です。<wbr>タスクトレイに<wbr>常駐します。',
    step2Title: '4桁の<wbr>PINで<wbr>安全ペアリング',
    step2Desc: 'スマホの<wbr>アプリを<wbr>開くか<wbr>ブラウザで<wbr>アクセス。<wbr>UDP<wbr>自動探索で<wbr>同一Wi-Fi内の<wbr>PCを<wbr>検出し、<wbr>4桁の<wbr>PINを<wbr>入れるだけで<wbr>接続完了。',
    step3Title: 'ドラッグ＆ドロップで<wbr>即戦力',
    step3Desc: 'PC画面から<wbr>使いたい<wbr>アプリや<wbr>ショートカットキー<wbr>（Ctrl+Cや<wbr>Win+Shift+S）を<wbr>8枠の<wbr>スロットへ<wbr>ドラッグするだけ。<wbr>スマホ側へ<wbr>即時同期されます。',

    bentoTag: '機能と<wbr>こだわり',
    bentoTitle: '圧倒的な<wbr>スピード、<wbr>プライバシー、<wbr>自由度',
    bentoSubtitle: '月額課金も<wbr>外部サーバーへの<wbr>依存も<wbr>ありません。<wbr>あなたの<wbr>デスクに<wbr>究極の<wbr>操作性を。',
    bento1Title: '100% ローカル通信・ゼロクラウド',
    bento1Desc: '操作ログや<wbr>ショートカット情報が<wbr>外部サーバーへ<wbr>送信される<wbr>ことは<wbr>ありません。<wbr>インターネット回線が<wbr>切断されても、<wbr>自宅Wi-Fi内で<wbr>問題なく<wbr>動作し続けます。',
    bento1Tag: 'プライバシー重視設計・外部通信なし',
    bento2Title: '最大40個の<wbr>ショートカット<wbr>（5ページ×8キー）',
    bento2Desc: '配信、<wbr>ゲーム、<wbr>動画編集など用途ごとに<wbr>ページを<wbr>整理。<wbr>誤タップを<wbr>防ぐ<wbr>大型キー設計。',
    bento2Tag: '1ページ8キー<wbr>（4×2グリッド）',
    bento3Title: 'OBS Studio 公式WebSocket連携',
    bento3Desc: 'obs-ws v5に<wbr>対応。<wbr>シーン切替、<wbr>マイクの<wbr>ミュート、<wbr>録画開始を<wbr>ラグなしで<wbr>直感操作。',
    bento3Tag: 'obs-ws v5 完全対応',
    bento4Title: '実行ファイル<wbr>（.exe / .bat）<wbr>や<wbr>キーボードマクロに<wbr>対応',
    bento4Desc: 'スタートメニューの<wbr>登録アプリは<wbr>もちろん、<wbr>自作バッチファイルや<wbr>複雑な<wbr>キー同時押しも<wbr>手元の<wbr>ボタンひとつで<wbr>発火。',
    bento4Tag: 'スタートメニュー＆Storeアプリ<wbr>自動読み込み',
    bento5Title: 'UDP <wbr>自動探索機能',
    bento5Desc: '面倒な<wbr>IPアドレスの<wbr>入力は<wbr>不要。<wbr>Wi-Fi内の<wbr>EzDeckホストを<wbr>アプリが<wbr>自動検出します。',
    bento5Tag: '1タップで<wbr>即ペアリング',
    bento6Title: 'あらゆる<wbr>デバイスが<wbr>コントローラーに',
    bento6Desc: 'Android専用アプリ<wbr>（Android 5.0以降<wbr>対応）は<wbr>もちろん、<wbr>iPhone・iPadでも<wbr>ブラウザから<wbr>PWAと<wbr>して<wbr>全画<wbr>面動作します。',
    bento6Tag: '古い<wbr>端末を<wbr>アップサイクル',

    compareTag: '徹底比較',
    compareTitle: 'EzDeck vs 専用ハードウェア vs 有料アプリ',
    compareSubtitle: 'EzDeckが<wbr>コスト、<wbr>プライバシー、<wbr>実用性に<wbr>おいて<wbr>選ばれる<wbr>理由。',
    thFeature: '項目',
    thEzDeck: 'EzDeck (Windows + スマホ)',
    thPhysical: '専用ストリームデッキ機',
    thPaid: '従来の有料アプリ',
    tdCost: '初期費用',
    tdCostEz: '0円（完全無料・オープンソース）',
    tdCostPh: '15,000円 〜 35,000円以上',
    tdCostPd: '月額制または買い切り数千円',
    tdPriv: '通信とプライバシー',
    tdPrivEz: '✓ 100% 自宅Wi-Fi（クラウド不要）',
    tdPrivPh: '✓ USB有線接続',
    tdPrivPd: '✗ 外部クラウド・アカウント登録必須',
    tdDevice: '古いスマホの再利用',
    tdDeviceEz: '✓ Android 5.0+ / iOS PWA 対応',
    tdDevicePh: '✗ 専用端末のみ（拡張不可）',
    tdDevicePd: '最新OS端末に限定されがち',
    tdKeys: '登録ボタン数',
    tdKeysEz: '最大40キー（5ページ×8キー）',
    tdKeysPh: '6個 / 15個 / 32個 固定',
    tdKeysPd: 'プランにより制限あり',
    tdSetup: '導入の手軽さ',
    tdSetupEz: '✓ .exeインストーラーのみ（Node.js不要）',
    tdSetupPh: '専用ドライバー必須',
    tdSetupPd: '各種設定が必要',
    tdLatency: '応答速度（遅延）',
    tdLatencyEz: 'ミリ秒単位（WebSocket超低遅延）',
    tdLatencyPh: 'ミリ秒単位（USB有線）',
    tdLatencyPd: '中〜高（外部サーバー経由）',

    dlTag: '無料ダウンロード',
    dlTitle: '今すぐ<wbr>EzDeckを<wbr>インストール',
    dlSubtitle: 'お使いの<wbr>パソコンに<wbr>インストーラーを<wbr>ダウンロードし、<wbr>スマホを<wbr>接続しましょう。',
    dlWinTitle: 'EzDeck for Windows',
    dlWinDesc: 'タスクトレイ常駐・ネイティブウィンドウ・ランタイム内蔵。<wbr>Windows 10 / 11 対応。',
    dlWinBtn: 'EzDeck-Setup.exe を<wbr>ダウンロード',
    dlAndroidTitle: 'Android コンパニオン',
    dlAndroidDesc: 'UDP<wbr>自動探索・バイブレーション触覚フィードバック対応。<wbr>Android 5.0以降<wbr>対応。',
    dlAndroidBtn: 'APKを<wbr>ダウンロード<wbr>（Android）',
    dlIosTitle: 'iPhone・iPad・各種ブラウザ',
    dlIosDesc: 'Safariまたは<wbr>Chromeで<wbr>ホスト画面の<wbr>URLを<wbr>開き、<wbr>「ホーム画面に<wbr>追加」するだけで<wbr>全画面起動。',
    dlIosBtn: 'PWAの<wbr>使い方を<wbr>見る',

    faqTag: 'よく<wbr>ある<wbr>質問',
    faqTitle: 'Q&A<wbr>（FAQ）',
    faqSubtitle: 'セキュリティ、<wbr>ネットワーク接続、<wbr>動作環境に<wbr>ついて<wbr>お答えします。',
    q1: 'PCに<wbr>Node.jsを<wbr>インストールする<wbr>必要が<wbr>ありますか？',
    a1: '<strong>いいえ、<wbr>必要ありません。</strong> 公式インストーラー <code>EzDeck-Setup.exe</code> には<wbr>動作に<wbr>必要な<wbr>ランタイムが<wbr>すべて<wbr>内包されています。<wbr>ダブルクリックするだけで<wbr>ご利用いただけます。',
    q2: 'Windows SmartScreen の<wbr>警告が<wbr>出た<wbr>場合の<wbr>対処法は？',
    a2: '初回起動時に<wbr>「Windowsに<wbr>よって<wbr>PCが<wbr>保護されました」と<wbr>表示された<wbr>場合は、<strong>「詳細情報」<wbr>→<wbr>「実行」</strong>を<wbr>クリックしてください。<wbr>必ず<wbr>公式GitHub Releasesから<wbr>ダウンロードしてください。',
    q3: 'Windowsファイアウォールで<wbr>許可を<wbr>求められたら？',
    a3: '<strong>プライベートネットワーク<wbr>（自宅・スタジオの<wbr>Wi-Fi）のみ<wbr>許可</strong>してください。<wbr>パブリックネットワークは<wbr>許可せず、<wbr>3100ポートを<wbr>インターネットへ<wbr>公開しないでください。',
    q4: 'iPhoneや<wbr>iPadでも<wbr>使えますか？',
    a4: '<strong>はい、<wbr>快適に<wbr>ご利用いただけます。</strong> iPhoneや<wbr>iPadの<wbr>Safariで、<wbr>PC画面の<wbr>URLを<wbr>開き、<wbr>共有ボタンから<strong>「ホーム画面に<wbr>追加」</strong>を<wbr>タップしてください。',
    q5: '4桁の<wbr>PINコードの<wbr>セキュリティは<wbr>どうなっていますか？',
    a5: 'PINは<wbr>認証された<wbr>端末のみが<wbr>PCを<wbr>操作できるように<wbr>保護します。<wbr>5回連続で<wbr>PINを<wbr>間違えると<wbr>該当IPは<wbr>60秒間ロックされます。',
    q6: 'EzDeckの<wbr>開発経緯に<wbr>ついて',
    a6: 'EzDeckは、<wbr>Felipe Alves氏が<wbr>MITライセンスで<wbr>公開した<wbr>「Dokke」に<wbr>着想を<wbr>得て、<wbr>Ed Stone (eddesignerez) が<wbr>Windowsネイティブ環境およびAndroid向けに<wbr>独自に<wbr>拡張・<wbr>発展させた<wbr>独立プロジェクトです。',

    ctaTitle: 'さあ、<wbr>あなたの<wbr>PC環境を<wbr>アップグレードしましょう',
    ctaDesc: '眠っている<wbr>スマホを<wbr>活用して、<wbr>今すぐ<wbr>快適な<wbr>ショートカット環境を<wbr>手に<wbr>入れましょう。',
    ctaBtn: 'Windows版を<wbr>無料ダウンロード'
  }
};

// Traduções completas nativas para os 11 idiomas oficiais
translations['it'] = {
  "navSimulator": "Simulatore",
  "navHowItWorks": "Come Funziona",
  "navFeatures": "Funzionalità",
  "navCompare": "Confronto",
  "navDownloads": "Download",
  "navFaq": "FAQ",
  "btnDownloadHeader": "Scarica",
  "heroBadge": "100% Gratuito & Open Source • Zero Cloud",
  "heroTitle": "Il tuo vecchio smartphone ora è il tuo <span class=\"text-gradient\">Stream Deck</span> su Windows.",
  "heroDesc": "Controlla OBS Studio, Discord, Spotify, giochi e macro di Windows direttamente dallo schermo del tuo smartphone o tablet. Connessione Wi-Fi locale ultraveloce a bassissima latenza e massima privacy.",
  "btnHeroWin": "Scarica EzDeck per Windows",
  "btnHeroGithub": "Codice sorgente su GitHub",
  "specWin": "Windows 10 & 11",
  "specNode": "Nessun Node.js richiesto",
  "specMobile": "Android 5.0+ e PWA iOS",
  "specLocal": "100% Rete Locale",
  "simHostTitle": "Windows 11 Pro — EzDeck Host Attivo",
  "simHostSubtitle": "Rete Wi-Fi Locale (Zero Cloud) • Latenza < 2ms",
  "simHint": "Tocca i tasti dello smartphone qui sotto per controllare il PC in tempo reale",
  "btnPrevPage": "Precedente",
  "btnNextPage": "Successiva",
  "pageIndicator": "Pagina {current} di {total}",
  "stepsTag": "Semplice e Veloce",
  "stepsTitle": "Pronto all'uso in 3 semplici passaggi",
  "stepsSubtitle": "Nessuna competenza di programmazione richiesta. In meno di 2 minuti il tuo controller sarà configurato.",
  "step1Title": "Installa su Windows",
  "step1Desc": "Scarica l'eseguibile EzDeck-Setup.exe. Include già tutti i componenti necessari; non serve installare Node.js. Troverai un'icona comoda nella barra delle applicazioni.",
  "step2Title": "Associa con PIN a 4 cifre",
  "step2Desc": "Apri l'app su Android o accedi dal browser su iOS. Il rilevamento UDP automatico trova il tuo PC nella rete Wi-Fi. Digita il PIN a 4 cifre per connetterti in sicurezza.",
  "step3Title": "Trascina e usa subito",
  "step3Desc": "Dalla finestra di EzDeck, trascina programmi, combinazioni di tasti (come Ctrl+C o Win+Shift+S) e comandi OBS nei pulsanti del deck. Lo smartphone si aggiorna all'istante.",
  "bentoTag": "Caratteristiche e Vantaggi",
  "bentoTitle": "Progettato per velocità, privacy e controllo assoluto",
  "bentoSubtitle": "Nessun abbonamento mensile né dipendenza da server esterni. Massima reattività sulla tua scrivania.",
  "bento1Title": "100% Rete Locale — Zero Cloud & Privacy Totale",
  "bento1Desc": "Nessun comando, scorciatoia o telemetria esce dalla tua rete domestica. Funziona perfettamente anche se la connessione internet si interrompe durante una live.",
  "bento1Tag": "Privacy per progettazione — Senza telemetria",
  "bento2Title": "Fino a 40 Tasti in 5 Pagine",
  "bento2Desc": "Organizza la tua configurazione in 5 pagine dedicate da 8 tasti ciascuna (griglia 4x2) per live streaming, giochi, lavoro o scorciatoie quotidiane.",
  "bento2Tag": "8 pulsanti per pagina (Griglia 4x2)",
  "bento3Title": "Integrazione Nativa OBS Studio",
  "bento3Desc": "Supporto WebSocket v5 integrato. Cambia scene, disattiva il microfono e avvia registrazioni al volo con zero latenza percettibile.",
  "bento3Tag": "Compatibile obs-ws v5",
  "bento4Title": "Scorciatoie da Tastiera, File .exe e Script",
  "bento4Desc": "Associa combinazioni globali con Ctrl, Alt, Shift e Win, oppure avvia file .exe, collegamenti .lnk e script .bat con un tocco.",
  "bento4Tag": "Rileva menu Start e app Microsoft Store",
  "bento5Title": "Rilevamento Automatico UDP",
  "bento5Desc": "Nessun bisogno di cercare l'indirizzo IP locale. L'applicazione compagna individua automaticamente il PC host nella rete Wi-Fi.",
  "bento5Tag": "Associazione con 1 tocco",
  "bento6Title": "Qualsiasi Schermo Diventa un Controller",
  "bento6Desc": "Funziona su Android con APK nativo dedicato (da Android 5.0 in poi) o su iPhone e iPad da Safari/Chrome come Web App PWA a schermo intero.",
  "bento6Tag": "Riutilizza vecchi dispositivi",
  "compareTag": "Trasparenza",
  "compareTitle": "EzDeck vs Stream Deck Fisico vs App a Pagamento",
  "compareSubtitle": "Scopri perché EzDeck offre il miglior equilibrio tra convenienza economica, privacy e versatilità.",
  "thFeature": "Caratteristica",
  "thEzDeck": "EzDeck (Windows + Smartphone)",
  "thPhysical": "Stream Deck Fisico",
  "thPaid": "Tipiche App a Pagamento",
  "tdCost": "Costo Iniziale",
  "tdCostEz": "0 € (Gratuito & Open Source)",
  "tdCostPh": "da 150 € a oltre 250 €",
  "tdCostPd": "Abbonamento o licenza a pagamento",
  "tdPriv": "Connessione e Privacy",
  "tdPrivEz": "✓ 100% Wi-Fi Locale (Senza Cloud)",
  "tdPrivPh": "✓ Cavo USB Diretto",
  "tdPrivPd": "✗ Richiede account e cloud esterno",
  "tdDevice": "Riutilizzo Smartphone",
  "tdDeviceEz": "✓ Sì (Android 5.0+ e iOS PWA)",
  "tdDevicePh": "✗ No (Hardware dedicato)",
  "tdDevicePd": "Limitato ai sistemi recenti",
  "tdKeys": "Tasti Disponibili",
  "tdKeysEz": "Fino a 40 tasti (5 pagine da 8)",
  "tdKeysPh": "6, 15 o 32 tasti fissi",
  "tdKeysPd": "Limitato dall'abbonamento",
  "tdSetup": "Semplicità di Installazione",
  "tdSetupEz": "✓ Installatore .exe (Senza Node.js)",
  "tdSetupPh": "✓ Driver proprietari",
  "tdSetupPd": "Variabile",
  "tdLatency": "Latenza di Risposta",
  "tdLatencyEz": "Millisecondi (WebSocket locale)",
  "tdLatencyPh": "Millisecondi (USB)",
  "tdLatencyPd": "Media/Alta (Dipende da Internet)",
  "dlTag": "Download Gratuito",
  "dlTitle": "Scarica EzDeck e Inizia Subito",
  "dlSubtitle": "Ottieni l'installatore per il tuo PC Windows e connetti i tuoi dispositivi ausiliari.",
  "dlWinTitle": "EzDeck per Windows",
  "dlWinDesc": "Installatore ufficiale con finestra nativa, icona nell'area di notifica e runtime integrato. Compatibile con Windows 10 e 11.",
  "dlWinBtn": "Scarica EzDeck-Setup.exe",
  "dlAndroidTitle": "Companion Android",
  "dlAndroidDesc": "APK dedicato con ricerca automatica UDP, feedback aptico a vibrazione e riconnessione istantanea.",
  "dlAndroidBtn": "Scarica APK (Android)",
  "dlIosTitle": "iPhone, iPad & Browser",
  "dlIosDesc": "Accedi dall'indirizzo visualizzato su Windows da Safari o Chrome e seleziona \"Aggiungi a schermata Home\".",
  "dlIosBtn": "Istruzioni PWA",
  "faqTag": "Domande Frequenti",
  "faqTitle": "Domande e Risposte",
  "faqSubtitle": "Tutto quello che c'è da sapere su sicurezza, connessione e compatibilità.",
  "q1": "Devo installare Node.js sul computer?",
  "a1": "<strong>No!</strong> L'installatore ufficiale <code>EzDeck-Setup.exe</code> include già tutto il runtime necessario. Basta scaricare ed eseguire. Node.js serve solo per sviluppatori che desiderano compilare il codice sorgente.",
  "q2": "Perché Windows SmartScreen mostra un avviso?",
  "a2": "Essendo EzDeck un progetto open-source indipendente in attesa di firma digitale gratuita tramite SignPath Foundation, Windows può mostrare un avviso di applicazione non riconosciuta. Clicca su <strong>\"Ulteriori informazioni\"</strong> e poi su <strong>\"Esegui comunque\"</strong>. Scarica sempre dalle Release ufficiali di GitHub.",
  "q3": "Cosa fare se Windows Firewall richiede autorizzazione?",
  "a3": "Consenti l'accesso <strong>esclusivamente su reti private</strong> (la tua rete Wi-Fi di casa o studio). Non consentire reti pubbliche ed evita di esporre la porta 3100 a internet.",
  "q4": "Funziona su iPhone o iPad?",
  "a4": "<strong>Sì!</strong> Apri Safari sul tuo dispositivo Apple, digita l'indirizzo IP locale mostrato su EzDeck per Windows (es. <code>http://192.168.1.15:3100</code>) e tocca Condividi → <strong>\"Aggiungi a schermata Home\"</strong> per avviarlo a schermo intero.",
  "q5": "Quanto è sicuro il sistema con PIN a 4 cifre?",
  "a5": "Il PIN garantisce che solo i dispositivi autorizzati possano inviare comandi al PC. È presente una protezione anti-bruteforce che blocca l'IP per 60 secondi dopo 5 tentativi errati consecutivi.",
  "q6": "Qual è l'origine del progetto EzDeck?",
  "a6": "EzDeck è un'evoluzione indipendente per Windows e Android ispirata al progetto open-source Dokke (creato da Felipe Alves) con licenza MIT. Curato da Ed Stone (eddesignerez), aggiunge installer nativo Windows, gestione avanzata delle macro da tastiera, integrazione OBS Studio, APK Android e traduzione in 11 lingue.",
  "ctaTitle": "Pronto a prendere il pieno controllo del tuo PC?",
  "ctaDesc": "Riutilizza il tuo vecchio smartphone e crea la tua console di controllo personalizzata a costo zero.",
  "ctaBtn": "Scarica Gratis per Windows",
  "footerDesc": "Trasforma qualsiasi smartphone o tablet in un controller tattile per streaming e produttività su Windows. 100% gratuito, privato e senza cloud.",
  "footerColProduct": "Prodotto",
  "footerNavSimulator": "Simulatore Interattivo",
  "footerNavHow": "Come Funziona",
  "footerNavFeatures": "Funzionalità e Vantaggi",
  "footerNavDownloads": "Download Ufficiali",
  "footerColDocs": "Documentazione",
  "footerManual": "Manuale d'Uso",
  "footerMindmap": "Mappa Mentale Architettura",
  "footerPrivacy": "Informativa sulla Privacy",
  "footerSecurity": "Sicurezza e Rete",
  "footerColCommunity": "Comunità & Codice",
  "footerRepo": "Repository GitHub",
  "footerReleases": "Versioni e Changelog",
  "footerIssues": "Segnala un Problema",
  "footerLicense": "Licenza MIT",
  "footerCopyright": "&copy; 2026 EzDeck. Sviluppato e mantenuto da <strong>Ed Stone (eddesignerez)</strong>.",
  "footerCredits": "Ispirato al progetto open source <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> di Felipe Alves con licenza MIT."
};
translations['fr'] = {
  "navSimulator": "Simulateur",
  "navHowItWorks": "Comment ça marche",
  "navFeatures": "Fonctionnalités",
  "navCompare": "Comparatif",
  "navDownloads": "Téléchargements",
  "navFaq": "FAQ",
  "btnDownloadHeader": "Télécharger",
  "heroBadge": "100% Gratuit & Open Source • Zéro Cloud",
  "heroTitle": "Votre ancien smartphone devient votre <span class=\"text-gradient\">Stream Deck</span> sur Windows.",
  "heroDesc": "Contrôlez OBS Studio, Discord, Spotify, vos jeux et raccourcis Windows d'un simple toucher sur votre écran mobile. Connexion Wi-Fi locale instantanée, latence ultra-faible et confidentialité totale.",
  "btnHeroWin": "Télécharger EzDeck pour Windows",
  "btnHeroGithub": "Code source sur GitHub",
  "specWin": "Windows 10 & 11",
  "specNode": "Sans installer Node.js",
  "specMobile": "Android 5.0+ & PWA iOS",
  "specLocal": "100% Réseau Local",
  "simHostTitle": "Windows 11 Pro — Hôte EzDeck Actif",
  "simHostSubtitle": "Réseau Wi-Fi Local (Zéro Cloud) • Latence < 2ms",
  "simHint": "Touchez les touches du smartphone ci-dessous pour déclencher les actions sur le PC en direct",
  "btnPrevPage": "Précédente",
  "btnNextPage": "Suivante",
  "pageIndicator": "Page {current} sur {total}",
  "stepsTag": "Simple & Rapide",
  "stepsTitle": "Opérationnel en 3 étapes simples",
  "stepsSubtitle": "Aucune compétence en programmation requise. En moins de 2 minutes, votre contrôleur est prêt.",
  "step1Title": "Installez sur votre PC Windows",
  "step1Desc": "Téléchargez l'exécutable EzDeck-Setup.exe. Le runtime nécessaire est directement inclus ; aucune installation de Node.js n'est requise. Se loge discrètement dans votre zone de notification.",
  "step2Title": "Appairez avec un code PIN à 4 chiffres",
  "step2Desc": "Ouvrez l'application sur Android ou le navigateur sur iOS. La détection UDP trouve automatiquement votre PC sur le Wi-Fi. Tapez le code PIN pour sécuriser la connexion.",
  "step3Title": "Glissez-déposez et contrôlez",
  "step3Desc": "Dans la fenêtre EzDeck, glissez vos logiciels, combinaisons de touches (Ctrl+C, Win+Shift+S) et actions OBS dans les 8 slots du deck. Votre smartphone se met à jour instantanément.",
  "bentoTag": "Fonctionnalités & Conception",
  "bentoTitle": "Conçu pour la vitesse, la confidentialité et un contrôle total",
  "bentoSubtitle": "Sans abonnement ni serveur distant. Tout ce dont vous avez besoin pour vos streams et votre bureau.",
  "bento1Title": "100% Réseau Local — Zéro Cloud & Confidentialité Totale",
  "bento1Desc": "Aucune commande, raccourci ou donnée ne quitte votre réseau Wi-Fi local. Continue de fonctionner même en cas de coupure d'accès à internet pendant un live.",
  "bento1Tag": "Confidentialité par conception — Zéro télémétrie",
  "bento2Title": "Jusqu'à 40 Boutons sur 5 Pages",
  "bento2Desc": "Organisez vos touches en 5 pages dédiées de 8 boutons chacune (grille 4x2) pour le streaming, les jeux, le montage ou les tâches quotidiennes.",
  "bento2Tag": "8 boutons par page (Grille 4x2)",
  "bento3Title": "Intégration Native OBS Studio",
  "bento3Desc": "Prise en charge native de WebSocket v5 (obs-ws). Changez de scène, coupez le micro et lancez un enregistrement d'un seul geste sans décalage.",
  "bento3Tag": "Compatible obs-ws v5",
  "bento4Title": "Raccourcis Clavier, Fichiers .exe et Scripts",
  "bento4Desc": "Enregistrez n'importe quelle combinaison avec Ctrl, Alt, Shift et Win, ou lancez directement des fichiers .exe, raccourcis .lnk et scripts .bat.",
  "bento4Tag": "Lit le menu Démarrer et le Microsoft Store",
  "bento5Title": "Découverte Automatique par UDP",
  "bento5Desc": "Plus besoin de chercher votre adresse IP locale. L'application mobile détecte automatiquement l'hôte Windows sur le même réseau Wi-Fi.",
  "bento5Tag": "Connexion en 1 clic",
  "bento6Title": "Tout Écran Devient un Contrôleur",
  "bento6Desc": "Fonctionne sur Android avec un APK natif (dès Android 5.0) ou sur iPhone et iPad via Safari en Web App PWA plein écran.",
  "bento6Tag": "Donnez une seconde vie à vos appareils",
  "compareTag": "Transparence",
  "compareTitle": "EzDeck vs Boîtier Physique vs Applications Payantes",
  "compareSubtitle": "Découvrez pourquoi EzDeck offre le meilleur compromis entre coût, respect de la vie privée et polyvalence.",
  "thFeature": "Caractéristique",
  "thEzDeck": "EzDeck (Windows + Mobile)",
  "thPhysical": "Stream Deck Matériel",
  "thPaid": "Applications Payantes",
  "tdCost": "Coût Initial",
  "tdCostEz": "0 € (Gratuit & Open Source)",
  "tdCostPh": "150 € à 250 €+",
  "tdCostPd": "Abonnement mensuel ou achat récurrent",
  "tdPriv": "Connexion & Vie Privée",
  "tdPrivEz": "✓ 100% Wi-Fi Local (Sans Cloud)",
  "tdPrivPh": "✓ Câble USB Direct",
  "tdPrivPd": "✗ Compte en ligne et serveur distant requis",
  "tdDevice": "Recyclage Smartphone",
  "tdDeviceEz": "✓ Oui (Android 5.0+ & iOS PWA)",
  "tdDevicePh": "✗ Non (Matériel propriétaire)",
  "tdDevicePd": "Souvent restreint aux versions récentes",
  "tdKeys": "Nombre de Touches",
  "tdKeysEz": "Jusqu'à 40 touches (5 pages de 8)",
  "tdKeysPh": "6, 15 ou 32 touches fixes",
  "tdKeysPd": "Limité selon la formule",
  "tdSetup": "Facilité d'Installation",
  "tdSetupEz": "✓ Fichier .exe autonome (Sans Node.js)",
  "tdSetupPh": "✓ Pilotes dédiés",
  "tdSetupPd": "Variable",
  "tdLatency": "Latence de Réponse",
  "tdLatencyEz": "Millisecondes (WebSocket local)",
  "tdLatencyPh": "Millisecondes (USB)",
  "tdLatencyPd": "Moyenne/Élevée (Dépend du cloud)",
  "dlTag": "Téléchargement Gratuit",
  "dlTitle": "Téléchargez EzDeck et Démarrez",
  "dlSubtitle": "Obtenez l'installateur officiel pour Windows et connectez vos appareils mobiles.",
  "dlWinTitle": "EzDeck pour Windows",
  "dlWinDesc": "Installateur officiel avec fenêtre native, icône de barre des tâches et runtime embarqué. Compatible Windows 10 et 11.",
  "dlWinBtn": "Télécharger EzDeck-Setup.exe",
  "dlAndroidTitle": "Compagnon Android",
  "dlAndroidDesc": "APK dédié avec découverte automatique UDP, vibration haptique et reconnexion rapide. Android 5.0 et plus.",
  "dlAndroidBtn": "Télécharger l'APK (Android)",
  "dlIosTitle": "iPhone, iPad & Navigateurs",
  "dlIosDesc": "Ouvrez l'adresse affichée sur votre PC dans Safari ou Chrome et touchez \"Sur l'écran d'accueil\".",
  "dlIosBtn": "Instructions PWA",
  "faqTag": "Foire Aux Questions",
  "faqTitle": "Questions Fréquentes",
  "faqSubtitle": "Tout ce que vous devez savoir sur la sécurité, le réseau et la compatibilité.",
  "q1": "Faut-il installer Node.js sur mon ordinateur ?",
  "a1": "<strong>Non !</strong> L'exécutable <code>EzDeck-Setup.exe</code> intègre déjà l'environnement requis. Il suffit de double-cliquer pour l'utiliser. Node.js n'est utile que si vous êtes développeur et modifiez le code source.",
  "q2": "Pourquoi Windows SmartScreen affiche-t-il une alerte ?",
  "a2": "En tant que projet open-source en cours de labellisation de signature avec la fondation SignPath, Windows peut afficher un avertissement standard d'application non reconnue. Cliquez sur <strong>\"Informations complémentaires\"</strong> puis sur <strong>\"Exécuter quand même\"</strong>. Téléchargez toujours depuis les Releases officielles GitHub.",
  "q3": "Que faire si le Pare-feu Windows demande une autorisation ?",
  "a3": "Autorisez l'accès <strong>uniquement sur les réseaux privés</strong> (votre domicile ou studio). Ne cochez pas les réseaux publics et n'exposez jamais le port 3100 sur internet.",
  "q4": "Est-ce compatible avec un iPhone ou un iPad ?",
  "a4": "<strong>Oui !</strong> Ouvrez Safari sur votre appareil Apple, saisissez l'adresse IP locale indiquée dans la fenêtre EzDeck (ex: <code>http://192.168.1.15:3100</code>), appuyez sur le bouton Partager puis sur <strong>\"Sur l'écran d'accueil\"</strong>.",
  "q5": "Le code PIN à 4 chiffres est-il sécurisé ?",
  "a5": "Le PIN garantit que seuls vos appareils connectés à votre réseau Wi-Fi peuvent déclencher des commandes. Il intègre un verrouillage anti-brute force bloquant l'IP pendant 60 secondes après 5 échecs consécutifs.",
  "q6": "Quelle est l'origine d'EzDeck ?",
  "a6": "EzDeck est une évolution indépendante pour Windows et Android basée sur le projet libre Dokke créé par Felipe Alves (licence MIT). Maintenu par Ed Stone (eddesignerez), EzDeck apporte un installeur Windows autonome, la gestion des macros, l'intégration OBS Studio, un APK Android dédié et un support multilingue en 11 langues.",
  "ctaTitle": "Prêt à prendre le contrôle de votre PC ?",
  "ctaDesc": "Donnez une seconde jeunesse à votre ancien téléphone et profitez d'un Stream Deck complet sans débourser un centime.",
  "ctaBtn": "Télécharger Gratuitement pour Windows",
  "footerDesc": "Transformez n'importe quel smartphone ou tablette en un contrôleur tactile de streaming et de productivité pour Windows. 100% gratuit, privé et sans cloud.",
  "footerColProduct": "Produit",
  "footerNavSimulator": "Simulateur Interactif",
  "footerNavHow": "Comment ça Marche",
  "footerNavFeatures": "Fonctionnalités & Avantages",
  "footerNavDownloads": "Téléchargements Officiels",
  "footerColDocs": "Documentation",
  "footerManual": "Guide d'Utilisation",
  "footerMindmap": "Carte Mentale de l'Architecture",
  "footerPrivacy": "Politique de Confidentialité",
  "footerSecurity": "Sécurité & Réseau",
  "footerColCommunity": "Communauté & Code",
  "footerRepo": "Dépôt GitHub",
  "footerReleases": "Versions et Journal des modifications",
  "footerIssues": "Signaler un Problème",
  "footerLicense": "Licence MIT",
  "footerCopyright": "&copy; 2026 EzDeck. Développé et maintenu par <strong>Ed Stone (eddesignerez)</strong>.",
  "footerCredits": "Inspiré du projet open source <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> de Felipe Alves sous licence MIT."
};
translations['de'] = {
  "navSimulator": "Simulator",
  "navHowItWorks": "Funktionsweise",
  "navFeatures": "Funktionen",
  "navCompare": "Vergleich",
  "navDownloads": "Downloads",
  "navFaq": "FAQ",
  "btnDownloadHeader": "Herunterladen",
  "heroBadge": "100% Kostenlos & Open Source • Keine Cloud",
  "heroTitle": "Dein altes Smartphone wird zum vollwertigen <span class=\"text-gradient\">Stream Deck</span> für Windows.",
  "heroDesc": "Steuere OBS Studio, Discord, Spotify, Games und Windows-Tastatur-Makros direkt über den Touchscreen deines Smartphones oder Tablets. Blitzschnelle lokale Wi-Fi-Verbindung mit minimaler Latenz und absolutem Datenschutz.",
  "btnHeroWin": "EzDeck für Windows herunterladen",
  "btnHeroGithub": "Quellcode auf GitHub ansehen",
  "specWin": "Windows 10 & 11",
  "specNode": "Keine Node.js-Installation nötig",
  "specMobile": "Android 5.0+ & iOS PWA",
  "specLocal": "100% Lokales Netzwerk",
  "simHostTitle": "Windows 11 Pro — EzDeck Host Aktiv",
  "simHostSubtitle": "Lokales Wi-Fi-Netzwerk (Keine Cloud) • Latenz < 2ms",
  "simHint": "Tippe unten auf die Tasten des Smartphones, um Aktionen auf dem PC in Echtzeit auszulösen",
  "btnPrevPage": "Zurück",
  "btnNextPage": "Weiter",
  "pageIndicator": "Seite {current} von {total}",
  "stepsTag": "Schnell & Unkompliziert",
  "stepsTitle": "In 3 einfachen Schritten startklar",
  "stepsSubtitle": "Keine Programmierkenntnisse erforderlich. In weniger als zwei Minuten ist deine Steuerung einsatzbereit.",
  "step1Title": "Auf Windows installieren",
  "step1Desc": "Lade die Datei EzDeck-Setup.exe herunter. Die benötigte Laufzeitumgebung ist vollständig enthalten – du musst kein Node.js installieren. Sitzt bequem in der Taskleiste.",
  "step2Title": "Mit 4-stelligem PIN koppeln",
  "step2Desc": "Öffne die App auf Android oder rufe die Adresse im Browser auf iOS auf. Die automatische UDP-Erkennung findet deinen PC im WLAN. Gib den 4-stelligen PIN ein.",
  "step3Title": "Per Drag & Drop belegen",
  "step3Desc": "Ziehe gewünschte Programme, Tastenkombinationen (wie Strg+C oder Win+Umschalt+S) und OBS-Aktionen in die 8 Slots. Das Smartphone aktualisiert sich sofort.",
  "bentoTag": "Funktionen & Vorteile",
  "bentoTitle": "Entwickelt für Geschwindigkeit, Privatsphäre und volle Kontrolle",
  "bentoSubtitle": "Keine monatlichen Abo-Gebühren, keine externen Server. Maximale Reaktionsfähigkeit auf deinem Schreibtisch.",
  "bento1Title": "100% Lokales Netzwerk — Null Cloud & Echter Datenschutz",
  "bento1Desc": "Keine Tastenbefehle oder Diagnosedaten verlassen dein Heimnetzwerk. Funktioniert selbst dann problemlos weiter, wenn während eines Streams das Internet ausfällt.",
  "bento1Tag": "Datenschutz durch Design — Keine Telemetrie",
  "bento2Title": "Bis zu 40 Tasten auf 5 Seiten",
  "bento2Desc": "Organisiere dein Setup auf 5 Seiten mit jeweils 8 Tasten (4x2 Raster) für Streaming, Gaming, Videoschnitt oder tägliche Büroarbeit.",
  "bento2Tag": "8 Tasten pro Seite (4x2 Raster)",
  "bento3Title": "Native OBS Studio Integration",
  "bento3Desc": "Direkte WebSocket v5-Unterstützung (obs-ws). Wechsle Szenen, schalte das Mikrofon stumm oder starte Aufnahmen ohne spürbare Verzögerung.",
  "bento3Tag": "obs-ws v5 kompatibel",
  "bento4Title": "Tastatur-Makros, .exe-Dateien & Skripte",
  "bento4Desc": "Hinterlege beliebige Tastenkombinationen mit Strg, Alt, Umschalt und Win oder verknüpfe .exe-Dateien, .lnk-Verknüpfungen und .bat-Skripte.",
  "bento4Tag": "Liest Startmenü & Microsoft Store Apps",
  "bento5Title": "Automatische UDP-Erkennung",
  "bento5Desc": "Kein mühsames Suchen nach lokalen IP-Adressen nötig. Die App findet den Windows-PC automatisch im selben WLAN-Netzwerk.",
  "bento5Tag": "1-Klick Kopplung",
  "bento6Title": "Jeder Bildschirm wird zur Steuerzentrale",
  "bento6Desc": "Funktioniert auf Android mit nativer APK (ab Android 5.0) sowie auf iPhone und iPad über Safari als Vollbild-Web-App (PWA).",
  "bento6Tag": "Alte Hardware sinnvoll nutzen",
  "compareTag": "Transparenz",
  "compareTitle": "EzDeck vs Physisches Deck vs Bezahl-Apps",
  "compareSubtitle": "Erfahre, warum EzDeck das beste Verhältnis aus Kostenersparnis, Datenschutz und Flexibilität bietet.",
  "thFeature": "Merkmal",
  "thEzDeck": "EzDeck (Windows + Smartphone)",
  "thPhysical": "Physisches Stream Deck",
  "thPaid": "Typische Bezahl-Apps",
  "tdCost": "Anschaffungskosten",
  "tdCostEz": "0 € (Kostenlos & Open Source)",
  "tdCostPh": "150 € bis 250 €+",
  "tdCostPd": "Abonnement oder Kaufpreis",
  "tdPriv": "Verbindung & Datenschutz",
  "tdPrivEz": "✓ 100% Lokales Wi-Fi (Keine Cloud)",
  "tdPrivPh": "✓ Direktes USB-Kabel",
  "tdPrivPd": "✗ Erfordert Cloud-Konto & Server",
  "tdDevice": "Altes Smartphone nutzen",
  "tdDeviceEz": "✓ Ja (Android 5.0+ & iOS PWA)",
  "tdDevicePh": "✗ Nein (Proprietäre Hardware)",
  "tdDevicePd": "Oft nur auf neueste Geräte beschränkt",
  "tdKeys": "Verfügbare Tasten",
  "tdKeysEz": "Bis zu 40 Tasten (5 Seiten à 8)",
  "tdKeysPh": "6, 15 oder 32 feste Tasten",
  "tdKeysPd": "Je nach Abo limitiert",
  "tdSetup": "Einfache Einrichtung",
  "tdSetupEz": "✓ .exe-Installer (Kein Node.js nötig)",
  "tdSetupPh": "✓ Eigene Treiber",
  "tdSetupPd": "Variabel",
  "tdLatency": "Reaktionszeit (Latenz)",
  "tdLatencyEz": "Millisekunden (Lokales WebSocket)",
  "tdLatencyPh": "Millisekunden (USB)",
  "tdLatencyPd": "Mittel/Hoch (Cloud-abhängig)",
  "dlTag": "Kostenloser Download",
  "dlTitle": "EzDeck herunterladen und sofort loslegen",
  "dlSubtitle": "Hole dir das Installationsprogramm für Windows und verbinde deine Mobilgeräte.",
  "dlWinTitle": "EzDeck für Windows",
  "dlWinDesc": "Offizieller Installer mit nativem Fenster, System-Tray-Icon und integrierter Laufzeitumgebung. Bereit für Windows 10 & 11.",
  "dlWinBtn": "EzDeck-Setup.exe herunterladen",
  "dlAndroidTitle": "Android Begleit-App",
  "dlAndroidDesc": "Eigene APK mit automatischer UDP-Erkennung, haptischem Vibrationsfeedback und schneller Wiederverbindung.",
  "dlAndroidBtn": "APK herunterladen (Android)",
  "dlIosTitle": "iPhone, iPad & Browser",
  "dlIosDesc": "Öffne die in Windows angezeigte Adresse in Safari oder Chrome und wähle \"Zum Home-Bildschirm\".",
  "dlIosBtn": "PWA-Anleitung ansehen",
  "faqTag": "Häufig gestellte Fragen",
  "faqTitle": "Fragen & Antworten",
  "faqSubtitle": "Alles Wissenswerte über Sicherheit, Netzwerkanbindung und Kompatibilität.",
  "q1": "Muss ich Node.js auf meinem Computer installieren?",
  "a1": "<strong>Nein!</strong> Der Installer <code>EzDeck-Setup.exe</code> bringt die gesamte benötigte Laufzeitumgebung bereits mit. Einfach herunterladen und per Doppelklick starten. Node.js wird nur von Entwicklern benötigt, die den Quellcode selbst anpassen möchten.",
  "q2": "Warum meldet sich der Windows SmartScreen?",
  "a2": "Da EzDeck ein unabhängiges Open-Source-Projekt ist und der Zertifizierungsprozess bei der SignPath Foundation noch läuft, kann Windows den Hinweis \"Unbekannte App\" anzeigen. Klicke auf <strong>\"Weitere Informationen\"</strong> und dann auf <strong>\"Trotzdem ausführen\"</strong>. Lade immer ausschließlich von den offiziellen GitHub Releases.",
  "q3": "Was tun, wenn die Windows-Firewall um Erlaubnis fragt?",
  "a3": "Erlaube den Zugriff <strong>ausschließlich in privaten Netzwerken</strong> (dein Heim- oder Studio-WLAN). Aktiviere keine öffentlichen Netzwerke und gib den Port 3100 niemals ins offene Internet frei.",
  "q4": "Funktioniert EzDeck auch auf iPhone oder iPad?",
  "a4": "<strong>Ja!</strong> Öffne einfach Safari auf deinem Apple-Gerät, gib die in EzDeck angezeigte lokale IP-Adresse ein (z. B. <code>http://192.168.1.15:3100</code>) und tippe auf Teilen → <strong>\"Zum Home-Bildschirm\"</strong>.",
  "q5": "Wie sicher ist der 4-stellige PIN-Schutz?",
  "a5": "Der PIN verhindert, dass unbefugte Geräte in deinem WLAN Befehle an deinen Computer senden. Bei 5 fehlerhaften Eingaben in Folge wird die entsprechende IP-Adresse für 60 Sekunden gesperrt.",
  "q6": "Woher stammt das EzDeck-Projekt?",
  "a6": "EzDeck ist eine eigenständige Weiterentwicklung für Windows und Android, basierend auf dem quelloffenen Projekt Dokke von Felipe Alves (MIT-Lizenz). Betreut von Ed Stone (eddesignerez), bietet EzDeck ein natives Windows-Paket, tiefe Tastatur-Makro-Unterstützung, OBS Studio-Anbindung, eine dedizierte Android-App und Übersetzungen in 11 Sprachen.",
  "ctaTitle": "Bereit für die volle Kontrolle über deinen PC?",
  "ctaDesc": "Nutze dein ungenutztes Smartphone sinnvoll und erstelle dir noch heute dein kostenloses Stream Deck.",
  "ctaBtn": "Kostenlos für Windows herunterladen",
  "footerDesc": "Verwandeln Sie jedes Smartphone oder Tablet in ein taktiles Streaming- und Produktivitäts-Deck für Windows. 100% kostenlos, privat und ohne Cloud.",
  "footerColProduct": "Produkt",
  "footerNavSimulator": "Interaktiver Simulator",
  "footerNavHow": "So funktioniert's",
  "footerNavFeatures": "Funktionen & Vorteile",
  "footerNavDownloads": "Offizielle Downloads",
  "footerColDocs": "Dokumentation",
  "footerManual": "Benutzerhandbuch",
  "footerMindmap": "Architektur-Mindmap",
  "footerPrivacy": "Datenschutzerklärung",
  "footerSecurity": "Sicherheit & Netzwerk",
  "footerColCommunity": "Community & Quellcode",
  "footerRepo": "GitHub-Repository",
  "footerReleases": "Releases & Versionsverlauf",
  "footerIssues": "Problem melden",
  "footerLicense": "MIT-Lizenz",
  "footerCopyright": "&copy; 2026 EzDeck. Entwickelt und gepflegt von <strong>Ed Stone (eddesignerez)</strong>.",
  "footerCredits": "Inspiriert vom Open-Source-Projekt <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> von Felipe Alves unter MIT-Lizenz."
};
translations['zh-CN'] = {
  "navSimulator": "模拟器",
  "navHowItWorks": "使用指南",
  "navFeatures": "特色功能",
  "navCompare": "对比分析",
  "navDownloads": "下载安装",
  "navFaq": "常见问题",
  "btnDownloadHeader": "免费下载",
  "heroBadge": "100% 免费开源 • 纯本地零云端",
  "heroTitle": "让闲置手机秒变你的 <span class=\"text-gradient\">Windows 专业快捷控制台</span>。",
  "heroDesc": "在手机或平板屏幕上一键操控 OBS Studio、Discord、Spotify、游戏与 Windows 快捷键。仅需家庭局域网 Wi-Fi 通信，毫秒级极低延迟，完全保障数据隐私。",
  "btnHeroWin": "免费下载 Windows 版 EzDeck",
  "btnHeroGithub": "在 GitHub 查看源码",
  "specWin": "支持 Windows 10 & 11",
  "specNode": "无需安装 Node.js",
  "specMobile": "Android 5.0+ 与 iOS PWA",
  "specLocal": "100% 局域网传输",
  "simHostTitle": "Windows 11 Pro — EzDeck 主机运行中",
  "simHostSubtitle": "本地 Wi-Fi 连接（零云端） • 延迟 < 2ms",
  "simHint": "点击下方手机按键，上方电脑画面将实时同步响应",
  "btnPrevPage": "上一页",
  "btnNextPage": "下一页",
  "pageIndicator": "第 {current} 页 / 共 {total} 页",
  "stepsTag": "简单快捷",
  "stepsTitle": "只需 3 步，2 分钟快速上手",
  "stepsSubtitle": "无需编程知识与复杂配置，开箱即用，即刻提升桌面生产力。",
  "step1Title": "在电脑端安装",
  "step1Desc": "下载 EzDeck-Setup.exe。安装包内置完整运行环境，完全无需安装 Node.js。运行后常驻在系统托盘。",
  "step2Title": "输入 4 位 PIN 码快速配对",
  "step2Desc": "在手机打开安卓端 App 或在 iOS 浏览器输入地址。UDP 自动发现技术可在 Wi-Fi 中秒速识别电脑，输入 4 位 PIN 即可安全连接。",
  "step3Title": "拖拽布局，即刻掌控",
  "step3Desc": "在电脑窗口中将常用程序、键盘快捷键（如 Win+Shift+S、Ctrl+C）或 OBS 动作拖入 8 个键位插槽，手机端即时无缝同步。",
  "bentoTag": "功能与优势",
  "bentoTitle": "专为极速响应、隐私安全与高度自由打造",
  "bentoSubtitle": "无任何订阅收费，无第三方云端依赖。在你的桌面上享受纯粹的控制体验。",
  "bento1Title": "100% 本地局域网 — 零云端，纯粹隐私",
  "bento1Desc": "操作指令与按键信息绝不上传外部网络。即使在直播途中遇到外网断网，局域网内的按键控制依然稳定流畅。",
  "bento1Tag": "原生隐私安全 — 零外发遥测",
  "bento2Title": "5 个独立分页，最多支持 40 个按键",
  "bento2Desc": "为直播推流、日常游戏、视频剪辑和工作分别创建独立分页，单页 8 个大按键（4x2 网格），有效避免误触。",
  "bento2Tag": "单页 8 键大网格（4x2 布局）",
  "bento3Title": "原生深度集成 OBS Studio",
  "bento3Desc": "内置支持 obs-ws v5 WebSocket 协议。一键无缝切换场景、麦克风静音与启停录制，几乎无感知延迟。",
  "bento3Tag": "完全兼容 obs-ws v5",
  "bento4Title": "支持键盘组合键、.exe 程序与脚本",
  "bento4Desc": "可配置 Ctrl、Alt、Shift 与 Win 任意组合键，或直接触发启动 .exe、.lnk 快捷方式与 .bat 批处理脚本。",
  "bento4Tag": "自动扫描开始菜单与应用商店程序",
  "bento5Title": "UDP 自动广播发现",
  "bento5Desc": "无需手动查找或输入局域网 IP 地址。配套手机端应用会自动在家庭 Wi-Fi 中识别 EzDeck 主机。",
  "bento5Tag": "1 键极速配对",
  "bento6Title": "任意屏幕都能成为专属控制器",
  "bento6Desc": "支持安卓专用原生 APK（支持 Android 5.0+ 老系统），iPhone 与 iPad 也可通过 Safari 浏览器以全屏 PWA 形式运行。",
  "bento6Tag": "旧设备物尽其用",
  "compareTag": "全面对比",
  "compareTitle": "EzDeck vs 实体控制台 vs 传统付费应用",
  "compareSubtitle": "看看为什么 EzDeck 在经济成本、隐私安全与拓展性上表现更出色。",
  "thFeature": "对比项目",
  "thEzDeck": "EzDeck (Windows + 移动设备)",
  "thPhysical": "实体硬件控制台",
  "thPaid": "传统付费/订阅 App",
  "tdCost": "初始购买成本",
  "tdCostEz": "0 元（完全免费开源）",
  "tdCostPh": "¥1000 - ¥2000+",
  "tdCostPd": "按月订阅或数百元买断",
  "tdPriv": "连接模式与隐私",
  "tdPrivEz": "✓ 100% 本地 Wi-Fi（无需云端）",
  "tdPrivPh": "✓ USB 有线直连",
  "tdPrivPd": "✗ 强制云端账号登录",
  "tdDevice": "旧设备利旧再利用",
  "tdDeviceEz": "✓ 支持（安卓 5.0+ / iOS PWA）",
  "tdDevicePh": "✗ 不支持（专用封闭硬件）",
  "tdDevicePd": "往往仅限最新版系统设备",
  "tdKeys": "可用按键总量",
  "tdKeysEz": "最多 40 键（5 页 × 每页 8 键）",
  "tdKeysPh": "6键 / 15键 / 32键 固定",
  "tdKeysPd": "依订阅版本限制",
  "tdSetup": "安装与上手难度",
  "tdSetupEz": "✓ 独立 .exe 安装包（无需 Node.js）",
  "tdSetupPh": "✓ 需安装专用驱动",
  "tdSetupPd": "配置较繁琐",
  "tdLatency": "操作响应延迟",
  "tdLatencyEz": "毫秒级（本地 WebSocket 极速响应）",
  "tdLatencyPh": "毫秒级（USB 直连）",
  "tdLatencyPd": "中等至偏高（依赖外网服务器）",
  "dlTag": "免费下载",
  "dlTitle": "立即下载 EzDeck，开始使用",
  "dlSubtitle": "下载电脑端安装程序，轻松连接你的手机与平板。",
  "dlWinTitle": "EzDeck for Windows",
  "dlWinDesc": "官方独立安装程序，原生窗口、系统托盘常驻，内置运行环境。完美支持 Windows 10 与 11。",
  "dlWinBtn": "下载 EzDeck-Setup.exe",
  "dlAndroidTitle": "Android 配套客户端",
  "dlAndroidDesc": "专属 APK 安装包，支持 UDP 自动发现、按键震动触觉反馈与断线重连。",
  "dlAndroidBtn": "下载 APK (Android)",
  "dlIosTitle": "iPhone、iPad 与各种浏览器",
  "dlIosDesc": "在 Safari 或 Chrome 中输入电脑端显示的局域网地址，轻点“添加到主屏幕”即可全屏使用。",
  "dlIosBtn": "查看 PWA 使用指南",
  "faqTag": "常见疑问",
  "faqTitle": "常见问题与解答 (FAQ)",
  "faqSubtitle": "解答关于安全性、局域网连接与设备兼容性的所有疑问。",
  "q1": "我的电脑需要安装 Node.js 吗？",
  "a1": "<strong>完全不需要！</strong> 官方安装包 <code>EzDeck-Setup.exe</code> 已将所需运行环境全部打包。双击安装即可直接使用。只有当你想自行修改或二次开发源代码时才需要 Node.js。",
  "q2": "为什么 Windows SmartScreen 会弹出提示？",
  "a2": "EzDeck 作为独立的开源项目，目前正在通过 SignPath 基金会申请免费开源代码签名。初次启动出现提示时，只需点击<strong>“更多信息”</strong>，然后选择<strong>“仍要运行”</strong>即可。请始终从官方 GitHub Releases 页面下载。",
  "q3": "Windows 防火墙弹出权限提示该如何选择？",
  "a3": "请<strong>仅勾选专用网络（家庭或工作室 Wi-Fi）</strong>。切勿勾选公用网络，更不要将 3100 端口映射到公网。",
  "q4": "可以在 iPhone 或 iPad 上使用吗？",
  "a4": "<strong>完全可以！</strong> 在 iOS 设备的 Safari 浏览器中输入电脑端显示的本地 IP 地址（如 <code>http://192.168.1.15:3100</code>），点击底部分享按钮，选择<strong>“添加到主屏幕”</strong>即可像原生 App 一样全屏沉浸操作。",
  "q5": "4 位数字 PIN 码的安全机制是怎样的？",
  "a5": "PIN 码确保只有你允许的设备才能控制电脑。系统内置防暴力破解机制：同一 IP 连续输错 5 次 PIN 码后将自动锁定 60 秒。",
  "q6": "EzDeck 项目的起源与背景是什么？",
  "a6": "EzDeck 是基于 Felipe Alves 开源的 Dokke 项目（采用 MIT 许可）独立衍生开发的 Windows 和 Android 专属版本。由 Ed Stone (eddesignerez) 持续维护，增加了 Windows 原生封装、深度键盘宏、OBS Studio 联动、专属 Android 端以及 11 国语言国际化支持。",
  "ctaTitle": "准备好让电脑操作如虎添翼了吗？",
  "ctaDesc": "让抽屉里吃灰的旧手机重获新生，零成本打造属于你的专属快捷控制台。",
  "ctaBtn": "免费下载 Windows 版"
};
translations['vi'] = {
  "navSimulator": "Mô phỏng",
  "navHowItWorks": "Cách hoạt động",
  "navFeatures": "Tính năng",
  "navCompare": "So sánh",
  "navDownloads": "Tải về",
  "navFaq": "Hỏi đáp",
  "btnDownloadHeader": "Tải xuống",
  "heroBadge": "100% Miễn phí & Mã nguồn mở • Không cần Cloud",
  "heroTitle": "Biến chiếc điện thoại cũ thành <span class=\"text-gradient\">Stream Deck chuyên nghiệp</span> cho Windows.",
  "heroDesc": "Điều khiển OBS Studio, Discord, Spotify, game và phím tắt Windows ngay từ màn hình điện thoại hoặc máy tính bảng. Kết nối Wi-Fi nội bộ siêu tốc, độ trễ cực thấp và bảo mật tuyệt đối.",
  "btnHeroWin": "Tải EzDeck cho Windows",
  "btnHeroGithub": "Mã nguồn trên GitHub",
  "specWin": "Windows 10 & 11",
  "specNode": "Không cần cài Node.js",
  "specMobile": "Android 5.0+ & iOS PWA",
  "specLocal": "100% Mạng nội bộ",
  "simHostTitle": "Windows 11 Pro — Máy chủ EzDeck đang chạy",
  "simHostSubtitle": "Mạng Wi-Fi nội bộ (Không Cloud) • Độ trễ < 2ms",
  "simHint": "Chạm vào các phím điện thoại bên dưới để điều khiển máy tính theo thời gian thực",
  "btnPrevPage": "Trước",
  "btnNextPage": "Sau",
  "pageIndicator": "Trang {current} / {total}",
  "stepsTag": "Đơn giản & Dễ dàng",
  "stepsTitle": "Sẵn sàng sử dụng chỉ qua 3 bước",
  "stepsSubtitle": "Không cần kiến thức lập trình hay cấu hình phức tạp. Chưa đầy 2 phút bàn điều khiển của bạn đã hoàn tất.",
  "step1Title": "Cài đặt trên Windows",
  "step1Desc": "Tải tệp EzDeck-Setup.exe. Bản cài đặt đã tích hợp đầy đủ môi trường cần thiết, không cần cài Node.js. Chạy ngầm tiện lợi ở khay hệ thống.",
  "step2Title": "Ghép nối bằng mã PIN 4 số",
  "step2Desc": "Mở ứng dụng trên Android hoặc truy cập trình duyệt trên iOS. Tính năng tự quét UDP sẽ tự tìm thấy máy tính trên cùng Wi-Fi. Nhập PIN 4 số để kết nối an toàn.",
  "step3Title": "Kéo thả và dùng ngay",
  "step3Desc": "Từ cửa sổ EzDeck, kéo phần mềm, phím tắt (như Ctrl+C, Win+Shift+S) và thao tác OBS vào 8 ô phím. Điện thoại sẽ cập nhật ngay lập tức.",
  "bentoTag": "Tính năng nổi bật",
  "bentoTitle": "Tối ưu tốc độ, sự riêng tư và quyền kiểm soát tối đa",
  "bentoSubtitle": "Không phí định kỳ hàng tháng, không phụ thuộc máy chủ bên ngoài. Bàn làm việc hiệu quả theo cách của bạn.",
  "bento1Title": "100% Mạng nội bộ — Không Cloud & Riêng tư tuyệt đối",
  "bento1Desc": "Mọi thao tác, phím tắt và dữ liệu chỉ truyền trong mạng Wi-Fi nhà bạn. Vẫn hoạt động hoàn hảo ngay cả khi mất kết nối Internet khi đang livestream.",
  "bento1Tag": "Bảo mật theo thiết kế — Không đo lường từ xa",
  "bento2Title": "Tối đa 40 phím trên 5 trang",
  "bento2Desc": "Tổ chức bàn phím thành 5 trang riêng biệt với 8 phím mỗi trang (lưới 4x2) cho livestream, chơi game, dựng phim hay công việc văn phòng.",
  "bento2Tag": "8 phím lớn mỗi trang (Lưới 4x2)",
  "bento3Title": "Tích hợp OBS Studio chuẩn WebSocket",
  "bento3Desc": "Hỗ trợ giao thức obs-ws v5. Chuyển cảnh, tắt tiếng micro và bắt đầu ghi hình mượt mà không có độ trễ.",
  "bento3Tag": "Tương thích hoàn toàn obs-ws v5",
  "bento4Title": "Hỗ trợ phím tắt, tệp .exe và script",
  "bento4Desc": "Gán bất kỳ tổ hợp phím nào với Ctrl, Alt, Shift và Win, hoặc khởi chạy trực tiếp các tệp .exe, .lnk và kịch bản .bat.",
  "bento4Tag": "Tự động quét Start Menu & Microsoft Store",
  "bento5Title": "Tự động phát hiện qua UDP",
  "bento5Desc": "Không cần tìm kiếm địa chỉ IP nội bộ thủ công. Ứng dụng điện thoại sẽ tự phát hiện máy tính Windows trong cùng mạng Wi-Fi.",
  "bento5Tag": "Ghép nối trong 1 chạm",
  "bento6Title": "Bất kỳ màn hình nào cũng thành bàn điều khiển",
  "bento6Desc": "Hoạt động mượt mà trên Android với tệp APK riêng (từ Android 5.0 trở lên) hoặc trên iPhone/iPad qua Safari dưới dạng ứng dụng PWA toàn màn hình.",
  "bento6Tag": "Tái sử dụng thiết bị cũ",
  "compareTag": "So sánh minh bạch",
  "compareTitle": "EzDeck vs Thiết bị vật lý vs Ứng dụng trả phí",
  "compareSubtitle": "Lý do EzDeck mang lại giải pháp tiết kiệm, an toàn và đa năng nhất cho bàn làm việc của bạn.",
  "thFeature": "Đặc điểm",
  "thEzDeck": "EzDeck (Windows + Điện thoại)",
  "thPhysical": "Stream Deck phần cứng",
  "thPaid": "Ứng dụng trả phí thông thường",
  "tdCost": "Chi phí ban đầu",
  "tdCostEz": "0 đ (Hoàn toàn miễn phí & Mã nguồn mở)",
  "tdCostPh": "4.000.000 đ đến 7.000.000 đ+",
  "tdCostPd": "Đăng ký tháng hoặc mua bản quyền",
  "tdPriv": "Kết nối & Bảo mật",
  "tdPrivEz": "✓ 100% Wi-Fi nội bộ (Không Cloud)",
  "tdPrivPh": "✓ Dây cáp USB trực tiếp",
  "tdPrivPd": "✗ Bắt buộc đăng nhập tài khoản đám mây",
  "tdDevice": "Tận dụng máy cũ",
  "tdDeviceEz": "✓ Có (Android 5.0+ & iOS PWA)",
  "tdDevicePh": "✗ Không (Thiết bị đóng kín)",
  "tdDevicePd": "Thường giới hạn ở hệ điều hành mới",
  "tdKeys": "Số lượng phím",
  "tdKeysEz": "Tối đa 40 phím (5 trang x 8 phím)",
  "tdKeysPh": "6, 15 hoặc 32 phím cố định",
  "tdKeysPd": "Giới hạn theo gói đăng ký",
  "tdSetup": "Độ dễ cài đặt",
  "tdSetupEz": "✓ Bản cài đặt .exe (Không cần Node.js)",
  "tdSetupPh": "✓ Driver riêng",
  "tdSetupPd": "Phức tạp",
  "tdLatency": "Độ trễ phản hồi",
  "tdLatencyEz": "Mili-giây (WebSocket nội bộ cực nhanh)",
  "tdLatencyPh": "Mili-giây (Dây USB)",
  "tdLatencyPd": "Trung bình/Cao (Phụ thuộc Internet)",
  "dlTag": "Tải miễn phí",
  "dlTitle": "Tải EzDeck và bắt đầu ngay",
  "dlSubtitle": "Tải bản cài đặt cho máy tính Windows và kết nối thiết bị di động của bạn.",
  "dlWinTitle": "EzDeck cho Windows",
  "dlWinDesc": "Bản cài đặt chính thức với cửa sổ native, biểu tượng khay hệ thống và môi trường tích hợp. Hỗ trợ Windows 10 & 11.",
  "dlWinBtn": "Tải EzDeck-Setup.exe",
  "dlAndroidTitle": "Ứng dụng Android",
  "dlAndroidDesc": "Tệp APK chuyên dụng với tính năng tự dò UDP, rung phản hồi xúc giác và tự động kết nối lại.",
  "dlAndroidBtn": "Tải tệp APK (Android)",
  "dlIosTitle": "iPhone, iPad & Trình duyệt",
  "dlIosDesc": "Mở địa chỉ hiển thị trên máy tính bằng Safari hoặc Chrome và chọn \"Thêm vào màn hình chính\".",
  "dlIosBtn": "Xem hướng dẫn PWA",
  "faqTag": "Câu hỏi thường gặp",
  "faqTitle": "Hỏi đáp (FAQ)",
  "faqSubtitle": "Giải đáp mọi thắc mắc về bảo mật, kết nối mạng và khả năng tương thích của EzDeck.",
  "q1": "Tôi có cần cài Node.js trên máy tính không?",
  "a1": "<strong>Không!</strong> Bản cài đặt <code>EzDeck-Setup.exe</code> đã tích hợp sẵn mọi thứ cần thiết. Chỉ cần tải về và nhấp đúp để sử dụng. Node.js chỉ cần thiết nếu bạn là lập trình viên muốn tự biên dịch mã nguồn.",
  "q2": "Tại sao Windows SmartScreen lại hiện cảnh báo?",
  "a2": "Do EzDeck là dự án mã nguồn mở độc lập đang trong quy trình cấp chứng chỉ ký số miễn phí từ SignPath Foundation, Windows có thể hiển thị cảnh báo ứng dụng chưa nhận diện. Bạn chỉ cần nhấn vào <strong>\"More info\" (Thông tin thêm)</strong> rồi chọn <strong>\"Run anyway\" (Vẫn chạy)</strong>. Luôn tải từ trang Releases chính thức trên GitHub.",
  "q3": "Cần làm gì khi Windows Firewall yêu cầu cấp quyền?",
  "a3": "Hãy chỉ cấp quyền <strong>trên mạng riêng tư (Private networks - Wi-Fi nhà hoặc phòng thu)</strong>. Không tích vào mạng công cộng và không mở cổng 3100 ra Internet.",
  "q4": "EzDeck có hoạt động trên iPhone hoặc iPad không?",
  "a4": "<strong>Có, rất mượt mà!</strong> Mở Safari trên iPhone/iPad, nhập địa chỉ mạng nội bộ hiển thị trên EzDeck Windows (ví dụ: <code>http://192.168.1.15:3100</code>), chạm nút Chia sẻ và chọn <strong>\"Thêm vào Màn hình chính\"</strong>.",
  "q5": "Mã PIN 4 số bảo mật như thế nào?",
  "a5": "Mã PIN đảm bảo chỉ các thiết bị được bạn cho phép mới có thể gửi lệnh điều khiển máy tính. Hệ thống có cơ chế chống dò mật khẩu: nếu nhập sai 5 lần liên tiếp, IP đó sẽ bị khóa trong 60 giây.",
  "q6": "Nguồn gốc của EzDeck là gì?",
  "a6": "EzDeck là phiên bản phát triển độc lập cho Windows và Android dựa trên dự án mã nguồn mở Dokke của Felipe Alves (giấy phép MIT). Được duy trì bởi Ed Stone (eddesignerez), EzDeck bổ sung gói cài đặt Windows native, phím tắt chuyên sâu, tích hợp OBS Studio, ứng dụng Android riêng biệt và hỗ trợ 11 ngôn ngữ.",
  "ctaTitle": "Sẵn sàng làm chủ chiếc PC của bạn?",
  "ctaDesc": "Tái sinh chiếc điện thoại cũ trong ngăn kéo và sở hữu bàn phím điều khiển chuyên nghiệp hoàn toàn miễn phí.",
  "ctaBtn": "Tải miễn phí cho Windows"
};
translations['ko'] = {
  "navSimulator": "시뮬레이터",
  "navHowItWorks": "사용 방법",
  "navFeatures": "주요 기능",
  "navCompare": "비교",
  "navDownloads": "다운로드",
  "navFaq": "자주 묻는 질문",
  "btnDownloadHeader": "무료 다운로드",
  "heroBadge": "100% 무료 & 오픈소스 • 클라우드 불필요",
  "heroTitle": "잠자는 스마트폰을 Windows용 <span class=\"text-gradient\">전용 스트림덱</span>으로 변신시키세요.",
  "heroDesc": "스마트폰과 태블릿 화면에서 OBS Studio, Discord, Spotify, 게임, 키보드 단축키를 원터치로 제어하세요. 로컬 Wi-Fi 통신으로 초저지연과 완벽한 프라이버시를 보장합니다.",
  "btnHeroWin": "Windows용 EzDeck 무료 다운로드",
  "btnHeroGithub": "GitHub에서 코드 보기",
  "specWin": "Windows 10 & 11 지원",
  "specNode": "Node.js 설치 불필요",
  "specMobile": "Android 5.0+ 및 iOS PWA",
  "specLocal": "100% 로컬 네트워크",
  "simHostTitle": "Windows 11 Pro — EzDeck 호스트 실행 중",
  "simHostSubtitle": "로컬 Wi-Fi 네트워크 (클라우드 없음) • 지연 시간 < 2ms",
  "simHint": "아래 스마트폰 버튼을 누르면 위의 PC 화면이 실시간으로 작동합니다",
  "btnPrevPage": "이전",
  "btnNextPage": "다음",
  "pageIndicator": "{current} / {total} 페이지",
  "stepsTag": "간단한 3단계",
  "stepsTitle": "2분 만에 끝나는 초간단 설정",
  "stepsSubtitle": "코딩이나 전문 지식이 전혀 필요 없습니다. 설치 즉시 누구나 쉽게 사용할 수 있습니다.",
  "step1Title": "Windows에 설치",
  "step1Desc": "EzDeck-Setup.exe를 다운로드하세요. 필수 런타임이 모두 포함되어 있어 Node.js를 별도로 설치할 필요가 없습니다. 시스템 트레이에 상주합니다.",
  "step2Title": "4자리 PIN으로 안전한 연결",
  "step2Desc": "Android 앱을 실행하거나 iOS 브라우저로 접속하세요. UDP 자동 검색 기능이 동일한 Wi-Fi 내의 PC를 자동으로 감지합니다. 4자리 PIN을 입력하면 연결 완료.",
  "step3Title": "드래그 앤 드롭으로 즉시 활용",
  "step3Desc": "PC 화면에서 실행할 프로그램, 단축키(Ctrl+C, Win+Shift+S 등), OBS 동작을 8개 슬롯으로 끌어다 놓으세요. 스마트폰에 즉각 동기화됩니다.",
  "bentoTag": "기능 및 장점",
  "bentoTitle": "속도, 개인정보 보호, 완벽한 제어를 위한 설계",
  "bentoSubtitle": "월 구독료도, 외부 서버 의존도 없습니다. 여러분의 데스크에 최고의 효율을 더하세요.",
  "bento1Title": "100% 로컬 네트워크 — 완벽한 프라이버시",
  "bento1Desc": "어떠한 명령이나 단축키 데이터도 외부 서버로 전송되지 않습니다. 방송 중 인터넷 연결이 끊겨도 로컬 Wi-Fi 내에서 안정적으로 작동합니다.",
  "bento1Tag": "프라이버시 중심 설계 — 외부 원격 측정 없음",
  "bento2Title": "5개 페이지, 최대 40개 단축키",
  "bento2Desc": "방송, 게임, 편집, 업무별로 전용 페이지를 구성하세요. 페이지당 8개의 큼직한 버튼(4x2 배열)으로 오작동을 방지합니다.",
  "bento2Tag": "페이지당 8개 대형 키 (4x2 그리드)",
  "bento3Title": "OBS Studio 공식 WebSocket 연동",
  "bento3Desc": "obs-ws v5 프로토콜을 기본 지원합니다. 장면 전환, 마이크 음소거, 녹화 시작을 지연 없이 빠르게 실행하세요.",
  "bento3Tag": "obs-ws v5 완벽 호환",
  "bento4Title": "단축키, .exe 실행 파일 및 스크립트 지원",
  "bento4Desc": "Ctrl, Alt, Shift, Win 조합의 복잡한 키 매크로는 물론, .exe 실행 파일, .lnk 바로가기, .bat 배치 파일까지 원터치로 실행합니다.",
  "bento4Tag": "시작 메뉴 및 Microsoft Store 앱 자동 검색",
  "bento5Title": "UDP 자동 탐색 지원",
  "bento5Desc": "복잡하게 IP 주소를 찾아서 입력할 필요가 없습니다. 모바일 앱이 동일한 Wi-Fi 망 내의 PC 호스트를 자동으로 감지합니다.",
  "bento5Tag": "원터치 즉시 페어링",
  "bento6Title": "모든 화면이 컨트롤러로 변신",
  "bento6Desc": "Android 전용 네이티브 APK(Android 5.0 이상 지원)는 물론, iPhone 및 iPad에서도 Safari를 통해 전체화면 PWA로 완벽하게 작동합니다.",
  "bento6Tag": "구형 기기의 알뜰한 재활용",
  "compareTag": "투명한 비교",
  "compareTitle": "EzDeck vs 전용 하드웨어 vs 유료 앱",
  "compareSubtitle": "EzDeck이 비용, 프라이버시, 편의성 면에서 왜 탁월한 선택인지 확인해 보세요.",
  "thFeature": "구분",
  "thEzDeck": "EzDeck (Windows + 스마트폰)",
  "thPhysical": "전용 하드웨어 스트림덱",
  "thPaid": "기존 유료 모바일 앱",
  "tdCost": "초기 비용",
  "tdCostEz": "0원 (완전 무료 & 오픈소스)",
  "tdCostPh": "15만 원 ~ 30만 원 이상",
  "tdCostPd": "월 구독 또는 유료 라이선스",
  "tdPriv": "연결 방식 및 보안",
  "tdPrivEz": "✓ 100% 로컬 Wi-Fi (클라우드 없음)",
  "tdPrivPh": "✓ 직접 USB 유선 연결",
  "tdPrivPd": "✗ 클라우드 계정 로그인 필수",
  "tdDevice": "구형 기기 재활용",
  "tdDeviceEz": "✓ 가능 (Android 5.0+ 및 iOS PWA)",
  "tdDevicePh": "✗ 불가능 (폐쇄형 전용 하드웨어)",
  "tdDevicePd": "최신 OS 기기로 제한되는 경우 다수",
  "tdKeys": "사용 가능한 키 수",
  "tdKeysEz": "최대 40키 (5페이지 × 8키)",
  "tdKeysPh": "6키, 15키 또는 32키 고정",
  "tdKeysPd": "구독 등급에 따라 제한",
  "tdSetup": "설치 편의성",
  "tdSetupEz": "✓ .exe 단독 설치 (Node.js 불필요)",
  "tdSetupPh": "✓ 전용 드라이버 필요",
  "tdSetupPd": "설정 다소 복잡",
  "tdLatency": "반응 속도 (지연율)",
  "tdLatencyEz": "밀리초 단위 (초고속 로컬 WebSocket)",
  "tdLatencyPh": "밀리초 단위 (USB 유선)",
  "tdLatencyPd": "보통/높음 (외부 인터넷 서버 경유)",
  "dlTag": "무료 다운로드",
  "dlTitle": "지금 EzDeck을 다운로드하고 시작하세요",
  "dlSubtitle": "Windows PC용 설치 프로그램을 다운로드하고 모바일 기기를 연결하세요.",
  "dlWinTitle": "Windows용 EzDeck",
  "dlWinDesc": "공식 네이티브 윈도우 인스톨러, 시스템 트레이 상주, 런타임 내장. Windows 10 및 11 지원.",
  "dlWinBtn": "EzDeck-Setup.exe 다운로드",
  "dlAndroidTitle": "Android 컴패니언 앱",
  "dlAndroidDesc": "UDP 자동 검색, 터치 진동 햅틱 피드백, 자동 재연결을 지원하는 전용 APK.",
  "dlAndroidBtn": "APK 다운로드 (Android)",
  "dlIosTitle": "iPhone, iPad 및 각종 브라우저",
  "dlIosDesc": "Safari 또는 Chrome에서 PC에 표시된 주소를 열고 \"홈 화면에 추가\"를 누르면 전체 화면으로 실행됩니다.",
  "dlIosBtn": "PWA 사용법 보기",
  "faqTag": "자주 묻는 질문",
  "faqTitle": "질문과 답변 (FAQ)",
  "faqSubtitle": "보안, 네트워크 연결, 호환성에 대한 모든 궁금증을 해결해 드립니다.",
  "q1": "PC에 Node.js를 설치해야 하나요?",
  "a1": "<strong>아닙니다!</strong> 공식 인스톨러 <code>EzDeck-Setup.exe</code>에 필요한 실행 환경이 모두 내장되어 있습니다. 다운로드 후 더블 클릭만으로 바로 실행할 수 있습니다. 소스코드를 직접 빌드하려는 개발자만 Node.js가 필요합니다.",
  "q2": "Windows SmartScreen 경고가 뜨는 이유는 무엇인가요?",
  "a2": "EzDeck은 현재 SignPath Foundation을 통해 무료 오픈소스 코드 서명을 준비 중인 독립 프로젝트입니다. 초기 실행 시 보호 경고가 표시되면 <strong>\"추가 정보\"</strong>를 누르고 <strong>\"실행\"</strong>을 클릭하세요. 항상 공식 GitHub Releases에서 다운로드하시기 바랍니다.",
  "q3": "Windows 방화벽 허용 창이 뜨면 어떻게 해야 하나요?",
  "a3": "<strong>개인 네트워크(가정 또는 작업실 Wi-Fi)만 허용</strong>하세요. 공용 네트워크는 허용하지 마시고, 3100 포트를 인터넷 외부로 노출하지 마세요.",
  "q4": "iPhone이나 iPad에서도 쓸 수 있나요?",
  "a4": "<strong>네, 완벽하게 작동합니다!</strong> Safari 브라우저에서 Windows EzDeck 화면에 표시된 로컬 IP 주소(예: <code>http://192.168.1.15:3100</code>)로 접속한 뒤 공유 버튼을 눌러 <strong>\"홈 화면에 추가\"</strong>를 선택하세요.",
  "q5": "4자리 PIN 코드는 얼마나 안전한가요?",
  "a5": "PIN 코드는 사용자가 승인한 기기만 PC를 조작할 수 있도록 보호합니다. 5회 연속 잘못된 PIN을 입력하면 해당 IP가 60초 동안 자동 차단되는 무차별 대입 방지 기능이 포함되어 있습니다.",
  "q6": "EzDeck 프로젝트의 배경은 무엇인가요?",
  "a6": "EzDeck은 Felipe Alves가 MIT 라이선스로 공개한 오픈소스 프로젝트 Dokke에서 영감을 받아 Windows 및 Android용으로 독립적으로 진화시킨 프로젝트입니다. Ed Stone (eddesignerez)이 유지 관리하며, 독립 Windows 패키징, 심층 키보드 매크로, OBS Studio 연동, 전용 Android 앱 및 11개 언어 다국어 지원을 제공합니다.",
  "ctaTitle": "PC를 더욱 편리하게 제어할 준비가 되셨나요?",
  "ctaDesc": "서랍 속 낡은 스마트폰을 재활용하여 나만의 맞춤형 스트림덱을 무료로 구축해 보세요.",
  "ctaBtn": "Windows용 무료 다운로드",
  "footerDesc": "스마트폰이나 태블릿을 Windows용 맞춤형 스트림덱으로 활용하세요. 100% 무료, 완전 로컬 연결 및 클라우드 불필요.",
  "footerColProduct": "제품",
  "footerNavSimulator": "대화형 시뮬레이터",
  "footerNavHow": "작동 방식",
  "footerNavFeatures": "주요 기능 및 장점",
  "footerNavDownloads": "공식 다운로드",
  "footerColDocs": "문서",
  "footerManual": "사용자 가이드",
  "footerMindmap": "아키텍처 마인드맵",
  "footerPrivacy": "개인정보 처리방침",
  "footerSecurity": "보안 및 네트워크",
  "footerColCommunity": "커뮤니티 및 소스 코드",
  "footerRepo": "GitHub 리포지토리",
  "footerReleases": "릴리스 및 버전 내역",
  "footerIssues": "버그 및 문제 보고",
  "footerLicense": "MIT 라이선스",
  "footerCopyright": "&copy; 2026 EzDeck. <strong>Ed Stone (eddesignerez)</strong> 개발 및 유지 관리.",
  "footerCredits": "Felipe Alves의 오픈 소스 프로젝트 <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a>에서 영감을 받음 (MIT 라이선스)."
};
translations['ar'] = {
  "navSimulator": "المحاكي",
  "navHowItWorks": "كيفية العمل",
  "navFeatures": "الميزات",
  "navCompare": "المقارنة",
  "navDownloads": "التنزيلات",
  "navFaq": "الأسئلة الشائعة",
  "btnDownloadHeader": "تنزيل مجاني",
  "heroBadge": "مجاني ومفتوح المصدر 100% • بدون سحابة",
  "heroTitle": "حوّل هاتفك القديم إلى <span class=\"text-gradient\">Stream Deck مخصص</span> لنظام Windows.",
  "heroDesc": "تحكم في OBS Studio وDiscord وSpotify والألعاب واختصارات Windows مباشرة من شاشة هاتفك. اتصال Wi-Fi محلي فائق السرعة بزمن انتقال شبه معدوم وخصوصية تامة.",
  "btnHeroWin": "تنزيل EzDeck لنظام Windows",
  "btnHeroGithub": "عرض الكود على GitHub",
  "specWin": "Windows 10 و 11",
  "specNode": "لا حاجة لتثبيت Node.js",
  "specMobile": "Android 5.0+ وتطبيق PWA لـ iOS",
  "specLocal": "شبكة محلية 100%",
  "simHostTitle": "Windows 11 Pro — خادم EzDeck نشط",
  "simHostSubtitle": "شبكة Wi-Fi محلية (بدون سحابة) • وقت استجابة < 2 مللي ثانية",
  "simHint": "المس مفاتيح الهاتف أدناه لتشغيل الإجراءات على الكمبيوتر في الوقت الفعلي",
  "btnPrevPage": "السابق",
  "btnNextPage": "التالي",
  "pageIndicator": "صفحة {current} من {total}",
  "stepsTag": "سريع وبسيط",
  "stepsTitle": "جاهز للعمل في 3 خطوات بسيطة",
  "stepsSubtitle": "لا تحتاج إلى معرفة برمجية أو إعدادات معقدة. خلال أقل من دقيقتين ستكون وحدة التحكم جاهزة.",
  "step1Title": "التثبيت على نظام Windows",
  "step1Desc": "قم بتنزيل EzDeck-Setup.exe. يتضمن البرنامج كافة حزم التشغيل مسبقاً، لذا لن تحتاج إلى تثبيت Node.js. يستقر في شريط المهام.",
  "step2Title": "الاقتران برمز PIN من 4 أرقام",
  "step2Desc": "افتح التطبيق على Android أو عبر المتصفح على iOS. يتعرف نظام UDP التلقائي على جهازك عبر Wi-Fi. أدخل رمز PIN للاتصال بأمان.",
  "step3Title": "السحب والإفلات والتحكم المباشر",
  "step3Desc": "اسحب البرامج واختصارات لوحة المفاتيح (مثل Win+Shift+S) وإجراءات OBS إلى الخانات الثمانية. يتحدث هاتفك على الفور.",
  "bentoTag": "الميزات والتصميم",
  "bentoTitle": "مُصمم للسرعة والخصوصية والتحكم الكامل",
  "bentoSubtitle": "بدون اشتراكات شهرية وبدون خوادم خارجية. تحكم مطلق في إعدادات جهازك.",
  "bento1Title": "شبكة محلية 100% — بدون سحابة وخصوصية مطلقة",
  "bento1Desc": "لا تغادر أي بيانات أو اختصارات شبكتك المنزلية. يعمل بشكل مستمر حتى لو انقطع الإنترنت أثناء البث المباشر.",
  "bento1Tag": "الخصوصية عبر التصميم — بدون تتبع",
  "bento2Title": "حتى 40 زراً عبر 5 صفحات",
  "bento2Desc": "نظم أزرارك في 5 صفحات مخصصة تحتوي كل منها على 8 أزرار (شبكة 4x2) للبث المباشر أو الألعاب أو العمل.",
  "bento2Tag": "8 أزرار كبيرة لكل صفحة (شبكة 4x2)",
  "bento3Title": "تكامل أصلي مع OBS Studio",
  "bento3Desc": "دعم مدمج لبروتوكول obs-ws v5. قم بتبديل المشاهد وكتم الميكروفون وبدء التسجيل بلمسة واحدة دون تأخير.",
  "bento3Tag": "متوافق مع obs-ws v5",
  "bento4Title": "اختصارات لوحة المفاتيح والبرامج والسكربتات",
  "bento4Desc": "سجل أي تركيبة مع Ctrl وAlt وShift وWin، أو قم بتشغيل ملفات .exe واختصارات .lnk وسكربتات .bat بنقرة واحدة.",
  "bento4Tag": "مسح تلقائي لقائمة ابدأ وتطبيقات المتجر",
  "bento5Title": "اكتشاف تلقائي عبر UDP",
  "bento5Desc": "لا حاجة للبحث عن عنوان IP يدويًا. يكتشف تطبيق الهاتف الكمبيوتر تلقائياً داخل نفس شبكة Wi-Fi.",
  "bento5Tag": "اقتران بنقرة واحدة",
  "bento6Title": "أي شاشة تصبح وحدة تحكم",
  "bento6Desc": "يعمل عبر تطبيق APK مخصص لنظام Android (من Android 5.0 فما فوق) أو على iPhone وiPad عبر متصفح Safari كتطبيق PWA.",
  "bento6Tag": "إعادة استخدام الأجهزة القديمة",
  "compareTag": "مقارنة شاملة",
  "compareTitle": "EzDeck مقابل الأجهزة المادية والتطبيقات المدفوعة",
  "compareSubtitle": "تعرف على سبب تقديم EzDeck لأفضل مزيج من التوفير والخصوصية والسرعة.",
  "thFeature": "الميزة",
  "thEzDeck": "EzDeck (Windows + هاتف)",
  "thPhysical": "جهاز Stream Deck مادي",
  "thPaid": "التطبيقات المدفوعة التقليدية",
  "tdCost": "التكلفة الأولية",
  "tdCostEz": "0$ (مجاني ومفتوح المصدر)",
  "tdCostPh": "150$ إلى 250$+",
  "tdCostPd": "اشتراك شهري أو ترخيص مدفوع",
  "tdPriv": "الاتصال والخصوصية",
  "tdPrivEz": "✓ 100% Wi-Fi محلي (بدون سحابة)",
  "tdPrivPh": "✓ كابل USB مباشر",
  "tdPrivPd": "✗ يتطلب حساباً سحابياً وتسجيل الدخول",
  "tdDevice": "استخدام الهواتف القديمة",
  "tdDeviceEz": "✓ نعم (Android 5.0+ و iOS PWA)",
  "tdDevicePh": "✗ لا (أجهزة مغلقة)",
  "tdDevicePd": "يقتصر غالباً على أحدث الأنظمة",
  "tdKeys": "إجمالي الأزرار",
  "tdKeysEz": "حتى 40 زراً (5 صفحات × 8 أزرار)",
  "tdKeysPh": "6 أو 15 أو 32 زراً ثابتاً",
  "tdKeysPd": "محدود بحسب الاشتراك",
  "tdSetup": "سهولة التثبيت",
  "tdSetupEz": "✓ مثبت .exe مباشر (بدون Node.js)",
  "tdSetupPh": "✓ تعريفات خاصة",
  "tdSetupPd": "إعداد معقد",
  "tdLatency": "زمن استجابة التفاعل",
  "tdLatencyEz": "مللي ثانية (WebSocket محلي فائق السرعة)",
  "tdLatencyPh": "مللي ثانية (USB)",
  "tdLatencyPd": "متوسط/مرتفع (يعتمد على السحابة)",
  "dlTag": "تنزيل مجاني",
  "dlTitle": "قم بتنزيل EzDeck وابدأ الآن",
  "dlSubtitle": "احصل على برنامج التثبيت لنظام Windows وقم بتوصيل أجهزتك المحمولة.",
  "dlWinTitle": "EzDeck لنظام Windows",
  "dlWinDesc": "مثبت رسمي بواجهة أصلية، أيقونة في شريط المهام وبيئة تشغيل مدمجة. يدعم Windows 10 و 11.",
  "dlWinBtn": "تنزيل EzDeck-Setup.exe",
  "dlAndroidTitle": "تطبيق Android المساعد",
  "dlAndroidDesc": "تطبيق APK مخصص مع اكتشاف تلقائي عبر UDP وردود فعل اهتزازية لمسية وإعادة اتصال سريع.",
  "dlAndroidBtn": "تنزيل ملف APK (Android)",
  "dlIosTitle": "iPhone و iPad والمتصفحات",
  "dlIosDesc": "افتح العنوان الموضح على الكمبيوتر في Safari أو Chrome واختر \"إضافة إلى الشاشة الرئيسية\".",
  "dlIosBtn": "تعليمات تطبيق PWA",
  "faqTag": "الأسئلة الشائعة",
  "faqTitle": "الأسئلة والأجوبة (FAQ)",
  "faqSubtitle": "كل ما تحتاج لمعرفته حول الأمان والشبكات والتوافق.",
  "q1": "هل أحتاج إلى تثبيت Node.js على جهاز الكمبيوتر؟",
  "a1": "<strong>كلا، على الإطلاق!</strong> يحتوي برنامج التثبيت <code>EzDeck-Setup.exe</code> على كافة بيئات التشغيل المطلوبة. ما عليك سوى التنزيل والتشغيل. يلزم Node.js فقط للمطورين الراغبين في بناء الكود من المصدر.",
  "q2": "لماذا يظهر تحذير Windows SmartScreen؟",
  "a2": "نظراً لأن EzDeck مشروع مفتوح المصدر ومستقل يمر حالياً بمرحلة التوقيع الرقمي المجاني عبر مؤسسة SignPath، قد تظهر شاشة تنبيه لتطبيق غير معروف. اضغط على <strong>\"مزيد من المعلومات\"</strong> ثم اختر <strong>\"التشغيل على أي حال\"</strong>. احرص دائماً على التنزيل حصرياً من صفحة الإصدارات الرسمية على GitHub.",
  "q3": "ماذا أفعل عندما يطلب جدار حماية Windows الإذن؟",
  "a3": "اسمح بالوصول <strong>على الشبكات الخاصة فقط (شبكة Wi-Fi المنزلية أو الاستوديو)</strong>. لا تختر الشبكات العامة ولا تجعل المنفذ 3100 متاحاً عبر الإنترنت العام.",
  "q4": "هل يعمل على iPhone أو iPad؟",
  "a4": "<strong>نعم، بكل سلاسة!</strong> افتح متصفح Safari على جهاز Apple الخاص بك، وأدخل عنوان IP المحلي الموضح على EzDeck (مثال: <code>http://192.168.1.15:3100</code>)، واضغط على زر المشاركة ثم <strong>\"إضافة إلى الشاشة الرئيسية\"</strong>.",
  "q5": "ما مدى أمان رمز PIN المكون من 4 أرقام؟",
  "a5": "يضمن رمز PIN أن الأجهزة المصرح لها فقط يمكنها التحكم في جهاز الكمبيوتر. كما يحتوي على حماية ضد التخمين تقوم بحظر عنوان IP لمدة 60 ثانية بعد 5 محاولات خاطئة متتالية.",
  "q6": "ما هو أصل وتاريخ مشروع EzDeck؟",
  "a6": "EzDeck هو تطور مستقل لنظامي Windows وAndroid مستوحى من المشروع مفتوح المصدر Dokke للمطور Felipe Alves بموجب ترخيص MIT. يقوم على صيانته المطور Ed Stone (eddesignerez)، ويضيف التثبيت المباشر على Windows ودعم اختصارات لوحة المفاتيح والربط مع OBS Studio وتطبيق Android المخصص ودعم 11 لغة عالمية.",
  "ctaTitle": "هل أنت مستعد للتحكم الكامل بجهاز الكمبيوتر؟",
  "ctaDesc": "امنح هاتفك القديم حياة جديدة وأنشئ وحدة التحكم المخصصة لك مجاناً اليوم.",
  "ctaBtn": "تنزيل مجاني لنظام Windows",
  "footerDesc": "حوّل أي هاتف ذكي أو جهاز لوحي إلى وحدة تحكم لمسية للبث والإنتاجية لنظام Windows. مجاني 100%، آمن ومحلي بالكامل بدون سحابة.",
  "footerColProduct": "المنتج",
  "footerNavSimulator": "المحاكي التفاعلي",
  "footerNavHow": "كيفية العمل",
  "footerNavFeatures": "الميزات والمزايا",
  "footerNavDownloads": "التنزيلات الرسمية",
  "footerColDocs": "الوثائق",
  "footerManual": "دليل الاستخدام",
  "footerMindmap": "الخريطة الذهنية للبنية البرمجية",
  "footerPrivacy": "سياسة الخصوصية",
  "footerSecurity": "الأمان والشبكة",
  "footerColCommunity": "المجتمع والكود البرمجي",
  "footerRepo": "مستودع GitHub",
  "footerReleases": "الإصدارات والتحديثات",
  "footerIssues": "الإبلاغ عن مشكلة",
  "footerLicense": "ترخيص MIT",
  "footerCopyright": "&copy; 2026 EzDeck. تم التطوير والدعم بواسطة <strong>Ed Stone (eddesignerez)</strong>.",
  "footerCredits": "مستوحى من المشروع مفتوح المصدر <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> للمطور Felipe Alves بموجب ترخيص MIT."
};


// --------------------------------------------------------------------------

// Injeção de traduções oficiais do rodapé para todos os 11 idiomas
const footerI18nMap = {
  "pt": {
    "footerDesc": "Transforme qualquer smartphone ou tablet em um controle tátil de produtividade e streaming para Windows. 100% livre, privado e sem nuvem.",
    "footerColProduct": "Produto",
    "footerNavSimulator": "Simulador Interativo",
    "footerNavHow": "Como Funciona",
    "footerNavFeatures": "Recursos & Diferenciais",
    "footerNavDownloads": "Downloads Oficiais",
    "footerColDocs": "Documentação",
    "footerManual": "Manual de Uso",
    "footerMindmap": "Mapa Mental da Arquitetura",
    "footerPrivacy": "Política de Privacidade",
    "footerSecurity": "Segurança e Rede",
    "footerColCommunity": "Comunidade & Código",
    "footerRepo": "Repositório no GitHub",
    "footerReleases": "Releases & Versões",
    "footerIssues": "Relatar Problema",
    "footerLicense": "Licença MIT",
    "footerCopyright": "&copy; 2026 EzDeck. Desenvolvido e mantido por <strong>Ed Stone (eddesignerez)</strong>.",
    "footerCredits": "Inspirado no projeto open source <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> de Felipe Alves sob licença MIT."
  },
  "en": {
    "footerDesc": "Turn any smartphone or tablet into a tactile productivity and streaming controller for Windows. 100% free, private, and cloudless.",
    "footerColProduct": "Product",
    "footerNavSimulator": "Interactive Simulator",
    "footerNavHow": "How It Works",
    "footerNavFeatures": "Features & Benefits",
    "footerNavDownloads": "Official Downloads",
    "footerColDocs": "Documentation",
    "footerManual": "User Manual",
    "footerMindmap": "Architecture Mindmap",
    "footerPrivacy": "Privacy Policy",
    "footerSecurity": "Security & Networking",
    "footerColCommunity": "Community & Code",
    "footerRepo": "GitHub Repository",
    "footerReleases": "Releases & Changelog",
    "footerIssues": "Report an Issue",
    "footerLicense": "MIT License",
    "footerCopyright": "&copy; 2026 EzDeck. Developed and maintained by <strong>Ed Stone (eddesignerez)</strong>.",
    "footerCredits": "Inspired by the open-source project <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> by Felipe Alves under MIT License."
  },
  "es": {
    "footerDesc": "Convierte cualquier smartphone o tablet en un controlador táctil de productividad y streaming para Windows. 100% libre, privado y sin nube.",
    "footerColProduct": "Producto",
    "footerNavSimulator": "Simulador Interactivo",
    "footerNavHow": "Cómo Funciona",
    "footerNavFeatures": "Características y Ventajas",
    "footerNavDownloads": "Descargas Oficiales",
    "footerColDocs": "Documentación",
    "footerManual": "Manual de Usuario",
    "footerMindmap": "Mapa Mental de Arquitectura",
    "footerPrivacy": "Política de Privacidad",
    "footerSecurity": "Seguridad y Red",
    "footerColCommunity": "Comunidad y Código",
    "footerRepo": "Repositorio en GitHub",
    "footerReleases": "Versiones y Novedades",
    "footerIssues": "Reportar un Problema",
    "footerLicense": "Licencia MIT",
    "footerCopyright": "&copy; 2026 EzDeck. Desarrollado y mantenido por <strong>Ed Stone (eddesignerez)</strong>.",
    "footerCredits": "Inspirado en el proyecto open source <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> de Felipe Alves bajo licencia MIT."
  },
  "ja": {
    "footerDesc": "使わなくなったスマホや<wbr>タブレットが、Windows用<wbr>本格ストリームデッキに。完全無料、100%ローカル通信・クラウド不要。",
    "footerColProduct": "製品",
    "footerNavSimulator": "インタラクティブシミュレーター",
    "footerNavHow": "使い方",
    "footerNavFeatures": "機能とこだわり",
    "footerNavDownloads": "公式ダウンロード",
    "footerColDocs": "ドキュメント",
    "footerManual": "使い方ガイド",
    "footerMindmap": "アーキテクチャ マインドマップ",
    "footerPrivacy": "プライバシーポリシー",
    "footerSecurity": "セキュリティとネットワーク",
    "footerColCommunity": "コミュニティとソースコード",
    "footerRepo": "GitHub リポジトリ",
    "footerReleases": "リリース一覧と更新履歴",
    "footerIssues": "問題・不具合を報告",
    "footerLicense": "MIT ライセンス",
    "footerCopyright": "&copy; 2026 EzDeck. 開発・メンテナンス：<strong>Ed Stone (eddesignerez)</strong>",
    "footerCredits": "Felipe Alves氏によるオープンソースプロジェクト <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> に着想（MITライセンス）。"
  },
  "it": {
    "footerDesc": "Trasforma qualsiasi smartphone o tablet in un controller tattile per streaming e produttività su Windows. 100% gratuito, privato e senza cloud.",
    "footerColProduct": "Prodotto",
    "footerNavSimulator": "Simulatore Interattivo",
    "footerNavHow": "Come Funziona",
    "footerNavFeatures": "Funzionalità e Vantaggi",
    "footerNavDownloads": "Download Ufficiali",
    "footerColDocs": "Documentazione",
    "footerManual": "Manuale d'Uso",
    "footerMindmap": "Mappa Mentale Architettura",
    "footerPrivacy": "Informativa sulla Privacy",
    "footerSecurity": "Sicurezza e Rete",
    "footerColCommunity": "Comunità & Codice",
    "footerRepo": "Repository GitHub",
    "footerReleases": "Versioni e Changelog",
    "footerIssues": "Segnala un Problema",
    "footerLicense": "Licenza MIT",
    "footerCopyright": "&copy; 2026 EzDeck. Sviluppato e mantenuto da <strong>Ed Stone (eddesignerez)</strong>.",
    "footerCredits": "Ispirato al progetto open source <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> di Felipe Alves con licenza MIT."
  },
  "fr": {
    "footerDesc": "Transformez n'importe quel smartphone ou tablette en un contrôleur tactile de streaming et de productivité pour Windows. 100% gratuit, privé et sans cloud.",
    "footerColProduct": "Produit",
    "footerNavSimulator": "Simulateur Interactif",
    "footerNavHow": "Comment ça Marche",
    "footerNavFeatures": "Fonctionnalités & Avantages",
    "footerNavDownloads": "Téléchargements Officiels",
    "footerColDocs": "Documentation",
    "footerManual": "Guide d'Utilisation",
    "footerMindmap": "Carte Mentale de l'Architecture",
    "footerPrivacy": "Politique de Confidentialité",
    "footerSecurity": "Sécurité & Réseau",
    "footerColCommunity": "Communauté & Code",
    "footerRepo": "Dépôt GitHub",
    "footerReleases": "Versions et Journal des modifications",
    "footerIssues": "Signaler un Problème",
    "footerLicense": "Licence MIT",
    "footerCopyright": "&copy; 2026 EzDeck. Développé et maintenu par <strong>Ed Stone (eddesignerez)</strong>.",
    "footerCredits": "Inspiré du projet open source <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> de Felipe Alves sous licence MIT."
  },
  "de": {
    "footerDesc": "Verwandeln Sie jedes Smartphone oder Tablet in ein taktiles Streaming- und Produktivitäts-Deck für Windows. 100% kostenlos, privat und ohne Cloud.",
    "footerColProduct": "Produkt",
    "footerNavSimulator": "Interaktiver Simulator",
    "footerNavHow": "So funktioniert's",
    "footerNavFeatures": "Funktionen & Vorteile",
    "footerNavDownloads": "Offizielle Downloads",
    "footerColDocs": "Dokumentation",
    "footerManual": "Benutzerhandbuch",
    "footerMindmap": "Architektur-Mindmap",
    "footerPrivacy": "Datenschutzerklärung",
    "footerSecurity": "Sicherheit & Netzwerk",
    "footerColCommunity": "Community & Quellcode",
    "footerRepo": "GitHub-Repository",
    "footerReleases": "Releases & Versionsverlauf",
    "footerIssues": "Problem melden",
    "footerLicense": "MIT-Lizenz",
    "footerCopyright": "&copy; 2026 EzDeck. Entwickelt und gepflegt von <strong>Ed Stone (eddesignerez)</strong>.",
    "footerCredits": "Inspiriert vom Open-Source-Projekt <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> von Felipe Alves unter MIT-Lizenz."
  },
  "zh-CN": {
    "footerDesc": "将闲置的智能手机或平板电脑打造为 Windows 专属触控生产力与直播控制台。完全免费、纯本地运行、零云端依赖。",
    "footerColProduct": "产品",
    "footerNavSimulator": "交互式模拟器",
    "footerNavHow": "工作原理",
    "footerNavFeatures": "核心功能与亮点",
    "footerNavDownloads": "官方下载",
    "footerColDocs": "开发文档",
    "footerManual": "用户手册",
    "footerMindmap": "系统架构思维导图",
    "footerPrivacy": "隐私政策",
    "footerSecurity": "安全与网络说明",
    "footerColCommunity": "社区与开源代码",
    "footerRepo": "GitHub 仓库",
    "footerReleases": "版本发布与更新日志",
    "footerIssues": "提交反馈与建议",
    "footerLicense": "MIT 开源许可",
    "footerCopyright": "&copy; 2026 EzDeck. 由 <strong>Ed Stone (eddesignerez)</strong> 独立开发与维护。",
    "footerCredits": "灵感源自 Felipe Alves 的开源项目 <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a>（MIT 开源协议）。"
  },
  "vi": {
    "footerDesc": "Biến mọi điện thoại hoặc máy tính bảng thành bàn phím điều khiển phát sóng và hiệu suất cho Windows. 100% miễn phí, riêng tư và không cần đám mây.",
    "footerColProduct": "Sản phẩm",
    "footerNavSimulator": "Trình mô phỏng tương tác",
    "footerNavHow": "Cách thức hoạt động",
    "footerNavFeatures": "Tính năng nổi bật",
    "footerNavDownloads": "Tải xuống chính thức",
    "footerColDocs": "Tài liệu",
    "footerManual": "Hướng dẫn sử dụng",
    "footerMindmap": "Sơ đồ tư duy kiến trúc",
    "footerPrivacy": "Chính sách bảo mật",
    "footerSecurity": "Bảo mật & Mạng",
    "footerColCommunity": "Cộng đồng & Mã nguồn",
    "footerRepo": "Kho mã nguồn GitHub",
    "footerReleases": "Bản phát hành & Lịch sử",
    "footerIssues": "Báo cáo sự cố",
    "footerLicense": "Giấy phép MIT",
    "footerCopyright": "&copy; 2026 EzDeck. Được phát triển và duy trì bởi <strong>Ed Stone (eddesignerez)</strong>.",
    "footerCredits": "Lấy cảm hứng từ dự án mã nguồn mở <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> của Felipe Alves theo giấy phép MIT."
  },
  "ko": {
    "footerDesc": "스마트폰이나 태블릿을 Windows용 맞춤형 스트림덱으로 활용하세요. 100% 무료, 완전 로컬 연결 및 클라우드 불필요.",
    "footerColProduct": "제품",
    "footerNavSimulator": "대화형 시뮬레이터",
    "footerNavHow": "작동 방식",
    "footerNavFeatures": "주요 기능 및 장점",
    "footerNavDownloads": "공식 다운로드",
    "footerColDocs": "문서",
    "footerManual": "사용자 가이드",
    "footerMindmap": "아키텍처 마인드맵",
    "footerPrivacy": "개인정보 처리방침",
    "footerSecurity": "보안 및 네트워크",
    "footerColCommunity": "커뮤니티 및 소스 코드",
    "footerRepo": "GitHub 리포지토리",
    "footerReleases": "릴리스 및 버전 내역",
    "footerIssues": "버그 및 문제 보고",
    "footerLicense": "MIT 라이선스",
    "footerCopyright": "&copy; 2026 EzDeck. <strong>Ed Stone (eddesignerez)</strong> 개발 및 유지 관리.",
    "footerCredits": "Felipe Alves의 오픈 소스 프로젝트 <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a>에서 영감을 받음 (MIT 라이선스)."
  },
  "ar": {
    "footerDesc": "حوّل أي هاتف ذكي أو جهاز لوحي إلى وحدة تحكم لمسية للبث والإنتاجية لنظام Windows. مجاني 100%، آمن ومحلي بالكامل بدون سحابة.",
    "footerColProduct": "المنتج",
    "footerNavSimulator": "المحاكي التفاعلي",
    "footerNavHow": "كيفية العمل",
    "footerNavFeatures": "الميزات والمزايا",
    "footerNavDownloads": "التنزيلات الرسمية",
    "footerColDocs": "الوثائق",
    "footerManual": "دليل الاستخدام",
    "footerMindmap": "الخريطة الذهنية للبنية البرمجية",
    "footerPrivacy": "سياسة الخصوصية",
    "footerSecurity": "الأمان والشبكة",
    "footerColCommunity": "المجتمع والكود البرمجي",
    "footerRepo": "مستودع GitHub",
    "footerReleases": "الإصدارات والتحديثات",
    "footerIssues": "الإبلاغ عن مشكلة",
    "footerLicense": "ترخيص MIT",
    "footerCopyright": "&copy; 2026 EzDeck. تم التطوير والدعم بواسطة <strong>Ed Stone (eddesignerez)</strong>.",
    "footerCredits": "مستوحى من المشروع مفتوح المصدر <a href=\"https://github.com/felipenalves/Dokke\" target=\"_blank\" rel=\"noopener noreferrer\">Dokke</a> للمطور Felipe Alves بموجب ترخيص MIT."
  }
};
Object.keys(footerI18nMap).forEach(lang => {
  if (translations[lang]) {
    Object.assign(translations[lang], footerI18nMap[lang]);
  }
});

// 4. Slots dos Botões por Idioma (8 Botões no Celular)
// --------------------------------------------------------------------------
const localizedSlots = {
  'pt': [
    [
      { id: 'obs-rec', icon: '⏺️', label: 'OBS Gravar', action: 'obs-rec', toastTitle: 'OBS Studio (WebSocket)', toastMsg: 'Gravação iniciada em 1080p60!' },
      { id: 'obs-mute', icon: '🎙️', label: 'Mic Mudo', action: 'obs-mute', toastTitle: 'OBS / Microfone', toastMsg: 'Microfone mutado no stream' },
      { id: 'discord-mute', icon: '🎧', label: 'Discord', action: 'discord-mute', toastTitle: 'Discord Desktop', toastMsg: 'Atalho enviado: Ctrl+Shift+M (Deafen ativado)' },
      { id: 'spotify-play', icon: '🎵', label: 'Spotify', action: 'spotify-play', toastTitle: 'Spotify Media', toastMsg: 'Reproduzindo: Lofi Stream Beats' },
      { id: 'vscode', icon: '💻', label: 'VS Code', action: 'vscode', toastTitle: 'Windows Launcher', toastMsg: 'Janela focada: Code.exe' },
      { id: 'snip', icon: '✂️', label: 'Captura', action: 'snip', toastTitle: 'Atalho de Teclado', toastMsg: 'Disparado: Win+Shift+S (Recorte de Tela)' },
      { id: 'obs-scene', icon: '🎬', label: 'Cena Game', action: 'obs-scene', toastTitle: 'OBS Studio', toastMsg: 'Cena alterada para: Gameplay Fullscreen' },
      { id: 'calc', icon: '🧮', label: 'Calculadora', action: 'calc', toastTitle: 'Windows Universal', toastMsg: 'Aplicativo aberto: calc.exe' }
    ]
  ],
  'en': [
    [
      { id: 'obs-rec', icon: '⏺️', label: 'OBS Record', action: 'obs-rec', toastTitle: 'OBS Studio (WebSocket)', toastMsg: 'Recording started in 1080p60!' },
      { id: 'obs-mute', icon: '🎙️', label: 'Mic Mute', action: 'obs-mute', toastTitle: 'OBS / Audio', toastMsg: 'Microphone muted in stream' },
      { id: 'discord-mute', icon: '🎧', label: 'Discord', action: 'discord-mute', toastTitle: 'Discord Desktop', toastMsg: 'Sent: Ctrl+Shift+M (Deafen toggled)' },
      { id: 'spotify-play', icon: '🎵', label: 'Spotify', action: 'spotify-play', toastTitle: 'Spotify Media', toastMsg: 'Now Playing: Lofi Stream Beats' },
      { id: 'vscode', icon: '💻', label: 'VS Code', action: 'vscode', toastTitle: 'Windows Launcher', toastMsg: 'Window focused: Code.exe' },
      { id: 'snip', icon: '✂️', label: 'Screenshot', action: 'snip', toastTitle: 'Keyboard Macro', toastMsg: 'Keys sent: Win+Shift+S (Snipping Tool)' },
      { id: 'obs-scene', icon: '🎬', label: 'Game Scene', action: 'obs-scene', toastTitle: 'OBS Studio', toastMsg: 'Scene switched: Gameplay Fullscreen' },
      { id: 'calc', icon: '🧮', label: 'Calculator', action: 'calc', toastTitle: 'Windows Universal', toastMsg: 'App launched: calc.exe' }
    ]
  ],
  'es': [
    [
      { id: 'obs-rec', icon: '⏺️', label: 'OBS Grabar', action: 'obs-rec', toastTitle: 'OBS Studio (WebSocket)', toastMsg: '¡Grabación iniciada en 1080p60!' },
      { id: 'obs-mute', icon: '🎙️', label: 'Silenciar Mic', action: 'obs-mute', toastTitle: 'OBS / Audio', toastMsg: 'Micrófono silenciado' },
      { id: 'discord-mute', icon: '🎧', label: 'Discord', action: 'discord-mute', toastTitle: 'Discord Desktop', toastMsg: 'Enviado: Ctrl+Shift+M' },
      { id: 'spotify-play', icon: '🎵', label: 'Spotify', action: 'spotify-play', toastTitle: 'Spotify Media', toastMsg: 'Reproduciendo: Lofi Stream' },
      { id: 'vscode', icon: '💻', label: 'VS Code', action: 'vscode', toastTitle: 'Windows Launcher', toastMsg: 'Ventana enfocada: Code.exe' },
      { id: 'snip', icon: '✂️', label: 'Captura', action: 'snip', toastTitle: 'Atajo Teclado', toastMsg: 'Enviado: Win+Shift+S' },
      { id: 'obs-scene', icon: '🎬', label: 'Escena Juego', action: 'obs-scene', toastTitle: 'OBS Studio', toastMsg: 'Escena: Gameplay' },
      { id: 'calc', icon: '🧮', label: 'Calculadora', action: 'calc', toastTitle: 'Windows Universal', toastMsg: 'Iniciado: calc.exe' }
    ]
  ],
  'ja': [
    [
      { id: 'obs-rec', icon: '⏺️', label: 'OBS 録画', action: 'obs-rec', toastTitle: 'OBS Studio (WebSocket)', toastMsg: '1080p60で録画を開始しました' },
      { id: 'obs-mute', icon: '🎙️', label: 'マイク消音', action: 'obs-mute', toastTitle: 'OBS / 音声', toastMsg: 'マイクをミュートに切り替えました' },
      { id: 'discord-mute', icon: '🎧', label: 'Discord', action: 'discord-mute', toastTitle: 'Discord Desktop', toastMsg: 'Ctrl+Shift+M 送信（消音切替）' },
      { id: 'spotify-play', icon: '🎵', label: 'Spotify', action: 'spotify-play', toastTitle: 'Spotify メディア', toastMsg: '再生中: Lofi Stream Beats' },
      { id: 'vscode', icon: '💻', label: 'VS Code', action: 'vscode', toastTitle: 'Windows ランチャー', toastMsg: 'Code.exe を最前面に表示' },
      { id: 'snip', icon: '✂️', label: '画面切取', action: 'snip', toastTitle: 'キーボードマクロ', toastMsg: 'Win+Shift+S を実行（キャプチャ）' },
      { id: 'obs-scene', icon: '🎬', label: 'ゲーム画面', action: 'obs-scene', toastTitle: 'OBS Studio', toastMsg: '「ゲーム配信シーン」へ切替完了' },
      { id: 'calc', icon: '🧮', label: '電卓', action: 'calc', toastTitle: 'Windows アプリ', toastMsg: 'calc.exe を起動しました' }
    ]
  ]
};

// Botões do celular nativos localizados para cada idioma
localizedSlots['it'] = [
  [
    {
      "id": "obs-rec",
      "icon": "⏺️",
      "label": "OBS Registra",
      "action": "obs-rec",
      "toastTitle": "OBS Studio (WebSocket)",
      "toastMsg": "Registrazione avviata in 1080p60!"
    },
    {
      "id": "obs-mute",
      "icon": "🎙️",
      "label": "Mic Muto",
      "action": "obs-mute",
      "toastTitle": "OBS / Audio",
      "toastMsg": "Microfono disattivato nel flusso"
    },
    {
      "id": "discord-mute",
      "icon": "🎧",
      "label": "Discord",
      "action": "discord-mute",
      "toastTitle": "Discord Desktop",
      "toastMsg": "Inviato: Ctrl+Shift+M (Deafen)"
    },
    {
      "id": "spotify-play",
      "icon": "🎵",
      "label": "Spotify",
      "action": "spotify-play",
      "toastTitle": "Spotify Media",
      "toastMsg": "In riproduzione: Lofi Stream"
    },
    {
      "id": "vscode",
      "icon": "💻",
      "label": "VS Code",
      "action": "vscode",
      "toastTitle": "Windows Launcher",
      "toastMsg": "Finestra attiva: Code.exe"
    },
    {
      "id": "snip",
      "icon": "✂️",
      "label": "Cattura",
      "action": "snip",
      "toastTitle": "Macro Tastiera",
      "toastMsg": "Tasti inviati: Win+Shift+S"
    },
    {
      "id": "obs-scene",
      "icon": "🎬",
      "label": "Scena Game",
      "action": "obs-scene",
      "toastTitle": "OBS Studio",
      "toastMsg": "Scena attiva: Gameplay"
    },
    {
      "id": "calc",
      "icon": "🧮",
      "label": "Calcolatrice",
      "action": "calc",
      "toastTitle": "Windows Universal",
      "toastMsg": "Avviata: calc.exe"
    }
  ]
];
localizedSlots['fr'] = [
  [
    {
      "id": "obs-rec",
      "icon": "⏺️",
      "label": "OBS Enreg",
      "action": "obs-rec",
      "toastTitle": "OBS Studio (WebSocket)",
      "toastMsg": "Enregistrement démarré en 1080p60 !"
    },
    {
      "id": "obs-mute",
      "icon": "🎙️",
      "label": "Mic Muet",
      "action": "obs-mute",
      "toastTitle": "OBS / Audio",
      "toastMsg": "Microphone coupé dans le flux"
    },
    {
      "id": "discord-mute",
      "icon": "🎧",
      "label": "Discord",
      "action": "discord-mute",
      "toastTitle": "Discord Desktop",
      "toastMsg": "Envoyé : Ctrl+Shift+M"
    },
    {
      "id": "spotify-play",
      "icon": "🎵",
      "label": "Spotify",
      "action": "spotify-play",
      "toastTitle": "Spotify Media",
      "toastMsg": "Lecture en cours : Lofi Stream"
    },
    {
      "id": "vscode",
      "icon": "💻",
      "label": "VS Code",
      "action": "vscode",
      "toastTitle": "Lanceur Windows",
      "toastMsg": "Fenêtre active : Code.exe"
    },
    {
      "id": "snip",
      "icon": "✂️",
      "label": "Capture",
      "action": "snip",
      "toastTitle": "Macro Clavier",
      "toastMsg": "Touches envoyées : Win+Shift+S"
    },
    {
      "id": "obs-scene",
      "icon": "🎬",
      "label": "Scène Jeu",
      "action": "obs-scene",
      "toastTitle": "OBS Studio",
      "toastMsg": "Scène active : Gameplay"
    },
    {
      "id": "calc",
      "icon": "🧮",
      "label": "Calculatrice",
      "action": "calc",
      "toastTitle": "Windows Universal",
      "toastMsg": "Lancé : calc.exe"
    }
  ]
];
localizedSlots['de'] = [
  [
    {
      "id": "obs-rec",
      "icon": "⏺️",
      "label": "OBS Aufn",
      "action": "obs-rec",
      "toastTitle": "OBS Studio (WebSocket)",
      "toastMsg": "Aufnahme gestartet in 1080p60!"
    },
    {
      "id": "obs-mute",
      "icon": "🎙️",
      "label": "Mikro Stumm",
      "action": "obs-mute",
      "toastTitle": "OBS / Audio",
      "toastMsg": "Mikrofon im Stream stummgeschaltet"
    },
    {
      "id": "discord-mute",
      "icon": "🎧",
      "label": "Discord",
      "action": "discord-mute",
      "toastTitle": "Discord Desktop",
      "toastMsg": "Gesendet: Ctrl+Shift+M"
    },
    {
      "id": "spotify-play",
      "icon": "🎵",
      "label": "Spotify",
      "action": "spotify-play",
      "toastTitle": "Spotify Media",
      "toastMsg": "Wiedergabe: Lofi Stream"
    },
    {
      "id": "vscode",
      "icon": "💻",
      "label": "VS Code",
      "action": "vscode",
      "toastTitle": "Windows Launcher",
      "toastMsg": "Fenster aktiv: Code.exe"
    },
    {
      "id": "snip",
      "icon": "✂️",
      "label": "Screenshot",
      "action": "snip",
      "toastTitle": "Tastatur-Makro",
      "toastMsg": "Gesendet: Win+Shift+S"
    },
    {
      "id": "obs-scene",
      "icon": "🎬",
      "label": "Game Szene",
      "action": "obs-scene",
      "toastTitle": "OBS Studio",
      "toastMsg": "Szene gewechselt: Gameplay"
    },
    {
      "id": "calc",
      "icon": "🧮",
      "label": "Rechner",
      "action": "calc",
      "toastTitle": "Windows Universal",
      "toastMsg": "Gestartet: calc.exe"
    }
  ]
];
localizedSlots['zh-CN'] = [
  [
    {
      "id": "obs-rec",
      "icon": "⏺️",
      "label": "OBS 录制",
      "action": "obs-rec",
      "toastTitle": "OBS Studio (WebSocket)",
      "toastMsg": "已开始录制 (1080p60)！"
    },
    {
      "id": "obs-mute",
      "icon": "🎙️",
      "label": "麦克风静音",
      "action": "obs-mute",
      "toastTitle": "OBS / 音频",
      "toastMsg": "直播麦克风已静音"
    },
    {
      "id": "discord-mute",
      "icon": "🎧",
      "label": "Discord",
      "action": "discord-mute",
      "toastTitle": "Discord 客户端",
      "toastMsg": "已发送快捷键: Ctrl+Shift+M"
    },
    {
      "id": "spotify-play",
      "icon": "🎵",
      "label": "Spotify",
      "action": "spotify-play",
      "toastTitle": "Spotify 媒体",
      "toastMsg": "正在播放: Lofi Stream Beats"
    },
    {
      "id": "vscode",
      "icon": "💻",
      "label": "VS Code",
      "action": "vscode",
      "toastTitle": "Windows 启动器",
      "toastMsg": "窗口已置顶: Code.exe"
    },
    {
      "id": "snip",
      "icon": "✂️",
      "label": "屏幕截图",
      "action": "snip",
      "toastTitle": "键盘组合键",
      "toastMsg": "已触发: Win+Shift+S (截图工具)"
    },
    {
      "id": "obs-scene",
      "icon": "🎬",
      "label": "游戏场景",
      "action": "obs-scene",
      "toastTitle": "OBS Studio",
      "toastMsg": "已切换至: 游戏全屏场景"
    },
    {
      "id": "calc",
      "icon": "🧮",
      "label": "计算器",
      "action": "calc",
      "toastTitle": "Windows 应用",
      "toastMsg": "已启动程序: calc.exe"
    }
  ]
];
localizedSlots['vi'] = [
  [
    {
      "id": "obs-rec",
      "icon": "⏺️",
      "label": "Ghi OBS",
      "action": "obs-rec",
      "toastTitle": "OBS Studio (WebSocket)",
      "toastMsg": "Đã bắt đầu ghi hình ở 1080p60!"
    },
    {
      "id": "obs-mute",
      "icon": "🎙️",
      "label": "Tắt Micro",
      "action": "obs-mute",
      "toastTitle": "OBS / Âm thanh",
      "toastMsg": "Đã tắt tiếng micro trên stream"
    },
    {
      "id": "discord-mute",
      "icon": "🎧",
      "label": "Discord",
      "action": "discord-mute",
      "toastTitle": "Discord Desktop",
      "toastMsg": "Đã gửi: Ctrl+Shift+M"
    },
    {
      "id": "spotify-play",
      "icon": "🎵",
      "label": "Spotify",
      "action": "spotify-play",
      "toastTitle": "Spotify Media",
      "toastMsg": "Đang phát: Lofi Stream"
    },
    {
      "id": "vscode",
      "icon": "💻",
      "label": "VS Code",
      "action": "vscode",
      "toastTitle": "Windows Launcher",
      "toastMsg": "Cửa sổ kích hoạt: Code.exe"
    },
    {
      "id": "snip",
      "icon": "✂️",
      "label": "Chụp hình",
      "action": "snip",
      "toastTitle": "Phím tắt Windows",
      "toastMsg": "Đã kích hoạt: Win+Shift+S"
    },
    {
      "id": "obs-scene",
      "icon": "🎬",
      "label": "Cảnh Game",
      "action": "obs-scene",
      "toastTitle": "OBS Studio",
      "toastMsg": "Chuyển cảnh: Gameplay"
    },
    {
      "id": "calc",
      "icon": "🧮",
      "label": "Máy tính",
      "action": "calc",
      "toastTitle": "Windows Universal",
      "toastMsg": "Đã mở: calc.exe"
    }
  ]
];
localizedSlots['ko'] = [
  [
    {
      "id": "obs-rec",
      "icon": "⏺️",
      "label": "OBS 녹화",
      "action": "obs-rec",
      "toastTitle": "OBS Studio (WebSocket)",
      "toastMsg": "1080p60 녹화가 시작되었습니다!"
    },
    {
      "id": "obs-mute",
      "icon": "🎙️",
      "label": "마이크 음소거",
      "action": "obs-mute",
      "toastTitle": "OBS / 오디오",
      "toastMsg": "마이크 음소거가 활성화되었습니다"
    },
    {
      "id": "discord-mute",
      "icon": "🎧",
      "label": "Discord",
      "action": "discord-mute",
      "toastTitle": "Discord Desktop",
      "toastMsg": "전송됨: Ctrl+Shift+M"
    },
    {
      "id": "spotify-play",
      "icon": "🎵",
      "label": "Spotify",
      "action": "spotify-play",
      "toastTitle": "Spotify 미디어",
      "toastMsg": "재생 중: Lofi Stream Beats"
    },
    {
      "id": "vscode",
      "icon": "💻",
      "label": "VS Code",
      "action": "vscode",
      "toastTitle": "Windows 런처",
      "toastMsg": "창 활성화: Code.exe"
    },
    {
      "id": "snip",
      "icon": "✂️",
      "label": "화면 캡처",
      "action": "snip",
      "toastTitle": "키보드 매크로",
      "toastMsg": "실행됨: Win+Shift+S (캡처 도구)"
    },
    {
      "id": "obs-scene",
      "icon": "🎬",
      "label": "게임 장면",
      "action": "obs-scene",
      "toastTitle": "OBS Studio",
      "toastMsg": "장면 전환: 게임 전체화면"
    },
    {
      "id": "calc",
      "icon": "🧮",
      "label": "계산기",
      "action": "calc",
      "toastTitle": "Windows 앱",
      "toastMsg": "실행 완료: calc.exe"
    }
  ]
];
localizedSlots['ar'] = [
  [
    {
      "id": "obs-rec",
      "icon": "⏺️",
      "label": "تسجيل OBS",
      "action": "obs-rec",
      "toastTitle": "OBS Studio (WebSocket)",
      "toastMsg": "بدأ التسجيل بدقة 1080p60!"
    },
    {
      "id": "obs-mute",
      "icon": "🎙️",
      "label": "كتم الميكروفون",
      "action": "obs-mute",
      "toastTitle": "OBS / الصوت",
      "toastMsg": "تم كتم صوت الميكروفون في البث"
    },
    {
      "id": "discord-mute",
      "icon": "🎧",
      "label": "Discord",
      "action": "discord-mute",
      "toastTitle": "Discord Desktop",
      "toastMsg": "تم الإرسال: Ctrl+Shift+M"
    },
    {
      "id": "spotify-play",
      "icon": "🎵",
      "label": "Spotify",
      "action": "spotify-play",
      "toastTitle": "Spotify Media",
      "toastMsg": "تشغيل الآن: Lofi Stream Beats"
    },
    {
      "id": "vscode",
      "icon": "💻",
      "label": "VS Code",
      "action": "vscode",
      "toastTitle": "مشغل Windows",
      "toastMsg": "النافذة النشطة: Code.exe"
    },
    {
      "id": "snip",
      "icon": "✂️",
      "label": "لقطة شاشة",
      "action": "snip",
      "toastTitle": "اختصار لوحة المفاتيح",
      "toastMsg": "تم التشغيل: Win+Shift+S"
    },
    {
      "id": "obs-scene",
      "icon": "🎬",
      "label": "مشهد اللعبة",
      "action": "obs-scene",
      "toastTitle": "OBS Studio",
      "toastMsg": "تم تبديل المشهد: اللعبة الكاملة"
    },
    {
      "id": "calc",
      "icon": "🧮",
      "label": "الحاسبة",
      "action": "calc",
      "toastTitle": "Windows Universal",
      "toastMsg": "تم تشغيل: calc.exe"
    }
  ]
];


let currentLang = 'pt';
let currentPageIndex = 0;

// --------------------------------------------------------------------------
// 5. Interação Celular (Horizontal) -> Computador (Acima)
// --------------------------------------------------------------------------
const deckGrid = document.getElementById('interactive-deck-grid');
const pageIndicator = document.getElementById('deck-page-indicator');
const prevPageBtn = document.getElementById('deck-prev-page');
const nextPageBtn = document.getElementById('deck-next-page');

const winToast = document.getElementById('sim-win-toast');
const toastTitle = document.getElementById('sim-toast-title');
const toastMsg = document.getElementById('sim-toast-msg');

const obsRecBadge = document.getElementById('obs-rec-badge');
const obsRecText = document.getElementById('obs-rec-text');
const obsMicBadge = document.getElementById('obs-mic-badge');
const obsMicIcon = document.getElementById('obs-mic-icon');
const obsMicText = document.getElementById('obs-mic-text');
const obsScenePreview = document.getElementById('obs-scene-preview');
const tabGame = document.getElementById('tab-game');
const tabChat = document.getElementById('tab-chat');

const pcSpotifyWidget = document.getElementById('pc-spotify-widget');
const spotifyStatusBadge = document.getElementById('spotify-status-badge');
const pcCalcWidget = document.getElementById('pc-calc-widget');
const pcTerminalWidget = document.getElementById('pc-terminal-widget');
const pcVolumeSlider = document.getElementById('pc-volume-slider');
const volumeBarFill = document.getElementById('volume-bar-fill');
const volumePercent = document.getElementById('volume-percent');
const volumeIcon = document.getElementById('volume-icon');
const snippingOverlay = document.getElementById('snipping-overlay');
const syncParticle = document.getElementById('sync-particle');

let isRecording = false;
let isMicMuted = false;
let isMusicPlaying = true;
let currentVolume = 75;
let activeScene = 'game';

let audioCtx = null;
function playTactileClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.038);
  } catch (e) {}
}

let toastTimeout = null;
function triggerWindowsNotification(title, msg) {
  if (!winToast || !toastTitle || !toastMsg) return;
  toastTitle.textContent = title;
  toastMsg.textContent = msg;
  winToast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    winToast.classList.remove('show');
  }, 3200);
}

function triggerWirelessPulse() {
  if (!syncParticle) return;
  syncParticle.classList.remove('pulse-active');
  void syncParticle.offsetWidth;
  syncParticle.classList.add('pulse-active');
}

function executeComputerAction(actionId, slot) {
  triggerWirelessPulse();

  if (pcCalcWidget) pcCalcWidget.classList.remove('show');
  if (pcTerminalWidget) pcTerminalWidget.classList.remove('show');
  if (pcVolumeSlider) pcVolumeSlider.classList.remove('show');

  switch (actionId) {
    case 'obs-rec':
      isRecording = !isRecording;
      if (obsRecBadge && obsRecText) {
        if (isRecording) {
          obsRecBadge.classList.add('recording');
          obsRecText.textContent = currentLang === 'ja' ? 'REC 録画中 00:01:24' : 'REC 00:01:24';
        } else {
          obsRecBadge.classList.remove('recording');
          obsRecText.textContent = currentLang === 'ja' ? '待機中' : 'PARADO';
        }
      }
      break;

    case 'obs-mute':
      isMicMuted = !isMicMuted;
      if (obsMicBadge && obsMicIcon && obsMicText) {
        if (isMicMuted) {
          obsMicBadge.classList.add('muted');
          obsMicIcon.textContent = '🔇';
          obsMicText.textContent = currentLang === 'ja' ? 'マイク消音中' : 'MIC MUTADO';
        } else {
          obsMicBadge.classList.remove('muted');
          obsMicIcon.textContent = '🎙️';
          obsMicText.textContent = currentLang === 'ja' ? 'マイク有効' : 'Mic Ativo';
        }
      }
      break;

    case 'obs-scene':
      activeScene = activeScene === 'game' ? 'chat' : 'game';
      if (obsScenePreview) {
        if (activeScene === 'chat') {
          obsScenePreview.classList.add('scene-chat-mode');
          if (tabGame) tabGame.classList.remove('active');
          if (tabChat) tabChat.classList.add('active');
        } else {
          obsScenePreview.classList.remove('scene-chat-mode');
          if (tabGame) tabGame.classList.add('active');
          if (tabChat) tabChat.classList.remove('active');
        }
      }
      break;

    case 'spotify-play':
      isMusicPlaying = !isMusicPlaying;
      if (pcSpotifyWidget && spotifyStatusBadge) {
        pcSpotifyWidget.classList.add('show');
        spotifyStatusBadge.textContent = isMusicPlaying 
          ? (currentLang === 'ja' ? '▶ 再生中' : '▶ TOCANDO')
          : (currentLang === 'ja' ? '⏸ 一時停止' : '⏸ PAUSADO');
      }
      break;

    case 'snip':
      if (snippingOverlay) {
        snippingOverlay.classList.add('active');
        setTimeout(() => snippingOverlay.classList.remove('active'), 1200);
      }
      break;

    case 'calc':
      if (pcCalcWidget) {
        pcCalcWidget.classList.add('show');
        setTimeout(() => pcCalcWidget.classList.remove('show'), 4000);
      }
      break;

    case 'terminal':
      if (pcTerminalWidget) {
        pcTerminalWidget.classList.add('show');
        setTimeout(() => pcTerminalWidget.classList.remove('show'), 4000);
      }
      break;

    default:
      if (obsScenePreview) {
        obsScenePreview.classList.add('action-flash');
        setTimeout(() => obsScenePreview.classList.remove('action-flash'), 300);
      }
      break;
  }

  triggerWindowsNotification(slot.toastTitle, slot.toastMsg);
}

function renderPhoneDeckButtons() {
  if (!deckGrid) return;
  deckGrid.innerHTML = '';

  const langPages = localizedSlots[currentLang] || localizedSlots['pt'];
  const currentSlots = langPages[currentPageIndex] || langPages[0];

  currentSlots.forEach(slot => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'phone-deck-btn';
    btn.setAttribute('aria-label', `${slot.label}: ${slot.toastMsg}`);
    btn.innerHTML = `
      <div class="phone-btn-icon">${slot.icon}</div>
      <span class="phone-btn-label">${slot.label}</span>
    `;

    btn.addEventListener('click', () => {
      btn.classList.add('pressed');
      playTactileClick();
      executeComputerAction(slot.action, slot);
      setTimeout(() => btn.classList.remove('pressed'), 180);
    });

    deckGrid.appendChild(btn);
  });

  const t = translations[currentLang] || translations['pt'];
  if (pageIndicator) {
    pageIndicator.textContent = t.pageIndicator
      .replace('{current}', currentPageIndex + 1)
      .replace('{total}', langPages.length);
  }

  const prevSpan = prevPageBtn ? prevPageBtn.querySelector('span') : null;
  const nextSpan = nextPageBtn ? nextPageBtn.querySelector('span') : null;
  if (prevSpan && t.btnPrevPage) prevSpan.textContent = t.btnPrevPage;
  if (nextSpan && t.btnNextPage) nextSpan.textContent = t.btnNextPage;

  if (prevPageBtn) prevPageBtn.disabled = currentPageIndex === 0;
  if (nextPageBtn) nextPageBtn.disabled = currentPageIndex === langPages.length - 1;
}

if (prevPageBtn) {
  prevPageBtn.addEventListener('click', () => {
    if (currentPageIndex > 0) {
      currentPageIndex--;
      renderPhoneDeckButtons();
    }
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener('click', () => {
    const langPages = localizedSlots[currentLang] || localizedSlots['pt'];
    if (currentPageIndex < langPages.length - 1) {
      currentPageIndex++;
      renderPhoneDeckButtons();
    }
  });
}

// --------------------------------------------------------------------------
// 6. Seletor de Idiomas com Bandeiras SVG
// --------------------------------------------------------------------------
const langToggleBtn = document.getElementById('lang-toggle-btn');
const langDropdown = document.getElementById('lang-dropdown');
const langCurrentLabel = document.getElementById('lang-current-label');
const langCurrentFlagSvg = document.getElementById('lang-current-flag-svg');

function setLanguage(lang) {
  if (!translations[lang]) lang = 'pt';
  currentLang = lang;
  
  rootElement.setAttribute('lang', lang === 'pt' ? 'pt-BR' : lang);
  rootElement.setAttribute('data-lang', lang);
  rootElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  localStorage.setItem('ezdeck-lang', lang);

  const t = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      if (t[key].includes('<') || t[key].includes('&')) {
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  // Atualiza bandeira e nome no botão superior
  const meta = languageMeta[lang] || languageMeta['pt'];
  if (langCurrentLabel) langCurrentLabel.textContent = meta.code;
  if (langCurrentFlagSvg && SVG_FLAGS[lang]) {
    langCurrentFlagSvg.innerHTML = SVG_FLAGS[lang];
  }

  // Atualiza item ativo no menu
  document.querySelectorAll('.lang-item').forEach(item => {
    if (item.getAttribute('data-lang') === lang) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  renderPhoneDeckButtons();
}

// Inicializa bandeiras nos itens do dropdown
function initDropdownFlags() {
  document.querySelectorAll('.lang-item').forEach(item => {
    const code = item.getAttribute('data-lang');
    const flagWrap = item.querySelector('.lang-item-flag');
    if (flagWrap && SVG_FLAGS[code]) {
      flagWrap.innerHTML = SVG_FLAGS[code];
    }
  });
}

if (langToggleBtn && langDropdown) {
  initDropdownFlags();

  langToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('active');
    if (typeof closeMobileMenu === 'function') closeMobileMenu();
  });

  document.addEventListener('click', () => {
    langDropdown.classList.remove('active');
  });

  document.querySelectorAll('.lang-item').forEach(item => {
    item.addEventListener('click', () => {
      const selected = item.getAttribute('data-lang');
      setLanguage(selected);
      langDropdown.classList.remove('active');
    });
  });
}

// --------------------------------------------------------------------------
// 7. FAQ Accordion
// --------------------------------------------------------------------------
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  if (btn) {
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  }
});

// --------------------------------------------------------------------------
// 8. Menu Mobile Hamburger (Com fechamento ao clicar fora, em link ou ESC)
// --------------------------------------------------------------------------
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

function openMobileMenu() {
  if (!navLinks || !mobileMenuBtn) return;
  navLinks.classList.add('mobile-open');
  mobileMenuBtn.setAttribute('aria-expanded', 'true');
  mobileMenuBtn.classList.add('active');
  if (langDropdown) langDropdown.classList.remove('active');
}

function closeMobileMenu() {
  if (!navLinks || !mobileMenuBtn) return;
  navLinks.classList.remove('mobile-open');
  mobileMenuBtn.setAttribute('aria-expanded', 'false');
  mobileMenuBtn.classList.remove('active');
}

function toggleMobileMenu() {
  if (navLinks && navLinks.classList.contains('mobile-open')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Fechar ao clicar em qualquer link de navegação interno
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Fechar ao clicar fora do menu e fora do botão
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Fechar com tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      if (langDropdown) langDropdown.classList.remove('active');
    }
  });
}

// Inicia com idioma salvo ou português
const savedLang = localStorage.getItem('ezdeck-lang') || 'pt';
setLanguage(savedLang);
