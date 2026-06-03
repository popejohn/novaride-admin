import React, { useState } from 'react';

// Custom Line Chart using SVGs
export const LineChart = ({ data = [], categories = [], title = "" }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) return <div className="text-muted text-center">No chart data available</div>;

  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;

  const maxVal = Math.max(...data, 100);
  const minVal = Math.min(...data, 0);
  const valRange = maxVal - minVal;

  const points = data.map((val, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (data.length - 1);
    const y = height - paddingY - ((val - minVal) * (height - 2 * paddingY)) / valRange;
    return { x, y, value: val, category: categories[index] };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Area path for gradient fill
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />

          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingY + ratio * (height - 2 * paddingY);
          const gridVal = Math.round(maxVal - ratio * valRange);
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <text x={paddingX - 10} y={y + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">{gridVal.toLocaleString()}</text>
            </g>
          );
        })}

        {/* Gradient Area under line */}
        {areaD && <path d={areaD} fill="url(#lineGrad)" />}

        {/* The Line */}
        {pathD && <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

        {/* Data points & Interaction anchors */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
            <circle cx={p.x} cy={p.y} r={hoverIndex === i ? 6 : 4} fill={hoverIndex === i ? '#fff' : 'var(--primary)'} stroke="var(--bg-dark)" strokeWidth="2" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }} />

            
            {/* Category labels on X axis */}
            <text x={p.x} y={height - 2} fill="var(--text-muted)" fontSize="10" textAnchor="middle">{p.category}</text>

            {/* Hover tooltip inline value */}
            {hoverIndex === i && (
              <g>
                <rect x={p.x - 45} y={p.y - 30} width="90" height="20" rx="4" fill="var(--bg-dark)" stroke="var(--border-color)" strokeWidth="1" />

                <text x={p.x} y={p.y - 16} fill="white" fontSize="10" fontWeight="600" textAnchor="middle">
                  {p.value.toLocaleString()}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// Custom Bar Chart using SVGs
export const BarChart = ({ datasets = [], categories = [], title = "" }) => {
  const [hoverBar, setHoverBar] = useState(null); // { datasetIndex, categoryIndex }

  if (!datasets || datasets.length === 0) return <div className="text-muted text-center">No chart data available</div>;

  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;

  // Flatten all data to find absolute max
  const allValues = datasets.flatMap(d => d.data);
  const maxVal = Math.max(...allValues, 10);
  const valRange = maxVal;

  const chartWidth = width - 2 * paddingX;
  const chartHeight = height - 2 * paddingY;
  const numCategories = categories.length;
  const numDatasets = datasets.length;
  const groupWidth = chartWidth / numCategories;
  const barWidth = (groupWidth * 0.6) / numDatasets;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" style={{ overflow: 'visible' }}>
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingY + ratio * chartHeight;
          const gridVal = Math.round(maxVal - ratio * valRange);
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <text x={paddingX - 10} y={y + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">{gridVal.toLocaleString()}</text>
            </g>
          );
        })}

        {/* Render bars */}
        {categories.map((cat, catIndex) => {
          const groupStartX = paddingX + catIndex * groupWidth;
          
          return (
            <g key={catIndex}>
              {/* Category label */}
              <text x={groupStartX + groupWidth / 2} y={height - 2} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                {cat}
              </text>

              {datasets.map((dataset, dsIndex) => {
                const value = dataset.data[catIndex] || 0;
                const barHeight = (value / maxVal) * chartHeight;
                
                // Position calculation for grouped bars
                const offset = dsIndex * barWidth - (numDatasets * barWidth) / 2;
                const barX = groupStartX + groupWidth / 2 + offset;
                const barY = height - paddingY - barHeight;

                const isHovered = hoverBar?.datasetIndex === dsIndex && hoverBar?.categoryIndex === catIndex;

                return (
                  <g 
                    key={dsIndex}
                    onMouseEnter={() => setHoverBar({ datasetIndex: dsIndex, categoryIndex: catIndex })}
                    onMouseLeave={() => setHoverBar(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth - 2}
                      height={Math.max(barHeight, 2)}
                      rx="3"
                      fill={dataset.color || 'var(--primary)'}
                      opacity={isHovered ? 1 : 0.85}
                      style={{ transition: 'all 0.15s ease' }}
                    />

                    {/* Tooltip on bar hover */}
                    {isHovered && (
                      <g>
            <rect x={barX + barWidth / 2 - 45} y={barY - 24} width="90" height="18" rx="4" fill="var(--bg-dark)" stroke="var(--border-color)" strokeWidth="1" />

                        <text x={barX + barWidth / 2} y={barY - 12} fill="white" fontSize="9" fontWeight="600" textAnchor="middle">
                          {dataset.label}: {value.toLocaleString()}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Custom Donut Chart using SVGs
export const DonutChart = ({ data = [], title = "" }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) return <div className="text-muted text-center">No chart data available</div>;

  const total = data.reduce((acc, d) => acc + d.value, 0);
  
  const size = 200;
  const center = size / 2;
  const radius = size * 0.35;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90; // Start at top
  let accumulatedPercent = 0;

  const slices = data.map((slice, i) => {
    const percent = total > 0 ? slice.value / total : 0;
    const strokeDashoffset = circumference - (percent * circumference);
    const strokeDasharray = `${circumference} ${circumference}`;
    const rotate = (accumulatedPercent * 360) - 90;
    
    accumulatedPercent += percent;
    return {
      ...slice,
      percent,
      strokeDashoffset,
      strokeDasharray,
      rotate
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, i) => {
            const isHovered = hoverIndex === i;
            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                transform={`rotate(${slice.rotate} ${center} ${center})`}
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}
          
          {/* Inner details text */}
          <circle cx={center} cy={center} r={radius - strokeWidth} fill="var(--bg-dark)" />
          <text x={center} y={center - 4} fill="var(--text-secondary)" fontSize="11" fontWeight="500" textAnchor="middle">
            {hoverIndex !== null ? slices[hoverIndex].label : "Total Repaid"}
          </text>
          <text x={center} y={center + 14} fill="white" fontSize="16" fontWeight="700" textAnchor="middle">
            {hoverIndex !== null 
              ? `${Math.round(slices[hoverIndex].percent * 100)}%` 
              : `${Math.round((slices[0]?.percent || 0) * 100)}%`
            }
          </text>
        </svg>
      </div>

      {/* Legend list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {slices.map((slice, i) => (
          <div 
            key={i} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '13px',
              color: hoverIndex === i ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: slice.color, display: 'inline-block' }}></span>
            <span>{slice.label} ({slice.value.toLocaleString()})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
