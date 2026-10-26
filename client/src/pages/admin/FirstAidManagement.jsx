import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  PlusCircle,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit3,
  AlertTriangle,
  Clock,
  Sparkles,
  PhoneCall,
  Check,
  FileText
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as firstAidService from '../../services/firstAidService';
import * as adminService from '../../services/adminService';

export const FirstAidManagement = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [previewGuide, setPreviewGuide] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PUBLISHED, DRAFT

  const [formData, setFormData] = useState({
    title: '',
    category: 'Burns & Scalds',
    situation: '',
    safeImmediateSteps: '',
    thingsToAvoid: '',
    warningSigns: '',
    whenToSeekProfessionalCare: '',
    emergencyWarning: 'Emergency: If the person is unconscious, experiencing acute chest pain, or having severe difficulty breathing, dial 112 (National ERSS) or 108 (Ambulance) immediately.',
    reviewedByDoctor: 'Dr. Sarah Jenkins, MD',
    isPublished: true
  });

  const categories = [
    'All',
    'Burns & Scalds',
    'Choking',
    'Sprains & Fractures',
    'Heat & Cold Illness',
    'Wounds & Bleeding',
    'Allergies & Anaphylaxis',
    'Breathing Difficulty',
    'Fainting & Head Injury',
    'Bites & Stings',
    'General Medical'
  ];

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await firstAidService.getFirstAidGuides();
      if (res.success) {
        setGuides(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch first-aid guides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const openCreateModal = () => {
    setEditingGuide(null);
    setFormData({
      title: '',
      category: 'Burns & Scalds',
      situation: '',
      safeImmediateSteps: '',
      thingsToAvoid: '',
      warningSigns: '',
      whenToSeekProfessionalCare: '',
      emergencyWarning: 'Emergency: If the person is unconscious, experiencing acute chest pain, or having severe difficulty breathing, dial 112 (National ERSS) or 108 (Ambulance) immediately.',
      reviewedByDoctor: 'Dr. Sarah Jenkins, MD',
      isPublished: true
    });
    setModalOpen(true);
  };

  const openEditModal = (guide) => {
    setEditingGuide(guide);
    setFormData({
      title: guide.title || '',
      category: guide.category || 'Burns & Scalds',
      situation: guide.situation || '',
      safeImmediateSteps: Array.isArray(guide.safeImmediateSteps)
        ? guide.safeImmediateSteps.join('\n')
        : (guide.safeImmediateSteps || ''),
      thingsToAvoid: Array.isArray(guide.thingsToAvoid)
        ? guide.thingsToAvoid.join('\n')
        : (guide.thingsToAvoid || ''),
      warningSigns: Array.isArray(guide.warningSigns)
        ? guide.warningSigns.join('\n')
        : (guide.warningSigns || ''),
      whenToSeekProfessionalCare: Array.isArray(guide.whenToSeekProfessionalCare)
        ? guide.whenToSeekProfessionalCare.join('\n')
        : (guide.whenToSeekProfessionalCare || ''),
      emergencyWarning: guide.emergencyWarning || '',
      reviewedByDoctor: guide.reviewedByDoctor || 'Dr. Sarah Jenkins, MD',
      isPublished: guide.isPublished !== false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        situation: formData.situation.trim(),
        safeImmediateSteps: formData.safeImmediateSteps
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        thingsToAvoid: formData.thingsToAvoid
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        warningSigns: formData.warningSigns
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        whenToSeekProfessionalCare: formData.whenToSeekProfessionalCare
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        emergencyWarning: formData.emergencyWarning.trim(),
        reviewedByDoctor: formData.reviewedByDoctor.trim(),
        isPublished: formData.isPublished
      };

      if (editingGuide) {
        const guideId = editingGuide._id || editingGuide.id;
        const res = await adminService.updateFirstAidGuide(guideId, payload);
        if (res.success) {
          setModalOpen(false);
          fetchGuides();
        }
      } else {
        const res = await adminService.createFirstAidGuide(payload);
        if (res.success) {
          setModalOpen(false);
          fetchGuides();
        }
      }
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTogglePublish = async (guide) => {
    try {
      const guideId = guide._id || guide.id;
      const newStatus = guide.isPublished === false ? true : false;
      const res = await adminService.updateFirstAidGuide(guideId, {
        isPublished: newStatus
      });
      if (res.success) {
        setGuides((prev) =>
          prev.map((g) =>
            (g._id || g.id) === guideId ? { ...g, isPublished: newStatus } : g
          )
        );
        if (previewGuide && (previewGuide._id || previewGuide.id) === guideId) {
          setPreviewGuide((p) => ({ ...p, isPublished: newStatus }));
        }
      }
    } catch (err) {
      alert('Failed to update publication status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this first-aid protocol?')) return;
    try {
      const res = await adminService.deleteFirstAidGuide(id);
      if (res.success) {
        if (previewGuide && (previewGuide._id || previewGuide.id) === id) {
          setPreviewGuide(null);
        }
        fetchGuides();
      }
    } catch (err) {
      alert('Deletion failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter computation
  const filteredGuides = guides.filter((g) => {
    const matchesSearch =
      g.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.situation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || g.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PUBLISHED' && g.isPublished !== false) ||
      (statusFilter === 'DRAFT' && g.isPublished === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const publishedCount = guides.filter((g) => g.isPublished !== false).length;
  const draftCount = guides.filter((g) => g.isPublished === false).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[250px] bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation & Header */}
        <Link
          to="/admin"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-purple-300 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Platform Overview</span>
        </Link>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>CareBridge Clinical Content Management (CMS)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              First-Aid CMS & Knowledge Protocol Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Curate, edit, and review verified medical protocols with live simulated clinical preview, DO/DO NOT checklists, and emergency guidance.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-purple-500/25 transition flex items-center space-x-2 active:scale-95 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Protocol</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 mb-8 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search protocols by title, symptom, or emergency condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center space-x-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl flex-shrink-0 self-start md:self-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'ALL'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({guides.length})
              </button>
              <button
                onClick={() => setStatusFilter('PUBLISHED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  statusFilter === 'PUBLISHED'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Published ({publishedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('DRAFT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  statusFilter === 'DRAFT'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Drafts ({draftCount})</span>
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-slate-500 flex items-center gap-1 mr-1 flex-shrink-0 font-medium">
              <Filter className="w-3.5 h-3.5" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium text-[11px] ${
                  selectedCategory === cat
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                    : 'bg-slate-950/50 text-slate-400 border border-slate-800/80 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <LoadingSpinner message="Loading first-aid repository..." />
        ) : filteredGuides.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Protocols Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              {searchQuery || selectedCategory !== 'All' || statusFilter !== 'ALL'
                ? 'No first-aid guides match your filter criteria. Try clearing search or selecting a different category.'
                : 'Your knowledge base is currently empty. Click below to publish your first clinical first-aid protocol.'}
            </p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition"
            >
              Add First Protocol
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredGuides.map((g) => {
              const isPub = g.isPublished !== false;
              const isSelected = previewGuide && (previewGuide._id || previewGuide.id) === (g._id || g.id);

              return (
                <motion.div
                  key={g._id || g.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-purple-500 shadow-xl shadow-purple-500/10'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
                  }`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {g.category}
                        </span>

                        {isPub ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Published</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Draft</span>
                          </span>
                        )}
                      </div>

                      {/* Doctor Seal */}
                      <span className="text-[11px] text-teal-400 font-mono truncate max-w-[200px]">
                        ✓ {g.reviewedByDoctor || 'Clinical Board'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-white text-base mb-1.5 hover:text-purple-300 transition">
                      {g.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {g.situation}
                    </p>

                    {/* Metadata Summary Chips */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800">
                        {g.safeImmediateSteps?.length || 0} Steps
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-rose-300">
                        {g.thingsToAvoid?.length || 0} DO NOTs
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-amber-300">
                        {g.warningSigns?.length || 0} Red Flags
                      </span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {/* Live Preview Button */}
                      <button
                        onClick={() => setPreviewGuide(g)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition flex items-center space-x-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Interactive Preview</span>
                      </button>

                      {/* Public Link */}
                      <Link
                        to={`/first-aid/${g.slug || g._id || g.id}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* Toggle Publish / Draft */}
                      <button
                        onClick={() => handleTogglePublish(g)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition border flex items-center space-x-1 ${
                          isPub
                            ? 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/50 hover:text-amber-300'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/60'
                        }`}
                        title={isPub ? 'Move to Draft' : 'Publish Article'}
                      >
                        {isPub ? <EyeOff className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{isPub ? 'Unpublish' : 'Publish'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(g)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Edit Protocol"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(g._id || g.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-200 rounded-lg hover:bg-rose-950/60 transition"
                        title="Delete Protocol"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ========================================================
            INTERACTIVE PREVIEW MODAL / DRAWER
            ======================================================== */}
        <AnimatePresence>
          {previewGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8"
              >
                {/* Preview Header */}
                <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
                      Simulated Patient View Preview
                    </span>
                    {previewGuide.isPublished === false && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Draft Mode
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setPreviewGuide(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview Body */}
                <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-slate-100">
                  {/* Title & Category Header */}
                  <div className="border-b border-slate-800 pb-5">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {previewGuide.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Verified by {previewGuide.reviewedByDoctor || 'CareBridge Clinical Board'}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {previewGuide.title}
                    </h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {previewGuide.situation}
                    </p>
                  </div>

                  {/* Emergency Banner */}
                  {previewGuide.emergencyWarning && (
                    <div className="bg-rose-950/60 border border-rose-800/80 rounded-2xl p-4 flex items-start space-x-3 text-rose-200 text-xs sm:text-sm">
                      <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <strong className="text-rose-100 block font-bold mb-1">
                          Critical Emergency Directive
                        </strong>
                        <p className="leading-relaxed">{previewGuide.emergencyWarning}</p>
                        <div className="mt-3 flex items-center space-x-2">
                          <a
                            href="tel:112"
                            className="px-3 py-1.5 bg-white text-red-700 font-black rounded-lg text-xs flex items-center space-x-1"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Dial 112 (National ERSS)</span>
                          </a>
                          <a
                            href="tel:108"
                            className="px-3 py-1.5 bg-red-900/60 border border-white/20 text-white font-bold rounded-lg text-xs"
                          >
                            <span>108 Ambulance</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 1: Safe Immediate Steps (DO) */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Immediate Recommended Steps (DO)</span>
                    </h4>
                    <ol className="space-y-2 text-xs sm:text-sm text-slate-200">
                      {(Array.isArray(previewGuide.safeImmediateSteps)
                        ? previewGuide.safeImmediateSteps
                        : []
                      ).map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Section 2: Things to Avoid (DO NOT) */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center space-x-2">
                      <X className="w-4 h-4 text-rose-400" />
                      <span>Dangerous Practices to Avoid (DO NOT)</span>
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                      {(Array.isArray(previewGuide.thingsToAvoid)
                        ? previewGuide.thingsToAvoid
                        : []
                      ).map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            ✕
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 3: Warning Signs */}
                  {previewGuide.warningSigns && previewGuide.warningSigns.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Warning Signs & Escalation Flags</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 list-disc list-inside">
                        {previewGuide.warningSigns.map((w, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Section 4: When to Seek Professional Care */}
                  {previewGuide.whenToSeekProfessionalCare &&
                    previewGuide.whenToSeekProfessionalCare.length > 0 && (
                      <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200">
                        <strong className="block text-purple-100 font-bold mb-1">
                          Doctor Consultation Recommendation:
                        </strong>
                        <ul className="list-disc list-inside space-y-1">
                          {previewGuide.whenToSeekProfessionalCare.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Preview Footer Actions */}
                <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-mono">
                    Article Status: {previewGuide.isPublished !== false ? 'Published' : 'Draft'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePublish(previewGuide)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800 transition"
                    >
                      {previewGuide.isPublished !== false ? 'Switch to Draft' : 'Publish Article'}
                    </button>
                    <button
                      onClick={() => {
                        const target = previewGuide;
                        setPreviewGuide(null);
                        openEditModal(target);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Protocol</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================
            CREATE / EDIT MODAL
            ======================================================== */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8"
              >
                <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <h2 className="text-base font-black text-white">
                      {editingGuide ? 'Edit First-Aid Protocol' : 'Publish New First-Aid Protocol'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-slate-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Protocol Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acute Thermal Burns & Scalds Management"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                      >
                        {categories
                          .filter((c) => c !== 'All')
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Reviewing Physician / Credential *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.reviewedByDoctor}
                        onChange={(e) =>
                          setFormData({ ...formData, reviewedByDoctor: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Clinical Situation / Scope *
                    </label>
                    <textarea
                      rows="2"
                      required
                      placeholder="Accidental exposure to boiling liquids, open flames, steam, or hot surfaces..."
                      value={formData.situation}
                      onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-400 mb-1.5">
                      Safe Immediate Steps (DO) — One step per line *
                    </label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Immediately cool under gentle cool running water for 10–20 minutes&#10;Remove jewelry or constricting garments before swelling occurs&#10;Cover loosely with clean, sterile plastic wrap or dressing"
                      value={formData.safeImmediateSteps}
                      onChange={(e) =>
                        setFormData({ ...formData, safeImmediateSteps: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-400 mb-1.5">
                      Things to Avoid (DO NOT) — One item per line *
                    </label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Do NOT apply bare ice or iced water directly onto burns&#10;Do NOT apply butter, toothpaste, cooking oil, or home remedies&#10;Do NOT pop or puncture intact blisters"
                      value={formData.thingsToAvoid}
                      onChange={(e) => setFormData({ ...formData, thingsToAvoid: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Warning Signs (One per line)
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Burn greater than palm size&#10;Involves face, hands, joints, or genitals"
                        value={formData.warningSigns}
                        onChange={(e) =>
                          setFormData({ ...formData, warningSigns: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        When to Seek Professional Care
                      </label>
                      <textarea
                        rows="2"
                        placeholder="All full-thickness burns require hospital evaluation&#10;Chemical or electrical burns require instant emergency attention"
                        value={formData.whenToSeekProfessionalCare}
                        onChange={(e) =>
                          setFormData({ ...formData, whenToSeekProfessionalCare: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Emergency Directive Warning
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyWarning}
                      onChange={(e) =>
                        setFormData({ ...formData, emergencyWarning: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Status Toggle */}
                  <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="block text-xs font-bold text-white">
                        Publication Status
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {formData.isPublished
                          ? 'Protocol will be publicly visible in First-Aid directory.'
                          : 'Protocol will be saved as draft, visible only to admins.'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) =>
                          setFormData({ ...formData, isPublished: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl text-xs font-black shadow-md transition"
                    >
                      {editingGuide ? 'Save Changes' : 'Publish Protocol'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
