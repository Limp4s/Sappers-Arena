// Lightweight i18n.
const DICTS = {
  en: {
    appName: 'Sappers Arena',
    tagline: '// neural minesweeper',
    tabs: { campaign: 'CAMPAIGN', battles: 'BATTLES', custom: 'CUSTOM', shop: 'SHOP', leaderboard: 'LEADERS', profile: 'PROFILE', friends: 'FRIENDS' },
    common: {
      login: 'ACCESS GRID', register: 'LOCK CALLSIGN', logout: 'LOG OUT · SWITCH ACCOUNT',
      coins: 'COINS', rating: 'ELO', play: 'PLAY', cancel: 'CANCEL', close: 'CLOSE',
      remaining: 'LIVES LEFT', findOpponent: 'FIND OPPONENT', createLobby: 'CREATE LOBBY',
      joinLobby: 'JOIN LOBBY', friends: 'FRIENDS', search: 'SEARCH',
      settings: 'SETTINGS', language: 'LANGUAGE', exit: 'EXIT',
      continue: 'CONTINUE',
      back: 'BACK',
      copy: 'COPY',
      or: 'OR',
      vs: 'VS',
      admin: 'ADMIN',
      yes: 'YES',
      no: 'NO',
    },
    settings: {
      sound: 'SOUND',
    },
    onboarding: {
      label: 'onboarding',
      stepLabel: 'STEP',
      skip: 'SKIP',
      next: 'NEXT',
      done: 'DONE',
      welcomeTitle: 'WELCOME TO SAPPERS ARENA',
      welcomeBody: 'A quick 30-second walkthrough. You can skip it and open the game immediately.',
      livesTitle: 'LIVES',
      livesBody: 'You start with several lives. Hitting a mine costs 1 life. The game ends when lives reach 0.',
      flagsTitle: 'FLAGS',
      flagsBody: 'Use flags to mark mines. Correct flags help you play faster and safer.',
      duelsTitle: 'DUELS',
      duelsBody: 'In battles, your goal is to finish with more progress (and lives) than your opponent. Speed matters.',
    },
    daily: {
      title: 'DAILY',
      subtitle: 'DAILY QUESTS',
      coins: 'COINS',
      coinsShort: 'c',
      resetIn: 'RESET IN',
      claimed: 'CLAIMED',
      claim: 'CLAIM',
      quests: {
        play_1: 'Play 1 game',
        play_3: 'Play 3 games',
        win_1: 'Win 1 game',
        win_3: 'Win 3 games',
        lose_1: 'Lose 1 game',
        lose_3: 'Lose 3 games',
        flags_5: 'Place 5 flags',
        flags_20: 'Place 20 flags',
        flags_50: 'Place 50 flags',
        safe_100: 'Reveal 100 safe cells',
        safe_250: 'Reveal 250 safe cells',
        time_300: 'Play for 5 minutes (300s)',
        time_900: 'Play for 15 minutes (900s)',
        fast_60: 'Win under 60 seconds',
        fast_30: 'Win under 30 seconds',
        no_flags: 'Win without placing flags',
        flawless: 'Win without losing lives',
        one_life: 'Win with 1 life left',
        campaign_1: 'Win 1 campaign level',
        campaign_3: 'Win 3 campaign levels',
      },
    },
    achievements: {
      title: 'ACHIEVEMENTS',
      unlocked: 'UNLOCKED',
      toast: 'ACHIEVEMENT UNLOCKED',
      more: 'MORE',
      items: {
        games_1: { title: 'FIRST STEPS', cond: 'Play 1 game', desc: 'First step done. More to come.' },
        games_10: { title: 'GETTING WARM', cond: 'Play 10 games', desc: 'Warmed up. Now it gets serious.' },
        games_50: { title: 'REGULAR', cond: 'Play 50 games', desc: "It’s a habit now, isn’t it?" },
        games_200: { title: 'VETERAN', cond: 'Play 200 games', desc: 'You have seen everything. Even pain.' },
        games_1000: { title: 'MARATHON', cond: 'Play 1000 games', desc: 'Do you live here?' },
        wins_1: { title: 'FIRST WIN', cond: 'Win 1 game', desc: 'The first win is the sweetest.' },
        streak_3: { title: 'WIN STREAK 3', cond: 'Win 3 games in a row', desc: 'A streak begins. Keep it going.' },
        streak_5: { title: 'WIN STREAK 5', cond: 'Win 5 games in a row', desc: 'Confident. Very confident.' },
        streak_10: { title: 'WIN STREAK 10', cond: 'Win 10 games in a row', desc: 'You read the grid like a book.' },
        streak_100: { title: 'WIN STREAK 100', cond: 'Win 100 games in a row', desc: 'Hold on… are you a bot?' },
        flawless_win: { title: 'FLAWLESS', cond: 'Win without losing lives', desc: 'Clean work. No scratches.' },
        speed_win_60: { title: 'QUICK MIND', cond: 'Win under 60 seconds', desc: 'Fast thinking, faster clicks.' },
        speed_win_30: { title: 'SPEEDRUNNER', cond: 'Win under 30 seconds', desc: 'Did you even blink?' },
        speed_win_20: { title: 'LIGHTNING', cond: 'Win under 20 seconds', desc: 'Blink and it’s over.' },
        speed_win_10: { title: 'SPEEDSTER', cond: 'Win under 10 seconds', desc: 'Finished before it started.' },
        flags_1: { title: 'FIRST FLAG', cond: 'Place 1 flag', desc: 'First flag. The paranoia begins.' },
        flags_100: { title: 'FLAG MASTER', cond: 'Place 100 flags total', desc: 'Marking like a pro.' },
        flags_1000: { title: 'FLAG LEGEND', cond: 'Place 1000 flags total', desc: 'More flags than doubts. Almost.' },
        precise_all_mines: { title: 'PRECISE', cond: 'Win with flags on all mines', desc: 'Textbook perfect.' },
        no_flags_win: { title: 'NO FLAGS', cond: 'Win without placing flags', desc: 'Pure intuition. Or madness.' },
        campaign_1: { title: 'CAMPAIGN START', cond: 'Win 1 campaign level', desc: 'Chapter 1: “How hard can it be?”' },
        campaign_10: { title: 'CAMPAIGN 10', cond: 'Win 10 campaign levels', desc: 'You’re in. No backing out.' },
        campaign_half: { title: 'CAMPAIGN HALFWAY', cond: 'Reach half of the campaign', desc: 'Halfway done. Now it gets spicy.' },
        campaign_complete: { title: 'CAMPAIGN COMPLETE', cond: 'Complete the campaign', desc: 'The end. And you survived. How?' },
        hard_lesson: { title: 'HARD LESSON', cond: 'Win campaign level 150+ with 1 life left', desc: 'One mistake and boom. You survived.' },
        duels_1: { title: 'FIRST DUEL', cond: 'Play 1 duel', desc: 'Welcome to the real fight.' },
        duel_wins_1: { title: 'DUEL WINNER', cond: 'Win 1 duel', desc: 'The first win always feels good.' },
        ranked_10: { title: 'RANKED READY', cond: 'Play 10 ranked duels', desc: 'Rating is pain. You’re used to it.' },
        duel_wins_10: { title: 'RIVAL', cond: 'Win 10 duels', desc: 'They remember you. And fear you.' },
        duel_wins_50: { title: 'NEMESIS', cond: 'Win 50 duels', desc: 'If you’re in the lobby, someone panics.' },
        comeback_1hp: { title: 'COMEBACK', cond: 'Win with 1 life left', desc: 'On the edge. Still a win.' },
        duel_streak_5: { title: 'UNSTOPPABLE', cond: 'Win 5 duels in a row', desc: 'No one can stop you. Yet.' },
        rating_600: { title: 'RISING', cond: 'Reach rating 600', desc: 'Up you go.' },
        rating_1000: { title: 'SKILLED', cond: 'Reach rating 1000', desc: 'Not a newbie anymore.' },
        rating_5000: { title: 'PRO', cond: 'Reach rating 5000', desc: 'Pro. No questions.' },
        rating_10000: { title: 'ELITE', cond: 'Reach rating 10000', desc: 'Elite only.' },
        rating_15000: { title: 'LEGEND', cond: 'Reach rating 15000', desc: 'A real legend.' },
        coins_balance_10000: { title: 'LAST MONEY', cond: 'Have 10000 coins balance', desc: 'Did you save for long? Or just never spend?' },
        coins_earned_total_10000: { title: 'RICH', cond: 'Earn 10000 coins total', desc: 'Not bad at all.' },

        collect_mines_all: { title: 'MINE COLLECTOR', cond: 'Collect all mine skins', desc: 'Collect all mine skins in the shop.' },
        collect_cells_all: { title: 'CELL COLLECTOR', cond: 'Collect all cell skins', desc: 'Collect all cell skins in the shop.' },
        collect_fx_all: { title: 'FX COLLECTOR', cond: 'Collect all explosion effects', desc: 'Collect all explosion effects in the shop.' },
        collect_flags_all: { title: 'FLAG COLLECTOR', cond: 'Collect all flag skins', desc: 'Collect all flag skins in the shop.' },
        collect_shop_all: { title: 'TRUE COLLECTOR', cond: 'Collect all shop items', desc: 'Collect every item available in the shop.' },

        daily_claim_1: { title: 'DAILY CLAIMER', cond: 'Claim 1 daily quest', desc: 'Claiming rewards is sacred.' },
        daily_streak_5: { title: 'DAILY STREAK', cond: 'Claim dailies in 5 windows in a row', desc: 'Discipline. Iron.' },
      },
    },
    auth: {
      identifyTitle: 'IDENTIFY',
      accessTitle: 'ACCESS',
      identifyHint: 'Create your grid identity.',
      accessHint: 'Log in with an existing callsign.',
      callsignLabel: 'Callsign · 3–20 chars',
      callsignPlaceholder: 'YOUR_NAME',
      passwordLabel: 'Password · min 4 chars',
      passwordPlaceholder: '••••••',
      callsignAvailable: 'Callsign available.',
      adminSlot: 'ADMIN SLOT',
      alreadyTaken: 'Already taken.',
      connecting: 'CONNECTING...',
      passwordRequiredHint: 'Password required. Change later via profile.',
      forgotPasswordHint: 'Forgot password? Ask admin.',
      failedTryAgain: 'Failed. Try again.',
    },
    lobbyFriend: {
      title: 'PLAY WITH FRIEND',
      hint: 'Create a private lobby and share the code, or join an existing one.',
      codeLabel: 'Lobby code · 6 chars',
      codePlaceholder: 'XXXXXX',
      shareCode: 'SHARE CODE',
      host: 'HOST',
      guest: 'GUEST',
      waiting: 'waiting',
      startNow: 'START NOW',
      waitingForHost: 'Waiting for host to start...',
      createFailed: 'Create failed.',
      joinFailed: 'Join failed.',
      startFailed: 'Start failed.',
    },
    game: {
      defaultLabel: 'MINE.GRID',
      minesLower: 'mines',
      livesLower: 'lives',
      controlsHint: '// LEFT-CLICK reveal  ·  RIGHT-CLICK flag  ·  first click is safe',
      time: 'TIME',
      mines: 'MINES',
      score: 'SCORE',
      lives: 'LIVES',
      flag: 'FLAG',
      reset: 'RESET',
      victory: 'VICTORY',
      systemBreach: 'SYSTEM BREACH',
      cleared: 'cleared',
      terminated: 'terminated',
      bounty: 'Bounty',
      adminNoSubmit: '∞ admin mode — score not submitted',
      uploading: 'uploading to grid...',
      queued: 'queued...',
      scoreUploaded: '✓ score uploaded to leaderboard',
      win: 'win',
      loss: 'loss',
      duelResult: 'DUEL RESULT',
      you: 'YOU',
      rival: 'RIVAL',
      youWinDuel: '🏆 YOU WIN THE DUEL',
      defeated: 'DEFEATED',
      tie: 'TIE',
      replay: 'REPLAY',
      playAgain: 'PLAY AGAIN',
      youWon: 'YOU WON',
      youLost: 'YOU LOST',
    },
    profile: {
      inventory: 'OPEN INVENTORY',
      changePassword: 'CHANGE PASSWORD',
      account: 'ACCOUNT',
      lifetimeStats: 'LIFETIME STATS',
      offline: 'offline',
      loading: 'loading...',
      playerId: 'ID',
      oldPassword: 'Old password',
      newPassword: 'New password · min 4',
      repeatNewPassword: 'Repeat new password',
      passwordsDoNotMatch: 'Passwords do not match.',
      passwordUpdated: 'Password updated.',
      updating: 'UPDATING...',
      update: 'UPDATE',
      failed: 'Failed.',
    },
    stats: {
      runs: 'RUNS', wins: 'WINS', losses: 'LOSSES', winRate: 'WIN RATE',
      campaign: 'CAMPAIGN', battles: 'BATTLES', bestScore: 'BEST SCORE', bestTime: 'BEST TIME',
    },
    admin: { title: 'OWNER', promote: 'PROMOTE TO OWNER', grantBtn: 'GRANT',
      promoteHelp: 'Enter the callsign of the player to grant admin rights.',
      promoted: 'promoted.',
      processing: 'PROCESSING...',
      panelTitle: 'Admin Panel',
      panelHint: 'Click the trash icon next to any leaderboard entry to delete it.',
    },
    friends: { title: 'FRIENDS', searchPlaceholder: 'Search callsign...', noResult: 'Player not found.', blurb: 'Search other players, view their lifetime stats.' },
    pause: { title: 'PAUSED', exitGame: 'EXIT GAME' },
    shop: {
      title: 'SHOP',
      blurb: 'Earn coins by clearing campaign levels. Spend them on bomb icons, cell themes, and explosion FX.',
      coins: 'COINS',
      loading: 'loading catalog...',
      groups: { mine: 'MINE ICONS', cell: 'CELL THEMES', explosion: 'EXPLOSION FX', flag: 'FLAGS', cursor: 'CURSORS' },
      notEnoughCoins: 'Not enough coins.',
      acquired: 'Acquired · {id}',
      equippedMsg: 'Equipped · {id}',
      purchaseFailed: 'Purchase failed.',
      defaultBomb: 'Default Bomb',
      defaultCell: 'Cyan Grid (default)',
      defaultFx: 'Red Flash (default)',
      defaultFlag: 'Gold Flag (default)',
      defaultCursor: 'Default Cursor',
      free: 'FREE',
      equip: 'EQUIP',
      equipped: 'EQUIPPED',
      buy: 'BUY',
      buying: 'BUYING...',
      items: {
        mine_default: 'Bomb',
        mine_skull: 'Skull',
        mine_zap: 'Zap',
        mine_cat: 'Phantom Cat',
        mine_ghost: 'Ghost',
        mine_flame: 'Flame',
        mine_radiation: 'Radiation',
        mine_biohazard: 'Biohazard',
        mine_crown: 'Crown',
        mine_gem: 'Gem',

        cell_default: 'Cyan Grid',
        cell_gold: 'Gold Grid',
        cell_gold_premium: 'Solid Gold',
        cell_silver: 'Silver',
        cell_ice_premium: 'Premium Ice',
        cell_fire_premium: 'Premium Flame',
        cell_coral: 'Coral Grid',
        cell_ice: 'Ice Grid',
        cell_retro: 'Retro Green',
        cell_plasma: 'Plasma',
        cell_aurora: 'Aurora',
        cell_sunset: 'Sunset',
        cell_violet: 'Violet',
        cell_mono: 'Monochrome',
        cell_rainbow_premium: 'Rainbow',

        fx_default: 'Red Flash',
        fx_gold: 'Gold Burst',
        fx_gold_premium: 'Liquid Gold',
        fx_silver: 'Silver Burst',
        fx_ice_premium: 'Premium Ice',
        fx_fire_premium: 'Premium Flame',
        fx_rainbow: 'Rainbow',
        fx_rainbow_premium: 'Rainbow',
        fx_shockwave: 'Shockwave',
        fx_void: 'Void',
        fx_lime: 'Lime Burst',
        fx_ultraviolet: 'Ultraviolet',
        fx_ember: 'Ember',
        fx_aurora: 'Aurora Wave',

        flag_default: 'Gold Flag',
        flag_gold: 'Gold Flag',
        flag_cyan: 'Cyan Flag',
        flag_coral: 'Coral Flag',
        flag_ice: 'Ice Flag',
        flag_lime: 'Lime Flag',
        flag_violet: 'Violet Flag',
        flag_silver: 'Silver Flag',
        flag_mono: 'Mono Flag',
        flag_rainbow: 'Rainbow Flag',
      },
    },
    inventory: {
      title: 'INVENTORY',
      buyInShop: 'BUY IN SHOP',
      tabs: {
        bombs: 'BOMBS',
        explosions: 'EXPLOSIONS',
        flags: 'FLAGS',
        cursors: 'CURSORS',
        themes: 'THEMES',
      },
    },
    battles: {
      title: 'BATTLES',
      blurb: 'Find opponents in real-time. Same seed, same field — fastest clear wins.',
      simpleTitle: 'SIMPLE BATTLE',
      simpleSubtitle: 'Casual · No rating',
      rankedTitle: 'RANKED BATTLE',
      rankedSubtitle: 'Competitive · ELO',
      searching: 'SEARCHING OPPONENT...',
      found: 'OPPONENT FOUND',
      code: 'CODE',
      host: 'HOST',
      opponent: 'OPPONENT',
      waiting: 'waiting...',
      startNow: 'START NOW',
      cancel: 'CANCEL',
      findOpponent: 'FIND OPPONENT',
      yourRating: 'YOUR RATING',
      field: 'FIELD',
      mines: 'MINES',
      lives: 'LIVES',
    },
    custom: {
      title: 'CUSTOM SWEEP',
      blurb: 'Configure your own grid and skins. Play solo or with a friend by code.',
      rows: 'ROWS',
      cols: 'COLUMNS',
      mines: 'MINES',
      lives: 'LIVES',
      presets: 'presets',
      mineCapTitle: 'MINE CAP APPLIED.',
      mineCapBody: 'Density locked at ~60%.',
      solo: 'SOLO SWEEP',
      withFriend: 'PLAY WITH FRIEND',
      configPreview: 'config preview',
      estChallenge: 'est. challenge',
      cells: 'CELLS',
      safe: 'SAFE',
      density: 'DENSITY',
      fxSkins: 'FX & skins',
      modsTitle: 'EXTRA MODS',
      modNarc: 'NARCOMANIA',
      modRandom: 'RANDOM',
      modNoFlags: 'NO FLAGS',
      diff: { easy: 'EASY', normal: 'NORMAL', hard: 'HARD', insane: 'INSANE' },
      skin: {
        mine: 'MINE',
        cell: 'CELL',
        fx: 'FX',
        flag: 'FLAG',
        cursor: 'CURSOR',
      },
      lockedTooltip: 'Locked — buy in shop',
    },
    campaign: {
      title: 'THE PATH',
      blurb: '{n} nodes along a winding path. Scroll with wheel or drag.',
      infinityOn: 'INFINITY ON',
      infinityOff: 'INFINITY OFF',
      cleared: 'CLEARED',
      stars: 'STARS',
      start: 'START',
    },
    leaderboard: {
      title: 'LEADERBOARD',
      top: 'Top 20',
      name: 'NAME',
      lvl: 'LVL',
      score: 'SCORE',
      time: 'TIME',
      loading: 'loading...',
      noRecords: 'No records yet.',
      deleteConfirm: 'Delete this leaderboard entry?',
      topRanked: 'Top Ranked',
      noRankedRunsYet: 'no ranked runs yet.',
      agentStats: 'Agent Stats',
      callsignPlaceholder: 'callsign...',
      scan: 'SCAN',
      scanning: 'scanning...',
      enterCallsignHint: 'Enter a callsign to see lifetime stats.',
      recentActivity: 'Recent Activity',
      noRunsYet: 'no runs yet.',
    },
  },
  ru: {
    appName: 'Sappers Arena',
    tagline: '// нейро сапёр',
    tabs: { campaign: 'КАМПАНИЯ', battles: 'БИТВЫ', custom: 'СВОЯ', shop: 'МАГАЗИН', leaderboard: 'ЛИДЕРЫ', profile: 'ПРОФИЛЬ', friends: 'ДРУЗЬЯ' },
    common: {
      login: 'ВОЙТИ', register: 'РЕГИСТРАЦИЯ', logout: 'ВЫЙТИ · СМЕНИТЬ АККАУНТ',
      coins: 'МОНЕТЫ', rating: 'РЕЙТИНГ', play: 'ИГРАТЬ', cancel: 'ОТМЕНА', close: 'ЗАКРЫТЬ',
      remaining: 'ЖИЗНЕЙ', findOpponent: 'НАЙТИ СОПЕРНИКА', createLobby: 'СОЗДАТЬ ЛОББИ',
      joinLobby: 'ВСТУПИТЬ', friends: 'ДРУЗЬЯ', search: 'ПОИСК',
      settings: 'НАСТРОЙКИ', language: 'ЯЗЫК', exit: 'ВЫХОД',
      continue: 'ПРОДОЛЖИТЬ',
      back: 'НАЗАД',
      copy: 'КОПИРОВАТЬ',
      or: 'ИЛИ',
      vs: 'ПРОТИВ',
      admin: 'АДМИН',
      yes: 'ДА',
      no: 'НЕТ',
    },
    settings: {
      sound: 'ЗВУК',
    },
    onboarding: {
      label: 'обучение',
      stepLabel: 'ШАГ',
      skip: 'ПРОПУСТИТЬ',
      next: 'ДАЛЕЕ',
      done: 'ГОТОВО',
      welcomeTitle: 'ДОБРО ПОЖАЛОВАТЬ В SAPPERS ARENA',
      welcomeBody: 'Быстрое обучение на 30 секунд. Можно пропустить и сразу играть.',
      livesTitle: 'ЖИЗНИ',
      livesBody: 'У вас есть несколько жизней. Попадание на мину забирает 1 жизнь. Игра заканчивается, когда жизни = 0.',
      flagsTitle: 'ФЛАГИ',
      flagsBody: 'Ставьте флаги, чтобы отмечать мины. Правильные флаги помогают играть быстрее и безопаснее.',
      duelsTitle: 'ДУЭЛИ',
      duelsBody: 'В битвах цель — пройти больше и сохранить больше жизней, чем соперник. Скорость важна.',
    },
    daily: {
      title: 'ДЕЙЛИКИ',
      subtitle: 'ЕЖЕДНЕВНЫЕ ЗАДАНИЯ',
      coins: 'МОНЕТЫ',
      coinsShort: 'м',
      resetIn: 'СБРОС ЧЕРЕЗ',
      claimed: 'ЗАБРАНО',
      claim: 'ЗАБРАТЬ',
      quests: {
        play_1: 'Сыграть 1 игру',
        play_3: 'Сыграть 3 игры',
        win_1: 'Выиграть 1 раз',
        win_3: 'Выиграть 3 раза',
        lose_1: 'Проиграть 1 раз',
        lose_3: 'Проиграть 3 раза',
        flags_5: 'Поставить 5 флагов',
        flags_20: 'Поставить 20 флагов',
        flags_50: 'Поставить 50 флагов',
        safe_100: 'Открыть 100 безопасных',
        safe_250: 'Открыть 250 безопасных',
        time_300: 'Играть 5 минут (300с)',
        time_900: 'Играть 15 минут (900с)',
        fast_60: 'Победа быстрее 60с',
        fast_30: 'Победа быстрее 30с',
        no_flags: 'Победить без флагов',
        flawless: 'Победа без потери жизней',
        one_life: 'Победить с 1 жизнью',
        campaign_1: 'Пройти 1 уровень кампании',
        campaign_3: 'Пройти 3 уровня кампании',
      },
    },
    achievements: {
      title: 'ОЧИВКИ',
      unlocked: 'ОТКРЫТО',
      toast: 'ОЧИВКА ОТКРЫТА',
      more: 'ЕЩЁ',
      items: {
        games_1: { title: 'ПЕРВЫЕ ШАГИ', cond: 'Сыграть 1 игру', desc: 'Первый шаг сделан. Дальше — больше.' },
        games_10: { title: 'РАЗОГРЕВ', cond: 'Сыграть 10 игр', desc: 'Разогрелся. Теперь можно и на серьёзных.' },
        games_50: { title: 'РЕГУЛЯРНЫЙ', cond: 'Сыграть 50 игр', desc: 'Это уже привычка, да?' },
        games_200: { title: 'ВЕТЕРАН', cond: 'Сыграть 200 игр', desc: 'Видел всё. И мины, и боль.' },
        games_1000: { title: 'МАРАФОН', cond: 'Сыграть 1000 игр', desc: 'Ты здесь живёшь?' },
        wins_1: { title: 'ПЕРВАЯ ПОБЕДА', cond: 'Победить 1 раз', desc: 'Первая победа — самая сладкая.' },
        streak_3: { title: 'СЕРИЯ 3', cond: '3 победы подряд', desc: 'Пошла серия. Не останавливайся!' },
        streak_5: { title: 'СЕРИЯ 5', cond: '5 побед подряд', desc: 'Уверенно. Очень уверенно.' },
        streak_10: { title: 'СЕРИЯ 10', cond: '10 побед подряд', desc: 'Ты их вообще видишь насквозь?' },
        streak_100: { title: 'СЕРИЯ 100', cond: '100 побед подряд', desc: 'Стоп. Ты точно не бот?' },
        flawless_win: { title: 'БЕЗУПРЕЧНО', cond: 'Победа без потери жизней', desc: 'Чистая работа. Без царапин.' },
        speed_win_60: { title: 'БЫСТРЫЙ УМ', cond: 'Победа быстрее 60 сек', desc: 'Думал быстро — нажимал ещё быстрее.' },
        speed_win_30: { title: 'СПИДРАННЕР', cond: 'Победа быстрее 30 сек', desc: 'Где ты вообще нашёл время моргнуть?' },
        speed_win_20: { title: 'МОЛНИЯ', cond: 'Победа быстрее 20 сек', desc: 'Молния. Поле даже не поняло, что произошло.' },
        speed_win_10: { title: 'СУПЕРСКОРОСТЬ', cond: 'Победа быстрее 10 сек', desc: 'Легенда гласит: ты уже закончил до старта.' },
        flags_1: { title: 'ПЕРВЫЙ ФЛАГ', cond: 'Поставить 1 флаг', desc: 'Первый флажок. Начинается паранойя.' },
        flags_100: { title: 'МАСТЕР ФЛАГОВ', cond: 'Поставить 100 флагов', desc: 'Ты ставишь метки как профессионал.' },
        flags_1000: { title: 'ЛЕГЕНДА ФЛАГОВ', cond: 'Поставить 1000 флагов', desc: 'Флагов больше, чем сомнений. Почти.' },
        precise_all_mines: { title: 'ТОЧНО', cond: 'Победить, отметив все мины флагами', desc: 'Идеально по учебнику. Минёрам бы понравилось.' },
        no_flags_win: { title: 'БЕЗ ФЛАГОВ', cond: 'Победить без флагов', desc: 'На чистой интуиции. Или на безумии.' },
        campaign_1: { title: 'СТАРТ КАМПАНИИ', cond: 'Пройти 1 уровень кампании', desc: 'Глава 1: «А что тут сложного?»' },
        campaign_10: { title: 'КАМПАНИЯ 10', cond: 'Пройти 10 уровней кампании', desc: 'Уже втянулся. Отступать поздно.' },
        campaign_half: { title: 'ПОЛОВИНА', cond: 'Дойти до половины кампании', desc: 'Экватор пройден. Теперь будет жарче.' },
        campaign_complete: { title: 'ФИНАЛ', cond: 'Пройти всю кампанию', desc: 'Финал. И ты выжил. Как?' },
        hard_lesson: { title: 'ТЯЖЁЛЫЙ УРОК', cond: 'Пройти кампанию 150+ с 1 жизнью', desc: 'Одна ошибка — и бах. Но ты выжил.' },
        duels_1: { title: 'ПЕРВАЯ ДУЭЛЬ', cond: 'Сыграть 1 дуэль', desc: 'Добро пожаловать в настоящую мясорубку.' },
        duel_wins_1: { title: 'ПОБЕДИТЕЛЬ ДУЭЛИ', cond: 'Выиграть 1 дуэль', desc: 'Первая победа всегда приятна.' },
        ranked_10: { title: 'ГОТОВ К РЕЙТИНГУ', cond: 'Сыграть 10 ranked', desc: 'Рейтинг — это боль, но ты привык.' },
        duel_wins_10: { title: 'СОПЕРНИК', cond: 'Выиграть 10 дуэлей', desc: 'Тебя уже запомнили. И боятся.' },
        duel_wins_50: { title: 'НЕМЕЗИДА', cond: 'Выиграть 50 дуэлей', desc: 'Если ты в лобби — кто-то уже нервничает.' },
        comeback_1hp: { title: 'КАМБЭК', cond: 'Победить с 1 жизнью', desc: 'На волоске. Но всё равно победа.' },
        duel_streak_5: { title: 'НЕОСТАНОВИМ', cond: '5 побед подряд в дуэлях', desc: 'Остановить тебя некому. Пока что.' },
        rating_600: { title: 'РОСТ', cond: 'Достичь рейтинга 600', desc: 'Пошёл рост. Дальше — выше.' },
        rating_1000: { title: 'УМЕЛЫЙ', cond: 'Достичь рейтинга 1000', desc: 'Уже не новичок. Совсем.' },
        rating_5000: { title: 'ПРО', cond: 'Достичь рейтинга 5000', desc: 'Профи. Без вопросов.' },
        rating_10000: { title: 'ЭЛИТА', cond: 'Достичь рейтинга 10000', desc: 'Элита. Туда просто так не попадают.' },
        rating_15000: { title: 'ЛЕГЕНДА', cond: 'Достичь рейтинга 15000', desc: 'Легенда. Живая. Опасная.' },
        coins_balance_10000: { title: 'ПОСЛЕДНИЕ ДЕНЬГИ', cond: 'Иметь 10000 монет на балансе', desc: 'Ты долго копил? Или просто не тратил?' },
        coins_earned_total_10000: { title: 'БОГАТЫЙ', cond: 'Заработать 10000 монет суммарно', desc: 'Неплохо поднялся.' },

        collect_mines_all: { title: 'КОЛЛЕКЦИОНЕР МИН', cond: 'Собрать все скины мин', desc: 'Собери все скины мин в магазине.' },
        collect_cells_all: { title: 'КОЛЛЕКЦИОНЕР КЛЕТОК', cond: 'Собрать все скины клеток', desc: 'Собери все скины клеток в магазине.' },
        collect_fx_all: { title: 'КОЛЛЕКЦИОНЕР ЭФФЕКТОВ', cond: 'Собрать все эффекты взрыва', desc: 'Собери все эффекты взрыва в магазине.' },
        collect_flags_all: { title: 'КОЛЛЕКЦИОНЕР ФЛАЖКОВ', cond: 'Собрать все скины флажков', desc: 'Собери все скины флажков в магазине.' },
        collect_shop_all: { title: 'ИСТИННЫЙ КОЛЛЕКЦИОНЕР', cond: 'Собрать все предметы', desc: 'Собери все предметы в магазине.' },

        daily_claim_1: { title: 'СБОРЩИК', cond: 'Забрать 1 дейлик', desc: 'Забрать награду — святое.' },
        daily_streak_5: { title: 'СЕРИЯ ДЕЙЛИКОВ', cond: 'Забрать дейлики в 5 окнах подряд', desc: 'Дисциплина. Железная. Почти.' },
      },
    },
    auth: {
      identifyTitle: 'ИДЕНТИФИКАЦИЯ',
      accessTitle: 'ДОСТУП',
      identifyHint: 'Создай свою личность в сети.',
      accessHint: 'Войди под существующим позывным.',
      callsignLabel: 'Позывной · 3–20',
      callsignPlaceholder: 'ВАШ_НИК',
      passwordLabel: 'Пароль · минимум 4',
      passwordPlaceholder: '••••••',
      callsignAvailable: 'Позывной свободен.',
      adminSlot: 'СЛОТ АДМИНА',
      alreadyTaken: 'Уже занят.',
      connecting: 'ПОДКЛЮЧЕНИЕ...',
      passwordRequiredHint: 'Пароль обязателен. Потом можно сменить в профиле.',
      forgotPasswordHint: 'Забыли пароль? Спросите админа.',
      failedTryAgain: 'Ошибка. Попробй ещё раз.',
    },
    lobbyFriend: {
      title: 'ИГРАТЬ С ДРУГОМ',
      hint: 'Создай приватное лобби и отправь код, или войди по коду.',
      codeLabel: 'Код лобби · 6 символов',
      codePlaceholder: 'XXXXXX',
      shareCode: 'ПОДЕЛИТЬСЯ КОДОМ',
      host: 'ХОСТ',
      guest: 'ГОСТЬ',
      waiting: 'ожидание',
      startNow: 'НАЧАТЬ',
      waitingForHost: 'Ждём пока хост начнёт...',
      createFailed: 'Не удалось создать.',
      joinFailed: 'Не удалось войти.',
      startFailed: 'Не удалось начать.',
    },
    game: {
      defaultLabel: 'MINE.GRID',
      minesLower: 'мин',
      livesLower: 'жизней',
      controlsHint: '// ЛКМ открыть  ·  ПКМ флаг  ·  первый клик безопасен',
      time: 'ВРЕМЯ',
      mines: 'МИНЫ',
      score: 'СЧЁТ',
      lives: 'ЖИЗНИ',
      flag: 'ФЛАГ',
      reset: 'СБРОС',
      victory: 'ПОБЕДА',
      systemBreach: 'ПРОВАЛ',
      cleared: 'пройдено',
      terminated: 'остановлено',
      bounty: 'Награда',
      adminNoSubmit: '∞ режим админа — результат не отправляется',
      uploading: 'отправка...',
      queued: 'в очереди...',
      scoreUploaded: '✓ результат отправлен',
      win: 'победа',
      loss: 'поражение',
      duelResult: 'РЕЗУЛЬТАТ ДУЭЛИ',
      you: 'ТЫ',
      rival: 'СОПЕРНИК',
      youWinDuel: '🏆 ТЫ ВЫИГРАЛ ДУЭЛЬ',
      defeated: 'ПОРАЖЕНИЕ',
      tie: 'НИЧЬЯ',
      replay: 'ПОВТОР',
      playAgain: 'ИГРАТЬ СНОВА',
      youWon: 'ТЫ ВЫИГРАЛ',
      youLost: 'ТЫ ПРОИГРАЛ',
    },
    profile: {
      inventory: 'ИНВЕНТАРЬ',
      changePassword: 'СМЕНИТЬ ПАРОЛЬ',
      account: 'АККАУНТ',
      lifetimeStats: 'СТАТИСТИКА',
      offline: 'офлайн',
      loading: 'загрузка...',
      playerId: 'ID',
      oldPassword: 'Старый пароль',
      newPassword: 'Новый пароль · минимум 4',
      repeatNewPassword: 'Повторите новый пароль',
      passwordsDoNotMatch: 'Пароли не совпадают.',
      passwordUpdated: 'Пароль обновлён.',
      updating: 'ОБНОВЛЕНИЕ...',
      update: 'ОБНОВИТЬ',
      failed: 'Не удалось.',
    },
    stats: {
      runs: 'ИГР', wins: 'ПОБЕД', losses: 'ПОРАЖ', winRate: 'ВИНРЕЙТ',
      campaign: 'КАМПАНИЯ', battles: 'БИТВЫ', bestScore: 'ЛУЧШИЙ СЧЁТ', bestTime: 'ЛУЧШЕЕ ВРЕМЯ',
    },
    admin: { title: 'ВЛАДЕЛЕЦ', promote: 'СДЕЛАТЬ ВЛАДЕЛЬЦЕМ', grantBtn: 'ВЫДАТЬ',
      promoteHelp: 'Введите позывной игрока, которому выдать права админа.',
      promoted: 'повышен.',
      processing: 'ОБРАБОТКА...',
      panelTitle: 'Панель админа',
      panelHint: 'Нажми на корзину рядом с записью в таблице, чтобы удалить её.',
    },
    friends: { title: 'ДРУЗЬЯ', searchPlaceholder: 'Введите ник...', noResult: 'Игрок не найден.', blurb: 'Ищите игроков и смотрите их статистику.' },
    pause: { title: 'ПАУЗА', exitGame: 'ВЫЙТИ ИЗ ИГРЫ' },
    shop: {
      title: 'МАГАЗИН',
      blurb: 'Зарабатывайте монеты в кампании. Тратьте их на иконки бомб, темы клеток и эффекты взрыва.',
      coins: 'МОНЕТЫ',
      loading: 'загрузка каталога...',
      groups: { mine: 'ИКОНКИ МИН', cell: 'ТЕМЫ КЛЕТОК', explosion: 'ЭФФЕКТЫ ВЗРЫВА', flag: 'ФЛАГИ', cursor: 'КУРСОРЫ' },
      notEnoughCoins: 'Недостаточно монет.',
      acquired: 'Получено · {id}',
      equippedMsg: 'Надето · {id}',
      purchaseFailed: 'Покупка не удалась.',
      defaultBomb: 'Бомба (по умолчанию)',
      defaultCell: 'Сетка циан (по умолчанию)',
      defaultFx: 'Красная вспышка (по умолчанию)',
      defaultFlag: 'Золотой флажок (по умолчанию)',
      defaultCursor: 'Курсор (по умолчанию)',
      free: 'БЕСПЛАТНО',
      equip: 'НАДЕТЬ',
      equipped: 'НАДЕТО',
      buy: 'КУПИТЬ',
      buying: 'ПОКУПКА...',
      items: {
        mine_default: 'Бомба',
        mine_skull: 'Череп',
        mine_zap: 'Разряд',
        mine_cat: 'Фантомный кот',
        mine_ghost: 'Призрак',
        mine_flame: 'Пламя',
        mine_radiation: 'Радиация',
        mine_biohazard: 'Биоопасность',
        mine_crown: 'Корона',
        mine_gem: 'Самоцвет',

        cell_default: 'Сетка циан',
        cell_gold: 'Золотая сетка',
        cell_gold_premium: 'Чистое золото',
        cell_silver: 'Серебро',
        cell_ice_premium: 'Премиум лёд',
        cell_fire_premium: 'Премиум пламя',
        cell_coral: 'Коралловая сетка',
        cell_ice: 'Лёд',
        cell_retro: 'Ретро зелёный',
        cell_plasma: 'Плазма',
        cell_aurora: 'Аврора',
        cell_sunset: 'Закат',
        cell_violet: 'Фиолетовый',
        cell_mono: 'Монохром',
        cell_rainbow_premium: 'Радужный',

        fx_default: 'Красная вспышка',
        fx_gold: 'Золотой взрыв',
        fx_gold_premium: 'Жидкое золото',
        fx_silver: 'Серебряный взрыв',
        fx_ice_premium: 'Премиум лёд',
        fx_fire_premium: 'Премиум пламя',
        fx_rainbow: 'Радуга',
        fx_rainbow_premium: 'Радуга',
        fx_shockwave: 'Ударная волна',
        fx_void: 'Пустота',
        fx_lime: 'Лаймовый взрыв',
        fx_ultraviolet: 'Ультрафиолет',
        fx_ember: 'Угли',
        fx_aurora: 'Волна авроры',

        flag_default: 'Золотой флажок',
        flag_gold: 'Золотой флажок',
        flag_cyan: 'Циан флажок',
        flag_coral: 'Коралловый флажок',
        flag_ice: 'Ледяной флажок',
        flag_lime: 'Лаймовый флажок',
        flag_violet: 'Фиолетовый флажок',
        flag_silver: 'Серебряный флажок',
        flag_mono: 'Моно флажок',
        flag_rainbow: 'Радужный флажок',
      },
    },
    inventory: {
      title: 'ИНВЕНТАРЬ',
      buyInShop: 'КУПИ В МАГАЗИНЕ',
      tabs: {
        bombs: 'БОМБЫ',
        explosions: 'ВЗРЫВЫ',
        flags: 'ФЛАГИ',
        cursors: 'КУРСОРЫ',
        themes: 'ТЕМЫ',
      },
    },
    battles: {
      title: 'БИТВЫ',
      blurb: 'Ищите соперников в реальном времени. Одинаковое поле — кто быстрее очистит, тот и победил.',
      simpleTitle: 'ПРОСТАЯ БИТВА',
      simpleSubtitle: 'Казуально · Без рейтинга',
      rankedTitle: 'РЕЙТИНГОВАЯ БИТВА',
      rankedSubtitle: 'Соревнование · ELO',
      searching: 'ПОИСК СОПЕРНИКА...',
      found: 'СОПЕРНИК НАЙДЕН',
      code: 'КОД',
      host: 'ХОСТ',
      opponent: 'СОПЕРНИК',
      waiting: 'ожидание...',
      startNow: 'НАЧАТЬ',
      cancel: 'ОТМЕНА',
      findOpponent: 'НАЙТИ СОПЕРНИКА',
      yourRating: 'ВАШ РЕЙТИНГ',
      field: 'ПОЛЕ',
      mines: 'МИНЫ',
      lives: 'ЖИЗНИ',
    },
    custom: {
      title: 'СВОЯ',
      blurb: 'Настройте поле и скины. Играйте соло или с другом по коду.',
      rows: 'РЯДЫ',
      cols: 'КОЛОНКИ',
      mines: 'МИНЫ',
      lives: 'ЖИЗНИ',
      presets: 'пресеты',
      mineCapTitle: 'ЛИМИТ МИН.',
      mineCapBody: 'Плотность ограничена ~60%.',
      solo: 'СОЛО',
      withFriend: 'ИГРАТЬ С ДРУГОМ',
      configPreview: 'превью',
      estChallenge: 'сложность',
      cells: 'КЛЕТКИ',
      safe: 'БЕЗОПАС',
      density: 'ПЛОТНОСТЬ',
      fxSkins: 'ЭФФЕКТЫ И СКИНЫ',
      modsTitle: 'ДОП. РЕЖИМЫ',
      modNarc: 'НАРКОМАНИЯ',
      modRandom: 'НАУГАД',
      modNoFlags: 'БЕЗ ФЛАГОВ',
      diff: { easy: 'ЛЕГКО', normal: 'НОРМ', hard: 'СЛОЖНО', insane: 'АД' },
      skin: { mine: 'МИНЫ', cell: 'КЛЕТКИ', fx: 'FX', flag: 'ФЛАГИ', cursor: 'КУРСОР' },
      lockedTooltip: 'Закрыто — купи в магазине',
    },
    campaign: {
      title: 'ПУТЬ',
      blurb: '{n} узлов на извилистом пути. Прокручивай колёсиком или тяни мышью.',
      infinityOn: 'БЕСКОНЕЧНО',
      infinityOff: 'ОГРАНИЧЕНО',
      cleared: 'ПРОЙДЕНО',
      stars: 'ЗВЁЗДЫ',
      start: 'СТАРТ',
    },
    leaderboard: {
      title: 'ЛИДЕРБОРД',
      top: 'Топ 20',
      name: 'ИМЯ',
      lvl: 'УР',
      score: 'СЧЁТ',
      time: 'ВРЕМЯ',
      loading: 'загрузка...',
      noRecords: 'Пока нет рекордов.',
      deleteConfirm: 'Удалить эту запись из лидерборда?',
      topRanked: 'Топ рейтинга',
      noRankedRunsYet: 'пока нет рейтинговых игр.',
      agentStats: 'Статистика игрока',
      callsignPlaceholder: 'позывной...',
      scan: 'ПРОВЕРИТЬ',
      scanning: 'проверка...',
      enterCallsignHint: 'Введи позывной, чтобы увидеть статистику.',
      recentActivity: 'Недавняя активность',
      noRunsYet: 'пока нет игр.',
    },
    daily: {
      title: 'ДЕЙЛИКИ',
      subtitle: 'ЕЖЕДНЕВНЫЕ ЗАДАНИЯ',
      coins: 'МОНЕТЫ',
      coinsShort: 'монет',
      resetIn: 'ДО СБРОСА',
      claim: 'ЗАБРАТЬ',
      claimed: 'ЗАБРАНО',
      inProgress: 'В ПРОЦЕССЕ',
      quests: {
        play_1: 'Сыграть 1 игру',
        win_1: 'Выиграть 1 игру',
        flags_10: 'Поставить 10 флагов',
        safe_50: 'Открыть 50 безопасных клеток',
      },
    },
  },
  uk: {
    appName: 'Sappers Arena',
    tagline: '// нейро сапер',
    tabs: { campaign: 'КАМПАНІЯ', battles: 'БИТВИ', custom: 'СВІЙ РЕЖИМ', shop: 'МАГАЗИН', leaderboard: 'ЛІДЕРИ', profile: 'ПРОФІЛЬ', friends: 'ДРУЗІ' },
    common: {
      login: 'УВІЙТИ', register: 'РЕЄСТРАЦІЯ', logout: 'ВИЙТИ · ЗМІНИТИ АКАУНТ',
      coins: 'МОНЕТИ', rating: 'РЕЙТИНГ', play: 'ГРАТИ', cancel: 'СКАСУВАТИ', close: 'ЗАКРИТИ',
      remaining: 'ЖИТТЯ', findOpponent: 'ЗНАЙТИ СУПЕРНИКА', createLobby: 'СТВОРИТИ ЛОБІ',
      joinLobby: 'ПРИЄДНАТИСЯ', friends: 'ДРУЗІ', search: 'ПОШУК',
      settings: 'НАЛАШТУВАННЯ', language: 'МОВА', exit: 'ВИХІД',
      continue: 'ПРОДОВЖИТИ',
      back: 'НАЗАД',
      copy: 'КОПІЮВАТИ',
      or: 'АБО',
      vs: 'ПРОТИ',
      admin: 'АДМІН',
      yes: 'ТАК',
      no: 'НІ',
    },
    settings: {
      sound: 'ЗВУК',
    },
    onboarding: {
      label: 'навчання',
      stepLabel: 'КРОК',
      skip: 'ПРОПУСТИТИ',
      next: 'ДАЛІ',
      done: 'ГОТОВО',
      welcomeTitle: 'ЛАСКАВО ПРОСИМО ДО SAPPERS ARENA',
      welcomeBody: 'Короткий туторіал на 30 секунд. Можна пропустити і одразу почати гру.',
      livesTitle: 'ЖИТТЯ',
      livesBody: 'У тебе є кілька життів. Міна забирає 1 життя. Гра закінчується, коли життя закінчуються.',
      flagsTitle: 'ПРАПОРЦІ',
      flagsBody: 'Прапорці допомагають позначати міни. Правильні прапорці роблять гру швидшою і безпечнішою.',
      duelsTitle: 'ДУЕЛІ',
      duelsBody: 'У битвах мета — завершити з більшим прогресом (і життями), ніж суперник. Швидкість важлива.',
    },
    daily: {
      title: 'ДЕЙЛІКИ',
      subtitle: 'ЩОДЕННІ ЗАВДАННЯ',
      coins: 'МОНЕТИ',
      coinsShort: 'м',
      resetIn: 'СКИДАННЯ ЧЕРЕЗ',
      claimed: 'ЗАБРАНО',
      claim: 'ЗАБРАТИ',
      quests: {
        play_1: 'Зіграти 1 гру',
        play_3: 'Зіграти 3 гри',
        win_1: 'Виграти 1 гру',
        win_3: 'Виграти 3 гри',
        lose_1: 'Програти 1 раз',
        lose_3: 'Програти 3 рази',
        flags_5: 'Поставити 5 прапорців',
        flags_20: 'Поставити 20 прапорців',
        flags_50: 'Поставити 50 прапорців',
        safe_100: 'Відкрити 100 безпечних',
        safe_250: 'Відкрити 250 безпечних',
        time_300: 'Грати 5 хв (300с)',
        time_900: 'Грати 15 хв (900с)',
        fast_60: 'Перемога швидше 60с',
        fast_30: 'Перемога швидше 30с',
        no_flags: 'Перемогти без прапорців',
        flawless: 'Перемога без втрати життів',
        one_life: 'Перемогти з 1 життям',
        campaign_1: 'Пройти 1 рівень кампанії',
        campaign_3: 'Пройти 3 рівні кампанії',
      },
    },
    achievements: {
      title: 'ДОСЯГНЕННЯ',
      unlocked: 'ОТКРИТО',
      toast: 'ДОСЯГНЕННЯ ОТКРИТО',
      more: 'ЩЕ',
      items: {
        games_1: { title: 'ПЕРШІ КРОКИ', cond: 'Зіграти 1 гру', desc: 'Перший крок зроблено. Далі — більше.' },
        games_10: { title: 'РОЗІГРІВ', cond: 'Зіграти 10 ігор', desc: 'Розігрівся. Тепер серйозно.' },
        games_50: { title: 'ПОСТІЙНИЙ', cond: 'Зіграти 50 ігор', desc: 'Це вже звичка, так?' },
        games_200: { title: 'ВЕТЕРАН', cond: 'Зіграти 200 ігор', desc: 'Видав усе. І міни, і біль.' },
        games_1000: { title: 'МАРАФОН', cond: 'Зіграти 1000 ігор', desc: 'Ти тут живеш?' },
        wins_1: { title: 'ПЕРША ПЕРЕМОГА', cond: 'Виграти 1 раз', desc: 'Перша перемога — найсолодша.' },
        streak_3: { title: 'СЕРІЯ 3', cond: '3 перемоги поспіль', desc: 'Пішла серія. Не зупиняйся!' },
        streak_5: { title: 'СЕРІЯ 5', cond: '5 перемог поспіль', desc: 'Впевнено. Дуже впевнено.' },
        streak_10: { title: 'СЕРІЯ 10', cond: '10 перемог поспіль', desc: 'Ти читаєш поле наскрізь?' },
        streak_100: { title: 'СЕРІЯ 100', cond: '100 перемог поспіль', desc: 'Стоп. Ти точно не бот?' },
        flawless_win: { title: 'БЕЗДОГАННО', cond: 'Перемога без втрати життів', desc: 'Чиста робота. Без подряпин.' },
        speed_win_60: { title: 'ШВИДКИЙ РОЗУМ', cond: 'Перемога швидше 60 с', desc: 'Думав швидко — натискав ще швидше.' },
        speed_win_30: { title: 'СПІДРАННЕР', cond: 'Перемога швидше 30 с', desc: 'Где ти взагалі кліпав?' },
        speed_win_20: { title: 'БЛИСКАВКА', cond: 'Перемога швидше 20 с', desc: 'Блискавка. І все.' },
        speed_win_10: { title: 'СУПЕРШВИДКІСТЬ', cond: 'Перемога швидше 10 с', desc: 'Закінчив ще до старту.' },
        flags_1: { title: 'ПЕРШИЙ ПРАПОРЕЦЬ', cond: 'Поставити 1 прапорець', desc: 'Перший прапорець. Починається параноя.' },
        flags_100: { title: 'МАЙСТЕР ПРАПОРЦІВ', cond: 'Поставити 100 прапорців', desc: 'Позначаєш як профі.' },
        flags_1000: { title: 'ЛЕГЕНДА ПРАПОРЦІВ', cond: 'Поставити 1000 прапорців', desc: 'Прапорців більше, ніж сумнівів. Майже.' },
        precise_all_mines: { title: 'ТОЧНО', cond: 'Перемогти, позначивши всі міни', desc: 'Ідеально за підручником.' },
        no_flags_win: { title: 'БЕЗ ПРАПОРЦІВ', cond: 'Перемогти без прапорців', desc: 'На чистій інтуїції. І або безумстві.' },
        campaign_1: { title: 'СТАРТ КАМПАНІЇ', cond: 'Пройти 1 рівень кампанії', desc: 'Розділ 1: «Та що тут складного?»' },
        campaign_10: { title: 'КАМПАНІЯ 10', cond: 'Пройти 10 рівнів кампанії', desc: 'Уже втягнувся. Назад дороги немає.' },
        campaign_half: { title: 'ПОЛОВИНА', cond: 'Дійти до половини кампанії', desc: 'Екватор пройдено. Далі буде жаркіше.' },
        campaign_complete: { title: 'ФІНАЛ', cond: 'Пройти всю кампанію', desc: 'Кінець. І ти вижив. Як?' },
        hard_lesson: { title: 'ВАЖКИЙ УРОК', cond: 'Пройти кампанію 150+ з 1 життям', desc: 'Одна помилка і… бум!' },
        duels_1: { title: 'ПЕРША ДУЕЛЬ', cond: 'Зіграти 1 дуель', desc: 'Ласкаво просимо до справжньої бійки.' },
        duel_wins_1: { title: 'ПЕРЕМОЖЕЦЬ ДУЕЛІ', cond: 'Виграти 1 дуель', desc: 'Перший раз завжди приємно)' },
        ranked_10: { title: 'ГОТОВИЙ ДО РЕЙТИНГУ', cond: 'Зіграти 10 ranked', desc: 'Рейтинг — це біль. Ти звик.' },
        duel_wins_10: { title: 'СОПЕРНИК', cond: 'Виграти 10 дуелів', desc: 'Тебе запам’ятали. І бояться.' },
        duel_wins_50: { title: 'НЕМЕЗИДА', cond: 'Виграти 50 дуелів', desc: 'Якщо ти в лобі — хтось нервує.' },
        comeback_1hp: { title: 'КАМБЕК', cond: 'Перемогти з 1 життям', desc: 'На межі. Але перемога.' },
        duel_streak_5: { title: 'НЕЗУПИННИЙ', cond: '5 перемог поспіль у дуелях', desc: 'Зупинити тебе нікому. Поки що.' },
        rating_600: { title: 'РОЗВИТОК', cond: 'Досягти рейтингу 600', desc: 'Пішов ріст. Далі — вище.' },
        rating_1000: { title: 'ВМІЛИЙ', cond: 'Досягти рейтингу 1000', desc: 'Вже не новачок.' },
        rating_5000: { title: 'ПРО', cond: 'Досягти рейтингу 5000', desc: 'Профі. Без питань.' },
        rating_10000: { title: 'ЕЛІТА', cond: 'Досягти рейтингу 10000', desc: 'Туди просто так не потрапляють.' },
        rating_15000: { title: 'ЛЕГЕНДА', cond: 'Досягти рейтингу 15000', desc: 'Справжня легенда.' },
        coins_balance_10000: { title: 'ОСТАННІ ГРОШІ', cond: 'Мати 10000 монет на балансі', desc: 'Довго копив? Чи просто не витрачав?' },
        coins_earned_total_10000: { title: 'БАГАТИЙ', cond: 'Заробити 10000 монет сумарно', desc: 'Непогано піднявся.' },
        daily_claim_1: { title: 'ЗБИРАЧ', cond: 'Забрати 1 дейлік', desc: 'Забрати нагороду — святе.' },
        daily_streak_5: { title: 'СЕРІЯ ДЕЙЛІКІВ', cond: 'Забрати дейліки в 5 вікнах поспіль', desc: 'Дисципліна. Залізна.' },
      },
    },
    auth: {
      identifyTitle: 'ІДЕНТИФІКАЦІЯ',
      accessTitle: 'ДОСТУП',
      identifyHint: 'Створи свій позивний.',
      accessHint: 'Вийди з існуючим позивним.',
      callsignLabel: 'Позивний · 3–20 символів',
      callsignPlaceholder: 'ТВІЙ_НІК',
      passwordLabel: 'Пароль · мінімум 4 символи',
      passwordPlaceholder: '••••••',
      callsignAvailable: 'Позивний вільний.',
      adminSlot: 'АДМІН',
      alreadyTaken: 'Вже зайнятий.',
      connecting: 'ПІДКЛЮЧЕННЯ...',
      passwordRequiredHint: 'Пароль обов’язковий. Можна змінити пізніше в профілі.',
      forgotPasswordHint: 'Забув пароль? Пиши адміну.',
      failedTryAgain: 'Помилка. Спробуй ще раз.',
    },
    lobbyFriend: {
      title: 'ГРАТИ З ДРУГОМ',
      hint: 'Створи приватне лоббі та поділіться кодом, або приєднайся по коду.',
      codeLabel: 'Код лоббі · 6 символів',
      codePlaceholder: 'XXXXXX',
      shareCode: 'ПОДІЛИТИСЯ КОДОМ',
      host: 'ХОСТ',
      guest: 'ГОСТЬ',
      waiting: 'очікування',
      startNow: 'ПОЧАТИ',
      waitingForHost: 'Чекаємо поки хост почне...',
      createFailed: 'Не вдалося створити.',
      joinFailed: 'Не вдалося приєднатись.',
      startFailed: 'Не вдалося почати.',
    },
    game: {
      defaultLabel: 'MINE.GRID',
      minesLower: 'мін',
      livesLower: 'життів',
      controlsHint: '// ЛКМ відкрити  ·  ПКМ прапорець  ·  перший клік безпечний',
      time: 'ЧАС',
      mines: 'МІНИ',
      score: 'РАХУНОК',
      lives: 'ЖИТТЯ',
      flag: 'ПРАПОРЕЦЬ',
      reset: 'СКИНУТИ',
      victory: 'ПЕРЕМОГА',
      systemBreach: 'ПРОЛАМАННЯ СИСТЕМИ',
      cleared: 'пройдено',
      terminated: 'зупинено',
      bounty: 'Нагорода',
      adminNoSubmit: '∞ режим адміна — результат не відправляється',
      uploading: 'відправка...',
      queued: 'у черзі...',
      scoreUploaded: '✓ результат відправлено',
      win: 'перемога',
      loss: 'поразка',
      duelResult: 'РЕЗУЛЬТАТ ДУЕЛІ',
      you: 'ТИ',
      rival: 'СОПЕРНИК',
      youWinDuel: '🏆 ТИ ВИГРАВ ДУЕЛЬ',
      defeated: 'ПОРАЗКА',
      tie: 'НІЧИЯ',
      replay: 'ПОВТОР',
      playAgain: 'ГРАТИ ЗНОВУ',
      youWon: 'ТИ ВИГРАВ',
      youLost: 'ТИ ПРОГРАВ',
    },
    profile: {
      inventory: 'ІНВЕНТАР',
      changePassword: 'ЗМІНИТИ ПАРОЛЬ',
      account: 'АКАУНТ',
      lifetimeStats: 'СТАТИСТИКА',
      offline: 'офлайн',
      loading: 'завантаження...',
      playerId: 'ID',
      oldPassword: 'Старий пароль',
      newPassword: 'Новий пароль · мінімум 4',
      repeatNewPassword: 'Повторіть новий пароль',
      passwordsDoNotMatch: 'Паролі не збігаються.',
      passwordUpdated: 'Пароль оновлено.',
      updating: 'ОНОВЛЕННЯ...',
      update: 'ОНОВИТИ',
      failed: 'Помилка.',
    },
    stats: {
      runs: 'ІГОР', wins: 'ПЕРЕМОГ', losses: 'ПОРАЗОК', winRate: 'ВІНРЕЙТ',
      campaign: 'КАМПАНІЯ', battles: 'БИТВИ', bestScore: 'НАЙКРАЩИЙ РАХУНОК', bestTime: 'НАЙКРАЩИЙ ЧАС',
    },
    admin: { title: 'ВЛАСНИК', promote: 'ПРИЗНАЧИТИ ВЛАСНИКОМ', grantBtn: 'НАДАТИ',
      promoteHelp: 'Введіть нік гравця, щоб надати права адміна.',
      promoted: 'призначено.',
      processing: 'ОБРОБКА...',
      panelTitle: 'Панель адміна',
      panelHint: 'Натисни на кошик рядом із записом, щоб видалити його.',
    },
    friends: { title: 'ДРУЗІ', searchPlaceholder: 'Пошук ніку...', noResult: 'Гравця не знайдено.', blurb: 'Шукайте гравців та переглядайте статистику.' },
    pause: { title: 'ПАУЗА', exitGame: 'ВИЙТИ З ГРИ' },
    shop: {
      title: 'МАГАЗИН',
      blurb: 'Заробляйте монети в кампанії та витрачайте їх на іконки, теми клітин і FX.',
      coins: 'МОНЕТИ',
      loading: 'завантаження каталогу...',
      groups: { mine: 'ІКОНКИ МІН', cell: 'ТЕМИ КЛІТИН', explosion: 'FX ВИБУХУ', flag: 'ПРАПОРЦІ', cursor: 'КУРСОРИ' },
      notEnoughCoins: 'Недостатньо монет.',
      acquired: 'Отримано · {id}',
      equippedMsg: 'Надягнено · {id}',
      purchaseFailed: 'Покупка не вдалася.',
      defaultBomb: 'Бомба (за замовчуванням)',
      defaultCell: 'Сітка циан (за замовчуванням)',
      defaultFx: 'Червоний спалах (за замовчуванням)',
      defaultFlag: 'Золотий прапорець (за замовчуванням)',
      defaultCursor: 'Курсор (за замовчуванням)',
      free: 'БЕЗКОШТОВНО',
      equip: 'НАДЯГНУТИ',
      equipped: 'НАДЯГНЕНО',
      buy: 'КУПИТИ',
      buying: 'КУПІВЛЯ...',
      items: {
        mine_default: 'Бомба',
        mine_skull: 'Череп',
        mine_zap: 'Розряд',
        mine_cat: 'Фантомний кіт',
        mine_ghost: 'Привид',
        mine_flame: 'Полум’я',
        mine_radiation: 'Радіація',
        mine_biohazard: 'Біонебезпека',
        mine_crown: 'Корона',
        mine_gem: 'Самоцвіт',

        cell_default: 'Сітка ціан',
        cell_gold: 'Золота сітка',
        cell_gold_premium: 'Чисте золото',
        cell_silver: 'Срібло',
        cell_ice_premium: 'Преміум лід',
        cell_fire_premium: 'Преміум полум’я',
        cell_coral: 'Коралова сітка',
        cell_ice: 'Лід',
        cell_retro: 'Ретро зелений',
        cell_plasma: 'Плазма',
        cell_aurora: 'Аврора',
        cell_sunset: 'Захід',
        cell_violet: 'Фіолетовий',
        cell_mono: 'Монохром',
        cell_rainbow_premium: 'Райдужний',

        fx_default: 'Червоний спалах',
        fx_gold: 'Золотий вибух',
        fx_gold_premium: 'Рідке золото',
        fx_silver: 'Срібний вибух',
        fx_ice_premium: 'Преміум лід',
        fx_fire_premium: 'Преміум полум’я',
        fx_rainbow: 'Райдуга',
        fx_rainbow_premium: 'Райдуга',
        fx_shockwave: 'Ударна хвиля',
        fx_void: 'Порожнеча',
        fx_lime: 'Лаймовий вибух',
        fx_ultraviolet: 'Ультрафіолет',
        fx_ember: 'Жар',
        fx_aurora: 'Хвиля аврори',

        flag_default: 'Золотий прапорець',
        flag_gold: 'Золотий прапорець',
        flag_cyan: 'Ціан прапорець',
        flag_coral: 'Кораловий прапорець',
        flag_ice: 'Крижаний прапорець',
        flag_lime: 'Лаймовий прапорець',
        flag_violet: 'Фіолетовий прапорець',
        flag_silver: 'Срібний прапорець',
        flag_mono: 'Моно прапорець',
        flag_rainbow: 'Райдужний прапорець',
      },
    },
    inventory: {
      title: 'ІНВЕНТАР',
      buyInShop: 'КУПИ В МАГАЗИНІ',
      tabs: {
        bombs: 'БОМБИ',
        explosions: 'ВИБУХИ',
        flags: 'ПРАПОРЦІ',
        cursors: 'КУРСОРИ',
        themes: 'ТЕМИ',
      },
    },
    battles: {
      title: 'БИТВИ',
      blurb: 'Шукайте суперників у реальному часі. Одинакове поле — хто швидше очистить, той і перемагає.',
      simpleTitle: 'ПРОСТА БИТВА',
      simpleSubtitle: 'Без рейтингу',
      rankedTitle: 'РЕЙТИНГОВА БИТВА',
      rankedSubtitle: 'ELO',
      searching: 'ПОШУК СУПЕРНИКА...',
      found: 'СОПЕРНИКА ЗНАЙДЕНО',
      code: 'КОД',
      host: 'ХОСТ',
      opponent: 'СОПЕРНИК',
      waiting: 'очікування...',
      startNow: 'ПОЧАТИ',
      cancel: 'СКАСУВАТИ',
      findOpponent: 'ЗНАЙТИ СУПЕРНИКА',
      yourRating: 'ВАШ РЕЙТИНГ',
      field: 'ПОЛЕ',
      mines: 'МІНИ',
      lives: 'ЖИТТЯ',
    },
    custom: {
      title: 'СВІЙ РЕЖИМ',
      blurb: 'Налаштуйте поле та скіни. Грайте соло або з другом по коду.',
      rows: 'РЯДИ',
      cols: 'КОЛОНКИ',
      mines: 'МІНИ',
      lives: 'ЖИТТЯ',
      presets: 'пресети',
      mineCapTitle: 'ЛІМІТ МІН.',
      mineCapBody: 'Щільність ~60%.',
      solo: 'СОЛО',
      withFriend: 'З ДРУГОМ',
      configPreview: 'превʼю',
      estChallenge: 'складність',
      cells: 'КЛІТИНИ',
      safe: 'БЕЗПЕЧНІ',
      density: 'ЩІЛЬНІСТЬ',
      fxSkins: 'ЕФЕКТИ ТА СКІНИ',
      modsTitle: 'ДОД. РЕЖИМИ',
      modNarc: 'НАРКОМАНІЯ',
      modRandom: 'НАВМАННЯ',
      modNoFlags: 'БЕЗ ПРАПОРЦІВ',
      diff: { easy: 'ЛЕГКО', normal: 'НОРМ', hard: 'ВАЖКО', insane: 'ПЕКЛО' },
      skin: { mine: 'МІНИ', cell: 'КЛІТИНИ', fx: 'FX', flag: 'ПРАПОРЦІ', cursor: 'КУРСОР' },
      lockedTooltip: 'Закрито — купи в МАГАЗИНІ',
    },
    campaign: {
      title: 'ШЛЯХ',
      blurb: '{n} вузлів на шляху. Колесо або перетягування.',
      infinityOn: 'НЕСКІНЧ',
      infinityOff: 'ЗВИЧ',
      cleared: 'ПРОЙДЕНО',
      stars: 'ЗІРКИ',
      start: 'СТАРТ',
    },
    leaderboard: {
      title: 'ЛІДЕРИ',
      top: 'Топ 20',
      name: 'ІМʼЯ',
      lvl: 'РІВ',
      score: 'БАЛИ',
      time: 'ЧАС',
      loading: 'завантаження...',
      noRecords: 'Записів ще немає.',
      deleteConfirm: 'Видалити запис?',
    },
    daily: {
      title: 'ДЕЙЛІКИ',
      subtitle: 'ЩОДЕННІ ЗАВДАННЯ',
      coins: 'МОНЕТИ',
      coinsShort: 'монет',
      resetIn: 'ДО СКИДАННЯ',
      claim: 'ЗАБРАТИ',
      claimed: 'ЗАБРАНО',
      inProgress: 'У ПРОЦЕСІ',
      quests: {
        play_1: 'Зіграти 1 гру',
        win_1: 'Виграти 1 гру',
        flags_10: 'Поставити 10 прапорців',
        safe_50: 'Відкрити 50 безпечних клітинок',
      },
    },
  },
  cs: {
    appName: 'Sappers Arena',
    tagline: '// neuronový minolovka',
    tabs: { campaign: 'KAMPAŇ', battles: 'SOUBOJE', custom: 'VLASTNÍ', shop: 'OBCHOD', leaderboard: 'ŽEBŘÍČEK', profile: 'PROFIL', friends: 'PŘÁTELÉ' },
    common: {
      login: 'PŘIHLÁSIT', register: 'REGISTRACE', logout: 'ODHLÁSIT · ZMĚNIT ÚČET',
      coins: 'MINCE', rating: 'HODNOCENÍ', play: 'HRÁT', cancel: 'ZRUŠIT', close: 'ZAVŘÍT',
      remaining: 'ŽIVOTY', findOpponent: 'NAJÍT SOUPEŘE', createLobby: 'VYTVOŘIT LOBBY',
      joinLobby: 'PŘIPOJIT', friends: 'PŘÁTELÉ', search: 'HLEDAT',
      settings: 'NASTAVENÍ', language: 'JAZYK', exit: 'KONEC',
      continue: 'POKRAČOVAT',
      back: 'ZPĚT',
      copy: 'KOPÍROVAT',
      or: 'NEBO',
      vs: 'VS',
      admin: 'ADMIN',
      yes: 'ANO',
      no: 'NE',
    },
    settings: {
      sound: 'ZVUK',
    },
    onboarding: {
      label: 'návod',
      stepLabel: 'KROK',
      skip: 'PŘESKOČIT',
      next: 'DALŠÍ',
      done: 'HOTOVO',
      welcomeTitle: 'VÍTEJ V SAPPERS ARENA',
      welcomeBody: 'Rychlý 30sekundový návod. Můžeš ho přeskočit a hned hrát.',
      livesTitle: 'ŽIVOTY',
      livesBody: 'Máš několik životů. Šlápnutí na minu tě stojí 1 život. Hra končí, když jsou životy 0.',
      flagsTitle: 'VLAJKY',
      flagsBody: 'Používej vlajky k označení min. Správné vlajky ti pomůžou hrát rychleji a bezpečněji.',
      duelsTitle: 'SOUBOJE',
      duelsBody: 'V bitvách je cíl dokončit s větším postupem (a více životy) než soupeř. Rychlost rozhoduje.',
    },
    daily: {
      title: 'DENNÍ',
      subtitle: 'DENNÍ ÚKOLY',
      coins: 'MINCE',
      coinsShort: 'm',
      resetIn: 'RESET ZA',
      claimed: 'VYZVEDNUTO',
      claim: 'VYZVEDNOUT',
      quests: {
        play_1: 'Zahraj 1 hru',
        play_3: 'Zahraj 3 hry',
        win_1: 'Vyhraj 1 hru',
        win_3: 'Vyhraj 3 hry',
        lose_1: 'Prohraj 1 hru',
        lose_3: 'Prohraj 3 hry',
        flags_5: 'Dej 5 vlajek',
        flags_20: 'Dej 20 vlajek',
        flags_50: 'Dej 50 vlajek',
        safe_100: 'Odkryj 100 bezpečných',
        safe_250: 'Odkryj 250 bezpečných',
        time_300: 'Hraj 5 minut (300s)',
        time_900: 'Hraj 15 minut (900s)',
        fast_60: 'Vyhraj pod 60s',
        fast_30: 'Vyhraj pod 30s',
        no_flags: 'Vyhraj bez vlajek',
        flawless: 'Vyhraj bez ztráty životů',
        one_life: 'Vyhraj s 1 životem',
        campaign_1: 'Vyhraj 1 úroveň kampaně',
        campaign_3: 'Vyhraj 3 úrovně kampaně',
      },
    },
    achievements: {
      title: 'ÚSPĚCHY',
      unlocked: 'ODEMČENO',
      toast: 'ÚSPĚCH ODEMČEN',
      more: 'DALŠÍ',
      items: {
        games_1: { title: 'PRVNÍ KROKY', cond: 'Zahraj 1 hru', desc: 'První krok je hotový.' },
        games_10: { title: 'ROZCVIČKA', cond: 'Zahraj 10 her', desc: 'Zahřáto. Teď vážně.' },
        games_50: { title: 'PRAVIDELNÝ', cond: 'Zahraj 50 her', desc: 'Už je to zvyk, co?' },
        games_200: { title: 'VETERÁN', cond: 'Zahraj 200 her', desc: 'Viděl jsi všechno.' },
        games_1000: { title: 'MARATON', cond: 'Zahraj 1000 her', desc: 'Ty tady bydlíš?' },
        wins_1: { title: 'PRVNÍ VÝHRA', cond: 'Vyhraj 1 hru', desc: 'První výhra je nejlepší.' },
        streak_3: { title: 'SÉRIE 3', cond: '3 výhry v řadě', desc: 'Série začíná.' },
        streak_5: { title: 'SÉRIE 5', cond: '5 výher v řadě', desc: 'To je jistota.' },
        streak_10: { title: 'SÉRIE 10', cond: '10 výher v řadě', desc: 'Čteš pole jako knihu.' },
        streak_100: { title: 'SÉRIE 100', cond: '100 výher v řadě', desc: 'Počkej… nejsi bot?' },
        flawless_win: { title: 'BEZCHYBNĚ', cond: 'Vyhraj bez ztráty životů', desc: 'Čistá práce.' },
        speed_win_60: { title: 'RYCHLÁ HLAVA', cond: 'Vyhraj pod 60 s', desc: 'Rychlé myšlení.' },
        speed_win_30: { title: 'SPEEDRUNNER', cond: 'Vyhraj pod 30 s', desc: 'Mrknul jsi vůbec?' },
        speed_win_20: { title: 'BLESK', cond: 'Vyhraj pod 20 s', desc: 'Bleskurychle.' },
        speed_win_10: { title: 'RAKETA', cond: 'Vyhraj pod 10 s', desc: 'Hotovo hned.' },
        flags_1: { title: 'PRVNÍ VLAJKA', cond: 'Dej 1 vlajku', desc: 'První vlajka. Začíná paranoia.' },
        flags_100: { title: 'MISTR VLAJEK', cond: 'Dej 100 vlajek celkem', desc: 'Značíš jako profík.' },
        flags_1000: { title: 'LEGENDA VLAJEK', cond: 'Dej 1000 vlajek celkem', desc: 'Vlajky všude.' },
        precise_all_mines: { title: 'PŘESNĚ', cond: 'Vyhraj s vlajkami na všech minách', desc: 'Učebnicové.' },
        no_flags_win: { title: 'BEZ VLAJEK', cond: 'Vyhraj bez vlajek', desc: 'Jen intuice.' },
        campaign_1: { title: 'START KAMPANĚ', cond: 'Vyhraj 1 úroveň kampaně', desc: 'Začátek cesty.' },
        campaign_10: { title: 'KAMPAŇ 10', cond: 'Vyhraj 10 úrovní kampaně', desc: 'Už jedeš.' },
        campaign_half: { title: 'POLOVINA', cond: 'Dostaň se do poloviny kampaně', desc: 'Polovina je za tebou.' },
        campaign_complete: { title: 'DOKONČENO', cond: 'Dokonči kampaň', desc: 'Konec. Přežil jsi.' },
        hard_lesson: { title: 'TVRDÁ LEKCE', cond: 'Vyhraj kampaň 150+ s 1 životem', desc: 'Jedna chyba a boom.' },
        duels_1: { title: 'PRVNÍ SOUBOJ', cond: 'Zahraj 1 duel', desc: 'Vítej v boji.' },
        duel_wins_1: { title: 'VÍTĚZ DUELU', cond: 'Vyhraj 1 duel', desc: 'Poprvé je to příjemné)' },
        ranked_10: { title: 'RANKED READY', cond: 'Zahraj 10 ranked', desc: 'Rating bolí. Zvykneš si.' },
        duel_wins_10: { title: 'RIVAL', cond: 'Vyhraj 10 duelů', desc: 'Už tě znají.' },
        duel_wins_50: { title: 'NEMESIS', cond: 'Vyhraj 50 duelů', desc: 'Někdo znervózní.' },
        comeback_1hp: { title: 'COMEBACK', cond: 'Vyhraj s 1 životem', desc: 'Těsně, ale win.' },
        duel_streak_5: { title: 'NEZASTAVITELNÝ', cond: '5 výher v duelu v řadě', desc: 'Zastavit tě nejde.' },
        rating_600: { title: 'RŮST', cond: 'Dosáhni rating 600', desc: 'Jde to nahoru.' },
        rating_1000: { title: 'SKILLED', cond: 'Dosáhni rating 1000', desc: 'Už nejsi nováček.' },
        rating_5000: { title: 'PRO', cond: 'Dosáhni rating 5000', desc: 'Profík.' },
        rating_10000: { title: 'ELITE', cond: 'Dosáhni rating 10000', desc: 'Elita.' },
        rating_15000: { title: 'LEGEND', cond: 'Dosáhni rating 15000', desc: 'Legenda.' },
        coins_balance_10000: { title: 'POSLEDNÍ PENÍZE', cond: 'Měj 10000 mincí na účtu', desc: 'Dlouho jsi šetřil?' },
        coins_earned_total_10000: { title: 'BOHATÝ', cond: 'Získej 10000 mincí celkem', desc: 'Slušný zisk.' },
        daily_claim_1: { title: 'DAILY CLAIMER', cond: 'Vyzvedni 1 daily', desc: 'Odměna je odměna.' },
        daily_streak_5: { title: 'DAILY SÉRIE', cond: 'Vyzvedni daily v 5 oknech po sobě', desc: 'Disciplína.' },
      },
    },
    auth: {
      identifyTitle: 'IDENTIFIKACE',
      accessTitle: 'PŘÍSTUP',
      identifyHint: 'Vytvoř si svou identitu v síti.',
      accessHint: 'Přihlas se existujícím volacím znakem.',
      callsignLabel: 'Volací znak · 3–20',
      callsignPlaceholder: 'TVÉ_JMÉNO',
      passwordLabel: 'Heslo · min 4',
      passwordPlaceholder: '••••••',
      callsignAvailable: 'Volací znak je volný.',
      adminSlot: 'ADMIN SLOT',
      alreadyTaken: 'Už je obsazeno.',
      connecting: 'PŘIPOJUJI...',
      passwordRequiredHint: 'Heslo je povinné. Později lze změnit v profilu.',
      forgotPasswordHint: 'Zapomenuté heslo? Zeptej se admina.',
      failedTryAgain: 'Chyba. Zkus to znovu.',
    },
    lobbyFriend: {
      title: 'HRÁT S KAMARÁDEM',
      hint: 'Vytvoř soukromé lobby a sdílej kód, nebo se připoj existujícím.',
      codeLabel: 'Kód lobby · 6 znaků',
      codePlaceholder: 'XXXXXX',
      shareCode: 'SDÍLET KÓD',
      host: 'HOST',
      guest: 'HOST',
      waiting: 'čekání',
      startNow: 'SPUSTIT',
      waitingForHost: 'Čeká se, až host spustí...',
      createFailed: 'Vytvoření selhalo.',
      joinFailed: 'Připojení selhalo.',
      startFailed: 'Spuštění selhalo.',
    },
    game: {
      defaultLabel: 'MINE.GRID',
      minesLower: 'min',
      livesLower: 'životů',
      controlsHint: '// LMB odkryj  ·  RMB vlajka  ·  první klik je bezpečný',
      time: 'ČAS',
      mines: 'MINY',
      score: 'SKÓRE',
      lives: 'ŽIVOTY',
      flag: 'VLAJKA',
      reset: 'RESET',
      victory: 'VÍTĚZSTVÍ',
      systemBreach: 'PROLOMENÍ',
      cleared: 'vyčištěno',
      terminated: 'ukončeno',
      bounty: 'Odměna',
      adminNoSubmit: '∞ admin režim — skóre se neodesílá',
      uploading: 'odesílání...',
      queued: 've frontě...',
      scoreUploaded: '✓ skóre odesláno',
      win: 'výhra',
      loss: 'prohra',
      duelResult: 'VÝSLEDEK SOUBOJE',
      you: 'TY',
      rival: 'SOUPEŘ',
      youWinDuel: '🏆 VYHRÁL JSI DUEL',
      defeated: 'PORÁŽEN',
      tie: 'REMÍZA',
      replay: 'ZNOVU',
      playAgain: 'HRÁT ZNOVU',
      youWon: 'VYHRÁL JSI',
      youLost: 'PROHRÁL JSI',
    },
    admin: {
      panelTitle: 'Admin panel',
      panelHint: 'Klikni na koš vedle záznamu v tabulce pro smazání.',
    },
    leaderboard: {
      topRanked: 'Top hodnocení',
      noRankedRunsYet: 'zatím žádné hodnocené běhy.',
      agentStats: 'Statistiky agenta',
      callsignPlaceholder: 'volací znak...',
      scan: 'SKEN',
      scanning: 'skenuji...',
      enterCallsignHint: 'Zadej volací znak pro zobrazení statistik.',
      recentActivity: 'Nedávná aktivita',
      noRunsYet: 'zatím žádné běhy.',
    },
    profile: {
      inventory: 'INVENTÁŘ',
      changePassword: 'ZMĚNIT HESLO',
      account: 'ÚČET',
      lifetimeStats: 'STATISTIKY',
      offline: 'offline',
      loading: 'načítání...',
      playerId: 'ID',
      oldPassword: 'Staré heslo',
      newPassword: 'Nové heslo · min 4',
      repeatNewPassword: 'Zopakujte nové heslo',
      passwordsDoNotMatch: 'Hesla se neshodují.',
      passwordUpdated: 'Heslo změněno.',
      updating: 'AKTUALIZACE...',
      update: 'ULOŽIT',
      failed: 'Chyba.',
    },
    stats: {
      runs: 'HRY', wins: 'VÝHRY', losses: 'PROHRY', winRate: 'ÚSPĚŠNOST',
      campaign: 'KAMPAŇ', battles: 'SOUBOJE', bestScore: 'NEJ SCORE', bestTime: 'NEJ ČAS',
    },
    admin: { title: 'VLASTNÍK', promote: 'POVÝŠIT', grantBtn: 'UDĚLIT',
      promoteHelp: 'Zadejte přezdívku hráče pro udělení práv.',
      promoted: 'povýšen.',
      processing: 'ZPRACOVÁNÍ...',
    },
    friends: { title: 'PŘÁTELÉ', searchPlaceholder: 'Hledat přezdívku...', noResult: 'Hráč nenalezen.', blurb: 'Hledejte hráče a jejich statistiky.' },
    pause: { title: 'POZASTAVENO', exitGame: 'UKONČIT HRU' },
    shop: {
      title: 'OBCHOD',
      blurb: 'Získej mince v kampani a utrácej je za ikony, témata buněk a FX.',
      coins: 'MINCE',
      loading: 'načítání katalogu...',
      groups: { mine: 'IKONY MIN', cell: 'TÉMATA BUNĚK', explosion: 'FX VÝBUCHU', cursor: 'KURZORY' },
      notEnoughCoins: 'Nedostatek mincí.',
      acquired: 'Získáno · {id}',
      equippedMsg: 'Nasazeno · {id}',
      purchaseFailed: 'Nákup selhal.',
      defaultBomb: 'Výchozí bomba',
      defaultCell: 'Cyan mřížka (výchozí)',
      defaultFx: 'Červený záblesk (výchozí)',
      defaultCursor: 'Výchozí kurzor',
      free: 'ZDARMA',
      equip: 'NASADIT',
      equipped: 'NASAZENO',
      buy: 'KOUPIT',
      buying: 'KUPOVÁNÍ...',
    },
    inventory: {
      title: 'INVENTÁŘ',
      buyInShop: 'KUP V OBCHODĚ',
      tabs: {
        bombs: 'BOMBY',
        explosions: 'VÝBUCHY',
        cursors: 'KURZORY',
        themes: 'TÉMATA',
      },
    },
    battles: {
      title: 'SOUBOJE',
      blurb: 'Najdi soupeře v reálném čase. Stejné pole — rychlejší vyhrává.',
      simpleTitle: 'JEDNODUCHÝ SOUBOJ',
      simpleSubtitle: 'Bez hodnocení',
      rankedTitle: 'HODNOCENÝ SOUBOJ',
      rankedSubtitle: 'ELO',
      searching: 'HLEDÁM SOUPEŘE...',
      found: 'SOUPEŘ NALEZEN',
      code: 'KÓD',
      host: 'HOSTITEL',
      opponent: 'SOUPEŘ',
      waiting: 'čekání...',
      startNow: 'START',
      cancel: 'ZRUŠIT',
      findOpponent: 'NAJÍT SOUPEŘE',
      yourRating: 'TVÉ ELO',
      field: 'POLE',
      mines: 'MINY',
      lives: 'ŽIVOTY',
    },
    custom: {
      title: 'VLASTNÍ',
      blurb: 'Nastav si pole a vzhled. Hraj sám nebo s kamarádem.',
      rows: 'ŘÁDKY',
      cols: 'SLOUPCE',
      mines: 'MINY',
      lives: 'ŽIVOTY',
      presets: 'předvolby',
      mineCapTitle: 'LIMIT MIN.',
      mineCapBody: 'Hustota ~60%.',
      solo: 'SOLO',
      withFriend: 'S KAMARÁDEM',
      configPreview: 'náhled',
      estChallenge: 'obtížnost',
      cells: 'BUŇKY',
      safe: 'BEZPEČNÉ',
      density: 'HUSTOTA',
      fxSkins: 'EFEKTY A SKINY',
      diff: { easy: 'SNADNÉ', normal: 'NORMÁLNÍ', hard: 'TĚŽKÉ', insane: 'ŠÍLENÉ' },
      skin: { mine: 'MINA', cell: 'BUŇKA', fx: 'FX', cursor: 'KURZOR' },
      lockedTooltip: 'Zamčeno — kup v OBCHODĚ',
    },
    campaign: {
      title: 'KAMPAŇ',
      blurb: '{n} uzlů na cestě. Kolečko nebo tažení.',
      infinityOn: 'NEKONEČNO',
      infinityOff: 'NORMÁL',
      cleared: 'SPLNĚNO',
      stars: 'HVĚZDY',
      start: 'START',
    },
    leaderboard: {
      title: 'ŽEBŘÍČEK',
      top: 'Top 20',
      name: 'JMÉNO',
      lvl: 'LVL',
      score: 'SKÓRE',
      time: 'ČAS',
      loading: 'načítání...',
      noRecords: 'Zatím žádné záznamy.',
      deleteConfirm: 'Smazat záznam?',
    },
    daily: {
      title: 'DENNÍ',
      subtitle: 'DENNÍ ÚKOLY',
      coins: 'MINCE',
      coinsShort: 'mincí',
      resetIn: 'RESET ZA',
      claim: 'VYZVEDNOUT',
      claimed: 'VYZVEDNUTO',
      inProgress: 'PROBÍHÁ',
      quests: {
        play_1: 'Zahrát 1 hru',
        win_1: 'Vyhraj 1 hru',
        flags_10: 'Položit 10 vlajek',
        safe_50: 'Odkrýt 50 bezpečných políček',
      },
    },
  },
  es: {
    appName: 'Sappers Arena',
    tagline: '// buscaminas neural',
    tabs: { campaign: 'CAMPAÑA', battles: 'BATALLAS', custom: 'PERSONALIZADO', shop: 'TIENDA', leaderboard: 'LÍDERES', profile: 'PERFIL', friends: 'AMIGOS' },
    common: {
      login: 'ENTRAR', register: 'REGISTRAR', logout: 'SALIR · CAMBIAR CUENTA',
      coins: 'MONEDAS', rating: 'ELO', play: 'JUGAR', cancel: 'CANCELAR', close: 'CERRAR',
      remaining: 'VIDAS', findOpponent: 'BUSCAR RIVAL', createLobby: 'CREAR SALA',
      joinLobby: 'UNIRSE', friends: 'AMIGOS', search: 'BUSCAR',
      settings: 'AJUSTES', language: 'IDIOMA', exit: 'SALIR',
      continue: 'CONTINUAR',
      back: 'ATRÁS',
      copy: 'COPIAR',
      or: 'O',
      vs: 'VS',
      admin: 'ADMIN',
      yes: 'SÍ',
      no: 'NO',
    },
    settings: {
      sound: 'SONIDO',
    },
    onboarding: {
      label: 'tutorial',
      stepLabel: 'PASO',
      skip: 'SALTAR',
      next: 'SIGUIENTE',
      done: 'LISTO',
      welcomeTitle: 'BIENVENIDO A SAPPERS ARENA',
      welcomeBody: 'Un tutorial rápido de 30 segundos. Puedes saltarlo y empezar a jugar de inmediato.',
      livesTitle: 'VIDAS',
      livesBody: 'Empiezas con varias vidas. Pisar una mina cuesta 1 vida. La partida termina cuando las vidas llegan a 0.',
      flagsTitle: 'BANDERAS',
      flagsBody: 'Usa banderas para marcar minas. Las banderas correctas te ayudan a jugar más rápido y seguro.',
      duelsTitle: 'DUELOS',
      duelsBody: 'En batallas, tu objetivo es terminar con más progreso (y vidas) que tu oponente. La velocidad importa.',
    },
    daily: {
      title: 'DIARIAS',
      subtitle: 'MISIONES DIARIAS',
      coins: 'MONEDAS',
      coinsShort: 'monedas',
      resetIn: 'REINICIA EN',
      claim: 'RECLAMAR',
      claimed: 'RECLAMADO',
      inProgress: 'EN PROGRESO',
      quests: {
        play_1: 'Jugar 1 partida',
        win_1: 'Ganar 1 partida',
        flags_10: 'Poner 10 banderas',
        safe_50: 'Revelar 50 seguras',
      },
    },
    achievements: {
      title: 'LOGROS',
      unlocked: 'DESBLOQUEADO',
      toast: 'LOGRO DESBLOQUEADO',
      more: 'MÁS',
      items: {
        games_1: { title: 'PRIMEROS PASOS', cond: 'Juega 1 partida', desc: 'Primer paso hecho.' },
        games_10: { title: 'CALENTANDO', cond: 'Juega 10 partidas', desc: 'Ya estás caliente.' },
        games_50: { title: 'HABITUAL', cond: 'Juega 50 partidas', desc: '¿Ya es costumbre?' },
        games_200: { title: 'VETERANO', cond: 'Juega 200 partidas', desc: 'Lo has visto todo.' },
        games_1000: { title: 'MARATÓN', cond: 'Juega 1000 partidas', desc: '¿Vives aquí?' },
        wins_1: { title: 'PRIMERA VICTORIA', cond: 'Gana 1 partida', desc: 'La primera victoria es la mejor.' },
        streak_3: { title: 'RACHA 3', cond: 'Gana 3 seguidas', desc: 'Empieza la racha.' },
        streak_5: { title: 'RACHA 5', cond: 'Gana 5 seguidas', desc: 'Muy seguro.' },
        streak_10: { title: 'RACHA 10', cond: 'Gana 10 seguidas', desc: 'Lees el tablero.' },
        streak_100: { title: 'RACHA 100', cond: 'Gana 100 seguidas', desc: '¿Eres un bot?' },
        flawless_win: { title: 'IMPECABLE', cond: 'Gana sin perder vidas', desc: 'Trabajo limpio.' },
        speed_win_60: { title: 'MENTE RÁPIDA', cond: 'Gana en menos de 60 s', desc: 'Rápido y limpio.' },
        speed_win_30: { title: 'SPEEDRUNNER', cond: 'Gana en menos de 30 s', desc: '¿Parpadeaste?' },
        speed_win_20: { title: 'RELÁMPAGO', cond: 'Gana en menos de 20 s', desc: 'Un rayo.' },
        speed_win_10: { title: 'VELOCISTA', cond: 'Gana en menos de 10 s', desc: 'Demasiado rápido.' },
        flags_1: { title: 'PRIMERA BANDERA', cond: 'Coloca 1 bandera', desc: 'La paranoia empieza.' },
        flags_100: { title: 'MAESTRO DE BANDERAS', cond: 'Coloca 100 banderas', desc: 'Marcando como pro.' },
        flags_1000: { title: 'LEYENDA DE BANDERAS', cond: 'Coloca 1000 banderas', desc: 'Banderas por todas partes.' },
        precise_all_mines: { title: 'PRECISO', cond: 'Gana marcando todas las minas', desc: 'De manual.' },
        no_flags_win: { title: 'SIN BANDERAS', cond: 'Gana sin banderas', desc: 'Solo intuición.' },
        campaign_1: { title: 'INICIO CAMPAÑA', cond: 'Gana 1 nivel de campaña', desc: 'Empieza la aventura.' },
        campaign_10: { title: 'CAMPAÑA 10', cond: 'Gana 10 niveles de campaña', desc: 'Sigues adelante.' },
        campaign_half: { title: 'MITAD', cond: 'Llega a la mitad de campaña', desc: 'Mitad completada.' },
        campaign_complete: { title: 'CAMPAÑA COMPLETA', cond: 'Completa la campaña', desc: 'Final. Sobreviviste.' },
        hard_lesson: { title: 'LECCIÓN DURA', cond: 'Gana campaña 150+ con 1 vida', desc: 'Un error y boom.' },
        duels_1: { title: 'PRIMER DUELO', cond: 'Juega 1 duelo', desc: 'Bienvenido al combate.' },
        duel_wins_1: { title: 'GANADOR DE DUELO', cond: 'Gana 1 duelo', desc: 'La primera vez siempre es buena)' },
        ranked_10: { title: 'LISTO PARA RANKED', cond: 'Juega 10 ranked', desc: 'El rating duele.' },
        duel_wins_10: { title: 'RIVAL', cond: 'Gana 10 duelos', desc: 'Ya te conocen.' },
        duel_wins_50: { title: 'NÉMESIS', cond: 'Gana 50 duelos', desc: 'Alguien se pone nervioso.' },
        comeback_1hp: { title: 'REMONTADA', cond: 'Gana con 1 vida', desc: 'Al límite.' },
        duel_streak_5: { title: 'IMPARABLE', cond: 'Gana 5 duelos seguidos', desc: 'No te paran.' },
        rating_600: { title: 'EN ASCENSO', cond: 'Alcanza rating 600', desc: 'Subiendo.' },
        rating_1000: { title: 'HÁBIL', cond: 'Alcanza rating 1000', desc: 'Ya no eres novato.' },
        rating_5000: { title: 'PRO', cond: 'Alcanza rating 5000', desc: 'Profesional.' },
        rating_10000: { title: 'ÉLITE', cond: 'Alcanza rating 10000', desc: 'Élite.' },
        rating_15000: { title: 'LEYENDA', cond: 'Alcanza rating 15000', desc: 'Leyenda.' },
        coins_balance_10000: { title: 'ÚLTIMO DINERO', cond: 'Ten 10000 monedas en balance', desc: '¿Ahorra mucho o no gastas?' },
        coins_earned_total_10000: { title: 'RICO', cond: 'Gana 10000 monedas en total', desc: 'Nada mal.' },
        daily_claim_1: { title: 'RECLAMADOR', cond: 'Reclama 1 diaria', desc: 'Reclamar es sagrado.' },
        daily_streak_5: { title: 'RACHA DIARIA', cond: 'Reclama diarias en 5 ventanas seguidas', desc: 'Disciplina.' },
      },
    },
    auth: {
      identifyTitle: 'IDENTIFICAR',
      accessTitle: 'ACCESO',
      identifyHint: 'Crea tu identidad en la red.',
      accessHint: 'Inicia sesión con un indicativo existente.',
      callsignLabel: 'Indicativo · 3–20',
      callsignPlaceholder: 'TU_NOMBRE',
      passwordLabel: 'Contraseña · mín 4',
      passwordPlaceholder: '••••••',
      callsignAvailable: 'Indicativo disponible.',
      adminSlot: 'RANURA ADMIN',
      alreadyTaken: 'Ya está en uso.',
      connecting: 'CONECTANDO...',
      passwordRequiredHint: 'Contraseña requerida. Cambia luego en el perfil.',
      forgotPasswordHint: '¿Olvidaste la contraseña? Pregunta al admin.',
      failedTryAgain: 'Falló. Inténtalo de nuevo.',
    },
    lobbyFriend: {
      title: 'JUGAR CON AMIGO',
      hint: 'Crea un lobby privado y comparte el código, o únete a uno existente.',
      codeLabel: 'Código de lobby · 6',
      codePlaceholder: 'XXXXXX',
      shareCode: 'COMPARTIR CÓDIGO',
      host: 'HOST',
      guest: 'INVITADO',
      waiting: 'esperando',
      startNow: 'INICIAR',
      waitingForHost: 'Esperando a que el host inicie...',
      createFailed: 'Error al crear.',
      joinFailed: 'Error al unirse.',
      startFailed: 'Error al iniciar.',
    },
    game: {
      defaultLabel: 'MINE.GRID',
      minesLower: 'minas',
      livesLower: 'vidas',
      controlsHint: '// CLIC IZQ revelar  ·  CLIC DER bandera  ·  el primer clic es seguro',
      time: 'TIEMPO',
      mines: 'MINAS',
      score: 'PUNTOS',
      lives: 'VIDAS',
      flag: 'BANDERA',
      reset: 'REINICIAR',
      victory: 'VICTORIA',
      systemBreach: 'BRECHA DEL SISTEMA',
      cleared: 'completado',
      terminated: 'terminado',
      bounty: 'Recompensa',
      adminNoSubmit: '∞ modo admin — no se envía la puntuación',
      uploading: 'subiendo...',
      queued: 'en cola...',
      scoreUploaded: '✓ puntuación enviada',
      win: 'victoria',
      loss: 'derrota',
      duelResult: 'RESULTADO DEL DUELO',
      you: 'TÚ',
      rival: 'RIVAL',
      youWinDuel: '🏆 GANASTE EL DUELO',
      defeated: 'DERROTADO',
      tie: 'EMPATE',
      replay: 'REPETIR',
      playAgain: 'JUGAR DE NUEVO',
      youWon: 'GANASTE',
      youLost: 'PERDISTE',
    },
    admin: {
      panelTitle: 'Panel de admin',
      panelHint: 'Haz clic en la papelera junto a una entrada para borrarla.',
    },
    leaderboard: {
      topRanked: 'Top ranked',
      noRankedRunsYet: 'aún no hay partidas rankeds.',
      agentStats: 'Estadísticas del agente',
      callsignPlaceholder: 'indicativo...',
      scan: 'ESCANEAR',
      scanning: 'escaneando...',
      enterCallsignHint: 'Introduce un indicativo para ver estadísticas.',
      recentActivity: 'Actividad reciente',
      noRunsYet: 'aún no hay partidas.',
    },
    profile: {
      inventory: 'INVENTARIO',
      changePassword: 'CAMBIAR CONTRASEÑA',
      account: 'CUENTA',
      lifetimeStats: 'ESTADÍSTICAS',
      offline: 'sin conexión',
      loading: 'cargando...',
      playerId: 'ID',
      oldPassword: 'Contraseña antigua',
      newPassword: 'Nueva contraseña · mín 4',
      repeatNewPassword: 'Repite la nueva contraseña',
      passwordsDoNotMatch: 'Las contraseñas no coinciden.',
      passwordUpdated: 'Contraseña actualizada.',
      updating: 'ACTUALIZANDO...',
      update: 'ACTUALIZAR',
      failed: 'Falló.',
    },
    stats: {
      runs: 'PARTIDAS', wins: 'VICTORIAS', losses: 'DERROTAS', winRate: 'RATIO',
      campaign: 'CAMPAÑA', battles: 'BATALLAS', bestScore: 'MEJOR PUNT', bestTime: 'MEJOR TIEMPO',
    },
    admin: { title: 'DUEÑO', promote: 'ASCENDER', grantBtn: 'DAR',
      promoteHelp: 'Introduce el apodo para dar permisos de admin.',
      promoted: 'ascendido.',
      processing: 'PROCESANDO...',
    },
    friends: { title: 'AMIGOS', searchPlaceholder: 'Buscar apodo...', noResult: 'Jugador no encontrado.', blurb: 'Busca jugadores y mira sus estadísticas.' },
    pause: { title: 'PAUSA', exitGame: 'SALIR DEL JUEGO' },
    shop: {
      title: 'TIENDA',
      blurb: 'Gana monedas en la campaña y gástalas en iconos, temas y FX.',
      coins: 'MONEDAS',
      loading: 'cargando catálogo...',
      groups: { mine: 'ICONOS DE MINA', cell: 'TEMAS DE CELDA', explosion: 'FX DE EXPLOSIÓN', cursor: 'CURSORES' },
      notEnoughCoins: 'No hay suficientes monedas.',
      acquired: 'Obtenido · {id}',
      equippedMsg: 'Equipado · {id}',
      purchaseFailed: 'La compra falló.',
      defaultBomb: 'Bomba predeterminada',
      defaultCell: 'Cuadrícula cian (pred.)',
      defaultFx: 'Destello rojo (pred.)',
      defaultCursor: 'Cursor predeterminado',
      free: 'GRATIS',
      equip: 'EQUIPAR',
      equipped: 'EQUIPADO',
      buy: 'COMPRAR',
      buying: 'COMPRANDO...',
    },

    inventory: {
      title: 'INVENTARIO',
      buyInShop: 'COMPRA EN LA TIENDA',
      tabs: {
        bombs: 'BOMBAS',
        explosions: 'EXPLOSIONES',
        cursors: 'CURSORES',
        themes: 'TEMAS',
      },
    },
    battles: {
      title: 'BATALLAS',
      blurb: 'Encuentra rivales en tiempo real. Mismo campo — gana el más rápido.',
      simpleTitle: 'BATALLA SIMPLE',
      simpleSubtitle: 'Sin ranking',
      rankedTitle: 'BATALLA RANKED',
      rankedSubtitle: 'ELO',
      searching: 'BUSCANDO RIVAL...',
      found: 'RIVAL ENCONTRADO',
      code: 'CÓDIGO',
      host: 'HOST',
      opponent: 'RIVAL',
      waiting: 'esperando...',
      startNow: 'EMPEZAR',
      cancel: 'CANCELAR',
      findOpponent: 'BUSCAR RIVAL',
      yourRating: 'TU ELO',
      field: 'CAMPO',
      mines: 'MINAS',
      lives: 'VIDAS',
    },
    custom: {
      title: 'PERSONALIZADO',
      blurb: 'Configura tu tablero y skins. Juega solo o con un amigo.',
      rows: 'FILAS',
      cols: 'COLUMNAS',
      mines: 'MINAS',
      lives: 'VIDAS',
      presets: 'presets',
      mineCapTitle: 'LÍMITE DE MINAS.',
      mineCapBody: 'Densidad ~60%.',
      solo: 'SOLO',
      withFriend: 'CON AMIGO',
      configPreview: 'vista previa',
      estChallenge: 'dificultad',
      cells: 'CELDAS',
      safe: 'SEGURAS',
      density: 'DENSIDAD',
      fxSkins: 'EFECTOS Y SKINS',
      diff: { easy: 'FÁCIL', normal: 'NORMAL', hard: 'DIFÍCIL', insane: 'LOCO' },
      skin: { mine: 'MINA', cell: 'CELDA', fx: 'FX', cursor: 'CURSOR' },
      lockedTooltip: 'Bloqueado — compra en la TIENDA',
    },
    campaign: {
      title: 'CAMPAÑA',
      blurb: '{n} nodos en el camino. Rueda o arrastra.',
      infinityOn: 'INFINITO',
      infinityOff: 'NORMAL',
      cleared: 'LIMPIADO',
      stars: 'ESTRELLAS',
      start: 'INICIO',
    },
    leaderboard: {
      title: 'LÍDERES',
      top: 'Top 20',
      name: 'NOMBRE',
      lvl: 'NVL',
      score: 'PUNTOS',
      time: 'TIEMPO',
      loading: 'cargando...',
      noRecords: 'Sin récords aún.',
      deleteConfirm: '¿Borrar registro?',
    },
  },
};

