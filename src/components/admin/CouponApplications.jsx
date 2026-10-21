import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getConfigToken from '../../services/getConfigToken';
import './CouponApplications.css';
import {couponTypeLabels} from './couponPresentation';
const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const initialFilters = { q:'',tipo:'',servicio:'',estado:'',ejecucion:'',fecha:'creacion',desde:'',hasta:'' };
const typeLabels = couponTypeLabels;
const certLabels = {cert_emp:'Empresarial',cert_mdt:'Ministerio',cert_int:'Internacional'};
const stateLabels = {activo:'Activo',suspendido:'Suspendido',vencido:'Vencido',agotado:'Agotado',proximo:'Próximo'};
const executionLabels = {sin_usar:'Sin canjear',completado:'Beneficio ejecutado',pendiente_pago:'Saldo pendiente de validación',pendiente_certificado:'Certificado pendiente de emisión',pendiente_resultado:'Resultado pendiente de liberación'};
const money = value => value == null ? '—' : '$'+Number(value).toFixed(2);
const date = value => value ? new Date(value).toLocaleDateString('es-EC',{timeZone:'America/Guayaquil'}) : '—';
const dateTime = value => value ? new Date(value).toLocaleString('es-EC',{timeZone:'America/Guayaquil',dateStyle:'short',timeStyle:'short'}) : '—';
function Icon({ name }) {
 const paths={refresh:'M20 7v5h-5 M4 17v-5h5 M6.1 7a7 7 0 0 1 11.6-1L20 9 M4 15l2.3 3A7 7 0 0 0 18 17',filter:'M4 5h16l-6 7v6l-4 2v-8z',certificate:'M6 3h12v13H6z M9 16v5l3-2 3 2v-5',arrow:'M5 12h14 M14 7l5 5-5 5'};
 return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.refresh}/></svg>;
}
export default function CouponApplications({ onPayments }) {
 const [filters,setFilters]=useState(initialFilters),[applied,setApplied]=useState(initialFilters);
 const [page,setPage]=useState(1),[limit,setLimit]=useState(25),[refresh,setRefresh]=useState(0);
 const [data,setData]=useState({rows:[],total:0,pages:1,summary:{cupones:0,canjes:0,completados:0}});
 const [busy,setBusy]=useState(false),[actionBusy,setActionBusy]=useState(null),[error,setError]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{
  const controller=new AbortController(); let current=true;
  setBusy(true);setError('');
  axios.get(base+'/benefit-coupons/register',{...getConfigToken(),params:{...applied,page,limit},signal:controller.signal}).then(({data:result})=>{if(current)setData(result);}).catch(e=>{if(current&&!axios.isCancel(e))setError(e.response?.data?.message||'No se pudo cargar la lista de cupones.');}).finally(()=>{if(current)setBusy(false)});
  return ()=>{current=false;controller.abort();};
 },[applied,page,limit,refresh]);
 const change=(key,value)=>setFilters(previous=>({...previous,[key]:value}));
 const apply=e=>{e.preventDefault();setMessage('');setPage(1);setApplied({...filters});};
 const clear=()=>{setFilters(initialFilters);setApplied({...initialFilters});setPage(1);setMessage('');};
 async function issue(row){
  setActionBusy(row.redemptionId);setMessage('');setError('');
  try {
   const endpoint=row.cubierto?`/benefit-coupons/applications/${row.redemptionId}/certificate`:`/pagos/${row.paymentId}/certificado`;
   const {data:result}=await axios.post(base+endpoint,{tipo:'cert_emp'},getConfigToken());
   setMessage(result.message||'Certificado emitido.');setRefresh(n=>n+1);
  } catch(e) {setError(e.response?.data?.message||'No se pudo emitir el certificado.');}
  finally {setActionBusy(null);}
 }
 const rows=data.rows||[];
 return <section className="secCard coupon-register" aria-busy={busy}>
  <div className="secCardHeader coupon-register__header"><div><span className="coupon-register__eyebrow">VALIDACIÓN DE PAGOS</span><h2 className="secTitle">Lista de Cupones</h2><p>Todos los códigos, incluidos los no utilizados. Cada canje muestra quién lo usó y si el beneficio ya se ejecutó.</p></div><button className="coupon-register__button" type="button" disabled={busy||!!actionBusy} onClick={()=>setRefresh(n=>n+1)} title="Actualizar cupones y ejecución de beneficios"><Icon name="refresh"/>Actualizar</button></div>
  <form className="coupon-register__filters" onSubmit={apply}>
   <label className="coupon-register__search">Buscar<input value={filters.q} maxLength={180} onChange={e=>change('q',e.target.value)} placeholder="Nombre, código, participante, documento o curso"/></label>
   <label>Tipo de cupón<select value={filters.tipo} onChange={e=>change('tipo',e.target.value)}><option value="">Todos los tipos</option>{Object.entries(typeLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
   <label>Servicio<select value={filters.servicio} onChange={e=>change('servicio',e.target.value)}><option value="">Todos</option><option value="resultados">Resultados psicométricos</option><option value="certificados">Certificados</option></select></label>
   <label>Estado del cupón<select value={filters.estado} onChange={e=>change('estado',e.target.value)}><option value="">Todos los estados</option>{Object.entries(stateLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
   <label>Canje / ejecución<select value={filters.ejecucion} onChange={e=>change('ejecucion',e.target.value)}><option value="">Todos</option><option value="canjeado">Canjeados (todos)</option>{Object.entries(executionLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
   <label>Filtrar fecha de<select value={filters.fecha} onChange={e=>change('fecha',e.target.value)}><option value="creacion">Creación del cupón</option><option value="canje">Canje</option><option value="vencimiento">Vencimiento</option></select></label>
   <label>Desde<input type="date" value={filters.desde} max={filters.hasta||undefined} onChange={e=>change('desde',e.target.value)}/></label>
   <label>Hasta<input type="date" value={filters.hasta} min={filters.desde||undefined} onChange={e=>change('hasta',e.target.value)}/></label>
   <div className="coupon-register__filter-actions"><button className="coupon-register__button coupon-register__button--primary" disabled={busy} type="submit"><Icon name="filter"/>Aplicar filtros</button><button className="coupon-register__button" type="button" disabled={busy} onClick={clear}>Limpiar</button></div>
  </form>
  <div className="coupon-register__summary"><span><strong>{data.summary?.cupones||0}</strong> códigos</span><span><strong>{data.summary?.canjes||0}</strong> canjes</span><span><strong>{data.summary?.completados||0}</strong> beneficios ejecutados</span><small>Según los filtros aplicados · Un código puede aparecer en varios canjes.</small></div>
  {error&&<p className="coupon-register__error" role="alert">{error}</p>}{message&&<p className="coupon-register__message" role="status">{message}</p>}
  <div className="coupon-register__tablebar"><p role="status">{busy?'Cargando cupones…':`${data.total||0} registros encontrados`}</p><label>Filas por página<select value={limit} onChange={e=>{setLimit(Number(e.target.value));setPage(1);}} disabled={busy}>{[25,50,100].map(n=><option key={n} value={n}>{n}</option>)}</select></label></div>
  <div className="secTableWrap coupon-register__scroll"><table className="secTable vpTable coupon-register__table"><caption className="coupon-register__sr">Cupones, vigencia, canjes y ejecución de certificados o resultados</caption><thead><tr><th scope="col">Cupón / tipo</th><th scope="col">Vigencia</th><th scope="col">Cupos</th><th scope="col">Participante / curso</th><th scope="col">Canje</th><th scope="col">Beneficio</th><th scope="col">Importes</th><th scope="col">Ejecución</th><th scope="col">Acciones</th></tr></thead><tbody>
   {rows.length===0?<tr><td colSpan="9" className="coupon-register__empty">{busy?'Cargando…':error?'No se pudo obtener el listado.':'No hay cupones que coincidan con los filtros.'}</td></tr>:rows.map(row=>{
    const issued=row.certificadosEmitidos||[];
    const discountType=row.couponSnapshot?.descuentoTipo||row.descuentoTipo;
    const discountValue=row.couponSnapshot?.descuentoValor??row.descuentoValor;
    const canIssue=row.redemptionId&&(row.cubierto||row.pagoVerificado)&&row.seleccion.includes('cert_emp')&&!issued.includes('cert_emp');
    return <tr key={`${row.couponId}-${row.redemptionId||'sin-canje'}`}>
     <td><strong>{row.nombre}</strong><code>{row.codigo}</code><small>{typeLabels[row.tipo]||row.tipo}</small><span className={`coupon-register__badge coupon-register__badge--${row.estadoCupon}`}>{stateLabels[row.estadoCupon]}</span></td>
     <td><small>Creado: {date(row.creadoAt)}</small><small>Desde: {row.vigenteDesde?date(row.vigenteDesde):'Sin restricción'}</small><strong>Vence: {row.venceAt?date(row.venceAt):'Sin vencimiento'}</strong></td>
     <td><strong>{row.usos} / {row.maxUsos}</strong><small>{row.disponibles} disponibles</small></td>
     <td><strong>{row.redemptionId?row.participante||'Participante no disponible':'Sin beneficiario todavía'}</strong><small>{row.empresaId?row.empresaNombre||"Empresa restringida":"Cualquier empresa"}</small>{!row.redemptionId&&<small>{row.objetivoId?row.cursoAsignado||"Curso/test restringido":"Cualquier curso/test del servicio"}</small>}{row.redemptionId&&<><small>{row.documento||'Sin documento'}</small><small>{row.email}</small><small>{row.cursoNombre||row.cursoSigla||'Curso no disponible'}</small></>}</td>
     <td><span className={`coupon-register__badge ${row.redemptionId?'coupon-register__badge--canjeado':''}`}>{row.redemptionId?'Sí, canjeado':'No utilizado'}</span><small>{dateTime(row.canjeadoAt)}</small></td>
     <td><strong>{row.servicio==='resultados'?'Resultados individuales':'Certificados'}</strong><small>{(row.servicio==='certificados'?(row.redemptionId?row.seleccion:row.certificadosPermitidos||[]):[]).map(t=>certLabels[t]||t).join(', ')}</small><small>{(row.couponSnapshot?discountType!=='cortesia':row.tipo==='descuento')?discountType==='porcentaje'?`${discountValue}% de descuento`:`${money(discountValue)} de descuento fijo`:'Cortesía del servicio'}</small></td>
     <td className="coupon-register__amounts">{row.redemptionId?<><small>Original <b>{money(row.precioOriginal)}</b></small><small>Descuento <b>−{money(row.montoDescontado)}</b></small><small>Saldo <b>{money(row.saldoPendiente)}</b></small>{row.paymentId&&<small>Pago registrado <b>{money(row.valorDepositado)}</b></small>}</>:<span>Sin aplicar</span>}</td>
     <td><span className={`coupon-register__badge coupon-register__badge--${row.ejecucion}`}>{executionLabels[row.ejecucion]||'Canje registrado'}</span>{row.redemptionId&&<><small>{row.cubierto?'Con cupón · cobertura completa':row.pagoVerificado?'Cupón + saldo validado':row.paymentId?'Comprobante pendiente de validación':'Falta registrar pago del saldo'}</small>{row.servicio==='resultados'&&row.resultadoLiberado&&<small>Resultados liberados</small>}{issued.length>0&&<small>Emitidos: {issued.map(t=>certLabels[t]||t).join(', ')}</small>}</>}</td>
     <td><div className="coupon-register__row-actions">{canIssue&&<button className="coupon-register__button" type="button" title="Emitir certificado empresarial; se verifica aprobación académica" disabled={busy||!!actionBusy} onClick={()=>issue(row)}><Icon name="certificate"/>{actionBusy===row.redemptionId?'Emitiendo…':'Certificar'}</button>}{row.paymentId&&<button className="coupon-register__button" type="button" disabled={busy||!!actionBusy} onClick={()=>onPayments?.()} title="Revisar el pago bancario y el descuento en Validar Pagos"><Icon name="arrow"/>Ver pagos</button>}{!canIssue&&!row.paymentId&&<small>{!row.redemptionId?'Disponible para canje':row.ejecucion==='completado'?'Ejecutado':row.servicio==='certificados'?'Importar en Secretaría':'Sin acción pendiente aquí'}</small>}</div></td>
    </tr>;
   })}
  </tbody></table></div>
  <div className="coupon-register__pagination"><span>Página {data.page||1} de {data.pages||1}</span><div><button className="coupon-register__button" type="button" disabled={busy||(data.page||page)<=1} onClick={()=>setPage(Math.max(1,(data.page||page)-1))}>Anterior</button><button className="coupon-register__button" type="button" disabled={busy||(data.page||page)>=(data.pages||1)} onClick={()=>setPage((data.page||page)+1)}>Siguiente</button></div></div>
 </section>;
}
