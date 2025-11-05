import React from 'react';

const data = [
  { name: 'S', uv: 400, pv: 240 },
  { name: 'M', uv: 300, pv: 139 },
  { name: 'T', uv: 200, pv: 980 },
  { name: 'W', uv: 278, pv: 390 },
  { name: 'T', uv: 189, pv: 480 },
  { name: 'F', uv: 239, pv: 380 },
  { name: 'S', uv: 349, pv: 430 },
];

interface BarChartProps {
    theme: string;
}

export const LineChartCard: React.FC<BarChartProps> = ({ theme }) => {
    const isDark = theme === 'dark';
    const maxValue = 1000; // Based on max pv value of 980

    return (
        <div>
            <h3 className="font-bold text-lg text-text-primary mb-4">Weekly Progress</h3>
            <div className="flex justify-between items-end h-[150px] space-x-2">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end">
                        <div className="flex items-end w-full h-full justify-center space-x-1">
                             <div 
                                className="w-1/2 bg-red-400 rounded-t-sm transition-all duration-300" 
                                style={{ height: `${(item.uv / maxValue) * 100}%` }}
                                title={`Hours Focused: ${item.uv}`}
                            ></div>
                            <div
                                className="w-1/2 bg-accent rounded-t-sm transition-all duration-300"
                                style={{ height: `${(item.pv / maxValue) * 100}%` }}
                                title={`Tasks Done: ${item.pv}`}
                            ></div>
                        </div>
                        <span className="text-xs text-text-secondary mt-2">{item.name}</span>
                    </div>
                ))}
            </div>
             <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-text-secondary">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-accent rounded-sm mr-2"></div>
                    <span>Tasks Done</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-sm mr-2"></div>
                    <span>Hours Focused</span>
                </div>
            </div>
        </div>
    );
};