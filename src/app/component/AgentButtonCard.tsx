'use client';

import React from 'react';
import { Bot, Sparkles, Zap, ArrowUpRight, Activity, Cpu, Brain } from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AgentStatus = 'Active' | 'Inactive' | 'Paused' | 'Error';
export type AgentType = 'Assistant' | 'Analyzer' | 'Generator' | 'Monitor' | 'Custom';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  type?: AgentType | string;
  activity?: number; // 0-100
  lastRun?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentCardProps {
  agent: Agent;
  index: number;
  isDialogOpen: boolean;
  onToggleDialog: () => void;
  onSelect: (agent: Agent) => void;
}

export interface AIAgentsSectionProps {
  agents: Agent[];
  isDialogOpen: boolean;
  onToggleDialog: () => void;
  onSelectAgent: (agent: Agent) => void;
  onCreateNew?: () => void;
  className?: string;
}

interface AccentTheme {
  gradient: string;
  border: string;
  glow: string;
  iconBg: string;
  iconColor: string;
  badge: string;
  status: string;
  accent: 'emerald' | 'sky' | 'amber' | 'rose' | 'violet' | 'cyan';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ACCENTS: AccentTheme[] = [
  {
    gradient: 'from-emerald-500/30 via-teal-400/20 to-cyan-500/10',
    border: 'border-emerald-400/50',
    glow: 'shadow-emerald-500/20',
    iconBg: 'from-emerald-100 to-teal-50',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
    status: 'bg-emerald-500',
    accent: 'emerald'
  },
  {
    gradient: 'from-sky-500/30 via-blue-400/20 to-indigo-500/10',
    border: 'border-sky-400/50',
    glow: 'shadow-sky-500/20',
    iconBg: 'from-sky-100 to-blue-50',
    iconColor: 'text-sky-600',
    badge: 'bg-sky-100/80 text-sky-800 border-sky-200',
    status: 'bg-sky-500',
    accent: 'sky'
  },
  {
    gradient: 'from-amber-500/30 via-orange-400/20 to-yellow-500/10',
    border: 'border-amber-400/50',
    glow: 'shadow-amber-500/20',
    iconBg: 'from-amber-100 to-orange-50',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100/80 text-amber-800 border-amber-200',
    status: 'bg-amber-500',
    accent: 'amber'
  },
  {
    gradient: 'from-rose-500/30 via-pink-400/20 to-fuchsia-500/10',
    border: 'border-rose-400/50',
    glow: 'shadow-rose-500/20',
    iconBg: 'from-rose-100 to-pink-50',
    iconColor: 'text-rose-600',
    badge: 'bg-rose-100/80 text-rose-800 border-rose-200',
    status: 'bg-rose-500',
    accent: 'rose'
  },
  {
    gradient: 'from-violet-500/30 via-purple-400/20 to-fuchsia-500/10',
    border: 'border-violet-400/50',
    glow: 'shadow-violet-500/20',
    iconBg: 'from-violet-100 to-purple-50',
    iconColor: 'text-violet-600',
    badge: 'bg-violet-100/80 text-violet-800 border-violet-200',
    status: 'bg-violet-500',
    accent: 'violet'
  },
  {
    gradient: 'from-cyan-500/30 via-cyan-400/20 to-blue-500/10',
    border: 'border-cyan-400/50',
    glow: 'shadow-cyan-500/20',
    iconBg: 'from-cyan-100 to-sky-50',
    iconColor: 'text-cyan-600',
    badge: 'bg-cyan-100/80 text-cyan-800 border-cyan-200',
    status: 'bg-cyan-500',
    accent: 'cyan'
  }
];

const ICONS = [Bot, Sparkles, Zap, Brain, Cpu, Activity] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getActivityColor = (activity: number): string => {
  if (activity >= 80) return 'bg-emerald-500';
  if (activity >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
};

const getStatusConfig = (status: AgentStatus) => {
  const configs: Record<AgentStatus, { bg: string; text: string; dot: string; animate: boolean }> = {
    Active: {
      bg: 'bg-emerald-100/80',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      animate: true
    },
    Inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      dot: 'bg-gray-400',
      animate: false
    },
    Paused: {
      bg: 'bg-amber-100/80',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      animate: false
    },
    Error: {
      bg: 'bg-rose-100/80',
      text: 'text-rose-800',
      dot: 'bg-rose-500',
      animate: false
    }
  };
  return configs[status] || configs.Inactive;
};

// ============================================================================
// COMPONENTS
// ============================================================================

const AgentButtonCard: React.FC<AgentCardProps> = ({
  agent,
  index,
  isDialogOpen,
  onToggleDialog,
  onSelect
}) => {
  const accent = ACCENTS[index % ACCENTS.length];
  const IconComponent = ICONS[index % ICONS.length];
  const statusConfig = getStatusConfig(agent.status);
  const isActive = agent.status === 'Active';

  const handleClick = React.useCallback(() => {
    onToggleDialog();
    onSelect(agent);
  }, [onToggleDialog, onSelect, agent]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        group relative w-full text-left overflow-hidden rounded-2xl 
        border border-gray-200/80 bg-white 
        transition-all duration-500 ease-out
        hover:border-${accent.accent}-400/60 hover:shadow-2xl hover:shadow-${accent.accent}-500/10
        hover:-translate-y-1
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-${accent.accent}-400 focus-visible:ring-offset-2
        active:scale-[0.98]
      `}
      aria-label={`Select agent ${agent.name}`}
    >
      {/* Animated gradient background */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br ${accent.gradient} 
          opacity-0 group-hover:opacity-100 
          transition-all duration-700 ease-out
          group-hover:scale-110
        `}
        aria-hidden="true"
      />

      {/* Mesh gradient overlay */}
      <div
        className="
          absolute inset-0 opacity-0 group-hover:opacity-30 
          transition-opacity duration-700
          bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]
        "
        aria-hidden="true"
      />

