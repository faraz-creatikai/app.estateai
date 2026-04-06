"use client";

import { useState } from "react";
import { BounceLoader, BeatLoader, HashLoader } from "react-spinners";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { HiOutlineSparkles } from "react-icons/hi2";
import { TbTargetArrow } from "react-icons/tb";
import { MdOutlineRadar } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIAgent {
   id: string
  name: string
  description: string
  type: string
  status: string
  campaign?: string
  targetSegment?: string
  capability?: string
  tasksCompleted?: number
  accuracy?: number
  createdAt?: Date
  assignedUsers?: string[]
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  Matching: <HiOutlineSparkles className="w-4 h-4" />,
  Targeting: <TbTargetArrow className="w-4 h-4" />,
  Scanning: <MdOutlineRadar className="w-4 h-4" />,
};

const AGENT_TYPE_COLORS: Record<string, string> = {
  Matching:
    "bg-violet-50 border-violet-200 text-violet-700 group-data-[selected=true]:border-violet-500 group-data-[selected=true]:bg-violet-100",
  Targeting:
    "bg-sky-50 border-sky-200 text-sky-700 group-data-[selected=true]:border-sky-500 group-data-[selected=true]:bg-sky-100",
  Scanning:
    "bg-emerald-50 border-emerald-200 text-emerald-700 group-data-[selected=true]:border-emerald-500 group-data-[selected=true]:bg-emerald-100",
};

const AGENT_GLOW: Record<string, string> = {
  Matching: "shadow-[0_0_0_3px_rgba(139,92,246,0.15)]",
  Targeting: "shadow-[0_0_0_3px_rgba(14,165,233,0.15)]",
  Scanning: "shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
};

const BADGE_COLORS: Record<string, string> = {
  Matching: "bg-violet-100 text-violet-600",
  Targeting: "bg-sky-100 text-sky-600",
  Scanning: "bg-emerald-100 text-emerald-600",
};

const SEARCH_FIELDS = ["Name", "Email", "Company", "Title", "Location", "Industry"];

