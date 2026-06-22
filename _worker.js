const dockerHub = "https://registry-1.docker.io";

const routes = {
  "quay": "https://quay.io",
  "gcr": "https://gcr.io",
  "k8s-gcr": "https://k8s.gcr.io",
  "k8s": "https://registry.k8s.io",
  "ghcr": "https://ghcr.io",
  "cloudsmith": "https://docker.cloudsmith.io",
  "test": dockerHub,
};

function routeByHosts(host, env) {
  if (host in routes) return routes[host];
  const mode = (env && env.MODE) || "production";
  if (mode === "debug" && env.TARGET_UPSTREAM) return env.TARGET_UPSTREAM;
  return dockerHub;
}

function searchPage() {
  return `<!DOCTYPE html>
<html>
<head>
<title>Docker Hub 镜像搜索</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: linear-gradient(135deg, #1a90ff 0%, #003eb3 100%);
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; padding: 20px; color: #fff;
}
.container { width: 100%; max-width: 900px; padding: 20px; text-align: center; flex: 1; }
.logo { margin-bottom: 16px; }
.logo svg { filter: drop-shadow(0 5px 15px rgba(0,0,0,0.2)); }
h1 { font-size: 2.2em; margin-bottom: 8px; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
.subtitle { font-size: 1.05em; margin-bottom: 24px; opacity: 0.9; }
.search-box {
  display: flex; max-width: 600px; margin: 0 auto 20px;
  height: 52px; border-radius: 10px; overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
.search-box input {
  flex: 1; padding: 0 18px; font-size: 16px; border: none; outline: none;
}
.search-box button {
  width: 56px; background: #0066ff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background 0.2s;
}
.search-box button:hover { background: #0052cc; }
.search-box button svg { stroke: #fff; }
#results { margin-top: 20px; text-align: left; }
.result-card {
  background: rgba(255,255,255,0.95); border-radius: 10px;
  margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden; transition: transform 0.2s; cursor: pointer;
}
.result-card:hover { transform: translateY(-2px); }
.result-header {
  padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; color: #333;
}
.result-info { flex: 1; }
.result-name { font-size: 1.1em; font-weight: 600; color: #0066ff; margin-bottom: 4px; }
.result-desc { font-size: 0.9em; color: #666; }
.result-stats { font-size: 0.85em; color: #999; margin-top: 4px; }
.result-actions { margin-left: 16px; text-align: right; flex-shrink: 0; }
.pull-cmd {
  background: #f0f4ff; padding: 6px 12px; border-radius: 6px;
  font-family: monospace; font-size: 0.85em; color: #0066ff;
  cursor: pointer; border: 1px solid #d0d9f0; white-space: nowrap;
  display: inline-block;
}
.pull-cmd:hover { background: #e0e8ff; }
.result-expand {
  background: #f8f9ff; border-top: 1px solid #eef0f5; padding: 16px 20px;
  display: none; max-height: 400px; overflow-y: auto;
}
.result-expand.open { display: block; }
.expand-loading { color: #999; font-size: 0.9em; padding: 10px 0; text-align: center; }
.tag-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-item {
  background: #fff; border: 1px solid #dde0e8; border-radius: 6px;
  padding: 6px 14px; font-size: 0.85em; font-family: monospace; color: #333;
  cursor: pointer; transition: all 0.15s;
}
.tag-item:hover { background: #0066ff; color: #fff; border-color: #0066ff; }
.tag-item.copied { background: #00c853; color: #fff; border-color: #00c853; }
.tag-info { font-size: 0.8em; color: #999; margin-bottom: 10px; }
.expand-header { font-weight: 600; font-size: 0.95em; color: #444; margin-bottom: 8px; }
.no-results { color: rgba(255,255,255,0.8); font-size: 1.1em; padding: 40px 0; }
.loading { color: rgba(255,255,255,0.8); padding: 40px 0; }
.error { color: #ff6b6b; padding: 20px 0; }
.footer { margin-top: 30px; font-size: 0.85em; opacity: 0.7; }
.expand-icon { margin-left: 8px; font-size: 0.8em; color: #999; }
@media (max-width: 600px) {
  h1 { font-size: 1.6em; }
  .search-box { height: 46px; }
  .result-header { flex-direction: column; align-items: flex-start; }
  .result-actions { margin-left: 0; margin-top: 10px; width: 100%; }
  .pull-cmd { display: block; text-align: center; }
}
</style>
</head>
<body>
<div class="container">
  <div class="logo">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 18" fill="#fff" width="100" height="75">
      <path d="M23.763 6.886c-.065-.053-.673-.512-1.954-.512-.32 0-.659.03-1.01.087-.248-1.703-1.651-2.533-1.716-2.57l-.345-.2-.227.328a4.596 4.596 0 0 0-.611 1.433c-.23.972-.09 1.884.403 2.666-.596.331-1.546.418-1.744.42H.752a.753.753 0 0 0-.75.749c-.007 1.456.233 2.864.692 4.07.545 1.43 1.355 2.483 2.409 3.13 1.181.725 3.104 1.14 5.276 1.14 1.016 0 2.03-.092 2.93-.266 1.417-.273 2.705-.742 3.826-1.391a10.497 10.497 0 0 0 2.61-2.14c1.252-1.42 1.998-3.005 2.553-4.408.075.003.148.005.221.005 1.371 0 2.215-.55 2.68-1.01.505-.5.685-.998.704-1.053L24 7.076l-.237-.19Z"></path>
      <path d="M2.216 8.075h2.119a.186.186 0 0 0 .185-.186V6a.186.186 0 0 0-.185-.186H2.216A.186.186 0 0 0 2.031 6v1.89c0 .103.083.186.185.186Zm2.92 0h2.118a.185.185 0 0 0 .185-.186V6a.185.185 0 0 0-.185-.186H5.136A.185.185 0 0 0 4.95 6v1.89c0 .103.083.186.186.186Zm2.964 0h2.118a.186.186 0 0 0 .185-.186V6a.186.186 0 0 0-.185-.186H8.1A.185.185 0 0 0 7.914 6v1.89c0 .103.083.186.186.186Zm2.928 0h2.119a.185.185 0 0 0 .185-.186V6a.185.185 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm-5.892-2.72h2.118a.185.185 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186H5.136a.186.186 0 0 0-.186.186v1.89c0 .103.083.186.186.186Zm2.964 0h2.118a.186.186 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186H8.1a.186.186 0 0 0-.186.186v1.89c0 .103.083.186.186.186Zm2.928 0h2.119a.185.185 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm0-2.72h2.119a.186.186 0 0 0 .185-.186V.56a.185.185 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm2.955 5.44h2.118a.185.185 0 0 0 .186-.186V6a.185.185 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.186v1.89c0 .103.083.186.185.186Z"></path>
    </svg>
  </div>
  <h1>Docker Hub 镜像搜索</h1>
  <p class="subtitle">快速查找、下载和部署 Docker 容器镜像</p>
  <div class="search-box">
    <input type="text" id="q" placeholder="输入关键词搜索镜像，如: nginx, mysql, redis..." autofocus>
    <button onclick="search()">
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.35-4.35"></path>
      </svg>
    </button>
  </div>
  <div id="results"></div>
  <div class="footer">基于 Cloudflare Workers 构建</div>
</div>
<script>
document.getElementById('q').addEventListener('keydown', function(e) { if (e.key === 'Enter') search(); });
const params = new URLSearchParams(location.search);
if (params.get('q')) { document.getElementById('q').value = params.get('q'); search(); }

async function search() {
  const q = document.getElementById('q').value.trim();
  if (!q) return;
  history.replaceState(null, '', '?q=' + encodeURIComponent(q));
  const div = document.getElementById('results');
  div.innerHTML = '<div class="loading">🔍 搜索中...</div>';
  try {
    const resp = await fetch('/api/search?q=' + encodeURIComponent(q));
    const data = await resp.json();
    if (data.error) { div.innerHTML = '<div class="error">' + data.error + '</div>'; return; }
    if (!data.results || data.results.length === 0) {
      div.innerHTML = '<div class="no-results">未找到匹配 "' + q + '" 的镜像</div>';
      return;
    }
    let html = '';
    for (const r of data.results) {
      const fullName = r.repo_name || r.name;
      const desc = r.description || '暂无描述';
      const stars = r.star_count || 0;
      const pulls = r.pull_count || 0;
      const repoId = 'repo-' + fullName.replace(/[^a-zA-Z0-9]/g, '-');
      html += '<div class="result-card" onclick="toggleExpand(\'' + repoId + '\',\'' + escapeStr(fullName) + '\')">' +
        '<div class="result-header">' +
        '<div class="result-info">' +
        '<div class="result-name">' + fullName + '</div>' +
        '<div class="result-desc">' + escHtml(desc) + '</div>' +
        '<div class="result-stats">⭐ ' + stars + '  |  📥 ' + formatNum(pulls) + '</div>' +
        '</div>' +
        '<div class="result-actions"><span class="pull-cmd" onclick="event.stopPropagation();copyCmd(this)" title="点击复制">docker pull ' + fullName + '</span></div>' +
        '</div>' +
        '<div id="' + repoId + '" class="result-expand"><div class="expand-loading">点击查看版本标签</div></div>' +
        '</div>';
    }
    div.innerHTML = html;
  } catch(e) {
    div.innerHTML = '<div class="error">搜索请求失败，请稍后重试</div>';
  }
}

let loadingTags = {};
async function toggleExpand(repoId, fullName) {
  const el = document.getElementById(repoId);
  if (!el) return;
  if (el.classList.contains('open')) {
    el.classList.remove('open');
    return;
  }
  if (loadingTags[repoId]) return;
  el.classList.add('open');
  if (el.querySelector('.expand-loading')) {
    loadingTags[repoId] = true;
    el.innerHTML = '<div class="expand-loading">🔄 加载版本标签...</div>';
    try {
      const resp = await fetch('/api/tags?name=' + encodeURIComponent(fullName));
      const data = await resp.json();
      if (data.error) { el.innerHTML = '<div style="color:#999;font-size:0.9em;text-align:center;padding:10px">' + data.error + '</div>'; return; }
      if (!data.tags || data.tags.length === 0) {
        el.innerHTML = '<div style="color:#999;font-size:0.9em;text-align:center;padding:10px">暂无版本标签</div>';
        return;
      }
      const host = location.host;
      let html = '<div class="expand-header">📦 版本标签 (' + data.tags.length + ' 个)</div><div class="tag-grid">';
      for (const t of data.tags) {
        html += '<span class="tag-item" onclick="event.stopPropagation();copyTag(this,\'' + escapeStr(fullName) + '\',\'' + escapeStr(t) + '\')">' + escHtml(t) + '</span>';
      }
      html += '</div>';
      el.innerHTML = html;
    } catch(e) {
      el.innerHTML = '<div style="color:#999;font-size:0.9em;text-align:center;padding:10px">加载失败</div>';
    }
    loadingTags[repoId] = false;
  }
}

function copyTag(el, fullName, tag) {
  const text = 'docker pull ' + fullName + ':' + tag;
  navigator.clipboard.writeText(text).then(() => {
    el.classList.add('copied');
    const orig = el.textContent;
    el.textContent = '✅ 已复制';
    setTimeout(() => { el.textContent = orig; el.classList.remove('copied'); }, 1200);
  });
}

function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function escapeStr(s) { return s.replace(/'/g, "\\'").replace(/"/g, '&quot;'); }
function formatNum(n) { if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'; if (n >= 1000) return (n/1000).toFixed(1) + 'K'; return n; }
function copyCmd(el) {
  const text = el.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const orig = el.textContent;
    el.textContent = '✅ 已复制';
    el.style.background = '#e8f5e9';
    setTimeout(() => { el.textContent = orig; el.style.background = ''; }, 1500);
  });
}
</script>
</body>
</html>`;
}

