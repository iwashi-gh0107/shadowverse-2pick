/* =========================================================
   Shadowverse Historical 2Pick Simulator
========================================================= */


/* =========================================================
   STATE
========================================================= */

let cards = [];
let cardDetails = {};
let environmentMaster = null;
let environment = null;

let selectedEnvironmentCode = null;
let selectedClass = null;

let currentPick = 0;
let deck = [];

let currentLeft = [];
let currentRight = [];

let pickLocked = false;

/* =========================================================
   LEADER SELECT MODE

   random = 通常2Pick
            ランダム3クラス

   free   = 自由選択
            使用可能な全クラス
========================================================= */

let leaderSelectMode = "random";
/* =========================================================
   PICK LABELS
========================================================= */

const PICK_LABELS = {
  gold_legend: "ゴールド / レジェンド",
  bronze: "ブロンズ",
  silver: "シルバー",
  neutral: "ニュートラル"
};


/* =========================================================
   INITIALIZE
========================================================= */

async function initialize() {

  try {

    const [
      cardResponse,
      environmentResponse,
      detailResponse
    ] = await Promise.all([
      fetch("data/cards.json"),
      fetch("data/environments.json"),
      fetch("data/card_details.json")
    ]);


    if (!cardResponse.ok) {
      throw new Error("cards.json を読み込めませんでした。");
    }


    if (!environmentResponse.ok) {
      throw new Error("environments.json を読み込めませんでした。");
    }


    if (!detailResponse.ok) {
      throw new Error("card_details.json を読み込めませんでした。");
    }


    cards = await cardResponse.json();

    environmentMaster =
      await environmentResponse.json();

    cardDetails =
      await detailResponse.json();


    console.log(
      `カードデータ: ${cards.length}枚`
    );

    console.log(
      `カード詳細: ${Object.keys(cardDetails).length}枚`
    );

    console.log(
      `環境数: ${
        Object.keys(environmentMaster.environments).length
      }`
    );


    createEnvironmentButtons();

    setupEvents();

  }

  catch (error) {

    console.error(error);

    alert(
      "データの読み込みに失敗しました。\n\n" +
      error.message
    );

  }

}


/* =========================================================
   SCREEN
========================================================= */

function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.classList.remove("active");

    });


  const target =
    document.getElementById(id);


  if (target) {

    target.classList.add("active");

  }

}


/* =========================================================
   SHUFFLE
========================================================= */

function shuffle(array) {

  const copy = [...array];


  for (
    let i = copy.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );


    [
      copy[i],
      copy[j]
    ] = [
      copy[j],
      copy[i]
    ];

  }


  return copy;

}


/* =========================================================
   ENVIRONMENT NAME
========================================================= */

function getEnvironmentName(code) {

  const env =
    environmentMaster
      ?.environments
      ?.[code];


  if (!env) {
    return code;
  }


  return env.name || code;

}


/* =========================================================
   ENVIRONMENT BUTTONS
========================================================= */