const _deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
};

const _setPath = (obj, path, value) => {
  const parts = String(path || '').split('.').filter(Boolean);
  if (!parts.length) return;
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!node[k] || typeof node[k] !== 'object') node[k] = {};
    node = node[k];
  }
  node[parts[parts.length - 1]] = value;
};

const _setAchievementItems = (dict, items) => {
  try {
    Object.entries(items || {}).forEach(([id, v]) => {
      if (!id || !v) return;
      if (v.title) _setPath(dict, `achievements.items.${id}.title`, v.title);
      if (v.cond) _setPath(dict, `achievements.items.${id}.cond`, v.cond);
      if (v.desc) _setPath(dict, `achievements.items.${id}.desc`, v.desc);
    });
  } catch {}
};

// Add extra languages by cloning EN to guarantee full key coverage
DICTS.fr = _deepClone(DICTS.en);
DICTS.de = _deepClone(DICTS.en);
DICTS.zh = _deepClone(DICTS.en);

// French
_setPath(DICTS.fr, 'tagline', '// démineur neural');
_setPath(DICTS.fr, 'tabs.campaign', 'CAMPAGNE');
_setPath(DICTS.fr, 'tabs.battles', 'DUELS');
_setPath(DICTS.fr, 'tabs.custom', 'PERSO');
_setPath(DICTS.fr, 'tabs.shop', 'BOUTIQUE');
_setPath(DICTS.fr, 'tabs.leaderboard', 'CLASSEMENT');
_setPath(DICTS.fr, 'tabs.profile', 'PROFIL');
_setPath(DICTS.fr, 'tabs.friends', 'AMIS');
_setPath(DICTS.fr, 'common.login', 'ACCÉDER');
_setPath(DICTS.fr, 'common.register', 'ENREGISTRER');
_setPath(DICTS.fr, 'common.logout', 'DÉCONNEXION · CHANGER DE COMPTE');
_setPath(DICTS.fr, 'common.coins', 'PIÈCES');
_setPath(DICTS.fr, 'common.rating', 'ELO');
_setPath(DICTS.fr, 'common.play', 'JOUER');
_setPath(DICTS.fr, 'common.cancel', 'ANNULER');
_setPath(DICTS.fr, 'common.close', 'FERMER');
_setPath(DICTS.fr, 'common.remaining', 'VIES RESTANTES');
_setPath(DICTS.fr, 'common.findOpponent', 'TROUVER UN ADVERSAIRE');
_setPath(DICTS.fr, 'common.createLobby', 'CRÉER UN SALON');
_setPath(DICTS.fr, 'common.joinLobby', 'REJOINDRE');
_setPath(DICTS.fr, 'common.friends', 'AMIS');
_setPath(DICTS.fr, 'common.search', 'RECHERCHER');
_setPath(DICTS.fr, 'common.settings', 'PARAMÈTRES');
_setPath(DICTS.fr, 'common.language', 'LANGUE');
_setPath(DICTS.fr, 'common.exit', 'QUITTER');
_setPath(DICTS.fr, 'common.continue', 'CONTINUER');
_setPath(DICTS.fr, 'common.back', 'RETOUR');
_setPath(DICTS.fr, 'common.copy', 'COPIER');
_setPath(DICTS.fr, 'common.or', 'OU');
_setPath(DICTS.fr, 'common.vs', 'VS');
_setPath(DICTS.fr, 'common.yes', 'OUI');
_setPath(DICTS.fr, 'common.no', 'NON');
_setPath(DICTS.fr, 'settings.sound', 'SON');
_setPath(DICTS.fr, 'onboarding.skip', 'PASSER');
_setPath(DICTS.fr, 'onboarding.next', 'SUIVANT');
_setPath(DICTS.fr, 'onboarding.done', 'TERMINÉ');
_setPath(DICTS.fr, 'daily.title', 'QUOTIDIEN');
_setPath(DICTS.fr, 'daily.subtitle', 'QUÊTES QUOTIDIENNES');
_setPath(DICTS.fr, 'daily.coins', 'PIÈCES');
_setPath(DICTS.fr, 'daily.coinsShort', 'p');
_setPath(DICTS.fr, 'daily.resetIn', 'RÉINITIALISATION DANS');
_setPath(DICTS.fr, 'daily.claimed', 'RÉCLAMÉ');
_setPath(DICTS.fr, 'daily.claim', 'RÉCLAMER');
_setPath(DICTS.fr, 'daily.quests.play_1', 'Jouer 1 partie');
_setPath(DICTS.fr, 'daily.quests.play_3', 'Jouer 3 parties');
_setPath(DICTS.fr, 'daily.quests.win_1', 'Gagner 1 partie');
_setPath(DICTS.fr, 'daily.quests.win_3', 'Gagner 3 parties');
_setPath(DICTS.fr, 'daily.quests.lose_1', 'Perdre 1 partie');
_setPath(DICTS.fr, 'daily.quests.lose_3', 'Perdre 3 parties');
_setPath(DICTS.fr, 'daily.quests.flags_5', 'Placer 5 drapeaux');
_setPath(DICTS.fr, 'daily.quests.flags_20', 'Placer 20 drapeaux');
_setPath(DICTS.fr, 'daily.quests.flags_50', 'Placer 50 drapeaux');
_setPath(DICTS.fr, 'daily.quests.safe_100', 'Révéler 100 cases sûres');
_setPath(DICTS.fr, 'daily.quests.safe_250', 'Révéler 250 cases sûres');
_setPath(DICTS.fr, 'daily.quests.time_300', 'Jouer 5 min (300 s)');
_setPath(DICTS.fr, 'daily.quests.time_900', 'Jouer 15 min (900 s)');
_setPath(DICTS.fr, 'daily.quests.fast_60', 'Gagner en moins de 60 s');
_setPath(DICTS.fr, 'daily.quests.fast_30', 'Gagner en moins de 30 s');
_setPath(DICTS.fr, 'daily.quests.no_flags', 'Gagner sans drapeaux');
_setPath(DICTS.fr, 'daily.quests.flawless', 'Gagner sans perdre de vies');
_setPath(DICTS.fr, 'daily.quests.one_life', 'Gagner avec 1 vie');
_setPath(DICTS.fr, 'daily.quests.campaign_1', 'Gagner 1 niveau de campagne');
_setPath(DICTS.fr, 'daily.quests.campaign_3', 'Gagner 3 niveaux de campagne');
_setPath(DICTS.fr, 'achievements.title', 'SUCCÈS');
_setPath(DICTS.fr, 'achievements.unlocked', 'DÉBLOQUÉ');
_setPath(DICTS.fr, 'achievements.toast', 'SUCCÈS DÉBLOQUÉ');
_setPath(DICTS.fr, 'achievements.more', 'DE PLUS');

