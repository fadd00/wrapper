/**
 * Generate HTML email template for receipt
 */

interface ReceiptData {
  item: string;
  harga: string;
  email: string;
  senderEmail?: string; // Optional sender info
}

export function generateReceiptHTML(data: ReceiptData): string {
  const { item, harga, email, senderEmail } = data;

  // Format price with thousand separators
  const formattedPrice = parseInt(harga).toLocaleString('id-ID');

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Struk Pembelian</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #e0e0e0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: 700;">
                🧾 Struk Pembelian
              </h1>
            </td>
          </tr>

          ${senderEmail ? `
          <!-- Sender Info -->
          <tr>
            <td style="padding: 20px 40px; border-bottom: 1px solid #2a2a2a;">
              <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                Dikirim oleh
              </p>
              <p style="margin: 5px 0 0 0; font-size: 16px; color: #00ff88; font-weight: 600;">
                ${senderEmail}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Receipt Details -->
          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 30px;">
                    <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                      Item
                    </p>
                    <h2 style="margin: 8px 0 0 0; font-size: 24px; color: #fff; font-weight: 600;">
                      ${item}
                    </h2>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px 0; border-top: 2px solid #2a2a2a; border-bottom: 2px solid #2a2a2a;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="margin: 0; font-size: 14px; color: #888;">
                            Harga
                          </p>
                        </td>
                        <td align="right" style="padding: 10px 0;">
                          <p style="margin: 0; font-size: 14px; color: #fff;">
                            Rp ${formattedPrice}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <p style="margin: 0; font-size: 16px; color: #fff; font-weight: 600;">
                            Total
                          </p>
                        </td>
                        <td align="right" style="padding: 10px 0;">
                          <p style="margin: 0; font-size: 20px; color: #00ff88; font-weight: 700;">
                            Rp ${formattedPrice}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding-top: 30px;">
                    <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                      Penerima
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #00d4ff;">
                      ${email}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0d0d0d; padding: 30px; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                Struk ini dibuat otomatis oleh Wrapper API
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #444;">
                Terima kasih atas pembelian Anda! 🙏
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
