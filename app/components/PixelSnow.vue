<script setup lang="ts">
import type { Vector2, Vector3, WebGLRenderer } from 'three'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

// PixelSnow：像素风 3D 雪花飘落背景。着色器取自用户提供的官方源码（背景与验收标准见
// .scratch/wzry-draw/issues/11-pixelsnow-homepage-background.md），参数沿用官方默认值，
// 仅按深浅色调整颜色与亮度。
// 相对源码的三处改造：
//   1) three.js 懒加载（动态 import），不阻塞首屏；
//   2) prefers-reduced-motion: reduce 时不加载 three、不渲染；
//   3) WebGL 不可用或加载失败时静默降级为无背景（页面照常可用，不报错）。
interface Props {
  /** 雪花颜色。深色模式用白色；浅色模式必须换金色系，白雪花在浅底不可见 */
  color?: string
  /** 亮度系数。数值越低雪花越暗（浅色模式配合金色调低，显得更淡） */
  brightness?: number
}

const { color = '#ffffff', brightness = 1 } = defineProps<Props>()

const containerRef = useTemplateRef<HTMLDivElement>('snowRef')

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uFlakeSize;
uniform float uMinFlakeSize;
uniform float uPixelResolution;
uniform float uSpeed;
uniform float uDepthFade;
uniform float uFarPlane;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGamma;
uniform float uDensity;
uniform float uVariant;
uniform float uDirection;

#define M1 1597334677U
#define M2 3812015801U
#define M3 3299493293U
#define F0 (1.0/float(0xffffffffU))
#define hash(n) n*(n^(n>>15))
#define coord3(p) (uvec3(p).x*M1^uvec3(p).y*M2^uvec3(p).z*M3)

vec3 hash3(uint n) {
  return vec3(hash(n) * uvec3(0x1U, 0x1ffU, 0x3ffffU)) * F0;
}

float snowflakeDist(vec2 p) {
  float r = length(p);
  float a = atan(p.y, p.x);
  float PI = 3.14159265;
  a = abs(mod(a + PI / 6.0, PI / 3.0) - PI / 6.0);
  vec2 q = r * vec2(cos(a), sin(a));
  float dMain = abs(q.y);
  dMain = max(dMain, max(-q.x, q.x - 1.0));
  vec2 b1s = vec2(0.4, 0.0);
  vec2 b1d = vec2(0.574, 0.819);
  float b1t = clamp(dot(q - b1s, b1d), 0.0, 0.4);
  float dB1 = length(q - b1s - b1t * b1d);
  vec2 b2s = vec2(0.7, 0.0);
  float b2t = clamp(dot(q - b2s, b1d), 0.0, 0.25);
  float dB2 = length(q - b2s - b2t * b1d);
  return min(dMain, min(dB1, dB2)) * 10.0;
}

