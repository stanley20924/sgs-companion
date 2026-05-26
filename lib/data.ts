export type Skill = {
  name: string;
  text: string;
};

export type GameMode = "國戰" | "身分局";

export type Version =
  | "受命于天"
  | "標準國戰"
  | "君臨天下"
  | "2026 珍藏版"
  | "標準身份"
  | "軍爭";

export type Faction = "魏" | "蜀" | "吳" | "群" | "晉";

export type General = {
  id: string;
  name: string;
  faction: Faction;
  modes: GameMode[];
  versions: Version[];
  image?: string;
  skills?: Skill[];
  partners?: string[];
};

export const modes: GameMode[] = ["國戰", "身分局"];

export const versionsByMode: Record<GameMode, Version[]> = {
  國戰: ["受命于天", "標準國戰", "君臨天下"],
  身分局: ["2026 珍藏版", "標準身份", "軍爭"],
};

export const factions: Faction[] = ["魏", "蜀", "吳", "群", "晉"];