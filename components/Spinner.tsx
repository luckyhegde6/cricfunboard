// components/Spinner.tsx
export default function Spinner({ size = 5 }: { size?: number }) {
    return <div className={`w-${size} h-${size} rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin`} />;
}
