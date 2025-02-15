use iron_networks::Networks;
use iron_types::{Affinity, GlobalState};

use crate::{Result, Store};

#[tauri::command]
pub async fn connections_affinity_for(domain: String) -> Result<Affinity> {
    Ok(Store::read().await.get_affinity(&domain))
}

#[tauri::command]
pub async fn connections_set_affinity(domain: &str, affinity: Affinity) -> Result<()> {
    // TODO: validate this chain ID
    let new_chain_id = match affinity {
        Affinity::Sticky(chain_id) => chain_id,
        _ => Networks::read().await.get_current().chain_id,
    };

    Store::write().await.set_affinity(domain, affinity)?;
    iron_broadcast::chain_changed(new_chain_id, Some(domain.into()), affinity).await;

    Ok(())
}
