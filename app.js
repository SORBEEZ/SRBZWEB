const CART_ITEMS_KEY = 'sorbeez-cart-items';
const LEGACY_CART_COUNT_KEY = 'sorbeez-cart-count';

function readCartItems() {
  const storedItems = localStorage.getItem(CART_ITEMS_KEY);
  if (storedItems !== null) {
    const parsedItems = JSON.parse(storedItems);
    if (!Array.isArray(parsedItems)) throw new TypeError('Saved Sorbeez cart must be a list.');
    return parsedItems.filter((item) =>
      item &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      Number.isSafeInteger(item.quantity) &&
      item.quantity > 0
    );
  }

  const previousCount = Number.parseInt(localStorage.getItem(LEGACY_CART_COUNT_KEY) ?? '0', 10);
  if (!Number.isSafeInteger(previousCount) || previousCount <= 0) return [];
  const migratedItems = [{ id: 'previous-concepts', name: 'Previously added flavor concepts', quantity: previousCount }];
  localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(migratedItems));
  return migratedItems;
}

function updateCartCount(count) {
  document.querySelectorAll('[data-cart-count]').forEach((counter) => {
    counter.textContent = String(count);
    counter.setAttribute('aria-label', `${count} ${count === 1 ? 'item' : 'items'} in cart`);
  });
}

let cartItems = readCartItems();

function saveCartItems() {
  localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(cartItems));
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  localStorage.setItem(LEGACY_CART_COUNT_KEY, String(cartCount));
  updateCartCount(cartCount);
}

function renderCartPage() {
  const cartContents = document.querySelector('[data-cart-contents]');
  if (!cartContents) return;

  const emptyMessage = document.querySelector('[data-cart-empty]');
  cartContents.replaceChildren(...cartItems.map((item) => {
    const row = document.createElement('li');
    row.className = 'cart-item';

    const details = document.createElement('div');
    details.className = 'cart-item-details';
    const name = document.createElement('h2');
    name.textContent = item.name;
    const quantity = document.createElement('p');
    quantity.textContent = `Quantity: ${item.quantity}`;
    details.append(name, quantity);

    const actions = document.createElement('div');
    actions.className = 'cart-item-actions';
    const decrementButton = document.createElement('button');
    decrementButton.className = 'cart-quantity-button';
    decrementButton.type = 'button';
    decrementButton.textContent = '−';
    decrementButton.setAttribute('aria-label', `Remove one ${item.name}`);
    decrementButton.addEventListener('click', () => {
      if (item.quantity === 1) cartItems = cartItems.filter((cartItem) => cartItem.id !== item.id);
      else item.quantity -= 1;
      saveCartItems();
      renderCartPage();
    });
    const incrementButton = document.createElement('button');
    incrementButton.className = 'cart-quantity-button';
    incrementButton.type = 'button';
    incrementButton.textContent = '+';
    incrementButton.setAttribute('aria-label', `Add one ${item.name}`);
    incrementButton.addEventListener('click', () => {
      item.quantity += 1;
      saveCartItems();
      renderCartPage();
    });
    const removeButton = document.createElement('button');
    removeButton.className = 'button button-small button-soft';
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.setAttribute('aria-label', `Remove ${item.name} from cart`);
    removeButton.addEventListener('click', () => {
      cartItems = cartItems.filter((cartItem) => cartItem.id !== item.id);
      saveCartItems();
      renderCartPage();
    });
    actions.append(decrementButton, incrementButton, removeButton);
    row.append(details, actions);
    return row;
  }));

  const isEmpty = cartItems.length === 0;
  if (emptyMessage) emptyMessage.hidden = !isEmpty;
}

updateCartCount(cartItems.reduce((total, item) => total + item.quantity, 0));
renderCartPage();