_setAchievementItems(DICTS.fr, {
  games_1: { title: 'PREMIERS PAS', cond: 'Jouer 1 partie', desc: 'Premier pas. La suite arrive.' },
  games_10: { title: 'ÉCHAUFFEMENT', cond: 'Jouer 10 parties', desc: 'Tu es chaud. Maintenant, c’est sérieux.' },
  games_50: { title: 'HABITUÉ', cond: 'Jouer 50 parties', desc: 'C’est une habitude, non ?' },
  games_200: { title: 'VÉTÉRAN', cond: 'Jouer 200 parties', desc: 'Tu as tout vu. Même la douleur.' },
  games_1000: { title: 'MARATHON', cond: 'Jouer 1000 parties', desc: 'Tu vis ici ?' },
  wins_1: { title: 'PREMIÈRE VICTOIRE', cond: 'Gagner 1 partie', desc: 'La première victoire est la meilleure.' },
  streak_3: { title: 'SÉRIE 3', cond: 'Gagner 3 fois d’affilée', desc: 'La série commence. Continue.' },
  streak_5: { title: 'SÉRIE 5', cond: 'Gagner 5 fois d’affilée', desc: 'Confiant. Très confiant.' },
  streak_10: { title: 'SÉRIE 10', cond: 'Gagner 10 fois d’affilée', desc: 'Tu lis la grille comme un livre.' },
  streak_100: { title: 'SÉRIE 100', cond: 'Gagner 100 fois d’affilée', desc: 'Attends… tu es un bot ?' },
  flawless_win: { title: 'SANS FAILLE', cond: 'Gagner sans perdre de vies', desc: 'Travail propre. Pas de rayures.' },
  speed_win_60: { title: 'ESPRIT VIF', cond: 'Gagner en moins de 60 s', desc: 'Réflexes rapides.' },
  speed_win_30: { title: 'SPEEDRUNNER', cond: 'Gagner en moins de 30 s', desc: 'Tu as cligné des yeux ?' },
  speed_win_20: { title: 'ÉCLAIR', cond: 'Gagner en moins de 20 s', desc: 'Un éclair. Et c’est fini.' },
  speed_win_10: { title: 'FUSÉE', cond: 'Gagner en moins de 10 s', desc: 'Terminé avant de commencer.' },
  flags_1: { title: 'PREMIER DRAPEAU', cond: 'Placer 1 drapeau', desc: 'Premier drapeau. La parano démarre.' },
  flags_100: { title: 'MAÎTRE DES DRAPEAUX', cond: 'Placer 100 drapeaux', desc: 'Marquage de pro.' },
  flags_1000: { title: 'LÉGENDE DES DRAPEAUX', cond: 'Placer 1000 drapeaux', desc: 'Des drapeaux partout. Presque.' },
  precise_all_mines: { title: 'PRÉCIS', cond: 'Gagner avec des drapeaux sur toutes les mines', desc: 'Parfait, comme dans le manuel.' },
  no_flags_win: { title: 'SANS DRAPEAUX', cond: 'Gagner sans placer de drapeaux', desc: 'Pure intuition. Ou folie.' },
  campaign_1: { title: 'DÉBUT CAMPAGNE', cond: 'Gagner 1 niveau de campagne', desc: 'Chapitre 1 : « Facile… non ? »' },
  campaign_10: { title: 'CAMPAGNE 10', cond: 'Gagner 10 niveaux de campagne', desc: 'Tu es dedans. Pas de retour.' },
  campaign_half: { title: 'MI-CAMPAGNE', cond: 'Atteindre la moitié de la campagne', desc: 'À mi-chemin. Ça chauffe.' },
  campaign_complete: { title: 'CAMPAGNE TERMINÉE', cond: 'Terminer la campagne', desc: 'La fin. Et tu as survécu. Comment ?' },
  hard_lesson: { title: 'DURE LEÇON', cond: 'Gagner le niveau campagne 150+ avec 1 vie', desc: 'Une erreur et… boum !' },
  duels_1: { title: 'PREMIER DUEL', cond: 'Jouer 1 duel', desc: 'Bienvenue au vrai combat.' },
  duel_wins_1: { title: 'VAINQUEUR DE DUEL', cond: 'Gagner 1 duel', desc: 'La première fois, c’est toujours bien)' },
  ranked_10: { title: 'PRÊT POUR LE CLASSEMENT', cond: 'Jouer 10 duels classés', desc: 'Le rating, ça fait mal.' },
  duel_wins_10: { title: 'RIVAL', cond: 'Gagner 10 duels', desc: 'Ils se souviennent de toi. Et ils ont peur.' },
  duel_wins_50: { title: 'NÉMÉSIS', cond: 'Gagner 50 duels', desc: 'Si tu es là, quelqu’un panique.' },
  comeback_1hp: { title: 'RETOUR', cond: 'Gagner avec 1 vie', desc: 'Au bord du gouffre. Victoire quand même.' },
  duel_streak_5: { title: 'INARRÊTABLE', cond: 'Gagner 5 duels d’affilée', desc: 'Personne ne peut t’arrêter. Pas encore.' },
  rating_600: { title: 'EN HAUSSE', cond: 'Atteindre 600 ELO', desc: 'Ça monte.' },
  rating_1000: { title: 'CONFIRMÉ', cond: 'Atteindre 1000 ELO', desc: 'Plus un débutant.' },
  rating_5000: { title: 'PRO', cond: 'Atteindre 5000 ELO', desc: 'Pro. Sans discussion.' },
  rating_10000: { title: 'ÉLITE', cond: 'Atteindre 10000 ELO', desc: 'Réservé à l’élite.' },
  rating_15000: { title: 'LÉGENDE', cond: 'Atteindre 15000 ELO', desc: 'Une vraie légende.' },
  coins_balance_10000: { title: 'DERNIERS SOUS', cond: 'Avoir 10000 pièces en solde', desc: 'Tu économises ou tu ne dépenses jamais ?' },
  coins_earned_total_10000: { title: 'RICHE', cond: 'Gagner 10000 pièces au total', desc: 'Pas mal.' },
  daily_claim_1: { title: 'RÉCLAMEUR QUOTIDIEN', cond: 'Réclamer 1 quête quotidienne', desc: 'Réclamer, c’est sacré.' },
  daily_streak_5: { title: 'SÉRIE QUOTIDIENNE', cond: 'Réclamer sur 5 fenêtres d’affilée', desc: 'Discipline. Acier.' },
});

