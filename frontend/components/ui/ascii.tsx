import {
  BackgroundCanvas,
  type BackgroundCanvasProps,
} from "@/components/ui/background-canvas";

export interface AsciiProps
  extends Omit<
    BackgroundCanvasProps,
    | "atlas"
    | "colors"
    | "palettes"
    | "scene"
    | "simulation"
    | "still"
    | "uniforms"
  > {
  angle?: number;
  clearing?: number;
  color?: string;
  colors?: string[];
  contrast?: number;
  detail?: number;
  glyphs?: string;
  intensity?: number;
  scale?: number;
  seed?: number;
  size?: number;
  variant?: "clouds" | "waves" | "rings";
}

const DEFAULT_GLYPHS = " .:;+*x%#@";

const SCENE = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uColors[8];
uniform int uColorsCount;
uniform float uHasPalette;
uniform float uAngle;
uniform float uClearing;
uniform float uContrast;
uniform float uDetail;
uniform float uIntensity;
uniform float uScale;
uniform float uSeed;
uniform float uSize;
uniform float uVariant;

vec4 scene(vec2 frag) {
  vec2 cellSize = vec2(uSize * 0.6, uSize) * uPixelRatio;
  vec2 cell = floor(frag / cellSize);
  vec2 cellCenter = (cell + 0.5) * cellSize;
  vec2 inCell = (frag - cell * cellSize) / cellSize;

  vec2 p = (cellCenter - 0.5 * uResolution) / uPixelRatio;

  float t = uTime;
  float field = 0.0;

  if (uVariant < 0.5) {
    float rad = radians(uAngle);
    vec2 rp = rotate(rad) * p * (uScale * 0.0035);
    float wave = sin(rp.y * 3.5 + t * 0.6);
    float n1 = snoise(rp * 1.5 + vec2(t * 0.15, -t * 0.1) + uSeed * 3.7);
    float n2 = snoise(rp * 3.2 - t * 0.3) * uDetail;
    field = wave * 0.45 + 0.5 + n1 * 0.28 + n2 * 0.18;
  } else if (uVariant < 1.5) {
    vec2 cp = p * (uScale * 0.0028);
    float n1 = snoise(cp + vec2(t * 0.12, t * 0.08) + uSeed * 11.3);
    float n2 = snoise(cp * 2.2 - vec2(t * 0.08, t * 0.12) + 5.1) * uDetail;
    field = (n1 * 0.6 + n2 * 0.4) * 0.5 + 0.5;
  } else {
    float r = length(p) * (uScale * 0.018);
    float ring = sin(r - t * 1.8);
    float n = snoise(p * 0.006 + uSeed * 7.1) * uDetail;
    field = ring * 0.4 + 0.5 + n * 0.25;
  }

  if (uPointer.z > 0.01) {
    float pDist = length(cellCenter - uPointer.xy) / uPixelRatio;
    float ptrGlow = exp(-pDist * pDist / (2.0 * 130.0 * 130.0)) * uPointer.z * 0.45;
    field += ptrGlow;
  }

  field = clamp((field - 0.5) * max(uContrast, 0.0) + 0.5, 0.0, 1.0);

  if (uClearing > 0.001) {
    vec2 boxHalf = vec2(400.0, 190.0);
    vec2 d = abs(p) - boxHalf;
    float inside = 1.0 - smoothstep(-60.0, 60.0, max(d.x, d.y));
    field *= (1.0 - inside * uClearing);
  }

  field = clamp(field, 0.0, 1.0);

  float glyphIdx = floor(field * max(uAtlasCount - 1.0, 1.0));

  float charX = 0.2 + inCell.x * 0.6;
  float charY = inCell.y;

  vec2 atlasUv = vec2((glyphIdx + charX) / max(uAtlasCount, 1.0), charY);
  float ink = texture(uAtlas, atlasUv).a;

  if (ink <= 0.005) {
    return vec4(0.0);
  }

  vec3 charColor;
  if (uHasPalette > 0.5 && uColorsCount > 1) {
    charColor = ramp(uColors, uColorsCount, field);
  } else {
    charColor = uColor;
  }

  return glow(charColor, ink * uIntensity * uIntro);
}
`;

export const Ascii = (props: AsciiProps) => {
  const {
    angle = -24,
    clearing = 0.6,
    color = "var(--foreground)",
    colors,
    contrast = 1,
    detail = 0.5,
    glyphs = DEFAULT_GLYPHS,
    intensity = 1,
    scale = 1,
    seed = 0,
    size = 14,
    variant = "waves",
    ...rest
  } = props;

  const hasPalette = colors && colors.length > 1;

  return (
    <BackgroundCanvas
      atlas={{ chars: glyphs }}
      colors={hasPalette ? undefined : { uColor: color }}
      data-slot="ascii"
      palettes={hasPalette ? { uColors: colors } : undefined}
      scene={SCENE}
      still={0}
      uniforms={{
        uAngle: angle,
        uClearing: clearing,
        uContrast: contrast,
        uDetail: detail,
        uHasPalette: hasPalette ? 1 : 0,
        uIntensity: intensity,
        uScale: scale,
        uSeed: seed,
        uSize: size,
        uVariant: variant === "clouds" ? 1 : variant === "rings" ? 2 : 0,
      }}
      {...rest}
    />
  );
};
