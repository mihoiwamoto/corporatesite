/*
 * floating-lines.js
 * React Bits「FloatingLines」(Three.js シェーダ) をバニラJSに移植したサイト共通背景。
 *
 * - 静的HTML / 将来WP移植を想定し、three は CDN の ESM を直import（importmap不要）。
 * - 元コンポーネントは「黒地に発光ライン＋mix-blend-mode:screen」で暗背景向け。
 *   本サイトは白基調のため、フラグメントシェーダの出力を【アルファ出力】に変更し、
 *   白地にブランドカラー（ピンク/グリーン）のラインが薄く乗るようにしている。
 * - 固定の全画面キャンバスを最背面付近（CSS: .floating-lines-bg / z-index:-2）に敷く。
 * - prefers-reduced-motion: reduce のときは1フレームだけ描画してアニメ停止。
 * - タブ非表示中・WebGL非対応時は描画を止める/敷かない（負荷・堅牢性配慮）。
 * - 設定は window.FLOATING_LINES_CONFIG で上書き可（WP移植時のテーマ側調整用）。
 *
 * 起動: header.js が全ページで動的に <script type="module"> として読み込む。
 */
import {
  Clock,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const DEFAULTS = {
  enabledWaves: ['top', 'middle', 'bottom'],
  lineCount: 3, // wave毎の本数（number または [top,middle,bottom]）
  lineDistance: [8, 6, 4], // wave毎の間隔
  topWavePosition: undefined,
  middleWavePosition: undefined,
  bottomWavePosition: { x: 2.0, y: -0.7, rotate: -1 },
  animationSpeed: 0.7, // 落ち着いた速度
  interactive: false, // サイト背景はマウス追従オフ
  bendRadius: 5.0,
  bendStrength: -0.5,
  mouseDamping: 0.05,
  parallax: true,
  parallaxStrength: 0.2,
  // ブランドカラー：ピンク↔グリーン（白地で暗く見えないよう明るめ・グレーは使わない）
  linesGradient: ['#E07898', '#1FAE64', '#E07898'],
  opacity: 0.4, // 線の濃さ（0=見えない 〜 1=濃い）。multiply合成での色の乗り具合。
  lighten: 0.2 // ベース色の白寄せ量（大きいほど淡い色）
};

const cfg = Object.assign({}, DEFAULTS, (typeof window !== 'undefined' && window.FLOATING_LINES_CONFIG) || {});

const MAX_GRADIENT_STOPS = 8;

const vertexShader = `
precision highp float;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

uniform float uOpacity;
uniform float uLighten; // 表示色を白方向へ寄せて明るく（0=そのまま, 1=白）

const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);
  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;
  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }
  vec3 gradientColor;
  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);
    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];
    gradientColor = mix(c1, c2, f);
  }
  return gradientColor * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;
  float x_offset   = offset;
  float x_movement = time * 0.1;
  float amp        = sin(offset + time * 0.2) * 0.3;
  float y          = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  if (parallax) {
    baseUv += parallaxOffset;
  }

  float m = 0.0; // 線の強さ（グレースケール）。色は付けず強さだけ足す＝重なってもグレーに濁らない。

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      m += wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi, baseUv, mouseUv, interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      m += wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi, baseUv, mouseUv, interactive
      );
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      m += wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi, baseUv, mouseUv, interactive
      ) * 0.1;
    }
  }

  // 色は「画面の位置」で決める（左上=色A / 右下=色B）。multiply合成なので重なってもグレーに濁らない。
  vec3 cA = lineGradientCount > 0 ? lineGradient[0] : vec3(0.88, 0.39, 0.49);
  vec3 cB = lineGradientCount > 1 ? lineGradient[1] : vec3(0.10, 0.62, 0.34);
  float g = clamp(0.5 + 0.45 * (baseUv.x - baseUv.y), 0.0, 1.0);
  vec3 hue = mix(cA, cB, g);
  hue = mix(hue, vec3(1.0), uLighten); // ベース色をやや白寄せして淡いパステルに

  fragColor = vec4(hue, m); // rgb=クリーンな色, a=線の強さ（main で白地に合成）
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);

  // 白地に重ねる：色は位置ベースのクリーンな色、強さ(m)をアルファに。
  // three 既定の premultipliedAlpha:true に合わせ、RGBはアルファ事前乗算で出力。
  vec3 hue = color.rgb;
  float m = color.a;
  float strength = clamp(m, 0.0, 1.0) * uOpacity; // 0=白(変化なし) … 1=色
  vec3 outc = mix(vec3(1.0), hue, strength);       // 白→色（CSS multiply で背景に乗る）
  gl_FragColor = vec4(outc, 1.0);                  // 不透明
}
`;

function hexToVec3(hex) {
  let value = String(hex).trim();
  if (value.startsWith('#')) value = value.slice(1);
  let r = 255, g = 255, b = 255;
  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }
  return new Vector3(r / 255, g / 255, b / 255);
}

const enabledWaves = cfg.enabledWaves;
const lineCount = cfg.lineCount;
const lineDistance = cfg.lineDistance;

function getLineCount(waveType) {
  if (typeof lineCount === 'number') return lineCount;
  if (!enabledWaves.includes(waveType)) return 0;
  const index = enabledWaves.indexOf(waveType);
  return lineCount[index] ?? 6;
}

function getLineDistance(waveType) {
  if (typeof lineDistance === 'number') return lineDistance;
  if (!enabledWaves.includes(waveType)) return 0.1;
  const index = enabledWaves.indexOf(waveType);
  return lineDistance[index] ?? 0.1;
}

