import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap } from "lucide-react";

const ReviewBoard = () => {
  const { quests, users, approveQuest, currentUser } = useGame();

  if (currentUser?.role !== "guild_master") {
    return <div className="p-6 text-muted-foreground">Access denied.</div>;
  }

  const submitted = quests.filter(q => q.status === "submitted");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="font-heading text-2xl text-gold mb-6">⚖️ Review Board</h1>

      {submitted.length === 0 && (
        <p className="text-muted-foreground font-body text-center py-12">No quests awaiting review.</p>
      )}

      <div className="space-y-4">
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
                      <span>Submitted by: <strong className="text-gold">{adventurer?.username || "Unknown"}</strong></span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-gold" /> {q.xpReward} XP</span>
                    </div>
                  </div>
                  <Button onClick={() => approveQuest(q.id)} className="font-heading shrink-0">
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewBoard;