function createEnvironmentButtons() {

  const container =
    document.getElementById(
      "environment-options"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  const environmentCodes =
    Object.keys(
      environmentMaster.environments
    );


  environmentCodes.forEach(code => {

    const button =
      document.createElement("button");


    button.className =
      "environment-button";


    button.dataset.code =
      code;


    const codeDiv =
      document.createElement("div");


    codeDiv.textContent =
      code;


    const nameDiv =
      document.createElement("div");


    nameDiv.textContent =
      getEnvironmentName(code);


    nameDiv.style.fontSize =
      "11px";

    nameDiv.style.fontWeight =
      "normal";

    nameDiv.style.marginTop =
      "5px";

    nameDiv.style.opacity =
      "0.8";


    button.appendChild(codeDiv);
    button.appendChild(nameDiv);


    button.addEventListener(
      "click",
      () => selectEnvironment(code)
    );


    container.appendChild(button);

  });

}


/* =========================================================
   ENVIRONMENT SELECT
========================================================= */

function selectEnvironment(code) {

  selectedEnvironmentCode =
    code;


  environment =
    environmentMaster
      .environments[code];


  document
    .querySelectorAll(
      ".environment-button"
    )
    .forEach(button => {

      button.classList.toggle(
        "selected",
        button.dataset.code === code
      );

    });


  setText(
    "environment-name",
    `${code} - ${getEnvironmentName(code)}`
  );


  const startButton =
    document.getElementById(
      "start-button"
    );


  if (startButton) {

    startButton.disabled = false;

  }

}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

  if (!environment) {

    alert(
      "環境を選択してください。"
    );

    return;

  }


  /*
    その環境で使用可能なクラス
  */

  const availableClasses =
    [...environment.classes];


  let classesToShow = [];


  /* =====================================================
     通常2Pick
     ランダム3リーダー
  ===================================================== */

  if (
    leaderSelectMode === "random"
  ) {

    classesToShow =
      shuffle(
        availableClasses
      ).slice(0, 3);

  }


  /* =====================================================
     自由選択
     全リーダー表示
  ===================================================== */

  else {

    classesToShow =
      availableClasses;

  }


  const container =
    document.getElementById(
      "class-options"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  /*
    モードに応じて
    class-screen にクラスを付ける
  */

  const classScreen =
    document.getElementById(
      "class-screen"
    );


  if (classScreen) {

    classScreen.classList.toggle(
      "free-leader-selection",
      leaderSelectMode === "free"
    );


    classScreen.classList.toggle(
      "random-leader-selection",
      leaderSelectMode === "random"
    );

  }


  /*
    タイトル変更
  */

  const classTitle =
    document.querySelector(
      "#class-screen h1, #class-screen h2"
    );


  if (classTitle) {

    if (
      leaderSelectMode === "free"
    ) {

      classTitle.textContent =
        "SELECT YOUR LEADER";

    }

    else {

      classTitle.textContent =
        "CHOOSE A LEADER";

    }

  }


  /*
    リーダーボタン生成
  */

  classesToShow.forEach(
    className => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "class-button";


      /*
        クラス名
      */

      const classNameElement =
        document.createElement(
          "span"
        );


      classNameElement.className =
        "class-button-name";


      classNameElement.textContent =
        className;


      button.appendChild(
        classNameElement
      );


      /*
        クリック
      */

      button.addEventListener(
        "click",
        () => {

          selectClass(
            className
          );

        }
      );


      container.appendChild(
        button
      );

    }
  );


  showScreen(
    "class-screen"
  );

}

/* =========================================================
   CLASS SELECT
========================================================= */

function selectClass(className) {

  selectedClass =
    className;


  currentPick = 0;
  deck = [];

  currentLeft = [];
  currentRight = [];

  pickLocked = false;


  setText(
    "selected-class",
    selectedClass
  );


  setText(
    "status-class-name",
    selectedClass
  );


  updateDraftStatus();


  showScreen(
    "pick-screen"
  );


  generatePick();

}


/* =========================================================
   BASIC / PRIZE
========================================================= */

function isBasicAllowed(card) {

  const mode =
    environment.basic_mode;


  if (mode === "initial") {

    return (
      card.pack === "ベーシック"
      ||
      card.pack === "プライズ"
    );

  }


  if (mode === "bronze_prize") {

    return (
      (
        card.pack === "ベーシック"
        ||
        card.pack === "プライズ"
      )
      &&
      card.rarity === "ブロンズレア"
      &&
      card.class === selectedClass
    );

  }


  if (mode === "named_list") {

    const basicCards =
      environment.basic_cards || [];


    if (
      basicCards.includes(card.name)
    ) {

      return true;

    }


    if (
      selectedClass === "ネメシス"
      &&
      environment.nemesis_all_basic
      &&
      card.class === "ネメシス"
      &&
      (
        card.pack === "ベーシック"
        ||
        card.pack === "プライズ"
      )
    ) {

      return true;

    }

  }


  return false;

}


/* =========================================================
   BASE POOL
========================================================= */