void main() {
  float pixelSize = max(1.0, floor(0.5 + uResolution.x / uPixelResolution));
  vec2 fragCoord = floor(gl_FragCoord.xy / pixelSize);
  vec2 res = uResolution / pixelSize;

  vec3 ray = normalize(vec3((fragCoord - res * 0.5) / res.x, 1.0));

  vec3 camK = normalize(vec3(1.0, 1.0, 1.0));
  vec3 camI = normalize(vec3(1.0, 0.0, -1.0));
  vec3 camJ = cross(camK, camI);
  ray = ray.x * camI + ray.y * camJ + ray.z * camK;

  float windX = cos(uDirection) * 0.4;
  float windY = sin(uDirection) * 0.4;
  vec3 camPos = (windX * camI + windY * camJ + 0.1 * camK) * uTime * uSpeed;
  vec3 pos = camPos;

  vec3 strides = 1.0 / max(abs(ray), vec3(0.001));
  vec3 phase = fract(pos) * strides;
  phase = mix(strides - phase, phase, step(ray, vec3(0.0)));

  float t = 0.0;
  for (int i = 0; i < 256; i++) {
    if (t >= uFarPlane) break;
    vec3 fpos = floor(pos);
    float cellHash = hash3(coord3(fpos)).x;

    if (cellHash < uDensity) {
      vec3 h = hash3(coord3(fpos));
      vec3 flakePos = 0.5 - 0.5 * cos(
        4.0 * sin(fpos.yzx * 0.073) +
        4.0 * sin(fpos.zxy * 0.27) +
        2.0 * h +
        uTime * uSpeed * 0.1 * vec3(7.0, 8.0, 5.0)
      );
      flakePos = flakePos * 0.8 + 0.1 + fpos;

      float toIntersection = dot(flakePos - pos, camK) / dot(ray, camK);
      if (toIntersection > 0.0) {
        vec3 testPos = pos + ray * toIntersection - flakePos;
        vec2 testUV = abs(vec2(dot(testPos, camI), dot(testPos, camJ)));
        float depth = dot(flakePos - camPos, camK);
        float flakeSize = max(uFlakeSize, uMinFlakeSize * depth * 0.5 / res.x);
        float dist;
        if (uVariant < 0.5) dist = max(testUV.x, testUV.y);
        else if (uVariant < 1.5) dist = length(testUV);
        else dist = snowflakeDist(vec2(dot(testPos, camI), dot(testPos, camJ)) / flakeSize) * flakeSize;

        if (dist < flakeSize) {
          float intensity = exp2(-(t + toIntersection) / uDepthFade) *
                           min(1.0, pow(uFlakeSize / flakeSize, 2.0)) * uBrightness;
          // 官方源码此处是 vec4(uColor * pow(intensity, gamma), 1.0)：远处雪花被「乘暗」。
          // 深色底上乘暗等于淡出，但浅色底上会变成一粒粒黑点（像脏点）。
          // 改用 alpha 承载衰减，配合下面材质的 NoBlending + premultipliedAlpha:false，
          // 合成结果正好是 uColor * a + 页面 * (1 - a)：深色底与官方观感一致，浅色底淡入背景。
          gl_FragColor = vec4(uColor, pow(intensity, uGamma));
          return;
        }
      }
    }

    float nextStep = min(min(phase.x, phase.y), phase.z);
    vec3 sel = step(phase, vec3(nextStep));
    phase = phase - nextStep + strides * sel;
    t += nextStep;
    pos = mix(pos + ray * nextStep, floor(pos + ray * nextStep + 0.5), sel);
  }

  gl_FragColor = vec4(0.0);
}
`

let cleanup: (() => void) | null = null
let restyle: ((next: { color: string, brightness: number }) => void) | null = null
let unmounted = false
// WebGL 探测结果整个页面加载期只需一次（探测本身会创建一个上下文，不宜反复创建）
let webglSupport: boolean | null = null

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function webglAvailable(): boolean {
  if (webglSupport !== null)
    return webglSupport
  try {
    const canvas = document.createElement('canvas')
    webglSupport = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  }
  catch {
    webglSupport = false
  }
  return webglSupport
}

async function mount() {
  const container = containerRef.value
  // 动效敏感或没有 WebGL 时直接不挂载（也就不会加载 three）
  if (!container || prefersReducedMotion() || !webglAvailable())
    return

  const { Color, Mesh, NoBlending, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } = await import('three')

  // three 是 500KB 级的独立 chunk，弱网下要等一会儿；这期间用户可能已经离开首页
  if (unmounted || containerRef.value !== container)
    return

  const renderer: WebGLRenderer = new WebGLRenderer({
    antialias: false,
    alpha: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  const initial = new Color(color)
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new Vector2(container.offsetWidth, container.offsetHeight) },
      // 以下均为官方默认参数，本项目不作调整
      uFlakeSize: { value: 0.01 },
      uMinFlakeSize: { value: 1.25 },
      uPixelResolution: { value: 200 },
      uSpeed: { value: 1.25 },
      uDepthFade: { value: 8 },
      uFarPlane: { value: 20 },
      uGamma: { value: 0.4545 },
      uDensity: { value: 0.3 },
      uVariant: { value: 0 }, // square
      uDirection: { value: (125 * Math.PI) / 180 },
      // 仅这两项按深浅色调整
      uColor: { value: new Vector3(initial.r, initial.g, initial.b) },
      uBrightness: { value: brightness },
    },
    transparent: true,
    // 全屏 quad 铺满整屏，不需要与清屏黑做混合；关掉混合后缓冲区就是纯直通 alpha，
    // 与 premultipliedAlpha:false 配合正好得到 uColor * a + 页面 * (1 - a)
    blending: NoBlending,
  })

  const geometry = new PlaneGeometry(2, 2)
  const scene = new Scene()
  scene.add(new Mesh(geometry, material))
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const handleResize = () => {
    const width = container.offsetWidth
    const height = container.offsetHeight
    renderer.setSize(width, height)
    ;(material.uniforms.uResolution!.value as Vector2).set(width, height)
  }
  window.addEventListener('resize', handleResize)

  // 换主题只改 uniform，不重建场景
  restyle = ({ color: nextColor, brightness: nextBrightness }) => {
    const rgb = new Color(nextColor)
    ;(material.uniforms.uColor!.value as Vector3).set(rgb.r, rgb.g, rgb.b)
    material.uniforms.uBrightness!.value = nextBrightness
  }

  let frame = 0
  cleanup = () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', handleResize)
    renderer.domElement.remove()
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    cleanup = null
    restyle = null
  }

  // 先备好 cleanup 再起循环：首帧渲染失败时也能被 onMounted 的 catch 回收
  const startTime = performance.now()
  const animate = () => {
    frame = requestAnimationFrame(animate)
    material.uniforms.uTime!.value = (performance.now() - startTime) * 0.001
    renderer.render(scene, camera)
  }
  animate()
}

watch([() => color, () => brightness], () => restyle?.({ color, brightness }))

onMounted(() => {
  mount().catch((error) => {
    // 静默降级：WebGL 上下文创建失败或 three 加载失败时不显示背景，页面完整可用
    cleanup?.()
    console.warn('[PixelSnow] 背景未启用：', error)
  })
})

onBeforeUnmount(() => {
  unmounted = true
  cleanup?.()
})
</script>

<template>
  <!-- 纯装饰层：不接收指针事件，也不进入无障碍树 -->
  <div ref="snowRef" class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
</template>
