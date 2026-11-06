"use strict";

const flavors = {
  mango: {
    name: "Mango glow", image: "images/fruit-mango.svg", color: "#fff0b8",
    ingredient: "Mango is the fruit spotlight for this flavor concept.",
    vitamins: "Mango naturally contains vitamin C and other nutrients; amounts in a finished recipe are not yet verified.",
    fiber: "Per-serving fiber is not yet established; see a finalized nutrition label when available.",
    enzymes: "No digestive-enzyme amount or benefit has been verified for this concept.",
    advantage: "A bright, fruit-forward frozen cup designed for a fun, easy-to-portion snack."
  },
  strawberry: {
    name: "Strawberry pop", image: "images/fruit-strawberry.svg", color: "#ffe0e4",
    ingredient: "Strawberry is the fruit spotlight for this flavor concept.",
    vitamins: "Strawberries naturally contain vitamin C; amounts in a finished recipe are not yet verified.",
    fiber: "Per-serving fiber is not yet established; see a finalized nutrition label when available.",
    enzymes: "No digestive-enzyme amount or benefit has been verified for this concept.",
    advantage: "A berry-bright frozen cup designed to make fruit feel like a treat."
  },
  blueberry: {
    name: "Blueberry swirl", image: "images/fruit-blueberry.svg", color: "#e8def6",
    ingredient: "Blueberry is the fruit spotlight for this flavor concept.",
    vitamins: "Blueberries naturally contain vitamin C and vitamin K; amounts in a finished recipe are not yet verified.",
    fiber: "Per-serving fiber is not yet established; see a finalized nutrition label when available.",
    enzymes: "No digestive-enzyme amount or benefit has been verified for this concept.",
    advantage: "A colorful, spoonable frozen snack concept with a mellow berry character."
  },
  watermelon: {
    name: "Melon mood", image: "images/fruit-watermelon.svg", color: "#d9efdf",
    ingredient: "Watermelon is the fruit spotlight for this flavor concept.",
    vitamins: "Watermelon naturally contains vitamin C and vitamin A precursors; amounts in a finished recipe are not yet verified.",
    fiber: "Per-serving fiber is not yet established; see a finalized nutrition label when available.",
    enzymes: "No digestive-enzyme amount or benefit has been verified for this concept.",
    advantage: "A cool, juicy frozen cup concept that makes an easy-to-enjoy snack."
  },
  peach: {
    name: "Peachy keen", image: "images/fruit-peach.svg", color: "#ffdfc8",
    ingredient: "Peach is the fruit spotlight for this flavor concept.",
    vitamins: "Peaches naturally contain vitamin C and vitamin A precursors; amounts in a finished recipe are not yet verified.",
    fiber: "Per-serving fiber is not yet established; see a finalized nutrition label when available.",
    enzymes: "No digestive-enzyme amount or benefit has been verified for this concept.",
    advantage: "A soft, sunny frozen cup concept sized for a cheerful snack break."
  },
  citrus: {
    name: "Citrus sparkle", image: "images/fruit-citrus.svg", color: "#fff4bf",
    ingredient: "Citrus is the fruit spotlight for this flavor concept.",
    vitamins: "Citrus fruits naturally contain vitamin C; amounts in a finished recipe are not yet verified.",
    fiber: "Per-serving fiber is not yet established; see a finalized nutrition label when available.",
    enzymes: "No digestive-enzyme amount or benefit has been verified for this concept.",
    advantage: "A zesty frozen cup concept with a bright, fruit-forward flavor profile."
  }
};

const CART_KEY = "sorbeez-cart-v1";
const countElements = document.querySelectorAll("[data-cart-count]");
const cartDialog = document.querySelector("[data-cart-dialog]");
const cartItemsElement = document.querySelector("[data-cart-items]");
const cartStatus = document.querySelector("[data-cart-status]");

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Saved cart data is not valid.");
  }
  return parsed;
}

