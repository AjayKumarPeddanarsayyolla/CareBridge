import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import * as firstAidService from '../../services/firstAidService';

export const FirstAidDirectory = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    'ALL',
    'Burns & Scalds',
    'Choking',
    'Sprains & Fractures',
    'Heat & Cold Illness',
    'Allergies & Anaphylaxis',
    'Breathing Difficulty',
    'General Medical'
  ];

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await firstAidService.getFirstAidGuides({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        search: search.trim() || undefined
      });
      if (res.success) {
        setGuides(res.data);
      }
    } catch (err) {
      console.error('Fetch guides error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGuides();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <Badge variant="primary" size="md">Emergency Clinical Reference</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Doctor-Verified First Aid Protocols
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Safe, evidence-grounded instructions for immediate situation stabilization prior to emergency arrival.
          </p>
        </div>

        {/* Search & Category Filter Card */}
        <Card variant="glass" className="p-5 sm:p-6 space-y-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search first aid topics (e.g., burns, sprains, choking, heat stroke)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="sm:w-36">
              <span>Search Guides</span>
            </Button>
          </form>

          {/* Category Chips */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Browse by Condition:
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Guides Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : guides.length === 0 ? (
          <EmptyState
            title="No first-aid guides found"
            description="No doctor-verified first aid topics match the selected condition or search query."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearch('');
                }}
              >
                Reset Search Filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Link
                key={guide.id || guide._id}
                to={`/first-aid/${guide.slug || guide.id || guide._id}`}
                className="group"
              >
                <Card
                  variant="glass"
                  className="p-6 h-full flex flex-col justify-between group-hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="warning" size="sm">
                        {guide.category}
                      </Badge>
                      <span className="text-[10px] text-teal-700 font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Doctor Approved
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-950 text-base group-hover:text-teal-700 transition">
                      {guide.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {guide.situation}
                    </p>

                    {guide.safeImmediateSteps?.length > 0 && (
                      <div className="pt-2 text-xs text-slate-500 space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 block">Immediate Protocol:</span>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          1. {guide.safeImmediateSteps[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                    <span>View Step-by-Step Action</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
