# Handoff: Hana*Works ポートフォリオサイト

## Overview
LP制作・Web画像制作・ネットショップ商品ページ・Web素材制作を手がけるフリーランス向けの、ミニマルなグリッド型ポートフォリオサイト。トップは作品グリッドのみで、各作品クリックで詳細ページへ遷移する構成。参考サイト: sunjunjie.com（詳細ページ遷移型の構成）、minatabei.com（作品ごとに簡潔なクレジット表記）。

## About the Design Files
このバンドル内のHTMLファイル（`Hana-Works Portfolio.dc.html`）は **デザインリファレンス** です。プロトタイピング環境（Claude内製のDesign Component形式・独自ランタイム `support.js` に依存）で作られており、そのままプロダクションコードとしては使えません。実装時は、対象プロジェクトの既存環境（React / Vue / 素のHTML+CSSなど）に合わせて、このHTMLが示すレイアウト・スタイル・挙動を再現してください。既存の技術スタックがなければ、要件に最も適したフレームワークを選定してください。

`image-slot.js` はプロトタイプ内でのみ使われる「画像ドラッグ&ドロップ用プレースホルダー」のWeb Componentで、実装には不要です（実装では通常の `<img>` に置き換えてください）。

## Fidelity
**High-fidelity**: 配色・タイポグラフィ・余白・グリッド構成・遷移挙動は最終仕様として扱ってください。画像は全てプレースホルダー（ユーザーが後日実写真に差し替え予定）です。

## Site Structure
シングルページアプリケーション相当の4ビュー構成（実装時は本物のルーティングを推奨: `/`, `/works/:id`, `/about`, `/contact`）。

1. **Works（トップ／作品グリッド）** — デフォルト表示
2. **Works Detail（作品詳細）** — グリッドの作品をクリックすると遷移
3. **About**
4. **Contact**

ヘッダー（ロゴ＋グローバルナビ）は全ビュー共通で、階層が変わっても同じ仕様のまま表示され続けます（sticky header）。

## Screens / Views

### 共通ヘッダー（全ページ）
- **レイアウト**: `position: sticky; top:0`、左右対称のflexバー。左にロゴ、右にナビ。
- **高さ/余白**: padding `clamp(16px,3vw,28px)` 縦 / `clamp(20px,4vw,56px)` 横。
- **背景**: `rgba(246,245,241,0.92)` + `backdrop-filter: blur(6px)`、下線 `1px solid #e2ded4`。
- **ロゴ**: 34×34pxの画像枠（実装では実ロゴ画像に差し替え） + テキスト「Hana*Works」（font-weight 500, 15px, letter-spacing 0.06em, `*`のみweight 300）。クリックでWorksトップに遷移。
- **ナビ**: `Works / About / Contact`。12px, letter-spacing 0.14em, font-weight 500, uppercase。現在のセクションは下線（1px solid `#1a1a17`）で表示。**Works Detail表示中もWorksが下線状態になる**（階層上の親であるため）。
- **フッター**: 全ページ下部、`© Hana*Works` 左、`Contact`リンク右。11px, color `#a09c92`, border-top `1px solid #e2ded4`。

### 1. Works（作品グリッド）
- **見出し**: キャッチコピー「LP・Web画像・ECページ・素材まで、必要な一枚をつくる。」 font-weight 500, `clamp(26px,3.4vw,40px)`, line-height 1.35, max-width 640px。
- **カテゴリフィルター**: `すべて / LP制作 / Web画像制作 / ネットショップ商品ページ / Web素材` の横並びタブ。12px uppercase, letter-spacing 0.08em。選択中: color `#1a1a17` + 下線 + font-weight 600。非選択: color `#8f8b81`, 下線なし, font-weight 400。
- **グリッド**: CSS Grid `repeat(auto-fill, minmax(280px,1fr))`, gap `clamp(28px,3vw,44px) clamp(24px,3vw,36px)`。
- **カード**: 
  - 画像枠: aspect-ratio 4/3, 背景 `#e9e6de`（プレースホルダー色）, overflow hidden。hover時 `transform: scale(1.045)`、transition `0.6s cubic-bezier(.2,.7,.2,1)`。
  - タイトル: 14px, font-weight 500, 年度と両端揃え（baseline）。
  - 年度: 11px, color `#a09c92`。
  - カテゴリ: 11.5px, color `#8f8b81`, letter-spacing 0.06em, margin-top 4px。
  - カード全体はクリックで詳細ページへ。

### 2. Works Detail（作品詳細）
- **戻る導線**: 左上「← Works」（12px uppercase, color `#6f6b62`）→ Worksグリッドへ。
- **メイン画像**: aspect-ratio 16/9, 背景 `#e9e6de`。
- **本文2カラム**（`grid-template-columns: minmax(0,1fr) minmax(220px,320px)`）:
  - 左: タイトル(`clamp(24px,2.6vw,32px)`, weight 500) + 説明文(15px, weight 300, line-height 1.9, color `#45433d`, max-width 62ch)。
  - 右: メタ情報テーブル（Category / Client / Year）、上部border-top `1px solid #e2ded4`、ラベルは `#6f6b62`、値は `#1a1a17`。
