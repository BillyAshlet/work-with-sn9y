import UploadPage from "@/app/components/UploadPage";

export default function WritingUpload() {
  return (
    <UploadPage
      category="writing"
      categoryLabel="Writing"
      categoryLabelCn="写作"
      accentColor="#1a5c5c"
      backHref="/works/writing"
    />
  );
}
