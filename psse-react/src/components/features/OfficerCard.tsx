import type { Officer } from '../../types';

interface OfficerCardProps {
  officer: Officer;
}

export const OfficerCard = ({ officer }: OfficerCardProps) => {
  return (
    <div className="group">
      <div className="bg-psse-dark rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="p-6 text-center">
          <div className="mb-4">
            <img
              src={officer.image}
              alt={officer.title}
              className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-psse-accent/30 group-hover:border-psse-accent transition-colors"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-image.jpg';
              }}
            />
          </div>
          <h6 className="text-white font-medium text-sm">{officer.title}</h6>
        </div>
      </div>
    </div>
  );
};
