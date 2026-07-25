import type { Language } from '@/i18n/config'

interface Translation {
  title: string
  subtitle: string
  description: string
  posts: string
  tags: string
  about: string
  toc: string
  friends: string
  notes: string
  self: string
  friendsPage?: FriendsPageTranslation
}

export interface FriendsPageTranslation {
  intro: string
  count: string
  updated: string
  empty: string
  applicationTitle: string
  applicationDescription: string
  nameLabel: string
  namePlaceholder: string
  urlLabel: string
  urlPlaceholder: string
  avatarLabel: string
  avatarPlaceholder: string
  descriptionLabel: string
  descriptionPlaceholder: string
  copyButton: string
  copySuccess: string
  copyFailure: string
  copyHint: string
  commentDescription: string
  requiredError: string
  urlError: string
  avatarError: string
  descriptionError: string
}

export const ui: Record<Language, Translation> = {
  'de': {
    title: 'Eindimensionales Universum Eaverse',
    subtitle: 'Beende die Vergangenheit, öffne die Zukunft',
    description: 'Begrabe die Vergangenheit, fliehe vor der Realität',
    posts: 'Artikel',
    tags: 'Tags',
    about: 'Über',
    toc: 'Inhaltsverzeichnis',
    friends: 'Freunde',
    notes: 'Notizen',
    self: 'Selbstdefinition',
  },
  'en': {
    title: 'One-Dimensional Universe Eaverse',
    subtitle: 'End the past, open the future',
    description: 'Bury the past, escape reality',
    posts: 'Articles',
    tags: 'Tags',
    about: 'About',
    toc: 'Table of Contents',
    friends: 'Friends',
    notes: 'Notes',
    self: 'Self Definition',
  },
  'es': {
    title: 'Universo Unidimensional Eaverse',
    subtitle: 'Termina el pasado, abre el futuro',
    description: 'Enterra el pasado, escapa de la realidad',
    posts: 'Artículos',
    tags: 'Etiquetas',
    about: 'Sobre',
    toc: 'Índice',
    friends: 'Amigos',
    notes: 'Notas',
    self: 'Autodefinición',
  },
  'fr': {
    title: 'Univers Unidimensionnel Eaverse',
    subtitle: 'Termine le passé, ouvre le futur',
    description: 'Enterre le passé, échappe à la réalité',
    posts: 'Articles',
    tags: 'Étiquettes',
    about: 'À propos',
    toc: 'Table des matières',
    friends: 'Amis',
    notes: 'Notes',
    self: 'Auto-définition',
  },
  'ja': {
    title: '一次元宇宙Eaverse',
    subtitle: '過去を終え、未来を開く',
    description: '過去を埋葬し、現実から逃れる',
    posts: '文章',
    tags: 'タグ',
    about: '关于',
    toc: '目次',
    friends: '友達',
    notes: 'ノート',
    self: '自己定義',
  },
  'ko': {
    title: '1차원 우주Eaverse',
    subtitle: '과거를 끝내고, 미래를 열다',
    description: '과거를 묻고, 현실에서 도망치다',
    posts: '글',
    tags: '태그',
    about: '에 관하여',
    toc: '목차',
    friends: '친구들',
    notes: '노트',
    self: '자기 정의',
  },
  'pl': {
    title: 'Jednowymiarowy Wszechświat Eaverse',
    subtitle: 'Zakończ przeszłość, otwórz przyszłość',
    description: 'Pogrzeb przeszłość, uciekaj od rzeczywistości',
    posts: 'Artykuły',
    tags: 'Tagi',
    about: 'O',
    toc: 'Spis treści',
    friends: 'Przyjaciele',
    notes: 'Notatki',
    self: 'Samookreślenie',
  },
  'pt': {
    title: 'Universo Unidimensional Eaverse',
    subtitle: 'Termine o passado, abra o futuro',
    description: 'Enterre o passado, fuja da realidade',
    posts: 'Artigos',
    tags: 'Tags',
    about: 'Sobre',
    toc: 'Sumário',
    friends: 'Amigos',
    notes: 'Notas',
    self: 'Autodefinição',
  },
  'ru': {
    title: 'Одномерная вселенная Eaverse',
    subtitle: 'Закончи прошлое, открой будущее',
    description: 'Похорони прошлое, убегай от реальности',
    posts: 'Статьи',
    tags: 'Теги',
    about: 'О',
    toc: 'Содержание',
    friends: 'Друзья',
    notes: 'Заметки',
    self: 'Самоопределение',
  },
  'zh': {
    title: '烙饼的碎碎念',
    subtitle: 'End the past, start the new.',
    description: 'End the past, start the new.',
    posts: '文章',
    tags: '标签',
    about: '关于',
    toc: '目录',
    friends: '友联',
    notes: '笔记',
    self: '自设',
    friendsPage: {
      intro: '以下是我的朋友们。如果你想交换友链，可以先填写申请信息，再到评论区提交。',
      count: '共 {count} 个友链',
      updated: '数据更新于 {date}',
      empty: '暂无友链数据',
      applicationTitle: '申请交换友链',
      applicationDescription: '填写后复制标准申请内容，页面会自动定位到评论区。',
      nameLabel: '博客名称',
      namePlaceholder: '例如：烙饼的碎碎念',
      urlLabel: '博客地址',
      urlPlaceholder: 'https://example.com',
      avatarLabel: '头像地址',
      avatarPlaceholder: 'https://example.com/avatar.png',
      descriptionLabel: '博客简介',
      descriptionPlaceholder: '用一句话介绍你的博客',
      copyButton: '复制申请内容',
      copySuccess: '已复制，请在评论区粘贴并提交。',
      copyFailure: '复制失败，请检查浏览器剪贴板权限。',
      copyHint: '简介最多 120 个字符。',
      commentDescription: '复制申请内容后，请在下方评论区粘贴并提交，我会尽快审核添加。',
      requiredError: '请填写博客名称。',
      urlError: '请输入 http 或 https 开头的博客地址。',
      avatarError: '请输入有效的头像 URL。',
      descriptionError: '简介不能超过 120 个字符。',
    },
  },
  'zh-tw': {
    title: '一維宇宙Eaverse',
    subtitle: '終結過去，開啟未來',
    description: '埋葬過去，逃避現實',
    posts: '文章',
    tags: '標籤',
    about: '關於',
    toc: '目錄',
    friends: '友聯',
    notes: '筆記',
    self: '自設',
    friendsPage: {
      intro: '以下是我的朋友們。如果你想交換友鏈，可以先填寫申請資訊，再到評論區提交。',
      count: '共 {count} 個友鏈',
      updated: '資料更新於 {date}',
      empty: '暫無友鏈資料',
      applicationTitle: '申請交換友鏈',
      applicationDescription: '填寫後複製標準申請內容，頁面會自動定位到評論區。',
      nameLabel: '部落格名稱',
      namePlaceholder: '例如：烙餅的碎碎念',
      urlLabel: '部落格地址',
      urlPlaceholder: 'https://example.com',
      avatarLabel: '頭像地址',
      avatarPlaceholder: 'https://example.com/avatar.png',
      descriptionLabel: '部落格簡介',
      descriptionPlaceholder: '用一句話介紹你的部落格',
      copyButton: '複製申請內容',
      copySuccess: '已複製，請在評論區貼上並提交。',
      copyFailure: '複製失敗，請檢查瀏覽器剪貼簿權限。',
      copyHint: '簡介最多 120 個字元。',
      commentDescription: '複製申請內容後，請在下方評論區貼上並提交，我會盡快審核新增。',
      requiredError: '請填寫部落格名稱。',
      urlError: '請輸入 http 或 https 開頭的部落格地址。',
      avatarError: '請輸入有效的頭像 URL。',
      descriptionError: '簡介不能超過 120 個字元。',
    },
  },
}