const topLineCount = enabledWaves.includes('top') ? getLineCount('top') : 0;
const middleLineCount = enabledWaves.includes('middle') ? getLineCount('middle') : 0;
const bottomLineCount = enabledWaves.includes('bottom') ? getLineCount('bottom') : 0;

const topLineDistance = enabledWaves.includes('top') ? getLineDistance('top') * 0.01 : 0.01;
const middleLineDistance = enabledWaves.includes('middle') ? getLineDistance('middle') * 0.01 : 0.01;
const bottomLineDistance = enabledWaves.includes('bottom') ? getLineDistance('bottom') * 0.01 : 0.01;

function init() {
  if (document.querySelector('.floating-lines-bg')) return; // 二重起動防止

  const reduce =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const container = document.createElement('div');
  container.className = 'floating-lines-bg';
  container.setAttribute('aria-hidden', 'true');
  // mix-blend-mode は白地では normal（screenだと消えるため使わない）
  container.style.mixBlendMode = 'multiply';
  document.body.appendChild(container);

  let renderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: false });
  } catch (e) {
    container.remove(); // WebGL非対応：CSS背景のみで成立
    return;
  }
  renderer.setClearColor(0xffffff, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  camera.position.z = 1;

  const top = cfg.topWavePosition;
  const mid = cfg.middleWavePosition;
  const bot = cfg.bottomWavePosition || {};

  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new Vector3(1, 1, 1) },
    animationSpeed: { value: cfg.animationSpeed },

    enableTop: { value: enabledWaves.includes('top') },
    enableMiddle: { value: enabledWaves.includes('middle') },
    enableBottom: { value: enabledWaves.includes('bottom') },

    topLineCount: { value: topLineCount },
    middleLineCount: { value: middleLineCount },
    bottomLineCount: { value: bottomLineCount },

    topLineDistance: { value: topLineDistance },
    middleLineDistance: { value: middleLineDistance },
    bottomLineDistance: { value: bottomLineDistance },

    topWavePosition: {
      value: new Vector3(top?.x ?? 10.0, top?.y ?? 0.5, top?.rotate ?? -0.4)
    },
    middleWavePosition: {
      value: new Vector3(mid?.x ?? 5.0, mid?.y ?? 0.0, mid?.rotate ?? 0.2)
    },
    bottomWavePosition: {
      value: new Vector3(bot?.x ?? 2.0, bot?.y ?? -0.7, bot?.rotate ?? 0.4)
    },

    iMouse: { value: new Vector2(-1000, -1000) },
    interactive: { value: cfg.interactive },
    bendRadius: { value: cfg.bendRadius },
    bendStrength: { value: cfg.bendStrength },
    bendInfluence: { value: 0 },

    parallax: { value: cfg.parallax },
    parallaxStrength: { value: cfg.parallaxStrength },
    parallaxOffset: { value: new Vector2(0, 0) },

    lineGradient: {
      value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1))
    },
    lineGradientCount: { value: 0 },

    uOpacity: { value: cfg.opacity },
    uLighten: { value: cfg.lighten }
  };

  if (cfg.linesGradient && cfg.linesGradient.length > 0) {
    const stops = cfg.linesGradient.slice(0, MAX_GRADIENT_STOPS);
    uniforms.lineGradientCount.value = stops.length;
    stops.forEach((hex, i) => {
      const c = hexToVec3(hex);
      uniforms.lineGradient.value[i].set(c.x, c.y, c.z);
    });
  }

  const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true });
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const clock = new Clock();

  const targetMouse = new Vector2(-1000, -1000);
  const currentMouse = new Vector2(-1000, -1000);
  let targetInfluence = 0;
  let currentInfluence = 0;
  const targetParallax = new Vector2(0, 0);
  const currentParallax = new Vector2(0, 0);

  const setSize = () => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    renderer.setSize(w, h, false);
    uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
  };
  setSize();

  const onResize = () => setSize();
  window.addEventListener('resize', onResize);

  const onPointerMove = event => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    if (cfg.interactive) {
      const dpr = renderer.getPixelRatio();
      targetMouse.set(event.clientX * dpr, (h - event.clientY) * dpr);
      targetInfluence = 1.0;
    }
    if (cfg.parallax) {
      const offsetX = (event.clientX - w / 2) / w;
      const offsetY = -(event.clientY - h / 2) / h;
      targetParallax.set(offsetX * cfg.parallaxStrength, offsetY * cfg.parallaxStrength);
    }
  };
  const onPointerLeave = () => { targetInfluence = 0.0; };

  if (cfg.interactive || cfg.parallax) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  }

  const drawFrame = () => {
    uniforms.iTime.value = clock.getElapsedTime();
    if (cfg.interactive) {
      currentMouse.lerp(targetMouse, cfg.mouseDamping);
      uniforms.iMouse.value.copy(currentMouse);
      currentInfluence += (targetInfluence - currentInfluence) * cfg.mouseDamping;
      uniforms.bendInfluence.value = currentInfluence;
    }
    if (cfg.parallax) {
      currentParallax.lerp(targetParallax, cfg.mouseDamping);
      uniforms.parallaxOffset.value.copy(currentParallax);
    }
    renderer.render(scene, camera);
  };

  // reduced-motion：1フレームだけ描いて停止
  if (reduce) {
    drawFrame();
    return;
  }

  let raf = 0;
  let running = false;
  const loop = () => {
    if (!running) return;
    drawFrame();
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  // タブ非表示中は停止して負荷を下げる
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