_setPath(DICTS.fr, 'auth.identifyTitle', 'IDENTIFIER');
_setPath(DICTS.fr, 'auth.accessTitle', 'ACCÈS');
_setPath(DICTS.fr, 'auth.identifyHint', 'Crée ton identité sur la grille.');
_setPath(DICTS.fr, 'auth.accessHint', 'Connecte-toi avec un indicatif existant.');
_setPath(DICTS.fr, 'auth.callsignLabel', 'Indicatif · 3–20 caractères');
_setPath(DICTS.fr, 'auth.callsignPlaceholder', 'TON_NOM');
_setPath(DICTS.fr, 'auth.passwordLabel', 'Mot de passe · min 4');
_setPath(DICTS.fr, 'auth.passwordPlaceholder', '••••••');
_setPath(DICTS.fr, 'auth.login', 'SE CONNECTER');
_setPath(DICTS.fr, 'auth.register', 'S’INSCRIRE');
_setPath(DICTS.fr, 'auth.connecting', 'CONNEXION...');
_setPath(DICTS.fr, 'auth.passwordRequiredHint', 'Mot de passe requis. Modifiable ensuite dans le profil.');
_setPath(DICTS.fr, 'auth.forgotPasswordHint', 'Mot de passe oublié ? Demande à l’admin.');
_setPath(DICTS.fr, 'auth.failedTryAgain', 'Échec. Réessaie.');

