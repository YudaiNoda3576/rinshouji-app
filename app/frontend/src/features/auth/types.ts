// 認証ドメインの型。

export interface AuthUser {
  id: string;
}

export type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false };