- **サブ画像**: 2枚, Grid `repeat(auto-fill, minmax(260px,1fr))`, aspect-ratio 4/3。
- **Prev/Next**: 下部border-topの上に左右並び。ラベル「Prev」「Next」11px uppercase `#a09c92`、作品タイトル13px `#45433d`。クリックで前後の作品に遷移（ループ）。

### 3. About
- **2カラム**（`minmax(200px,320px) minmax(0,1fr)`）: 左にプロフィール写真枠(aspect-ratio 3/4)、右にテキスト。
- **本文**: 見出し「About」(weight 500, `clamp(24px,2.8vw,32px)`) + 紹介文2段落(15px, weight 300, line-height 1.95, color `#45433d`)。
- **サービス一覧（4項目、番号01〜04）**:
  1. LP制作
  2. Web画像制作
  3. ネットショップ商品ページ
  4. Web素材制作
  各項目: `grid-template-columns: 40px minmax(0,1fr)`, border-top `1px solid #e2ded4`, padding `22px 0`。番号は13px `#a09c92`、タイトルは14.5px weight 500、説明は13.5px weight 300 `#6f6b62`。

### 4. Contact
- 中央寄せ、max-width 640px。
- 見出し「Contact」+ 説明文「お仕事のご相談・お見積りは、下記のフォームより承っております。」
- CTAボタン「お問い合わせフォーム」: border `1px solid #1a1a17`, padding `16px 44px`, 13px uppercase letter-spacing 0.1em。hoverで背景`#1a1a17`・文字色`#f6f5f1`に反転。
- **重要**: 現状リンク先は `#` のプレースホルダー。実装時は既存の問い合わせフォームURLに差し替えること。

## Interactions & Behavior
- ナビ / ロゴ / フッターのContactリンク / カード / Prev・Next はすべてクリックのみ（ホバーで下線・拡大などの軽い反応）。
- ページ遷移はフェードやスライドなどのトランジションは無し（即時切り替え）。実装で自然なページ遷移アニメーションを加えるのは任意。
- 画像カードのみ hover で `scale(1.045)` の拡大アニメーション。
- 詳細ページ遷移時は先頭にスクロールする（`window.scrollTo(0,0)` 相当）。

## State Management
- `view`: `'works' | 'detail' | 'about' | 'contact'`
- `filter`: `'all'` またはカテゴリ名（Works表示時のみ使用）
- `activeId`: 表示中の作品ID（Works Detail表示時のみ使用）
- Prev/Nextは作品配列内でのインデックスの前後（先頭/末尾はループ）。

## Design Tokens

### Colors
- 背景: `#f6f5f1`
- テキスト（本文濃色）: `#1a1a17`
- テキスト（本文中間）: `#45433d`
- テキスト（補助/ラベル）: `#6f6b62`
- テキスト（薄い/年度など）: `#8f8b81` 〜 `#a09c92`
- 罫線: `#e2ded4`
- プレースホルダー画像背景: `#e9e6de`

### Typography
- フォント: `Noto Sans JP`（weight 300 / 400 / 500 / 600 / 700）, sans-serif fallback。
- 見出し: weight 500、letter-spacing 0.01〜0.02em程度。
- 本文: weight 300、line-height 1.9前後。
- ラベル/ナビ: 11〜13px, uppercase, letter-spacing 0.06〜0.14em。

### Spacing / Layout
- 横パディング: `clamp(20px,4vw,56px)`
- セクション間の縦余白: `clamp(28px,5vw,56px)` 〜 `clamp(60px,8vw,140px)`（ページにより変動、詳細は各セクション参照）
- グリッドgap: `clamp(24px,3vw,44px)` 前後
- 罫線幅: 全て1px

### Other
- 角丸: 使用なし（すべて直角）
- シャドウ: 使用なし
- ボーダー: 罫線区切り(`1px solid #e2ded4`)のみ、カードに枠線なし

## Assets
- 現時点で実画像は無し。全て `image-slot.js`（ドラッグ&ドロップ用プレースホルダー）で表現。実装時は下記アスペクト比を保った `<img>` に置き換えること:
  - ロゴ: 正方形 34×34px相当
  - 作品グリッドサムネイル: 4:3
  - 作品詳細メイン画像: 16:9
  - 作品詳細サブ画像: 4:3 ×2
  - Aboutプロフィール写真: 3:4
- ロゴは既存の「hana-works」ロゴを流用予定（別途支給）。

## Files
- `Hana-Works Portfolio.dc.html` — デザイン本体（全4ビュー、状態管理ロジック込み）
- `image-slot.js` — プロトタイプ用の画像プレースホルダー部品（実装では不要、参考程度）
