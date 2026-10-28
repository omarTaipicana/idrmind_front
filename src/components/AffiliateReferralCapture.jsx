import {useEffect,useState} from 'react';
import {useLocation} from 'react-router-dom';
import {referralToken,captureReferral} from '../services/affiliateReferral';
export default function AffiliateReferralCapture(){
 const location=useLocation(),[message,setMessage]=useState('');
 useEffect(()=>{
  const code=new URLSearchParams(location.search).get('ref');if(!code||referralToken())return;
  let active=true;setMessage('Verificando enlace del afiliado…');
  captureReferral(code).then(()=>{if(active)setMessage('Enlace de afiliado registrado para tu inscripción.');}).catch(()=>{if(active)setMessage('El enlace de afiliado no está disponible. Puedes continuar sin referido.');});
  return()=>{active=false;};
 },[location.search]);
 if(!message)return null;
 return <div role="status" style={{padding:'10px 16px',background:'#eef4fc',color:'#1b3861',fontSize:13}}>{message}</div>;
}
