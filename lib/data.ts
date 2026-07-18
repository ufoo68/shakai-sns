// shakai — 共有用のモックデータと分類定義
// デザインプロトタイプのため、実データではなくサンプルを使用しています。

export const GENRES = [
  "政治",
  "歴史",
  "経済",
  "社会",
  "国際関係",
  "文化",
  "思想",
] as const

export type Genre = (typeof GENRES)[number]

// 区分: 投稿がどんな性質のものか
export const DIVISIONS = ["学び", "考察", "問い", "意見"] as const
export type Division = (typeof DIVISIONS)[number]

// 形態: 投稿の形式
export const FORMS = ["短文", "長文", "書評", "引用"] as const
export type Form = (typeof FORMS)[number]

export type User = {
  id: string
  name: string
  handle: string
  avatar: string
  bio: string
  interests: Genre[]
}

export type Post = {
  id: string
  author: User
  createdAt: string
  genre: Genre
  division: Division
  form: Form
  title: string
  excerpt: string
  empathy: number
  comments: number
  bookmarks: number
}

export type Book = {
  id: string
  title: string
  author: string
  status: "読んだ" | "読んでいる" | "読みたい"
  cover: string
  note?: string
}

export const users: User[] = [
  {
    id: "u1",
    name: "佐々木 涼",
    handle: "ryo_s",
    avatar: "/avatars/ryo.png",
    bio: "近代史と民主主義のあり方について考えています。原典と一次資料を大切に。",
    interests: ["歴史", "政治", "思想"],
  },
  {
    id: "u2",
    name: "三浦 あかね",
    handle: "akane",
    avatar: "/avatars/akane.png",
    bio: "経済と社会保障のつながりに関心。数字の背景にある人の暮らしを見たい。",
    interests: ["経済", "社会"],
  },
  {
    id: "u3",
    name: "Leo Tanaka",
    handle: "leo_t",
    avatar: "/avatars/leo.png",
    bio: "国際関係と移民政策。複数の視点を行き来しながら考えるのが好きです。",
    interests: ["国際関係", "文化"],
  },
  {
    id: "u4",
    name: "岡田 美咲",
    handle: "misaki_o",
    avatar: "/avatars/misaki.png",
    bio: "思想史と現代の倫理。問いを立てることそのものに興味があります。",
    interests: ["思想", "文化", "社会"],
  },
]

export const posts: Post[] = [
  {
    id: "p1",
    author: users[0],
    createdAt: "3時間前",
    genre: "歴史",
    division: "学び",
    form: "書評",
    title: "『銃・病原菌・鉄』を読み返して気づいた、地理と文明の距離",
    excerpt:
      "久しぶりに読み返して、環境要因が社会の分岐にどれほど影響したのかを改めて考えました。決定論に陥らずに、条件と選択の両面から捉えると…",
    empathy: 128,
    comments: 24,
    bookmarks: 41,
  },
  {
    id: "p2",
    author: users[1],
    createdAt: "6時間前",
    genre: "経済",
    division: "考察",
    form: "長文",
    title: "インフレ下の賃金は、なぜ「実感」と統計でずれるのか",
    excerpt:
      "名目賃金の伸びと実質賃金の差、そして家計ごとの支出構成の違い。平均値が見えにくくしているものを丁寧にほどいていくと…",
    empathy: 96,
    comments: 31,
    bookmarks: 58,
  },
  {
    id: "p3",
    author: users[2],
    createdAt: "昨日",
    genre: "国際関係",
    division: "問い",
    form: "短文",
    title: "「国益」という言葉は、誰の利益を指しているのだろう",
    excerpt:
      "外交の議論で当然のように使われるこの言葉。主語を具体的にしていくと、思っていたより多くの前提が隠れていることに気づきます。",
    empathy: 74,
    comments: 47,
    bookmarks: 19,
  },
  {
    id: "p4",
    author: users[3],
    createdAt: "2日前",
    genre: "思想",
    division: "意見",
    form: "引用",
    title: "アーレントの「複数性」を、いまのSNSに置き直してみる",
    excerpt:
      "人は複数で存在するからこそ公共が生まれる、という視点。私たちが今いる場も、意見の違いを消すのではなく並べる場所であってほしい。",
    empathy: 152,
    comments: 18,
    bookmarks: 63,
  },
  {
    id: "p5",
    author: users[1],
    createdAt: "3日前",
    genre: "社会",
    division: "学び",
    form: "短文",
    title: "地方の公共交通を「効率」だけで測れない理由",
    excerpt:
      "採算の議論はもちろん重要。けれど移動の自由が失われたとき、暮らしの選択肢そのものが縮む。指標に入りにくい価値をどう扱うか。",
    empathy: 88,
    comments: 12,
    bookmarks: 27,
  },
]

export const books: Book[] = [
  {
    id: "b1",
    title: "想像の共同体",
    author: "ベネディクト・アンダーソン",
    status: "読んだ",
    cover: "/books/book-1.png",
    note: "ナショナリズムを「作られたもの」として捉える視点が新鮮でした。",
  },
  {
    id: "b2",
    title: "人間の条件",
    author: "ハンナ・アーレント",
    status: "読んでいる",
    cover: "/books/book-2.png",
    note: "「活動」と「労働」の区別を何度も読み返しています。",
  },
  {
    id: "b3",
    title: "21世紀の資本",
    author: "トマ・ピケティ",
    status: "読んだ",
    cover: "/books/book-3.png",
  },
  {
    id: "b4",
    title: "歴史とは何か",
    author: "E・H・カー",
    status: "読みたい",
    cover: "/books/book-4.png",
  },
  {
    id: "b5",
    title: "自由からの逃走",
    author: "エーリッヒ・フロム",
    status: "読んだ",
    cover: "/books/book-5.png",
  },
]

// ジャンルごとの淡い色付け(トークンベースの控えめな配色)
export const genreTint: Record<Genre, string> = {
  政治: "bg-accent text-accent-foreground",
  歴史: "bg-secondary text-secondary-foreground",
  経済: "bg-accent text-accent-foreground",
  社会: "bg-secondary text-secondary-foreground",
  国際関係: "bg-accent text-accent-foreground",
  文化: "bg-secondary text-secondary-foreground",
  思想: "bg-accent text-accent-foreground",
}
