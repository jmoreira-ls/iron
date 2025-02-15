use iron_types::{ChecksummedAddress, GlobalState};

use super::{DarkMode, Result, SerializedSettings, Settings};

#[tauri::command]
pub async fn settings_get() -> SerializedSettings {
    Settings::read().await.get().clone()
}

#[tauri::command]
pub async fn settings_set(new_settings: SerializedSettings) -> Result<()> {
    Settings::write().await.set(new_settings).await
}

#[tauri::command]
pub async fn settings_set_dark_mode(mode: DarkMode) -> Result<()> {
    Settings::write().await.set_dark_mode(mode).await
}

#[tauri::command]
pub async fn settings_finish_onboarding() -> Result<()> {
    Settings::write().await.finish_onboarding().await
}

/// Gets the alias for an address
#[tauri::command]
pub async fn settings_get_alias(address: ChecksummedAddress) -> Option<String> {
    Settings::read().await.get_alias(address)
}

/// Sets the alias for an address
#[tauri::command]
pub async fn settings_set_alias(address: ChecksummedAddress, alias: Option<String>) {
    Settings::write().await.set_alias(address, alias)
}
