/**
 * HTML email template for receipt
 * Clean, modern, dark-themed design
 */

interface ReceiptData {
    item: string;
    harga: string;
    email: string;
}

export function generateReceiptHTML(data: ReceiptData): string {
    const { item, harga, email } = data;
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(parseInt(harga));

    const currentDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Struk Pembelian</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid #333; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #333;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Struk Pembelian
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #888888;">
                ${currentDate}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Item Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #666666; font-weight: 600;">
                      Item Pembelian
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; background-color: #0f0f0f; border: 1px solid #222; border-radius: 8px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                      ${item}
                    </h2>
                  </td>
                </tr>
              </table>

              <!-- Price -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; color: #888888;">
                            Total Harga
                          </p>
                        </td>
                        <td align="right">
                          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #00ff88; letter-spacing: -0.5px;">
                            ${formattedPrice}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Customer Email -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 16px; background-color: #0f0f0f; border-left: 3px solid #00ff88; border-radius: 4px;">
                    <p style="margin: 0; font-size: 12px; color: #666666; margin-bottom: 4px;">
                      Dikirim ke:
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #ffffff; font-weight: 500;">
                      ${email}
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #333; background-color: #0a0a0a;">
              <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.6;">
                Terima kasih atas pembelian Anda.<br>
                Struk ini dikirim secara otomatis via Wrapper API.
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: #444444;">
                © ${new Date().getFullYear()} Wrapper API. All rights reserved.
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
