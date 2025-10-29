import React from "react";
import { useLocation } from "react-router-dom";
import "./styles/Footer.css";

const Footer = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const currentPage = location.pathname.split("/")[1];

  return (
    <div>
      <section>
        <ul className="ul_footer">

          <li className="li_footer">
            <a href="tel:+593979002223" className="link_footer">
              <img
                className="img_footer"
                src="../../../smartphone.png"
                alt="Llamar"
              />
              <span className="span_footer">+593979002223</span>
            </a>
          </li>
          <li className="li_footer">
            <a
              href="mailto:info@idrmind.com"
              className="link_footer"
            >
              <img
                className="img_footer"
                src="../../../mensaje.png"
                alt="Correo"
              />
              <span className="span_footer">
                info@idrmind.com
              </span>
            </a>
          </li>
          <li className="li_footer">
            <a
              href="https://maps.app.goo.gl/hG4735yfLTV5MdVD8"
              target="_blank"
              rel="noopener noreferrer"
              className="link_footer"
            >
              <img
                className="img_footer"
                src="../../../location.png"
                alt="Ubicación"
              />
              <span className="span_footer">
                Mitad del Mundo - Quito, Ecuador
              </span>
            </a>
          </li>
          <li className="li_footer_icon">
            <a
              href="https://api.whatsapp.com/send?phone=593979002223&text=Hola%20quiero%20más%20información"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="img_footer"
                src="../../../whatsapp2.png"
                alt="WhatsApp"
              />
            </a>
           
            <a
              href="https://www.tiktok.com/@idr.mind?_t=8rXF11o0DPs&_r=1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="img_footer"
                src="../../../tik-tok.png"
                alt="TikTok"
              />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100054880556231&mibextid=ZbWKwL"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="img_footer"
                src="../../../facebook.png"
                alt="Facebook"
              />
            </a>
            <a
              href="https://www.instagram.com/idr.mind/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="img_footer"
                src="../../../instagram.png"
                alt="Instagram"
              />
            </a>
          </li>
          <li className="li_footer">
            <span className="span_footer">Copyright</span>
            <img className="img_footer_c" src="../../../copyright.png" alt="" />
            <span className="span_footer">2024. iDr. Mind. by NASK-Corp. All Rights Reserved.</span>
            <a href="tel:+593979002223" className="link_footer">
              <img
                src="/images/idrmind_sf.png"
                alt="Logo iDr.Mind."
                className="logo_footer"
              />
            </a>
          </li>



        </ul>
      </section>
    </div>
  );
};

export default Footer;
