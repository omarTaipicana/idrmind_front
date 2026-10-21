import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getConfigToken from '../services/getConfigToken';
import './styles/CouponBenefit.css';
const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const money = n => '$' + Number(n || 0).toFixed(2);
export function CouponSummary({ coupon }) {
  if (!coupon) return null;
  return <div className="coupon-summary"><strong>{coupon.cubierto ? 'Con cupón' : 'Descuento con cupón'} · {coupon.codigo}</strong><p>{coupon.nombre}</p><dl><div><dt>Precio original del servicio</dt><dd>{money(coupon.precioOriginal)}</dd></div><div><dt>Descuento autorizado</dt><dd>−{money(coupon.montoDescontado)}</dd></div><div><dt>Saldo a pagar</dt><dd>{money(coupon.saldoPendiente)}</dd></div>{coupon.valorDepositado != null && <div><dt>Importe registrado</dt><dd>{money(coupon.valorDepositado)} · {coupon.corresponde ? 'Corresponde al saldo' : 'No corresponde: revisar antes de validar'}</dd></div>}</dl>{coupon.couponSnapshot && <small>Motivo: {coupon.couponSnapshot.descuentoTipo === 'cortesia' ? 'Cortesía del servicio' : coupon.couponSnapshot.descuentoTipo === 'porcentaje' ? `${coupon.couponSnapshot.descuentoValor}% de descuento` : `${money(coupon.couponSnapshot.descuentoValor)} de descuento fijo`}</small>}</div>;
}
export default function CouponBenefit({ token, inscripcionId, seleccion = [], onApplied }) {
  const [codigo, setCodigo] = useState('');
  const [quote, setQuote] = useState(null);
  const [applied, setApplied] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const selectionKey = [...seleccion].sort().join(',');
  const route = token ? `/psychometric/payment/${encodeURIComponent(token)}/coupon` : '/benefit-coupons';
  const body = { inscripcionId, seleccion };
  const config = token ? {} : getConfigToken();
  useEffect(() => {
    let active = true;
    setQuote(null); setApplied(null); setMessage(''); onApplied?.(null);
    if (!token && (!inscripcionId || !selectionKey)) return;
    axios.post(base + route + '/status', body, config).then(({data}) => {
      if (!active) return;
      const row = data.find(r => token || [...r.seleccion].sort().join(',') === selectionKey);
      if (row) { setApplied(row); setCodigo(row.codigo); onApplied?.(row); }
    }).catch(e => { if (active && e.response?.status === 401) setMessage('Para usar cupones de certificados, inicia sesión con la cuenta del participante.'); });
    return () => { active = false; };
  }, [token, inscripcionId, selectionKey]);
  async function action(redeem) {
    setBusy(true); setMessage('');
    try {
      const {data} = await axios.post(base + route + (redeem ? '/redeem' : '/check'), { ...body, codigo }, config);
      setMessage(data.message);
      if (redeem) { setApplied(data); onApplied?.(data); } else setQuote(data);
    } catch(e) { setMessage(e.response?.status === 401 ? 'Inicia sesión con la cuenta del participante para aplicar el cupón.' : e.response?.data?.message || 'No se pudo aplicar el cupón.'); setQuote(null); }
    finally { setBusy(false); }
  }
  async function issue() {
    setBusy(true);
    try { const {data} = await axios.post(base + `/benefit-coupons/applications/${applied.id}/certificate`, {tipo:'cert_emp'}, getConfigToken()); setMessage(data.message); if(data.url) window.open(data.url, '_blank', 'noopener,noreferrer'); }
    catch(e) { setMessage(e.response?.data?.message || 'No fue posible emitir el certificado.'); }
    finally { setBusy(false); }
  }
  const display = applied || quote;
  return <section className="coupon-benefit"><h3>¿Tienes un cupón?</h3><p>Los cursos y tests son gratuitos. El beneficio cubre certificados o resultados.</p><div className="coupon-actions"><input aria-label="Código del cupón" maxLength={80} value={codigo} disabled={!!applied || busy} onChange={e=>{setCodigo(e.target.value.toUpperCase());setQuote(null);}} placeholder="Código del cupón"/><button type="button" disabled={busy || !codigo.trim()} onClick={()=>action(false)}>Consultar cupón</button></div>{display && <CouponSummary coupon={display}/>} {quote && !applied && <button type="button" disabled={busy} onClick={()=>action(true)}>Confirmar aplicación del cupón</button>}{applied && <p>Aplicado. {applied.cubierto ? 'No necesitas comprobante ni validación de pago.' : 'Este cupo queda asignado a este servicio. Paga únicamente el saldo indicado.'}</p>}{applied?.cubierto && token && <button type="button" disabled={busy} onClick={async()=>{if(!applied.resultPath){await action(true);}else window.location.hash=applied.resultPath;}}> {applied.resultPath ? 'Consultar mis resultados' : 'Obtener enlace de resultados'}</button>}{applied?.cubierto && applied.seleccion?.includes('cert_emp') && <button type="button" disabled={busy} onClick={issue}>Solicitar certificado empresarial</button>}{applied?.cubierto && applied.servicio === 'certificados' && <p>La emisión requiere completar y aprobar el curso. Los certificados ministeriales e internacionales conservan su proceso institucional.</p>}{message && <p role="status">{message}</p>}</section>;
}