_setPath(DICTS.fr, 'lobbyFriend.title', 'JOUER AVEC UN AMI');
_setPath(DICTS.fr, 'lobbyFriend.hint', 'Crée un salon privé et partage le code, ou rejoins un salon existant.');
_setPath(DICTS.fr, 'lobbyFriend.codeLabel', 'Code du salon · 6 caractères');
_setPath(DICTS.fr, 'lobbyFriend.codePlaceholder', 'XXXXXX');
_setPath(DICTS.fr, 'lobbyFriend.shareCode', 'PARTAGER LE CODE');
_setPath(DICTS.fr, 'lobbyFriend.host', 'HÔTE');
_setPath(DICTS.fr, 'lobbyFriend.guest', 'INVITÉ');
_setPath(DICTS.fr, 'lobbyFriend.waiting', 'attente');
_setPath(DICTS.fr, 'lobbyFriend.startNow', 'DÉMARRER');
_setPath(DICTS.fr, 'lobbyFriend.waitingForHost', 'En attente que l’hôte démarre...');
_setPath(DICTS.fr, 'lobbyFriend.createFailed', 'Création échouée.');
_setPath(DICTS.fr, 'lobbyFriend.joinFailed', 'Connexion échouée.');
_setPath(DICTS.fr, 'lobbyFriend.startFailed', 'Démarrage échoué.');

