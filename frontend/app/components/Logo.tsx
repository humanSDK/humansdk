// components/Logo.tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => (
    <div className={cn("flex flex-row", className)}>
        <div className="text-3xl font-bold">C</div>
        <div className="w-8 h-8">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="100" fill="#1A1A1A" />
                <path
                    d="M 70 50 L 130 50 A 40 40 0 1 1 130 150 L 70 150 A 40 40 0 1 1 70 50"
                    fill="none"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                <line
                    x1="60"
                    y1="100"
                    x2="140"
                    y2="100"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
            </svg>
        </div>
        <div className="text-3xl font-bold">S</div>
    </div>
);

export const MiniLogo: React.FC<LogoProps> = ({ className }) => {
    return (
        <div className={className}>
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="100" fill="#1A1A1A" />
                <path
                    d="M 70 50 L 130 50 A 40 40 0 1 1 130 150 L 70 150 A 40 40 0 1 1 70 50"
                    fill="none"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                <line
                    x1="60"
                    y1="100"
                    x2="140"
                    y2="100"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    )
}

export const CustomLogo = ({ className }: any) => {
    return (
        <div className={className}>
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="100" fill="#1A1A1A" />
                <path
                    d="M 70 50 L 130 50 A 40 40 0 1 1 130 150 L 70 150 A 40 40 0 1 1 70 50"
                    fill="none"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                <line
                    x1="60"
                    y1="100"
                    x2="140"
                    y2="100"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    )
}
export default Logo;