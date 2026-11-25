import React, { useState, useEffect, useCallback } from 'react';
import {
  Film,
  RefreshCw,
  X,
  Search,
  Check,
  AlertCircle,
  Loader2,
  HardDrive,
  Calendar,
} from 'lucide-react';
import { useTranslate } from '../../i18n';
import { defaultExtensionBridge } from '../../services/clip/ExtensionBridgeAdapter';
import { defaultServiceWorkerBridge } from '../../services/clip/ServiceWorkerBridge';
import type { VaultVideoItem } from '../../services/clip/types';
import { formatBytes, formatTimecode } from './clipUtils';

export interface MediaVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  currentVaultId?: string;
  extensionId?: string;
}

interface VaultPosterProps {
  id?: string;
  poster?: string;
  title?: string;
  format?: string;
}

const VaultPoster: React.FC<VaultPosterProps> = ({ id, poster, title, format }) => {
  // 优先使用 SW 虚拟接口进行按需请求与磁盘缓存，无 id 时回退到 poster
  const virtualUrl = id ? defaultServiceWorkerBridge.getVirtualPosterUrl(id) : null;
  const initialUrl = virtualUrl || poster || null;

  const [displayUrl, setDisplayUrl] = useState<string | null>(initialUrl);
  const [triedFallback, setTriedFallback] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const vUrl = id ? defaultServiceWorkerBridge.getVirtualPosterUrl(id) : null;
    setDisplayUrl(vUrl || poster || null);
    setTriedFallback(false);
    setHasError(false);
  }, [id, poster]);

  const handleImageError = () => {
    // 若虚拟接口未命中且存在备用 poster，平滑降级尝试备用海报
    if (!triedFallback && poster && displayUrl !== poster) {
      setTriedFallback(true);
      setDisplayUrl(poster);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="relative w-14 h-10 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden shrink-0">
      {displayUrl && !hasError ? (
        <img
          src={displayUrl}
          alt={title || ''}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <Film className="w-5 h-5 text-on-surface-variant" />
      )}
      <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-white uppercase">
        {format || 'MP4'}
      </span>
    </div>
  );
};

export const MediaVaultModal: React.FC<MediaVaultModalProps> = ({
  isOpen,
  onClose,
  onSelectSession,
  currentVaultId,
  extensionId,
}) => {
  const { t } = useTranslate();
  const [items, setItems] = useState<VaultVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchingId, setIsSwitchingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchVaultVideos = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (extensionId) {
        defaultExtensionBridge.setExtensionId(extensionId);
      }
      const videos = await defaultExtensionBridge.listVaultVideos();
      setItems(videos);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'PRO_REQUIRED') {
        setErrorMessage(t.clip.permissionDeniedToast);
      } else if (msg.includes('EXTENSION_DISCONNECTED') || msg.includes('Could not establish connection')) {
        setErrorMessage(t.clip.vaultNoExtension);
      } else {
        setErrorMessage(msg || t.clip.vaultNoExtension);
      }
    } finally {
      setIsLoading(false);
    }
  }, [extensionId, t.clip.vaultNoExtension]);

  useEffect(() => {
    if (isOpen) {
      defaultServiceWorkerBridge.init().catch(() => {});
      fetchVaultVideos();
      setSearchQuery('');
    }
  }, [isOpen, fetchVaultVideos]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleSelectVideo = async (item: VaultVideoItem) => {
    if (isSwitchingId) return;
    setIsSwitchingId(item.id);

    try {
      const res = await defaultExtensionBridge.createSessionFromVault(item.id);
      if (res.sessionId) {
        onSelectSession(res.sessionId);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg === 'PRO_REQUIRED' ? t.clip.permissionDeniedToast : msg);
    } finally {
      setIsSwitchingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-inverse-surface/55 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">
                {t.clip.vaultModalTitle}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t.clip.vaultModalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/25 transition-colors cursor-pointer"
            title={t.clip.vaultClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-outline-variant/20 bg-surface-container-lowest">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.clip.vaultSearchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={fetchVaultVideos}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface border border-outline-variant/25 transition-colors disabled:opacity-50 cursor-pointer"
            title={t.clip.vaultRefresh}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t.clip.vaultRefresh}</span>
          </button>

          <span className="text-[11px] font-code-label text-on-surface-variant px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/20 whitespace-nowrap">
            {t('clip.vaultVideoCount', { count: filteredItems.length })}
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[280px] custom-scrollbar">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/60 text-primary flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs text-on-surface-variant">{t.clip.vaultLoading}</p>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300/70 text-amber-700 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-sm font-semibold text-on-surface">{errorMessage}</h4>
              </div>
              <button
                type="button"
                onClick={fetchVaultVideos}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>{t.clip.vaultRefresh}</span>
              </button>
            </div>
          )}

          {!isLoading && !errorMessage && filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <Film className="w-6 h-6" />
              </div>
              <p className="text-xs text-on-surface-variant">{t.clip.vaultNoVideos}</p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredItems.map((item) => {
                const isCurrent = currentVaultId && (currentVaultId === item.id || currentVaultId.includes(item.id));
                const isProcessingThis = isSwitchingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`group flex items-center justify-between gap-4 p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-primary-fixed/25 border-primary/35'
                        : 'bg-surface-container-low/50 hover:bg-surface-container-low border-outline-variant/20 hover:border-primary/35'
                    }`}
                  >
                    {/* Video Info Left */}
                    <div className="flex items-center gap-3 min-w-0">
                      <VaultPoster
                        id={item.id}
                        poster={item.poster}
                        title={item.title}
                        format={item.format}
                      />

                      <div className="min-w-0 space-y-0.5">
                        <h4
                          className="text-xs font-semibold text-on-surface truncate max-w-sm sm:max-w-md"
                          title={item.title}
                        >
                          {item.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-code-label text-on-surface-variant">
                          {item.duration && item.duration > 0 ? (
                            <span>{formatTimecode(item.duration, false)}</span>
                          ) : null}
                          {(Boolean(item.mergedSize) || item.size > 0) && (
                            <span>{item.sizeFormatted || formatBytes(item.mergedSize || item.size)}</span>
                          )}
                          {item.resolution && <span>{item.resolution}</span>}
                          {item.createdAt && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-on-surface-variant/75">
                              <Calendar className="w-2.5 h-2.5" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Right */}
                    <div className="shrink-0">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-medium">
                          <Check className="w-3.5 h-3.5 text-primary" />
                          <span>{t.clip.vaultCurrentVideo}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectVideo(item)}
                          disabled={Boolean(isSwitchingId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-xs font-medium text-on-surface border border-outline-variant/30 hover:border-primary shadow-sm transition-colors disabled:opacity-50 cursor-pointer group/btn"
                        >
                          {isProcessingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary group-hover/btn:text-on-primary" />
                          ) : (
                            <HardDrive className="w-3.5 h-3.5 text-primary group-hover/btn:text-on-primary" />
                          )}
                          <span>{t.clip.vaultSwitchVideo}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-outline-variant/20 bg-surface-container-low/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-xs font-medium text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
          >
            {t.clip.vaultClose}
          </button>
        </div>
      </div>
    </div>
  );
};

