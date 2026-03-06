import { motion } from "framer-motion";

const BUFFS = [
  { name: "Adventurer's Haste", icon: "⚡", desc: "Earned by submitting a quest with more than 50% time remaining. Your swiftness is legendary!", howTo: "Submit any quest before half the deadline has passed." },
  { name: "Scholar's Focus", icon: "📚", desc: "Earned by completing a Hard or Legendary quest. Your dedication to challenging tasks is admirable.", howTo: "Submit a quest with difficulty set to Hard or Legendary." },
  { name: "Weekend Warrior", icon: "🗡️", desc: "Earned by submitting a quest on a weekend. Even on rest days, you press forward!", howTo: "Submit any quest on a Saturday or Sunday." },
  { name: "Night Owl", icon: "🦉", desc: "Earned by submitting a quest between midnight and 5 AM. The guild never sleeps.", howTo: "Submit a quest between 12:00 AM and 4:59 AM." },
  { name: "Clutch Player", icon: "🎯", desc: "Earned by submitting just before the deadline — within the last 10% of time. Living on the edge!", howTo: "Submit a quest when less than 10% of the total time remains." },
  { name: "First Strike", icon: "⚔️", desc: "Earned by submitting a quest within 1 hour of accepting it. Lightning-fast execution!", howTo: "Accept and submit a quest within 60 minutes." },
];

const DEBUFFS = [
  { name: "Cursed Procrastination", icon: "🐌", desc: "Applied when a quest is submitted after the deadline. Time waits for no one!", howTo: "Submit any quest after its deadline has passed." },
  { name: "Slacker's Fatigue", icon: "😴", desc: "Applied when you have more than 5 active quests. Too many tasks weigh heavily on your shoulders.", howTo: "Accept more than 5 quests without completing or submitting them." },
  { name: "Rusty Equipment", icon: "🪓", desc: "Applied after 7 days of inactivity. A warrior must keep their blade sharp!", howTo: "Go 7 days without completing any quest." },
  { name: "Dragon's Shame", icon: "🐉", desc: "Applied when a quest is massively overdue — more than double the allotted time. The guild whispers...", howTo: "Submit a quest so late that the overdue time exceeds the original deadline duration." },
];

const ACHIEVEMENTS = [
  { name: "First Blood", icon: "⚔️", desc: "Complete your first quest.", howTo: "Have your first quest approved by a Guild Master." },
  { name: "Seasoned Warrior", icon: "🛡️", desc: "Complete 5 quests.", howTo: "Accumulate 5 approved quest completions." },
  { name: "Veteran", icon: "🏅", desc: "Complete 10 quests.", howTo: "Accumulate 10 approved quest completions." },
  { name: "Speed Demon", icon: "⚡", desc: "Submit a quest within 1 hour of accepting.", howTo: "Accept a quest and submit it within 60 minutes." },
  { name: "Legend", icon: "👑", desc: "Complete a legendary quest.", howTo: "Have a Legendary-difficulty quest approved." },
  { name: "Tavern Regular", icon: "🍻", desc: "Send 10 messages in the tavern.", howTo: "Post at least 10 messages in the Tavern chat." },
  { name: "Rising Star", icon: "⭐", desc: "Reach level 5.", howTo: "Earn enough XP to reach level 5 (800 XP total)." },
  { name: "Elite Warrior", icon: "💎", desc: "Reach level 10.", howTo: "Earn enough XP to reach level 10 (1800 XP total)." },
  { name: "Hat Trick", icon: "🎯", desc: "Complete 3 quests in a row without a debuff.", howTo: "Complete 3 consecutive quests without earning any debuff." },
  { name: "Jack of All Trades", icon: "🃏", desc: "Complete one quest of each difficulty.", howTo: "Complete at least one Easy, Medium, Hard, and Legendary quest." },
  { name: "Night Owl", icon: "🦉", desc: "Submit a quest between midnight and 5 AM.", howTo: "Submit any quest between 12:00 AM and 4:59 AM." },
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

        <div>
          <h2 className="font-heading text-lg text-gold mb-3">✨ Buffs</h2>
          <div className="space-y-3">
            {BUFFS.map(item => (
              <div key={item.name} className="scroll-card rounded-lg p-4 flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="font-heading text-sm text-emerald-glow">{item.name}</h3>
                  <p className="text-sm text-muted-foreground font-body mt-0.5">{item.desc}</p>
                  <div className="mt-2 flex items-start gap-1.5 bg-emerald/10 rounded px-2.5 py-1.5 border border-emerald/20">
                    <span className="text-xs font-heading text-emerald-glow shrink-0">HOW:</span>
                    <span className="text-xs text-foreground font-body">{item.howTo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-lg text-gold mb-3">💀 Debuffs</h2>
          <div className="space-y-3">
            {DEBUFFS.map(item => (
              <div key={item.name} className="scroll-card rounded-lg p-4 flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="font-heading text-sm text-crimson">{item.name}</h3>
                  <p className="text-sm text-muted-foreground font-body mt-0.5">{item.desc}</p>
                  <div className="mt-2 flex items-start gap-1.5 bg-crimson/10 rounded px-2.5 py-1.5 border border-crimson/20">
                    <span className="text-xs font-heading text-crimson shrink-0">TRIGGER:</span>
                    <span className="text-xs text-foreground font-body">{item.howTo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-lg text-gold mb-3">🏆 Achievements</h2>
          <div className="space-y-3">
            {ACHIEVEMENTS.map(item => (
              <div key={item.name} className="scroll-card rounded-lg p-4 flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="font-heading text-sm text-gold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground font-body mt-0.5">{item.desc}</p>
                  <div className="mt-2 flex items-start gap-1.5 bg-gold/10 rounded px-2.5 py-1.5 border border-gold/20">
                    <span className="text-xs font-heading text-gold shrink-0">UNLOCK:</span>
                    <span className="text-xs text-foreground font-body">{item.howTo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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

        <div className="parchment-bg rounded-lg p-6 border border-gold/20">
          <h2 className="font-heading text-lg text-gold mb-3">📊 XP & Leveling</h2>
          <div className="space-y-2 font-body text-sm text-foreground">
            <p>Each quest awards XP based on difficulty:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <span className="text-emerald-glow font-heading text-xs">Easy → 50 XP</span>
              <span className="text-gold font-heading text-xs">Medium → 100 XP</span>
              <span className="text-crimson font-heading text-xs">Hard → 200 XP</span>
              <span className="text-royal-purple font-heading text-xs">Legendary → 500 XP</span>
            </div>
            <p className="mt-2">Every <strong>200 XP</strong> earns you a new level. Track your progress in the header bar!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CodexSection = ({ title, items }: { title: string; items: { name: string; icon: string; desc: string }[]; }) => (
  <div>
    <h2 className="font-heading text-lg text-gold mb-3">{title}</h2>
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.name} className="scroll-card rounded-lg p-4 flex items-start gap-3">
          <span className="text-2xl">{item.icon}</span>
          <div>
            <h3 className="font-heading text-sm text-foreground">{item.name}</h3>
            <p className="text-sm text-muted-foreground font-body mt-0.5">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Codex;
