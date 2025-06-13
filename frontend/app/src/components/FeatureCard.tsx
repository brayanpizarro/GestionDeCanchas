import React from 'react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 flex flex-col items-center text-center transition-transform hover:transform hover:scale-105 h-full">
            <div className="text-[#071d40] mb-3 md:mb-4 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-[#071d40] leading-tight">{title}</h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
};

export default FeatureCard;