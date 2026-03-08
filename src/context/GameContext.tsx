import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "sonner";

export type Role = "guild_master" | "adventurer";
export type QuestDifficulty = "easy" | "medium" | "hard" | "legendary";
export type QuestStatus = "open" | "accepted" | "submitted" | "completed" | "rejected";

export interface BuffEntry {
  name: string;
  appliedAt: number;
  expiresAt: number | null; // null = permanent until cleared
  questId?: string;
}

export interface DebuffEntry {
  name: string;
  appliedAt: number;
  expiresAt: number | null;
  questId?: string;
  remainingQuests?: number; // for quest-count-based debuffs like Stagnant Soul
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  avatar: string;
  xp: number;
  level: number;
  buffs: string[];
  debuffs: string[];
  activeBuffs: BuffEntry[];
  activeDebuffs: DebuffEntry[];
  guildId: string;
  questsCompleted: number;
  joinedAt: number;
  lastQuestCompletedAt: number | null;
  consecutiveLateCount: number;
  debuffImmunity: boolean; // from Aura of Purity
  stagnantSoulCounter: number; // quests remaining under Stagnant Soul
  rustyEquipment: boolean; // grayscale + buffs disabled
  brokenShieldQuests: string[]; // quest IDs with -25% penalty
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  xpReward: number;
  deadline: number;
  createdBy: string;
  assignedTo: string | null;
  status: QuestStatus;
  createdAt: number;
  acceptedAt: number | null;
  submittedAt: number | null;
  completedAt: number | null;
  guildId: string;
  wasRejected?: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedBy: string[];
}

const AVATARS = ["⚔️", "🛡️", "🧙", "🏹", "🗡️", "🔮", "🐉", "🦅", "🐺", "🦁"];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first_quest", title: "First Blood", description: "Complete your first quest", icon: "⚔️", unlockedBy: [] },
  { id: "five_quests", title: "Seasoned Warrior", description: "Complete 5 quests", icon: "🛡️", unlockedBy: [] },
  { id: "ten_quests", title: "Veteran", description: "Complete 10 quests", icon: "🏅", unlockedBy: [] },
  { id: "speed_demon", title: "Speed Demon", description: "Submit a quest within 1 hour", icon: "⚡", unlockedBy: [] },
  { id: "legendary", title: "Legend", description: "Complete a legendary quest", icon: "👑", unlockedBy: [] },
  { id: "social", title: "Tavern Regular", description: "Send 10 messages in the tavern", icon: "🍻", unlockedBy: [] },
  { id: "level5", title: "Rising Star", description: "Reach level 5", icon: "⭐", unlockedBy: [] },
  { id: "level10", title: "Elite Warrior", description: "Reach level 10", icon: "💎", unlockedBy: [] },
  { id: "streak3", title: "Hat Trick", description: "Complete 3 quests in a row without a debuff", icon: "🎯", unlockedBy: [] },
  { id: "all_difficulties", title: "Jack of All Trades", description: "Complete one quest of each difficulty", icon: "🃏", unlockedBy: [] },
  { id: "night_owl", title: "Night Owl", description: "Submit a quest between midnight and 5 AM", icon: "🦉", unlockedBy: [] },
];

interface GameState {
  currentUser: User | null;
  users: User[];
  quests: Quest[];
  chatMessages: ChatMessage[];
  achievements: Achievement[];
  login: (email: string, password: string) => boolean;
  register: (email: string, username: string, password: string, role: Role) => boolean;
  logout: () => void;
  createQuest: (title: string, description: string, difficulty: QuestDifficulty, deadlineTimestamp: number) => void;
  acceptQuest: (questId: string) => void;
  submitQuest: (questId: string) => void;
  approveQuest: (questId: string) => void;
  rejectQuest: (questId: string) => void;
  sendMessage: (message: string) => void;
  inviteAdventurer: (email: string) => string;
  changeAvatar: (avatar: string) => void;
  availableAvatars: string[];
}

const GameContext = createContext<GameState | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
};

interface Credentials {
  email: string;
  password: string;
  userId: string;
}

const XP_MAP: Record<QuestDifficulty, number> = { easy: 50, medium: 100, hard: 200, legendary: 500 };

