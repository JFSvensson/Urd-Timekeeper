import { UrdTimerService } from './UrdTimerService';
import { TimerSettings } from './UrdSettingsManager';
import { UrdSettingsFormAdapter } from './UrdSettingsFormAdapter';
import { UrdTimerControlsAdapter } from './UrdTimerControlsAdapter';

export class UrdUIDOMHandler {
  private settingsForm = new UrdSettingsFormAdapter();
  private controls = new UrdTimerControlsAdapter();
  private saveSettingsButton: HTMLButtonElement | null = null;
  private onSaveSettingsClick: (() => void) | null = null;
  private exportDataButton: HTMLButtonElement | null = null;
  private importDataButton: HTMLButtonElement | null = null;
  private importDataFile: HTMLInputElement | null = null;
  private settingsStatus: HTMLElement | null = null;
  private onExportDataClick: (() => void) | null = null;
  private onImportDataClick: (() => void) | null = null;
  private onImportDataChange: (() => void) | null = null;

  constructor(
    private shadowRoot: ShadowRoot,
    private timerService: UrdTimerService
  ) {}

  initializeDOMElements(): void {
    this.settingsForm.initialize(this.shadowRoot);
    this.saveSettingsButton = this.shadowRoot.querySelector('#save-settings');
    this.exportDataButton = this.shadowRoot.querySelector('#export-data');
    this.importDataButton = this.shadowRoot.querySelector('#import-data');
    this.importDataFile = this.shadowRoot.querySelector('#import-data-file');
    this.settingsStatus = this.shadowRoot.querySelector('#settings-status');
  }

  populateSettings(settings: TimerSettings): void {
    this.settingsForm.populate(settings);
  }

  addSettingsEventListeners(): void {
    if (this.onSaveSettingsClick) {
      this.saveSettingsButton?.removeEventListener('click', this.onSaveSettingsClick);
    }

    this.onSaveSettingsClick = () => {
      const settings = this.settingsForm.read(this.timerService.getSettings());
      this.timerService.updateSettings(
        settings.workDuration,
        settings.shortBreakDuration,
        settings.longBreakDuration,
        settings.shortBreaksBeforeLong,
        settings.soundEnabled,
        settings.volume
      );
    };

    this.saveSettingsButton?.addEventListener('click', this.onSaveSettingsClick);

    this.onExportDataClick = () => this.exportData();
    this.exportDataButton?.addEventListener('click', this.onExportDataClick);

    this.onImportDataClick = () => this.importDataFile?.click();
    this.importDataButton?.addEventListener('click', this.onImportDataClick);

    this.onImportDataChange = () => {
      void this.importData();
    };
    this.importDataFile?.addEventListener('change', this.onImportDataChange);
  }

  addButtonListeners(toggleCallback: () => void, resetCallback: () => void): void {
    this.controls.bind(this.shadowRoot, toggleCallback, resetCallback);
  }

  removeEventListeners(): void {
    if (this.saveSettingsButton && this.onSaveSettingsClick) {
      this.saveSettingsButton.removeEventListener('click', this.onSaveSettingsClick);
    }
    this.onSaveSettingsClick = null;
    if (this.onExportDataClick) {
      this.exportDataButton?.removeEventListener('click', this.onExportDataClick);
    }
    if (this.onImportDataClick) {
      this.importDataButton?.removeEventListener('click', this.onImportDataClick);
    }
    if (this.onImportDataChange) {
      this.importDataFile?.removeEventListener('change', this.onImportDataChange);
    }
    this.onExportDataClick = null;
    this.onImportDataClick = null;
    this.onImportDataChange = null;
    this.controls.removeListeners();
  }

  private exportData(): void {
    const backup = this.timerService.exportBackup();
    if (!backup) {
      this.setSettingsStatus('Kunde inte exportera data.');
      return;
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `urd-timekeeper-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.setSettingsStatus('Data exporterades.');
  }

  private async importData(): Promise<void> {
    const file = this.importDataFile?.files?.[0];
    if (!file) return;

    try {
      const data = JSON.parse(await file.text()) as unknown;
      const imported = this.timerService.importBackup(data);
      if (imported) {
        this.settingsForm.populate(this.timerService.getSettings());
      }
      this.setSettingsStatus(imported ? 'Data importerades.' : 'Filen kunde inte valideras.');
    } catch {
      this.setSettingsStatus('Filen kunde inte läsas.');
    } finally {
      if (this.importDataFile) this.importDataFile.value = '';
    }
  }

  private setSettingsStatus(message: string): void {
    if (this.settingsStatus) this.settingsStatus.textContent = message;
  }
}
