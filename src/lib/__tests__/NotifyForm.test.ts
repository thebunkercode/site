import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import NotifyForm from '@/components/NotifyForm.svelte';

describe('NotifyForm', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email input and button', () => {
    render(NotifyForm);
    expect(screen.getByRole('textbox', { name: /tu correo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notificarme/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty', async () => {
    const user = userEvent.setup();
    render(NotifyForm);
    await user.click(screen.getByRole('button', { name: /notificarme/i }));
    expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(NotifyForm);
    await user.type(screen.getByRole('textbox', { name: /tu correo/i }), 'notanemail');
    await user.click(screen.getByRole('button', { name: /notificarme/i }));
    expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
  });

  it('shows loading state and disabled button during submit', async () => {
    let resolveFetch: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.mocked(globalThis.fetch).mockReturnValue(fetchPromise);

    const user = userEvent.setup();
    render(NotifyForm);
    await user.type(screen.getByRole('textbox', { name: /tu correo/i }), 'user@example.com');

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
    expect(button).toHaveTextContent(/notificarme/i);
  });

  it('shows success message after valid email submission', async () => {
    const user = userEvent.setup();
    render(NotifyForm);
    await user.type(screen.getByRole('textbox', { name: /tu correo/i }), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /notificarme/i }));
    expect(screen.getByText(/listo/i)).toBeInTheDocument();
  });

  it('shows error on server error', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'server error' }), { status: 400 }),
    );
    const user = userEvent.setup();
    render(NotifyForm);
    await user.type(screen.getByRole('textbox', { name: /tu correo/i }), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /notificarme/i }));
    expect(screen.getByText(/server error/i)).toBeInTheDocument();
  });

  it('submitting with Enter key triggers submit', async () => {
    const user = userEvent.setup();
    render(NotifyForm);
    const input = screen.getByRole('textbox', { name: /tu correo/i });
    await user.type(input, 'user@example.com');
    await user.keyboard('{Enter}');
    expect(screen.getByText(/listo/i)).toBeInTheDocument();
  });
});
