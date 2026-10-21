export const couponTypeLabels = {
  certificado_gratis: 'Certificado gratuito',
  test_gratis: 'Resultados psicométricos gratuitos',
  descuento: 'Descuento',
};
export function couponType(coupon) {
  return ['curso_gratis', 'paquete_empresa'].includes(coupon.tipo)
    ? coupon.servicio === 'resultados' ? 'test_gratis' : 'certificado_gratis'
    : coupon.tipo;
}
export function couponService(type, currentService = 'resultados') {
  return type === 'certificado_gratis' ? 'certificados' : type === 'test_gratis' ? 'resultados' : currentService;
}