document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
  button.addEventListener('click', () => {
    const flavorDetails = button.closest('.flavor-card')?.querySelector('[data-flavor-details]');
    const flavorName = flavorDetails?.dataset.name;
    if (!flavorName) throw new Error('Could not find a flavor name for this cart item.');

    const flavorId = flavorName.toLowerCase().replaceAll(' ', '-');
    const cartItem = cartItems.find((item) => item.id === flavorId);
    if (cartItem) cartItem.quantity += 1;
    else cartItems.push({ id: flavorId, name: flavorName, quantity: 1 });
    saveCartItems();

    const originalText = button.textContent;
    button.textContent = 'Added to Cart!';
    button.setAttribute('aria-live', 'polite');
    window.setTimeout(() => {
      button.textContent = originalText;
      button.removeAttribute('aria-live');
    }, 1200);
  });
});

const flavorDialog = document.querySelector('[data-flavor-dialog]');
if (flavorDialog instanceof HTMLDialogElement) {
  const title = flavorDialog.querySelector('[data-modal-title]');
  const ingredient = flavorDialog.querySelector('[data-modal-ingredient]');
  const vitamins = flavorDialog.querySelector('[data-modal-vitamins]');
  const fiber = flavorDialog.querySelector('[data-modal-fiber]');
  const enzymes = flavorDialog.querySelector('[data-modal-enzymes]');
  const advantage = flavorDialog.querySelector('[data-modal-advantage]');
  let previouslyFocused;

  document.querySelectorAll('[data-flavor-details]').forEach((button) => {
    button.addEventListener('click', () => {
      previouslyFocused = document.activeElement;
      if (title) title.textContent = button.dataset.name ?? 'Flavor details';
      if (ingredient) ingredient.textContent = button.dataset.ingredient ?? 'Details coming soon';
      if (vitamins) vitamins.textContent = button.dataset.vitamins ?? 'To be confirmed';
      if (fiber) fiber.textContent = button.dataset.fiber ?? 'Not yet established';
      if (enzymes) enzymes.textContent = button.dataset.enzymes ?? 'Not yet established';
      if (advantage) advantage.textContent = button.dataset.advantage ?? 'Details coming soon';
      flavorDialog.showModal();
      flavorDialog.querySelector('[data-modal-close]')?.focus();
    });
  });

  flavorDialog.querySelectorAll('[data-modal-close]').forEach((button) => {
    button.addEventListener('click', () => flavorDialog.close());
  });
  flavorDialog.addEventListener('click', (event) => {
    if (event.target === flavorDialog) flavorDialog.close();
  });
  flavorDialog.addEventListener('close', () => {
    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
  });
}

const sponsorForm = document.querySelector('[data-sponsor-form]');
if (sponsorForm instanceof HTMLFormElement) {
  sponsorForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = sponsorForm.querySelector('[data-form-status]');
    if (status) status.textContent = 'This preview does not send messages yet. Please contact the Sorbeez team directly to follow up.';
  });
}

document.querySelectorAll('[data-copyright-year]').forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});

