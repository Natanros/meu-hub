/**
 * Serviço de envio de emails
 * Suporta múltiplos provedores: Resend, Nodemailer (Gmail/SMTP)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envia email usando Resend (recomendado para produção)
 */
async function sendWithResend(options: EmailOptions): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY não configurada');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Meu Hub <noreply@meuhub.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erro ao enviar email com Resend:', error);
      return false;
    }

    console.log('✅ Email enviado com sucesso via Resend');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email com Resend:', error);
    return false;
  }
}

/**
 * Envia email usando Nodemailer (fallback ou desenvolvimento)
 * @param _options - Opções de email (não usado nesta implementação placeholder)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendWithNodemailer(_options: EmailOptions): Promise<boolean> {
  // Para usar Nodemailer, descomente as linhas abaixo e instale: npm install nodemailer
  // const nodemailer = require('nodemailer');
  
  console.warn('⚠️ Nodemailer não está configurado. Configure RESEND_API_KEY ou implemente Nodemailer.');
  
  // Exemplo de configuração Nodemailer (descomente para usar):
  /*
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Meu Hub" <noreply@meuhub.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('✅ Email enviado com sucesso via Nodemailer');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email com Nodemailer:', error);
    return false;
  }
  */
  
  return false;
}

/**
 * Envia email de recuperação de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🔐 Recuperação de Senha</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Olá,</p>
    
    <p>Você solicitou a recuperação de senha da sua conta no <strong>Meu Hub</strong>.</p>
    
    <p>Para redefinir sua senha, clique no botão abaixo:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;">
        Redefinir Senha
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      Ou copie e cole este link no seu navegador:
    </p>
    <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
      ${resetUrl}
    </p>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0; font-size: 14px;">
        ⏰ <strong>Este link expira em 1 hora.</strong>
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Se você não solicitou esta recuperação, ignore este email. Sua senha permanecerá a mesma.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} Meu Hub. Todos os direitos reservados.
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Recuperação de Senha - Meu Hub

Você solicitou a recuperação de senha da sua conta.

Para redefinir sua senha, acesse o link abaixo:
${resetUrl}

Este link expira em 1 hora.

Se você não solicitou esta recuperação, ignore este email.

© ${new Date().getFullYear()} Meu Hub
  `;

  // Tenta enviar com Resend primeiro, depois fallback para Nodemailer
  if (process.env.RESEND_API_KEY) {
    return await sendWithResend({
      to: email,
      subject: '🔐 Recuperação de Senha - Meu Hub',
      html,
      text,
    });
  } else {
    return await sendWithNodemailer({
      to: email,
      subject: '🔐 Recuperação de Senha - Meu Hub',
      html,
      text,
    });
  }
}

/**
 * Envia email de confirmação de alteração de senha
 */
export async function sendPasswordChangedEmail(email: string): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">✅ Senha Alterada</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Olá,</p>
    
    <p>Sua senha foi alterada com sucesso no <strong>Meu Hub</strong>.</p>
    
    <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0; font-size: 14px;">
        ✅ Sua senha foi atualizada em ${new Date().toLocaleString('pt-BR')}
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      Se você não realizou esta alteração, entre em contato com o suporte imediatamente.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      © ${new Date().getFullYear()} Meu Hub. Todos os direitos reservados.
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Senha Alterada - Meu Hub

Sua senha foi alterada com sucesso em ${new Date().toLocaleString('pt-BR')}.

Se você não realizou esta alteração, entre em contato com o suporte imediatamente.

© ${new Date().getFullYear()} Meu Hub
  `;

  if (process.env.RESEND_API_KEY) {
    return await sendWithResend({
      to: email,
      subject: '✅ Senha Alterada - Meu Hub',
      html,
      text,
    });
  } else {
    return await sendWithNodemailer({
      to: email,
      subject: '✅ Senha Alterada - Meu Hub',
      html,
      text,
    });
  }
}
