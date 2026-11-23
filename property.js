const categories = {
  office: {
    name: 'Офисы',
    type: 'Офис',
    specs: ['Этаж', 'Планировка', 'Отделка'],
    logistics: 'Перед просмотром уточните, к какому входу подъехать и как пройти до офиса.',
  },
  storage: {
    name: 'Склады',
    type: 'Склад',
    specs: ['Размер ворот', 'Зона погрузки', 'Подъезд грузового транспорта'],
    logistics: 'Заранее согласуйте маршрут разгрузки и сообщите габариты грузового транспорта.',
  },
  production: {
    name: 'Производство',
    type: 'Производственный цех',
    specs: ['Электрическая мощность', 'Вентиляция', 'Полезная высота'],
    logistics: 'Перед просмотром сообщите габариты оборудования и транспорта, чтобы уточнить маршрут доставки на площадку.',
  },
};

const properties = {
  'office-window': {
    title: 'Офис с окном',
    category: 'office',
    description: 'При выборе офиса проверьте, как разместить рабочие места и хватает ли естественного света. Планировку и этаж можно уточнить перед просмотром.',
    views: [['office-window', 'Общий вид'], ['office-detail', 'Вид со стороны окна']],
  },
  'office-tile': {
    title: 'Офис с плиточным полом',
    category: 'office',
    description: 'При подборе офиса для сотрудников или приёма клиентов уточните планировку, состояние отделки и доступ в помещение.',
    views: [['office-tile', 'Общий вид'], ['office-detail', 'Вид со стороны окна']],
  },
  'office-corner': {
    title: 'Угловой офис',
    category: 'office',
    description: 'При выборе углового офиса оцените расположение рабочих мест и освещение в течение дня. Планировку и состояние отделки можно уточнить перед просмотром.',
    views: [['office-corner', 'Общий вид офиса'], ['office-detail', 'Вид со стороны окна']],
  },
  'storage-columns': {
    title: 'Склад с колоннами',
    category: 'storage',
    description: 'Проверьте, хватает ли места между колоннами для стеллажей, проезда техники и перемещения груза.',
    views: [['storage-columns', 'Вид вдоль зала'], ['storage-detail', 'Схема зоны разгрузки']],
  },
  'storage-window': {
    title: 'Склад с окном',
    category: 'storage',
    description: 'На просмотре можно оценить планировку и выяснить, подходят ли условия помещения для вашего товара и режима хранения.',
    views: [['storage-window', 'Вид со стороны окна'], ['storage-detail', 'Схема зоны разгрузки']],
  },
  'storage-gate': {
    title: 'Склад с воротами',
    category: 'storage',
    description: 'Для склада с воротами уточните размеры проёма, порядок разгрузки и маршрут движения груза. На просмотре можно оценить, как разместить стеллажи и организовать проходы.',
    views: [['storage-gate', 'Вид со стороны ворот'], ['storage-detail', 'Схема зоны разгрузки']],
  },
  'workshop-columns': {
    title: 'Цех с колоннами',
    category: 'production',
    description: 'До просмотра сообщите, какое оборудование планируете разместить. На месте можно проверить расстановку станков, проходы между колоннами и путь доставки оборудования.',
    views: [['workshop-columns', 'Общий вид цеха'], ['workshop-cross', 'Вид между колоннами'], ['workshop-access', 'Подъезд к цеху']],
  },
  'workshop-panel': {
    title: 'Цех с электрощитом',
    category: 'production',
    description: 'Для оценки помещения уточните требования к подключению станков, вентиляции и высоте. Доступная мощность согласовывается для конкретного помещения.',
    views: [['workshop-panel', 'Зона подключения'], ['workshop-access', 'Подъезд к цеху']],
  },
  'workshop-open': {
    title: 'Цех открытой планировки',
    category: 'production',
    description: 'При подборе цеха открытой планировки продумайте размещение оборудования, рабочих зон и проходов. Требования к подключению и доставке оборудования стоит обсудить перед просмотром.',
    views: [['workshop-open', 'Общий вид цеха'], ['workshop-access', 'Подъезд к цеху']],
  },
};

