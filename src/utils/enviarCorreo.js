import emailjs from "emailjs-com";

export const enviarCorreoConfirmacion = async (datos) => {
  try {
    const templateParams = {
      nombre: datos.nombre,
      email: datos.email,
      numero_caso: datos.numero_caso,
    };

    await emailjs.send(
      "service_a50fk4u", // tu Service ID
      "template_d6k79ad", // tu Template ID
      templateParams,
      "WlQJz3LX5w7kFxyuT" // tu Public Key
    );

    console.log("  Correo de confirmación enviado correctamente");
  } catch (error) {
    console.error("  Error al enviar correo:", error);
  }
};
