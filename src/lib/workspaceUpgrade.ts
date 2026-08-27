export interface WorkspaceUpgrade {
  isPro: boolean;
  upgradedAt?: string;
  planName?: string;
}

const LOCAL_STORAGE_KEY = 'artha_workspace_upgrade';

export function getWorkspaceUpgrade(): WorkspaceUpgrade {
  if (typeof window === 'undefined') return { isPro: false };
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return { isPro: false };
  try {
    return JSON.parse(raw) as WorkspaceUpgrade;
  } catch {
    return { isPro: false };
  }
}

export function saveWorkspaceUpgrade(upgrade: WorkspaceUpgrade): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(upgrade));
}

export function clearWorkspaceUpgrade(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}