async function handleSearch(request, ctx) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (!q) {
    return new Response(JSON.stringify({ error: '请输入搜索关键词' }), {
      status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
  const page = parseInt(url.searchParams.get('page')) || 1;
  const pageSize = parseInt(url.searchParams.get('page_size')) || 20;
  const searchUrl = `https://hub.docker.com/v2/repositories/library?search=${encodeURIComponent(q)}&page=${page}&page_size=${pageSize}`;

  const cacheKey = new Request(`https://cache/search/${encodeURIComponent(q)}/${page}/${pageSize}`);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    let resp = await fetch(searchUrl, {
      headers: { 'User-Agent': 'CF-Workers-docker.io' }
    });
    if (resp.status === 429) {
      const v1Url = `https://index.docker.io/v1/search?q=${encodeURIComponent(q)}&page=${page}&n=${pageSize}`;
      resp = await fetch(v1Url, {
        headers: { 'User-Agent': 'CF-Workers-docker.io' }
      });
      if (resp.ok) {
        const v1Data = await resp.json();
        const v1Results = (v1Data.results || []).map(r => ({
          name: r.name,
          repo_name: r.name.includes('/') ? r.name : `library/${r.name}`,
          description: r.description || '',
          star_count: r.star_count || 0,
          pull_count: 0,
        }));
        const responseData = JSON.stringify({ results: v1Results, total: v1Data.num_results || v1Results.length, page, page_size: pageSize });
        const response = new Response(responseData, {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' }
        });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
        return response;
      }
    }
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `Docker Hub API 返回 ${resp.status}` }), {
        status: resp.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    const data = await resp.json();
    const results = (data.results || []).map(r => ({
      name: r.name,
      repo_name: r.repo_name || `library/${r.name}`,
      description: r.description,
      star_count: r.star_count,
      pull_count: r.pull_count,
    }));
    const responseData = JSON.stringify({ results, total: data.count || 0, page, page_size: pageSize });
    const response = new Response(responseData, {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=120' }
    });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (e) {
    return new Response(JSON.stringify({ error: '搜索服务暂不可用' }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

async function handleTags(request, ctx) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name');
  if (!name) {
    return new Response(JSON.stringify({ error: '请输入镜像名称' }), {
      status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const cacheKey = new Request(`https://cache/tags/${encodeURIComponent(name)}`);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const tagsUrl = `https://hub.docker.com/v2/repositories/${name}/tags?page_size=100`;
    let resp = await fetch(tagsUrl, {
      headers: { 'User-Agent': 'CF-Workers-docker.io' }
    });
    // 如果被限流，使用 registry API + token 认证
    if (resp.status === 429) {
      const registryName = name;
      const tokenUrl = `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${registryName}:pull`;
      const tokenRes = await fetch(tokenUrl);
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const token = tokenData.token;
        const registryUrl = `https://registry-1.docker.io/v2/${name}/tags/list`;
        const registryResp = await fetch(registryUrl, {
          headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': 'CF-Workers-docker.io' }
        });
        if (registryResp.ok) {
          const registryData = await registryResp.json();
          const tags = (registryData.tags || []).filter(Boolean);
          const responseData = JSON.stringify({ name, tags, count: tags.length });
          const response = new Response(responseData, {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=600' }
          });
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
          return response;
        }
      }
    }
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `获取标签失败 (${resp.status})` }), {
        status: resp.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    const data = await resp.json();
    const tags = (data.results || []).map(t => t.name).filter(Boolean);
    const responseData = JSON.stringify({ name, tags, count: tags.length });
    const response = new Response(responseData, {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' }
    });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (e) {
    return new Response(JSON.stringify({ error: '标签服务暂不可用' }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

function parseAuthenticate(authenticateStr) {
  const re = /(?<=\=")(?:\\.|[^"\\])*(?=")/g;
  const matches = authenticateStr.match(re);
  if (matches == null || matches.length < 2) throw new Error(`invalid Www-Authenticate Header: ${authenticateStr}`);
  return { realm: matches[0], service: matches[1] };
}

async function fetchToken(wwwAuthenticate, scope, authorization) {
  const url = new URL(wwwAuthenticate.realm);
  if (wwwAuthenticate.service.length) url.searchParams.set("service", wwwAuthenticate.service);
  if (scope) url.searchParams.set("scope", scope);
  const headers = new Headers();
  if (authorization) headers.set("Authorization", authorization);
  return await fetch(url, { method: "GET", headers: headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "") {
      if (env.URL302) return Response.redirect(env.URL302, 302);
      if (env.URL) {
        if (env.URL.toLowerCase() === "nginx") {
          return new Response(nginxPage(), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
        }
        return fetch(new Request(env.URL, request));
      }
      return new Response(searchPage(), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
    }

    if (url.pathname === "/api/search") return handleSearch(request, ctx);
    if (url.pathname === "/api/tags") return handleTags(request, ctx);

    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /", { headers: { 'Content-Type': 'text/plain' } });
    }

    const hostName = url.hostname.split('.')[0];
    const upstream = routeByHosts(hostName, env);
    if (upstream === "") {
      return new Response(JSON.stringify({ routes }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const isDockerHub = upstream === dockerHub;
    const authorization = request.headers.get("Authorization");

    if (url.pathname === "/v2/") {
      const newUrl = new URL(upstream + "/v2/");
      const headers = new Headers();
      if (authorization) headers.set("Authorization", authorization);
      const resp = await fetch(newUrl.toString(), { method: "GET", headers, redirect: "follow" });
      if (resp.status === 401) {
        headers.set("Www-Authenticate", `Bearer realm="https://${url.hostname}/v2/auth",service="cloudflare-docker-proxy"`);
        return new Response(JSON.stringify({ message: "UNAUTHORIZED" }), { status: 401, headers });
      }
      return resp;
    }

    if (url.pathname === "/v2/auth") {
      const newUrl = new URL(upstream + "/v2/");
      const resp = await fetch(newUrl.toString(), { method: "GET", redirect: "follow" });
      if (resp.status !== 401) return resp;
      const authenticateStr = resp.headers.get("WWW-Authenticate");
      if (authenticateStr === null) return resp;
      const wwwAuthenticate = parseAuthenticate(authenticateStr);
      let scope = url.searchParams.get("scope");
      if (scope && isDockerHub) {
        let scopeParts = scope.split(":");
        if (scopeParts.length === 3 && !scopeParts[1].includes("/")) {
          scopeParts[1] = "library/" + scopeParts[1];
          scope = scopeParts.join(":");
        }
      }
      return await fetchToken(wwwAuthenticate, scope, authorization);
    }

    if (isDockerHub) {
      const pathParts = url.pathname.split("/");
      if (pathParts.length === 5) {
        pathParts.splice(2, 0, "library");
        let redirectUrl = new URL(url);
        redirectUrl.pathname = pathParts.join("/");
        return Response.redirect(redirectUrl.toString(), 301);
      }
    }

    const newUrl = new URL(upstream + url.pathname + url.search);
    const newReq = new Request(newUrl, { method: request.method, headers: request.headers, redirect: "follow" });
    return await fetch(newReq);
  }
};

function nginxPage() {
  return `<!DOCTYPE html>
<html>
<head><title>Welcome to nginx!</title>
<style>body{width:35em;margin:0 auto;font-family:Tahoma,Verdana,Arial,sans-serif}</style>
</head>
<body><h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and working.</p>
</body>
</html>`;
}
