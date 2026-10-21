import React, {useEffect, useState} from 'react';
import axios from 'axios';
import getConfigToken from '../../services/getConfigToken';
import CouponLookup from './CouponLookup';
import {couponTypeLabels, couponType, couponService} from './couponPresentation';
import './CouponAdmin.css';
const api = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/benefit-coupons';
const certificateTypes = [['cert_emp','Empresarial'],['cert_mdt','Ministerio'],['cert_int','Internacional']];
const defaults = {codigo:'',nombre:'',tipo:'test_gratis',servicio:'resultados',empresaId:'',objetivoId:'',descuentoTipo:'porcentaje',descuentoValor:'',maxUsos:1,maxPorPersona:1,vigenteDesde:'',venceAt:'',incluyeResultados:true,certificadosPermitidos:['cert_emp','cert_mdt','cert_int'],beneficiarios:[],activo:true};
const status = coupon => !coupon.activo ? 'Suspendido' : coupon.venceAt && new Date(coupon.venceAt) <= new Date() ? 'Vencido' : coupon.vigenteDesde && new Date(coupon.vigenteDesde) > new Date() ? 'Próximo' : coupon.usos >= coupon.maxUsos ? 'Agotado' : 'Activo';
export default function CouponAdmin() {
  const [items,setItems] = useState([]), [form,setForm] = useState(defaults), [editing,setEditing] = useState(null);
  const [message,setMessage] = useState(''), [busy,setBusy] = useState(false), [history,setHistory] = useState(null);
  const [beneficiaryText,setBeneficiaryText] = useState('');
  async function load() {
    try {const {data} = await axios.get(api,getConfigToken());setItems(data);}
    catch(error) {setMessage(error.response?.data?.message || 'No fue posible cargar los cupones.');}
  }
  useEffect(()=>{load();},[]);
  function change(key,value) {
    setForm(previous=>{
      const next = {...previous,[key]:value};
      if (key === 'tipo') next.servicio = couponService(value,previous.servicio);
      if (next.servicio !== previous.servicio) next.objetivoId = '';
      if (next.servicio !== previous.servicio && next.servicio === 'certificados' && !next.certificadosPermitidos.length) next.certificadosPermitidos = defaults.certificadosPermitidos;
      next.incluyeResultados = next.servicio === 'resultados';
      return next;
    });
  }
  function reset() {setEditing(null);setForm(defaults);setBeneficiaryText('');}
  function edit(coupon) {
    const type = couponType(coupon), service = couponService(type,coupon.servicio);
    setEditing(coupon.id);
    setForm({...defaults,...coupon,tipo:type,servicio:service,incluyeResultados:service==='resultados',
      empresaId:coupon.empresaId||'',objetivoId:service===coupon.servicio?coupon.objetivoId||'':'',
      certificadosPermitidos:coupon.certificadosPermitidos?.length?coupon.certificadosPermitidos:defaults.certificadosPermitidos,
      vigenteDesde:coupon.vigenteDesde?new Date(new Date(coupon.vigenteDesde).getTime()-5*3600000).toISOString().slice(0,16):'',
      venceAt:coupon.venceAt?new Date(new Date(coupon.venceAt).getTime()-5*3600000).toISOString().slice(0,10):''});
    setBeneficiaryText((coupon.beneficiarios||[]).join(', '));
    setMessage(service!==coupon.servicio?'Se corrigió la combinación del tipo y servicio en este formulario. Revisa las restricciones antes de guardar.':type!==coupon.tipo?'El cupón anterior se muestra con su beneficio equivalente. El historial de canjes se conserva.':'');
  }
  async function save(event) {
    event.preventDefault();setBusy(true);setMessage('');
    try {
      const service = couponService(form.tipo,form.servicio);
      const payload = {...form,servicio:service,incluyeResultados:service==='resultados',
        empresaId:form.empresaId||null,objetivoId:form.objetivoId||null,maxUsos:Number(form.maxUsos),maxPorPersona:Number(form.maxPorPersona),
        certificadosPermitidos:service==='certificados'?form.certificadosPermitidos:[],
        beneficiarios:beneficiaryText.split(',').map(value=>value.trim()).filter(Boolean),
        descuentoTipo:form.tipo==='descuento'?form.descuentoTipo:null,descuentoValor:form.tipo==='descuento'?Number(form.descuentoValor):null,
        vigenteDesde:form.vigenteDesde?new Date(form.vigenteDesde+':00-05:00').toISOString():null,
        venceAt:form.venceAt?new Date(form.venceAt+'T23:59:59-05:00').toISOString():null};
      if (editing) await axios.put(api+'/'+editing,payload,getConfigToken()); else await axios.post(api,payload,getConfigToken());
      reset();setMessage('Cupón guardado correctamente.');await load();
    } catch(error) {setMessage(error.response?.data?.message || 'No se pudo guardar el cupón.');}
    finally {setBusy(false);}
  }
  async function toggle(coupon) {
    if (!window.confirm(coupon.activo?'¿Suspender este cupón?':'¿Activar este cupón?')) return;
    try {await axios.put(api+'/'+coupon.id,{activo:!coupon.activo},getConfigToken());await load();}
    catch(error) {setMessage(error.response?.data?.message || 'No se pudo actualizar el cupón.');}
  }
  async function showHistory(coupon) {
    try {const {data} = await axios.get(api+'/'+coupon.id+'/redemptions',getConfigToken());setHistory({coupon,rows:data});}
    catch(error) {setMessage(error.response?.data?.message || 'No se pudo consultar el historial.');}
  }
  return <section className="ca-wrap">
    <header><span className="ca-tag">GESTIÓN ADMINISTRATIVA</span><h1>Cupones y beneficios</h1><p>Libera certificados, resultados de tests o aplica descuentos. Define después a quién y a qué curso/test puede aplicarse.</p></header>
    {message&&<p role="status" className="ca-message">{message}</p>}
    <div className="ca-grid"><form className="ca-panel" onSubmit={save}>
      <h2>{editing?'Editar cupón':'Nuevo cupón'}</h2>
      <fieldset className="ca-group" disabled={busy}><legend>1. Beneficio</legend>
        <label>Nombre del beneficio<input required value={form.nombre} onChange={e=>change('nombre',e.target.value)}/></label>
        <label>Código<input required maxLength={80} disabled={!!editing} value={form.codigo} onChange={e=>change('codigo',e.target.value.toUpperCase())} placeholder="EMPRESA-DEMO-2026"/></label>
        <label>Tipo de cupón<select value={form.tipo} onChange={e=>change('tipo',e.target.value)}>{Object.entries(couponTypeLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        {form.tipo==='descuento'?<><label>Aplicar descuento a<select value={form.servicio} onChange={e=>change('servicio',e.target.value)}><option value="resultados">Resultados psicométricos</option><option value="certificados">Certificados de cursos</option></select></label><div className="ca-duo"><label>Modalidad<select value={form.descuentoTipo} onChange={e=>change('descuentoTipo',e.target.value)}><option value="porcentaje">Porcentaje</option><option value="fijo">Valor fijo USD</option></select></label><label>Descuento<input required type="number" min="0.01" max={form.descuentoTipo==='porcentaje'?100:undefined} step="0.01" value={form.descuentoValor??''} onChange={e=>change('descuentoValor',e.target.value)}/></label></div></>:<div className="ca-service-note"><strong>Servicio autorizado</strong><p>{form.servicio==='certificados'?'Emisión de certificados de cursos.':'Liberación de resultados psicométricos.'}</p><small>El cupón cubre el 100 % del precio de este servicio.</small></div>}
        {form.servicio==='certificados'&&<fieldset className="ca-certificate-options"><legend>Certificados que cubre</legend>{certificateTypes.map(([key,label])=><label className="ca-check" key={key}><input type="checkbox" checked={form.certificadosPermitidos.includes(key)} onChange={e=>change('certificadosPermitidos',e.target.checked?[...form.certificadosPermitidos,key]:form.certificadosPermitidos.filter(type=>type!==key))}/>{label}</label>)}</fieldset>}
        <p className="ca-help">Los cursos y tests se realizan gratuitamente. Los certificados conservan sus requisitos académicos; el acceso empresarial se administra por separado.</p>
      </fieldset>
      <fieldset className="ca-group" disabled={busy}><legend>2. Alcance y destinatarios (opcional)</legend>
        <CouponLookup key={`empresa-${editing||'nuevo'}`} kind="empresa" servicio={form.servicio} value={form.empresaId||''} onChange={value=>change('empresaId',value)} disabled={busy}/>
        <CouponLookup key={`objetivo-${editing||'nuevo'}-${form.servicio}`} kind="objetivo" servicio={form.servicio} value={form.objetivoId||''} onChange={value=>change('objetivoId',value)} disabled={busy}/>
        <label>Beneficiarios específicos<input value={beneficiaryText} onChange={e=>setBeneficiaryText(e.target.value)} placeholder="Correo o documento, separados por comas"/></label>
        <p className="ca-help">Si dejas estas restricciones vacías, puede usarlo cualquier participante para cualquier curso/test del servicio autorizado. Puedes combinar empresa, producto y beneficiarios para restringirlo más.</p>
      </fieldset>
      <fieldset className="ca-group" disabled={busy}><legend>3. Cupos y vigencia</legend>
        <div className="ca-duo"><label>Usos totales<input type="number" min="1" required value={form.maxUsos} onChange={e=>change('maxUsos',e.target.value)}/></label><label>Usos por persona<input type="number" min="1" required value={form.maxPorPersona} onChange={e=>change('maxPorPersona',e.target.value)}/></label></div>
        <label>Vigente desde (hora Ecuador)<input type="datetime-local" value={form.vigenteDesde||''} onChange={e=>change('vigenteDesde',e.target.value)}/></label>
        <label>Vence el (Ecuador)<input type="date" value={form.venceAt||''} onChange={e=>change('venceAt',e.target.value)}/></label>
        <label className="ca-check"><input type="checkbox" checked={!!form.activo} onChange={e=>change('activo',e.target.checked)}/>Cupón activo</label>
      </fieldset>
      <div className="ca-actions"><button disabled={busy} type="submit">{busy?'Guardando…':editing?'Guardar cambios':'Crear cupón'}</button>{editing&&<button disabled={busy} type="button" className="ca-muted" onClick={reset}>Cancelar</button>}</div>
    </form>
    <div className="ca-panel ca-list"><h2>Cupones registrados <small>{items.length}</small></h2>{items.length===0?<p>No hay cupones registrados.</p>:<div className="ca-table-scroll"><table><thead><tr><th>Código / beneficio</th><th>Usos</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{items.map(coupon=><tr key={coupon.id}><td><strong>{coupon.codigo}</strong><small>{coupon.nombre} · {couponTypeLabels[couponType(coupon)]||'Cupón'}</small><small>{coupon.servicio==='resultados'?'Resultados psicométricos':'Certificados de cursos'}</small></td><td>{coupon.usos} / {coupon.maxUsos}<small>{Math.max(0,coupon.maxUsos-coupon.usos)} disponibles</small></td><td><span className={coupon.activo?'ca-active':'ca-inactive'}>{status(coupon)}</span></td><td><div className="ca-row-actions"><button type="button" onClick={()=>edit(coupon)}>Editar</button><button type="button" onClick={()=>toggle(coupon)}>{coupon.activo?'Suspender':'Activar'}</button><button type="button" onClick={()=>showHistory(coupon)}>Historial</button></div></td></tr>)}</tbody></table></div>}</div></div>
    {history&&<div className="ca-modal" role="dialog" aria-modal="true" aria-label={`Canjes de ${history.coupon.codigo}`}><div className="ca-panel"><h2>Canjes de {history.coupon.codigo}</h2><p>{history.rows.length} registros</p>{history.rows.map(row=><p key={row.id}>{row.userId} · {new Date(row.createdAt).toLocaleString('es-EC',{timeZone:'America/Guayaquil'})} · {row.servicio==='resultados'?'Resultados':'Certificados'} · descuento ${Number(row.montoDescontado).toFixed(2)} · saldo ${Number(row.saldoPendiente).toFixed(2)} · {row.cubierto?'Con cupón':'Pago del saldo pendiente'}</p>)}<button type="button" onClick={()=>setHistory(null)}>Cerrar</button></div></div>}
  </section>;
}
