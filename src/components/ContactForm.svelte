<script lang="ts">
  import { EMAIL_RE } from '@/lib/validation';

  let cName = $state('');
  let cEmail = $state('');
  let cCompany = $state('');
  let cMsg = $state('');
  let hintText = $state('// todos los campos con * son obligatorios.');
  let hintClass = $state('');
  let loading = $state(false);

  async function submit() {
    if (loading) return;
    hintClass = '';
    const name = cName.trim();
    const email = cEmail.trim();
    const msg = cMsg.trim();
    if (!name || !EMAIL_RE.test(email) || !msg) {
      hintText = '// faltan campos obligatorios o el email no es válido.';
      hintClass = 'err';
      return;
    }
    loading = true;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company: cCompany.trim(), message: msg }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        hintText = '// ' + (data.error || 'error al enviar.');
        hintClass = 'err';
        return;
      }
      hintText = '// mensaje enviado ✓ te respondemos pronto.';
      hintClass = 'ok';
      cName = '';
      cEmail = '';
      cCompany = '';
      cMsg = '';
    } catch {
      hintText = '// error de conexión. intenta de nuevo.';
      hintClass = 'err';
    } finally {
      loading = false;
    }
  }
</script>

<div class="panel">
  <div class="field">
    <label for="c-name">nombre <span class="req">*</span></label>
    <input class="uline" id="c-name" type="text" placeholder="cómo te llamas" bind:value={cName} />
  </div>
  <div class="field">
    <label for="c-email">email <span class="req">*</span></label>
    <input
      class="uline"
      id="c-email"
      type="email"
      inputmode="email"
      placeholder="tu@email.com"
      bind:value={cEmail}
    />
  </div>
  <div class="field">
    <label for="c-company">empresa / proyecto</label>
    <input class="uline" id="c-company" type="text" placeholder="opcional" bind:value={cCompany} />
  </div>
  <div class="field">
    <label for="c-msg">mensaje <span class="req">*</span></label>
    <textarea class="uline" id="c-msg" placeholder="cuéntanos en qué andas..." bind:value={cMsg}
    ></textarea>
  </div>
  <div class="form-actions">
    <button class="btn" type="button" onclick={submit} disabled={loading}>
      {loading ? 'enviando...' : 'enviar mensaje →'}
    </button>
    <span class="hint {hintClass}" aria-live="polite">{hintText}</span>
  </div>
</div>
