import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Zap, AlertTriangle } from "lucide-react";
import { TutorialOverlay } from "@/components/TutorialOverlay";
// Import komponen Dialog UI untuk modal konfirmasi
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ReviewBoard = () => {
  const { quests, users, approveQuest, rejectQuest, currentUser } = useGame();

  // --- LOGIKA TUTORIAL ---
  const [showTutorial, setShowTutorial] = useState(false);
  
  // --- STATE KONFIRMASI ---
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    questId: null,
    questTitle: "",
    type: null, // "approve" atau "reject"
  });

  useEffect(() => {
    if (currentUser?.role === "guild_master") {
      const hasSeen = localStorage.getItem(`gm_review_tutorial_done_${currentUser.id}`);
      if (!hasSeen) {
        setShowTutorial(true);
      }
    }
  }, [currentUser]);

  const finishTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(`gm_review_tutorial_done_${currentUser?.id}`, "true");
  };

  if (currentUser?.role !== "guild_master") {
    return <div className="p-6 text-muted-foreground">Access denied.</div>;
  }

  const submitted = quests.filter(q => q.status === "submitted");

  // Fungsi untuk memicu modal konfirmasi
  const handleActionClick = (questId, questTitle, type) => {
    setConfirmModal({
      isOpen: true,
      questId,
      questTitle,
      type,
    });
  };

  // Fungsi eksekusi setelah dikonfirmasi "Ya"
  const handleConfirmExecute = () => {
    const { questId, type } = confirmModal;
    if (type === "approve") {
      approveQuest(questId);
    } else if (type === "reject") {
      rejectQuest(questId);
    }
    // Reset state modal
    setConfirmModal({ isOpen: false, questId: null, questTitle: "", type: null });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      {/* Tutorial Overlay */}
      <TutorialOverlay 
        isOpen={showTutorial}
        targetId="review-list"
        title="Singgasana Keadilan"
        text="Di sinilah Anda menentukan nasib para adventurer. Tinjau laporan mereka: Terima jika layak mendapat XP, atau Tolak jika laporannya kurang memuaskan. Keputusan ada di tangan Anda, Guild Master!"
        currentStep={0}
        totalSteps={1}
        onNext={finishTutorial}
        onPrev={() => {}}
        onSkip={finishTutorial}
      />

      <h1 className="font-heading text-2xl text-gold mb-6">⚖️ Papan Ulasan</h1>

      {submitted.length === 0 && (
        <p className="text-muted-foreground font-body text-center py-12">
          Tidak ada tugas yang sedang menunggu ulasan.
        </p>
      )}

      <div className="space-y-4" id="review-list">
        <AnimatePresence>
          {submitted.map(q => {
            const adventurer = users.find(u => u.id === q.assignedTo);
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="scroll-card gold-glow rounded-lg p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-foreground">{q.title}</h3>
                    <p className="text-sm text-muted-foreground font-body mt-1">{q.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>Submitted by: <strong className="text-gold">@{adventurer?.username || "Unknown"}</strong></span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-gold" /> {q.xpReward} XP</span>
                      {q.wasRejected && (
                        <span className="text-crimson font-heading">🛡️💔 Previously Rejected</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {/* Mengubah handler onClick langsung ke handleActionClick */}
                    <Button 
                      onClick={() => handleActionClick(q.id, q.title, "reject")} 
                      variant="outline" 
                      className="font-heading border-crimson/30 text-crimson hover:bg-crimson/10" 
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Tolak
                    </Button>
                    <Button 
                      onClick={() => handleActionClick(q.id, q.title, "approve")} 
                      className="font-heading" 
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Terima
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* --- MODAL KONFIRMASI (SEGEL TAKDIR / TITAH GUILD MASTER) --- */}
      <Dialog 
        open={confirmModal.isOpen} 
        onOpenChange={(open) => !open && setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      >
        <DialogContent className="sm:max-w-md border-gold/30 bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${confirmModal.type === 'approve' ? 'text-gold' : 'text-crimson'}`} />
              {confirmModal.type === "approve" ? "Konfirmasi Penerimaan Tugas" : "Konfirmasi Penolakan Tugas"}
            </DialogTitle>
            <DialogDescription className="font-body text-sm pt-2">
              {confirmModal.type === "approve" ? (
                <>
                  Apakah Anda yakin ingin <strong className="text-gold">MENERIMA</strong> laporan tugas <span className="italic text-foreground">"{confirmModal.questTitle}"</span>? Tindakan ini akan mencairkan XP ke Adventurer terkait.
                </>
              ) : (
                <>
                  Apakah Anda yakin ingin <strong className="text-crimson">MENOLAK</strong> laporan tugas <span className="italic text-foreground">"{confirmModal.questTitle}"</span>? Tugas akan dikembalikan ke papan tugas Adventurer.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="font-heading border-muted-foreground/20 text-muted-foreground"
            >
              Batalkan
            </Button>
            <Button
              onClick={handleConfirmExecute}
              className={`font-heading ${
                confirmModal.type === "approve" 
                  ? "bg-gold text-background hover:bg-gold/90" 
                  : "bg-crimson text-white hover:bg-crimson/90"
              }`}
            >
              {confirmModal.type === "approve" ? "Ya, Terima" : "Ya, Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewBoard;