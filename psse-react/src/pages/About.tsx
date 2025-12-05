import { useState, useEffect } from 'react';
import { FaQuoteLeft, FaSpinner } from 'react-icons/fa';
import { PageLayout } from '../components/layout';
import { Card, CardBody, Button } from '../components/common';
import { OfficerCard } from '../components/features';
import { officersApi } from '../services/api';
import { groupOfficersByCategory, mapApiOfficerToOfficer } from '../lib';
import type { GroupedOfficers } from '../lib';
import { useScrollAnimationList } from '../hooks';

export const About = () => {
  const [groupedOfficers, setGroupedOfficers] = useState<GroupedOfficers[]>([]);
  const [totalOfficers, setTotalOfficers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { containerRef, visibleItems } = useScrollAnimationList(totalOfficers, 50);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await officersApi.getOfficers();
        const grouped = groupOfficersByCategory(response);
        
        setGroupedOfficers(grouped);
        setTotalOfficers(response.length);
      } catch (err) {
        console.error('Failed to fetch officers:', err);
        setError('Failed to load officers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  // Calculate the starting index for each officer within the flat list
  const getOfficerIndex = (groupIndex: number, officerIndex: number): number => {
    let index = 0;
    for (let i = 0; i < groupIndex; i++) {
      index += groupedOfficers[i].officers.length;
    }
    return index + officerIndex;
  };

  return (
    <PageLayout>
      {/* Header Section */}
      <section className="py-16 px-4 bg-linear-to-b from-gray-100 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About PSSE</h1>
          <p className="text-xl text-gray-600">
            Learn more about our organization and leadership
          </p>
        </div>
      </section>

      {/* Organization History */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card hover={false}>
            <CardBody className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our History</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                PSSE was founded in <strong>2019</strong> by a group of Centralian software
                engineering students with a shared passion for technology, innovation, and
                community. What started as a small initiative years ago has grown into a vibrant
                organization that supports hundreds of SE students through workshops, hackathons,
                seminars, and collaborations.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Over the years, PSSE has become a platform for aspiring developers to learn beyond
                the classroom, lead meaningful projects, and prepare for the tech industry—while
                building lasting friendships along the way.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Leadership Structure */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Structure</h2>
            <p className="text-lg text-gray-600">
              Meet our dedicated officers organized into four distinct categories
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <FaSpinner className="w-8 h-8 text-psse-accent animate-spin" />
              <span className="ml-3 text-gray-600">Loading officers...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : groupedOfficers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">No officers to display at this time.</p>
            </div>
          ) : (
            <div ref={containerRef}>
              {groupedOfficers.map((group, groupIndex) => (
                <div key={group.category} className="mb-12">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-psse-accent mb-2">
                      {group.categoryInfo.title}
                    </h3>
                    <p className="text-gray-600">{group.categoryInfo.description}</p>
                  </div>

                  <div
                    className={`grid gap-4 ${
                      group.category === 'executive'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                        : group.category === 'administrative'
                        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7'
                        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                    }`}
                  >
                    {group.officers.map((apiOfficer, officerIndex) => {
                      const officer = mapApiOfficerToOfficer(apiOfficer);
                      const flatIndex = getOfficerIndex(groupIndex, officerIndex);
                      
                      return (
                        <div
                          key={officer.id}
                          className={`transition-all duration-500 ${
                            visibleItems.has(flatIndex)
                              ? 'opacity-100 translate-y-0'
                              : 'opacity-0 translate-y-8'
                          }`}
                        >
                          <OfficerCard officer={officer} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-linear-to-br from-psse-dark to-psse-primary" hover={false}>
            <CardBody className="p-8 md:p-12 text-center">
              <FaQuoteLeft className="w-12 h-12 text-psse-accent mx-auto mb-6" />
              <p className="text-xl md:text-2xl text-white leading-relaxed mb-6">
                "PSSE has been instrumental in shaping not just our technical skills, but also our
                leadership capabilities and community spirit. It's more than an organization—it's
                a family."
              </p>
              <footer className="text-gray-300">
                <cite>— PSSE Member</cite>
              </footer>
            </CardBody>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
};
