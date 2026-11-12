/* もしもノート LP
   1. 端末を見て、合うストアのボタンを先に出す（iPhone → App Store / Android → Google Play）
   2. 流入元の印（?src=tiktok など）をストアのリンクへ引き継ぐ
      - App Store : ct=<src>（＋ APPLE_PT があれば pt=）→ App Store Connect の「App アナリティクス › キャンペーン」で見る
      - Google Play: referrer=utm_source=<src>&utm_medium=lp&utm_campaign=moshimo-lp → Play Console の「ユーザー獲得」で見る
      LP 自体はアクセス解析を入れていない（Cookie もサーバー通信もなし）。
   3. スマホの追従バーは、最後のダウンロード欄が見えている間は隠す                */
(function () {
  'use strict';

  var APP_STORE = 'https://apps.apple.com/jp/app/id6772194447';
  var PLAY_STORE = 'https://play.google.com/store/apps/details?id=jp.sawalyno.moshimonote';
  // App Store Connect › アナリティクス › 獲得 › キャンペーンリンク生成画面に出る「pt=」の値（提供元の番号・公開値）。
  // 開発者アカウントで共通なので、ほかのアプリの LP でも同じ値を使う（2026-11-12 取得）
  var APPLE_PT = '128482563';

  var html = document.documentElement;
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  if (isIOS) html.classList.add('ua-ios');
  if (isAndroid) html.classList.add('ua-android');

  // ?src= を優先、無ければ ?utm_source=。英数字と - _ だけ、40 文字まで
  function readSource() {
    var params;
    try { params = new URLSearchParams(location.search); } catch (e) { return ''; }
    var raw = params.get('src') || params.get('utm_source') || '';
    return /^[A-Za-z0-9_-]{1,40}$/.test(raw) ? raw.toLowerCase() : '';
  }
  var src = readSource();

  function appStoreUrl() {
    var q = [];
    if (APPLE_PT) q.push('pt=' + encodeURIComponent(APPLE_PT));
    if (src) q.push('ct=' + encodeURIComponent(src));
    if (q.length) q.push('mt=8');
    return APP_STORE + (q.length ? '?' + q.join('&') : '');
  }
  function playStoreUrl() {
    if (!src) return PLAY_STORE;
    var ref = 'utm_source=' + src + '&utm_medium=lp&utm_campaign=moshimo-lp';
    return PLAY_STORE + '&referrer=' + encodeURIComponent(ref);
  }

  var urls = { ios: appStoreUrl(), android: playStoreUrl() };
  var links = document.querySelectorAll('[data-store]');
  for (var i = 0; i < links.length; i++) {
    links[i].href = urls[links[i].getAttribute('data-store')] || links[i].href;
  }

  // 「無料ではじめる」「ダウンロード」: 端末が分かればストアへ直行、分からなければページ下のボタン欄へ
  var direct = isIOS ? urls.ios : (isAndroid ? urls.android : '');
  if (direct) {
    var autos = document.querySelectorAll('[data-store-auto]');
    for (var j = 0; j < autos.length; j++) autos[j].href = direct;
  }

  // アクセス解析（analytics.js が読み込まれているときだけ）。
  // store_click: ストアのボタンが押された。store = ios / android / page（ページ下のボタン欄へ移動しただけ）
  var device = isIOS ? 'ios' : (isAndroid ? 'android' : 'other');
  if (window.posthog && window.posthog.register) {
    window.posthog.register({ lp_src: src || '(none)', lp_device: device });
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest('[data-store], [data-store-auto]') : null;
    if (!a || !window.posthog || !window.posthog.capture) return;
    var store = a.getAttribute('data-store') || (direct ? device : 'page');
    window.posthog.capture('store_click', {
      store: store,
      place: a.getAttribute('data-place') || '',
      lp_src: src || '(none)',
      lp_device: device
    }, { transport: 'sendBeacon' });   // ストアへ移動してもイベントが消えないように
  });

  var bar = document.querySelector('.stickybar');
  var finalSec = document.getElementById('download');
  if (bar && finalSec && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.2 }).observe(finalSec);
  }
})();
