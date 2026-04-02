"use strict";

/* =========================
   DOM helpers
========================= */
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/* =========================
   Shared UI helpers
========================= */
const setText = (element, text) => {
  if (element) element.textContent = text;
};

const toggleClass = (element, className, shouldAdd) => {
  if (element) element.classList.toggle(className, shouldAdd);
};

/* =========================
   Mobile menu
   - 開閉状態の一元管理
   - リンククリック / オーバーレイ / ESC で閉じる
========================= */
const menuButton = qs("#hamburger");
const sideMenu = qs("#sideMenu");
const pageOverlay = qs("#overlay");

if (menuButton && sideMenu && pageOverlay) {
  const setMenuState = (isOpen) => {
    toggleClass(menuButton, "active", isOpen);
    toggleClass(sideMenu, "active", isOpen);
    toggleClass(pageOverlay, "active", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  };

  menuButton.addEventListener("click", () => {
    const isOpen = !menuButton.classList.contains("active");
    setMenuState(isOpen);
  });

  pageOverlay.addEventListener("click", () => setMenuState(false));

  qsa(".side-menu a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });
}

/* =========================
   Reveal animation
   - 画面に入ったら一度だけ表示
   - 旧 class(.fade-up) と新 class(.reveal-up) の両方に対応
========================= */
const revealElements = qsa(".fade-up, .reveal-up");

if (revealElements.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      const isRepeatTarget = entry.target.classList.contains("hero-repeat");

      if (entry.isIntersecting) {
        entry.target.classList.add("show", "is-visible");

        // Hero以外は一度だけ
        if (!isRepeatTarget) {
          obs.unobserve(entry.target);
        }
      } else {
        // Heroだけ画面外に出たら外す
        if (isRepeatTarget) {
          entry.target.classList.remove("show", "is-visible");
        }
      }
    });
  }, { threshold: 0.2 });

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("show", "is-visible"));
}

/* =========================
   Hover panel helpers
   - 固定パネル表示用
   - フローティングツールチップ表示用
========================= */
const bindStaticHoverPanel = ({
  triggerSelector,
  contentMap,
  panel,
  render,
  activeClass = "active"
}) => {
  if (!panel) return;

  const showPanel = (data) => {
    render(data);
    panel.classList.add(activeClass);
  };

  const hidePanel = () => {
    panel.classList.remove(activeClass);
  };

  qsa(triggerSelector).forEach((node) => {
    node.addEventListener("mouseenter", () => {
      const key = node.dataset.key;
      const data = contentMap[key];
      if (!data) return;
      showPanel(data);
    });

    node.addEventListener("mouseleave", hidePanel);
  });
};

const bindFloatingTooltip = ({
  triggerSelector,
  contentMap,
  tooltip,
  render,
  activeClass = "active"
}) => {
  if (!tooltip) return;

  const positionTooltip = (event) => {
    const offset = 18;
    const maxPadding = 16;
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = event.clientX + offset;
    let top = event.clientY + offset;

    if (left + tooltipRect.width > window.innerWidth - maxPadding) {
      left = window.innerWidth - tooltipRect.width - maxPadding;
    }

    if (top + tooltipRect.height > window.innerHeight - maxPadding) {
      top = window.innerHeight - tooltipRect.height - maxPadding;
    }

    tooltip.style.left = `${Math.max(maxPadding, left)}px`;
    tooltip.style.top = `${Math.max(maxPadding, top)}px`;
  };

  const hideTooltip = () => {
    tooltip.classList.remove(activeClass);
  };

  qsa(triggerSelector).forEach((node) => {
    node.addEventListener("mouseenter", (event) => {
      const key = node.dataset.key;
      const data = contentMap[key];
      if (!data) return;

      render(data);
      tooltip.classList.add(activeClass);
      positionTooltip(event);
    });

    node.addEventListener("mousemove", positionTooltip);
    node.addEventListener("mouseleave", hideTooltip);
  });
};

/* =========================
   Concept hover panel
   - data-key に応じて固定情報パネルを表示
========================= */
const conceptInfoPanel = qs("#concept-info-panel");
const conceptInfoTitle = qs("#info-title");
const conceptInfoKeywords = qs("#info-keywords");
const conceptInfoPurpose = qs("#info-purpose");

const conceptContentMap = {
  "shared-intentionality": {
    title: "Shared Intentionality｜意図共有",
    keywords: "共通基盤・共同志向性・目的共有・意図調整",
    purpose: "すべての認知・相互作用・社会構造の起点となる中核構造"
  },
  "cognition": {
    title: "Cognition｜認知層",
    keywords: "理解・意味形成・接地・予測",
    purpose: "人はどのように世界を理解し、意味を構造化し、他者と共通基盤を形成するのかを解明する"
  },
  "interaction": {
    title: "Interaction｜相互作用層",
    keywords: "共同注意・接地・調整・協調",
    purpose: "人と人がどのように関係を形成し、意図をすり合わせ、共創行為が生まれるのかを解明する"
  },
  "society": {
    title: "Society｜社会層",
    keywords: "社会的文脈・規範・言語・慣習",
    purpose: "社会構造や文化が意味形成と意図共有にどのような影響を与えるかを解明する"
  },
  "human-ai": {
    title: "Human–AI Co-Creation｜拡張層",
    keywords: "Human–Agent Interaction / AI as Tool・Partner・Other / 拡張認知 / 意図帰属",
    purpose: "人はAIをどのような存在として捉え、どのように意味・意図・関係性を形成するのかを探究する"
  }

};