const flavorMaker = document.querySelector('[data-maker-dropzone]');
if (flavorMaker instanceof HTMLElement) {
  const flavors = {
    mango: { label: 'Mango', color: '#ffd21a' },
    berry: { label: 'Berry', color: '#ff617a' },
    blueberry: { label: 'Blueberry', color: '#6399f5' },
    peach: { label: 'Peach', color: '#ff9c50' },
  };
  const toppings = {
    strawberry: { label: 'berry bits' },
    pineapple: { label: 'pineapple' },
    sparkles: { label: 'magic sprinkles' },
  };
  const scoop = document.querySelector('[data-maker-scoop]');
  const toppingTray = document.querySelector('[data-maker-toppings]');
  const bowlLabel = document.querySelector('[data-maker-label]');
  const status = document.querySelector('[data-maker-status]');
  const choiceButtons = [...document.querySelectorAll('[data-maker-flavor], [data-maker-topping]')];
  let selectedFlavor = 'mango';
  const selectedToppings = new Set();

  function renderFlavorMaker(message) {
    const flavor = selectedFlavor ? flavors[selectedFlavor] : null;
    flavorMaker.classList.toggle('is-empty', !flavor);
    if (scoop) {
      if (flavor) scoop.style.setProperty('--scoop-color', flavor.color);
    }
    if (bowlLabel) {
      bowlLabel.textContent = flavor ? `Your ${flavor.label.toLowerCase()} scoop!` : '';
    }
    if (toppingTray) {
      toppingTray.replaceChildren(...[...selectedToppings].map((name) => {
        const topping = toppings[name];
        const decoration = document.createElement('span');
        decoration.className = `bowl-topping topping-${name}`;
        decoration.setAttribute('aria-label', topping.label);
        const pieceCount = name === 'sparkles' ? 8 : 4;
        for (let index = 0; index < pieceCount; index += 1) {
          const piece = document.createElement('span');
          piece.className = `topping-piece piece-${name} piece-position-${index + 1}`;
          piece.setAttribute('aria-hidden', 'true');
          decoration.append(piece);
        }
        return decoration;
      }));
    }
    choiceButtons.forEach((button) => {
      const flavorName = button.dataset.makerFlavor;
      if (flavorName) button.setAttribute('aria-pressed', String(flavorName === selectedFlavor));
      const toppingName = button.dataset.makerTopping;
      if (toppingName) button.setAttribute('aria-pressed', String(selectedToppings.has(toppingName)));
    });
    if (status) status.textContent = message ?? (flavor
      ? `${flavor.label} scoop ready! ${selectedToppings.size ? `You added ${selectedToppings.size} topping${selectedToppings.size === 1 ? '' : 's'}.` : 'Pick some toppings.'}`
      : 'Your bowl is empty! Pick a scoop to get started.');
  }

  function addMakerItem(type, name) {
    if (type === 'flavor' && flavors[name]) {
      selectedFlavor = name;
      renderFlavorMaker(`${flavors[name].label} scoop! What toppings should we add?`);
    } else if (type === 'topping' && toppings[name]) {
      if (selectedToppings.has(name)) selectedToppings.delete(name);
      else selectedToppings.add(name);
      renderFlavorMaker(`${toppings[name].label} ${selectedToppings.has(name) ? 'added!' : 'removed!'}`);
    }
  }

  choiceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.makerFlavor) addMakerItem('flavor', button.dataset.makerFlavor);
      if (button.dataset.makerTopping) addMakerItem('topping', button.dataset.makerTopping);
    });
    button.addEventListener('dragstart', (event) => {
      if (!event.dataTransfer) return;
      const type = button.dataset.makerFlavor ? 'flavor' : 'topping';
      const name = button.dataset.makerFlavor ?? button.dataset.makerTopping;
      event.dataTransfer.setData('text/plain', `${type}:${name}`);
      event.dataTransfer.effectAllowed = 'copy';
    });
  });

  flavorMaker.addEventListener('dragover', (event) => event.preventDefault());
  flavorMaker.addEventListener('drop', (event) => {
    event.preventDefault();
    const [type, name] = event.dataTransfer?.getData('text/plain').split(':') ?? [];
    if (type && name) addMakerItem(type, name);
  });
  document.querySelector('[data-maker-reset]')?.addEventListener('click', () => {
    selectedFlavor = null;
    selectedToppings.clear();
    renderFlavorMaker('Fresh, empty bowl! Pick a scoop to get started.');
  });
  renderFlavorMaker();
}

const treasureButtons = [...document.querySelectorAll('[data-treasure]')];
const treasureStatus = document.querySelector('[data-treasure-status]');
if (treasureButtons.length && treasureStatus) {
  const foundTreasures = new Set();
  let treasureTimeout;
  treasureButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const fruit = button.dataset.treasure;
      if (!fruit || foundTreasures.has(fruit)) return;
      foundTreasures.add(fruit);
      button.disabled = true;
      button.classList.add('is-found');
      const left = treasureButtons.length - foundTreasures.size;
      treasureStatus.textContent = left
        ? `Nice find! ${left} more sneaky fruit${left === 1 ? '' : 's'} to go.`
        : 'Treasure complete! You found all the hidden fruit!';
      if (!left) document.body.classList.add('treasure-complete');
      window.clearTimeout(treasureTimeout);
      treasureTimeout = window.setTimeout(() => {
        treasureStatus.textContent = '';
        document.body.classList.remove('treasure-complete');
      }, 4500);
    });
  });
}
