import { iconMap, fontStack } from '@/lib/presentationAssets';

// Renders the inner visual content of a single element, filling its box.
// Used by the static SlideRenderer and the interactive CanvasElement.
export default function ElementView({ el }) {
  const { content, type } = el;
  if (type === 'text') return <TextContent content={content} />;
  if (type === 'image') return <ImageContent content={content} />;
  if (type === 'shape') return <ShapeContent content={content} />;
  if (type === 'icon') return <IconContent content={content} />;
  return null;
}

function TextContent({ content }) {
  const style = {
    width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
    fontFamily: fontStack(content.font), fontSize: `${content.size}px`,
    fontWeight: content.bold ? 700 : 400, fontStyle: content.italic ? 'italic' : 'normal',
    textDecoration: content.underline ? 'underline' : 'none',
    color: content.color, backgroundColor: content.highlight || 'transparent',
    textAlign: content.align, lineHeight: content.lineHeight,
    letterSpacing: `${content.letterSpacing}px`, opacity: content.opacity,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '4px',
  };
  if (content.listType === 'bullet' || content.listType === 'number') {
    const lines = (content.text || '').split('\n');
    const Tag = content.listType === 'number' ? 'ol' : 'ul';
    return (
      <Tag style={{ ...style, margin: 0, paddingLeft: '1.2em', listStylePosition: 'inside' }}>
        {lines.map((l, i) => <li key={i} style={{ listStyleType: content.listType === 'number' ? 'decimal' : 'disc' }}>{l}</li>)}
      </Tag>
    );
  }
  return <div style={style}>{content.text}</div>;
}

function ImageContent({ content }) {
  if (!content.src) {
    return (
      <div style={{ width: '100%', height: '100%', border: '2px dashed #cbd5e1', borderRadius: `${content.radius || 0}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14, opacity: content.opacity, background: '#f8fafc' }}>
        [ {`image`} ]
      </div>
    );
  }
  return (
    <img src={content.src} alt="" draggable={false}
      style={{
        width: '100%', height: '100%', objectFit: content.fit === 'fit' ? 'contain' : 'cover',
        borderRadius: `${content.radius || 0}px`, opacity: content.opacity,
        boxShadow: content.shadow ? '0 8px 24px rgba(0,0,0,0.18)' : 'none',
        display: 'block',
      }} />
  );
}

function ShapeContent({ content }) {
  const { shape, fill, border, borderWidth, radius, opacity } = content;
  const base = { width: '100%', height: '100%', opacity, boxSizing: 'border-box' };
  if (shape === 'line' || shape === 'arrow') {
    const stroke = fill, sw = borderWidth || 4;
    return (
      <svg width="100%" height="100%" viewBox={`0 0 100 100`} preserveAspectRatio="none" style={{ opacity }}>
        <line x1="0" y1="50" x2="100" y2="50" stroke={stroke} strokeWidth={sw} vectorEffect="non-scaling-stroke" />
        {shape === 'arrow' && (
          <polygon points="100,50 88,42 88,58" fill={stroke} />
        )}
      </svg>
    );
  }
  if (shape === 'circle') {
    return <div style={{ ...base, borderRadius: '50%', background: fill, border: borderWidth ? `${borderWidth}px solid ${border}` : 'none' }} />;
  }
  return <div style={{ ...base, borderRadius: `${radius || 0}px`, background: fill, border: borderWidth ? `${borderWidth}px solid ${border}` : 'none' }} />;
}

function IconContent({ content }) {
  const Comp = iconMap[content.name] || iconMap.GraduationCap;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: content.opacity }}>
      <Comp size={content.size || 64} color={content.color} strokeWidth={2} />
    </div>
  );
}