function reportCartError(error) {
  const message = "Your saved bag could not be read or updated. Please check your browser storage settings and try again.";
  console.error(message, error);
  if (cartStatus) cartStatus.textContent = message;
  document.querySelectorAll("[data-cart-count]").forEach((element) => { element.textContent = "0"; });
}

function cartSize(cart) {
  return Object.values(cart).reduce((total, quantity) => {
    return total + (Number.isInteger(quantity) && quantity > 0 ? quantity : 0);
  }, 0);
}

function renderCart() {
  try {
    const cart = getCart();
    const count = cartSize(cart);
    countElements.forEach((element) => { element.textContent = String(count); });
    document.querySelectorAll("[data-open-cart]").forEach((button) => {
      button.setAttribute("aria-label", `Open cart, ${count} ${count === 1 ? "item" : "items"}`);
    });
    if (!cartItemsElement) return;
    cartItemsElement.replaceChildren();
    const entries = Object.entries(cart).filter(([id, quantity]) => flavors[id] && Number.isInteger(quantity) && quantity > 0);
    if (entries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "cart-empty";
      empty.textContent = "Your bag is ready for a little fruit joy.";
      cartItemsElement.append(empty);
      return;
    }
    entries.forEach(([id, quantity]) => {
      const flavor = flavors[id];
      const line = document.createElement("div");
      line.className = "cart-line";
      const label = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = flavor.name;
      const description = document.createElement("small");
      description.textContent = "Sorbeez flavor concept";
      label.append(title, description);
      const amount = document.createElement("span");
      amount.className = "cart-quantity";
      amount.textContent = `× ${quantity}`;
      line.append(label, amount);
      cartItemsElement.append(line);
    });
  } catch (error) {
    reportCartError(error);
  }
}

function addToCart(id) {
  if (!flavors[id]) return;
  try {
    const cart = getCart();
    cart[id] = (Number.isInteger(cart[id]) && cart[id] > 0 ? cart[id] : 0) + 1;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
    const message = document.querySelector("[data-add-status]");
    if (message) message.textContent = `${flavors[id].name} added to your bag.`;
  } catch (error) {
    reportCartError(error);
  }
}

function showFlavor(id) {
  const flavor = flavors[id];
  const dialog = document.querySelector("[data-flavor-dialog]");
  if (!flavor || !dialog) return;
  dialog.querySelector("[data-flavor-banner]").style.backgroundColor = flavor.color;
  const illustration = dialog.querySelector("[data-flavor-illustration]");
  illustration.src = flavor.image;
  illustration.alt = `${flavor.name} fruit character`;
  dialog.querySelector("[data-flavor-name]").textContent = flavor.name;
  dialog.querySelector("[data-detail-ingredient]").textContent = flavor.ingredient;
  dialog.querySelector("[data-detail-vitamins]").textContent = flavor.vitamins;
  dialog.querySelector("[data-detail-fiber]").textContent = flavor.fiber;
  dialog.querySelector("[data-detail-enzymes]").textContent = flavor.enzymes;
  dialog.querySelector("[data-detail-advantage]").textContent = flavor.advantage;
  dialog.querySelector("[data-modal-add]").dataset.addToCart = id;
  dialog.showModal();
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    addToCart(addButton.dataset.addToCart);
    return;
  }
  const detailsButton = event.target.closest("[data-show-flavor]");
  if (detailsButton) {
    showFlavor(detailsButton.dataset.showFlavor);
    return;
  }
  const flavorCard = event.target.closest(".flavor-card");
  if (flavorCard) showFlavor(flavorCard.id);
  if (event.target.closest("[data-open-cart]") && cartDialog) cartDialog.showModal();
  if (event.target.closest("[data-close-cart]") && cartDialog) cartDialog.close();
  if (event.target.closest("[data-clear-cart]")) {
    try {
      localStorage.removeItem(CART_KEY);
      renderCart();
      if (cartStatus) cartStatus.textContent = "Your bag is clear. This is a product concept—not a live checkout.";
    } catch (error) {
      reportCartError(error);
    }
  }
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === CART_KEY || event.key === null) renderCart();
});

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    navLinks.classList.toggle("is-open", !expanded);
  });
  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }
  });
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const selected = button.dataset.filter;
    document.querySelectorAll(".flavor-card").forEach((card) => {
      card.hidden = selected !== "all" && card.dataset.category !== selected;
    });
  });
});

