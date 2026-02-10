import UploadPage from "@/app/components/UploadPage";

export default function MusicUpload() {
  return (
    <UploadPage
      category="music"
      categoryLabel="Music"
      categoryLabelCn="音乐"
      accentColor="#8b1a1a"
      backHref="/works/music"
    />
  );
}