_setPath(DICTS.fr, 'game.minesLower', 'mines');
_setPath(DICTS.fr, 'game.livesLower', 'vies');
_setPath(DICTS.fr, 'game.controlsHint', '// CLIC GAUCHE révéler · CLIC DROIT drapeau · le 1er clic est sûr');
_setPath(DICTS.fr, 'game.time', 'TEMPS');
_setPath(DICTS.fr, 'game.mines', 'MINES');
_setPath(DICTS.fr, 'game.score', 'SCORE');
_setPath(DICTS.fr, 'game.lives', 'VIES');
_setPath(DICTS.fr, 'game.flag', 'DRAPEAU');
_setPath(DICTS.fr, 'game.reset', 'RESTART');
_setPath(DICTS.fr, 'game.victory', 'VICTOIRE');
_setPath(DICTS.fr, 'game.systemBreach', 'INTRUSION SYSTÈME');
_setPath(DICTS.fr, 'game.cleared', 'nettoyé');
_setPath(DICTS.fr, 'game.terminated', 'terminé');
_setPath(DICTS.fr, 'game.bounty', 'Prime');
_setPath(DICTS.fr, 'game.adminNoSubmit', '∞ mode admin — score non envoyé');
_setPath(DICTS.fr, 'game.uploading', 'envoi...');
_setPath(DICTS.fr, 'game.queued', 'en file...');
_setPath(DICTS.fr, 'game.scoreUploaded', '✓ score envoyé');
_setPath(DICTS.fr, 'game.win', 'victoire');
_setPath(DICTS.fr, 'game.loss', 'défaite');
_setPath(DICTS.fr, 'game.duelResult', 'RÉSULTAT DU DUEL');
_setPath(DICTS.fr, 'game.you', 'TOI');
_setPath(DICTS.fr, 'game.rival', 'RIVAL');
_setPath(DICTS.fr, 'game.youWinDuel', '🏆 TU GAGNES LE DUEL');
_setPath(DICTS.fr, 'game.defeated', 'BATTU');
_setPath(DICTS.fr, 'game.tie', 'ÉGALITÉ');
_setPath(DICTS.fr, 'game.replay', 'REJOUER');
_setPath(DICTS.fr, 'game.playAgain', 'REJOUER');
_setPath(DICTS.fr, 'game.youWon', 'TU AS GAGNÉ');
_setPath(DICTS.fr, 'game.youLost', 'TU AS PERDU');

_setPath(DICTS.fr, 'profile.inventory', 'INVENTAIRE');
_setPath(DICTS.fr, 'profile.changePassword', 'CHANGER LE MOT DE PASSE');
_setPath(DICTS.fr, 'profile.account', 'COMPTE');
_setPath(DICTS.fr, 'profile.lifetimeStats', 'STATS');
_setPath(DICTS.fr, 'profile.offline', 'hors ligne');
_setPath(DICTS.fr, 'profile.loading', 'chargement...');
_setPath(DICTS.fr, 'profile.playerId', 'ID');
_setPath(DICTS.fr, 'profile.oldPassword', 'Ancien mot de passe');
_setPath(DICTS.fr, 'profile.newPassword', 'Nouveau mot de passe · min 4');
_setPath(DICTS.fr, 'profile.repeatNewPassword', 'Répéter le mot de passe');
_setPath(DICTS.fr, 'profile.passwordsDoNotMatch', 'Les mots de passe ne correspondent pas.');
_setPath(DICTS.fr, 'profile.passwordUpdated', 'Mot de passe mis à jour.');
_setPath(DICTS.fr, 'profile.updating', 'MISE À JOUR...');
_setPath(DICTS.fr, 'profile.update', 'METTRE À JOUR');
_setPath(DICTS.fr, 'profile.failed', 'Échec.');

_setPath(DICTS.fr, 'friends.title', 'AMIS');
_setPath(DICTS.fr, 'friends.searchPlaceholder', 'Rechercher un indicatif...');
_setPath(DICTS.fr, 'friends.noResult', 'Joueur introuvable.');
_setPath(DICTS.fr, 'friends.blurb', 'Cherche d’autres joueurs et consulte leurs stats.');

_setPath(DICTS.fr, 'pause.title', 'PAUSE');
_setPath(DICTS.fr, 'pause.exitGame', 'QUITTER');

_setPath(DICTS.fr, 'shop.title', 'BOUTIQUE');
_setPath(DICTS.fr, 'shop.blurb', 'Gagne des pièces en campagne. Dépense-les pour des icônes, thèmes et effets.');
_setPath(DICTS.fr, 'shop.coins', 'PIÈCES');
_setPath(DICTS.fr, 'shop.loading', 'chargement...');
_setPath(DICTS.fr, 'shop.groups.mine', 'ICÔNES MINES');
_setPath(DICTS.fr, 'shop.groups.cell', 'THÈMES');
_setPath(DICTS.fr, 'shop.groups.explosion', 'EFFETS');
_setPath(DICTS.fr, 'shop.groups.cursor', 'CURSEURS');
_setPath(DICTS.fr, 'shop.notEnoughCoins', 'Pas assez de pièces.');
_setPath(DICTS.fr, 'shop.acquired', 'Obtenu · {id}');
_setPath(DICTS.fr, 'shop.equippedMsg', 'Équipé · {id}');
_setPath(DICTS.fr, 'shop.purchaseFailed', 'Achat échoué.');
_setPath(DICTS.fr, 'shop.defaultBomb', 'Bombe par défaut');
_setPath(DICTS.fr, 'shop.defaultCell', 'Grille cyan (défaut)');
_setPath(DICTS.fr, 'shop.defaultFx', 'Flash rouge (défaut)');
_setPath(DICTS.fr, 'shop.defaultCursor', 'Curseur par défaut');
_setPath(DICTS.fr, 'shop.free', 'GRATUIT');
_setPath(DICTS.fr, 'shop.equip', 'ÉQUIPER');
_setPath(DICTS.fr, 'shop.equipped', 'ÉQUIPÉ');
_setPath(DICTS.fr, 'shop.buy', 'ACHETER');
_setPath(DICTS.fr, 'shop.buying', 'ACHAT...');

_setPath(DICTS.fr, 'inventory.title', 'INVENTAIRE');
_setPath(DICTS.fr, 'inventory.buyInShop', 'ACHETER DANS LA BOUTIQUE');
_setPath(DICTS.fr, 'inventory.tabs.bombs', 'BOMBES');
_setPath(DICTS.fr, 'inventory.tabs.explosions', 'EXPLOSIONS');
_setPath(DICTS.fr, 'inventory.tabs.cursors', 'CURSEURS');
_setPath(DICTS.fr, 'inventory.tabs.themes', 'THÈMES');

_setPath(DICTS.fr, 'battles.title', 'DUELS');
_setPath(DICTS.fr, 'battles.blurb', 'Trouve des adversaires en temps réel. Même graine, même terrain — le plus rapide gagne.');
_setPath(DICTS.fr, 'battles.simpleTitle', 'DUEL SIMPLE');
_setPath(DICTS.fr, 'battles.simpleSubtitle', 'Casual · Sans rating');
_setPath(DICTS.fr, 'battles.rankedTitle', 'DUEL CLASSÉ');
_setPath(DICTS.fr, 'battles.rankedSubtitle', 'Compétitif · ELO');
_setPath(DICTS.fr, 'battles.searching', 'RECHERCHE...');
_setPath(DICTS.fr, 'battles.found', 'ADVERSAIRE TROUVÉ');
_setPath(DICTS.fr, 'battles.code', 'CODE');
_setPath(DICTS.fr, 'battles.host', 'HÔTE');
_setPath(DICTS.fr, 'battles.opponent', 'ADVERSAIRE');
_setPath(DICTS.fr, 'battles.waiting', 'attente...');
_setPath(DICTS.fr, 'battles.startNow', 'DÉMARRER');
_setPath(DICTS.fr, 'battles.cancel', 'ANNULER');
_setPath(DICTS.fr, 'battles.findOpponent', 'TROUVER');
_setPath(DICTS.fr, 'battles.yourRating', 'TON ELO');
_setPath(DICTS.fr, 'battles.field', 'TERRAIN');
_setPath(DICTS.fr, 'battles.mines', 'MINES');
_setPath(DICTS.fr, 'battles.lives', 'VIES');

_setPath(DICTS.fr, 'campaign.title', 'LE CHEMIN');
_setPath(DICTS.fr, 'campaign.blurb', '{n} nœuds sur un chemin sinueux. Fais défiler ou glisse.');
_setPath(DICTS.fr, 'campaign.infinityOn', 'INFINI ON');
_setPath(DICTS.fr, 'campaign.infinityOff', 'INFINI OFF');
_setPath(DICTS.fr, 'campaign.cleared', 'TERMINÉ');
_setPath(DICTS.fr, 'campaign.stars', 'ÉTOILES');
_setPath(DICTS.fr, 'campaign.start', 'DÉMARRER');

_setPath(DICTS.fr, 'leaderboard.title', 'CLASSEMENT');
_setPath(DICTS.fr, 'leaderboard.top', 'Top 20');
_setPath(DICTS.fr, 'leaderboard.name', 'NOM');
_setPath(DICTS.fr, 'leaderboard.lvl', 'NIV');
_setPath(DICTS.fr, 'leaderboard.score', 'SCORE');
_setPath(DICTS.fr, 'leaderboard.time', 'TEMPS');
_setPath(DICTS.fr, 'leaderboard.loading', 'chargement...');
_setPath(DICTS.fr, 'leaderboard.noRecords', 'Aucun record.');
_setPath(DICTS.fr, 'leaderboard.deleteConfirm', 'Supprimer cette entrée ?');
_setPath(DICTS.fr, 'leaderboard.topRanked', 'Top classé');
_setPath(DICTS.fr, 'leaderboard.noRankedRunsYet', 'aucune partie classée.');
_setPath(DICTS.fr, 'leaderboard.agentStats', 'Stats Agent');
_setPath(DICTS.fr, 'leaderboard.callsignPlaceholder', 'indicatif...');
_setPath(DICTS.fr, 'leaderboard.scan', 'SCANNER');
_setPath(DICTS.fr, 'leaderboard.scanning', 'scan...');
_setPath(DICTS.fr, 'leaderboard.enterCallsignHint', 'Entre un indicatif pour voir les stats.');
_setPath(DICTS.fr, 'leaderboard.recentActivity', 'Activité récente');
_setPath(DICTS.fr, 'leaderboard.noRunsYet', 'aucune partie.');

_setPath(DICTS.fr, 'custom.title', 'PARTIE PERSONNALISÉE');
_setPath(DICTS.fr, 'custom.blurb', 'Configure ta grille et tes skins. Solo ou avec un ami via code.');
_setPath(DICTS.fr, 'custom.rows', 'LIGNES');
_setPath(DICTS.fr, 'custom.cols', 'COLONNES');
_setPath(DICTS.fr, 'custom.mines', 'MINES');
_setPath(DICTS.fr, 'custom.lives', 'VIES');
_setPath(DICTS.fr, 'custom.presets', 'préréglages');
_setPath(DICTS.fr, 'custom.mineCapTitle', 'LIMITE DE MINES APPLIQUÉE.');
_setPath(DICTS.fr, 'custom.mineCapBody', 'Densité bloquée à ~60%.');
_setPath(DICTS.fr, 'custom.solo', 'SOLO');
_setPath(DICTS.fr, 'custom.withFriend', 'AVEC UN AMI');
_setPath(DICTS.fr, 'custom.configPreview', 'aperçu');
_setPath(DICTS.fr, 'custom.estChallenge', 'difficulté');
_setPath(DICTS.fr, 'custom.cells', 'CASES');
_setPath(DICTS.fr, 'custom.safe', 'SÛR');
_setPath(DICTS.fr, 'custom.density', 'DENSITÉ');
_setPath(DICTS.fr, 'custom.fxSkins', 'FX & skins');
_setPath(DICTS.fr, 'custom.diff.easy', 'FACILE');
_setPath(DICTS.fr, 'custom.diff.normal', 'NORMAL');
_setPath(DICTS.fr, 'custom.diff.hard', 'DIFFICILE');
_setPath(DICTS.fr, 'custom.diff.insane', 'INSANE');
_setPath(DICTS.fr, 'custom.skin.mine', 'MINE');
_setPath(DICTS.fr, 'custom.skin.cell', 'CASE');
_setPath(DICTS.fr, 'custom.skin.fx', 'FX');
_setPath(DICTS.fr, 'custom.skin.cursor', 'CURSEUR');
_setPath(DICTS.fr, 'custom.lockedTooltip', 'Verrouillé — acheter en boutique');

// German
_setPath(DICTS.de, 'tagline', '// neuronales minesweeper');
_setPath(DICTS.de, 'tabs.campaign', 'KAMPAGNE');
_setPath(DICTS.de, 'tabs.battles', 'DUELLE');
_setPath(DICTS.de, 'tabs.custom', 'CUSTOM');
_setPath(DICTS.de, 'tabs.shop', 'SHOP');
_setPath(DICTS.de, 'tabs.leaderboard', 'RANGLISTE');
_setPath(DICTS.de, 'tabs.profile', 'PROFIL');
_setPath(DICTS.de, 'tabs.friends', 'FREUNDE');
_setPath(DICTS.de, 'common.login', 'ANMELDEN');
_setPath(DICTS.de, 'common.register', 'REGISTRIEREN');
_setPath(DICTS.de, 'common.logout', 'ABMELDEN · KONTO WECHSELN');
_setPath(DICTS.de, 'common.coins', 'MÜNZEN');
_setPath(DICTS.de, 'common.play', 'SPIELEN');
_setPath(DICTS.de, 'common.cancel', 'ABBRECHEN');
_setPath(DICTS.de, 'common.close', 'SCHLIESSEN');
_setPath(DICTS.de, 'common.remaining', 'LEBEN ÜBRIG');
_setPath(DICTS.de, 'common.findOpponent', 'GEGNER FINDEN');
_setPath(DICTS.de, 'common.createLobby', 'LOBBY ERSTELLEN');
_setPath(DICTS.de, 'common.joinLobby', 'LOBBY BEITRETEN');
_setPath(DICTS.de, 'common.search', 'SUCHEN');
_setPath(DICTS.de, 'common.settings', 'EINSTELLUNGEN');
_setPath(DICTS.de, 'common.language', 'SPRACHE');
_setPath(DICTS.de, 'common.exit', 'BEENDEN');
_setPath(DICTS.de, 'common.continue', 'WEITER');
_setPath(DICTS.de, 'common.back', 'ZURÜCK');
_setPath(DICTS.de, 'common.copy', 'KOPIEREN');
_setPath(DICTS.de, 'common.or', 'ODER');
_setPath(DICTS.de, 'common.yes', 'JA');
_setPath(DICTS.de, 'common.no', 'NEIN');
_setPath(DICTS.de, 'settings.sound', 'SOUND');
_setPath(DICTS.de, 'daily.title', 'TÄGLICH');
_setPath(DICTS.de, 'daily.subtitle', 'TÄGLICHE AUFGABEN');
_setPath(DICTS.de, 'daily.coins', 'MÜNZEN');
_setPath(DICTS.de, 'daily.coinsShort', 'm');
_setPath(DICTS.de, 'daily.resetIn', 'RESET IN');
_setPath(DICTS.de, 'daily.claimed', 'ABGEHOLT');
_setPath(DICTS.de, 'daily.claim', 'ABHOLEN');
_setPath(DICTS.de, 'daily.quests.play_1', '1 Spiel spielen');
_setPath(DICTS.de, 'daily.quests.play_3', '3 Spiele spielen');
_setPath(DICTS.de, 'daily.quests.win_1', '1 Spiel gewinnen');
_setPath(DICTS.de, 'daily.quests.win_3', '3 Spiele gewinnen');
_setPath(DICTS.de, 'daily.quests.lose_1', '1 Spiel verlieren');
_setPath(DICTS.de, 'daily.quests.lose_3', '3 Spiele verlieren');
_setPath(DICTS.de, 'daily.quests.flags_5', '5 Flaggen setzen');
_setPath(DICTS.de, 'daily.quests.flags_20', '20 Flaggen setzen');
_setPath(DICTS.de, 'daily.quests.flags_50', '50 Flaggen setzen');
_setPath(DICTS.de, 'daily.quests.safe_100', '100 sichere Felder aufdecken');
_setPath(DICTS.de, 'daily.quests.safe_250', '250 sichere Felder aufdecken');
_setPath(DICTS.de, 'daily.quests.time_300', '5 Min spielen (300 s)');
_setPath(DICTS.de, 'daily.quests.time_900', '15 Min spielen (900 s)');
_setPath(DICTS.de, 'daily.quests.fast_60', 'Unter 60 s gewinnen');
_setPath(DICTS.de, 'daily.quests.fast_30', 'Unter 30 s gewinnen');
_setPath(DICTS.de, 'daily.quests.no_flags', 'Ohne Flaggen gewinnen');
_setPath(DICTS.de, 'daily.quests.flawless', 'Gewinnen ohne Leben zu verlieren');
_setPath(DICTS.de, 'daily.quests.one_life', 'Mit 1 Leben gewinnen');
_setPath(DICTS.de, 'daily.quests.campaign_1', '1 Kampagnenlevel gewinnen');
_setPath(DICTS.de, 'daily.quests.campaign_3', '3 Kampagnenlevel gewinnen');
_setPath(DICTS.de, 'achievements.title', 'ERFOLGE');
_setPath(DICTS.de, 'achievements.unlocked', 'FREIGESCHALTET');
_setPath(DICTS.de, 'achievements.toast', 'ERFOLG FREIGESCHALTET');
_setPath(DICTS.de, 'achievements.more', 'MEHR');

