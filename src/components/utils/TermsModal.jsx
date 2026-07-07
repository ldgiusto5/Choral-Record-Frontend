import { useEffect } from 'react';
import './TermsModal.css';

const TermsModal = ({ onClose, onAccept }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="terms-modal-overlay" onClick={onClose}>
      <div className="terms-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="terms-modal-header">
          <h2 className="brand-text terms-modal-title">
            Condiciones de Uso
          </h2>
          <button 
            onClick={onClose}
            className="terms-modal-close-btn"
            title="Cerrar"
          >
            &times;
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="terms-modal-body">
          <h3 className="terms-main-title">
            Condiciones de Uso de la Plataforma
          </h3>
          
          <h4 className="terms-section-title">1. Aceptación</h4>
          <p className="terms-paragraph">El acceso y utilización de esta plataforma implica la aceptación plena de las presentes Condiciones de Uso. Si el usuario no está de acuerdo con ellas, deberá abstenerse de utilizar los servicios ofrecidos.</p>

          <h4 className="terms-section-title">2. Objeto</h4>
          <p className="terms-paragraph">La plataforma pone a disposición de los usuarios herramientas que permiten publicar contenido generado por ellos mismos, incluyendo, entre otros:</p>
          <ul className="terms-list">
            <li>Fotografías.</li>
            <li>Imágenes de perfil.</li>
            <li>Archivos de audio.</li>
            <li>Vídeos.</li>
            <li>Documentos.</li>
            <li>Comentarios.</li>
            <li>Enlaces.</li>
            <li>Cualquier otro contenido multimedia.</li>
          </ul>
          <p className="terms-paragraph">El titular de la plataforma no revisa ni aprueba previamente todo el contenido publicado por los usuarios.</p>

          <h4 className="terms-section-title">3. Registro, Edad Mínima y Seguridad de la Cuenta</h4>
          <p className="terms-paragraph">Para utilizar esta plataforma y registrar una cuenta, el usuario debe ser mayor de 18 años. Al aceptar estas condiciones, el usuario declara y garantiza que cumple con este requisito de edad. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y será el único responsable de cualquier actividad que se realice desde su cuenta, debiendo notificar de inmediato a la plataforma cualquier uso no autorizado de la misma.</p>

          <h4 className="terms-section-title">4. Responsabilidad del usuario</h4>
          <p className="terms-paragraph">Cada usuario garantiza que dispone de todos los derechos necesarios sobre el contenido que publica. El usuario será el único responsable del contenido que suba a la plataforma y de las consecuencias legales derivadas de su publicación. Queda expresamente prohibido publicar contenido que:</p>
          <ul className="terms-list">
            <li>Vulnere derechos de autor o propiedad intelectual.</li>
            <li>Vulnere derechos de imagen.</li>
            <li>Contenga datos personales de terceros sin autorización.</li>
            <li>Sea difamatorio, injurioso o calumnioso.</li>
            <li>Contenga amenazas o acoso.</li>
            <li>Incite al odio o la violencia.</li>
            <li>Sea pornográfico o sexualmente explícito cuando resulte contrario a la legislación aplicable.</li>
            <li>Contenga virus, malware o software malicioso.</li>
            <li>Sea contrario a la legislación española o europea.</li>
          </ul>

          <h4 className="terms-section-title">5. Ausencia de supervisión previa</h4>
          <p className="terms-paragraph">La plataforma funciona mediante publicaciones realizadas directamente por los usuarios. Debido al volumen potencial de contenido generado, el titular no realiza una revisión previa, validación ni aprobación individual de cada publicación. La publicación de un contenido no implica en ningún caso que el titular lo respalde, comparta o considere conforme a la normativa.</p>

          <h4 className="terms-section-title">6. Retirada de contenidos y Colaboración con las Autoridades</h4>
          <p className="terms-paragraph">El titular podrá retirar cualquier contenido, sin previo aviso, cuando considere que:</p>
          <ul className="terms-list">
            <li>incumple estas Condiciones de Uso,</li>
            <li>vulnera derechos de terceros,</li>
            <li>incumple la legislación vigente,</li>
            <li>o pueda generar un perjuicio para la plataforma o para terceros.</li>
          </ul>
          <p className="terms-paragraph">Asimismo, podrá suspender o cancelar cuentas de usuario cuando detecte un uso indebido del servicio.</p>
          <p className="terms-paragraph">En caso de que el titular tenga conocimiento efectivo de que un usuario ha subido contenido que constituya un delito flagrante (como material de abuso sexual infantil, apología del terrorismo u otros delitos graves), el titular estará facultado para conservar los datos de dicho usuario e informar de manera inmediata a las Fuerzas y Cuerpos de Seguridad del Estado o a las autoridades judiciales competentes.</p>

          <h4 className="terms-section-title">7. Notificación de infracciones</h4>
          <p className="terms-paragraph">Cualquier persona que considere que un contenido vulnera sus derechos podrá comunicarlo mediante los canales de contacto habilitados. La comunicación deberá identificar razonablemente el contenido afectado y explicar el motivo de la reclamación. Una vez recibida la notificación, el titular analizará el caso y adoptará las medidas que correspondan.</p>

          <h4 className="terms-section-title">8. Limitación de responsabilidad</h4>
          <p className="terms-paragraph">El titular de la plataforma actúa únicamente como prestador del servicio de alojamiento y publicación de contenidos generados por los usuarios. En consecuencia:</p>
          <ul className="terms-list">
            <li>no garantiza la exactitud de los contenidos publicados por terceros;</li>
            <li>no responde de las opiniones expresadas por los usuarios;</li>
            <li>no responde de la autenticidad de los archivos publicados;</li>
            <li>no responde de los daños que pudieran derivarse del uso de contenidos publicados por terceros.</li>
          </ul>
          <p className="terms-highlight">
            El creador y titular de la plataforma declina expresamente cualquier tipo de responsabilidad civil, penal o administrativa derivada de la subida, almacenamiento o difusión de archivos, fotografías, textos o cualquier otro material por parte de los usuarios que contenga o promueva actos ilegales, ilícitos o de naturaleza sensible. La responsabilidad sobre dichos contenidos recae única y exclusivamente en el usuario que los sube.
          </p>
          <p className="terms-paragraph">Esta limitación de responsabilidad se entiende sin perjuicio de las obligaciones legales que puedan resultar exigibles al titular conforme a la normativa aplicable.</p>

          <h4 className="terms-section-title">9. Disponibilidad del Servicio y Copias de Seguridad</h4>
          <p className="terms-paragraph">La plataforma se ofrece "tal cual". El titular no garantiza que el servicio sea ininterrumpido, libre de errores o que esté siempre disponible. El titular no se hace responsable de la pérdida accidental de archivos, textos o datos alojados en la plataforma debido a fallos técnicos, caídas del servidor o causas de fuerza mayor. Se recomienda encarecipamente a los usuarios que mantengan copias de seguridad (backups) en sus propios dispositivos de todo el contenido que suban.</p>

          <h4 className="terms-section-title">10. Propiedad intelectual y uso de los archivos</h4>
          <p className="terms-paragraph">Los usuarios conservan la titularidad de los derechos sobre los contenidos que publiquen. No obstante, conceden a la plataforma una licencia no exclusiva, gratuita y limitada al funcionamiento del servicio para almacenar, mostrar y distribuir dichos contenidos dentro de la propia plataforma.</p>
          <p className="terms-paragraph">El creador de la plataforma se compromete de forma expresa a no hacer uso de los archivos, fotos, textos o cualquier otro dato subido a la base de datos para su beneficio propio, comercial o lucrativo. El acceso a dichos archivos por parte de la plataforma se limitará estrictamente a los procesos técnicos necesarios para el correcto funcionamiento y mantenimiento del servicio.</p>

          <h4 className="terms-section-title">11. Protección de datos</h4>
          <p className="terms-paragraph">El tratamiento de los datos personales se realizará conforme a la Política de Privacidad publicada en este sitio web.</p>

          <h4 className="terms-section-title">12. Modificaciones</h4>
          <p className="terms-paragraph">El titular podrá modificar estas Condiciones de Uso en cualquier momento. Las nuevas condiciones serán aplicables desde su publicación.</p>

          <h4 className="terms-section-title">13. Legislación aplicable</h4>
          <p className="terms-paragraph">Estas Condiciones de Uso se regirán por la legislación española. Cualquier controversia será resuelta por los juzgados y tribunales competentes conforme a la normativa vigente.</p>
        </div>

        {/* Modal Footer */}
        <div className="terms-modal-footer">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
          >
            Cerrar
          </button>
          {onAccept && (
            <button
              type="button"
              className="btn btn-accent"
              onClick={onAccept}
            >
              Aceptar Condiciones
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
