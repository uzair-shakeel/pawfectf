"use client";

import { Check, User, Sparkles, Database, ScanLine, CameraIcon } from "lucide-react";

export type SourceType = 'confirmed' | 'seller' | 'photos' | 'reference' | 'ai';

interface SourceBadgeProps {
    source: SourceType;
    className?: string;
}

export default function SourceBadge({ source, className = "" }: SourceBadgeProps) {
    let badgeClasses = "";
    let Icon = Database;
    let text = "Data";

    switch (source) {
        case 'confirmed':
            badgeClasses = "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800";
            Icon = Check;
            text = "Confirmed";
            break;
        case 'seller':
            badgeClasses = "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800";
            Icon = User;
            text = "Seller Input";
            break;
        case 'photos':
            badgeClasses = "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800";
            Icon = CameraIcon;
            text = "From Photos";
            break;
        case 'ai':
            badgeClasses = "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800";
            Icon = Sparkles;
            text = "AI Draft";
            break;
        case 'reference':
        default:
            badgeClasses = "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";
            Icon = ScanLine;
            text = "Model Data";
            break;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClasses} ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {text}
        </span>
    );
}
