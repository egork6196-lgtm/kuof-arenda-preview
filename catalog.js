function typeHeroCopy() {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = performance.getEntriesByType('navigation')[0];
  if (motion.matches || navigation?.type === 'back_forward' || window.scrollY > 0 ||
      (window.location.hash && window.location.hash !== '#main')) {
    return;
  }

  const lines = document.querySelectorAll('[data-type-line]');
  const originals = [];
  let delay = 100;

  function revealAt(element) {
    element.classList.add('hero-type');
    element.style.setProperty('--type-delay', `${delay}ms`);
  }

  for (const line of lines) {
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    visual.append(...Array.from(line.childNodes, node => node.cloneNode(true)));

    for (const node of Array.from(visual.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        const characters = document.createDocumentFragment();
        for (const character of node.textContent) {
          const glyph = document.createElement('span');
          glyph.textContent = character;
          revealAt(glyph);
          characters.append(glyph);
          delay += 38;
        }
        node.replaceWith(characters);
      }
    }

    const original = document.createElement('span');
    original.className = 'sr-only';
    original.append(...line.childNodes);
    line.append(original, visual);
    originals.push({ line, original });
    delay += 130;
  }

  window.setTimeout(() => {
    for (const { line, original } of originals) {
      line.replaceChildren(...original.childNodes);
    }
  }, delay);
}

typeHeroCopy();

const categorySelect = document.querySelector('[data-category-select]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (categorySelect) {
  const panels = Array.from(document.querySelectorAll('[data-category-panel]'));
  const categories = Array.from(categorySelect.querySelectorAll('input[name="category"]'));
  const controls = document.querySelector('.listing-controls');
  const buttons = Array.from(controls.querySelectorAll('[data-listing-step]'));
  let activePanel;
  let slide;

  function showCategory(selected) {
    if (activePanel?.dataset.categoryPanel !== selected.value) stopSlide();
    selected.checked = true;

    for (const panel of panels) {
      panel.hidden = panel.dataset.categoryPanel !== selected.value;
      if (!panel.hidden) activePanel = panel;
    }

    for (const button of buttons) {
      button.setAttribute('aria-controls', activePanel.id);
    }
    syncControls();
  }

  function carouselPosition() {
    const [first, second] = activePanel.children;
    const stride = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
    const total = activePanel.childElementCount;
    const visible = Math.round(activePanel.clientWidth / stride);
    const lastStart = Math.max(0, total - visible);
    const index = slide?.index ?? Math.max(0, Math.min(lastStart, Math.round(activePanel.scrollLeft / stride)));
    return { stride, lastStart, index };
  }

  function syncControls() {
    const { index, lastStart } = carouselPosition();
    buttons[0].setAttribute('aria-disabled', index === 0);
    buttons[1].setAttribute('aria-disabled', index === lastStart);
  }

  function stopSlide() {
    if (!slide) return;
    cancelAnimationFrame(slide.frame);
    slide.panel.classList.remove('is-sliding');
    slide = undefined;
  }

  function advanceCarousel(step) {
    const { index, stride, lastStart } = carouselPosition();
    const destination = Math.max(0, Math.min(lastStart, index + step));
    if (destination === index) return;

    const panel = activePanel;
    const from = panel.scrollLeft;
    const to = Math.min(destination * stride, panel.scrollWidth - panel.clientWidth);
    stopSlide();

    if (reducedMotion.matches || Math.abs(to - from) < 1) {
      panel.scrollLeft = to;
      syncControls();
      return;
    }

    const duration = Math.min(520, 350 + Math.abs(to - from) * .23);
    const animation = { panel, index: destination, frame: 0 };
    let start;
    slide = animation;
    panel.classList.add('is-sliding');
    syncControls();

    function move(timestamp) {
      start ??= timestamp;
      const time = Math.min((timestamp - start) / duration, 1);
      const progress = time * time * (3 - 2 * time);
      panel.scrollLeft = from + (to - from) * progress;
      if (time < 1) {
        animation.frame = requestAnimationFrame(move);
      } else {
        stopSlide();
        syncControls();
      }
    }

    animation.frame = requestAnimationFrame(move);
  }

  function showCategoryFromHash() {
    const category = categories.find(input => `#${input.value}` === window.location.hash);

    if (category) {
      showCategory(category);
      document.getElementById('catalog')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  const initialCategory = categories.find(input => input.checked) ?? categories[0];

  if (initialCategory) {
    showCategory(initialCategory);
    categorySelect.hidden = false;
    controls.hidden = false;
    showCategoryFromHash();

    for (const button of buttons) {
      button.addEventListener('click', () => advanceCarousel(Number(button.dataset.listingStep)));
    }

    for (const panel of panels) {
      panel.addEventListener('scroll', () => {
        if (panel === activePanel && !slide) syncControls();
      }, { passive: true });
      function releaseToGesture() {
        if (slide?.panel !== panel) return;
        stopSlide();
        syncControls();
      }
      panel.addEventListener('pointerdown', releaseToGesture, { passive: true });
      panel.addEventListener('wheel', releaseToGesture, { passive: true });
      panel.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        advanceCarousel(event.key === 'ArrowLeft' ? -1 : 1);
      });
    }

    categorySelect.addEventListener('change', event => {
      if (categories.includes(event.target)) {
        showCategory(event.target);
        window.history.replaceState(window.history.state, '', `#${event.target.value}`);
      }
    });

    window.addEventListener('hashchange', showCategoryFromHash);
    window.addEventListener('resize', () => {
      stopSlide();
      syncControls();
    });
    window.addEventListener('pageshow', syncControls);
  }
}

