// ================================================================
// hana-works お問い合わせフォーム — Cloudflare Workers
// ================================================================
// 【セットアップ手順】
// 1. Cloudflare ダッシュボードで新しいWorkerを作成
// 2. このファイルの内容をWorkerのコードエディタに貼り付け
// 3. 「Settings」→「Variables」から環境変数を追加：
//      RESEND_API_KEY = （ResendのAPIキー）
// 4. Workerをデプロイ
// 5. contact.html の WORKER_URL をデプロイ後のURLに変更
// ================================================================

// 自分の受信メールアドレス（お問い合わせ通知の送信先）
const OWNER_EMAIL = 'kuroneko.kurt@gmail.com';
// 送信元メールアドレス（Resendで認証済みドメインのアドレス）
const FROM_EMAIL  = 'info@hana-works.jp';
// サイト名（メールの件名などに使用）
const SITE_NAME   = 'hana-works';

export default {
  async fetch(request, env) {

    // CORS プリフライトリクエスト（ブラウザが自動で送るOPTIONS）の処理
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    // POST 以外のリクエストは拒否
    if (request.method !== 'POST') {
      return corsResponse({ error: 'Method Not Allowed' }, 405);
    }

    // リクエストのJSONを解析
    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse({ error: 'リクエストの形式が正しくありません' }, 400);
    }

    // 入力値を取得してトリミング
    const name    = (body.name    || '').trim();
    const email   = (body.email   || '').trim();
    const message = (body.message || '').trim();

    // サーバーサイドのバリデーション
    if (!name || !email || !message) {
      return corsResponse({ error: '必須項目が未入力です' }, 400);
    }
    if (!isValidEmail(email)) {
      return corsResponse({ error: 'メールアドレスの形式が正しくありません' }, 400);
    }

    // APIキーが設定されているか確認
    if (!env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY が設定されていません');
      return corsResponse({ error: 'サーバー設定エラーが発生しました' }, 500);
    }

    // ── 1) 自分への通知メール ──
    // reply_to を送信者のメールアドレスにすると、返信ボタンで直接返信できる
    const notifyResult = await sendEmail(env.RESEND_API_KEY, {
      from:     FROM_EMAIL,
      to:       [OWNER_EMAIL],
      replyTo:  email,
      subject:  `【${SITE_NAME}】お問い合わせが届きました：${name}様`,
      html:     buildNotifyHtml(name, email, message),
    });

    if (!notifyResult.ok) {
      console.error('通知メール送信失敗:', notifyResult.error);
      return corsResponse({ error: 'メール送信に失敗しました。しばらく後にお試しください。' }, 500);
    }

    // ── 2) 送信者への自動返信メール ──
    // replyTo: undefined で「返信先なし」を明示（自動返信なので返信不要）
    const replyResult = await sendEmail(env.RESEND_API_KEY, {
      from:    FROM_EMAIL,
      to:      [email],
      replyTo: undefined,
      subject: `【${SITE_NAME}】お問い合わせありがとうございます`,
      html:    buildAutoReplyHtml(name, email, message),
    });

    // 自動返信が失敗しても、通知メールは届いているので成功扱いにする
    if (!replyResult.ok) {
      console.error('自動返信メール送信失敗:', replyResult.error);
    }

    return corsResponse({ success: true }, 200);
  },
};

// ================================================================
// Resend API を使ってメールを送信する
// ================================================================
async function sendEmail(apiKey, { from, to, replyTo, subject, html }) {
  const payload = { from, to, subject, html };
  // reply_to がある場合だけ追加
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return {
    ok:    res.ok,
    data,
    error: data.message || data.error || 'Unknown error',
  };
}

