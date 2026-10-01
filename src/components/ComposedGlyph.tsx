import type { StructureTemplate } from '../data/visualGrammar';

const SERIF = '"Noto Serif SC", "Songti SC", "SimSun", serif';

interface ComposedGlyphProps {
  /** Deformed component forms, in reading order */
  parts: string[];
  template: StructureTemplate;
  /** Box size in px */
  size?: number;
  color?: string;
}

/**
 * Renders a (possibly non-existent) character by arranging its components
 * spatially according to a structure template — used for pseudo-characters
 * (假字) and the component forge, where no single Unicode glyph exists.
 */
export default function ComposedGlyph({ parts, template, size = 96, color = '#1A1A18' }: ComposedGlyphProps) {
  const base: React.CSSProperties = {
    fontFamily: SERIF,
    color,
    lineHeight: 1,
    userSelect: 'none',
    display: 'block',
  };

  const linear = (dir: 'row' | 'column', scale: number) => (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        flexDirection: dir,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {parts.map((p, i) => (
        <span key={i} style={{ ...base, fontSize: size * scale }}>{p}</span>
      ))}
    </div>
  );

  const overlay = (frameIndex: number, innerIndex: number, frameAlign: React.CSSProperties) => (
    <div style={{ position: 'relative', width: size, height: size }}>
      <span
        style={{
          ...base,
          fontSize: size,
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...frameAlign,
        }}
      >
        {parts[frameIndex]}
      </span>
      <span
        style={{
          ...base,
          fontSize: size * 0.42,
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {parts[innerIndex]}
      </span>
    </div>
  );

  switch (template) {
    case 'left-right':
      return linear('row', parts.length >= 3 ? 0.46 : 0.62);
    case 'top-bottom':
      return linear('column', parts.length >= 3 ? 0.46 : 0.62);
    case 'left-mid-right':
      return linear('row', 0.42);
    case 'top-mid-bottom':
      return linear('column', 0.42);
    case 'pin':
      return (
        <div style={{ width: size, height: size, display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center' }}>
          <span style={{ ...base, fontSize: size * 0.42 }}>{parts[0]}</span>
          <span style={{ ...base, fontSize: size * 0.42 }}>{parts[1]}</span>
          <span style={{ ...base, fontSize: size * 0.42, gridColumn: '1 / -1' }}>{parts[2] ?? ''}</span>
        </div>
      );
    case 'full-enclose':
      return overlay(0, 1, {});
    case 'semi-enclose-tl':
      return overlay(0, 1, { alignItems: 'flex-start', justifyContent: 'flex-start', fontSize: size * 0.9 });
    case 'semi-enclose-bl':
      return overlay(0, 1, { alignItems: 'flex-end', justifyContent: 'flex-start', fontSize: size * 0.9 });
    case 'overlay':
      return (
        <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
          {parts.map((p, i) => (
            <span key={i} style={{ ...base, fontSize: size * 0.78, position: 'absolute' }}>{p}</span>
          ))}
        </div>
      );
    default:
      return linear('row', 0.62);
  }
}