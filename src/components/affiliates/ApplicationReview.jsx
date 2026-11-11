import React,{useEffect,useState} from 'react';
import {affiliateApi,date,money,position} from '../../services/affiliateApi';

export default function ApplicationReview({profiles,termsVersion,busy,onReview}){
 const [view,setView]=useState('pending');
 const [query,setQuery]=useState('');
 const [archives,setArchives]=useState(null);
 const [error,setError]=useState('');
 useEffect(()=>{
  if(view!=='archived')return;
  let active=true;
  setArchives(null);
  setError('');
  const timer=setTimeout(async()=>{
   try{
    const response=await affiliateApi('/affiliates/admin/archived-applications?q='+encodeURIComponent(query.trim()));
    if(active)setArchives(response.archives);
   }catch(e){
    if(active)setError(e.response?.data?.message||'No se pudieron cargar las solicitudes archivadas.');
   }
  },250);
  return ()=>{active=false;clearTimeout(timer);};
 },[view,query]);

 const visible=profiles.filter(p=>(view==='pending'?p.status==='pendiente':p.status!=='pendiente')&&
  [p.fiscal_name,p.document,p.code,p.email,p.sponsor_name].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 const switchView=value=>{if(value==='archived'&&view!==value){setArchives(null);setError('');}setView(value);};
 const submit=(p,action,note)=>onReview('/profiles/'+p.id,{action,note,expectedUpdatedAt:p.updated_at});
 const sponsorLabel=p=>p.sponsor_name?`${p.sponsor_name} (${position(p.sponsor_depth)})`:'Sin patrocinador';

 return <section className="af-card">
  <nav className="af-tabs" aria-label="Vistas de solicitudes">
   {[['pending','Pendientes'],['archived','Archivadas'],['network','Red y otras solicitudes']].map(([key,label])=>
    <button key={key} type="button" className={key===view?'active':''} aria-pressed={key===view} onClick={()=>switchView(key)}>{label}</button>
   )}
  </nav>
  <div className="af-search"><input aria-label="Buscar solicitud" placeholder="Nombre, correo, documento o patrocinador" value={query} onChange={e=>setQuery(e.target.value)}/></div>
  {view==='archived'?<>
   <p>El historial conserva el nivel solicitado, el patrocinador y el motivo interno, incluso si la persona vuelve a postular.</p>
   {error?<p role="alert">{error}</p>:!archives?<p role="status">Cargando solicitudes archivadas…</p>:!archives.length?<p>No hay solicitudes archivadas para mostrar.</p>:
    <div className="af-table"><table><thead><tr><th>Solicitud</th><th>Nivel anterior / patrocinador</th><th>Motivo interno</th><th>Fecha de archivo</th><th>Seguimiento</th></tr></thead><tbody>{archives.map(a=><tr key={a.id}>
     <td><strong>{a.details.applicantName}</strong><small>{a.details.email} · {a.details.document}</small></td>
     <td>{a.details.position}<small>{a.details.sponsorName?`${a.details.sponsorName} (${a.details.sponsorPosition})`:'Sin patrocinador'}</small></td>
     <td>{a.details.note}</td><td>{date(a.created_at)}</td>
     <td><span className="af-badge">{a.still_archived?'Archivada':'Volvió a postular'}</span>{!a.still_archived&&<small>Estado actual: {a.current_status}</small>}</td>
    </tr>)}</tbody></table></div>}
  </>:!visible.length?<p>{view==='pending'?'No hay solicitudes pendientes para mostrar.':'No hay afiliados o solicitudes para mostrar.'}</p>:
   <div className="af-table"><table><thead><tr><th>Afiliado</th><th>Nivel / patrocinador</th>{view==='network'&&<th>Meta / saldo</th>}<th>Datos y consentimiento</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    {visible.map(p=><tr key={p.id}>
     <td><strong>{p.fiscal_name}</strong><small>{p.email} · {p.document}</small><small>{p.code}</small></td>
     <td><strong>{p.position}</strong><small>{sponsorLabel(p)}</small>{p.status==='pendiente'&&!p.sponsor_id&&<small>Ingreso directo: evaluar capacidad para dirigir una red.</small>}</td>
     {view==='network'&&<td>{p.tests} ventas de tests<small>Saldo: {money(p.balanceCents)}</small></td>}
     <td>{p.ruc||'RUC pendiente'}<small>{p.accepted_at?'Condiciones '+p.terms_version+' · '+date(p.accepted_at):'Falta aceptación del usuario'}</small><small>{p.phone}</small>{p.status==='pendiente'&&p.accepted_at&&p.terms_version!==termsVersion&&<small>Debe aceptar la versión {termsVersion} en Mi negocio.</small>}</td>
     <td><span className="af-badge">{p.status}</span><small>{p.review_note}</small></td>
     <td>
      {p.status==='pendiente'&&<>
       <button className="af-primary" disabled={busy||!p.accepted_at||p.terms_version!==termsVersion} onClick={()=>{
        const check=p.sponsor_id?'':'\n\nConfirma que la persona puede liderar una red como Director comercial.';
        if(window.confirm(`¿Aprobar a ${p.fiscal_name} como ${p.position}?\nPatrocinador: ${sponsorLabel(p)}.${check}`))submit(p,'approve');
       }}>Aprobar como {p.position.replace(' comercial','')}</button>
       <button disabled={busy} onClick={()=>{
        const note=window.prompt(`Motivo interno para archivar la solicitud de ${p.fiscal_name} como ${p.position}:`)?.trim();
        if(note)submit(p,'archive',note);
       }}>Archivar</button>
       <button disabled={busy} onClick={()=>{const note=window.prompt('Motivo del rechazo')?.trim();if(note)submit(p,'reject',note);}}>Rechazar</button>
      </>}
      {p.status==='activo'&&<button disabled={busy} onClick={()=>window.confirm('¿Suspender al afiliado?')&&submit(p,'suspend')}>Suspender</button>}
      {p.status==='suspendido'&&<button disabled={busy} onClick={()=>window.confirm('¿Reactivar al afiliado?')&&submit(p,'reactivate')}>Reactivar</button>}
     </td>
    </tr>)}
   </tbody></table></div>}
 </section>;
}
