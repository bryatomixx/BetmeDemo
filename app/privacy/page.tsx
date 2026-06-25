import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — Centro de Comunicación",
  description:
    "Política de privacidad del Centro de Comunicación del Hospital Centro Ginecológico.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-white px-6 py-12 text-[#25323f]">
      <h1 className="text-2xl font-extrabold tracking-tight text-[#0f1b2d]">
        Política de Privacidad
      </h1>
      <p className="mt-1 text-sm text-[#0067f8]">Centro de Comunicación · Hospital Centro Ginecológico</p>
      <p className="mt-1 text-xs text-[#94a3b4]">Última actualización: 25 de junio de 2026</p>

      <div className="mt-8 space-y-6 text-[14.5px] leading-relaxed">
        <section>
          <h2 className="mb-1.5 text-base font-bold text-[#0f1b2d]">1. Quiénes somos</h2>
          <p>
            El Centro de Comunicación es la plataforma interna de comunicación del Hospital
            Centro Ginecológico, que unifica la atención a pacientes por WhatsApp, redes sociales
            y correo electrónico, junto con la coordinación interna entre departamentos.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold text-[#0f1b2d]">2. Qué datos tratamos</h2>
          <p>
            Tratamos los datos necesarios para atender al paciente: nombre, número de teléfono o
            identificador de la red social, y el contenido de los mensajes que el paciente nos
            envía. No solicitamos información médica sensible a través de estos canales.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold text-[#0f1b2d]">3. Para qué los usamos</h2>
          <p>
            Usamos estos datos únicamente para responder consultas, agendar y recordar citas,
            notificar resultados y dar seguimiento a la atención. No vendemos ni compartimos los
            datos con terceros con fines comerciales.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold text-[#0f1b2d]">4. WhatsApp y Meta</h2>
          <p>
            La comunicación por WhatsApp se procesa a través de la API de WhatsApp Business de
            Meta, conforme a sus términos y políticas. El paciente puede solicitar dejar de recibir
            mensajes en cualquier momento respondiendo a la conversación.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold text-[#0f1b2d]">5. Conservación y seguridad</h2>
          <p>
            Los mensajes se almacenan de forma segura y se conservan solo durante el tiempo
            necesario para la atención. El acceso está restringido al personal autorizado del
            hospital mediante control de acceso por rol.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold text-[#0f1b2d]">6. Tus derechos</h2>
          <p>
            El paciente puede solicitar acceder, corregir o eliminar sus datos contactando al
            hospital. Atenderemos la solicitud conforme a la legislación de protección de datos
            aplicable en El Salvador.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-base font-bold text-[#0f1b2d]">7. Contacto</h2>
          <p>
            Para cualquier consulta sobre esta política, comuníquese con el Hospital Centro
            Ginecológico a través de sus canales oficiales de atención.
          </p>
        </section>
      </div>
    </main>
  );
}
