import React,{useState} from 'react';
import {money} from '../../services/affiliateApi';

const stages=['IVA y base neta','Comisión directa','Red e invitaciones','Liquidación y factura'];
const number=v=>v===''?'':Number(v);

export default function CommercialSettings({config,onSubmit,disabled}){
 const [draft,setDraft]=useState({...config,vatRate:config.vatRate??''});
 const [example,setExample]=useState(115);
 const set=(key,value)=>setDraft(old=>({...old,[key]:value}));
 const setAt=(key,index,value)=>setDraft(old=>({...old,[key]:old[key].map((v,i)=>i===index?value:v)}));
 const field=(label,value,change,{max,step='0.01'}={})=><label>{label}<input type="number" inputMode="decimal" min="0" max={max} step={step} required value={value} onChange={e=>change(number(e.target.value))}/></label>;
 const vatReady=draft.vatRate!==''&&draft.vatRate>=0&&draft.vatRate<=100;
 const gross=Math.round(Number(example)*100);
 const denominator=10000+Math.round(Number(draft.vatRate)*100);
 const base=vatReady?Math.floor((gross*10000+Math.floor(denominator/2))/denominator):0;
 const maxRate=Math.max(...draft.directRates)+draft.uplineRates.reduce((a,b)=>a+Number(b),0);
 const save=e=>{
  e.preventDefault();
  const {termsVersion,...rules}=draft;
  onSubmit({...rules,expectedVersion:config.termsVersion});
 };
 return <section className="af-card af-commercial">
  <header className="af-heading"><div><h2>Reglas comerciales</h2><p>De un pago validado a una comisión lista para liquidar.</p></div><span className="af-badge">Versión vigente · {config.termsVersion}</span></header>
  <ol className="af-flow" aria-label="Flujo de las reglas comerciales">{stages.map((name,i)=><li key={name}><span>{i+1}</span>{name}</li>)}</ol>
  {config.vatRate==null&&<p className="af-notice">Falta confirmar el IVA. Guarda el porcentaje aplicable antes de validar pagos nuevos. Usa 0 si no aplica.</p>}
  <form className="af-form" onSubmit={save}>
   <fieldset disabled={disabled} className="af-commercial-fields">
    <section className="af-rule">
     <h3>1. IVA incluido en el precio</h3>
     <p>Se parte de lo efectivamente pagado, con los descuentos ya aplicados. La comisión se calcula sobre la base sin IVA.</p>
     <div className="af-fields">
      {field('Porcentaje de IVA (%)',draft.vatRate,v=>set('vatRate',v),{max:100})}
      <label>Pago de ejemplo (USD)<input type="number" min="0" max="100000000" step="0.01" value={example} onChange={e=>setExample(number(e.target.value))}/><small>Solo para simular; no se guarda.</small></label>
     </div>
     {vatReady&&<div className="af-breakdown" aria-live="polite"><span>Pago <strong>{money(gross)}</strong></span><span>IVA incluido <strong>{money(gross-base)}</strong></span><span>Base de comisión <strong>{money(base)}</strong></span></div>}
    </section>
    <section className="af-rule">
     <h3>2. Comisión por tus propias ventas</h3>
     <p>El nivel comercial se calcula con las ventas propias netas del mes anterior. Es independiente de tu posición en la red.</p>
     <div className="af-rule-grid">{['Inicial','Intermedia','Avanzada'].map((name,i)=><article key={name}>
      <h4>{name}</h4>
      {field('Comisión directa (%)',draft.directRates[i],v=>setAt('directRates',i,v),{max:100,step:'0.001'})}
      {i===0?<p>Desde la primera venta validada, sin meta previa.</p>:field('Meta mensual para '+name.toLowerCase()+' (USD)',draft.revenueGoals[i-1],v=>setAt('revenueGoals',i-1,v))}
      {vatReady&&<small>En el ejemplo: {money(Math.floor(base*Math.round(draft.directRates[i]*1000)/100000))} de comisión directa.</small>}
     </article>)}</div>
    </section>
    <section className="af-rule">
     <h3>3. Comisión de red e invitaciones</h3>
     <p>Una venta puede generar comisión para el vendedor y hasta tres patrocinadores activos. Los porcentajes se aplican a la misma base sin IVA.</p>
     <ol className="af-flow af-network"><li><span>0</span>Vendedor · directa</li>{draft.uplineRates.map((rate,i)=><li key={i}><span>{i+1}</span>{['Patrocinador directo','Segundo patrocinador','Tercer patrocinador'][i]} · {rate||0} %</li>)}</ol>
     <div className="af-rule-grid">{['Patrocinador directo','Segundo patrocinador','Tercer patrocinador'].map((name,i)=><article key={name}>{field(name+' (%)',draft.uplineRates[i],v=>setAt('uplineRates',i,v),{max:100,step:'0.001'})}</article>)}</div>
     <p>Reparto máximo con estas reglas: <strong>{Number(maxRate.toFixed(3))} %</strong>. El total permitido es 100 %.</p>
     <h4>Metas para abrir invitaciones</h4>
     <p>Se cuentan ventas propias validadas de resultados de tests, acumuladas sin reinicio mensual. Invitar a alguien no genera comisión.</p>
     <div className="af-rule-grid">{['Director','Líder','Asesor'].map((name,i)=><article key={name}><h4>{i+1}. {name} comercial</h4>{field('Ventas de resultados para invitar',draft.recruitGoals[i],v=>setAt('recruitGoals',i,v),{step:1})}</article>)}</div>
     <p><strong>4. Promotor comercial:</strong> puede vender y subir su comisión directa. Su rama termina aquí.</p>
    </section>
    <section className="af-rule">
     <h3>4. Liquidación y datos para facturar</h3>
     <p>Los saldos menores al mínimo se acumulan. El afiliado usa estos datos para emitir su factura de comisiones.</p>
     <div className="af-fields">
      {field('Mínimo de liquidación (USD)',draft.minimumPayout,v=>set('minimumPayout',v))}
      {[
       ['merchantName','Razón social receptora','text',220],['merchantRuc','RUC receptor','text',13],
       ['merchantAddress','Dirección del receptor','text',500],['merchantEmail','Correo electrónico del receptor','email',254]
      ].map(([key,label,type,maxLength])=><label key={key}>{label}<input type={type} maxLength={maxLength} inputMode={key==='merchantRuc'?'numeric':undefined} pattern={key==='merchantRuc'?'[0-9]{13}':undefined} value={draft[key]??''} onChange={e=>set(key,e.target.value)}/></label>)}
     </div>
    </section>
    <footer className="af-rule-footer"><p>La versión sube al guardar cambios reales. Las comisiones y categorías mensuales ya fijadas se conservan. Las solicitudes pendientes deben aceptar la versión vigente antes de aprobarse.</p><button type="submit" className="af-primary" disabled={!vatReady||maxRate>100}>Guardar configuración</button></footer>
   </fieldset>
  </form>
 </section>;
}