document.querySelectorAll("[data-zip-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = form.querySelector("[data-zip-message]");
    result.textContent = "Thanks for checking in! Store locations aren’t available yet, and your ZIP code was not saved or sent.";
  });
});

document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = form.parentElement.querySelector("[data-newsletter-message]");
    message.textContent = "Thanks for your interest! Signup isn’t connected, so your email was not saved or sent.";
    form.reset();
  });
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const revealTargets = document.querySelectorAll(
  "main > section, main .content-section, main .flavor-card, main .faq-item, main .value-card, main .team-card, main .tier-card, main .game-card, .site-footer .footer-main > *"
);
if (revealTargets.length && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("motion-enabled");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });
  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
    revealObserver.observe(element);
  });
}

const memoryCards = [...document.querySelectorAll("[data-memory-card]")];
const memoryStatus = document.querySelector("[data-memory-status]");
const memoryScore = document.querySelector("[data-memory-score]");
let memoryFirstCard = null;
let memoryLocked = false;
let memoryMoves = 0;
let memoryPairs = 0;
let memoryTimeout = 0;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function updateMemoryScore() {
  if (memoryScore) memoryScore.textContent = `${memoryPairs} / 3 pairs · ${memoryMoves} ${memoryMoves === 1 ? "move" : "moves"}`;
}

function resetMemoryGame() {
  if (memoryCards.length !== 6) return;
  window.clearTimeout(memoryTimeout);
  memoryFirstCard = null;
  memoryLocked = false;
  memoryMoves = 0;
  memoryPairs = 0;
  const fruits = shuffle(["strawberry", "strawberry", "citrus", "citrus", "mango", "mango"]);
  memoryCards.forEach((card, index) => {
    card.dataset.fruit = fruits[index];
    card.classList.remove("is-revealed", "is-matched");
    card.setAttribute("aria-label", `Fruit card ${index + 1}, hidden`);
    card.setAttribute("aria-pressed", "false");
    const illustration = card.querySelector(".memory-card-front img");
    illustration.src = flavors[fruits[index]].image;
    illustration.alt = "";
  });
  if (memoryStatus) memoryStatus.textContent = "Find the matching fruit buddies!";
  updateMemoryScore();
}

function turnMemoryCard(card) {
  if (memoryLocked || card.classList.contains("is-matched") || card.classList.contains("is-revealed")) return;
  card.classList.add("is-revealed");
  card.setAttribute("aria-pressed", "true");
  const index = memoryCards.indexOf(card) + 1;
  const fruitName = { strawberry: "strawberry", citrus: "citrus", mango: "mango" }[card.dataset.fruit];
  card.setAttribute("aria-label", `Fruit card ${index}, ${fruitName}`);

  if (!memoryFirstCard) {
    memoryFirstCard = card;
    if (memoryStatus) memoryStatus.textContent = "Looking for its fruit buddy...";
    return;
  }

  memoryMoves += 1;
  const firstCard = memoryFirstCard;
  memoryFirstCard = null;
  if (firstCard.dataset.fruit === card.dataset.fruit) {
    firstCard.classList.add("is-matched");
    card.classList.add("is-matched");
    memoryPairs += 1;
    if (memoryStatus) memoryStatus.textContent = memoryPairs === 3 ? "You found every fruity friend! You're a match-making superstar! 🎉" : "A perfect pair! Those fruit buddies found each other! 💛";
    updateMemoryScore();
    return;
  }

  memoryLocked = true;
  if (memoryStatus) memoryStatus.textContent = "Not quite a pair—try another fruity duo!";
  updateMemoryScore();
  memoryTimeout = window.setTimeout(() => {
    [firstCard, card].forEach((hiddenCard) => {
      hiddenCard.classList.remove("is-revealed");
      hiddenCard.setAttribute("aria-pressed", "false");
      hiddenCard.setAttribute("aria-label", `Fruit card ${memoryCards.indexOf(hiddenCard) + 1}, hidden`);
    });
    memoryLocked = false;
  }, 850);
}