// ─── Agent Card ───────────────────────────────────────────────────────────────
function AgentCard({
  agent,
  isSelected,
  onSelect,
}: {
  agent: AIAgent;
  isSelected: boolean;
  onSelect: (agent: AIAgent) => void;
}) {
  const colorClass =
    AGENT_TYPE_COLORS[agent.type] ??
    "bg-gray-50 border-gray-200 text-gray-700 group-data-[selected=true]:border-gray-500 group-data-[selected=true]:bg-gray-100";
  const glowClass = AGENT_GLOW[agent.type] ?? "";
  const badgeClass = BADGE_COLORS[agent.type] ?? "bg-gray-100 text-gray-600";
  const icon = AGENT_ICONS[agent.type] ?? <HiOutlineSparkles className="w-4 h-4" />;

  return (
    <button
      type="button"
      data-selected={isSelected}
      className={`group relative flex flex-col gap-2 p-4 rounded-xl border-2 text-left cursor-pointer
        transition-all duration-200 min-w-[200px] max-w-[220px] flex-shrink-0 bg-white
        hover:-translate-y-[2px]
        ${colorClass}
        ${isSelected ? glowClass : "hover:shadow-md"}
        ${isSelected ? "border-opacity-100" : "border-opacity-60"}
      `}
      onClick={() => onSelect(agent)}
    >
      {/* Status dot */}
      <span
        className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
          agent.status === "Active" ? "bg-green-400" : "bg-gray-300"
        }`}
      />

      {/* Icon + Name */}
      <div className="flex items-center gap-2">
        <span
          className={`p-1.5 rounded-lg ${badgeClass} transition-all duration-200`}
        >
          {icon}
        </span>
        <span className="font-semibold text-sm text-gray-800 leading-tight">
          {agent.name}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
        {agent.description}
      </p>

      {/* Type badge */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${badgeClass}`}>
          {agent.type}
        </span>
        {isSelected && (
          <span className="text-[10px] font-medium text-gray-400 animate-pulse">
            Active
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentSelector({
  agents,
  // ── pass your existing state & handlers as props ──
  keywordInput,
  setKeywordInput,
  filters,
  setFilters,
  aiLoading,
  setAiLoading,
  currentStep,
  setCurrentStep,
  toggleAiGenieSearchBy,
  setToggleAiGenieSearchBy,
  STEPS,
  aiGenieSearch,
  clearFilter,
}: {
  agents: AIAgent[];
  keywordInput: string;
  setKeywordInput: (v: string) => void;
  filters: { SearchIn: string[] };
  setFilters: React.Dispatch<React.SetStateAction<{ SearchIn: string[] }>>;
  aiLoading: boolean;
  setAiLoading: (v: boolean) => void;
  currentStep: string;
  setCurrentStep: (v: string) => void;
  toggleAiGenieSearchBy: boolean;
  setToggleAiGenieSearchBy: (v: boolean) => void;
  STEPS: Record<string, string>;
  aiGenieSearch: () => void;
  clearFilter: () => void;
}) {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const handleAgentSelect = (agent: AIAgent) => {
    setSelectedAgent((prev) => (prev?.id === agent.id ? null : agent));
  };

  const isMatchingSelected = selectedAgent?.type === "Matching";

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-2">
          AI Agents
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
      </div>

      {/* ── Agent Cards Scroll Row ── */}
      <div className="relative">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent z-10" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scroll-smooth
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {agents.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
              <span className="animate-spin text-base">⟳</span> Loading agents…
            </div>
          ) : (
            agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={selectedAgent?.id === agent.id}
                onSelect={handleAgentSelect}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Matching Agent Panel: Keyword Search ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isMatchingSelected ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {isMatchingSelected && (
          <div className="border border-violet-200 rounded-2xl bg-violet-50/40 p-5
            shadow-[0_2px_20px_rgba(139,92,246,0.07)]">

            {/* Panel header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 rounded-lg bg-violet-100 text-violet-600">
                <HiOutlineSparkles className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-violet-800">
                  {selectedAgent?.name}
                </p>
                <p className="text-xs text-violet-400">{selectedAgent?.description}</p>
              </div>
            </div>

            {/* ── Your existing Keyword Search form — untouched logic ── */}
            <form
              className="flex max-lg:flex-col justify-between items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (keywordInput.trim() === "") return;
                setAiLoading(true);
                setCurrentStep(STEPS.SEARCH);
                aiGenieSearch();
              }}
            >
              <div className="w-[80%]">
                <div>
                  <label className="flex gap-1 mb-2 items-center text-sm font-bold text-[var(--color-secondary-darker)] ml-1">
                    {aiLoading ? (
                      <span>
                        <BounceLoader
                          loading={true}
                          color="var(--color-primary)"
                          size={25}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                      </span>
                    ) : (
                      <span>
                        <img className="w-[25px]" src="/aiBot.png" alt="AI" />
                      </span>
                    )}
                    <div className="">AI Genie</div>
                  </label>

                  <p className="text-gray-400 font-light text-xs ml-2 mb-2 flex items-center gap-[1px]">
                    <span className="transition-opacity duration-300">{currentStep}</span>
                    {aiLoading && (
                      <span className="translate-y-[2px]">
                        <BeatLoader size={2} color="gray" />
                      </span>
                    )}
                  </p>

                  <div>
                    <div className="flex justify-between items-center border border-gray-300 rounded-md w-full bg-white">
                      <input
                        type="text"
                        placeholder="What you want to search?"
                        className="outline-none w-full px-3 py-2 bg-transparent"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                      />
                      <span
                        className="cursor-pointer mr-3"
                        onClick={() => setToggleAiGenieSearchBy(!toggleAiGenieSearchBy)}
                      >
                        {toggleAiGenieSearchBy ? <FaCaretUp /> : <FaCaretDown />}
                      </span>
                    </div>

                    <div
                      className={`mt-5 overflow-hidden transition-all duration-300 ${
                        toggleAiGenieSearchBy ? "h-[150px]" : "h-0"
                      }`}
                    >
                      {/* Unselected Fields */}
                      <div className="flex flex-wrap gap-2 px-3 mb-5">
                        {SEARCH_FIELDS.filter(
                          (f) => !filters.SearchIn.includes(f)
                        ).map((field) => (
                          <button
                            key={field}
                            type="button"
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                SearchIn: [...prev.SearchIn, field],
                              }))
                            }
                          >
                            {field.toLowerCase()}
                          </button>
                        ))}
                      </div>

                      {/* Selected Fields */}
                      <div>
                        {filters.SearchIn.length > 0 && (
                          <h5 className="text-gray-500 text-sm my-2 mx-2">Selected</h5>
                        )}
                        <div className="flex flex-wrap gap-2 px-3">
                          {filters.SearchIn.map((field) => (
                            <div
                              key={field}
                              className="group relative flex items-center px-2 py-1 border border-blue-400 rounded-md text-sm bg-blue-100"
                            >
                              {field.toLowerCase()}
                              <button
                                className="ml-2 opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity text-sm text-[var(--color-primary)]"
                                onClick={() =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    SearchIn: prev.SearchIn.filter((f) => f !== field),
                                  }))
                                }
                              >
                                <IoMdClose />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`flex justify-center items-center w-[30%] transition duration-300 ${
                  toggleAiGenieSearchBy ? "lg:-mt-32" : "lg:mt-5"
                }`}
              >
                {!aiLoading ? (
                  <button
                    type="submit"
                    className="border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 cursor-pointer px-3 py-2 rounded-md"
                  >
                    Explore
                  </button>
                ) : (
                  <button
                    type="button"
                    className="flex gap-1 justify-center items-center border border-[var(--color-primary)] bg-[var(--color-primary)] text-white transition-all duration-300 cursor-pointer px-3 py-2 rounded-md"
                  >
                    Exploring{" "}
                    <HashLoader
                      loading={true}
                      color="white"
                      size={12}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  </button>
                )}

                <button
                  type="reset"
                  onClick={clearFilter}
                  className="text-red-500 cursor-pointer hover:underline text-sm px-5 py-2 rounded-md ml-3"
                >
                  Clear Search
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Non-matching agent placeholder ── */}
      {selectedAgent && !isMatchingSelected && (
        <div className="border border-dashed border-gray-300 rounded-2xl p-5 bg-gray-50 text-center">
          <p className="text-sm text-gray-400">
            <span className="font-medium text-gray-500">{selectedAgent.name}</span> is a{" "}
            <span className="font-medium">{selectedAgent.type}</span> agent — its controls
            will appear here.
          </p>
        </div>
      )}
    </div>
  );
}