const id = new URLSearchParams(window.location.search).get('id');

if (Object.hasOwn(properties, id)) {
  showProperty(properties[id]);
} else {
  document.getElementById('property-empty').hidden = false;
}

function showProperty(property) {
  const category = categories[property.category];
  document.title = `${property.title} — КУОФ`;

  document.getElementById('property-category').textContent = `${category.name} · Пример карточки`;
  document.getElementById('property-title').textContent = property.title;
  document.getElementById('property-type').textContent = category.type;
  document.getElementById('property-description').textContent = property.description;
  document.getElementById('property-logistics').textContent = category.logistics;
  document.querySelector('[data-lightbox-title]').textContent = property.title;

  for (const link of document.querySelectorAll('[data-return]')) {
    link.href = `index.html#${property.category}`;
  }
  document.querySelector('.property-back').textContent = `К разделу «${category.name}»`;

  const specs = document.getElementById('property-specs');
  for (const name of category.specs) {
    const row = document.createElement('div');
    const label = document.createElement('dt');
    const value = document.createElement('dd');
    label.textContent = name;
    value.textContent = 'Уточняется';
    row.append(label, value);
    specs.append(row);
  }

  setupGallery(property.views);
  document.getElementById('property').hidden = false;
}

function setupGallery(views) {
  const gallery = document.querySelector('[data-gallery]');
  const lightbox = document.querySelector('[data-lightbox]');
  const expand = gallery.querySelector('[data-gallery-expand]');
  const thumbStrip = gallery.querySelector('[data-gallery-thumbs]');
  const surfaces = [gallery, lightbox].map(container => ({
    image: container.querySelector('[data-gallery-image]'),
    caption: container.querySelector('[data-gallery-caption]'),
    count: container.querySelector('[data-gallery-count]'),
  }));

  const thumbnails = views.map(([file, caption], index) => {
    const button = document.createElement('button');
    const image = document.createElement('img');
    button.type = 'button';
    button.setAttribute('aria-label', `Кадр ${index + 1}: ${caption}`);
    image.src = imagePath(file);
    image.alt = '';
    image.width = 1200;
    image.height = 800;
    image.loading = 'lazy';
    button.append(image);
    button.addEventListener('click', () => showFrame(index));
    thumbStrip.append(button);
    return button;
  });

  let current = 0;
  showFrame(current);

  for (const container of [gallery, lightbox]) {
    for (const button of container.querySelectorAll('[data-step]')) {
      button.addEventListener('click', () => showFrame(current + Number(button.dataset.step)));
    }
    container.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showFrame(current + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    enableSwipe(container.querySelector('[data-swipe]'), step => showFrame(current + step));
  }

  if (typeof lightbox.showModal === 'function') {
    expand.addEventListener('click', () => lightbox.showModal());
    lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('close', () => expand.focus({ preventScroll: true }));
  } else {
    expand.hidden = true;
  }

  function showFrame(index) {
    current = (index + views.length) % views.length;
    const [file, caption] = views[current];
    for (const surface of surfaces) {
      surface.image.src = imagePath(file);
      surface.image.alt = `Схема: ${caption.toLowerCase()}`;
      surface.caption.textContent = caption;
      surface.count.textContent = `${current + 1} / ${views.length}`;
    }
    for (const [position, button] of thumbnails.entries()) {
      if (position === current) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }
}

function imagePath(file) {
  return `assets/preview/${file}.svg`;
}

function enableSwipe(stage, move) {
  let start;
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.pointerType === 'mouse') return;
    start = { id: event.pointerId, x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener('pointerup', event => {
    if (start?.id !== event.pointerId) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    start = undefined;
    if (Math.abs(x) >= 45 && Math.abs(x) > 1.35 * Math.abs(y)) move(x > 0 ? -1 : 1);
  });
  stage.addEventListener('lostpointercapture', event => {
    if (start?.id === event.pointerId) start = undefined;
  });
}