for (const toggle of document.querySelectorAll('.listing-card__toggle')) {
  const card = toggle.closest('.listing-card');
  let hover = false;
  let pinned = false;
  const render = () => toggle.setAttribute('aria-expanded', hover || pinned);

  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    pinned = toggle.getAttribute('aria-expanded') === 'false';
    hover = false;
    render();
  });
  card.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hover = true;
    render();
  });
  card.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hover = false;
    render();
  });
  card.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    pinned = false;
    hover = false;
    render();
  });
}

const catalog = document.querySelector('.catalog');

if (catalog && !reducedMotion.matches && 'IntersectionObserver' in window) {
  let revealingPanel;
  const observer = new IntersectionObserver(entries => {
    const visible = entries.find(entry => entry.isIntersecting && !entry.target.hidden);
    if (!visible) {
      return;
    }

    observer.disconnect();
    catalog.classList.remove('is-awaiting-reveal');
    revealingPanel = visible.target;
    revealingPanel.classList.add('is-revealing');
  }, { rootMargin: '0px 0px -100px 0px' });

  function finishReveal() {
    observer.disconnect();
    catalog.classList.remove('is-awaiting-reveal');
    revealingPanel?.classList.remove('is-revealing');
    revealingPanel = null;
  }

  function finishIfPanelChanged() {
    if (revealingPanel?.hidden) {
      finishReveal();
    }
  }

  catalog.classList.add('is-awaiting-reveal');
  for (const panel of catalog.querySelectorAll('[data-category-panel]')) {
    observer.observe(panel);
  }

  categorySelect?.addEventListener('change', finishIfPanelChanged);
  window.addEventListener('hashchange', finishIfPanelChanged);
  reducedMotion.addEventListener('change', finishReveal, { once: true });

  catalog.addEventListener('focusin', event => {
    if (event.target.closest('.listing-card')) {
      finishReveal();
    }
  });

  catalog.addEventListener('animationend', event => {
    if (revealingPanel && event.animationName === 'listing-reveal' &&
        event.target === revealingPanel.lastElementChild) {
      finishReveal();
    }
  });
}
