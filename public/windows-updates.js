(() => {
  const token = new URLSearchParams(location.search).get('token') || '';
  const headers = { 'X-EzDeck-Host': token, 'Content-Type': 'application/json' };
  const area = document.getElementById('windows-preferences');
  if (!area) return;
  const preference = document.createElement('label');
  preference.style.cssText = 'display:flex;align-items:center;gap:9px;cursor:pointer';
  const checkbox = document.createElement('input'); checkbox.type='checkbox'; checkbox.id='automatic-updates'; checkbox.disabled=true;
  checkbox.style.cssText='width:17px;height:17px;accent-color:#f73b20';
  preference.append(checkbox,document.createTextNode('Atualização Automatica'));
  const version = document.getElementById('software-version');
  const label = document.createElement('span'); label.className='windows-update-message'; label.role = 'status'; label.setAttribute('aria-live', 'polite');
  const button = document.createElement('button'); button.type = 'button'; button.className = 'button'; button.textContent = 'Atualizar agora'; button.hidden=true;
  for (const item of [preference,label,button]) area.insertBefore(item,version);
  let latest = null, busy = false, timer;
  async function request(path, method = 'GET', body) {
    const response = await fetch(path, { method, headers, cache: 'no-store', ...(body ? {body:JSON.stringify(body)} : {}) });
    const data = await response.json(); if (!response.ok) throw Error(data.error || 'Não foi possível atualizar'); return data;
  }
  function show(data) {
    if (busy) return;
    clearTimeout(timer);
    if (version) {
      if (typeof data.current === 'string') version.textContent=data.current.replace(/^v/i,'');
      const state=data.automatic && data.latest?.available ? 'available' : data.automatic && data.status === 'current' ? 'current' : 'unknown';
      version.dataset.updateState=state;
      const description=state==='current'?'Atualizado':state==='available'?`Atualização ${data.latest.version} disponível`:'Atualização não verificada';
      version.title=description;
      version.setAttribute('aria-label',`Versão ${version.textContent}. ${description}`);
    }
    checkbox.checked=data.automatic === true; checkbox.disabled=false;
    if (!checkbox.checked) {latest=null;button.hidden=true;label.textContent='';return;}
    latest = data.latest?.available ? data.latest.version : null;
    label.textContent = data.status === 'error' ? 'Não foi possível consultar o GitHub' : data.status === 'checking' ? 'Verificando atualizações' : '';
    button.hidden = !latest;
    if (data.status === 'checking') timer = setTimeout(refresh, 1500);
  }
  async function refresh() { try { show(await request('/api/windows/update')); } catch { if(version)version.dataset.updateState='unknown'; label.textContent = 'Atualização indisponível'; } }
  checkbox.onchange = async () => {
    const selected=checkbox.checked;checkbox.disabled=true;clearTimeout(timer);button.hidden=true;
    try {show(await request('/api/windows/update/preferences','POST',{automatic:selected}));}
    catch {checkbox.checked=!selected;checkbox.disabled=false;button.hidden=!latest;label.textContent='Não foi possível salvar a opção';}
  };
  button.onclick = async () => {
    if (busy) return;
    if (!latest || !checkbox.checked) return;
    if (!confirm(`Atualizar o EzDeck para ${latest}? Seus botões e pareamento serão preservados. O app será fechado e reaberto. O Windows poderá pedir confirmação de segurança para o instalador.`)) return;
    busy = true; button.disabled = true; checkbox.disabled=true; clearTimeout(timer); label.textContent = 'Baixando e verificando a atualização';
    try {
      await request('/api/windows/update/install', 'POST'); label.textContent = 'Instalando a atualização. O EzDeck será reaberto.';
    } catch {
      label.textContent = 'Não foi possível atualizar. Nenhum download não verificado será executado.';
      busy = false; button.disabled = false; checkbox.disabled=false;
    }
  };
  refresh();
})();
