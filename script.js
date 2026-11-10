const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const menuLabel = document.querySelector('.menu-label');
const mobileLayout = window.matchMedia('(max-width: 760px)');
const bookingLink = document.querySelector('.header-booking');
let lastFocusedElement = document.activeElement;
document.addEventListener('focusin', (event) => { lastFocusedElement = event.target; });

function setMenu(open, restoreFocus = false) {
  menuToggle.setAttribute('aria-expanded', String(open));
  navigation.dataset.open = String(open);
  menuLabel.textContent = open ? 'Закрыть меню' : 'Открыть меню';
  if (restoreFocus) menuToggle.focus();
}

menuToggle.hidden = false;
navigation.dataset.enhanced = 'true';
function syncHeaderLayout() {
  const activeElement = document.activeElement === document.body ? lastFocusedElement : document.activeElement;
  const restoreMenuFocus = mobileLayout.matches && navigation.contains(activeElement);
  const restoreBookingFocus = !mobileLayout.matches && activeElement === menuToggle;
  if (mobileLayout.matches) menuToggle.before(bookingLink);
  else navigation.after(bookingLink);
  setMenu(false, restoreMenuFocus);
  if (restoreBookingFocus) bookingLink.focus();
  if (activeElement === bookingLink) bookingLink.focus();
}
syncHeaderLayout();
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || !mobileLayout.matches) return;
  setMenu(false);
  const target = document.querySelector(link.hash);
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header') && menuToggle.getAttribute('aria-expanded') === 'true') setMenu(false);
});
mobileLayout.addEventListener('change', syncHeaderLayout);

const services = {};
document.querySelectorAll('[data-service]').forEach((article) => {
  services[article.dataset.service] = {
    title: article.querySelector('h3').textContent,
    price: article.querySelector('.price').textContent,
    duration: article.querySelector('.duration').textContent,
  };
});
services.consultation = { title: 'Нужна консультация' };

const bookingForm = document.querySelector('#booking-form');
const serviceChoice = document.querySelector('#service-choice');
const errorMessage = document.querySelector('#service-error');
const result = document.querySelector('#booking-result');
const resultHeading = document.querySelector('#result-heading');
const resultDetails = document.querySelector('#result-details');

function renderFacts(service, container) {
  container.replaceChildren();
  if (!service.price) {
    const note = document.createElement('p');
    note.textContent = 'Направление, стоимость и длительность зависят от выбранной услуги.';
    container.append(note);
    return;
  }
  const facts = document.createElement('dl');
  facts.className = 'result-facts';
  const entries = [
    ['Ориентировочная стоимость', service.price],
    ['Примерная длительность', service.duration],
  ];
  entries.forEach(([label, value]) => {
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    facts.append(term, description);
  });
  container.append(facts);
}

bookingForm.hidden = false;
bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const service = services[serviceChoice.value];
  if (!service) {
    errorMessage.textContent = 'Сначала выберите услугу или консультацию.';
    serviceChoice.setAttribute('aria-invalid', 'true');
    serviceChoice.focus();
    return;
  }
  resultHeading.textContent = `Ваш выбор: ${service.title}`;
  renderFacts(service, resultDetails);
  bookingForm.hidden = true;
  result.hidden = false;
  resultHeading.focus();
});

serviceChoice.addEventListener('change', () => {
  errorMessage.textContent = '';
  serviceChoice.removeAttribute('aria-invalid');
});

document.querySelector('#reset-choice').addEventListener('click', () => {
  bookingForm.reset();
  result.hidden = true;
  bookingForm.hidden = false;
  errorMessage.textContent = '';
  serviceChoice.removeAttribute('aria-invalid');
  serviceChoice.focus();
});

document.querySelectorAll('[data-select-service]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const service = link.dataset.selectService;
    if (!services[service]) return;
    event.preventDefault();
    result.hidden = true;
    bookingForm.hidden = false;
    serviceChoice.value = service;
    serviceChoice.dispatchEvent(new Event('change'));
    history.pushState(null, '', '#booking');
    document.querySelector('#booking').scrollIntoView();
    serviceChoice.focus({ preventScroll: true });
  });
});
