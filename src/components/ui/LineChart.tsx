import React from 'react';

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  width?: number;
  height?: number;
  showTrendLine?: boolean;
  targetWeight?: number | null;
  unit?: string;
  onPointHover?: (point: any, x: number, y: number) => void;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data = [], 
  xKey, 
  yKey, 
  width = 800, 
  height = 400,
  showTrendLine = false,
  targetWeight = null,
  unit = 'lbs',
  onPointHover = () => {}
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-800 rounded-lg border border-slate-600">
        <div className="text-center">
          <div className="text-slate-400 mb-2">No weight data available</div>
          <div className="text-slate-500 text-sm">Start logging your weight to see progress</div>
        </div>
      </div>
    );
  }

  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate scales
  const xValues = data.map(d => new Date(d[xKey]));
  const yValues = data.map(d => d[yKey]);
  
  const xMin = Math.min(...xValues.map(d => d.getTime()));
  const xMax = Math.max(...xValues.map(d => d.getTime()));
  const yMin = Math.min(...yValues) - 5;
  const yMax = Math.max(...yValues) + 5;

  const xScale = (value: any) => {
    const date = new Date(value);
    return (date.getTime() - xMin) / (xMax - xMin) * chartWidth;
  };

  const yScale = (value: number) => {
    return chartHeight - ((value - yMin) / (yMax - yMin) * chartHeight);
  };

  // Generate path string for line
  const linePath = data.map((point, index) => {
    const x = xScale(point[xKey]);
    const y = yScale(point[yKey]);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Calculate trend line if enabled
  let trendPath = '';
  if (showTrendLine && data.length > 1) {
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d[yKey], 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d[yKey], 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const trendStart = intercept;
    const trendEnd = slope * (n - 1) + intercept;

    const x1 = xScale(data[0][xKey]);
    const y1 = yScale(trendStart);
    const x2 = xScale(data[data.length - 1][xKey]);
    const y2 = yScale(trendEnd);

    trendPath = `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  // Generate grid lines
  const yGridLines = [];
  const yStep = (yMax - yMin) / 5;
  for (let i = 0; i <= 5; i++) {
    const value = yMin + (yStep * i);
    const y = yScale(value);
    yGridLines.push(
      <g key={i}>
        <line
          x1={0}
          y1={y}
          x2={chartWidth}
          y2={y}
          stroke="rgb(71, 85, 105)"
          strokeWidth="1"
          opacity="0.3"
        />
        <text
          x={-10}
          y={y + 4}
          fill="rgb(148, 163, 184)"
          fontSize="12"
          textAnchor="end"
        >
          {Math.round(value * 10) / 10}
        </text>
      </g>
    );
  }

  // Format date for x-axis labels
  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Generate x-axis labels
  const xLabels = [];
  const labelCount = Math.min(6, data.length);
  for (let i = 0; i < labelCount; i++) {
    const dataIndex = Math.floor((i / (labelCount - 1)) * (data.length - 1));
    const point = data[dataIndex];
    const x = xScale(point[xKey]);
    
    xLabels.push(
      <text
        key={i}
        x={x}
        y={chartHeight + 25}
        fill="rgb(148, 163, 184)"
        fontSize="12"
        textAnchor="middle"
      >
        {formatDate(point[xKey])}
      </text>
    );
  }

  return (
    <div className="w-full">
      <svg width={width} height={height} className="bg-slate-800 rounded-lg">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {yGridLines}
          
          {/* Target weight line */}
          {targetWeight && (
            <line
              x1={0}
              y1={yScale(targetWeight)}
              x2={chartWidth}
              y2={yScale(targetWeight)}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.8"
            />
          )}
          
          {/* Trend line */}
          {showTrendLine && trendPath && (
            <path
              d={trendPath}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="3,3"
              opacity="0.8"
            />
          )}
          
          {/* Main line */}
          <path
            d={linePath}
            fill="none"
            stroke="#ec4899"
            strokeWidth="3"
            className="drop-shadow-lg"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = xScale(point[xKey]);
            const y = yScale(point[yKey]);
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#ec4899"
                  stroke="#1e293b"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-8 transition-all duration-200"
                  onMouseEnter={() => onPointHover(point, x, y)}
                />
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {xLabels}
          
          {/* Y-axis label */}
          <text
            x={-40}
            y={chartHeight / 2}
            fill="rgb(148, 163, 184)"
            fontSize="12"
            textAnchor="middle"
            transform={`rotate(-90, -40, ${chartHeight / 2})`}
          >
            Weight ({unit})
          </text>
        </g>
        
        {/* Legend */}
        <g transform={`translate(${margin.left}, 5)`}>
          <circle cx="10" cy="10" r="4" fill="#ec4899" />
          <text x="20" y="14" fill="rgb(148, 163, 184)" fontSize="12">Weight</text>
          
          {showTrendLine && (
            <>
              <line x1="80" y1="10" x2="100" y2="10" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,3" />
              <text x="105" y="14" fill="rgb(148, 163, 184)" fontSize="12">Trend</text>
            </>
          )}
          
          {targetWeight && (
            <>
              <line x1="160" y1="10" x2="180" y2="10" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
              <text x="185" y="14" fill="rgb(148, 163, 184)" fontSize="12">Target</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

export default LineChart;