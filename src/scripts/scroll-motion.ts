import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Scroll suave + reveals padrão do site (fade/sobe, cards escalonados, parallax leve).
// Content sempre visível por padrão no HTML/CSS — se prefers-reduced-motion estiver
// ligado, não inicializa nada e a página fica 100% estática e legível.
export function initScrollMotion() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return null;

  document.documentElement.classList.add('js-ready');
  gsap.registerPlugin(ScrollTrigger);

  // Evita que uma posição de scroll restaurada pelo navegador desalinhe cálculos de
  // pin/scrub feitos assumindo o topo da página.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  gsap.utils.toArray<HTMLElement>('[data-reveal-up]').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 32 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
    );
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal-fade]:not([data-hero] *)').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' } }
    );
  });

  const cards = gsap.utils.toArray<HTMLElement>('[data-reveal-card]');
  if (cards.length) {
    ScrollTrigger.batch(cards, {
      start: 'top 88%',
      onEnter: (batch) =>
        gsap.fromTo(
          batch,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }
        ),
      once: true,
    });
  }

  gsap.utils.toArray<HTMLElement>('[data-parallax-media]').forEach((wrap) => {
    const target = wrap.querySelector<HTMLElement>('[data-parallax-img]') || (wrap.firstElementChild as HTMLElement | null);
    if (!target) return;
    // A imagem preenche o quadro exatamente; sem esse zoom, o deslocamento do parallax
    // deixaria uma faixa vazia numa borda e cortaria a outra.
    gsap.set(target, { scale: 1.18 });
    gsap.fromTo(
      target,
      { yPercent: -5 },
      { yPercent: 5, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true } }
    );
  });

  // Imagens podem terminar de carregar depois do cálculo inicial do ScrollTrigger,
  // mudando a altura real do documento — recalcula quando tudo carregar.
  window.addEventListener('load', () => ScrollTrigger.refresh());

  return { gsap, ScrollTrigger, lenis };
}
