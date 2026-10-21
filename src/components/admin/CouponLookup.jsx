import React,{useEffect,useId,useRef,useState} from 'react';
import axios from 'axios';
import getConfigToken from '../../services/getConfigToken';
const api=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'')+'/benefit-coupons/options';
export default function CouponLookup({kind,servicio,value,onChange,disabled=false}) {
 const id=useId(),inputRef=useRef(null),localChange=useRef(false);
 const [text,setText]=useState(''),[selected,setSelected]=useState(null),[options,setOptions]=useState([]),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[active,setActive]=useState(-1),[reload,setReload]=useState(0);
 const label=kind==='empresa'?'Empresa (opcional)':servicio==='resultados'?'Test psicométrico (opcional)':'Curso (opcional)';
 useEffect(()=>{
  if(localChange.current){localChange.current=false;return;}
  setSelected(null);setOptions([]);setError('');setActive(-1);
  if(!value){setText('');setBusy(false);return;}
  const controller=new AbortController();let current=true;setBusy(true);setText('');
  axios.get(api,{...getConfigToken(),params:{kind,servicio,id:value},signal:controller.signal}).then(({data})=>{
   if(!current)return;
   if(!data.length){setError('La selección guardada ya no está disponible. Selecciona otra opción o quita la restricción.');return;}
   setSelected(data[0]);setText(data[0].label);
  }).catch(e=>{if(current&&!axios.isCancel(e))setError(e.response?.data?.message||'No se pudo cargar la selección guardada.');}).finally(()=>{if(current)setBusy(false);});
  return()=>{current=false;controller.abort();};
 },[value,kind,servicio,reload]);
 useEffect(()=>{
  if(!open||selected||!text.trim()){setOptions([]);return;}
  const controller=new AbortController();let current=true;
  setBusy(true);setOptions([]);setError('');setActive(-1);
  const timer=setTimeout(()=>{
   axios.get(api,{...getConfigToken(),params:{kind,servicio,q:text.trim()},signal:controller.signal}).then(({data})=>{if(current)setOptions(data);}).catch(e=>{if(current&&!axios.isCancel(e))setError(e.response?.data?.message||'No se pudieron cargar sugerencias.');}).finally(()=>{if(current)setBusy(false);});
  },200);
  return()=>{current=false;clearTimeout(timer);controller.abort();};
 },[text,open,selected,kind,servicio,reload]);
 useEffect(()=>{inputRef.current?.setCustomValidity((text.trim()||value)&&(!selected||selected.id!==value)?'Selecciona una sugerencia o limpia el campo para permitir cualquier opción.':'');},[text,value,selected]);
 function select(option){localChange.current=option.id!==value;setSelected(option);setText(option.label);setOpen(false);setOptions([]);setActive(-1);setError('');onChange(option.id);}
 function clear(){localChange.current=!!value;setSelected(null);setText('');setOpen(false);setOptions([]);setError('');setBusy(false);onChange('');inputRef.current?.focus();}
 function type(next){localChange.current=!!value;setText(next);setSelected(null);setError('');setOpen(true);setActive(-1);if(value)onChange('');}
 function keyDown(event){
  if(event.key==='Escape'){setOpen(false);return;}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setOpen(true);setActive(previous=>options.length?(event.key==='ArrowDown'?(previous+1)%options.length:(previous-1+options.length)%options.length):-1);}
  if(event.key==='Enter'&&open&&!selected&&text.trim()){event.preventDefault();if(options[active])select(options[active]);}
 }
 return <div className="ca-lookup"><label htmlFor={id}>{label}</label><div className="ca-lookup__input"><input ref={inputRef} id={id} role="combobox" aria-autocomplete="list" aria-expanded={open&&!selected} aria-controls={`${id}-options`} aria-activedescendant={active>=0?`${id}-option-${active}`:undefined} aria-describedby={`${id}-hint`} autoComplete="off" value={text} disabled={disabled} onChange={e=>type(e.target.value)} onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onKeyDown={keyDown} placeholder={kind==='empresa'?'Escribe nombre o RUC…':'Escribe nombre o código…'}/>{(text||value)&&<button type="button" className="ca-lookup__clear" disabled={disabled} aria-label={`Quitar restricción de ${kind==='empresa'?'empresa':'curso o test'}`} title="Quitar selección: permitir cualquiera" onMouseDown={e=>e.preventDefault()} onClick={clear}>×</button>}</div>
 {open&&!selected&&text.trim()&&<ul id={`${id}-options`} role="listbox" className="ca-lookup__options">{busy?<li role="presentation">Buscando…</li>:options.length?options.map((item,index)=><li key={item.id} id={`${id}-option-${index}`} role="option" aria-selected={active===index} onMouseDown={e=>e.preventDefault()} onClick={()=>select(item)} onMouseEnter={()=>setActive(index)} className={active===index?'is-active':''}><strong>{item.label}</strong><small>{item.detail}</small></li>):<li role="presentation">{error?'No se pudieron consultar las sugerencias.':'Sin coincidencias. Escribe otro nombre.'}</li>}</ul>}
 <small id={`${id}-hint`} className="ca-lookup__hint">{selected?`Restringido a: ${selected.label}`:busy&&value?'Cargando selección…':text.trim()||value?'Selecciona una sugerencia para confirmar la restricción.':kind==='empresa'?'Sin selección: cualquier empresa o participante individual.':servicio==='resultados'?'Sin selección: cualquier test psicométrico.':'Sin selección: cualquier curso.'}</small>{error&&<div className="ca-lookup__error" role="status">{error}<button type="button" onClick={()=>setReload(n=>n+1)}>Reintentar</button></div>}</div>;
}
