'use client';

import * as React from 'react';
import { useI18n } from '@/contexts/i18n-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Server, Plus, Pencil, Trash2 } from 'lucide-react';

export type ServerType = 'qbittorrent' | 'transmission';

export interface ServerConfig {
  id: string;
  name: string;
  type: ServerType;
  host: string;
  port: number;
  username: string;
  password: string;
}

interface ServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server?: ServerConfig | null;
  onSave: (server: ServerConfig) => void;
  onDelete?: (serverId: string) => void;
}

export function ServerDialog({ open, onOpenChange, server, onSave, onDelete }: ServerDialogProps) {
  const { t } = useI18n();
  const isEditing = !!server;

  const [formData, setFormData] = React.useState<ServerConfig>({
    id: '',
    name: '',
    type: 'qbittorrent',
    host: '',
    port: 8080,
    username: '',
    password: '',
  });

  React.useEffect(() => {
    if (server) {
      setFormData(server);
    } else {
      setFormData({
        id: `server-${Date.now()}`,
        name: '',
        type: 'qbittorrent',
        host: '',
        port: 8080,
        username: '',
        password: '',
      });
    }
  }, [server, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (server && onDelete) {
      onDelete(server.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            {isEditing ? t('serverDialog.editServer') : t('serverDialog.addServer')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Server Type */}
          <div className="space-y-2">
            <Label htmlFor="type">{t('serverDialog.type')}</Label>
            <Select
              value={formData.type}
              onValueChange={(value: ServerType) => 
                setFormData(prev => ({ ...prev, type: value, port: value === 'qbittorrent' ? 8080 : 9091 }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qbittorrent">qBittorrent</SelectItem>
                <SelectItem value="transmission">Transmission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Server Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('serverDialog.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('serverDialog.namePlaceholder')}
              required
            />
          </div>

          {/* Host and Port */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="host">{t('serverDialog.host')}</Label>
              <Input
                id="host"
                value={formData.host}
                onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                placeholder="192.168.1.100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">{t('serverDialog.port')}</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 8080 }))}
                placeholder="8080"
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">{t('serverDialog.username')}</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder={t('serverDialog.usernamePlaceholder')}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('serverDialog.password')}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder={t('serverDialog.passwordPlaceholder')}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('serverDialog.delete')}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('serverDialog.cancel')}
            </Button>
            <Button type="submit">
              {isEditing ? t('serverDialog.save') : t('serverDialog.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
