'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Link2,
  Upload,
  FolderOpen,
  FileText,
  Tag,
  FolderTree,
  X,
  Plus,
} from 'lucide-react';
import { mockCategories, mockTags } from '@/lib/mock-data';

interface AddTorrentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTorrentDialog({ open, onOpenChange }: AddTorrentDialogProps) {
  const { t } = useI18n();
  
  // Form state
  const [magnetLink, setMagnetLink] = useState('');
  const [torrentFile, setTorrentFile] = useState<File | null>(null);
  const [savePath, setSavePath] = useState('/downloads');
  const [category, setCategory] = useState('none');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startImmediately, setStartImmediately] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTorrentFile(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // Reset form and close
    setMagnetLink('');
    setTorrentFile(null);
    setSavePath('/downloads');
    setCategory('none');
    setSelectedTags([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setMagnetLink('');
    setTorrentFile(null);
    setSavePath('/downloads');
    setCategory('none');
    setSelectedTags([]);
    onOpenChange(false);
  };

  const isSubmitDisabled = !magnetLink && !torrentFile;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('addTorrent.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tabs for Link / File */}
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link" className="gap-1.5">
                <Link2 className="w-4 h-4" />
                {t('addTorrent.magnetLink')}
              </TabsTrigger>
              <TabsTrigger value="file" className="gap-1.5">
                <Upload className="w-4 h-4" />
                {t('addTorrent.torrentFile')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="magnet">{t('addTorrent.magnetLabel')}</Label>
                <Textarea
                  id="magnet"
                  placeholder={t('addTorrent.magnetPlaceholder')}
                  value={magnetLink}
                  onChange={(e) => setMagnetLink(e.target.value)}
                  className="min-h-[80px] font-mono text-xs"
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="mt-4">
              <div className="space-y-2">
                <Label>{t('addTorrent.fileLabel')}</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".torrent"
                    onChange={handleFileChange}
                    className="hidden"
                    id="torrent-file"
                  />
                  <label
                    htmlFor="torrent-file"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {t('addTorrent.fileDropzone')}
                    </span>
                  </label>
                </div>
                {torrentFile && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">{torrentFile.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setTorrentFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Save Path */}
          <div className="space-y-2">
            <Label htmlFor="path">{t('addTorrent.savePath')}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="path"
                  value={savePath}
                  onChange={(e) => setSavePath(e.target.value)}
                  className="pl-9 font-mono text-sm"
                />
              </div>
              <Button variant="outline" size="icon">
                <FolderTree className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">{t('addTorrent.category')}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder={t('addTorrent.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('addTorrent.noCategory')}</SelectItem>
                {mockCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {t('addTorrent.tags')}
            </Label>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedTags.map((tagId) => {
                  const tag = mockTags.find(t => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <Badge
                      key={tagId}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {tag.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tagId)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Available Tags */}
            <div className="flex flex-wrap gap-1.5">
              {mockTags
                .filter(tag => !selectedTags.includes(tag.id))
                .map((tag) => (
                  <Button
                    key={tag.id}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleAddTag(tag.id)}
                  >
                    <Plus className="w-3 h-3" />
                    {tag.name}
                  </Button>
                ))}
            </div>
          </div>

          <Separator />

          {/* Options */}
          <div className="flex items-center justify-between">
            <Label htmlFor="start" className="text-sm">
              {t('addTorrent.startImmediately')}
            </Label>
            <Button
              id="start"
              variant={startImmediately ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStartImmediately(!startImmediately)}
            >
              {startImmediately ? t('addTorrent.yes') : t('addTorrent.no')}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('addTorrent.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled || isLoading}>
            {isLoading ? t('addTorrent.adding') : t('addTorrent.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