function basePool() {

  const filtered =
    cards.filter(card => {


      if (
        card.class !== selectedClass
        &&
        card.class !== "ニュートラル"
      ) {

        return false;

      }


      let allowed =
        environment.packs.includes(
          card.pack
        );


      if (
        card.pack === "ベーシック"
        ||
        card.pack === "プライズ"
      ) {

        allowed =
          isBasicAllowed(card);


        if (
          environment.basic_mode === "named_list"
          &&
          card.class === "ニュートラル"
        ) {

          allowed = false;

        }

      }


      if (!allowed) {
        return false;
      }


      const excluded =
        environment.excluded_cards || [];


      if (
        excluded.includes(card.name)
      ) {

        return false;

      }


      return true;

    });


  const normalNames =
    new Set(

      filtered

        .filter(card =>
          card.pack !== "プライズ"
        )

        .map(card =>
          card.name
        )

    );


  return filtered.filter(card => {

    if (
      card.pack === "プライズ"
      &&
      normalNames.has(card.name)
    ) {

      return false;

    }


    return true;

  });

}


/* =========================================================
   NEW PACK BONUS
========================================================= */

function getWeight(card) {

  const bonus =
    environmentMaster
      .rules
      .new_pack_bonus;


  if (
    bonus
    &&
    bonus.enabled
    &&
    card.pack === environment.latest_pack
  ) {

    return (
      Number(bonus.weight)
      ||
      1
    );

  }


  return 1;

}


/* =========================================================
   WEIGHTED RANDOM
========================================================= */

function weightedRandom(pool) {

  if (
    !pool
    ||
    pool.length === 0
  ) {

    return null;

  }


  const total =
    pool.reduce(
      (sum, card) =>
        sum + getWeight(card),
      0
    );


  let random =
    Math.random() * total;


  for (const card of pool) {

    random -=
      getWeight(card);


    if (random <= 0) {

      return card;

    }

  }


  return pool[
    pool.length - 1
  ];

}


/* =========================================================
   DRAW UNIQUE
========================================================= */

function drawUnique(
  pool,
  count
) {

  const available =
    [...pool];


  const result = [];


  while (
    result.length < count
    &&
    available.length > 0
  ) {

    const card =
      weightedRandom(
        available
      );


    if (!card) {
      break;
    }


    result.push(card);


    for (
      let i = available.length - 1;
      i >= 0;
      i--
    ) {

      if (
        available[i].name ===
        card.name
      ) {

        available.splice(
          i,
          1
        );

      }

    }

  }


  return result;

}


/* =========================================================
   PICK POOL
========================================================= */

function getPoolForPick(
  type,
  pickNumber
) {

  const pool =
    basePool();


  if (type === "bronze") {

    return pool.filter(card =>
      card.class === selectedClass
      &&
      card.rarity === "ブロンズレア"
    );

  }


  if (type === "silver") {

    return pool.filter(card =>
      card.class === selectedClass
      &&
      card.rarity === "シルバーレア"
    );

  }


  if (type === "neutral") {

    return pool.filter(card =>
      card.class === "ニュートラル"
      &&
      card.rarity !== "レジェンド"
    );

  }


  if (type === "gold_legend") {

    return pool.filter(card => {

      if (
        card.class === selectedClass
        &&
        (
          card.rarity === "ゴールドレア"
          ||
          card.rarity === "レジェンド"
        )
      ) {

        return true;

      }


      if (
        pickNumber === 1
        &&
        card.class === "ニュートラル"
        &&
        card.rarity === "レジェンド"
      ) {

        return true;

      }


      return false;

    });

  }


  return [];

}


/* =========================================================
   GENERATE PICK
========================================================= */

function generatePick() {

  pickLocked = false;


  setSelectButtonsDisabled(
    false
  );


  const pickNumber =
    currentPick + 1;


  const pickOrder =
    environmentMaster
      .rules
      .pick_order;


  const type =
    pickOrder[currentPick];


  setText(
    "pick-counter",
    `${pickNumber} / ${pickOrder.length} Pick`
  );


  setText(
    "pick-type",
    PICK_LABELS[type] || type
  );


  const pool =
    getPoolForPick(
      type,
      pickNumber
    );


  console.log(
    `Pick ${pickNumber}: ${type} / 候補 ${pool.length}枚`
  );


  if (pool.length < 4) {

    alert(
      "候補カードが不足しています。\n\n"
      +
      `環境: ${selectedEnvironmentCode}\n`
      +
      `クラス: ${selectedClass}\n`
      +
      `Pick: ${pickNumber}\n`
      +
      `種類: ${type}\n`
      +
      `候補: ${pool.length}枚`
    );


    return;

  }


  const fourCards =
    drawUnique(
      pool,
      4
    );


  if (
    fourCards.length < 4
  ) {

    alert(
      "4枚のカードを抽選できませんでした。"
    );

    return;

  }


  currentLeft =
    fourCards.slice(0, 2);


  currentRight =
    fourCards.slice(2, 4);


  renderPair(
    "left-pair",
    currentLeft
  );


  renderPair(
    "right-pair",
    currentRight
  );


  updateDraftStatus();

}


