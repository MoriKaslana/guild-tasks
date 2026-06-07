import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ImageIcon, X, Send, Swords } from "lucide-react";
import { Quest } from "@/types/game";

interface SubmitQuestModalProps {
  quest: Quest;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File | null) => Promise<void>;
}

const SubmitQuestModal = ({ quest, isOpen, onClose, onSubmit }: SubmitQuestModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDuelActive = quest.isDuel && quest.duelStatus === "accepted";

  const handleFile = (selected: File) => {
    // Validate: only images and PDFs, max 10MB
    const isImage = selected.type.startsWith("image/");
    const isPdf = selected.type === "application/pdf";
    if (!isImage && !isPdf) return;
    if (selected.size > 10 * 1024 * 1024) return; // 10MB limit

    setFile(selected);
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(file);
    setIsSubmitting(false);
    setFile(null);
    setPreview(null);
    onClose();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    clearFile();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-gold flex items-center gap-2">
            {isDuelActive ? (
              <><Swords className="h-5 w-5 text-crimson" /> Finish the Duel!</>
            ) : (
              <><Send className="h-5 w-5" /> Kumpulkan Tugas</>
            )}
          </DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            <span className="text-foreground font-semibold">"{quest.title}"</span>
            <br />
            Lampirkan foto atau PDF sebagai bukti penyelesaian tugas (opsional).
          </DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`relative rounded-lg border-2 border-dashed transition-all cursor-pointer min-h-[160px] flex items-center justify-center
            ${isDragging
              ? "border-gold bg-gold/10 scale-[1.01]"
              : file
              ? "border-emerald/40 bg-emerald/5 cursor-default"
              : "border-border hover:border-gold/50 hover:bg-gold/5"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleInputChange}
          />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full p-4"
              >
                {/* Image Preview */}
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-md object-contain border border-white/10"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      className="absolute -top-2 -right-2 bg-crimson text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  /* PDF Preview */
                  <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3 border border-border">
                    <div className="bg-crimson/10 p-2 rounded-md border border-crimson/20">
                      <FileText className="h-6 w-6 text-crimson" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {(file.size / 1024).toFixed(1)} KB · PDF
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      className="text-muted-foreground hover:text-crimson transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="upload-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 p-6 text-center pointer-events-none"
              >
                <div className="flex gap-2 text-muted-foreground/40">
                  <ImageIcon className="h-8 w-8" />
                  <FileText className="h-8 w-8" />
                </div>
                <p className="text-sm font-heading text-muted-foreground">
                  {isDragging ? "Lepaskan file di sini..." : "Drag & drop atau klik untuk upload"}
                </p>
                <p className="text-xs text-muted-foreground/60 font-body">
                  Gambar (JPG, PNG, WEBP) atau PDF · Maks. 10 MB
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* File size warning */}
        <p className="text-[10px] text-muted-foreground/50 font-body text-center -mt-1">
          Upload bukti bersifat opsional — kamu tetap bisa kumpulkan tanpa lampiran.
        </p>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="font-heading border-border"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`font-heading ${
              isDuelActive
                ? "bg-crimson hover:bg-red-700 border border-white/10"
                : ""
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Mengirim...
              </span>
            ) : isDuelActive ? (
              <span className="flex items-center gap-2">
                <Swords className="h-4 w-4" /> Selesaikan Duel!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" /> Kumpulkan Tugas
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitQuestModal;
