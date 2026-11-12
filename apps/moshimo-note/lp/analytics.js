/* もしもノート LP のアクセス解析（PostHog）
   - Cookie もブラウザの保存領域も使わない（cookieless_mode: 'always'）
     → PostHog のプロジェクト設定で「Cookieless」を有効にしないとイベントが捨てられる
   - 取るもの: ページ表示・ページ離脱（スクロール量を含む）・ストアボタンのクリック（lp.js から 'store_click'）
   - 取らないもの: 自動クリック収集・画面録画・ヒートマップ・アンケート・個人の識別
   - POSTHOG_KEY が空のあいだは何もしない
   プロジェクトキー（phc_…）はブラウザに配る前提の公開キー。秘密鍵（phx_… の個人 API キー）はここに書かない。 */
(function () {
  'use strict';

  // 公開キー（オーナー承認済みの例外・2026-11-12。CLAUDE.md「機密情報の取り扱い」参照）。
  // 1 つの PostHog プロジェクトを全アプリの LP で共用し、アプリは APP で見分ける
  var POSTHOG_KEY = 'phc_t795uRFKMzhi9wzPpGBBox8Su8tMndGc4ujKC6y3RJiL';
  var APP = 'moshimo-note';
  var POSTHOG_HOST = 'https://us.i.posthog.com';   // US リージョン（2026-11-12 オーナー決定）

  if (!POSTHOG_KEY) return;

  // PostHog 公式の読み込みコード（https://posthog.com/docs/libraries/js）。
  // CSP で inline script を禁止しているので、外部ファイルに置いている。
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  window.posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2026-08-30',
    cookieless_mode: 'always',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_performance: false,
    disable_session_recording: true,
    disable_surveys: true
  });
  window.posthog.register({ app: APP });
})();