_setAchievementItems(DICTS.de, {
  games_1: { title: 'ERSTE SCHRITTE', cond: '1 Spiel spielen', desc: 'Erster Schritt. Mehr kommt.' },
  games_10: { title: 'AUFWÄRMEN', cond: '10 Spiele spielen', desc: 'Aufgewärmt. Jetzt wird’s ernst.' },
  games_50: { title: 'STAMMSPIELER', cond: '50 Spiele spielen', desc: 'Schon zur Gewohnheit geworden, oder?' },
  games_200: { title: 'VETERAN', cond: '200 Spiele spielen', desc: 'Du hast alles gesehen. Sogar Schmerz.' },
  games_1000: { title: 'MARATHON', cond: '1000 Spiele spielen', desc: 'Wohnst du hier?' },
  wins_1: { title: 'ERSTER SIEG', cond: '1 Spiel gewinnen', desc: 'Der erste Sieg ist der schönste.' },
  streak_3: { title: 'SIEGESSERIE 3', cond: '3 Siege in Folge', desc: 'Die Serie beginnt. Weiter so.' },
  streak_5: { title: 'SIEGESSERIE 5', cond: '5 Siege in Folge', desc: 'Selbstbewusst. Sehr.' },
  streak_10: { title: 'SIEGESSERIE 10', cond: '10 Siege in Folge', desc: 'Du liest das Feld wie ein Buch.' },
  streak_100: { title: 'SIEGESSERIE 100', cond: '100 Siege in Folge', desc: 'Moment… bist du ein Bot?' },
  flawless_win: { title: 'FEHLERLOS', cond: 'Gewinnen ohne Leben zu verlieren', desc: 'Saubere Arbeit. Keine Kratzer.' },
  speed_win_60: { title: 'SCHNELLER KOPF', cond: 'Unter 60 Sekunden gewinnen', desc: 'Schnell gedacht, schnell geklickt.' },
  speed_win_30: { title: 'SPEEDRUNNER', cond: 'Unter 30 Sekunden gewinnen', desc: 'Hast du überhaupt geblinzelt?' },
  speed_win_20: { title: 'BLITZ', cond: 'Unter 20 Sekunden gewinnen', desc: 'Ein Wimpernschlag.' },
  speed_win_10: { title: 'RAKETE', cond: 'Unter 10 Sekunden gewinnen', desc: 'Fertig, bevor es begann.' },
  flags_1: { title: 'ERSTE FLAGGE', cond: '1 Flagge setzen', desc: 'Erste Flagge. Paranoia startet.' },
  flags_100: { title: 'FLAGGENMEISTER', cond: '100 Flaggen setzen', desc: 'Markieren wie ein Profi.' },
  flags_1000: { title: 'FLAGGENLEGENDE', cond: '1000 Flaggen setzen', desc: 'Mehr Flaggen als Zweifel. Fast.' },
  precise_all_mines: { title: 'PRÄZISE', cond: 'Gewinnen mit Flaggen auf allen Minen', desc: 'Lehrbuch-perfekt.' },
  no_flags_win: { title: 'OHNE FLAGGEN', cond: 'Gewinnen ohne Flaggen', desc: 'Pure Intuition. Oder Wahnsinn.' },
  campaign_1: { title: 'KAMPAGNENSTART', cond: '1 Kampagnenlevel gewinnen', desc: 'Kapitel 1: „Wie schwer kann’s sein?“' },
  campaign_10: { title: 'KAMPAGNE 10', cond: '10 Kampagnenlevel gewinnen', desc: 'Du bist drin. Kein Zurück.' },
  campaign_half: { title: 'HALBZEIT', cond: 'Die Hälfte der Kampagne erreichen', desc: 'Halbzeit. Jetzt wird’s spicy.' },
  campaign_complete: { title: 'KAMPAGNE GESCHAFFT', cond: 'Kampagne abschließen', desc: 'Das Ende. Und du hast überlebt. Wie?' },
  hard_lesson: { title: 'HARTE LEKTION', cond: 'Kampagne 150+ mit 1 Leben gewinnen', desc: 'Ein Fehler und… boom!' },
  duels_1: { title: 'ERSTES DUELL', cond: '1 Duell spielen', desc: 'Willkommen im echten Kampf.' },
  duel_wins_1: { title: 'DUELL-SIEGER', cond: '1 Duell gewinnen', desc: 'Das erste Mal ist immer schön)' },
  ranked_10: { title: 'RANKED BEREIT', cond: '10 Ranked-Duelle spielen', desc: 'Rating ist Schmerz. Du gewöhnst dich.' },
  duel_wins_10: { title: 'RIVALE', cond: '10 Duelle gewinnen', desc: 'Sie erinnern sich. Und sie fürchten dich.' },
  duel_wins_50: { title: 'NEMESIS', cond: '50 Duelle gewinnen', desc: 'Wenn du da bist, bekommt jemand Panik.' },
  comeback_1hp: { title: 'COMEBACK', cond: 'Mit 1 Leben gewinnen', desc: 'Am Abgrund. Trotzdem Sieg.' },
  duel_streak_5: { title: 'UNAUFHALTSAM', cond: '5 Duelle in Folge gewinnen', desc: 'Niemand stoppt dich. Noch nicht.' },
  rating_600: { title: 'AUFSTEIGER', cond: 'Rating 600 erreichen', desc: 'Es geht hoch.' },
  rating_1000: { title: 'SKILLED', cond: 'Rating 1000 erreichen', desc: 'Kein Anfänger mehr.' },
  rating_5000: { title: 'PRO', cond: 'Rating 5000 erreichen', desc: 'Pro. Keine Fragen.' },
  rating_10000: { title: 'ELITE', cond: 'Rating 10000 erreichen', desc: 'Nur Elite.' },
  rating_15000: { title: 'LEGENDE', cond: 'Rating 15000 erreichen', desc: 'Eine echte Legende.' },
  coins_balance_10000: { title: 'LETZTES GELD', cond: '10000 Münzen Kontostand haben', desc: 'Gespart oder nie ausgegeben?' },
  coins_earned_total_10000: { title: 'REICH', cond: 'Insgesamt 10000 Münzen verdienen', desc: 'Nicht schlecht.' },
  daily_claim_1: { title: 'DAILY-CLAIMER', cond: '1 Daily-Quest abholen', desc: 'Belohnungen sind heilig.' },
  daily_streak_5: { title: 'DAILY-SERIE', cond: '5 Fenster in Folge abholen', desc: 'Disziplin. Stahl.' },
});

_setPath(DICTS.de, 'auth.identifyTitle', 'IDENTIFIZIEREN');
_setPath(DICTS.de, 'auth.accessTitle', 'ZUGANG');
_setPath(DICTS.de, 'auth.identifyHint', 'Erstelle deine Identität im Grid.');
_setPath(DICTS.de, 'auth.accessHint', 'Melde dich mit einem vorhandenen Rufzeichen an.');
_setPath(DICTS.de, 'auth.callsignLabel', 'Rufzeichen · 3–20 Zeichen');
_setPath(DICTS.de, 'auth.callsignPlaceholder', 'DEIN_NAME');
_setPath(DICTS.de, 'auth.passwordLabel', 'Passwort · min 4');
_setPath(DICTS.de, 'auth.passwordPlaceholder', '••••••');
_setPath(DICTS.de, 'auth.login', 'ANMELDEN');
_setPath(DICTS.de, 'auth.register', 'REGISTRIEREN');
_setPath(DICTS.de, 'auth.connecting', 'VERBINDUNG...');
_setPath(DICTS.de, 'auth.passwordRequiredHint', 'Passwort erforderlich. Später im Profil ändern.');
_setPath(DICTS.de, 'auth.forgotPasswordHint', 'Passwort vergessen? Frag den Admin.');
_setPath(DICTS.de, 'auth.failedTryAgain', 'Fehlgeschlagen. Versuch es erneut.');

_setPath(DICTS.de, 'lobbyFriend.title', 'MIT FREUND SPIELEN');
_setPath(DICTS.de, 'lobbyFriend.hint', 'Erstelle eine private Lobby und teile den Code oder tritt einer bestehenden bei.');
_setPath(DICTS.de, 'lobbyFriend.codeLabel', 'Lobby-Code · 6 Zeichen');
_setPath(DICTS.de, 'lobbyFriend.shareCode', 'CODE TEILEN');
_setPath(DICTS.de, 'lobbyFriend.host', 'HOST');
_setPath(DICTS.de, 'lobbyFriend.guest', 'GAST');
_setPath(DICTS.de, 'lobbyFriend.waiting', 'warte');
_setPath(DICTS.de, 'lobbyFriend.startNow', 'JETZT STARTEN');
_setPath(DICTS.de, 'lobbyFriend.waitingForHost', 'Warte, bis der Host startet...');
_setPath(DICTS.de, 'lobbyFriend.createFailed', 'Erstellen fehlgeschlagen.');
_setPath(DICTS.de, 'lobbyFriend.joinFailed', 'Beitritt fehlgeschlagen.');
_setPath(DICTS.de, 'lobbyFriend.startFailed', 'Start fehlgeschlagen.');

_setPath(DICTS.de, 'game.controlsHint', '// LINKSKLICK aufdecken · RECHTSKLICK Flagge · 1. Klick ist sicher');
_setPath(DICTS.de, 'game.time', 'ZEIT');
_setPath(DICTS.de, 'game.score', 'PUNKTE');
_setPath(DICTS.de, 'game.lives', 'LEBEN');
_setPath(DICTS.de, 'game.flag', 'FLAGGE');
_setPath(DICTS.de, 'game.reset', 'RESET');
_setPath(DICTS.de, 'game.victory', 'SIEG');
_setPath(DICTS.de, 'game.systemBreach', 'SYSTEMVERLETZUNG');
_setPath(DICTS.de, 'game.cleared', 'geräumt');
_setPath(DICTS.de, 'game.terminated', 'beendet');
_setPath(DICTS.de, 'game.bounty', 'Belohnung');
_setPath(DICTS.de, 'game.adminNoSubmit', '∞ Admin-Modus — Score wird nicht gesendet');
_setPath(DICTS.de, 'game.uploading', 'sende...');
_setPath(DICTS.de, 'game.queued', 'warteschlange...');
_setPath(DICTS.de, 'game.scoreUploaded', '✓ Score gesendet');
_setPath(DICTS.de, 'game.win', 'sieg');
_setPath(DICTS.de, 'game.loss', 'niederlage');
_setPath(DICTS.de, 'game.duelResult', 'DUELLERGEBNIS');
_setPath(DICTS.de, 'game.you', 'DU');
_setPath(DICTS.de, 'game.rival', 'GEGNER');
_setPath(DICTS.de, 'game.youWinDuel', '🏆 DU GEWINNST DAS DUELL');
_setPath(DICTS.de, 'game.defeated', 'BESIEGT');
_setPath(DICTS.de, 'game.tie', 'UNENTSCHIEDEN');
_setPath(DICTS.de, 'game.replay', 'NOCHMAL');
_setPath(DICTS.de, 'game.playAgain', 'NOCHMAL SPIELEN');
_setPath(DICTS.de, 'game.youWon', 'DU HAST GEWONNEN');
_setPath(DICTS.de, 'game.youLost', 'DU HAST VERLOREN');

_setPath(DICTS.de, 'profile.inventory', 'INVENTAR');
_setPath(DICTS.de, 'profile.changePassword', 'PASSWORT ÄNDERN');
_setPath(DICTS.de, 'profile.account', 'KONTO');
_setPath(DICTS.de, 'profile.lifetimeStats', 'STATISTIK');
_setPath(DICTS.de, 'profile.offline', 'offline');
_setPath(DICTS.de, 'profile.loading', 'lädt...');
_setPath(DICTS.de, 'profile.oldPassword', 'Altes Passwort');
_setPath(DICTS.de, 'profile.newPassword', 'Neues Passwort · min 4');
_setPath(DICTS.de, 'profile.repeatNewPassword', 'Passwort wiederholen');
_setPath(DICTS.de, 'profile.passwordsDoNotMatch', 'Passwörter stimmen nicht überein.');
_setPath(DICTS.de, 'profile.passwordUpdated', 'Passwort aktualisiert.');
_setPath(DICTS.de, 'profile.updating', 'AKTUALISIERUNG...');
_setPath(DICTS.de, 'profile.update', 'AKTUALISIEREN');
_setPath(DICTS.de, 'profile.failed', 'Fehlgeschlagen.');

_setPath(DICTS.de, 'friends.title', 'FREUNDE');
_setPath(DICTS.de, 'friends.searchPlaceholder', 'Rufzeichen suchen...');
_setPath(DICTS.de, 'friends.noResult', 'Spieler nicht gefunden.');
_setPath(DICTS.de, 'friends.blurb', 'Suche andere Spieler und sieh dir ihre Stats an.');

_setPath(DICTS.de, 'pause.title', 'PAUSE');
_setPath(DICTS.de, 'pause.exitGame', 'SPIEL BEENDEN');

_setPath(DICTS.de, 'shop.title', 'SHOP');
_setPath(DICTS.de, 'shop.blurb', 'Verdiene Münzen in der Kampagne. Gib sie für Icons, Themes und Effekte aus.');
_setPath(DICTS.de, 'shop.loading', 'katalog lädt...');
_setPath(DICTS.de, 'shop.groups.mine', 'MINEN-ICONS');
_setPath(DICTS.de, 'shop.groups.cell', 'ZELL-THEMES');
_setPath(DICTS.de, 'shop.groups.explosion', 'EXPLOSION-EFFEKTE');
_setPath(DICTS.de, 'shop.groups.cursor', 'CURSORS');
_setPath(DICTS.de, 'shop.notEnoughCoins', 'Nicht genug Münzen.');
_setPath(DICTS.de, 'shop.purchaseFailed', 'Kauf fehlgeschlagen.');
_setPath(DICTS.de, 'shop.defaultBomb', 'Standardbombe');
_setPath(DICTS.de, 'shop.defaultCell', 'Cyan Grid (Standard)');
_setPath(DICTS.de, 'shop.defaultFx', 'Roter Blitz (Standard)');
_setPath(DICTS.de, 'shop.defaultCursor', 'Standardcursor');
_setPath(DICTS.de, 'shop.free', 'KOSTENLOS');
_setPath(DICTS.de, 'shop.equip', 'AUSRÜSTEN');
_setPath(DICTS.de, 'shop.equipped', 'AUSGERÜSTET');
_setPath(DICTS.de, 'shop.buy', 'KAUFEN');
_setPath(DICTS.de, 'shop.buying', 'KAUF...');

_setPath(DICTS.de, 'inventory.title', 'INVENTAR');
_setPath(DICTS.de, 'inventory.buyInShop', 'IM SHOP KAUFEN');
_setPath(DICTS.de, 'inventory.tabs.bombs', 'BOMBEN');
_setPath(DICTS.de, 'inventory.tabs.explosions', 'EXPLOSIONEN');
_setPath(DICTS.de, 'inventory.tabs.cursors', 'CURSORS');
_setPath(DICTS.de, 'inventory.tabs.themes', 'THEMES');

_setPath(DICTS.de, 'battles.title', 'DUELLE');
_setPath(DICTS.de, 'battles.blurb', 'Finde Gegner in Echtzeit. Gleiches Feld — wer schneller räumt, gewinnt.');
_setPath(DICTS.de, 'battles.simpleTitle', 'EINFACH');
_setPath(DICTS.de, 'battles.simpleSubtitle', 'Casual · Kein Rating');
_setPath(DICTS.de, 'battles.rankedTitle', 'RANKED');
_setPath(DICTS.de, 'battles.rankedSubtitle', 'Kompetitiv · ELO');
_setPath(DICTS.de, 'battles.searching', 'SUCHE...');
_setPath(DICTS.de, 'battles.found', 'GEGNER GEFUNDEN');
_setPath(DICTS.de, 'battles.opponent', 'GEGNER');
_setPath(DICTS.de, 'battles.waiting', 'warte...');
_setPath(DICTS.de, 'battles.startNow', 'START');
_setPath(DICTS.de, 'battles.cancel', 'ABBRECHEN');
_setPath(DICTS.de, 'battles.findOpponent', 'FINDEN');
_setPath(DICTS.de, 'battles.yourRating', 'DEIN ELO');
_setPath(DICTS.de, 'battles.field', 'FELD');

_setPath(DICTS.de, 'campaign.title', 'DER PFAD');
_setPath(DICTS.de, 'campaign.blurb', '{n} Knoten auf einem Pfad. Scrollen oder ziehen.');
_setPath(DICTS.de, 'campaign.infinityOn', 'INFINITY AN');
_setPath(DICTS.de, 'campaign.infinityOff', 'INFINITY AUS');
_setPath(DICTS.de, 'campaign.cleared', 'GESCHAFFT');
_setPath(DICTS.de, 'campaign.stars', 'STERNE');
_setPath(DICTS.de, 'campaign.start', 'START');

_setPath(DICTS.de, 'leaderboard.title', 'RANGLISTE');
_setPath(DICTS.de, 'leaderboard.name', 'NAME');
_setPath(DICTS.de, 'leaderboard.lvl', 'LVL');
_setPath(DICTS.de, 'leaderboard.score', 'SCORE');
_setPath(DICTS.de, 'leaderboard.time', 'ZEIT');
_setPath(DICTS.de, 'leaderboard.loading', 'lädt...');
_setPath(DICTS.de, 'leaderboard.noRecords', 'Noch keine Einträge.');
_setPath(DICTS.de, 'leaderboard.deleteConfirm', 'Eintrag löschen?');
_setPath(DICTS.de, 'leaderboard.topRanked', 'Top Ranked');
_setPath(DICTS.de, 'leaderboard.noRankedRunsYet', 'noch keine ranked runs.');
_setPath(DICTS.de, 'leaderboard.agentStats', 'Agent Stats');
_setPath(DICTS.de, 'leaderboard.callsignPlaceholder', 'rufzeichen...');
_setPath(DICTS.de, 'leaderboard.scan', 'SCAN');
_setPath(DICTS.de, 'leaderboard.scanning', 'scan...');
_setPath(DICTS.de, 'leaderboard.enterCallsignHint', 'Rufzeichen eingeben für Stats.');
_setPath(DICTS.de, 'leaderboard.recentActivity', 'Letzte Aktivität');
_setPath(DICTS.de, 'leaderboard.noRunsYet', 'noch keine runs.');

_setPath(DICTS.de, 'custom.title', 'CUSTOM');
_setPath(DICTS.de, 'custom.blurb', 'Konfiguriere dein Grid und Skins. Solo oder mit Freund per Code.');
_setPath(DICTS.de, 'custom.rows', 'ZEILEN');
_setPath(DICTS.de, 'custom.cols', 'SPALTEN');
_setPath(DICTS.de, 'custom.presets', 'presets');
_setPath(DICTS.de, 'custom.mineCapTitle', 'MINENLIMIT AKTIV.');
_setPath(DICTS.de, 'custom.mineCapBody', 'Dichte auf ~60% begrenzt.');
_setPath(DICTS.de, 'custom.solo', 'SOLO');
_setPath(DICTS.de, 'custom.withFriend', 'MIT FREUND');
_setPath(DICTS.de, 'custom.configPreview', 'vorschau');
_setPath(DICTS.de, 'custom.estChallenge', 'schwierigkeit');
_setPath(DICTS.de, 'custom.cells', 'ZELLEN');
_setPath(DICTS.de, 'custom.safe', 'SICHER');
_setPath(DICTS.de, 'custom.density', 'DICHTE');
_setPath(DICTS.de, 'custom.lockedTooltip', 'Gesperrt — im Shop kaufen');