/* =========================================================
   IMAGE PATH
========================================================= */

function imagePath(card) {

  return (
    "cards/"
    +
    card.name
    +
    "_"
    +
    card.id
    +
    ".png"
  );

}


/* =========================================================
   CARD NAME ON NAME PLATE
========================================================= */

function createFrameName(card) {

  const cardName =
    document.createElement("div");


  cardName.className =
    "card-frame-name";


  const text =
    document.createElement("span");


  text.textContent =
    card.name;


  cardName.appendChild(text);


  /*
    名前の長さで文字サイズ調整
  */

  const length =
    card.name.length;


  if (length >= 17) {

    cardName.classList.add(
      "name-xlong"
    );

  }

  else if (length >= 13) {

    cardName.classList.add(
      "name-long"
    );

  }

  else if (length >= 9) {

    cardName.classList.add(
      "name-medium"
    );

  }


  return cardName;

}

/* =========================================================
   CREATE OFFER CARD
========================================================= */

function createCardElement(card) {

  const wrapper =
    document.createElement("div");


  wrapper.className =
    "card";


  wrapper.title =
    `${card.name} - クリックで詳細`;


  const image =
    document.createElement("img");


  image.className =
    "card-image";


  image.src =
    imagePath(card);


  image.alt =
    card.name;


  const error =
    document.createElement("div");


  error.className =
    "image-error";


  error.style.display =
    "none";


  error.textContent =
    "IMAGE NOT FOUND";


  image.addEventListener(
    "error",
    () => {

      image.style.display =
        "none";


      error.style.display =
        "flex";

    }
  );


  wrapper.appendChild(image);

  wrapper.appendChild(error);

  wrapper.appendChild(
    createFrameName(card)
  );


  wrapper.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      openCardModal(card);

    }
  );


  return wrapper;

}


/* =========================================================
   RENDER PAIR
========================================================= */

function renderPair(
  elementId,
  pair
) {

  const element =
    document.getElementById(
      elementId
    );


  if (!element) {
    return;
  }


  const slots =
    element.querySelectorAll(
      ".card-slot"
    );


  slots.forEach(slot => {

    slot.innerHTML = "";

  });


  pair.forEach(
    (card, index) => {

      if (!slots[index]) {
        return;
      }


      slots[index].appendChild(
        createCardElement(card)
      );

    }
  );

}


/* =========================================================
   CHOOSE PAIR
========================================================= */

function choosePair(pair) {

  if (
    pickLocked
    ||
    !pair
    ||
    pair.length !== 2
  ) {

    return;

  }


  pickLocked = true;


  setSelectButtonsDisabled(
    true
  );


  deck.push(
    ...pair
  );


  currentPick++;


  updateDraftStatus();


  const pickOrder =
    environmentMaster
      .rules
      .pick_order;


  if (
    currentPick >=
    pickOrder.length
  ) {

    setTimeout(
      showResult,
      250
    );


    return;

  }


  setTimeout(
    generatePick,
    160
  );

}


/* =========================================================
   UPDATE DRAFT STATUS
========================================================= */

function updateDraftStatus() {

  setText(
    "deck-count",
    deck.length
  );


  setText(
    "status-deck-count",
    deck.length
  );


  setText(
    "picked-card-count",
    `${deck.length} / 30`
  );


  if (selectedClass) {

    setText(
      "status-class-name",
      selectedClass
    );

  }


  updateCostCurve();

  renderPickedCards();

}


/* =========================================================
   COST CURVE
========================================================= */