bindStaticHoverPanel({
  triggerSelector: ".hover-layer[data-key]",
  contentMap: conceptContentMap,
  panel: conceptInfoPanel,
  render: (data) => {
    setText(conceptInfoTitle, data.title);
    setText(conceptInfoKeywords, `キーワード： ${data.keywords}`);
    setText(conceptInfoPurpose, `目的： ${data.purpose}`);
  }
});

/* =========================
   Concept sticky box
   - セクションが見えている間だけ表示
========================= */
const conceptSection = qs("#concept");
const conceptStickyBox = qs("#concept-sticky-box");

if (conceptSection && conceptStickyBox) {
  const syncConceptStickyState = () => {
    const rect = conceptSection.getBoundingClientRect();
    const isVisible = rect.top <= 100 && rect.bottom >= 200;
    toggleClass(conceptStickyBox, "active", isVisible);
  };

  syncConceptStickyState();
  window.addEventListener("scroll", syncConceptStickyState, { passive: true });
  window.addEventListener("resize", syncConceptStickyState);
}

/* =========================
   Research hover tooltip
   - ノードごとの内容表示
   - 画面外にはみ出しにくい位置補正付き
========================= */
const researchTooltip = qs("#research-tooltip");
const researchTooltipTitle = qs("#rt-title");
const researchTooltipKeywords = qs("#rt-keywords");
const researchTooltipDescription = qs("#rt-desc");

const researchContentMap = {
  "behavioral-experiments": {
    title: "Behavioral Experiments｜行動実験",
    keywords: "認知科学実験 / 実験計画法",
    desc: "本研究室では、すべての実験の起点となる手法です。人間のコミュニケーション活動を各要因から捉え直すことで現象を調べます。"
  },
  "multimodal-analysis": {
    title: "Multimodal Analysis｜マルチモーダル分析",
    keywords: "ジェスチャー / 視線 / 相互作用",
    desc: "人間・人間、また人間・AIの相互作用の中で観察されるコミュニケーション現象から意図を調べます。"
  },
  "applications": {
    title: "Developmental and Educational Applications｜発達・教育への応用",
    keywords: "発達 / 教育 / 共創社会",
    desc: "得られた発達や教育に関する知見がどのように影響するかを捉えます。"
  },
  "xr-environments": {
    title: "xR Environments｜クロス・リアリティ環境",
    keywords: "VR / AR / MR / ハイブリット環境",
    desc: "人間がどのように環境と相互作用しているのかを調べます。"
  },
  "human–agent-interaction": {
    title: "HAI｜ヒューマン エージェント インタラクション",
    keywords: "HAI / HRI / 人とAIの語用論",
    desc: "ヒューマン・エージェント・インタラクションにおいて、人間が対話者(エージェント)にどのような意図を推測するのかを調べます。"
  }
};

bindFloatingTooltip({
  triggerSelector: ".research-node[data-key]",
  contentMap: researchContentMap,
  tooltip: researchTooltip,
  render: (data) => {
    setText(researchTooltipTitle, data.title);
    setText(researchTooltipKeywords, `Keywords: ${data.keywords}`);
    setText(researchTooltipDescription, data.desc);
  }
});

/* =========================
   Publication panel
========================= */

const publicationNodes = document.querySelectorAll(".publication-node");
const publicationTitle = document.getElementById("publication-title");
const publicationCount = document.getElementById("publication-count");
const publicationBody = document.getElementById("publication-body");

const renderPublicationItems = (items) => {
  const sortedItems = [...items].sort((a, b) => Number(b.year) - Number(a.year));

  const listItems = sortedItems
    .map((item) => `
      <li class="publication-item">
        <span class="publication-year">${item.year}</span>
        <span class="publication-text">${item.text}</span>
      </li>
    `)
    .join("");

  return `<ol class="publication-list">${listItems}</ol>`;
};

const showPublicationPanel = (key) => {
  const data = publicationMap[key];
  if (!data) return;

  publicationNodes.forEach((node) => {
    node.classList.toggle("is-active", node.dataset.key === key);
  });

  publicationTitle.textContent = data.title;
  publicationCount.textContent = String(data.items.length);
  publicationBody.innerHTML = renderPublicationItems(data.items);
};

publicationNodes.forEach((node) => {
  const key = node.dataset.key;

  node.addEventListener("mouseenter", () => showPublicationPanel(key));
  node.addEventListener("focus", () => showPublicationPanel(key));
  node.addEventListener("click", () => showPublicationPanel(key));

  node.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showPublicationPanel(key);
    }
  });
});

/* 初期表示 */
showPublicationPanel("selected-paper");


