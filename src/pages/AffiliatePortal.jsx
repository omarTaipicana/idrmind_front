import React,{useEffect,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {affiliateApi,money,date,position} from '../services/affiliateApi';
import {ProfileForm,UploadDocument,ViewDocument} from '../components/affiliates/FinancialWidgets';
import './styles/Affiliates.css';
import './styles/AffiliateWelcome.css';
import {readAffiliateInvitation,withAffiliateInvitation} from '../services/affiliateInvitation';
import AffiliateGuide from '../components/afiliados/AffiliateGuide';
export default function AffiliatePortal(){
 const location=useLocation(),[data,setData]=useState(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[tab,setTab]=useState('resumen'),[invoice,setInvoice]=useState(null);
 const invite=readAffiliateInvitation(location.search);
 async function load(){try{setData(await affiliateApi('/affiliates/me'));setError('');}catch(e){setError(e.response?.data?.message||'Inicia sesión para acceder a tu afiliación.');}}
 useEffect(()=>{if(localStorage.getItem('token'))load();},[]);
 async function act(path,body,method='post'){setBusy(true);setError('');setMessage('');try{const result=await affiliateApi(path,method,body);setMessage(result.message||'Solicitud enviada correctamente.');setInvoice(null);await load();return true;}catch(e){setError(e.response?.data?.message||'No se pudo completar la operación.');return false;}finally{setBusy(false);}}
 const origin=window.location.origin+window.location.pathname;
 if(!localStorage.getItem('token'))return <AffiliateWelcome invitation={invite}/>;
 if(!data)return <main className="af-page"><p role="status">{error||'Cargando afiliación…'}</p><button onClick={load}>Reintentar</button></main>;
 const p=data.profile,m=data.metrics||{};
 const archived=p?.status==='archivado';
 const application=!p||['pendiente','rechazado','archivado'].includes(p.status);
 const applicationInvitation=invite??(p&&!archived?p.sponsorCode||null:null);
 return <main className="af-page"><header className="af-heading"><div><span className="af-eyebrow">RED DE AFILIADOS</span><h1>{p?'Mi negocio':'Quiero ser afiliado'}</h1><p>Comisiones por ventas reales de certificados y resultados. Cursos y tests gratuitos.</p></div><button onClick={load} disabled={busy}>Actualizar</button></header>{error&&<p role="alert" className="af-error">{error}</p>}{message&&<p role="status" className="af-success">{message}</p>}
 {application?<section className="af-card">
 <h2>{archived?'Solicitud archivada':p?'Solicitud '+p.status:'Solicitud de afiliación'}</h2>
 {!archived&&p?.review_note&&<p>{p.review_note}</p>}
 {archived?<p>Tu cuenta sigue disponible. Puedes presentar una nueva solicitud con la invitación de un afiliado habilitado. Al enviarla, administración revisará el nuevo nivel de ingreso.</p>:
 <p>La administración de iDr.Mind revisará tu solicitud. Si postulas sin invitación, evaluará tu ingreso como Director comercial. Si tienes una invitación, comprueba el nivel y el patrocinador antes de enviar.</p>}
 <ProfileForm key={(p?.id||'new')+':'+(p?.status||'new')+':'+(applicationInvitation??'directa')}
  initial={p||data.user} terms={data.terms}
  invitation={applicationInvitation} requiresSponsor={archived}
  button={archived?'Enviar nueva solicitud':'Enviar solicitud'}
  onSubmit={body=>act('/affiliates/apply',body)} busy={busy}/>
 </section>:<><div className="af-status"><strong>{p.position}</strong><span className="af-badge">{p.status}</span><span>Código: {p.code}</span></div><nav className="af-tabs">{[['resumen','Resumen y enlaces'],['ventas','Ventas y comisiones'],['equipo','Mi equipo'],['cobros','Mis liquidaciones'],['datos','Mis datos']].map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}</nav>
 {tab==='resumen'&&<><div className="af-kpis">{[['Comisión directa',m.directRate+' %'],['Ventas propias del mes',money(m.revenueCents)],['Saldo sin liquidar',money(m.balanceCents)],['Comisiones acumuladas',money(m.earnedCents)]].map(([label,value])=><article key={label}><small>{label}</small><strong>{value}</strong></article>)}</div><section className="af-card"><h2>Avance comercial</h2><p>{m.revenueCents>=data.config.revenueGoals[1]*100?'Ya alcanzaste el umbral comercial Avanzado para el próximo mes.':`Te faltan ${money((m.revenueCents>=data.config.revenueGoals[0]*100?data.config.revenueGoals[1]:data.config.revenueGoals[0])*100-m.revenueCents)} para el siguiente umbral comercial.`}</p><p>La categoría del próximo mes depende de tus ventas propias validadas de este mes. Umbrales: {money(data.config.revenueGoals[0]*100)} / {money(data.config.revenueGoals[1]*100)}. Comisiones directas: {data.config.directRates.join(' / ')} %.</p><progress max={data.config.revenueGoals[1]*100} value={Math.max(0,m.revenueCents||0)}/><p>{p.depth<4?`${m.tests} de ${m.recruitGoal} ventas propias de resultados de tests para habilitar invitaciones. La meta es acumulada.`:'Promotor es la última posición de la rama. Puedes mejorar tu comisión directa por ventas sin abrir un quinto nivel.'}</p>{p.depth<4&&<progress max={Math.max(1,m.recruitGoal)} value={Math.min(m.tests,m.recruitGoal)}/>}</section><section className="af-card"><h2>Enlaces para compartir</h2>{p.status==='activo'?<><Share label="Enlace general de ventas" value={`${origin}#/?ref=${p.code}`}/>{data.courses?.map(course=><Share key={course.id} label={course.nombre} value={`${origin}#/${course.tipo==='test_psicotecnico'?'proyectopensar':'register_discente/'+encodeURIComponent(course.sigla)}?ref=${p.code}`}/>)}{m.canRecruit?<Share label="Invitar nuevo afiliado" value={`${origin}#/afiliados?invita=${p.code}`}/>:<p>Invitaciones no disponibles hasta cumplir la meta o por límite de profundidad.</p>}</>:<p>La afiliación está suspendida; no se habilitan nuevas ventas ni invitaciones con este código.</p>}</section></>}
 {tab==='ventas'&&<><section className="af-card"><h2>Ventas propias validadas</h2><div className="af-table"><table><thead><tr><th>Fecha</th><th>Servicio</th><th>Pago</th><th>Base neta</th><th>Devuelto</th></tr></thead><tbody>{data.sales.map(s=><tr key={s.id}><td>{date(s.validated_at)}</td><td>{s.course_name} · {s.payment_type}</td><td>{money(s.gross_cents)}</td><td>{money(s.net_base_cents)}</td><td>{money(s.refunded_cents)}</td></tr>)}</tbody></table></div></section><section className="af-card"><h2>Movimientos de comisiones</h2><div className="af-table"><table><thead><tr><th>Fecha</th><th>Origen</th><th>Servicio</th><th>Porcentaje</th><th>Movimiento</th><th>Estado</th></tr></thead><tbody>{data.entries.map(e=><tr key={e.id}><td>{date(e.created_at)}</td><td>{e.level===0?'Venta propia':'Equipo · distancia '+e.level}</td><td>{e.course_name}</td><td>{e.rate} %</td><td>{money(e.amount_cents)} {e.refund_id?'(devolución)':''}</td><td>{e.payout_id?'En liquidación':'Sin liquidar'}</td></tr>)}</tbody></table></div><p>Las devoluciones pueden dejar un saldo negativo por compensar con futuras comisiones. Se muestran los últimos 200 movimientos.</p></section></>}
 {tab==='equipo'&&<section className="af-card"><h2>Afiliados invitados directamente</h2><div className="af-table"><table><thead><tr><th>Afiliado</th><th>Posición</th><th>Estado</th><th>Solicitud</th></tr></thead><tbody>{data.team.map(t=><tr key={t.id}><td>{t.fiscal_name}</td><td>{position(t.depth)}</td><td>{t.status}</td><td>{date(t.created_at)}</td></tr>)}</tbody></table></div>{!data.team.length&&<p>Aún no tienes afiliados directos.</p>}</section>}
 {tab==='cobros'&&<section className="af-card"><h2>Liquidaciones mensuales</h2><p>Completa RUC, dirección fiscal y datos bancarios antes del cierre. Si faltan datos, el saldo se conserva para el siguiente corte.</p><p>Mínimo configurable de cobro: {money(data.config.minimumPayout*100)}. Los saldos menores se acumulan. La liquidación interna no sustituye a tu factura.</p><p>Facturar a: <strong>{data.config.merchantName||'Pendiente de configurar por administración'}</strong> · RUC {data.config.merchantRuc||'pendiente'} · {data.config.merchantAddress}{data.config.merchantEmail&&<> · Correo: <a href={'mailto:'+data.config.merchantEmail}>{data.config.merchantEmail}</a></>}</p><div className="af-table"><table><thead><tr><th>Mes</th><th>Comisión base</th><th>IVA factura</th><th>Retenciones</th><th>Neto</th><th>Estado / acciones</th></tr></thead><tbody>{data.payouts.map(row=><tr key={row.id}><td>{row.month}</td><td>{money(row.commission_cents)}</td><td>{money(row.invoice_vat_cents)}</td><td>{money(Number(row.retention_income_cents)+Number(row.retention_vat_cents))}</td><td>{money(Number(row.commission_cents)+Number(row.invoice_vat_cents)-Number(row.retention_income_cents)-Number(row.retention_vat_cents))}</td><td><strong>{row.status}</strong><small>{row.note}</small>{row.status==='pendiente_factura'&&<button onClick={()=>setInvoice(row)}>Subir factura</button>}<ViewDocument id={row.invoice_id} label="Mi factura"/><ViewDocument id={row.proof_id} label="Comprobante de pago"/><ViewDocument id={row.retention_proof_id} label="Comprobante de retención"/></td></tr>)}</tbody></table></div>{invoice&&<InvoiceForm row={invoice} busy={busy} onCancel={()=>setInvoice(null)} onSubmit={body=>act(`/affiliates/payouts/${invoice.id}/invoice`,body)}/>}</section>}
 {tab==='datos'&&<section className="af-card"><h2>Datos fiscales y bancarios</h2><ProfileForm key={p.updated_at} initial={p} application={false} busy={busy} button="Actualizar mis datos" onSubmit={body=>act('/affiliates/me',body,'put')}/></section>}
 </>}</main>;
}
function Share({label,value}){return <label className="af-share">{label}<div><input readOnly value={value} onFocus={e=>e.target.select()}/><button onClick={()=>navigator.clipboard?.writeText(value)}>Copiar</button></div></label>}
function InvoiceForm({row,busy,onSubmit,onCancel}){const [fileId,setFileId]=useState(null);return <form className="af-form af-invoice" onSubmit={e=>{e.preventDefault();onSubmit({...Object.fromEntries(new FormData(e.currentTarget)),fileId});}}><h3>Factura de {row.month} · base {money(row.commission_cents)}</h3><div className="af-fields"><label>Número<input name="number" required pattern="[0-9]{3}-[0-9]{3}-[0-9]{9}" placeholder="001-001-000000001"/></label><label>Clave de acceso<input name="key" required pattern="[0-9]{49}" maxLength="49"/></label><label>Base de comisión<input name="base" readOnly value={(row.commission_cents/100).toFixed(2)}/></label><label>IVA de tu factura<input name="vat" type="number" min="0" step="0.01" defaultValue="0" required/></label></div><UploadDocument purpose="factura" label="Factura PDF o XML" onUploaded={setFileId}/><button disabled={busy||!fileId}>Enviar factura para revisión</button><button type="button" onClick={onCancel}>Cancelar</button></form>}

function AffiliateWelcome({invitation}){
 const steps=[
  ['Usa tu cuenta', 'Inicia sesión si ya tienes una cuenta de iDr.Mind o crea una nueva.'],
  ['Envía tu solicitud', 'En Afíliate / Mi negocio, completa tus datos y espera la aprobación.'],
  ['Comparte tu enlace', 'Una vez activo, gana comisiones por las ventas que se validen.'],
 ];
 return <main className="af-welcome">
  <div className="af-welcome__layout">
   <AffiliateGuide/>
   <div className="af-welcome__sidebar">
   <section className="af-welcome__intro" aria-labelledby="af-welcome-title">
    <span className="af-welcome__tag">PROGRAMA DE AFILIADOS</span>
    <h1 id="af-welcome-title">Red de afiliados <span>iDr.Mind</span></h1>
    <p className="af-welcome__lead">Comparte tu enlace personal y gana comisiones por ventas de certificados y por el acceso a resultados de tests psicométricos.</p>
    <p className="af-welcome__condition">Afiliación gratuita, sujeta a aprobación.</p>
    {invitation!==null&&<p className="af-welcome__invitation">{invitation?'Llegaste por invitación. Ingresa a tu cuenta para consultar tu patrocinador y nivel.':'Esta invitación no es válida. Pide a quien te invitó un enlace nuevo.'}</p>}
    <div className="af-welcome__actions">
     <Link className="af-welcome__link af-welcome__link--primary" to={withAffiliateInvitation("/login",invitation)}>Iniciar sesión <span aria-hidden="true">→</span></Link>
     <Link className="af-welcome__link af-welcome__link--secondary" to={withAffiliateInvitation("/register",invitation)}>Crear cuenta</Link>
    </div>
   </section>
   <section className="af-welcome__guide" aria-labelledby="af-welcome-placement">
    <h2 id="af-welcome-placement">Cómo ingresarás a la red</h2>
    <p>La administración de iDr.Mind revisa cada solicitud. Si postulas sin invitación, evalúa si puedes ingresar como Director y liderar una red.</p>
    <dl className="af-welcome__levels">
     {[['Sin invitación','Director'],['Invitación de un Director','Líder'],['Invitación de un Líder','Asesor'],['Invitación de un Asesor','Promotor']].map(([source,level])=><div key={level}><dt>{source}</dt><dd>{level}</dd></div>)}
    </dl>
    <p>Solo los afiliados habilitados pueden invitar. Promotor es el último nivel.</p>
   </section>
   <section className="af-welcome__guide" aria-labelledby="af-welcome-guide">
    <h2 id="af-welcome-guide">Cómo empezar</h2>
    <ol>{steps.map(([title,body],index)=><li key={title}>
     <span className="af-welcome__number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
     <div><h3>{title}</h3><p>{body}</p></div>
    </li>)}</ol>
   </section>
   </div>
  </div>
 </main>;
}
