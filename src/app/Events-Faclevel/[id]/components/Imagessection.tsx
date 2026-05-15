import React from "react";
import { Eye, Image as ImageIcon, Trash2, UploadCloud } from "lucide-react";
import styles from "../styles/EventDetails.module.css";
import { ApiEventImage } from "../page";

type Props = {
  images: ApiEventImage[];
  loadingImages: boolean;
  uploading: boolean;
  deletingDocId: number | null;
  isFacultyEvent: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (files: FileList | null) => void;
  onDelete: (docId: number) => void;
};

export default function ImagesSection({
  images, loadingImages, uploading,
  deletingDocId, isFacultyEvent,
  fileRef, onUpload, onDelete,
}: Props) {
  return (
    <section className={styles.imagesBlock}>
      <div className={styles.imagesHead}>
        <div className={styles.imagesTitle}>
          <ImageIcon size={18} />
          صور الفعالية
        </div>

        {isFacultyEvent && (
          <div className={styles.imagesActions}>
            <input
              ref={fileRef}
              className={styles.fileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onUpload(e.target.files)}
              disabled={uploading}
            />
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              title="إضافة صورة"
            >
              <UploadCloud size={18} />
              {uploading ? "جاري الرفع..." : "إضافة صورة"}
            </button>
          </div>
        )}
      </div>

      {loadingImages ? (
        <div style={{ fontWeight: 800, opacity: 0.8 }}>جاري تحميل الصور...</div>
      ) : images.length === 0 ? (
        <div className={styles.emptyImages}>لا توجد صور مضافة حتى الآن</div>
      ) : (
        <div className={styles.imagesGrid}>
          {images.map((img) => (
            <div key={img.doc_id} className={styles.imageCard}>
              <div className={styles.imagePreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.file_url} alt={img.file_name} />
              </div>

              <div className={styles.imageMeta}>
                <div className={styles.imageName} title={img.file_name}>
                  {img.file_name}
                </div>
              </div>

              <div className={styles.imageBtns}>
                <a className={styles.viewLink} href={img.file_url} target="_blank" rel="noreferrer">
                  <Eye size={16} />
                  عرض الصورة
                </a>
                {isFacultyEvent && (
                  <button
                    type="button"
                    className={styles.deleteImgBtn}
                    onClick={() => onDelete(img.doc_id)}
                    disabled={deletingDocId === img.doc_id}
                    title="مسح"
                  >
                    <Trash2 size={16} />
                    {deletingDocId === img.doc_id ? "..." : "مسح الصورة"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}