import { motion } from "framer-motion";

const BUFFS = [
  { name: "Adventurer's Haste", icon: "⚡", desc: "Earned by submitting a quest with more than 50% time remaining. Your swiftness is legendary!" },
  { name: "Scholar's Focus", icon: "📚", desc: "Earned by completing a Hard or Legendary quest. Your dedication to challenging tasks is admirable." },
  { name: "Weekend Warrior", icon: "🗡️", desc: "Earned by submitting a quest on a weekend. Even on rest days, you press forward!" },
];

const DEBUFFS = [
  { name: "Cursed Procrastination", icon: "🐌", desc: "Applied when a quest is submitted after the deadline. Time waits for no one!" },
  { name: "Slacker's Fatigue", icon: "😴", desc: "Applied when you have more than 5 active quests. Too many tasks weigh heavily on your shoulders." },
  { name: "Rusty Equipment", icon: "🪓", desc: "Applied after 7 days of inactivity. A warrior must keep their blade sharp!" },
];

const ROLES = [
  { name: "Guild Master", icon: "👑", desc: "The leader who creates quests, reviews submissions, and manages the guild. Can invite adventurers and approve completed quests." },
  { name: "Adventurer", icon: "⚔️", desc: "The brave soul who accepts quests, battles deadlines, and earns XP. Can accept missions and submit them for review." },
];

const Codex = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="font-heading text-2xl text-gold mb-2">📖 Guild Codex</h1>
      <p className="text-muted-foreground font-body mb-8">The sacred tome of guild knowledge</p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <CodexSection title="⚜️ Roles" items={ROLES} />
        <CodexSection title="✨ Buffs" items={BUFFS} color="text-emerald-glow" />
        <CodexSection title="💀 Debuffs" items={DEBUFFS} color="text-crimson" />

        <div className="parchment-bg rounded-lg p-6 border border-gold/20">
          <h2 className="font-heading text-lg text-gold mb-3">📋 Quest Workflow</h2>
          <div className="space-y-2 font-body text-sm text-foreground">
            <p>1. <strong className="text-gold">Guild Master</strong> posts a quest with title, description, difficulty, and deadline.</p>
            <p>2. <strong className="text-gold">Adventurer</strong> accepts the quest from the board.</p>
            <p>3. Adventurer works on the quest and clicks <strong>"Submit for Review"</strong>.</p>
            <p>4. <strong>⏱️ CRITICAL:</strong> The deadline timer <strong>freezes</strong> upon submission to prevent late penalties from GM review delay.</p>
            <p>5. Guild Master reviews and <strong>approves</strong> the quest.</p>
            <p>6. XP, Buffs, and Debuffs are applied to the adventurer's profile.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CodexSection = ({ title, items, color }: { title: string; items: { name: string; icon: string; desc: string }[]; color?: string }) => (
  <div>
    <h2 className="font-heading text-lg text-gold mb-3">{title}</h2>
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.name} className="scroll-card rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">{item.icon}</span>
          <div>
            <h3 className={`font-heading text-sm ${color || "text-foreground"}`}>{item.name}</h3>
            <p className="text-sm text-muted-foreground font-body mt-0.5">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Codex;
