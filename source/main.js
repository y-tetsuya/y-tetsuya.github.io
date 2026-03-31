"use strict";

/* =========================
   Shared helpers
========================= */
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/* =========================
   Mobile menu
   - 開閉状態の一元管理
   - リンククリック / オーバーレイ / ESC で閉じる
========================= */
const hamburger = qs("#hamburger");
const sideMenu = qs("#sideMenu");
const overlay = qs("#overlay");

if (hamburger && sideMenu && overlay) {
  const setMenuState = (isOpen) => {
    hamburger.classList.toggle("active", isOpen);
    sideMenu.classList.toggle("active", isOpen);
    overlay.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  };

  hamburger.addEventListener("click", () => {
    const isOpen = !hamburger.classList.contains("active");
    setMenuState(isOpen);
  });

  overlay.addEventListener("click", () => setMenuState(false));

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
   Fade-in animation
   - 画面に入ったら一度だけ show を付与
========================= */
const fadeUpElements = qsa(".fade-up");

if (fadeUpElements.length && "IntersectionObserver" in window) {
  const fadeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  fadeUpElements.forEach((element) => fadeObserver.observe(element));
} else {
  fadeUpElements.forEach((element) => element.classList.add("show"));
}

/* =========================
   Concept hover panel
   - classList[1] 依存をやめ、data-key で安全に参照
========================= */
const infoPanel = qs("#concept-info-panel");
const infoTitle = qs("#info-title");
const infoKeywords = qs("#info-keywords");
const infoPurpose = qs("#info-purpose");

const conceptContentMap = {
  cognition: {
    title: "Cognition｜認知層",
    keywords: "理解・意味形成・接地・予測",
    purpose: "人はどのように世界を理解し、意味を構造化し、他者と共通基盤を形成するのかを解明する"
  },
  interaction: {
    title: "Interaction｜相互作用層",
    keywords: "共同注意・接地・調整・協調",
    purpose: "人と人がどのように関係を形成し、意図をすり合わせ、共創行為が生まれるのかを解明する"
  },
  society: {
    title: "Society｜社会層",
    keywords: "社会的文脈・規範・言語・慣習",
    purpose: "社会構造や文化が意味形成と意図共有にどのような影響を与えるかを解明する"
  },
  humanai: {
    title: "Human–AI Co-Creation｜拡張層",
    keywords: "Human–Agent Interaction / AI as Tool・Partner・Other / 拡張認知 / 意図帰属",
    purpose: "人はAIをどのような存在として捉え、どのように意味・意図・関係性を形成するのかを探究する"
  },
  core: {
    title: "Shared Intentionality｜意図共有",
    keywords: "共通基盤・共同志向性・目的共有・意図調整",
    purpose: "すべての認知・相互作用・社会構造の起点となる中核構造"
  }
};

if (infoPanel && infoTitle && infoKeywords && infoPurpose) {
  qsa(".hover-layer[data-key]").forEach((layer) => {
    const showPanel = () => {
      const key = layer.dataset.key;
      const data = conceptContentMap[key];
      if (!data) return;

      infoTitle.textContent = data.title;
      infoKeywords.textContent = `キーワード： ${data.keywords}`;
      infoPurpose.textContent = `目的： ${data.purpose}`;
      infoPanel.classList.add("active");
    };

    const hidePanel = () => {
      infoPanel.classList.remove("active");
    };

    layer.addEventListener("mouseenter", showPanel);
    layer.addEventListener("mouseleave", hidePanel);
  });
}

/* =========================
   Concept sticky box
   - セクションが見えている間だけ表示
========================= */
const conceptSection = qs("#concept");
const conceptStickyBox = qs("#concept-sticky-box");

if (conceptSection && conceptStickyBox) {
  const toggleConceptSticky = () => {
    const rect = conceptSection.getBoundingClientRect();
    const isVisible = rect.top <= 100 && rect.bottom >= 200;
    conceptStickyBox.classList.toggle("active", isVisible);
  };

  toggleConceptSticky();
  window.addEventListener("scroll", toggleConceptSticky, { passive: true });
  window.addEventListener("resize", toggleConceptSticky);
}

/* =========================
   Research hover tooltip
   - ノードごとの内容表示
   - 画面外にはみ出しにくい位置補正付き
========================= */
const tooltip = qs("#research-tooltip");
const rtTitle = qs("#rt-title");
const rtKeywords = qs("#rt-keywords");
const rtDesc = qs("#rt-desc");

const researchContentMap = {
  core: {
    title: "Shared Intentionality｜意図共有",
    keywords: "共通基盤・共同志向性・目的共有・意図調整",
    desc: "すべての認知・相互作用・社会構造の起点となる中核構造。意味・理解・協調・共創の根源的メカニズム"
  },
  phenomena: {
    title: "Phenomena｜現象",
    keywords: "Communication / Cooperation / Meaning / Misunderstanding / Human–AI Interaction",
    desc: "人間・人間、また人間・AIの相互作用の中で観察されるコミュニケーション現象"
  },
  structures: {
    title: "Structures｜構造",
    keywords: "Grounding / Joint Attention / Context / Norms / Prediction",
    desc: "意味形成と理解が成立するための基盤構造と社会的・認知的枠組み"
  },
  mechanisms: {
    title: "Mechanisms｜メカニズム",
    keywords: "Intent Attribution / Coordination Dynamics / Shared Intentionality",
    desc: "意図共有・協調・共創が生まれる動的プロセスの構成原理"
  },
  methodology: {
    title: "Methodology｜方法論",
    keywords: "Cognitive Science / Experimental Psychology / Experimental Pragmatics / HAI Experiments",
    desc: "理論・実験・設計・モデル化を統合した横断的研究方法論"
  }
};

if (tooltip && rtTitle && rtKeywords && rtDesc) {
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

  qsa(".research-node[data-key]").forEach((node) => {
    const showTooltip = (event) => {
      const key = node.dataset.key;
      const data = researchContentMap[key];
      if (!data) return;

      rtTitle.textContent = data.title;
      rtKeywords.textContent = `Keywords: ${data.keywords}`;
      rtDesc.textContent = data.desc;
      tooltip.classList.add("active");
      positionTooltip(event);
    };

    const hideTooltip = () => {
      tooltip.classList.remove("active");
    };

    node.addEventListener("mouseenter", showTooltip);
    node.addEventListener("mousemove", positionTooltip);
    node.addEventListener("mouseleave", hideTooltip);
  });
}


