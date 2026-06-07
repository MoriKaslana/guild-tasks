import React, { forwardRef, useState } from "react"; // Tambahkan useState
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Zap,
  CheckCircle,
  Send,
  Swords,
  ChevronDown,
  ChevronUp,
} from "lucide-react"; // Tambahkan icon chevron
import { Quest } from "@/types/game";
import SubmitQuestModal from "@/components/SubmitQuestModal";

const diffBadge: Record<string, string> = {
  easy: "bg-emerald/20 text-emerald-glow",
  medium: "bg-gold/20 text-gold",
  hard: "bg-crimson/20 text-crimson",
  legendary: "bg-royal-purple/20 text-royal-purple",
};

const QuestCard = forwardRef<HTMLDivElement, { quest: Quest }>(
  ({ quest, ...props }, ref) => {
    const { currentUser, acceptQuest, submitQuest, users } = useGame();

    // --- STATE FOR EXPANDABLE DESCRIPTION ---
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    const timeLeft =
      quest.status === "submitted"
        ? 0
        : Math.max(0, quest.deadline - Date.now());
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minsLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    const isDuelActive = quest.isDuel && quest.duelStatus === "accepted";
    const glowClass =
      quest.status === "submitted"
        ? "gold-glow"
        : quest.status === "completed"
          ? "green-glow"
          : "";

    const cardStyle = isDuelActive
      ? "border-crimson bg-crimson/5 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
      : `border-white/5 bg-card/50 ${glowClass}`;

    const opponentId =
      quest.challengerId === currentUser?.id
        ? quest.duelOpponentId
        : quest.challengerId;
    const opponentName =
      users.find((u) => u.id === opponentId)?.username || "Lawan";

    // Cek apakah deskripsi cukup panjang untuk memicu tombol "More" (opsional, atau tampilkan selalu jika ingin aman)
    const isLongDescription = quest.description.length > 80;

    return (
      <motion.div
        {...props}
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`scroll-card rounded-lg p-5 border transition-all relative ${cardStyle}`}
      >
        {isDuelActive && (
          <div className="absolute -top-3 -right-3 bg-crimson p-2 rounded-full shadow-lg z-10 animate-pulse border border-white/20">
            <Swords className="h-4 w-4 text-white" />
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-base text-foreground line-clamp-1">
              {quest.title}
            </h3>

            {isDuelActive && (
              <span className="text-[10px] text-crimson font-bold uppercase tracking-tighter flex items-center gap-1">
                ⚔️ Duel vs @{opponentName}
              </span>
            )}

            {quest.isDuel && quest.duelStatus === "pending" && (
              <span className="text-[10px] text-gold/60 italic font-body">
                {quest.challengerId === currentUser?.id
                  ? "⌛ Menunggu Lawan..."
                  : "📩 Tantangan Duel Masuk!"}
              </span>
            )}
          </div>

          <span
            className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-bold ${diffBadge[quest.difficulty]}`}
          >
            {quest.difficulty}
          </span>
        </div>

        {/* --- BOX DESKRIPSI --- */}
        <div className="mb-4">
          <p
            className={`text-sm text-muted-foreground font-body transition-all duration-300 ${isExpanded ? "" : "line-clamp-2"}`}
          >
            {quest.description}
          </p>

          {/* Tombol View More / Less hanya muncul jika deskripsi panjang */}
          {isLongDescription && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gold/80 hover:text-gold mt-1 font-heading flex items-center gap-0.5 transition-colors focus:outline-none"
            >
              {isExpanded ? (
                <>
                  Sembunyikan <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Lihat Selengkapnya <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 font-body">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-gold" /> {quest.xpReward} XP
          </span>
          {quest.status !== "completed" && quest.status !== "submitted" && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : "Overdue!"}
            </span>
          )}
          {quest.status === "submitted" && (
            <span className="flex items-center gap-1 text-gold">
              <Send className="h-3 w-3" /> Timer Frozen
            </span>
          )}
          {quest.status === "completed" && (
            <span className="flex items-center gap-1 text-emerald-glow">
              <CheckCircle className="h-3 w-3" /> Completed
            </span>
          )}
        </div>

        {quest.status === "open" && !quest.isDuel && (
          <Button
            onClick={() => acceptQuest(quest.id)}
            className="w-full font-heading"
            size="sm"
          >
            Terima Tugas
          </Button>
        )}

        {quest.status === "accepted" &&
          quest.assignedTo === currentUser?.id && (
            <Button
              onClick={() => setIsSubmitModalOpen(true)}
              variant={isDuelActive ? "destructive" : "secondary"}
              className={`w-full font-heading border ${isDuelActive ? "bg-crimson hover:bg-red-700 border-white/20" : "border-gold/30"}`}
              size="sm"
            >
              {isDuelActive ? "Finish Duel!" : "Kumpulkan Tugas"}
            </Button>
          )}

        <SubmitQuestModal
          quest={quest}
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmit={(file) => submitQuest(quest.id, file)}
        />
      </motion.div>
    );
  },
);

QuestCard.displayName = "QuestCard";

export default QuestCard;