// Chinese (Simplified)
_setPath(DICTS.zh, 'tagline', '// 神经扫雷');
_setPath(DICTS.zh, 'tabs.campaign', '战役');
_setPath(DICTS.zh, 'tabs.battles', '对战');
_setPath(DICTS.zh, 'tabs.custom', '自定义');
_setPath(DICTS.zh, 'tabs.shop', '商店');
_setPath(DICTS.zh, 'tabs.leaderboard', '排行榜');
_setPath(DICTS.zh, 'tabs.profile', '个人');
_setPath(DICTS.zh, 'tabs.friends', '好友');
_setPath(DICTS.zh, 'common.login', '进入');
_setPath(DICTS.zh, 'common.register', '注册');
_setPath(DICTS.zh, 'common.logout', '退出登录 · 切换账号');
_setPath(DICTS.zh, 'common.coins', '金币');
_setPath(DICTS.zh, 'common.rating', 'ELO');
_setPath(DICTS.zh, 'common.play', '开始');
_setPath(DICTS.zh, 'common.cancel', '取消');
_setPath(DICTS.zh, 'common.close', '关闭');
_setPath(DICTS.zh, 'common.remaining', '剩余生命');
_setPath(DICTS.zh, 'common.findOpponent', '匹配对手');
_setPath(DICTS.zh, 'common.createLobby', '创建房间');
_setPath(DICTS.zh, 'common.joinLobby', '加入房间');
_setPath(DICTS.zh, 'common.search', '搜索');
_setPath(DICTS.zh, 'common.settings', '设置');
_setPath(DICTS.zh, 'common.language', '语言');
_setPath(DICTS.zh, 'common.exit', '退出');
_setPath(DICTS.zh, 'common.continue', '继续');
_setPath(DICTS.zh, 'common.back', '返回');
_setPath(DICTS.zh, 'common.copy', '复制');
_setPath(DICTS.zh, 'common.or', '或');
_setPath(DICTS.zh, 'common.vs', '对');
_setPath(DICTS.zh, 'common.yes', '是');
_setPath(DICTS.zh, 'common.no', '否');
_setPath(DICTS.zh, 'settings.sound', '声音');
_setPath(DICTS.zh, 'daily.title', '每日');
_setPath(DICTS.zh, 'daily.subtitle', '每日任务');
_setPath(DICTS.zh, 'daily.coins', '金币');
_setPath(DICTS.zh, 'daily.coinsShort', '币');
_setPath(DICTS.zh, 'daily.resetIn', '重置倒计时');
_setPath(DICTS.zh, 'daily.claimed', '已领取');
_setPath(DICTS.zh, 'daily.claim', '领取');
_setPath(DICTS.zh, 'daily.quests.play_1', '进行 1 局游戏');
_setPath(DICTS.zh, 'daily.quests.play_3', '进行 3 局游戏');
_setPath(DICTS.zh, 'daily.quests.win_1', '赢 1 局');
_setPath(DICTS.zh, 'daily.quests.win_3', '赢 3 局');
_setPath(DICTS.zh, 'daily.quests.lose_1', '输 1 局');
_setPath(DICTS.zh, 'daily.quests.lose_3', '输 3 局');
_setPath(DICTS.zh, 'daily.quests.flags_5', '放置 5 个旗子');
_setPath(DICTS.zh, 'daily.quests.flags_20', '放置 20 个旗子');
_setPath(DICTS.zh, 'daily.quests.flags_50', '放置 50 个旗子');
_setPath(DICTS.zh, 'daily.quests.safe_100', '揭开 100 个安全格');
_setPath(DICTS.zh, 'daily.quests.safe_250', '揭开 250 个安全格');
_setPath(DICTS.zh, 'daily.quests.time_300', '游玩 5 分钟 (300 秒)');
_setPath(DICTS.zh, 'daily.quests.time_900', '游玩 15 分钟 (900 秒)');
_setPath(DICTS.zh, 'daily.quests.fast_60', '60 秒内获胜');
_setPath(DICTS.zh, 'daily.quests.fast_30', '30 秒内获胜');
_setPath(DICTS.zh, 'daily.quests.no_flags', '不放旗子获胜');
_setPath(DICTS.zh, 'daily.quests.flawless', '不失去生命获胜');
_setPath(DICTS.zh, 'daily.quests.one_life', '剩 1 条命获胜');
_setPath(DICTS.zh, 'daily.quests.campaign_1', '通关 1 个战役关卡');
_setPath(DICTS.zh, 'daily.quests.campaign_3', '通关 3 个战役关卡');
_setPath(DICTS.zh, 'achievements.title', '成就');
_setPath(DICTS.zh, 'achievements.unlocked', '已解锁');
_setPath(DICTS.zh, 'achievements.toast', '成就已解锁');
_setPath(DICTS.zh, 'achievements.more', '更多');

_setAchievementItems(DICTS.zh, {
  games_1: { title: '第一步', cond: '进行 1 局游戏', desc: '迈出第一步，更多即将到来。' },
  games_10: { title: '热身', cond: '进行 10 局游戏', desc: '热起来了，接下来更认真。' },
  games_50: { title: '常客', cond: '进行 50 局游戏', desc: '这已经成习惯了吧？' },
  games_200: { title: '老兵', cond: '进行 200 局游戏', desc: '你见识过一切，甚至痛苦。' },
  games_1000: { title: '马拉松', cond: '进行 1000 局游戏', desc: '你住在这里吗？' },
  wins_1: { title: '首次胜利', cond: '赢 1 局', desc: '第一次胜利最甜。' },
  streak_3: { title: '三连胜', cond: '连续赢 3 局', desc: '连胜开始了，继续。' },
  streak_5: { title: '五连胜', cond: '连续赢 5 局', desc: '自信，非常自信。' },
  streak_10: { title: '十连胜', cond: '连续赢 10 局', desc: '你像读书一样读懂棋盘。' },
  streak_100: { title: '百连胜', cond: '连续赢 100 局', desc: '等等…你是机器人吗？' },
  flawless_win: { title: '无伤', cond: '不失去生命获胜', desc: '干净利落，毫发无损。' },
  speed_win_60: { title: '快思维', cond: '60 秒内获胜', desc: '思考快，点击更快。' },
  speed_win_30: { title: '速通玩家', cond: '30 秒内获胜', desc: '你有眨眼吗？' },
  speed_win_20: { title: '闪电', cond: '20 秒内获胜', desc: '眨眼就结束。' },
  speed_win_10: { title: '极速', cond: '10 秒内获胜', desc: '开始前就结束了。' },
  flags_1: { title: '第一面旗', cond: '放置 1 个旗子', desc: '第一面旗， paranoia 开始。' },
  flags_100: { title: '插旗大师', cond: '累计放置 100 个旗子', desc: '标记如同专业选手。' },
  flags_1000: { title: '插旗传奇', cond: '累计放置 1000 个旗子', desc: '旗子比怀疑更多（差不多）。' },
  precise_all_mines: { title: '精准', cond: '所有地雷都插旗并获胜', desc: '教科书般完美。' },
  no_flags_win: { title: '不插旗', cond: '不放旗子获胜', desc: '纯直觉，或纯疯狂。' },
  campaign_1: { title: '战役开局', cond: '通关 1 个战役关卡', desc: '第一章：这有多难？' },
  campaign_10: { title: '战役 10', cond: '通关 10 个战役关卡', desc: '你已经上头，无法回头。' },
  campaign_half: { title: '战役过半', cond: '到达战役一半', desc: '过半了，接下来更刺激。' },
  campaign_complete: { title: '战役通关', cond: '完成战役', desc: '结局。你居然活下来了。' },
  hard_lesson: { title: '惨痛教训', cond: '战役 150+ 且剩 1 条命获胜', desc: '一步错，直接爆。' },
  duels_1: { title: '首次对战', cond: '进行 1 场对战', desc: '欢迎来到真正的战斗。' },
  duel_wins_1: { title: '对战胜者', cond: '赢 1 场对战', desc: '第一次总是很爽)' },
  ranked_10: { title: '排位准备', cond: '进行 10 场排位对战', desc: '分数很痛，但你会习惯。' },
  duel_wins_10: { title: '劲敌', cond: '赢 10 场对战', desc: '他们记得你，并且害怕你。' },
  duel_wins_50: { title: '梦魇', cond: '赢 50 场对战', desc: '你一进房间，就有人紧张。' },
  comeback_1hp: { title: '翻盘', cond: '剩 1 条命获胜', desc: '悬崖边上也能赢。' },
  duel_streak_5: { title: '势不可挡', cond: '对战五连胜', desc: '没人能阻止你。暂时。' },
  rating_600: { title: '上升', cond: '达到 600 ELO', desc: '继续往上。' },
  rating_1000: { title: '熟练', cond: '达到 1000 ELO', desc: '不再是新手。' },
  rating_5000: { title: '职业', cond: '达到 5000 ELO', desc: '职业玩家，毋庸置疑。' },
  rating_10000: { title: '精英', cond: '达到 10000 ELO', desc: '只有精英。' },
  rating_15000: { title: '传奇', cond: '达到 15000 ELO', desc: '真正的传奇。' },
  coins_balance_10000: { title: '最后的钱', cond: '余额达到 10000 金币', desc: '你是攒了很久，还是从不花？' },
  coins_earned_total_10000: { title: '有钱人', cond: '累计获得 10000 金币', desc: '不错。' },
  daily_claim_1: { title: '每日领取', cond: '领取 1 个每日任务', desc: '领奖是神圣的。' },
  daily_streak_5: { title: '每日连签', cond: '连续 5 个窗口领取', desc: '纪律如铁。' },
});

_setPath(DICTS.zh, 'auth.identifyTitle', '身份');
_setPath(DICTS.zh, 'auth.accessTitle', '访问');
_setPath(DICTS.zh, 'auth.identifyHint', '创建你的网格身份。');
_setPath(DICTS.zh, 'auth.accessHint', '使用已有呼号登录。');
_setPath(DICTS.zh, 'auth.callsignLabel', '呼号 · 3–20 字符');
_setPath(DICTS.zh, 'auth.callsignPlaceholder', '你的名字');
_setPath(DICTS.zh, 'auth.passwordLabel', '密码 · 至少 4 位');
_setPath(DICTS.zh, 'auth.passwordPlaceholder', '••••••');
_setPath(DICTS.zh, 'auth.login', '登录');
_setPath(DICTS.zh, 'auth.register', '注册');
_setPath(DICTS.zh, 'auth.connecting', '连接中...');
_setPath(DICTS.zh, 'auth.passwordRequiredHint', '需要密码。可在个人页面修改。');
_setPath(DICTS.zh, 'auth.forgotPasswordHint', '忘记密码？联系管理员。');
_setPath(DICTS.zh, 'auth.failedTryAgain', '失败，请重试。');

_setPath(DICTS.zh, 'lobbyFriend.title', '与好友游戏');
_setPath(DICTS.zh, 'lobbyFriend.hint', '创建私人房间并分享代码，或加入已有房间。');
_setPath(DICTS.zh, 'lobbyFriend.codeLabel', '房间代码 · 6 位');
_setPath(DICTS.zh, 'lobbyFriend.shareCode', '分享代码');
_setPath(DICTS.zh, 'lobbyFriend.host', '房主');
_setPath(DICTS.zh, 'lobbyFriend.guest', '访客');
_setPath(DICTS.zh, 'lobbyFriend.waiting', '等待');
_setPath(DICTS.zh, 'lobbyFriend.startNow', '立即开始');
_setPath(DICTS.zh, 'lobbyFriend.waitingForHost', '等待房主开始...');
_setPath(DICTS.zh, 'lobbyFriend.createFailed', '创建失败。');
_setPath(DICTS.zh, 'lobbyFriend.joinFailed', '加入失败。');
_setPath(DICTS.zh, 'lobbyFriend.startFailed', '开始失败。');

_setPath(DICTS.zh, 'game.controlsHint', '// 左键揭开 · 右键插旗 · 第一次点击安全');
_setPath(DICTS.zh, 'game.time', '时间');
_setPath(DICTS.zh, 'game.mines', '地雷');
_setPath(DICTS.zh, 'game.score', '分数');
_setPath(DICTS.zh, 'game.lives', '生命');
_setPath(DICTS.zh, 'game.flag', '旗子');
_setPath(DICTS.zh, 'game.reset', '重置');
_setPath(DICTS.zh, 'game.victory', '胜利');
_setPath(DICTS.zh, 'game.systemBreach', '系统入侵');
_setPath(DICTS.zh, 'game.cleared', '已清除');
_setPath(DICTS.zh, 'game.terminated', '已终止');
_setPath(DICTS.zh, 'game.bounty', '奖励');
_setPath(DICTS.zh, 'game.adminNoSubmit', '∞ 管理员模式 — 不提交成绩');
_setPath(DICTS.zh, 'game.uploading', '上传中...');
_setPath(DICTS.zh, 'game.queued', '排队中...');
_setPath(DICTS.zh, 'game.scoreUploaded', '✓ 成绩已上传');
_setPath(DICTS.zh, 'game.win', '胜');
_setPath(DICTS.zh, 'game.loss', '负');
_setPath(DICTS.zh, 'game.duelResult', '对战结果');
_setPath(DICTS.zh, 'game.you', '你');
_setPath(DICTS.zh, 'game.rival', '对手');
_setPath(DICTS.zh, 'game.youWinDuel', '🏆 你赢了对战');
_setPath(DICTS.zh, 'game.defeated', '失败');
_setPath(DICTS.zh, 'game.tie', '平局');
_setPath(DICTS.zh, 'game.replay', '重放');
_setPath(DICTS.zh, 'game.playAgain', '再来一局');
_setPath(DICTS.zh, 'game.youWon', '你赢了');
_setPath(DICTS.zh, 'game.youLost', '你输了');

_setPath(DICTS.zh, 'profile.inventory', '背包');
_setPath(DICTS.zh, 'profile.changePassword', '修改密码');
_setPath(DICTS.zh, 'profile.account', '账号');
_setPath(DICTS.zh, 'profile.lifetimeStats', '生涯数据');
_setPath(DICTS.zh, 'profile.offline', '离线');
_setPath(DICTS.zh, 'profile.loading', '加载中...');
_setPath(DICTS.zh, 'profile.playerId', 'ID');
_setPath(DICTS.zh, 'profile.oldPassword', '旧密码');
_setPath(DICTS.zh, 'profile.newPassword', '新密码 · 至少 4 位');
_setPath(DICTS.zh, 'profile.repeatNewPassword', '重复新密码');
_setPath(DICTS.zh, 'profile.passwordsDoNotMatch', '两次密码不一致。');
_setPath(DICTS.zh, 'profile.passwordUpdated', '密码已更新。');
_setPath(DICTS.zh, 'profile.updating', '更新中...');
_setPath(DICTS.zh, 'profile.update', '更新');
_setPath(DICTS.zh, 'profile.failed', '失败。');

_setPath(DICTS.zh, 'friends.title', '好友');
_setPath(DICTS.zh, 'friends.searchPlaceholder', '搜索呼号...');
_setPath(DICTS.zh, 'friends.noResult', '未找到玩家。');
_setPath(DICTS.zh, 'friends.blurb', '搜索其他玩家并查看他们的生涯数据。');

_setPath(DICTS.zh, 'pause.title', '暂停');
_setPath(DICTS.zh, 'pause.exitGame', '退出游戏');

_setPath(DICTS.zh, 'shop.title', '商店');
_setPath(DICTS.zh, 'shop.blurb', '通过通关战役获得金币，用于购买图标、主题和特效。');
_setPath(DICTS.zh, 'shop.loading', '加载中...');
_setPath(DICTS.zh, 'shop.groups.mine', '地雷图标');
_setPath(DICTS.zh, 'shop.groups.cell', '格子主题');
_setPath(DICTS.zh, 'shop.groups.explosion', '爆炸特效');
_setPath(DICTS.zh, 'shop.groups.cursor', '光标');
_setPath(DICTS.zh, 'shop.notEnoughCoins', '金币不足。');
_setPath(DICTS.zh, 'shop.acquired', '已获得 · {id}');
_setPath(DICTS.zh, 'shop.equippedMsg', '已装备 · {id}');
_setPath(DICTS.zh, 'shop.purchaseFailed', '购买失败。');
_setPath(DICTS.zh, 'shop.defaultBomb', '默认炸弹');
_setPath(DICTS.zh, 'shop.defaultCell', '青色网格（默认）');
_setPath(DICTS.zh, 'shop.defaultFx', '红色闪光（默认）');
_setPath(DICTS.zh, 'shop.defaultCursor', '默认光标');
_setPath(DICTS.zh, 'shop.free', '免费');
_setPath(DICTS.zh, 'shop.equip', '装备');
_setPath(DICTS.zh, 'shop.equipped', '已装备');
_setPath(DICTS.zh, 'shop.buy', '购买');
_setPath(DICTS.zh, 'shop.buying', '购买中...');

_setPath(DICTS.zh, 'inventory.title', '背包');
_setPath(DICTS.zh, 'inventory.buyInShop', '去商店购买');
_setPath(DICTS.zh, 'inventory.tabs.bombs', '炸弹');
_setPath(DICTS.zh, 'inventory.tabs.explosions', '爆炸');
_setPath(DICTS.zh, 'inventory.tabs.cursors', '光标');
_setPath(DICTS.zh, 'inventory.tabs.themes', '主题');

_setPath(DICTS.zh, 'battles.title', '对战');
_setPath(DICTS.zh, 'battles.blurb', '实时匹配对手。同一地图种子 — 谁先清完谁赢。');
_setPath(DICTS.zh, 'battles.simpleTitle', '普通对战');
_setPath(DICTS.zh, 'battles.simpleSubtitle', '休闲 · 无排名');
_setPath(DICTS.zh, 'battles.rankedTitle', '排位对战');
_setPath(DICTS.zh, 'battles.rankedSubtitle', '竞技 · ELO');
_setPath(DICTS.zh, 'battles.searching', '匹配中...');
_setPath(DICTS.zh, 'battles.found', '已找到对手');
_setPath(DICTS.zh, 'battles.code', '代码');
_setPath(DICTS.zh, 'battles.host', '房主');
_setPath(DICTS.zh, 'battles.opponent', '对手');
_setPath(DICTS.zh, 'battles.waiting', '等待中...');
_setPath(DICTS.zh, 'battles.startNow', '开始');
_setPath(DICTS.zh, 'battles.cancel', '取消');
_setPath(DICTS.zh, 'battles.findOpponent', '匹配');
_setPath(DICTS.zh, 'battles.yourRating', '你的 ELO');
_setPath(DICTS.zh, 'battles.field', '地图');
_setPath(DICTS.zh, 'battles.mines', '地雷');
_setPath(DICTS.zh, 'battles.lives', '生命');

_setPath(DICTS.zh, 'campaign.title', '道路');
_setPath(DICTS.zh, 'campaign.blurb', '{n} 个节点的蜿蜒之路。滚轮或拖动。');
_setPath(DICTS.zh, 'campaign.infinityOn', '无限：开');
_setPath(DICTS.zh, 'campaign.infinityOff', '无限：关');
_setPath(DICTS.zh, 'campaign.cleared', '已通关');
_setPath(DICTS.zh, 'campaign.stars', '星');
_setPath(DICTS.zh, 'campaign.start', '开始');

_setPath(DICTS.zh, 'leaderboard.title', '排行榜');
_setPath(DICTS.zh, 'leaderboard.top', '前 20');
_setPath(DICTS.zh, 'leaderboard.name', '名字');
_setPath(DICTS.zh, 'leaderboard.lvl', '等级');
_setPath(DICTS.zh, 'leaderboard.score', '分数');
_setPath(DICTS.zh, 'leaderboard.time', '时间');
_setPath(DICTS.zh, 'leaderboard.loading', '加载中...');
_setPath(DICTS.zh, 'leaderboard.noRecords', '暂无记录。');
_setPath(DICTS.zh, 'leaderboard.deleteConfirm', '删除该记录？');
_setPath(DICTS.zh, 'leaderboard.topRanked', '排位 Top');
_setPath(DICTS.zh, 'leaderboard.noRankedRunsYet', '暂无排位记录。');
_setPath(DICTS.zh, 'leaderboard.agentStats', '玩家数据');
_setPath(DICTS.zh, 'leaderboard.callsignPlaceholder', '呼号...');
_setPath(DICTS.zh, 'leaderboard.scan', '扫描');
_setPath(DICTS.zh, 'leaderboard.scanning', '扫描中...');
_setPath(DICTS.zh, 'leaderboard.enterCallsignHint', '输入呼号查看生涯数据。');
_setPath(DICTS.zh, 'leaderboard.recentActivity', '最近记录');
_setPath(DICTS.zh, 'leaderboard.noRunsYet', '暂无记录。');

_setPath(DICTS.zh, 'custom.title', '自定义扫雷');
_setPath(DICTS.zh, 'custom.blurb', '自定义网格和皮肤。单人或与好友通过代码一起玩。');
_setPath(DICTS.zh, 'custom.rows', '行');
_setPath(DICTS.zh, 'custom.cols', '列');
_setPath(DICTS.zh, 'custom.mines', '地雷');
_setPath(DICTS.zh, 'custom.lives', '生命');
_setPath(DICTS.zh, 'custom.presets', '预设');
_setPath(DICTS.zh, 'custom.mineCapTitle', '已应用地雷上限。');
_setPath(DICTS.zh, 'custom.mineCapBody', '密度锁定在 ~60%。');
_setPath(DICTS.zh, 'custom.solo', '单人');
_setPath(DICTS.zh, 'custom.withFriend', '与好友');
_setPath(DICTS.zh, 'custom.configPreview', '配置预览');
_setPath(DICTS.zh, 'custom.estChallenge', '难度');
_setPath(DICTS.zh, 'custom.cells', '格子');
_setPath(DICTS.zh, 'custom.safe', '安全');
_setPath(DICTS.zh, 'custom.density', '密度');
_setPath(DICTS.zh, 'custom.fxSkins', '特效与皮肤');
_setPath(DICTS.zh, 'custom.diff.easy', '简单');
_setPath(DICTS.zh, 'custom.diff.normal', '普通');
_setPath(DICTS.zh, 'custom.diff.hard', '困难');
_setPath(DICTS.zh, 'custom.diff.insane', '地狱');
_setPath(DICTS.zh, 'custom.skin.mine', '地雷');
_setPath(DICTS.zh, 'custom.skin.cell', '格子');
_setPath(DICTS.zh, 'custom.skin.fx', '特效');
_setPath(DICTS.zh, 'custom.skin.cursor', '光标');
_setPath(DICTS.zh, 'custom.lockedTooltip', '已锁定 — 去商店购买');

const KEY = 'mg_lang';

const _detectSystemLang = () => {
  try {
    if (typeof navigator === 'undefined') return null;
    const list = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language].filter(Boolean);
    for (const raw of list) {
      const code = String(raw || '').toLowerCase();
      if (!code) continue;
      if (DICTS[code]) return code;
      const base = code.split(/[-_]/)[0];
      if (base && DICTS[base]) return base;
    }
    return null;
  } catch {
    return null;
  }
};

let CURRENT = (() => {
  try {
    const v = localStorage.getItem(KEY);
    if (v && DICTS[v]) return v;
    const sys = _detectSystemLang();
    return sys && DICTS[sys] ? sys : 'en';
  } catch {
    const sys = _detectSystemLang();
    return sys && DICTS[sys] ? sys : 'en';
  }
})();

const listeners = new Set();

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'uk', name: 'Українська' },
  { code: 'cs', name: 'Čeština' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '简体中文' },
];

export const getLang = () => CURRENT;
export const setLang = (code) => {
  if (!DICTS[code]) return;
  CURRENT = code;
  localStorage.setItem(KEY, code);
  listeners.forEach(fn => fn(code));
};

export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

// Dot-path accessor: t('tabs.campaign')
export const t = (path, lang) => {
  const l = lang || CURRENT;
  const parts = path.split('.');
  let node = DICTS[l] || DICTS.en;
  for (const p of parts) {
    if (node && Object.prototype.hasOwnProperty.call(node, p)) node = node[p];
    else { node = null; break; }
  }
  if (typeof node !== 'string') {
    // fallback to english
    let node2 = DICTS.en;
    for (const p of parts) node2 = node2?.[p];
    return typeof node2 === 'string' ? node2 : path;
  }
  return node;
};

// React hook
import { useEffect, useState } from 'react';
export const useLang = () => {
  const [lang, setL] = useState(CURRENT);
  useEffect(() => subscribe(setL), []);
  return [lang, setLang];
};
