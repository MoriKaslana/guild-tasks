import React, { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Zap,
  CheckCircle,
  Send,
  Swords,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  CalendarIcon,
} from "lucide-react";
import { Quest, QuestDifficulty } from "@/types/game";
import SubmitQuestModal from "@/components/SubmitQuestModal";
import { XP_MAP } from "@/context/services/gamificationService";
import { cn } from "@/lib/utils";

const diffBadge: Record<string, string> = {
  easy: "bg-emerald/20 text-emerald-glow",
  medium: "bg-gold/20 text-gold",
  hard: "bg-crimson/20 text-crimson",
  legendary: "bg-royal-purple/20 text-royal-purple",
};

const QuestCard = forwardRef<HTMLDivElement, { quest: Quest }>(
  ({ quest, ...props }, ref) => {
    const { currentUser, acceptQuest, submitQuest, updateQuest, deleteQuest, users } = useGame();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

    // Edit form state — pre-populated from quest.deadline
    const [editTitle, setEditTitle] = useState(quest.title);
    const [editDesc, setEditDesc] = useState(quest.description);
    const [editDiff, setEditDiff] = useState<QuestDifficulty>(quest.difficulty);

    const initDate = quest.deadline ? new Date(quest.deadline) : new Date();
    const initH24 = initDate.getHours();
    const initH12 = initH24 % 12 || 12;
    const initMinutes = initDate.getMinutes();
    const nearestMin = ["00", "15", "30", "45"].reduce((prev, cur) =>
      Math.abs(parseInt(cur) - initMinutes) < Math.abs(parseInt(prev) - initMinutes) ? cur : prev
    );
    const [editDeadlineDate, setEditDeadlineDate] = useState<Date | undefined>(initDate);
    const [editDeadlineHour, setEditDeadlineHour] = useState(String(initH12).padStart(2, "0"));
    const [editDeadlineMinute, setEditDeadlineMinute] = useState(nearestMin);
    const [editDeadlinePeriod, setEditDeadlinePeriod] = useState<"AM" | "PM">(initH24 >= 12 ? "PM" : "AM");

    const isGMOwner =
      currentUser?.role === "guild_master" &&
      quest.createdBy === currentUser.id &&
      quest.status === "open";

    const handleEditSave = async () => {
      if (!editTitle.trim() || !editDeadlineDate) return;
      const d = new Date(editDeadlineDate);
      let h = parseInt(editDeadlineHour);
      if (editDeadlinePeriod === "AM" && h === 12) h = 0;
      if (editDeadlinePeriod === "PM" && h !== 12) h += 12;
      d.setHours(h, parseInt(editDeadlineMinute), 0, 0);
      await updateQuest(quest.id, editTitle.trim(), editDesc.trim(), editDiff, d.getTime());
      setIsEditOpen(false);
    };

    const handleDelete = async () => {
      await deleteQuest(quest.id);
      setIsDeleteConfirm(false);
    };

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

          <div className="flex items-center gap-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-bold ${diffBadge[quest.difficulty]}`}
            >
              {quest.difficulty}
            </span>
            {isGMOwner && (
              <>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-gold transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsDeleteConfirm(true)}
                  className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-crimson transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
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
              {timeLeft > 0
                ? `${hoursLeft}h ${minsLeft}m · ${new Date(quest.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                : "Overdue!"}
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

        {/* --- EDIT DIALOG --- */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-card border-white/10 text-foreground">
            <DialogHeader>
              <DialogTitle className="font-heading">Edit Quest</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Judul</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-gold/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Deskripsi</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-gold/50 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Tingkat Kesulitan</label>
                <div className="flex gap-2">
                  {(["easy", "medium", "hard", "legendary"] as QuestDifficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setEditDiff(d)}
                      className={`flex-1 py-1 text-xs rounded border font-heading uppercase transition-colors ${
                        editDiff === d
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Deadline</label>
                <div className="flex flex-wrap gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 min-w-[140px] justify-start text-left font-body bg-secondary border-border",
                          !editDeadlineDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editDeadlineDate ? format(editDeadlineDate, "PPP") : "Pilih Tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editDeadlineDate}
                        onSelect={setEditDeadlineDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center gap-1 bg-secondary border border-border rounded-md px-2">
                    <Select value={editDeadlineHour} onValueChange={setEditDeadlineHour}>
                      <SelectTrigger className="w-14 border-none bg-transparent focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">:</span>
                    <Select value={editDeadlineMinute} onValueChange={setEditDeadlineMinute}>
                      <SelectTrigger className="w-14 border-none bg-transparent focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["00", "15", "30", "45"].map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={editDeadlinePeriod} onValueChange={(v) => setEditDeadlinePeriod(v as "AM" | "PM")}>
                      <SelectTrigger className="w-16 border-none bg-transparent focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Batal</Button>
              <Button onClick={handleEditSave} className="font-heading">Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* --- DELETE CONFIRM DIALOG --- */}
        <Dialog open={isDeleteConfirm} onOpenChange={setIsDeleteConfirm}>
          <DialogContent className="bg-card border-white/10 text-foreground">
            <DialogHeader>
              <DialogTitle className="font-heading text-crimson">Hapus Quest?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground font-body py-2">
              Quest <span className="text-foreground font-semibold">"{quest.title}"</span> akan dihapus permanen.
            </p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDeleteConfirm(false)}>Batal</Button>
              <Button variant="destructive" onClick={handleDelete} className="font-heading">Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  },
);

QuestCard.displayName = "QuestCard";

export default QuestCard;
