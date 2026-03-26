'use client';

import { cn } from '@/lib/utils';

type FunnelStep = {
  label: string;
  count: number;
  color: string;
  width: string;
};

export default function PipelineFunnel({ steps }: { steps: FunnelStep[] }) {
  return (
    <div className="space-y-4 mt-6">
      {steps.map((step, i) => {
        const prev = steps[i - 1];
        const conversion = prev ? Math.round((step.count / prev.count) * 100) : null;

        return (
          <div key={step.label} className="relative">
            <div className="flex justify-between text-xs font-bold mb-1.5 px-0.5">
              <span className="text-gray-500 uppercase tracking-wider">{step.label}</span>
              <span className="text-gray-900">{step.count}</span>
            </div>
            <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden">
              <div 
                className={cn('h-full transition-all duration-1000 rounded-full', step.color)}
                style={{ width: step.width }}
              />
            </div>
            {conversion !== null && (
              <div className="absolute -top-3 right-0 text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full ring-1 ring-emerald-100">
                {conversion}% conv.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
