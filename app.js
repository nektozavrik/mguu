(()=>{
 const params=new URLSearchParams(location.search), standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const launching=params.get('launch')==='1'||standalone;
 const chooser=document.getElementById('group'),status=document.getElementById('status');let groups=[],selected=null,installPrompt=null;
 function saved(){try{return localStorage.getItem('mguu.group')}catch{return null}}
 function remember(id){try{localStorage.setItem('mguu.group',id)}catch{}}
 function portal(group,now=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  const start=new Date(Date.UTC(+p.year,+p.month-1,+p.day)),end=new Date(start);end.setUTCDate(end.getUTCDate()+14);
  const fmt=d=>String(d.getUTCDate()).padStart(2,'0')+'.'+String(d.getUTCMonth()+1).padStart(2,'0')+'.'+d.getUTCFullYear();
  const u=new URL('https://portal.mguu.ru/student/scheduler1.php');u.search=new URLSearchParams({groupid:group.id.padStart(9,'0'),groupname:group.name,startDate:fmt(start),endDate:fmt(end)});u.hash='schedule';return u.href;
 }
 function open(){if(selected)location.replace(portal(selected))}
 function choose(id){selected=groups.find(g=>g.id===id)||groups[0];chooser.value=selected.id;remember(selected.id);document.getElementById('manifest').href='./manifests/g'+selected.id+'.webmanifest';
  history.replaceState(null,'','?g='+selected.id+'&setup=1');status.textContent='Сохранено: '+selected.name;document.getElementById('open').disabled=false;document.getElementById('copy').disabled=false;}
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;document.getElementById('install').hidden=false});
 document.getElementById('install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;document.getElementById('install').hidden=true}};
 document.getElementById('open').onclick=open;
 document.getElementById('copy').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);status.textContent='Ссылка настройки скопирована'}catch{status.textContent='Скопируйте адрес из адресной строки браузера'}};
 chooser.onchange=()=>choose(chooser.value);
 if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
 if(launching)document.body.classList.add('launch');
 fetch('./groups.json').then(r=>{if(!r.ok)throw Error('groups');return r.json()}).then(data=>{
  groups=data;const wanted=params.get('g')||saved(),group=groups.find(g=>g.id===wanted);
  if(launching&&group){selected=group;open();return}
  chooser.replaceChildren();for(const year of ['26','25','24','23','22']){const optgroup=document.createElement('optgroup');optgroup.label=(27-Number(year))+' курс';groups.filter(g=>g.name.startsWith(year)).forEach(g=>{const opt=document.createElement('option');opt.value=g.id;opt.textContent=g.name;optgroup.append(opt)});chooser.append(optgroup)}chooser.disabled=false;document.body.classList.remove('launch');choose(group?.id||'304');
 }).catch(()=>{document.body.classList.remove('launch');status.textContent='Не удалось загрузить группы. Проверьте интернет и обновите страницу.'});
})();
