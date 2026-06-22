// src/context/services/questService.ts
import { supabase } from "@/lib/supabaseClient";
import { Quest, QuestDifficulty, QuestStatus } from "@/types/game";

export const questService = {
  // 1. Mengambil semua quest berdasarkan Guild
  async fetchQuestsDb(guildId: string | null): Promise<Quest[]> {
    let query = supabase.from("quests").select("*");

    if (guildId && guildId !== "") {
      query = query.eq("guild_id", guildId);
    } else {
      query = query.or('guild_id.is.null,guild_id.eq.""');
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    if (!data) return [];

    return data.map((q) => ({
      id: q.id, 
      title: q.title,
      description: q.description,
      difficulty: q.difficulty as QuestDifficulty,
      xpReward: q.xp_reward || 0,
      deadline: q.deadline,
      createdBy: q.created_by,
      assignedTo: q.assigned_to,
      status: q.status as QuestStatus,
      createdAt: new Date(q.created_at).getTime(),
      acceptedAt: q.accepted_at ? new Date(q.accepted_at).getTime() : null,
      submittedAt: q.submitted_at ? new Date(q.submitted_at).getTime() : null,
      completedAt: q.completed_at ? new Date(q.completed_at).getTime() : null,
      guildId: q.guild_id || "",
      submissionUrl: q.submission_url || null,
      isDuel: q.is_duel || false,
      duelStatus: q.duel_status || null,
      duelOpponentId: q.duel_opponent_id || null,
      challengerId: q.challenger_id || null,
    }));
  },

  // 2. Membuat quest baru
  async createQuest(questData: any) {
    const { error } = await supabase.from("quests").insert([questData]);
    if (error) throw error;
  },

  // 3. Mengambil quest (Accept)
  async acceptQuest(questId: string, userId: string) {
    const { error } = await supabase
      .from("quests")
      .update({
        status: "accepted",
        assigned_to: userId,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", questId);
    if (error) throw error;
  },

  // 4. Update quest (GM edit)
  async updateQuest(questId: string, data: { title: string; description: string; difficulty: string; xp_reward: number; deadline: number }) {
    const { error } = await supabase
      .from("quests")
      .update({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        xp_reward: data.xp_reward,
        deadline: data.deadline,
      })
      .eq("id", questId);
    if (error) throw error;
  },

  // 5. Delete quest (GM)
  async deleteQuest(questId: string) {
    const { error } = await supabase.from("quests").delete().eq("id", questId);
    if (error) throw error;
  },

  // 6. Mengirim quest (Submit)
  // UPDATE: Ditambah parameter submittedAt agar sinkron dengan GameContext
  async submitQuest(
    questId: string,
    submittedAt?: string,
    submissionUrl?: string | null,
  ) {
    const now = submittedAt || new Date().toISOString();
    const { error } = await supabase
      .from("quests")
      .update({
        status: "submitted",
        submitted_at: now,
        submission_url: submissionUrl || null,
      })
      .eq("id", questId);
    if (error) throw error;
  },
};