      {/* Particle effect */}
      <div
        className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/40 opacity-0 group-hover:opacity-100 group-hover:animate-ping"
        aria-hidden="true"
      />

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Icon container */}
          <div
            className={`
              relative shrink-0 w-14 h-14 rounded-xl 
              bg-gradient-to-br ${accent.iconBg}
              border border-gray-200/60
              flex items-center justify-center
              shadow-sm
              group-hover:shadow-lg group-hover:shadow-${accent.accent}-500/20
              group-hover:scale-105 group-hover:rotate-3
              transition-all duration-500 ease-out
            `}
            aria-hidden="true"
          >
            <IconComponent
              className={`
                w-6 h-6 ${accent.iconColor} 
                group-hover:scale-110 group-hover:rotate-6
                transition-transform duration-500
              `}
              aria-hidden="true"
            />

            {/* Status indicator */}
            <span
              className={`
                absolute -bottom-1 -right-1 w-3.5 h-3.5 
                rounded-full border-2 border-white ${accent.status}
                ${isActive ? 'animate-pulse shadow-lg shadow-current' : 'bg-gray-300'}
              `}
              aria-hidden="true"
            />

            {/* Glow effect */}
            <div
              className={`
                absolute inset-0 rounded-xl ${accent.status} opacity-0 
                group-hover:opacity-20 blur-xl
                transition-opacity duration-500
              `}
              aria-hidden="true"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                {agent.name}
              </h3>
              <ArrowUpRight
                className="
                  w-4 h-4 text-gray-400 
                  opacity-0 -translate-x-2 translate-y-2 
                  group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 
                  group-hover:text-gray-600
                  transition-all duration-500 ease-out
                "
                aria-hidden="true"
              />
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
              {agent.description}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {agent.type && (
                <span
                  className={`
                    inline-flex items-center px-2.5 py-1 
                    text-xs font-semibold rounded-lg border
                    ${accent.badge}
                    shadow-sm
                    group-hover:shadow-md
                    transition-shadow duration-300
                  `}
                >
                  {agent.type}
                </span>
              )}
              <span
                className={`
                  inline-flex items-center px-2.5 py-1 
                  text-xs font-semibold rounded-lg border
                  ${statusConfig.bg} ${statusConfig.text}
                  ${isActive ? 'shadow-sm shadow-emerald-500/10' : ''}
                `}
              >
                <span
                  className={`
                    w-1.5 h-1.5 rounded-full mr-1.5
                    ${statusConfig.dot}
                    ${statusConfig.animate ? 'animate-pulse' : ''}
                  `}
                  aria-hidden="true"
                />
                {agent.status}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {isActive && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>Activity</span>
              <span className="font-medium text-gray-700">{agent.activity ?? 0}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`
                  h-full rounded-full 
                  ${getActivityColor(agent.activity ?? 0)}
                  transition-all duration-1000 ease-out
                  group-hover:animate-pulse
                `}
                style={{ width: `${agent.activity ?? 75}%` }}
                role="progressbar"
                aria-valuenow={agent.activity ?? 75}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom gradient line */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-0.5 
          bg-gradient-to-r from-transparent via-${accent.accent}-400 to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-500
        `}
        aria-hidden="true"
      />

      {/* Corner decoration */}
      <div
        className={`
          absolute -bottom-8 -right-8 w-24 h-24 
          bg-gradient-to-br from-${accent.accent}-200/30 to-transparent 
          rounded-full blur-2xl
          opacity-0 group-hover:opacity-100
          transition-all duration-700 group-hover:scale-150
        `}
        aria-hidden="true"
      />
    </button>
  );
};

// ============================================================================
// MAIN SECTION COMPONENT
// ============================================================================

const AIAgentsSection: React.FC<AIAgentsSectionProps> = ({
  agents,
  isDialogOpen,
  onToggleDialog,
  onSelectAgent,
  onCreateNew,
  className = ''
}) => {
  const activeCount = React.useMemo(() =>
    agents.filter(a => a.status === 'Active').length,
    [agents]);

  const handleCreateNew = React.useCallback(() => {
    onCreateNew?.();
  }, [onCreateNew]);

  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg border border-gray-200/60">
            <Bot className="w-5 h-5 text-gray-700" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              AI Agents
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {agents.length} agents available • {activeCount} active
            </p>
          </div>
        </div>

        {onCreateNew && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="
              flex items-center gap-2 px-4 py-2 
              text-sm font-medium text-gray-700 
              bg-white border border-gray-200 rounded-lg
              hover:bg-gray-50 hover:border-gray-300
              hover:shadow-md hover:shadow-gray-500/5
              transition-all duration-300
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2
              active:scale-95
            "
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>New Agent</span>
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent, i) => (
          <AgentButtonCard
            key={agent.id}
            agent={agent}
            index={i}
            isDialogOpen={isDialogOpen}
            onToggleDialog={onToggleDialog}
            onSelect={onSelectAgent}
          />
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Bot className="w-8 h-8 text-gray-400" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">No agents found</h3>
          <p className="text-xs text-gray-500 mt-1">Create your first agent to get started</p>
        </div>
      )}
    </section>
  );
};

export default AIAgentsSection;