const BUFF_DURATION = 24 * 60 * 60 * 1000; // 24 hours default
const CHAIN_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [credentials, setCredentials] = useState<Credentials[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [messageCount, setMessageCount] = useState<Record<string, number>>({});

  const guildId = "sovereign-guild";

  const calcLevel = (xp: number) => Math.floor(xp / 200) + 1;

  const addBuff = (user: User, name: string, durationMs: number | null, questId?: string): User => {
    if (user.activeBuffs.find(b => b.name === name)) return user;
    const now = Date.now();
    const entry: BuffEntry = { name, appliedAt: now, expiresAt: durationMs ? now + durationMs : null, questId };
    const newBuffs = [...user.buffs];
    if (!newBuffs.includes(name)) newBuffs.push(name);
    return { ...user, buffs: newBuffs, activeBuffs: [...user.activeBuffs, entry] };
  };

  const addDebuff = (user: User, name: string, durationMs: number | null, questId?: string, remainingQuests?: number): User => {
    // Check immunity from Aura of Purity
    if (user.debuffImmunity) {
      toast("🛡️ Aura of Purity blocked a debuff!", { description: `${name} was prevented by your golden shield.` });
      return { ...user, debuffImmunity: false };
    }
    if (user.activeDebuffs.find(d => d.name === name)) return user;
    const now = Date.now();
    const entry: DebuffEntry = { name, appliedAt: now, expiresAt: durationMs ? now + durationMs : null, questId, remainingQuests };
    const newDebuffs = [...user.debuffs];
    if (!newDebuffs.includes(name)) newDebuffs.push(name);
    return { ...user, debuffs: newDebuffs, activeDebuffs: [...user.activeDebuffs, entry] };
  };

  const cleanExpiredEffects = (user: User): User => {
    const now = Date.now();
    const activeBuffs = user.activeBuffs.filter(b => !b.expiresAt || b.expiresAt > now);
    const activeDebuffs = user.activeDebuffs.filter(d => {
      if (d.expiresAt && d.expiresAt <= now) return false;
      if (d.remainingQuests !== undefined && d.remainingQuests <= 0) return false;
      return true;
    });
    return {
      ...user,
      buffs: activeBuffs.map(b => b.name),
      debuffs: activeDebuffs.map(d => d.name),
      activeBuffs,
      activeDebuffs,
      rustyEquipment: activeDebuffs.some(d => d.name === "Rusty Equipment"),
      stagnantSoulCounter: activeDebuffs.find(d => d.name === "Stagnant Soul")?.remainingQuests || 0,
    };
  };

  const applyBuffsDebuffs = useCallback((user: User, quest: Quest, submittedAt: number, allQuests: Quest[]): User => {
    let u = cleanExpiredEffects(user);

    const timeLeft = quest.deadline - submittedAt;
    const totalTime = quest.deadline - (quest.acceptedAt || quest.createdAt);

    // --- BUFFS ---

    // Adventurer's Haste: submitted 24h+ before deadline → +50% XP
    if (timeLeft >= 24 * 60 * 60 * 1000) {
      u = addBuff(u, "Adventurer's Haste", BUFF_DURATION, quest.id);
      toast("⚡ Buff: Adventurer's Haste", { description: "+50% XP! Submitted 24h+ early." });
    }

    // Scholar's Focus: hard quest → +20% XP
    if (quest.difficulty === "hard") {
      u = addBuff(u, "Scholar's Focus", BUFF_DURATION, quest.id);
      toast("📚 Buff: Scholar's Focus", { description: "+20% XP! Completed a Hard quest." });
    }

    // Weekend Warrior: weekend submission → +10% XP
    const day = new Date(submittedAt).getDay();
    if (day === 0 || day === 6) {
      u = addBuff(u, "Weekend Warrior", BUFF_DURATION, quest.id);
      toast("🗡️ Buff: Weekend Warrior", { description: "+10% XP! Weekend dedication." });
    }

    // Night Owl buff
    const hour = new Date(submittedAt).getHours();
    if (hour >= 0 && hour < 5) {
      u = addBuff(u, "Night Owl", BUFF_DURATION, quest.id);
      toast("🦉 Buff: Night Owl", { description: "Burning the midnight oil!" });
    }

    // Clutch Player
    if (timeLeft > 0 && timeLeft < totalTime * 0.1) {
      u = addBuff(u, "Clutch Player", BUFF_DURATION, quest.id);
      toast("🎯 Buff: Clutch Player", { description: "Submitted just in time!" });
    }

    // First Strike
    const timeSinceAccept = submittedAt - (quest.acceptedAt || quest.createdAt);
    if (timeSinceAccept < 60 * 60 * 1000) {
      u = addBuff(u, "First Strike", BUFF_DURATION, quest.id);
      toast("⚔️ Buff: First Strike", { description: "Completed within an hour!" });
    }

    // Chain Quest (Combo): 3 submissions within 24h → +15% XP on 3rd
    const recentSubmissions = allQuests.filter(
      q => q.assignedTo === u.id && q.submittedAt && (submittedAt - q.submittedAt) < CHAIN_WINDOW && q.id !== quest.id
    );
    if (recentSubmissions.length >= 2) {
      u = addBuff(u, "Chain Quest", BUFF_DURATION, quest.id);
      toast("🔗 Buff: Chain Quest (Combo)!", { description: "+15% XP! 3 quests in 24 hours." });
    }

    // Aura of Purity: legendary quest → clear all debuffs + immunity
    if (quest.difficulty === "legendary") {
      u = addBuff(u, "Aura of Purity", BUFF_DURATION, quest.id);
      u = {
        ...u,
        debuffs: [],
        activeDebuffs: [],
        debuffImmunity: true,
        rustyEquipment: false,
        stagnantSoulCounter: 0,
        consecutiveLateCount: 0,
      };
      toast("✨ Ultimate Buff: Aura of Purity!", { description: "All debuffs cleared! Immunity to next debuff granted." });
    }

    // Scholar's Focus for legendary too
    if (quest.difficulty === "legendary") {
      u = addBuff(u, "Scholar's Focus", BUFF_DURATION, quest.id);
    }

    // --- DEBUFFS ---

    // Cursed Procrastination: late submission → -10 XP
    if (submittedAt > quest.deadline) {
      u = addDebuff(u, "Cursed Procrastination", 48 * 60 * 60 * 1000, quest.id);
      if (u.debuffs.includes("Cursed Procrastination")) {
        toast("🐌 Debuff: Cursed Procrastination", { description: "-10 XP penalty for late submission." });
      }
      u = { ...u, consecutiveLateCount: u.consecutiveLateCount + 1 };
    } else {
      u = { ...u, consecutiveLateCount: 0 };
    }

    // Stagnant Soul: 3 consecutive late submissions
    if (u.consecutiveLateCount >= 3) {
      u = addDebuff(u, "Stagnant Soul", null, quest.id, 3);
      if (u.debuffs.includes("Stagnant Soul")) {
        toast("⛓️ Ultimate Debuff: Stagnant Soul!", { description: "ALL buffs blocked for next 3 quests." });
      }
    }

    // Slacker's Fatigue: >5 active quests
    const activeQuests = allQuests.filter(q => q.assignedTo === u.id && q.status === "accepted");
    if (activeQuests.length > 5) {
      u = addDebuff(u, "Slacker's Fatigue", 24 * 60 * 60 * 1000, quest.id);
      if (u.debuffs.includes("Slacker's Fatigue")) {
        toast("😴 Debuff: Slacker's Fatigue", { description: "-5% XP on next quest." });
      }
    }

    return u;
  }, []);

  const checkInactivityDebuff = useCallback((user: User, allQuests: Quest[]): User => {
    let u = cleanExpiredEffects(user);
    const lastCompleted = allQuests
      .filter(q => q.assignedTo === user.id && q.status === "completed")
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))[0];
    
    if (lastCompleted && Date.now() - (lastCompleted.completedAt || 0) > 3 * 24 * 60 * 60 * 1000) {
      if (!u.activeDebuffs.find(d => d.name === "Rusty Equipment")) {
        u = addDebuff(u, "Rusty Equipment", null);
        u = { ...u, rustyEquipment: true };
        if (u.debuffs.includes("Rusty Equipment")) {
          toast("🪓 Debuff: Rusty Equipment", { description: "3 days inactive! Avatar greyed out, buffs disabled until 1 quest completed." });
        }
      }
    }
    return u;
  }, []);

  const calcXpWithModifiers = (user: User, quest: Quest): { baseXp: number; bonuses: { name: string; amount: number }[]; penalties: { name: string; amount: number }[]; totalXp: number } => {
    const baseXp = quest.xpReward;
    const bonuses: { name: string; amount: number }[] = [];
    const penalties: { name: string; amount: number }[] = [];

    // If Stagnant Soul is active or Rusty Equipment, no buff bonuses
    const buffsBlocked = user.stagnantSoulCounter > 0 || user.rustyEquipment;

    if (!buffsBlocked) {
      if (user.buffs.includes("Adventurer's Haste")) bonuses.push({ name: "Adventurer's Haste (+50%)", amount: Math.floor(baseXp * 0.5) });
      if (user.buffs.includes("Scholar's Focus")) bonuses.push({ name: "Scholar's Focus (+20%)", amount: Math.floor(baseXp * 0.2) });
      if (user.buffs.includes("Weekend Warrior")) bonuses.push({ name: "Weekend Warrior (+10%)", amount: Math.floor(baseXp * 0.1) });
      if (user.buffs.includes("Chain Quest")) bonuses.push({ name: "Chain Quest (+15%)", amount: Math.floor(baseXp * 0.15) });
    }

    // Debuff penalties
    if (user.debuffs.includes("Cursed Procrastination")) penalties.push({ name: "Cursed Procrastination", amount: 10 });
    if (user.debuffs.includes("Slacker's Fatigue")) penalties.push({ name: "Slacker's Fatigue (-5%)", amount: Math.floor(baseXp * 0.05) });
    if (user.brokenShieldQuests.includes(quest.id)) penalties.push({ name: "Broken Shield (-25%)", amount: Math.floor(baseXp * 0.25) });

    const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);
    const totalPenalty = penalties.reduce((sum, p) => sum + p.amount, 0);
    const totalXp = Math.max(0, baseXp + totalBonus - totalPenalty);

    return { baseXp, bonuses, penalties, totalXp };
  };

  const register = (email: string, username: string, password: string, role: Role): boolean => {
    if (credentials.find(c => c.email === email)) return false;
    const id = crypto.randomUUID();
    const newUser: User = {
      id, email, username, role,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      xp: 0, level: 1, buffs: [], debuffs: [],
      activeBuffs: [], activeDebuffs: [],
      guildId, questsCompleted: 0, joinedAt: Date.now(),
      lastQuestCompletedAt: null, consecutiveLateCount: 0,
      debuffImmunity: false, stagnantSoulCounter: 0,
      rustyEquipment: false, brokenShieldQuests: [],
    };
    setUsers(prev => [...prev, newUser]);
    setCredentials(prev => [...prev, { email, password, userId: id }]);
    setCurrentUser(newUser);
    return true;
  };

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return false;
    const cred = credentials.find(c => c.userId === user.id && c.password === password);
    if (!cred) return false;
    // Clean expired effects on login
    const cleaned = cleanExpiredEffects(user);
    setCurrentUser(cleaned);
    setUsers(prev => prev.map(u => u.id === cleaned.id ? cleaned : u));
    return true;
  };

  const logout = () => setCurrentUser(null);

  const createQuest = (title: string, description: string, difficulty: QuestDifficulty, deadlineTimestamp: number) => {
    if (!currentUser) return;
    const quest: Quest = {
      id: crypto.randomUUID(),
      title, description, difficulty,
      xpReward: XP_MAP[difficulty],
      deadline: deadlineTimestamp,
      createdBy: currentUser.id,
      assignedTo: null,
      status: "open",
      createdAt: Date.now(),
      acceptedAt: null, submittedAt: null, completedAt: null,
      guildId,
    };
    setQuests(prev => [...prev, quest]);
  };

  const acceptQuest = (questId: string) => {
    if (!currentUser) return;
    setQuests(prev => prev.map(q =>
      q.id === questId ? { ...q, status: "accepted" as QuestStatus, assignedTo: currentUser.id, acceptedAt: Date.now() } : q
    ));
    const updated = checkInactivityDebuff(currentUser, quests);
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const submitQuest = (questId: string) => {
    if (!currentUser) return;
    const now = Date.now();
    setQuests(prev => prev.map(q =>
      q.id === questId ? { ...q, status: "submitted" as QuestStatus, submittedAt: now } : q
    ));
    const quest = quests.find(q => q.id === questId);
    if (quest) {
      const updated = applyBuffsDebuffs(currentUser, quest, now, quests);
      setCurrentUser(updated);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    }
  };

  const rejectQuest = (questId: string) => {
    if (!currentUser) return;
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.assignedTo) return;

    // Mark quest as rejected → goes back to accepted with wasRejected flag
    setQuests(prev => prev.map(q =>
      q.id === questId ? { ...q, status: "accepted" as QuestStatus, submittedAt: null, wasRejected: true } : q
    ));

    // Apply Broken Shield debuff to the adventurer
    setUsers(prev => prev.map(u => {
      if (u.id === quest.assignedTo) {
        let updated = addDebuff(u, "Broken Shield", 48 * 60 * 60 * 1000, questId);
        updated = { ...updated, brokenShieldQuests: [...updated.brokenShieldQuests, questId] };
        if (updated.debuffs.includes("Broken Shield")) {
          toast("🛡️💔 Debuff: Broken Shield", { description: `-25% XP when quest "${quest.title}" is finally approved.` });
        }
        if (currentUser?.id === u.id) setCurrentUser(updated);
        return updated;
      }
      return u;
    }));
  };

  const approveQuest = (questId: string) => {
    if (!currentUser) return;
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.assignedTo) return;

    setQuests(prev => prev.map(q =>
      q.id === questId ? { ...q, status: "completed" as QuestStatus, completedAt: Date.now() } : q
    ));

    const adventurer = users.find(u => u.id === quest.assignedTo);
    if (!adventurer) return;

    const xpBreakdown = calcXpWithModifiers(adventurer, quest);

    setUsers(prev => prev.map(u => {
      if (u.id === quest.assignedTo) {
        const newXp = u.xp + xpBreakdown.totalXp;
        let updated: User = {
          ...u,
          xp: newXp,
          level: calcLevel(newXp),
          questsCompleted: u.questsCompleted + 1,
          lastQuestCompletedAt: Date.now(),
        };

        // Clear Rusty Equipment on completion
        if (updated.rustyEquipment) {
          updated = {
            ...updated,
            rustyEquipment: false,
            activeDebuffs: updated.activeDebuffs.filter(d => d.name !== "Rusty Equipment"),
            debuffs: updated.debuffs.filter(d => d !== "Rusty Equipment"),
          };
          toast("🔧 Rusty Equipment cleared!", { description: "You completed a quest — welcome back!" });
        }

        // Decrement Stagnant Soul counter
        if (updated.stagnantSoulCounter > 0) {
          const newCount = updated.stagnantSoulCounter - 1;
          updated = {
            ...updated,
            stagnantSoulCounter: newCount,
            activeDebuffs: newCount <= 0
              ? updated.activeDebuffs.filter(d => d.name !== "Stagnant Soul")
              : updated.activeDebuffs.map(d => d.name === "Stagnant Soul" ? { ...d, remainingQuests: newCount } : d),
          };
          if (newCount <= 0) {
            updated = { ...updated, debuffs: updated.debuffs.filter(d => d !== "Stagnant Soul") };
            toast("⛓️ Stagnant Soul lifted!", { description: "Buffs are active again." });
          } else {
            toast("⛓️ Stagnant Soul", { description: `${newCount} quest(s) remaining under restriction.` });
          }
        }

        // Remove broken shield for this quest
        updated = { ...updated, brokenShieldQuests: updated.brokenShieldQuests.filter(id => id !== quest.id) };

        // Clean expired
        updated = cleanExpiredEffects(updated);

        if (currentUser?.id === u.id) setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // Show XP breakdown toast
    const breakdownLines = [`Base XP: ${xpBreakdown.baseXp}`];
    xpBreakdown.bonuses.forEach(b => breakdownLines.push(`+ ${b.amount} ${b.name}`));
    xpBreakdown.penalties.forEach(p => breakdownLines.push(`- ${p.amount} ${p.name}`));
    breakdownLines.push(`= ${xpBreakdown.totalXp} Total XP`);

    toast(`⚔️ Quest Approved: ${quest.title}`, {
      description: breakdownLines.join("\n"),
      duration: 8000,
    });

    // Check achievements
    if (adventurer) {
      setAchievements(prev => prev.map(a => {
        if (a.id === "first_quest" && adventurer.questsCompleted === 0 && !a.unlockedBy.includes(adventurer.id)) {
          toast("🏆 Achievement Unlocked: First Blood!", { description: "Completed your first quest!" });
          return { ...a, unlockedBy: [...a.unlockedBy, adventurer.id] };
        }
        if (a.id === "five_quests" && adventurer.questsCompleted === 4 && !a.unlockedBy.includes(adventurer.id)) {
          toast("🏆 Achievement Unlocked: Seasoned Warrior!", { description: "Completed 5 quests!" });
          return { ...a, unlockedBy: [...a.unlockedBy, adventurer.id] };
        }
        if (a.id === "ten_quests" && adventurer.questsCompleted === 9 && !a.unlockedBy.includes(adventurer.id)) {
          toast("🏆 Achievement Unlocked: Veteran!", { description: "Completed 10 quests!" });
          return { ...a, unlockedBy: [...a.unlockedBy, adventurer.id] };
        }
        if (a.id === "legendary" && quest.difficulty === "legendary" && !a.unlockedBy.includes(adventurer.id)) {
          toast("🏆 Achievement Unlocked: Legend!", { description: "Completed a legendary quest!" });
          return { ...a, unlockedBy: [...a.unlockedBy, adventurer.id] };
        }
        const newLevel = calcLevel(adventurer.xp + xpBreakdown.totalXp);
        if (a.id === "level5" && newLevel >= 5 && !a.unlockedBy.includes(adventurer.id)) {
          toast("🏆 Achievement Unlocked: Rising Star!", { description: "Reached level 5!" });
          return { ...a, unlockedBy: [...a.unlockedBy, adventurer.id] };
        }
        if (a.id === "level10" && newLevel >= 10 && !a.unlockedBy.includes(adventurer.id)) {
          toast("🏆 Achievement Unlocked: Elite Warrior!", { description: "Reached level 10!" });
          return { ...a, unlockedBy: [...a.unlockedBy, adventurer.id] };
        }
        if (a.id === "night_owl" && quest.submittedAt) {
          const submitHour = new Date(quest.submittedAt).getHours();
          if (submitHour >= 0 && submitHour < 5 && !a.unlockedBy.includes(adventurer.id)) {
            toast("🏆 Achievement Unlocked: Night Owl!", { description: "Submitted in the dead of night!" });
            return { ...a, unlockedBy: [...a.unlockedBy, adventurer.id] };
          }
        }
        return a;
      }));
    }
  };

  const sendMessage = (message: string) => {
    if (!currentUser) return;
    setChatMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      message,
      timestamp: Date.now(),
    }]);
    const count = (messageCount[currentUser.id] || 0) + 1;
    setMessageCount(prev => ({ ...prev, [currentUser.id]: count }));
    if (count >= 10) {
      setAchievements(prev => prev.map(a =>
        a.id === "social" && !a.unlockedBy.includes(currentUser.id)
          ? (toast("🏆 Achievement Unlocked: Tavern Regular!", { description: "Sent 10 messages in the tavern!" }), { ...a, unlockedBy: [...a.unlockedBy, currentUser.id] })
          : a
      ));
    }
  };

  const inviteAdventurer = (email: string): string => {
    const user = users.find(u => u.email === email && u.role === "adventurer");
    if (user) return `${user.username} has joined the guild!`;
    return "No adventurer found with that email.";
  };

  const changeAvatar = (avatar: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, avatar };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  return (
    <GameContext.Provider value={{
      currentUser, users, quests, chatMessages, achievements,
      login, register, logout, createQuest, acceptQuest, submitQuest,
      approveQuest, rejectQuest, sendMessage, inviteAdventurer, changeAvatar,
      availableAvatars: AVATARS,
    }}>
      {children}
    </GameContext.Provider>
  );
};
