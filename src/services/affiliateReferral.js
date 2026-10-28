import axios from 'axios';
const key='idrmind.affiliate.referral';let pending=null;
export function referralToken(){try{const value=JSON.parse(localStorage.getItem(key)||'null');if(value&&new Date(value.expiresAt).getTime()>Date.now())return value.token;}catch{}return null;}
export async function captureReferral(code){
 if(referralToken())return referralToken();if(!code)return null;if(pending)return pending;
 pending=axios.post((import.meta.env.VITE_API_URL||'').replace(/\/$/,'')+'/affiliates/referral',{code}).then(({data})=>{if(!referralToken())localStorage.setItem(key,JSON.stringify(data));return referralToken();}).finally(()=>{pending=null;});
 return pending;
}
export async function resolveReferral(){if(referralToken())return referralToken();const params=new URLSearchParams(window.location.hash.split('?')[1]||window.location.search);try{return pending?await pending:await captureReferral(params.get('ref'));}catch{return null;}}
