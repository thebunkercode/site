<script lang="ts">
  import { TIME_MS } from '@/lib/constants';
  import { pad } from '@/lib/utils';

  let { targetDate }: { targetDate: string } = $props();

  let days = $state('--');
  let hours = $state('--');
  let mins = $state('--');
  let secs = $state('--');
  let expired = $state(false);
  let prevDays = '';
  let prevHours = '';
  let prevMins = '';
  let prevSecs = '';
  let flipFlags = $state({ d: false, h: false, m: false, s: false });

  function render() {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) {
      days = '00';
      hours = '00';
      mins = '00';
      secs = '00';
      expired = true;
      clearInterval(timer);
      return;
    }
    const d = String(Math.floor(diff / TIME_MS.DAY));
    const h = pad(Math.floor((diff % TIME_MS.DAY) / TIME_MS.HOUR));
    const m = pad(Math.floor((diff % TIME_MS.HOUR) / TIME_MS.MINUTE));
    const s = pad(Math.floor((diff % TIME_MS.MINUTE) / TIME_MS.SECOND));

    if (prevDays !== d) {
      days = d;
      flipFlags.d = !flipFlags.d;
      prevDays = d;
    }
    if (prevHours !== h) {
      hours = h;
      flipFlags.h = !flipFlags.h;
      prevHours = h;
    }
    if (prevMins !== m) {
      mins = m;
      flipFlags.m = !flipFlags.m;
      prevMins = m;
    }
    if (prevSecs !== s) {
      secs = s;
      flipFlags.s = !flipFlags.s;
      prevSecs = s;
    }
  }

  let timer: ReturnType<typeof setInterval>;

  $effect(() => {
    render();
    timer = setInterval(render, TIME_MS.SECOND);
    return () => clearInterval(timer);
  });
</script>

<div
  class="countdown"
  role="timer"
  aria-label={expired ? 'el bunker está abierto' : 'cuenta regresiva para el lanzamiento'}
>
  <div class="cell">
    <div class="v" class:flip={flipFlags.d}>{days}</div>
    <div class="k">días</div>
  </div>
  <div class="cell">
    <div class="v" class:flip={flipFlags.h}>{hours}</div>
    <div class="k">horas</div>
  </div>
  <div class="cell">
    <div class="v" class:flip={flipFlags.m}>{mins}</div>
    <div class="k">min</div>
  </div>
  <div class="cell">
    <div class="v" class:flip={flipFlags.s}>{secs}</div>
    <div class="k">seg</div>
  </div>
</div>
