import UploadPage from "@/app/components/UploadPage";

export default function EngineeringUpload() {
  return (
    <UploadPage
      category="engineering"
      categoryLabel="Engineering"
      categoryLabelCn="工程"
      accentColor="#1a2a6c"
      backHref="/works/engineering"
    />
  );
}
