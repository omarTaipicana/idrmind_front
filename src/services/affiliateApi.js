import axios from 'axios';
import getConfigToken from './getConfigToken';
const base=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
export async function affiliateApi(path,method='get',data){const response=await axios({url:base+path,method,data,...getConfigToken()});return response.data;}
export async function affiliateFile(id){const response=await axios.get(base+'/affiliates/files/'+id,{...getConfigToken(),responseType:'blob'});const url=URL.createObjectURL(response.data);const link=document.createElement('a');link.href=url;link.download='documento'+(response.data.type.includes('pdf')?'.pdf':response.data.type.includes('xml')?'.xml':response.data.type.includes('png')?'.png':'.jpg');link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export const money=value=>new Intl.NumberFormat('es-EC',{style:'currency',currency:'USD'}).format(Number(value||0)/100);
export const date=value=>value?new Date(value).toLocaleString('es-EC',{timeZone:'America/Guayaquil'}):'—';
export const position=depth=>['Director comercial','Líder comercial','Asesor comercial','Promotor comercial'][depth-1];