memoryCards.forEach((card) => card.addEventListener("click", () => turnMemoryCard(card)));
document.querySelector("[data-memory-reset]")?.addEventListener("click", resetMemoryGame);
if (memoryCards.length === 6) resetMemoryGame();

const quizFlavors = [
  { id: "mango", name: "Mango glow", hint: "I'm a tropical golden fruit with one big seed. I'm sweet, sunny, and a little bit glowy!" },
  { id: "strawberry", name: "Strawberry pop", hint: "I'm a bright red berry with tiny seeds on the outside and a leafy little hat!" },
  { id: "blueberry", name: "Blueberry swirl", hint: "I'm a teeny blue-purple berry who loves to travel in a little bunch!" },
  { id: "watermelon", name: "Melon mood", hint: "I'm a big green fruit on the outside, pink and juicy on the inside!" },
  { id: "peach", name: "Peachy keen", hint: "I'm fuzzy, blush-colored, and have a little crease down my middle!" },
  { id: "citrus", name: "Citrus sparkle", hint: "I'm bright yellow, zippy, and make a wonderfully puckery face!" }
];
const quizHint = document.querySelector("[data-quiz-hint]");
const quizChoices = document.querySelector("[data-quiz-choices]");
const quizFeedback = document.querySelector("[data-quiz-feedback]");
const quizMascot = document.querySelector("[data-quiz-mascot]");
let quizAnswer = null;
let quizAnswered = false;
let lastQuizAnswer = "";

function startFlavorQuiz() {
  if (!quizHint || !quizChoices || !quizFeedback) return;
  const candidates = quizFlavors.filter((flavor) => flavor.name !== lastQuizAnswer);
  quizAnswer = candidates[Math.floor(Math.random() * candidates.length)];
  lastQuizAnswer = quizAnswer.name;
  quizAnswered = false;
  quizHint.textContent = quizAnswer.hint;
  if (quizMascot) quizMascot.src = flavors[quizAnswer.id].image;
  quizFeedback.textContent = "";
  quizChoices.replaceChildren();
  shuffle([quizAnswer, ...shuffle(quizFlavors.filter((flavor) => flavor !== quizAnswer)).slice(0, 2)]).forEach((flavor) => {
    const choice = document.createElement("button");
    choice.type = "button";
    choice.className = "quiz-choice";
    choice.dataset.quizAnswer = flavor.name;
    const illustration = document.createElement("img");
    illustration.src = flavors[flavor.id].image;
    illustration.alt = "";
    const name = document.createElement("span");
    name.textContent = flavor.name;
    choice.append(illustration, name);
    quizChoices.append(choice);
  });
}

quizChoices?.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-quiz-answer]");
  if (!choice || quizAnswered || !quizAnswer) return;
  quizAnswered = true;
  const correct = choice.dataset.quizAnswer === quizAnswer.name;
  choice.classList.add(correct ? "is-correct" : "is-wrong");
  [...quizChoices.querySelectorAll("[data-quiz-answer]")].find((button) => button.dataset.quizAnswer === quizAnswer.name)?.classList.add("is-correct");
  quizFeedback.textContent = correct ? `You got it! ${quizAnswer.name} is one happy fruit!` : `Good guess! It was ${quizAnswer.name}. Try another clue!`;
});

document.querySelector("[data-quiz-next]")?.addEventListener("click", startFlavorQuiz);
startFlavorQuiz();

renderCart();