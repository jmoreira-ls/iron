import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { Action } from "kbar";
import { type StateCreator, create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { Network } from "../types";

interface State {
  networks: Network[];
  current?: Network;
  actions: Action[];
}

interface Setters {
  setNetworks: (newNetworks: Network[]) => Promise<void>;
  setCurrent: (newNetwork: string) => Promise<void>;
  resetNetworks: () => Promise<void>;
  reload: () => Promise<void>;
  reloadActions: () => void;
  isAlchemySupportedNetwork: () => Promise<boolean>;
}

type Store = State & Setters;

const actionId = "networks";

const store: StateCreator<Store> = (set, get) => ({
  networks: [],
  actions: [],

  async setNetworks(newNetworks) {
    // TODO: this could return the new list directly
    await invoke("networks_set_list", { newNetworks: newNetworks });
    const networks = await invoke<Network[]>("networks_get_list");
    set({ networks });
  },

  async setCurrent(newNetwork) {
    // TODO: this could return the new network directly
    await invoke("networks_set_current", { network: newNetwork });

    const current = await invoke<Network>("networks_get_current");
    set({ current });
  },

  async resetNetworks() {
    const networks = await invoke<Network[]>("networks_reset");
    set({ networks });
  },

  async reload() {
    const current = await invoke<Network>("networks_get_current");
    const networks = await invoke<Network[]>("networks_get_list");
    set({ networks, current });
    get().reloadActions();
  },

  reloadActions() {
    const networks = get().networks;

    const actions = [
      {
        id: actionId,
        name: "Change network",
      },
      ...(networks || []).map((network) => ({
        id: `${actionId}/${network.name}`,
        name: network.name,
        parent: actionId,
        perform: () => {
          get().setCurrent(network.name);
        },
      })),
    ];

    set({ actions });
  },

  async isAlchemySupportedNetwork() {
    const current = get().current;

    if (!current) return false;

    return await invoke<boolean>("sync_alchemy_is_network_supported", {
      chainId: current.chain_id,
    });
  },
});

export const useNetworks = create<Store>()(subscribeWithSelector(store));

listen("networks-changed", async () => {
  await useNetworks.getState().reload();
});

(async () => {
  await useNetworks.getState().reload();
})();
