import { useGame } from "@/context/GameContext";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Flame, Zap, Clock, Skull, AlertTriangle, Wrench, Target, Swords, Moon, Sparkles } from "lucide-react";

const BUFF_INFO: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
  "Adventurer's Haste": { icon: <Zap className="h-3.5 w-3.5" />, color: "text-gold bg-gold/15 border-gold/30", desc: "Submitted early — bonus speed recognized!" },
  "Scholar's Focus": { icon: <Shield className="h-3.5 w-3.5" />, color: "text-emerald-glow bg-emerald/15 border-emerald/30", desc: "Completed a hard or legendary quest." },
  "Weekend Warrior": { icon: <Flame className="h-3.5 w-3.5" />, color: "text-royal-purple bg-royal-purple/15 border-royal-purple/30", desc: "Submitted on a weekend — true dedication!" },
  "Night Owl": { icon: <Moon className="h-3.5 w-3.5" />, color: "text-royal-purple bg-royal-purple/15 border-royal-purple/30", desc: "Submitted between midnight and 5 AM." },
  "Clutch Player": { icon: <Target className="h-3.5 w-3.5" />, color: "text-gold bg-gold/15 border-gold/30", desc: "Submitted just before the deadline!" },
  "First Strike": { icon: <Swords className="h-3.5 w-3.5" />, color: "text-emerald-glow bg-emerald/15 border-emerald/30", desc: "Completed within 1 hour of accepting!" },
};

const DEBUFF_INFO: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
  "Cursed Procrastination": { icon: <Clock className="h-3.5 w-3.5" />, color: "text-crimson bg-crimson/15 border-crimson/30", desc: "Submitted after the deadline." },
  "Slacker's Fatigue": { icon: <Skull className="h-3.5 w-3.5" />, color: "text-crimson bg-crimson/15 border-crimson/30", desc: "Too many active quests (>5)." },
  "Rusty Equipment": { icon: <Wrench className="h-3.5 w-3.5" />, color: "text-crimson bg-crimson/15 border-crimson/30", desc: "No quest completed in 7 days." },
  "Dragon's Shame": { icon: <Sparkles className="h-3.5 w-3.5" />, color: "text-crimson bg-crimson/15 border-crimson/30", desc: "Massively overdue submission." },
};

const PlayerStatusBar = () => {
  const { currentUser } = useGame();
  if (!currentUser) return null;

  const xpForCurrentLevel = (currentUser.level - 1) * 200;
  const xpForNextLevel = currentUser.level * 200;
  const xpProgress = currentUser.xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.min(100, (xpProgress / xpNeeded) * 100);

  const allBuffs = currentUser.buffs || [];
  const allDebuffs = currentUser.debuffs || [];

  return (
    <div className="flex items-center gap-3">
      {/* Active Buffs & Debuffs */}
      {(allBuffs.length > 0 || allDebuffs.length > 0) && (
        <div className="flex items-center gap-1">
          {allBuffs.map((buff) => {
            const info = BUFF_INFO[buff] || { icon: <Zap className="h-3.5 w-3.5" />, color: "text-gold bg-gold/15 border-gold/30", desc: buff };
            return (
              <Tooltip key={buff}>
                <TooltipTrigger asChild>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-heading cursor-default ${info.color}`}>
                    {info.icon}
                    <span className="hidden lg:inline">{buff}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-card border-border max-w-[200px]">
                  <p className="font-heading text-xs text-gold">{buff}</p>
                  <p className="text-xs text-muted-foreground">{info.desc}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          {allDebuffs.map((debuff) => {
            const info = DEBUFF_INFO[debuff] || { icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "text-crimson bg-crimson/15 border-crimson/30", desc: debuff };
            return (
              <Tooltip key={debuff}>
                <TooltipTrigger asChild>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-heading cursor-default ${info.color}`}>
                    {info.icon}
                    <span className="hidden lg:inline">{debuff}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-card border-border max-w-[200px]">
                  <p className="font-heading text-xs text-crimson">{debuff}</p>
                  <p className="text-xs text-muted-foreground">{info.desc}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      )}

      {/* XP Bar */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-default">
            <span className="font-heading text-xs text-gold whitespace-nowrap">
              Lv.{currentUser.level}
            </span>
            <div className="w-24 sm:w-32">
              <Progress value={progressPercent} className="h-2 bg-secondary [&>div]:bg-gradient-to-r [&>div]:from-gold [&>div]:to-gold-glow" />
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap font-body">
              {xpProgress}/{xpNeeded}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-card border-border">
          <p className="text-xs">Total XP: {currentUser.xp} · Next level at {xpForNextLevel} XP</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default PlayerStatusBar;
