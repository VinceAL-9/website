import { FaFacebook, FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

const socialLinks: SocialLink[] = [
  { icon: <FaFacebook size={24} />, href: '#', label: 'Facebook' },
  { icon: <FaInstagram size={24} />, href: '#', label: 'Instagram' },
  { icon: <FaGithub size={24} />, href: '#', label: 'GitHub' },
  { icon: <FaLinkedin size={24} />, href: '#', label: 'LinkedIn' },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-psse-dark text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Organization Info */}
          <div>
            <h5 className="text-lg font-semibold mb-3 text-white">
              Philippine Society of Software Engineers
            </h5>
            <p className="text-gray-400">
              Shaping the next disruptors in software innovation since 2019.
            </p>
          </div>

          {/* Social Links */}
          <div>
            <h5 className="text-lg font-semibold mb-3 text-white">Connect With Us</h5>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-400 hover:text-psse-accent transition-colors duration-200"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-8 border-psse-light/30" />

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Philippine Society of Software Engineers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
