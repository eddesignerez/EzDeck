(function () {
  let dialog, image, status, session, polling, cleanup, busy = false, generation = 0;
  async function request(body) {
    const response = await fetch('/api/native-menu', { method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body), signal:AbortSignal.timeout(12000) });
    const reply = await response.json();
    if (!response.ok || !reply.ok) throw Error(reply.error || 'Menu indisponível');
    return reply;
  }
  function hide() {
    generation++; clearTimeout(polling);
    const old = session; session = null;
    dialog?.close();
    if (old) request({action:'dismiss', session:old}).catch(() => {});
  }
  function show(reply) {
    if (reply.closed) { hide(); return; }
    session = reply.session;
    image.src = reply.image; image.width = reply.width; image.height = reply.height;
    image.hidden = false; status.textContent = '';
    clearTimeout(polling);
    polling = setTimeout(async function () {
      if (!session || busy) return;
      const current = generation;
      try { const next = await request({action:'frame',session}); if (current === generation) show(next); }
      catch (error) { if (current === generation) { hide(); } }
    }, 700);
  }
  async function open(name) {
    if (busy || dialog?.open) return;
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.className = 'native-app-menu'; dialog.setAttribute('aria-label','Menu do aplicativo no Windows');
      const close = document.createElement('button'); close.type='button'; close.textContent='Fechar'; close.onclick=hide;
      status = document.createElement('div'); status.setAttribute('role','status');
      image = document.createElement('img'); image.alt='Menu original do Windows. Toque na opção desejada.'; image.hidden=true;
      image.style.cssText='display:block;max-width:100%;height:auto;touch-action:manipulation;';
      image.onclick = async function (event) {
        if (busy || !session) return;
        const rect = image.getBoundingClientRect(), current=generation;
        busy=true; clearTimeout(polling);
        try { const next = await request({action:'tap',session,x:(event.clientX-rect.left)/rect.width,y:(event.clientY-rect.top)/rect.height}); if (current===generation) show(next); }
        catch(error) { if (current===generation) { status.textContent=error.message; hide(); } }
        finally { busy=false; }
      };
      dialog.append(close,status,image); document.body.append(dialog);
      dialog.addEventListener('cancel', function(event){event.preventDefault();hide();});
      dialog.addEventListener('click', function(event){if(event.target===dialog) hide();});
    }
    const current=++generation; busy=true; image.hidden=true; status.textContent='Abrindo menu do Windows'; dialog.showModal();
    try { const reply=await request({action:'open',name}); if(current===generation) show(reply); else if(reply.session) request({action:'dismiss',session:reply.session}).catch(()=>{}); }
    catch(error) { if(current===generation) status.textContent=error.message; }
    finally { busy=false; }
  }
  function bind(deck, cancel) {
    cleanup?.();
    const points=new Map(); let candidate=null, blockedUntil=0;
    deck.addEventListener('pointerdown', function(event) {
      if(event.pointerType!=='touch') return;
      const card=event.target.closest('.dcard');
      points.set(event.pointerId,{x:event.clientX,y:event.clientY,card,time:performance.now()});
      if(points.size===2) {
        const pair=Array.from(points.values());
        blockedUntil=Date.now()+800; cancel();
        candidate=!pair.some(point=>point.moved) && pair[0].card && pair[0].card===pair[1].card && pair[1].time-pair[0].time<250 ? {name:card.dataset.name,time:performance.now(),valid:true} : null;
        event.preventDefault(); event.stopImmediatePropagation();
      } else if(points.size>2) { candidate=null; event.stopImmediatePropagation(); }
    }, {capture:true,passive:false});
    deck.addEventListener('pointermove', function(event){
      const point=points.get(event.pointerId);
      if(point && Math.hypot(event.clientX-point.x,event.clientY-point.y)>12) point.moved=true;
      if(point && candidate && Math.hypot(event.clientX-point.x,event.clientY-point.y)>12) candidate.valid=false;
      if(candidate){event.preventDefault();event.stopImmediatePropagation();}
    },{capture:true,passive:false});
    function end(event){
      if(!points.has(event.pointerId)) return;
      points.delete(event.pointerId);
      if(event.type==='pointercancel' && candidate) candidate.valid=false;
      if(candidate) { event.preventDefault(); event.stopImmediatePropagation(); }
      if(points.size===0 && candidate){
        const selected=candidate; candidate=null; blockedUntil=Date.now()+800;
        if(selected.valid && performance.now()-selected.time<500) open(selected.name);
      }
    }
    window.addEventListener('pointerup',end,{capture:true,passive:false});
    window.addEventListener('pointercancel',end,{capture:true,passive:false});
    cleanup=function(){window.removeEventListener('pointerup',end,true);window.removeEventListener('pointercancel',end,true);};
    deck.addEventListener('click',function(event){if(Date.now()<blockedUntil){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
    deck.addEventListener('keydown',function(event){if(event.key==='ContextMenu' || (event.shiftKey && event.key==='F10')){const card=event.target.closest('.dcard');if(card){event.preventDefault();open(card.dataset.name);}}});
  }
  window.addEventListener('blur',hide);
  window.EzDeckMenus={bind};
})();