function updateCostCurve() {

  const counts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0
  };


  deck.forEach(card => {

    const rawCost =
      Number(card.cost);


    if (
      Number.isNaN(rawCost)
    ) {

      return;

    }


    let cost =
      rawCost;


    if (cost <= 1) {
      cost = 1;
    }


    if (cost >= 8) {
      cost = 8;
    }


    counts[cost]++;

  });


  const maxCount =
    Math.max(
      1,
      ...Object.values(counts)
    );


  for (
    let cost = 1;
    cost <= 8;
    cost++
  ) {

    const numberElement =
      document.querySelector(
        `[data-cost="${cost}"]`
      );


    const barElement =
      document.querySelector(
        `[data-cost-bar="${cost}"]`
      );


    if (numberElement) {

      numberElement.textContent =
        counts[cost];

    }


    if (barElement) {

      const height =
        counts[cost] === 0
          ? 2
          : Math.max(
              8,
              Math.round(
                (
                  counts[cost]
                  /
                  maxCount
                )
                *
                70
              )
            );


      barElement.style.height =
        `${height}px`;

    }

  }

}


/* =========================================================
   GROUP DECK
========================================================= */

function getGroupedDeck() {

  const groupedMap =
    new Map();


  deck.forEach(card => {

    const key =
      card.name;


    if (
      groupedMap.has(key)
    ) {

      groupedMap
        .get(key)
        .count++;

    }

    else {

      groupedMap.set(
        key,
        {
          card: card,
          count: 1
        }
      );

    }

  });


  const groupedCards =
    Array.from(
      groupedMap.values()
    );


  groupedCards.sort(
    (a, b) => {

      const costA =
        Number(a.card.cost);

      const costB =
        Number(b.card.cost);


      if (
        costA !== costB
      ) {

        return costA - costB;

      }


      return (
        a.card.name || ""
      ).localeCompare(
        b.card.name || "",
        "ja"
      );

    }
  );


  return groupedCards;

}


/* =========================================================
   PICKED CARDS
========================================================= */

