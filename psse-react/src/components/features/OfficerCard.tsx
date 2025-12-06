import type { Officer } from '../../../src/types';

interface OfficerCardProps {
  officer: Officer;
}

export const OfficerCard = ({ officer }: OfficerCardProps) => {
  return (
    <div className="group h-full">
      <div className="bg-psse-dark rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full min-h-[180px] flex flex-col">
        <div className="p-4 text-center flex-1 flex flex-col justify-center items-center">
          {/* Photo container with fixed size */}
          <div className="mb-3 shrink-0">
            <img
              src={officer.image}
              alt={officer.name || officer.title}
              className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-psse-accent/30 group-hover:border-psse-accent transition-colors"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-image.jpg';
              }}
            />
          </div>
          {/* Text content with fixed height and overflow handling */}
          <div className="w-full min-h-[48px] flex flex-col justify-center">
            {officer.name && (
              <p
                className="text-psse-accent font-semibold text-xs leading-tight mb-1 line-clamp-2 break-words px-1"
                title={officer.name}
              >
                {officer.name}
              </p>
            )}
            <h6
              className="text-white font-medium text-xs leading-tight line-clamp-2 break-words px-1"
              title={officer.title}
            >
              {officer.title}
            </h6>
          </div>
        </div>
      </div>
    </div>
  );
};
