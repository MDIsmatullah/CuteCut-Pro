cask "cutecut-pro" do
  version "2.5.0"
  sha256 :bdd0efda0b84ae4ca41857801ce7652c2e7ac7471aac2a9e94b61d95e8b36572

  url "https://github.com/MDIsmatullah/CuteCut-Pro/releases/download/v#{version}/CuteCut.Pro-#{version}-arm64.dmg"
  name "CuteCut Pro"
  desc "Professional multitrack video editor with Quranic audio-to-text synchronization"
  homepage "https://github.com/MDIsmatullah/CuteCut-Pro"

depends_on arch: :arm64
  
  livecheck do
    url :url
    strategy :github_latest
  end

  app "CuteCut Pro.app"

  zap trash: [
    "~/Library/Application Support/CuteCut Pro",
    "~/Library/Preferences/org.guldasta.cutecutpro.plist",
    "~/Library/Saved Application State/org.guldasta.cutecutpro.savedState",
  ]
end