function renderPickedCards() {

  const container =
    document.getElementById(
      "picked-cards"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (
    deck.length === 0
  ) {

    const empty =
      document.createElement("div");


    empty.className =
      "picked-empty";


    empty.textContent =
      "選択したカードがここに表示されます";


    container.appendChild(empty);

    return;

  }


  const groupedCards =
    getGroupedDeck();


  groupedCards.forEach(group => {

    const card =
      group.card;

    const count =
      group.count;


    const wrapper =
      document.createElement("div");


    wrapper.className =
      "picked-card";


    wrapper.title =
      `${card.name} ×${count}`;


    const image =
      document.createElement("img");


    image.src =
      imagePath(card);


    image.alt =
      card.name;


    image.loading =
      "lazy";


    image.addEventListener(
      "error",
      () => {

        image.style.visibility =
          "hidden";

      }
    );


    wrapper.appendChild(image);


    wrapper.appendChild(
      createFrameName(card)
    );


    const countElement =
      document.createElement("div");


    countElement.className =
      "picked-card-count";


    countElement.textContent =
      `×${count}`;


    wrapper.appendChild(
      countElement
    );


    wrapper.addEventListener(
      "click",
      () => {

        openCardModal(card);

      }
    );


    container.appendChild(
      wrapper
    );

  });

}


/* =========================================================
   DETAIL HELPERS
========================================================= */

function getCardDetail(card) {

  if (!card) {
    return null;
  }


  return (
    cardDetails[
      String(card.id)
    ]
    ||
    null
  );

}


function hasValue(value) {

  return (
    value !== undefined
    &&
    value !== null
    &&
    value !== ""
  );

}


function normalizeAbility(text) {

  if (!text) {
    return "";
  }


  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

}


/* =========================================================
   BUILD DETAIL DESCRIPTION
========================================================= */

function buildCardDescription(
  card,
  detail
) {

  if (!detail) {

    return (
      "このカードの詳細データを取得できませんでした。"
    );

  }


  const type =
    detail.type
    ||
    card.type
    ||
    "";


  const ability =
    normalizeAbility(
      detail.ability
    );


  const evolvedAbility =
    normalizeAbility(
      detail.evolved_ability
    );


  /* =====================================================
     FOLLOWER
  ===================================================== */

  if (type === "フォロワー") {

    const attack =
      hasValue(detail.attack)
        ? detail.attack
        : "?";


    const defense =
      hasValue(detail.defense)
        ? detail.defense
        : "?";


    const evoAttack =
      hasValue(detail.evolved_attack)
        ? detail.evolved_attack
        : "?";


    const evoDefense =
      hasValue(detail.evolved_defense)
        ? detail.evolved_defense
        : "?";


    const normalText =
      ability
      ||
      "能力なし";


    const evoText =
      evolvedAbility
      ||
      "能力なし";


    return (
      "【進化前】\n"
      +
      `攻撃力 ${attack} / 体力 ${defense}\n\n`
      +
      normalText
      +
      "\n\n"
      +
      "【進化後】\n"
      +
      `攻撃力 ${evoAttack} / 体力 ${evoDefense}\n\n`
      +
      evoText
    );

  }


  /* =====================================================
     SPELL / AMULET / OTHER
  ===================================================== */

  return (
    ability
    ||
    "能力なし"
  );

}


/* =========================================================
   CARD MODAL
========================================================= */

function openCardModal(card) {

  const modal =
    document.getElementById(
      "card-modal"
    );


  if (!modal) {
    return;
  }


  const detail =
    getCardDetail(card);


  const image =
    document.getElementById(
      "modal-card-image"
    );


  const name =
    document.getElementById(
      "modal-card-name"
    );


  const meta =
    document.getElementById(
      "modal-card-meta"
    );


  const description =
    document.getElementById(
      "modal-card-description"
    );


  const portalLink =
    document.getElementById(
      "portal-link"
    );


  /* -------------------------
     IMAGE
  ------------------------- */

  if (image) {

    image.src =
      imagePath(card);


    image.alt =
      card.name;

  }


  /* -------------------------
     NAME
  ------------------------- */

  if (name) {

    name.textContent =
      card.name;

  }


  /* -------------------------
     META
  ------------------------- */

  if (meta) {

    const tribe =
      detail?.tribe
      &&
      detail.tribe !== "-"
        ? ` / ${escapeHTML(detail.tribe)}`
        : "";


    meta.innerHTML =
      `<strong>${escapeHTML(String(card.cost))}コスト</strong>`
      +
      "<br>"
      +
      `${escapeHTML(card.class)} / ${escapeHTML(card.type)}${tribe}`
      +
      "<br>"
      +
      `${escapeHTML(card.rarity)} / ${escapeHTML(card.pack)}`;

  }


  /* -------------------------
     ABILITY
  ------------------------- */

  if (description) {

    description.textContent =
      buildCardDescription(
        card,
        detail
      );

  }


  /* -------------------------
     PORTAL
  ------------------------- */

  if (portalLink) {

    /*
      Search fallback.
      This avoids depending on an
      unverified direct card URL format.
    */

    const searchQuery =
      encodeURIComponent(
        `site:shadowverse-portal.com/card ${card.name}`
      );


    portalLink.href =
      `https://www.google.com/search?q=${searchQuery}`;


    portalLink.textContent =
      "Shadowverse Portalで確認";

  }


  modal.classList.add("open");


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeCardModal() {

  const modal =
    document.getElementById(
      "card-modal"
    );


  if (!modal) {
    return;
  }


  modal.classList.remove(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";

}


/* =========================================================
   RESULT
   Shadowverse-style 2-row deck
========================================================= */

function showResult() {

  closeCardModal();


  showScreen(
    "result-screen"
  );


  setText(
    "result-environment",
    `${selectedEnvironmentCode} - ${getEnvironmentName(
      selectedEnvironmentCode
    )}`
  );


  setText(
    "result-class",
    `${selectedClass} / ${deck.length}枚`
  );


  const grid =
    document.getElementById(
      "deck-grid"
    );


  if (!grid) {
    return;
  }


  grid.innerHTML = "";


  /*
    同名カードをまとめる。
    getGroupedDeck() 側ですでに
    cost → name 順にソートされている。
  */

  const groupedCards =
    getGroupedDeck();


  groupedCards.forEach(group => {

    const card =
      group.card;


    const count =
      group.count;


    /* -------------------------
       CARD
    ------------------------- */

    const wrapper =
      document.createElement("div");


    wrapper.className =
      "result-deck-card";


    wrapper.title =
      `${card.name} ×${count}`;


    /* -------------------------
       IMAGE
    ------------------------- */

    const image =
      document.createElement("img");


    image.className =
      "result-deck-image";


    image.src =
      imagePath(card);


    image.alt =
      card.name;


    image.loading =
      "lazy";


    image.addEventListener(
      "error",
      () => {

        image.style.visibility =
          "hidden";

      }
    );


    wrapper.appendChild(
      image
    );


    /* -------------------------
       NAME PLATE
    ------------------------- */

    wrapper.appendChild(
      createFrameName(card)
    );


    /* -------------------------
       COPY COUNT
    ------------------------- */

    const countElement =
      document.createElement("div");


    countElement.className =
      "result-deck-count";


    countElement.textContent =
      `× ${count}`;


    wrapper.appendChild(
      countElement
    );


    /* -------------------------
       CLICK -> DETAIL
    ------------------------- */

    wrapper.addEventListener(
      "click",
      () => {

        openCardModal(card);

      }
    );


    grid.appendChild(
      wrapper
    );

  });

}

/* =========================================================
   RESTART
========================================================= */

function restartGame() {

  closeCardModal();


  selectedClass = null;

  currentPick = 0;

  deck = [];

  currentLeft = [];
  currentRight = [];

  pickLocked = false;


  updateDraftStatus();


  showScreen(
    "start-screen"
  );

}


/* =========================================================
   SELECT BUTTON STATE
========================================================= */

function setSelectButtonsDisabled(
  disabled
) {

  const left =
    document.getElementById(
      "left-select-button"
    );


  const right =
    document.getElementById(
      "right-select-button"
    );


  if (left) {
    left.disabled = disabled;
  }


  if (right) {
    right.disabled = disabled;
  }

}


/* =========================================================
   HELPERS
========================================================= */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

  }

}


function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

  const startButton =
    document.getElementById(
      "start-button"
    );


  const leftButton =
    document.getElementById(
      "left-select-button"
    );
  
 const randomLeaderModeButton =
  document.getElementById(
    "random-leader-mode"
  );


const freeLeaderModeButton =
  document.getElementById(
    "free-leader-mode"
  );


  const rightButton =
    document.getElementById(
      "right-select-button"
    );


  const restartButton =
    document.getElementById(
      "restart-button"
    );


  const modalClose =
    document.getElementById(
      "card-modal-close"
    );


  const modalBackdrop =
    document.getElementById(
      "card-modal-backdrop"
    );


  if (startButton) {

    startButton.addEventListener(
      "click",
      startGame
    );

  }


  if (leftButton) {

    leftButton.addEventListener(
      "click",
      () => {

        choosePair(
          currentLeft
        );

      }
    );

  }


  if (rightButton) {

    rightButton.addEventListener(
      "click",
      () => {

        choosePair(
          currentRight
        );

      }
    );

  }


  if (restartButton) {

    restartButton.addEventListener(
      "click",
      restartGame
    );

  }


  if (modalClose) {

    modalClose.addEventListener(
      "click",
      closeCardModal
    );

  }


  if (modalBackdrop) {

    modalBackdrop.addEventListener(
      "click",
      closeCardModal
    );

  }
/* =====================================================
   LEADER SELECT MODE
===================================================== */

if (randomLeaderModeButton) {

  randomLeaderModeButton.addEventListener(
    "click",
    () => {

      leaderSelectMode =
        "random";


      randomLeaderModeButton
        .classList
        .add(
          "selected"
        );


      if (freeLeaderModeButton) {

        freeLeaderModeButton
          .classList
          .remove(
            "selected"
          );

      }

    }
  );

}


if (freeLeaderModeButton) {

  freeLeaderModeButton.addEventListener(
    "click",
    () => {

      leaderSelectMode =
        "free";


      freeLeaderModeButton
        .classList
        .add(
          "selected"
        );


      if (
        randomLeaderModeButton
      ) {

        randomLeaderModeButton
          .classList
          .remove(
            "selected"
          );

      }

    }
  );

}

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        closeCardModal();

      }

    }
  );

}


/* =========================================================
   BOOT
========================================================= */

initialize();