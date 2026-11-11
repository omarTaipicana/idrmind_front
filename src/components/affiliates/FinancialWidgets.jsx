import React,{useEffect,useState} from 'react';
import {affiliateApi,affiliateFile} from '../../services/affiliateApi';
export function UploadDocument({purpose,onUploaded,label='Adjuntar comprobante'}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 return <label className="af-upload">{label}<input type="file" accept={purpose==='factura'?'.pdf,.xml,.jpg,.jpeg,.png':'.pdf,.jpg,.jpeg,.png'} disabled={busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);setMessage('');onUploaded(null);try{const body=new FormData();body.append('purpose',purpose);body.append('file',file);const result=await affiliateApi('/affiliates/files','post',body);onUploaded(result.id);setMessage('Documento adjunto: '+file.name);}catch(error){setMessage(error.response?.data?.message||'No se pudo adjuntar.');}finally{setBusy(false)}}}/><small role="status">{busy?'Subiendo…':message}</small></label>;
}
export function ViewDocument({id,label='Ver documento'}){const [message,setMessage]=useState('');return id?<><button type="button" onClick={()=>affiliateFile(id).catch(()=>setMessage('No se pudo descargar el documento.'))}>{label}</button>{message&&<small role="status">{message}</small>}</>:null;}
export function ProfileForm({
 initial={},terms,onSubmit,button='Enviar solicitud',application=true,
 invitation=null,requiresSponsor=false,busy=false,
}){
 const bank=initial.bank||{};
 const [form,setForm]=useState({name:initial.fiscal_name||initial.name||'',document:initial.document||'',phone:initial.phone||'',ruc:initial.ruc||'',address:initial.fiscal_address||'',bankName:bank.bank||'',bankType:bank.type||'Ahorros',account:bank.account||'',holder:bank.holder||'',acceptTerms:false});
 const [preview,setPreview]=useState(null);
 const code=invitation||'';
 const invalidLink=invitation!==null&&!code;
 const change=(key,value)=>setForm(prev=>({...prev,[key]:value}));
 useEffect(()=>{
  if(!application||!code)return;
  let active=true;
  const timer=setTimeout(async()=>{
   try{
    const placement=await affiliateApi('/affiliates/application-preview','post',{sponsorCode:code});
    if(active)setPreview({code,placement});
   }catch(error){
    if(active)setPreview({code,error:error.response?.data?.message||'No se pudo verificar la invitación. Revisa el código o vuelve a intentarlo.'});
   }
  },300);
  return ()=>{active=false;clearTimeout(timer);};
 },[application,code]);
 const matched=preview?.code===code?preview:null;
 const placement=code?matched?.placement:(!requiresSponsor&&!invalidLink?{position:'Director comercial'}:null);
 const canSubmit=!application||!!placement;
 return <form className="af-form" onSubmit={e=>{
  e.preventDefault();
  if(!busy&&canSubmit)onSubmit({...form,...(application?{sponsorCode:code,termsVersion:terms?.version}:{})});
 }}>
  <div className="af-fields">
   {[['name','Nombre / razón social',true],['document','Documento',true],['phone','Teléfono',true],['ruc','RUC (necesario para cobrar)',false],['address','Dirección fiscal',false],['bankName','Banco',false],['account','Cuenta bancaria',false],['holder','Titular de la cuenta',false]].map(([key,label,required])=>
    <label key={key}>{label}<input readOnly={key==='document'&&!application&&!!initial.document} required={required} value={form[key]} maxLength={key==='ruc'?13:key==='account'?30:220} onChange={e=>change(key,e.target.value)}/></label>
   )}
   <label>Tipo de cuenta<select value={form.bankType} onChange={e=>change('bankType',e.target.value)}><option>Ahorros</option><option>Corriente</option></select></label>
  </div>
  {application&&<div className="af-terms" aria-live="polite">
   <h3>Nivel de ingreso</h3>
   {placement?<p>Si iDr.Mind aprueba tu solicitud, ingresarás como <strong>{placement.position}</strong>. {placement.sponsorName?<>Patrocinador: <strong>{placement.sponsorName}</strong> ({placement.sponsorPosition}).</>:null}</p>:
    <p>{invalidLink||matched?.error?'No pudimos validar esta invitación. Pide a quien te invitó que revise el enlace.':code?'Verificando invitación…':'Abre un enlace de invitación válido para volver a postular.'}</p>}
  </div>}
  {application&&<div className="af-terms"><h3>Condiciones del programa · versión {terms?.version}</h3><p>{terms?.text}</p><label><input type="checkbox" required checked={form.acceptTerms} onChange={e=>change('acceptTerms',e.target.checked)}/>He leído y acepto las condiciones.</label></div>}
  <button disabled={busy||!canSubmit} className="af-primary">{busy?'Guardando…':button}</button>
 </form>;
}
