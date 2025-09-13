import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const server = {
  send: defineAction({
     input: z.object({
      name: z.string(),
      email: z.string().email(),
      investmentLevel: z.string().min(20),
      message: z.string().min(20).max(500),
    }),
    accept: 'form',
    handler: async (formData) => {
      const targetEmail = import.meta.env.TARGET_EMAIL || '259197@student.pwr.edu.pl';
      const { data, error } = await resend.emails.send({
        from: 'Portfolio AI - wishlist <wishlist@resend.dev>',
        to: targetEmail,
        subject: 'Message from Portfolio AI landing page',
        html: `
          <div>
            <h1>New Contact Form Submission</h1>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Investment Level:</strong> ${formData.investmentLevel}</p>
            <p><strong>Message:</strong> ${formData.message}</p>
          </div>
        `,
      });

      if (error) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }

      return data;
    },
  }),
};