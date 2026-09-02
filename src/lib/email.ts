import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's shared onboarding@resend.dev sender only delivers to the
// account owner's own Resend signup email until a real sending domain is
// verified - see design.md Decision 5. Swap this once a domain is set up.
const FROM_ADDRESS = "Nick Cai <onboarding@resend.dev>";

export async function sendDownloadEmail({
  to,
  items,
}: {
  to: string;
  items: { title: string; downloadUrl: string }[];
}) {
  const linksHtml = items
    .map(
      (item) =>
        `<li><a href="${item.downloadUrl}">${item.title}</a>（連結 24 小時內有效）</li>`
    )
    .join("");

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "您的樂譜下載連結",
    html: `<p>感謝您的購買，以下是您的樂譜下載連結：</p><ul>${linksHtml}</ul>`,
  });
}
