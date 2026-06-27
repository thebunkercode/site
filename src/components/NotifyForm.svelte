<script lang="ts">
  import { EMAIL_RE } from '@/lib/validation';

  let email = $state('');
  let hintText = $state('// sin spam. solo el aviso de despliegue.');
  let hintClass = $state('');
  let loading = $state(false);

  async function submit() {
    if (loading) return;
    hintClass = '';
    const v = email.trim();
    if (!EMAIL_RE.test(v)) {
      hintText = '// email inválido. revisa el formato.';
      hintClass = 'err';
      return;
    }
    loading = true;
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        hintText = '// ' + (data.error || 'error al guardar.');
        hintClass = 'err';
        return;
      }
      hintText = '// listo, ' + v + ' está en la lista ✓';
      hintClass = 'ok';
      email = '';
    } catch {
      hintText = '// error de conexión. intenta de nuevo.';
      hintClass = 'err';
    } finally {
      loading = false;
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') submit();
  }
</script>

<section class="notify">
  <div class="label">// avísame cuando se abra el bunker</div>
  <div class="row">
    <input
      class="input"
      type="email"
      inputmode="email"
      autocomplete="email"
      placeholder="tu@email.com"
      aria-label="tu correo"
      bind:value={email}
      onkeydown={onKeydown}
    />
    <button class="btn" type="button" onclick={submit} disabled={loading}>
      {loading ? 'enviando...' : 'notificarme →'}
    </button>
  </div>
  <div class="hint {hintClass}" aria-live="polite">{hintText}</div>
</section>