// ================================================================
// 通知メール（自分宛）のHTMLテンプレート
// ================================================================
function buildNotifyHtml(name, email, message) {
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  return `<!DOCTYPE html>
<html lang="ja">
<body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 24px;">

  <h2 style="color: #c8472b; border-bottom: 2px solid #c8472b; padding-bottom: 8px; margin-bottom: 20px;">
    お問い合わせが届きました
  </h2>

  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <th style="text-align: left; padding: 12px 16px; background: #f7f5f0; border: 1px solid #e2ddd6; width: 150px; white-space: nowrap;">
        お名前
      </th>
      <td style="padding: 12px 16px; border: 1px solid #e2ddd6;">
        ${escapeHtml(name)}
      </td>
    </tr>
    <tr>
      <th style="text-align: left; padding: 12px 16px; background: #f7f5f0; border: 1px solid #e2ddd6;">
        メールアドレス
      </th>
      <td style="padding: 12px 16px; border: 1px solid #e2ddd6;">
        <a href="mailto:${escapeHtml(email)}" style="color: #c8472b;">${escapeHtml(email)}</a>
      </td>
    </tr>
    <tr>
      <th style="text-align: left; padding: 12px 16px; background: #f7f5f0; border: 1px solid #e2ddd6; vertical-align: top;">
        お問い合わせ内容
      </th>
      <td style="padding: 12px 16px; border: 1px solid #e2ddd6; line-height: 1.7;">
        ${safeMessage}
      </td>
    </tr>
  </table>

  <p style="margin-top: 24px; font-size: 12px; color: #999; line-height: 1.6;">
    このメールはhana-worksのお問い合わせフォームから自動送信されています。<br>
    「返信」ボタンを押すと送信者（${escapeHtml(email)}）に直接返信できます。
  </p>

</body>
</html>`;
}

// ================================================================
// 自動返信メール（送信者宛）のHTMLテンプレート
// ================================================================
function buildAutoReplyHtml(name, email, message) {
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  return `<!DOCTYPE html>
<html lang="ja">
<body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 24px;">

  <!-- ヘッダー -->
  <div style="border-left: 4px solid #c8472b; padding-left: 16px; margin-bottom: 28px;">
    <p style="font-size: 12px; color: #999; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.1em;">hana-works</p>
    <h2 style="margin: 0; color: #0f0e0d; font-size: 20px;">お問い合わせありがとうございます</h2>
  </div>

  <!-- 本文 -->
  <p style="margin-bottom: 8px;">${escapeHtml(name)} 様</p>
  <p style="line-height: 1.9; color: #444; margin-top: 16px;">
    この度はhana-worksへお問い合わせいただき、誠にありがとうございます。<br>
    内容を確認の上、<strong>2〜3営業日以内</strong>にご連絡いたします。<br>
    しばらくお待ちくださいますようお願いいたします。
  </p>

  <hr style="border: none; border-top: 1px solid #e2ddd6; margin: 32px 0;">

  <!-- 送信内容のコピー -->
  <p style="font-size: 12px; color: #999; margin-bottom: 12px;">── 送信内容のコピー ──</p>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr>
      <th style="text-align: left; padding: 10px 14px; background: #f7f5f0; border: 1px solid #e2ddd6; width: 150px; white-space: nowrap;">
        お名前
      </th>
      <td style="padding: 10px 14px; border: 1px solid #e2ddd6;">
        ${escapeHtml(name)}
      </td>
    </tr>
    <tr>
      <th style="text-align: left; padding: 10px 14px; background: #f7f5f0; border: 1px solid #e2ddd6;">
        メールアドレス
      </th>
      <td style="padding: 10px 14px; border: 1px solid #e2ddd6;">
        ${escapeHtml(email)}
      </td>
    </tr>
    <tr>
      <th style="text-align: left; padding: 10px 14px; background: #f7f5f0; border: 1px solid #e2ddd6; vertical-align: top;">
        お問い合わせ内容
      </th>
      <td style="padding: 10px 14px; border: 1px solid #e2ddd6; line-height: 1.7;">
        ${safeMessage}
      </td>
    </tr>
  </table>

  <hr style="border: none; border-top: 1px solid #e2ddd6; margin: 32px 0;">

  <!-- フッター -->
  <div style="font-size: 13px; color: #999; line-height: 1.9;">
    <strong style="color: #0f0e0d; font-size: 14px;">hana-works</strong><br>
    Mail：<a href="mailto:info@hana-works.jp" style="color: #c8472b; text-decoration: none;">info@hana-works.jp</a><br>
    <small>※ このメールは自動送信です。このメールへのご返信は届きません。</small>
  </div>

</body>
</html>`;
}

// ================================================================
// ユーティリティ関数
// ================================================================

// メールアドレスの簡易バリデーション
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// HTMLエスケープ（XSS対策：ユーザー入力をメール本文に埋め込む前に必ず使用）
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;');
}

// CORS ヘッダー付きのレスポンスを返す
// Access-Control-Allow-Origin を特定ドメインに制限したい場合は
// 'hana-works.jp' などに変更してください（現在は全オリジン許可）
function corsResponse(body, status) {
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  return new Response(
    body ? JSON.stringify(body) : null,
    { status, headers }
  );
}
