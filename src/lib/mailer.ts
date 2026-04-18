import nodemailer from "nodemailer";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true", // true for port 465
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export async function sendConfirmationEmail(
  to: string,
  confirmationLink: string
): Promise<void> {
  await transporter.sendMail({
    from: `"VSK Univerzita Brno" <${process.env.SMTP_FROM!}>`,
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
    from: `"VSK Univerzita Brno" <${process.env.SMTP_FROM!}>`,
    to: process.env.CHAIRMAN_EMAIL!,
    subject: "Nová potvrzená objednávka / New confirmed order",
    text: serialized,
    html: `<pre>${escapeHtml(serialized)}</pre>`,
  });
}
