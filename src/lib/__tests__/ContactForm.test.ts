import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ContactForm from '@/components/ContactForm.svelte';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all form fields', () => {
    render(ContactForm);
    expect(screen.getByLabelText(/nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/empresa/)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(ContactForm);
    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(screen.getByText(/faltan campos obligatorios/i)).toBeInTheDocument();
  });

  it('shows validation error when submitting invalid email', async () => {
    const user = userEvent.setup();
    render(ContactForm);
    await user.type(screen.getByLabelText(/nombre/), 'John');
    await user.type(screen.getByLabelText(/email/), 'notanemail');
    await user.type(screen.getByLabelText(/mensaje/), 'Hello');
    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(screen.getByText(/faltan campos obligatorios/i)).toBeInTheDocument();
  });

  it('shows loading state on submit and disables button', async () => {
    let resolveFetch: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.mocked(globalThis.fetch).mockReturnValue(fetchPromise);

    const user = userEvent.setup();
    render(ContactForm);
    await user.type(screen.getByLabelText(/nombre/), 'John');
    await user.type(screen.getByLabelText(/email/), 'john@example.com');
    await user.type(screen.getByLabelText(/mensaje/), 'Hello');

    const button = screen.getByRole('button');
    const clickPromise = user.click(button);
    await new Promise((r) => setTimeout(r, 0));

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
    expect(button).toHaveTextContent('enviando...');

    resolveFetch!(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await clickPromise;

    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent(/enviar mensaje/i);
  });

  it('shows success message on successful submit', async () => {
    const user = userEvent.setup();
    render(ContactForm);
    await user.type(screen.getByLabelText(/nombre/), 'John');
    await user.type(screen.getByLabelText(/email/), 'john@example.com');
    await user.type(screen.getByLabelText(/mensaje/), 'Hello');
    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(screen.getByText(/mensaje enviado/i)).toBeInTheDocument();
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    render(ContactForm);
    const nameInput = screen.getByLabelText(/nombre/);
    const emailInput = screen.getByLabelText(/email/);
    const msgInput = screen.getByLabelText(/mensaje/);

    await user.type(nameInput, 'John');
    await user.type(emailInput, 'john@example.com');
    await user.type(msgInput, 'Hello');
    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }));

    expect(nameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(msgInput).toHaveValue('');
  });

  it('shows error hint when server returns error', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'server error' }), { status: 400 }),
    );
    const user = userEvent.setup();
    render(ContactForm);
    await user.type(screen.getByLabelText(/nombre/), 'John');
    await user.type(screen.getByLabelText(/email/), 'john@example.com');
    await user.type(screen.getByLabelText(/mensaje/), 'Hello');
    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(screen.getByText(/server error/i)).toBeInTheDocument();
  });

  it('shows network error when fetch fails', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(ContactForm);
    await user.type(screen.getByLabelText(/nombre/), 'John');
    await user.type(screen.getByLabelText(/email/), 'john@example.com');
    await user.type(screen.getByLabelText(/mensaje/), 'Hello');
    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }));
    expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
  });
});
