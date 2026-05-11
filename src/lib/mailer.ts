import nodemailer from "nodemailer";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "davidskrecek@gmail.com",
    pass: process.env.SMTP_PASS || "",
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.warn("[MAILER] Warning: SMTP connection failed. Emails may not be sent.", error.message);
  } else {
    console.log("[MAILER] Server is ready to take our messages");
  }
});

const DEFAULT_FROM = process.env.SMTP_FROM || "davidskrecek@gmail.com";

export async function sendConfirmationEmail(
  to: string,
  confirmationLink: string
): Promise<void> {
  await transporter.sendMail({
    from: `"VSK Univerzita Brno" <${DEFAULT_FROM}>`,
    to,
    subject: "Potvrďte prosím svoji objednávku / Please confirm your order",
    text: `Pro potvrzení objednávky klikněte na odkaz:\n${confirmationLink}\n\nOdkaz vyprší za 2 hodiny.`,
    html: `
      <p>Dobrý den,</p>
      <p>pro dokončení objednávky klikněte na tlačítko níže. Odkaz je platný <strong>2 hodiny</strong>.</p>
      <p>
        <a href="${confirmationLink}" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none;">
          Potvrdit objednávku
        </a>
      </p>
      <p>Pokud jste objednávku nepodali vy, tento e-mail ignorujte.</p>
    `,
  });
}

export async function sendChairmanNotification(
  orderData: unknown
): Promise<void> {
  const serialized = JSON.stringify(orderData, null, 2);

  await transporter.sendMail({
    from: `"VSK Univerzita Brno" <${DEFAULT_FROM}>`,
    to: process.env.CHAIRMAN_EMAIL!,
    subject: "Nová potvrzená objednávka / New confirmed order",
    text: serialized,
    html: `<pre>${escapeHtml(serialized)}</pre>`,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<void> {
  await transporter.sendMail({
    from: `"VSK Univerzita Brno" <${DEFAULT_FROM}>`,
    to,
    subject: "Obnovení hesla / Password reset",
    text: `Pro obnovení hesla klikněte na odkaz:\n${resetLink}\n.`,
    html: `
      <p>Dobrý den,</p>
      <p>pro obnovení hesla klikněte na tlačítko níže.</p>
      <p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none;">
          Obnovit heslo
        </a>
      </p>
      <p>Pokud jste o obnovení hesla nežádali vy, tento e-mail prosím ignorujte.</p>
    `,
  });
}

export async function sendInvitationEmail(
  to: string,
  invitationLink: string
): Promise<void> {
  await transporter.sendMail({
    from: `"VSK Univerzita Brno" <${DEFAULT_FROM}>`,
    to,
    subject: "Pozvánka do redakčního systému VSK / Editorial System Invitation",
    text: `Byli jste přidáni jako editor do systému VSK Univerzita Brno. Pro aktivaci účtu a nastavení hesla klikněte na odkaz:\n${invitationLink}\n\nOdkaz vyprší za 7 dní.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #1d4ed8;">Vítejte v týmu!</h2>
        <p>Dobrý den,</p>
        <p>byli jste přidáni jako <strong>editor</strong> do redakčního systému VSK Univerzita Brno.</p>
        <p>Pro aktivaci vašeho účtu a nastavení přístupového hesla klikněte prosím na tlačítko níže. Tento odkaz je platný po dobu <strong>7 dní</strong>.</p>
        <p style="margin: 30px 0;">
          <a href="${invitationLink}" style="display:inline-block;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
            Aktivovat účet a nastavit heslo
          </a>
        </p>
        <p style="font-size: 12px; color: #666;">
          Pokud si nejste vědomi, že byste měli mít k systému přístup, můžete tento e-mail ignorovat.
        </p>
      </div>
    `,
  });
}

