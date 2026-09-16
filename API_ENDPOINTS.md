# 外部API

Base URL: `/api/v1`

## 認証

Better Authの有効なセッショントークンを、次の形式で送信します。

```http
Authorization: Bearer <session-token>
```

トークンはクライアントに安全に保存し、ログアウト時または期限切れ時に破棄してください。データベース接続情報や管理者キーはクライアントへ渡しません。

## エンドポイント

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/v1/me` | 認証中ユーザーを取得 |
| GET | `/api/v1/posts?limit=20&offset=0` | 公開投稿一覧を取得 |
| POST | `/api/v1/posts` | 投稿を作成 |
| GET | `/api/v1/me/profile` | 自分のプロフィールを取得 |
| PATCH | `/api/v1/me/profile` | 自分のプロフィールを更新 |
| GET | `/api/v1/profiles/:handle` | ハンドルからプロフィールを取得 |
| GET | `/api/v1/profiles/:handle/follow` | 未使用（フォロー状態はプロフィールに含む） |
| POST | `/api/v1/profiles/:handle/follow` | プロフィールをフォロー |
| DELETE | `/api/v1/profiles/:handle/follow` | プロフィールのフォローを解除 |
| GET | `/api/v1/profiles/suggestions` | おすすめプロフィールを取得 |
| POST | `/api/v1/me/avatar` | 自分のアバター画像を更新 |
| GET | `/api/v1/me/books?limit=20&offset=0&status=読んだ` | 自分の本棚を取得 |
| POST | `/api/v1/me/books` | 本を追加 |
| PATCH | `/api/v1/me/books/:id` | 本を編集 |
| DELETE | `/api/v1/me/books/:id` | 本を削除 |

投稿作成のJSON:

```json
{
  "genre": "思想",
  "division": "個人",
  "form": "短文",
  "title": "タイトル",
  "body": "本文"
}
```

## 共通レスポンス

成功時は `{ "data": ... }`、失敗時は次の形式です。

```json
{ "error": { "code": "UNAUTHORIZED", "message": "..." } }
```

`limit`は1〜50、`offset`は0以上です。プロフィール候補の`limit`は1〜20です。プロフィール更新のJSONは次のいずれかを含めます。

```json
{
  "bio": "自己紹介",
  "currentThought": "最近考えていること",
  "interests": ["思想", "文学"]
}
```

フォロー操作は次の形式です。

```http
POST /api/v1/profiles/:handle/follow
DELETE /api/v1/profiles/:handle/follow
```

許可オリジンは`API_CORS_ORIGINS`にカンマ区切りで設定してください。未設定時はCORSを許可しません。

## アバター更新

`POST /api/v1/me/avatar` は `multipart/form-data` を使用し、`file` フィールドにJPEG、PNG、またはWebP画像を送信します。最大サイズは5MBです。成功時は公開Blob URLを返します。

## 本棚

本の追加・編集では次のJSONを送信します。`status` は `読んだ`、`読んでいる`、`読みたい` のいずれかです。

```json
{
  "title": "本のタイトル",
  "author": "著者名",
  "translator": "翻訳者名",
  "status": "読んだ",
  "note": "メモ"
}
```

本棚一覧は `limit`（1〜50）、`offset`（0以上）、`status` で絞り込めます。すべての本棚操作は認証ユーザー自身のデータに限定されます。
