import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, LinearGradient, Stop, Defs, Rect } from 'react-native-svg';

interface Props {
  data: number[];
  width: number;
  height: number;
  color?: string;
  showFill?: boolean;
}

export function Sparkline({ data, width, height, color = '#10B981', showFill = true }: Props) {
  const { path, fill } = useMemo(() => {
    if (!data.length) return { path: '', fill: '' };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / Math.max(1, data.length - 1);
    const pts = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return [x, y];
    });
    const path = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ');
    const fill = `${path} L${width},${height} L0,${height} Z`;
    return { path, fill };
  }, [data, width, height]);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.25" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {showFill ? <Path d={fill} fill="url(#grad)" /> : null}
        <Path d={path} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}
